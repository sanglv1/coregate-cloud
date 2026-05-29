import { NextResponse } from 'next/server';
import { getServerApiBaseUrl } from '@/lib/config';

export async function POST() {
  try {
    const response = await fetch(`${getServerApiBaseUrl()}/api/auth/sign-out`, { method: 'POST' });
    return new NextResponse(null, { status: response.status });
  } catch {
    return new NextResponse(null, { status: 204 });
  }
}
