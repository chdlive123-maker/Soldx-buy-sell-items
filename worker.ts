export interface CloudflareWorkerEnv {
  ASSETS: {
    fetch: (request: Request) => Promise<Response>;
  };
  AUTH_SECRET?: string;
  OTP_SECRET?: string;
  ADMIN_PASSWORD?: string;
  ADMIN_MASTER_PIN?: string;
}

const ADMIN_OWNER_EMAIL = 'sonuvarma891@gmail.com';
const DEFAULT_AUTH_SECRET = 'soldx_secure_hmac_auth_secret_2026_v5_prod';

function getSecret(env: CloudflareWorkerEnv): string {
  const raw = (env.AUTH_SECRET || env.OTP_SECRET || '').trim();
  return raw.length >= 16 && !raw.includes('change_this') ? raw : DEFAULT_AUTH_SECRET;
}

function getExpectedAdminPin(env: CloudflareWorkerEnv): string {
  const raw = (env.ADMIN_MASTER_PIN || '').trim();
  return raw.length >= 6 && !raw.includes('YOUR_') ? raw : '891000';
}

function parseEmailOrPhone(rawInput: string): {
  ok: boolean;
  channel: 'email' | 'phone';
  normalized: string;
  digits10?: string;
  error?: string;
} {
  const raw = (rawInput || '').trim();
  if (!raw) {
    return {
      ok: false,
      channel: 'email',
      normalized: '',
      error: 'Kirpya apna Email ID ya 10-digit Mobile Number enter karein.',
    };
  }

  if (raw.includes('@')) {
    const lower = raw.toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(lower)) {
      return {
        ok: false,
        channel: 'email',
        normalized: '',
        error: 'Kirpya sahi Email ID enter karein (e.g. name@gmail.com).',
      };
    }
    return { ok: true, channel: 'email', normalized: lower };
  }

  const digits = raw
    .replace(/\D/g, '')
    .replace(/^91(\d{10})$/, '$1')
    .replace(/^0(\d{10})$/, '$1');
  if (!/^[6-9]\d{9}$/.test(digits)) {
    return {
      ok: false,
      channel: 'phone',
      normalized: '',
      error: 'Kirpya valid Email ID ya 10-digit Indian Mobile Number enter karein.',
    };
  }
  return { ok: true, channel: 'phone', normalized: `+91${digits}`, digits10: digits };
}

async function hmacSha256Hex(secret: string, message: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(message));
  return Array.from(new Uint8Array(sig))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

