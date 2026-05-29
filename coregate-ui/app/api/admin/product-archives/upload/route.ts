import { NextRequest, NextResponse } from 'next/server';
import { getServerApiBaseUrl } from '@/lib/config';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const response = await fetch(`${getServerApiBaseUrl()}/api/admin/product-archives/upload`, {
      method: 'POST',
      headers: {
        'X-Admin-Username': request.headers.get('x-admin-username') ?? '',
        'X-Admin-Password': request.headers.get('x-admin-password') ?? '',
      },
      body: formData,
    });
    const body = await response.json().catch(() => ({}));
    return NextResponse.json(body, { status: response.status });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to proxy upload' },
      { status: 500 },
    );
  }
}
