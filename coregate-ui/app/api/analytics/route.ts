import { NextRequest, NextResponse } from 'next/server';
import { getServerApiBaseUrl } from '@/lib/config';

export async function GET(request: NextRequest) {
  try {
    const query = request.nextUrl.searchParams.toString();
    const upstream = `${getServerApiBaseUrl()}/api/analytics${query ? `?${query}` : ''}`;
    const response = await fetch(upstream, { method: 'GET', headers: { 'Content-Type': 'application/json' } });
    const body = await response.json();
    return NextResponse.json(body, { status: response.status });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to proxy analytics' },
      { status: 500 }
    );
  }
}
