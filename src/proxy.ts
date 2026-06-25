import { NextRequest, NextResponse } from 'next/server';

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const RATE_LIMIT_WINDOW_MS = 60 * 1000;  // 1 minute window
const MAX_REQUESTS = 60;                  // 60 requests per window
const CLEANUP_INTERVAL = 5 * 60 * 1000;  // Clean stale entries every 5 min

const ALLOWED_ORIGINS = [
  'https://anidemo.na-ive.dev',
  'https://na-ive.dev',
  'http://localhost:3000',
  'http://localhost:3001',
];

const LOCALHOST_IPS = new Set(['127.0.0.1', '::1', '::ffff:127.0.0.1']);

// ---------------------------------------------------------------------------
// In-memory rate limit store (works for self-hosted / single-instance deploy)
// ---------------------------------------------------------------------------

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();
let lastCleanup = Date.now();

function cleanupStaleEntries() {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;
  lastCleanup = now;
  for (const [ip, entry] of rateLimitStore) {
    if (now >= entry.resetAt) {
      rateLimitStore.delete(ip);
    }
  }
}

function checkRateLimit(ip: string): { allowed: boolean; remaining: number; resetAt: number } {
  cleanupStaleEntries();

  const now = Date.now();
  const entry = rateLimitStore.get(ip);

  if (!entry || now >= entry.resetAt) {
    const resetAt = now + RATE_LIMIT_WINDOW_MS;
    rateLimitStore.set(ip, { count: 1, resetAt });
    return { allowed: true, remaining: MAX_REQUESTS - 1, resetAt };
  }

  entry.count++;
  const remaining = Math.max(0, MAX_REQUESTS - entry.count);
  return { allowed: entry.count <= MAX_REQUESTS, remaining, resetAt: entry.resetAt };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getClientIP(request: NextRequest): string {
  const cfIp = request.headers.get('cf-connecting-ip');
  const realIp = request.headers.get('x-real-ip');
  const forwarded = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  
  return cfIp || realIp || forwarded || 'unknown';
}

function isLocalhost(ip: string): boolean {
  if (ip === 'unknown') {
    return process.env.NODE_ENV === 'development';
  }
  return LOCALHOST_IPS.has(ip);
}

function addCorsHeaders(response: NextResponse, origin: string | null): NextResponse {
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin);
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
    response.headers.set('Access-Control-Max-Age', '86400');
  }
  return response;
}

// ---------------------------------------------------------------------------
// Middleware
import { decrypt } from './lib/auth';

export async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // --- Admin Auth Check ---
  if (path.startsWith('/admin')) {
    const session = request.cookies.get('admin_session')?.value;
    if (!session) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    try {
      const payload = await decrypt(session);
      if (!payload) throw new Error('Invalid session');
    } catch (error) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    return NextResponse.next();
  }

  // Only apply rate limiting to API routes
  if (!path.startsWith('/api')) {
    return NextResponse.next();
  }

  const ip = getClientIP(request);
  const origin = request.headers.get('origin');

  // --- Handle CORS preflight ---
  if (request.method === 'OPTIONS') {
    const response = new NextResponse(null, { status: 204 });
    return addCorsHeaders(response, origin);
  }

  // --- Skip rate limiting for localhost ---
  if (isLocalhost(ip)) {
    const response = NextResponse.next();
    return addCorsHeaders(response, origin);
  }

  // --- Rate limit check ---
  const { allowed, remaining, resetAt } = checkRateLimit(ip);

  if (!allowed) {
    const retryAfter = Math.ceil((resetAt - Date.now()) / 1000);
    const response = NextResponse.json(
      { error: 'Too many requests. Please slow down.' },
      {
        status: 429,
        headers: {
          'Retry-After': String(retryAfter),
          'X-RateLimit-Limit': String(MAX_REQUESTS),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': String(Math.ceil(resetAt / 1000)),
        },
      }
    );
    return addCorsHeaders(response, origin);
  }

  // --- Allowed — proceed with rate limit headers ---
  const response = NextResponse.next();
  response.headers.set('X-RateLimit-Limit', String(MAX_REQUESTS));
  response.headers.set('X-RateLimit-Remaining', String(remaining));
  response.headers.set('X-RateLimit-Reset', String(Math.ceil(resetAt / 1000)));

  return addCorsHeaders(response, origin);
}

export const config = {
  matcher: ['/api/:path*', '/admin/:path*'],
};
