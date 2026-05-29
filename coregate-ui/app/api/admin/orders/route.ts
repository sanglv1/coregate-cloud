import { NextRequest, NextResponse } from 'next/server';
import { getServerApiBaseUrl } from '@/lib/config';

export async function GET(request: NextRequest) {
  try {
    const response = await fetch(`${getServerApiBaseUrl()}/api/admin/orders`, {
      method: 'GET',
      headers: {
        'X-Admin-Username': request.headers.get('x-admin-username') ?? '',
        'X-Admin-Password': request.headers.get('x-admin-password') ?? '',
      },
    });
    const body = await response.json().catch(() => ({}));
    return NextResponse.json(body, { status: response.status });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to proxy orders list' },
      { status: 500 },
    );
  }
}
