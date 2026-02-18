import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

interface CSVRow {
  flatNumber: string;
  block?: string;
  floor?: string;
  ownerName: string;
  ownerEmail: string;
  ownerPhone: string;
}

interface ImportResult {
  success: boolean;
  flatNumber: string;
  message: string;
  userId?: string;
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const text = await file.text();
    const rows = parseCSV(text);

    if (rows.length === 0) {
      return NextResponse.json({ error: 'No valid data in CSV' }, { status: 400 });
    }

    const results: ImportResult[] = [];
    const passwordResetTokens: { email: string; token: string; name: string }[] = [];

    for (const row of rows) {
      try {
        const result = await processRow(row);
        results.push(result);

        if (result.success && result.userId) {
          // Generate password reset token
          const token = crypto.randomBytes(32).toString('hex');
          await prisma.passwordResetToken.create({
            data: {
              token,
              userId: result.userId,
              expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
            },
          });
          passwordResetTokens.push({
            email: row.ownerEmail,
            token,
            name: row.ownerName,
          });
        }
      } catch (error) {
        results.push({
          success: false,
          flatNumber: row.flatNumber,
          message: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    // Log the import
    const successCount = results.filter(r => r.success).length;
    const failureCount = results.filter(r => !r.success).length;

    await prisma.bulkImportLog.create({
      data: {
        fileName: file.name,
        totalRows: rows.length,
        successCount,
        failureCount,
        errors: JSON.stringify(results.filter(r => !r.success)),
        importedById: session.user.id,
      },
    });

    return NextResponse.json({
      success: true,
      totalProcessed: rows.length,
      successCount,
      failureCount,
      results,
      passwordResetTokens, // These will be used to send emails
    });
  } catch (error) {
    console.error('Bulk import error:', error);
    return NextResponse.json(
      { error: 'Failed to process import' },
      { status: 500 }
    );
  }
}

function parseCSV(text: string): CSVRow[] {
  const lines = text.split('\n').map(line => line.trim()).filter(line => line);

  if (lines.length < 2) {
    return [];
  }

  const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
  const rows: CSVRow[] = [];

  // Map common header variations
  const headerMap: Record<string, string> = {
    'flat': 'flatnumber',
    'flat_number': 'flatnumber',
    'flatno': 'flatnumber',
    'flat no': 'flatnumber',
    'unit': 'flatnumber',
    'owner': 'ownername',
    'owner_name': 'ownername',
    'name': 'ownername',
    'resident': 'ownername',
    'email': 'owneremail',
    'owner_email': 'owneremail',
    'mail': 'owneremail',
    'phone': 'ownerphone',
    'owner_phone': 'ownerphone',
    'mobile': 'ownerphone',
    'contact': 'ownerphone',
    'tower': 'block',
    'wing': 'block',
    'building': 'block',
  };

  const normalizedHeaders = headers.map(h => {
    const normalized = h.replace(/[^a-z0-9]/g, '');
    return headerMap[h] || headerMap[normalized] || normalized;
  });

  const flatIdx = normalizedHeaders.indexOf('flatnumber');
  const nameIdx = normalizedHeaders.indexOf('ownername');
  const emailIdx = normalizedHeaders.indexOf('owneremail');
  const phoneIdx = normalizedHeaders.indexOf('ownerphone');
  const blockIdx = normalizedHeaders.indexOf('block');
  const floorIdx = normalizedHeaders.indexOf('floor');

  if (flatIdx === -1 || nameIdx === -1 || emailIdx === -1 || phoneIdx === -1) {
    throw new Error('CSV must have columns: flatNumber/flat, ownerName/name, ownerEmail/email, ownerPhone/phone');
  }

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);

    if (values.length <= Math.max(flatIdx, nameIdx, emailIdx, phoneIdx)) {
      continue;
    }

    const flatNumber = values[flatIdx]?.trim();
    const ownerName = values[nameIdx]?.trim();
    const ownerEmail = values[emailIdx]?.trim().toLowerCase();
    const ownerPhone = values[phoneIdx]?.trim();

    if (!flatNumber || !ownerName || !ownerEmail || !ownerPhone) {
      continue;
    }

    // Validate email format
    if (!isValidEmail(ownerEmail)) {
      continue;
    }

    rows.push({
      flatNumber,
      ownerName,
      ownerEmail,
      ownerPhone,
      block: blockIdx !== -1 ? values[blockIdx]?.trim() : undefined,
      floor: floorIdx !== -1 ? values[floorIdx]?.trim() : undefined,
    });
  }

  return rows;
}

function parseCSVLine(line: string): string[] {
  const values: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      values.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  values.push(current);

  return values;
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

async function processRow(row: CSVRow): Promise<ImportResult> {
  // Check if email already exists as a user
  const existingUser = await prisma.user.findUnique({
    where: { email: row.ownerEmail },
  });

  if (existingUser) {
    return {
      success: false,
      flatNumber: row.flatNumber,
      message: `User with email ${row.ownerEmail} already exists`,
    };
  }

  // Find or create flat
  let flat = await prisma.flat.findFirst({
    where: { flatNumber: row.flatNumber },
  });

  if (!flat) {
    flat = await prisma.flat.create({
      data: {
        flatNumber: row.flatNumber,
        block: row.block,
        floor: row.floor ? parseInt(row.floor, 10) : null,
        ownerName: row.ownerName,
        ownerEmail: row.ownerEmail,
        ownerPhone: row.ownerPhone,
        isOccupied: true,
      },
    });
  } else {
    // Update flat with owner details
    flat = await prisma.flat.update({
      where: { id: flat.id },
      data: {
        ownerName: row.ownerName,
        ownerEmail: row.ownerEmail,
        ownerPhone: row.ownerPhone,
        isOccupied: true,
      },
    });
  }

  // Create user with temporary password
  const tempPassword = crypto.randomBytes(16).toString('hex');
  const hashedPassword = await bcrypt.hash(tempPassword, 10);

  const user = await prisma.user.create({
    data: {
      email: row.ownerEmail,
      password: hashedPassword,
      name: row.ownerName,
      phone: row.ownerPhone,
      role: 'RESIDENT',
      flatId: flat.id,
      mustSetPassword: true,
    },
  });

  return {
    success: true,
    flatNumber: row.flatNumber,
    message: 'User created successfully',
    userId: user.id,
  };
}
