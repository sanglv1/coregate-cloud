import { NextRequest, NextResponse } from 'next/server';
import { buildApiUrl } from '@/lib/config';

export async function GET(request: NextRequest) {
  try {
    const upstream = buildApiUrl(`/api/analytics?${request.nextUrl.searchParams.toString()}`);
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
