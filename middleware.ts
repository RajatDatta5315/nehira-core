import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || '';
  const url = request.nextUrl;

  // 1. Q-SEED ROUTING
  // Agar URL mein 'qseed' hai, toh background mein '/qseed' folder dikhao
  if (hostname.includes('qseed')) {
    if (url.pathname === '/') {
       url.pathname = '/qseed';
       return NextResponse.rewrite(url);
    }
  }

  // 2. STUDIO ROUTING
  // Agar URL mein 'studio' hai, toh '/studio' folder dikhao
  if (hostname.includes('studio')) {
    if (url.pathname === '/') {
       url.pathname = '/studio';
       return NextResponse.rewrite(url);
    }
  }

  return NextResponse.next();
}
