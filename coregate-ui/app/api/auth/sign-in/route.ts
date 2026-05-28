import { NextRequest, NextResponse } from 'next/server';
import { buildApiUrl } from '@/lib/config';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const response = await fetch(buildApiUrl('/api/auth/sign-in'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      return new NextResponse(null, { status: response.status });
    }

    const payload = await response.json();
    return NextResponse.json(payload, { status: 200 });
  } catch {
    return new NextResponse(null, { status: 500 });
  }
}
