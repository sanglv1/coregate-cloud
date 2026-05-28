import { NextRequest, NextResponse } from 'next/server';
import { buildApiUrl } from '@/lib/config';

export async function GET(request: NextRequest) {
  try {
    const response = await fetch(buildApiUrl(`/api/downloads?${request.nextUrl.searchParams.toString()}`));
    const body = await response.json();
    return NextResponse.json(body, { status: response.status });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to proxy downloads' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    const response = await fetch(buildApiUrl('/api/downloads'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const body = await response.json();
    return NextResponse.json(body, { status: response.status });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to proxy download request' },
      { status: 500 }
    );
  }
}
