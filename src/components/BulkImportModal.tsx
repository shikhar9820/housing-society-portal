'use client';

import { useState, useRef } from 'react';

interface ImportResult {
  success: boolean;
  flatNumber: string;
  message: string;
}

interface BulkImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function BulkImportModal({ isOpen, onClose, onSuccess }: BulkImportModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<ImportResult[] | null>(null);
  const [error, setError] = useState('');
  const [successCount, setSuccessCount] = useState(0);
  const [failureCount, setFailureCount] = useState(0);
  const [showInviteLinks, setShowInviteLinks] = useState(false);
  const [inviteLinks, setInviteLinks] = useState<{ email: string; name: string; link: string }[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (!selectedFile.name.endsWith('.csv')) {
        setError('Please upload a CSV file');
        return;
      }
      setFile(selectedFile);
      setError('');
      setResults(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file');
      return;
    }

    setLoading(true);
    setError('');
    setResults(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/admin/bulk-import', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        setResults(data.results);
        setSuccessCount(data.successCount);
        setFailureCount(data.failureCount);

        // Generate invite links
        if (data.passwordResetTokens && data.passwordResetTokens.length > 0) {
          const baseUrl = window.location.origin;
          const links = data.passwordResetTokens.map((t: { email: string; token: string; name: string }) => ({
            email: t.email,
            name: t.name,
            link: `${baseUrl}/set-password?token=${t.token}`,
          }));
          setInviteLinks(links);
        }

        if (data.successCount > 0) {
          onSuccess();
        }
      } else {
        setError(data.error || 'Failed to import');
      }
    } catch {
      setError('Failed to upload file');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setResults(null);
    setError('');
    setInviteLinks([]);
    setShowInviteLinks(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onClose();
  };

  const copyAllLinks = () => {
    const text = inviteLinks.map(l => `${l.name} (${l.email}): ${l.link}`).join('\n\n');
    navigator.clipboard.writeText(text);
  };

  const downloadCSVTemplate = () => {
    const template = 'flatNumber,ownerName,ownerEmail,ownerPhone,block,floor\n101,John Doe,john@example.com,9876543210,A,1\n102,Jane Smith,jane@example.com,9876543211,A,1';
    const blob = new Blob([template], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'flat_import_template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Bulk Import Flats & Residents</h2>
            <button onClick={handleClose} className="text-gray-400 hover:text-gray-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {!results ? (
            <>
              <div className="mb-6">
                <h3 className="font-medium mb-2">How it works:</h3>
                <ol className="list-decimal list-inside text-sm text-gray-600 space-y-1">
                  <li>Upload a CSV file with flat and owner details</li>
                  <li>System creates flats and user accounts automatically</li>
                  <li>Get invite links to share with residents</li>
                  <li>Residents click the link to set their password and login</li>
                </ol>
              </div>

              <div className="mb-6">
                <button
                  onClick={downloadCSVTemplate}
                  className="text-blue-600 hover:text-blue-700 text-sm flex items-center gap-1"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download CSV Template
                </button>
              </div>

              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                  className="hidden"
                  id="csv-upload"
                />
                <label
                  htmlFor="csv-upload"
                  className="cursor-pointer flex flex-col items-center"
                >
                  <svg className="w-12 h-12 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <span className="text-gray-600">Click to upload CSV file</span>
                  <span className="text-sm text-gray-400 mt-1">or drag and drop</span>
                </label>
              </div>

              {file && (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-sm">{file.name}</span>
                  </div>
                  <button
                    onClick={() => {
                      setFile(null);
                      if (fileInputRef.current) fileInputRef.current.value = '';
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              )}

              {error && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="font-medium text-yellow-800 mb-2">Required CSV Columns:</h4>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li><strong>flatNumber</strong> (or flat, unit) - Flat number/unit</li>
                  <li><strong>ownerName</strong> (or name, owner) - Owner&apos;s full name</li>
                  <li><strong>ownerEmail</strong> (or email) - Owner&apos;s email address</li>
                  <li><strong>ownerPhone</strong> (or phone, mobile) - Owner&apos;s phone number</li>
                  <li><strong>block</strong> (optional) - Block/Wing/Tower</li>
                  <li><strong>floor</strong> (optional) - Floor number</li>
                </ul>
              </div>
            </>
          ) : (
            <>
              <div className="mb-6">
                <div className="flex gap-4 mb-4">
                  <div className="flex-1 bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-green-700">{successCount}</div>
                    <div className="text-sm text-green-600">Successful</div>
                  </div>
                  <div className="flex-1 bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-red-700">{failureCount}</div>
                    <div className="text-sm text-red-600">Failed</div>
                  </div>
                </div>

                {inviteLinks.length > 0 && (
                  <div className="mb-4">
                    <button
                      onClick={() => setShowInviteLinks(!showInviteLinks)}
                      className="w-full flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-700 hover:bg-blue-100"
                    >
                      <span className="font-medium">
                        {showInviteLinks ? 'Hide' : 'Show'} Invite Links ({inviteLinks.length})
                      </span>
                      <svg
                        className={`w-5 h-5 transform transition-transform ${showInviteLinks ? 'rotate-180' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {showInviteLinks && (
                      <div className="mt-2 border rounded-lg overflow-hidden">
                        <div className="p-2 bg-gray-50 border-b flex justify-end">
                          <button
                            onClick={copyAllLinks}
                            className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                            </svg>
                            Copy All Links
                          </button>
                        </div>
                        <div className="max-h-48 overflow-y-auto">
                          {inviteLinks.map((link, idx) => (
                            <div key={idx} className="p-3 border-b last:border-b-0 text-sm">
                              <div className="font-medium">{link.name}</div>
                              <div className="text-gray-500">{link.email}</div>
                              <div className="mt-1 flex items-center gap-2">
                                <input
                                  type="text"
                                  readOnly
                                  value={link.link}
                                  className="flex-1 text-xs p-1 bg-gray-50 border rounded truncate"
                                />
                                <button
                                  onClick={() => navigator.clipboard.writeText(link.link)}
                                  className="text-blue-600 hover:text-blue-700"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                                  </svg>
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {failureCount > 0 && (
                  <div className="border rounded-lg overflow-hidden">
                    <div className="p-2 bg-red-50 border-b font-medium text-red-700">Failed Imports</div>
                    <div className="max-h-48 overflow-y-auto">
                      {results.filter(r => !r.success).map((result, idx) => (
                        <div key={idx} className="p-3 border-b last:border-b-0 text-sm">
                          <div className="font-medium">Flat {result.flatNumber}</div>
                          <div className="text-red-600">{result.message}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-800 mb-2">Next Steps:</h4>
                <ol className="list-decimal list-inside text-sm text-blue-700 space-y-1">
                  <li>Copy the invite links above</li>
                  <li>Share each link with the respective resident (via WhatsApp/Email)</li>
                  <li>Residents click the link to set their password</li>
                  <li>After setting password, they can login to the portal</li>
                </ol>
              </div>
            </>
          )}
        </div>

        <div className="p-6 border-t bg-gray-50 flex justify-end gap-3">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            {results ? 'Close' : 'Cancel'}
          </button>
          {!results && (
            <button
              onClick={handleUpload}
              disabled={!file || loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Importing...
                </>
              ) : (
                'Import'
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
