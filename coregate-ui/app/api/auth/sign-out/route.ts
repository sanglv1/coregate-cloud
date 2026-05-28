import { NextResponse } from 'next/server';
import { buildApiUrl } from '@/lib/config';

export async function POST() {
  try {
    const response = await fetch(buildApiUrl('/api/auth/sign-out'), { method: 'POST' });
    return new NextResponse(null, { status: response.status });
  } catch {
    return new NextResponse(null, { status: 204 });
  }
}
