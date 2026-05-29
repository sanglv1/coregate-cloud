import { NextRequest, NextResponse } from 'next/server';
import { getServerApiBaseUrl } from '@/lib/config';

export async function GET(request: NextRequest) {
  try {
    const query = request.nextUrl.searchParams.toString();
    const url = `${getServerApiBaseUrl()}/api/downloads/access-code${query ? `?${query}` : ''}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    const body = await response.json();
    return NextResponse.json(body, { status: response.status });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to load access code' },
      { status: 500 },
    );
  }
}
