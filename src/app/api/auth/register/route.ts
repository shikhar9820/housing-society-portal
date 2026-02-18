import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { hashPassword } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, email, phone, flatNumber, password } = body

    if (!name || !email || !password || !flatNumber) {
      return NextResponse.json(
        { error: 'Name, email, flat number, and password are required' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      )
    }

    // Find or create flat
    let flat = await prisma.flat.findUnique({
      where: { flatNumber: flatNumber.toUpperCase() },
    })

    if (!flat) {
      flat = await prisma.flat.create({
        data: {
          flatNumber: flatNumber.toUpperCase(),
          ownerName: name,
          ownerPhone: phone,
          ownerEmail: email.toLowerCase(),
        },
      })
    }

    // Hash password
    const hashedPassword = await hashPassword(password)

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        phone,
        password: hashedPassword,
        flatId: flat.id,
        role: 'RESIDENT',
      },
    })

    return NextResponse.json({
      message: 'User registered successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    })
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Failed to register user' },
      { status: 500 }
    )
  }
}
