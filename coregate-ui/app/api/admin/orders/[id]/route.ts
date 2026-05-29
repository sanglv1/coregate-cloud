import { NextRequest, NextResponse } from 'next/server';
import { getServerApiBaseUrl } from '@/lib/config';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const response = await fetch(`${getServerApiBaseUrl()}/api/admin/orders/${encodeURIComponent(id)}`, {
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
      { error: error instanceof Error ? error.message : 'Failed to proxy order detail' },
      { status: 500 },
    );
  }
}