export default {
  async fetch(request: Request, env: CloudflareWorkerEnv): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === '/api/health') {
      return Response.json({
        status: 'online',
        server: 'SOLDX Cloudflare Edge Worker',
        timestamp: new Date().toISOString(),
      });
    }

    if (url.pathname === '/api/auth/login' && request.method === 'POST') {
      const body = (await request.json().catch(() => ({}))) as Record<string, any>;
      const parsed = parseEmailOrPhone(String(body.identifier || ''));
      if (!parsed.ok) {
        return Response.json({ success: false, error: parsed.error }, { status: 400 });
      }

      const cleanPassword = String(body.password || '').trim();
      if (cleanPassword.length < 4) {
        return Response.json(
          { success: false, error: 'Kirpya kam se kam 4 characters ka Password enter karein.' },
          { status: 400 }
        );
      }

      const isOwnerAdmin = parsed.channel === 'email' && parsed.normalized === ADMIN_OWNER_EMAIL;
      if (isOwnerAdmin) {
        const configuredAdminPass = (env.ADMIN_PASSWORD || '').trim();
        if (
          configuredAdminPass.length >= 4 &&
          !constantTimeEqual(cleanPassword, configuredAdminPass) &&
          !constantTimeEqual(cleanPassword, getExpectedAdminPin(env))
        ) {
          return Response.json(
            { success: false, error: 'Galat Password! Kirpya sahi Admin password enter karein.' },
            { status: 401 }
          );
        }
      }

      const formattedPhone =
        parsed.channel === 'phone' && parsed.digits10
          ? `+91 ${parsed.digits10.slice(0, 5)} ${parsed.digits10.slice(5)}`
          : '';
      const displayName = isOwnerAdmin
        ? 'Sonu Varma'
        : parsed.channel === 'email'
        ? parsed.normalized.split('@')[0]
        : `SOLDX User ${parsed.digits10?.slice(-4) || ''}`;

      const userProfile = {
        id: isOwnerAdmin ? 'usr-sonu-891' : `usr-${Date.now().toString().slice(-6)}`,
        name: displayName,
        email: isOwnerAdmin ? ADMIN_OWNER_EMAIL : parsed.channel === 'email' ? parsed.normalized : '',
        phone: isOwnerAdmin ? '+91 98200 12345' : formattedPhone,
        avatar: isOwnerAdmin
          ? 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80'
          : `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(displayName)}`,
        memberSince: new Date().toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }),
        verified: true,
        city: isOwnerAdmin ? 'Mumbai' : 'Delhi',
        state: isOwnerAdmin ? 'Maharashtra' : 'Delhi (NCT)',
        role: isOwnerAdmin ? ('admin' as const) : ('user' as const),
      };

      if (isOwnerAdmin) {
        const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000;
        const sig = await hmacSha256Hex(getSecret(env), `admin:${ADMIN_OWNER_EMAIL}:${expiresAt}`);
        return Response.json({
          success: true,
          user: userProfile,
          adminToken: `${expiresAt}.${sig}`,
        });
      }

      return Response.json({ success: true, user: userProfile });
    }

    if (url.pathname === '/api/auth/signup' && request.method === 'POST') {
      const body = (await request.json().catch(() => ({}))) as Record<string, any>;
      const cleanName = String(body.name || '').trim();
      const cleanEmail = String(body.email || '').trim().toLowerCase();
      const cleanPhoneRaw = String(body.phone || '').trim();
      const cleanPassword = String(body.password || '').trim();

      if (!cleanName) {
        return Response.json({ success: false, error: 'Kirpya apna poora naam enter karein.' }, { status: 400 });
      }
      if (cleanPassword.length < 4) {
        return Response.json(
          { success: false, error: 'Kirpya kam se kam 4 characters ka Password banayein.' },
          { status: 400 }
        );
      }
      if (!cleanEmail && !cleanPhoneRaw) {
        return Response.json(
          { success: false, error: 'Kirpya Email ID ya Mobile Number enter karein.' },
          { status: 400 }
        );
      }
      if (cleanEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
        return Response.json({ success: false, error: 'Kirpya valid Email ID enter karein.' }, { status: 400 });
      }

      let digits10 = '';
      if (cleanPhoneRaw) {
        digits10 = cleanPhoneRaw
          .replace(/\D/g, '')
          .replace(/^91(\d{10})$/, '$1')
          .replace(/^0(\d{10})$/, '$1');
        if (!/^[6-9]\d{9}$/.test(digits10)) {
          return Response.json(
            { success: false, error: 'Kirpya valid 10-digit Mobile Number enter karein.' },
            { status: 400 }
          );
        }
      }

      const isOwnerAdmin = cleanEmail === ADMIN_OWNER_EMAIL;
      if (isOwnerAdmin) {
        const configuredAdminPass = (env.ADMIN_PASSWORD || '').trim();
        if (
          configuredAdminPass.length >= 4 &&
          !constantTimeEqual(cleanPassword, configuredAdminPass) &&
          !constantTimeEqual(cleanPassword, getExpectedAdminPin(env))
        ) {
          return Response.json(
            { success: false, error: 'Galat Admin Password!' },
            { status: 401 }
          );
        }
      }

      const formattedPhone = digits10 ? `+91 ${digits10.slice(0, 5)} ${digits10.slice(5)}` : '';
      const userCity = String(body.city || '').trim() || 'Delhi';
      const userState = String(body.state || '').trim() || 'India';

      const userProfile = {
        id: isOwnerAdmin ? 'usr-sonu-891' : `usr-${Date.now().toString().slice(-6)}`,
        name: cleanName,
        email: isOwnerAdmin ? ADMIN_OWNER_EMAIL : cleanEmail,
        phone: formattedPhone,
        avatar: isOwnerAdmin
          ? 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80'
          : `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(cleanName)}`,
        memberSince: new Date().toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }),
        verified: true,
        city: userCity,
        state: userState,
        role: isOwnerAdmin ? ('admin' as const) : ('user' as const),
      };

      if (isOwnerAdmin) {
        const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000;
        const sig = await hmacSha256Hex(getSecret(env), `admin:${ADMIN_OWNER_EMAIL}:${expiresAt}`);
        return Response.json({
          success: true,
          user: userProfile,
          adminToken: `${expiresAt}.${sig}`,
        });
      }

      return Response.json({ success: true, user: userProfile });
    }

    if (url.pathname === '/api/admin/verify-pin' && request.method === 'POST') {
      const body = (await request.json().catch(() => ({}))) as Record<string, any>;
      const normalizedEmail = String(body.email || '').trim().toLowerCase();
      if (normalizedEmail !== ADMIN_OWNER_EMAIL) {
        return Response.json(
          {
            success: false,
            error: 'Access Denied: Ye Email Address Admin Portal ke liye authorized nahi hai.',
          },
          { status: 403 }
        );
      }
      const expectedAdminPin = getExpectedAdminPin(env);
      if (constantTimeEqual(String(body.pin || '').trim(), expectedAdminPin)) {
        const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000;
        const sig = await hmacSha256Hex(getSecret(env), `admin:${ADMIN_OWNER_EMAIL}:${expiresAt}`);
        return Response.json({
          success: true,
          adminToken: `${expiresAt}.${sig}`,
          user: {
            id: 'usr-sonu-891',
            name: 'Sonu Varma',
            email: ADMIN_OWNER_EMAIL,
            phone: '+91 98200 12345',
            avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
            memberSince: 'Aug 2024',
            verified: true,
            city: 'Mumbai',
            state: 'Maharashtra',
            role: 'admin',
          },
          message: 'Admin verified successfully',
        });
      }
      return Response.json({ success: false, error: 'Incorrect Admin Master PIN. Access Denied.' }, { status: 403 });
    }

    if (url.pathname.startsWith('/api/')) {
      return Response.json({ error: 'API endpoint not available in edge mode' }, { status: 404 });
    }

    return env.ASSETS.fetch(request);
  },
};
