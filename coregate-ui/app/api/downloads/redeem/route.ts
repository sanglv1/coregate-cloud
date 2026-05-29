import { NextRequest, NextResponse } from 'next/server';
import { getServerApiBaseUrl } from '@/lib/config';

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    const response = await fetch(`${getServerApiBaseUrl()}/api/downloads/redeem`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const body = await response.json();
    return NextResponse.json(body, { status: response.status });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to redeem download code' },
      { status: 500 },
    );
  }
}
