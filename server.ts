import express from 'express';
import path from 'path';
import fs from 'fs';
import zlib from 'zlib';
import crypto from 'crypto';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { INITIAL_LISTINGS, CATEGORIES, DEMO_USER } from './src/data/mockData.js';
import { getStateForCity } from './src/data/indiaLocations.js';
import type { Listing, CategoryInfo, UserProfile } from './src/types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

const ADMIN_OWNER_EMAIL = 'sonuvarma891@gmail.com';
const rawAuthSecret = (process.env.AUTH_SECRET || process.env.OTP_SECRET || '').trim();
const AUTH_SECRET =
  rawAuthSecret.length >= 16 && !rawAuthSecret.includes('change_this')
    ? rawAuthSecret
    : 'soldx_secure_hmac_auth_secret_2026_v5_prod';

// Body parser
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// File storage path for persistent backend state
const DB_FILE = path.join(__dirname, 'backend_data.json');

interface AdminUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'admin' | 'moderator' | 'user';
  status: 'active' | 'banned';
  verified: boolean;
  memberSince: string;
  listingsCount: number;
  avatar?: string;
  city?: string;
  state?: string;
  passwordHash?: string;
}

interface SiteSettings {
  siteName: string;
  announcementText: string;
  announcementActive: boolean;
  announcementType: 'info' | 'warning' | 'success';
  maintenanceMode: boolean;
  currencySymbol: string;
  defaultCity: string;
  requireAdApproval: boolean;
  contactEmail: string;
  contactPhone: string;
  adminPin?: string;
}

interface BackendDatabase {
  listings: (Listing & {
    status?: 'active' | 'pending' | 'rejected';
    moderationReason?: string;
    reportedCount?: number;
  })[];
  categories: CategoryInfo[];
  users: AdminUser[];
  settings: SiteSettings;
}

const DEFAULT_USERS: AdminUser[] = [
  {
    id: DEMO_USER.id,
    name: DEMO_USER.name,
    email: DEMO_USER.email,
    phone: DEMO_USER.phone,
    role: 'admin',
    status: 'active',
    verified: true,
    memberSince: DEMO_USER.memberSince,
    listingsCount: 4,
    avatar: DEMO_USER.avatar,
    city: DEMO_USER.city,
    state: 'Maharashtra',
  },
  {
    id: 'user-vikram',
    name: 'Vikram Malhotra',
    email: 'vikram.m@luxurywheels.in',
    phone: '+91 98201 55432',
    role: 'user',
    status: 'active',
    verified: true,
    memberSince: 'March 2021',
    listingsCount: 2,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    city: 'Mumbai',
    state: 'Maharashtra',
  },
  {
    id: 'user-rohit',
    name: 'Rohit K.',
    email: 'rohit.k@gmail.com',
    phone: '+91 98112 34567',
    role: 'user',
    status: 'active',
    verified: true,
    memberSince: 'January 2023',
    listingsCount: 1,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    city: 'Delhi',
    state: 'Delhi (NCT)',
  },
  {
    id: 'user-spam-test',
    name: 'Suspicious Trader',
    email: 'dealz_fast99@tempmail.com',
    phone: '+91 91234 00000',
    role: 'user',
    status: 'banned',
    verified: false,
    memberSince: 'October 2026',
    listingsCount: 0,
    city: 'Kolkata',
    state: 'West Bengal',
  },
];

const DEFAULT_SETTINGS: SiteSettings = {
  siteName: 'SOLDX Classifieds',
  announcementText:
    '🎉 Welcome to SOLDX! Post unlimited free classified ads across All India with instant buyer-seller chat.',
  announcementActive: true,
  announcementType: 'info',
  maintenanceMode: false,
  currencySymbol: '₹',
  defaultCity: 'All India',
  requireAdApproval: false,
  contactEmail: 'support@soldx.in',
  contactPhone: '1800-SOLDX-HELP',
  adminPin: '891000',
};

let db: BackendDatabase = {
  listings: INITIAL_LISTINGS.map(l => ({ ...l, status: 'active' })),
  categories: CATEGORIES,
  users: DEFAULT_USERS,
  settings: DEFAULT_SETTINGS,
};

try {
  if (fs.existsSync(DB_FILE)) {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    if (parsed.listings && parsed.categories && parsed.users && parsed.settings) {
      db = parsed;
      if (!db.settings.adminPin || String(db.settings.adminPin).trim().length < 6) {
        db.settings.adminPin = '891000';
      }
      if (db.settings.siteName) {
        db.settings.siteName = db.settings.siteName.replace(/S*OLDX/gi, 'SOLDX');
      }
      if (db.settings.announcementText) {
        db.settings.announcementText = db.settings.announcementText
          .replace(/S*OLDX/gi, 'SOLDX')
          .replace(/with verified OTP login/gi, 'with instant buyer-seller chat');
      }

      // Sync any newly added default categories (e.g. dating_friendship) & initial sample listings
      for (const defaultCat of CATEGORIES) {
        const existingCat = db.categories.find(c => c.id === defaultCat.id);
        if (!existingCat) {
          db.categories.push(defaultCat);
          const seedListingsForCat = INITIAL_LISTINGS.filter(
            l => l.category === defaultCat.id && !db.listings.some(existing => existing.id === l.id)
          ).map(l => ({ ...l, status: 'active' as const }));
          if (seedListingsForCat.length > 0) {
            db.listings = [...seedListingsForCat, ...db.listings];
          }
        }
      }

      fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
      console.log(`[SOLDX Backend] Loaded ${db.listings.length} listings from database file.`);
    }
  } else {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
  }
} catch (err) {
  console.warn('[SOLDX Backend] Notice reading db file, using defaults:', err);
}

function saveDb() {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (err) {
    console.error('[SOLDX Backend] Failed to write DB file:', err);
  }
}

function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const derived = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${derived}`;
}

function verifyPassword(password: string, storedHash: string): boolean {
  const parts = storedHash.split(':');
  if (parts.length !== 2) return false;
  const [salt, keyHex] = parts;
  const derived = crypto.scryptSync(password, salt, 64);
  const keyBuf = Buffer.from(keyHex, 'hex');
  return derived.length === keyBuf.length && crypto.timingSafeEqual(derived, keyBuf);
}

function sanitizeUserForAdminList(u: AdminUser): Omit<AdminUser, 'passwordHash'> {
  const { passwordHash: _omitted, ...safe } = u;
  return safe;
}

function getExpectedAdminPin(): string {
  const envPin = (process.env.ADMIN_MASTER_PIN || '').trim();
  const dummyCheck = (process.env.TWOFACTOR_API_KEY || '').trim();
  if (envPin.length >= 6 && envPin !== dummyCheck && !envPin.includes('YOUR_')) {
    return envPin;
  }
  return (db.settings.adminPin || '891000').trim();
}

function createAdminSessionToken(email: string): string {
  const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 days
  const sig = crypto
    .createHmac('sha256', AUTH_SECRET)
    .update(`admin:${email.toLowerCase()}:${expiresAt}`)
    .digest('hex');
  return `${expiresAt}.${sig}`;
}

function verifyAdminSessionToken(token: string | undefined): boolean {
  if (!token) return false;
  const parts = token.split('.');
  if (parts.length !== 2) return false;
  const expiresAt = Number(parts[0]);
  const providedSig = parts[1];
  if (!expiresAt || Date.now() > expiresAt) return false;
  const expectedSig = crypto
    .createHmac('sha256', AUTH_SECRET)
    .update(`admin:${ADMIN_OWNER_EMAIL}:${expiresAt}`)
    .digest('hex');
  const bufA = Buffer.from(providedSig, 'utf8');
  const bufB = Buffer.from(expectedSig, 'utf8');
  return bufA.length === bufB.length && crypto.timingSafeEqual(bufA, bufB);
}

function requireAdminAuth(req: express.Request, res: express.Response, next: express.NextFunction) {
  const token = (req.headers['x-admin-token'] as string | undefined) || (req.query.adminToken as string | undefined);
  if (!verifyAdminSessionToken(token)) {
    return res.status(403).json({
      error: 'Unauthorized: Owner Admin login required.',
    });
  }
  next();
}

// Brute-force protection map for Admin PIN attempts
const adminAttemptTracker = new Map<string, { count: number; lockUntil: number }>();

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

// ----------------------------------------------------
// REST API ENDPOINTS (/api/*)
// ----------------------------------------------------

// 0. DIRECT EMAIL / MOBILE + PASSWORD AUTHENTICATION (Zero OTP)
app.post('/api/auth/login', (req, res) => {
  const { identifier, password } = req.body || {};
  const parsed = parseEmailOrPhone(String(identifier || ''));
  if (!parsed.ok) {
    return res.status(400).json({ success: false, error: parsed.error });
  }

  const cleanPassword = String(password || '').trim();
  if (cleanPassword.length < 4) {
    return res.status(400).json({
      success: false,
      error: 'Kirpya kam se kam 4 characters ka Password enter karein.',
    });
  }

  // Strictly grant Admin ONLY when logging in via email === sonuvarma891@gmail.com
  const isOwnerAdminLogin = parsed.channel === 'email' && parsed.normalized === ADMIN_OWNER_EMAIL;

  let dbUser = db.users.find(u => {
    if (parsed.channel === 'email') {
      return Boolean(u.email) && u.email.toLowerCase() === parsed.normalized;
    }
    // Never match the owner admin record via phone login so admin stays exclusively tied to sonuvarma891@gmail.com
    if (u.email && u.email.toLowerCase() === ADMIN_OWNER_EMAIL) {
      return false;
    }
    return Boolean(parsed.digits10) && u.phone.replace(/\D/g, '').endsWith(parsed.digits10!);
  });

  if (dbUser?.status === 'banned') {
    return res.status(403).json({
      success: false,
      error: 'Ye account community guidelines violation ke karan suspend kiya gaya hai.',
    });
  }

  if (dbUser) {
    if (dbUser.passwordHash) {
      const passwordOk = verifyPassword(cleanPassword, dbUser.passwordHash);
      const ownerMasterPinFallback =
        isOwnerAdminLogin &&
        cleanPassword.length >= 6 &&
        cleanPassword === getExpectedAdminPin();

      if (!passwordOk && !ownerMasterPinFallback) {
        return res.status(401).json({
          success: false,
          error: 'Galat Password! Kirpya sahi password enter karein.',
        });
      }
    } else {
      // First-time password login for existing account: store hashed password
      dbUser.passwordHash = hashPassword(cleanPassword);
    }

    dbUser.verified = true;
    if (isOwnerAdminLogin) {
      dbUser.role = 'admin';
    }
    saveDb();
  } else {
    const formattedPhone =
      parsed.channel === 'phone' && parsed.digits10
        ? `+91 ${parsed.digits10.slice(0, 5)} ${parsed.digits10.slice(5)}`
        : '';
    const defaultName = isOwnerAdminLogin
      ? 'Sonu Varma'
      : parsed.channel === 'email'
      ? parsed.normalized.split('@')[0]
      : `SOLDX User ${parsed.digits10?.slice(-4) || ''}`;

    dbUser = {
      id: isOwnerAdminLogin ? DEMO_USER.id : `usr-${Date.now().toString().slice(-6)}`,
      name: defaultName,
      email: parsed.channel === 'email' ? parsed.normalized : '',
      phone: formattedPhone,
      role: isOwnerAdminLogin ? 'admin' : 'user',
      status: 'active',
      verified: true,
      memberSince: new Date().toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }),
      listingsCount: 0,
      avatar: isOwnerAdminLogin
        ? DEMO_USER.avatar
        : `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(defaultName)}`,
      city: 'Delhi',
      state: 'Delhi (NCT)',
      passwordHash: hashPassword(cleanPassword),
    };
    db.users.push(dbUser);
    saveDb();
  }

  const userProfile: UserProfile = {
    id: dbUser.id,
    name: dbUser.name,
    email: isOwnerAdminLogin ? ADMIN_OWNER_EMAIL : dbUser.email,
    phone: dbUser.phone,
    avatar: dbUser.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(dbUser.name)}`,
    memberSince: dbUser.memberSince,
    verified: true,
    city: dbUser.city,
    state: dbUser.state,
    role: isOwnerAdminLogin ? 'admin' : 'user',
  };

  if (isOwnerAdminLogin) {
    const adminToken = createAdminSessionToken(ADMIN_OWNER_EMAIL);
    return res.json({ success: true, user: userProfile, adminToken });
  }

  return res.json({ success: true, user: userProfile });
});

app.post('/api/auth/signup', (req, res) => {
  const { name, email, phone, password, city, state } = req.body || {};
  const cleanName = String(name || '').trim();
  const cleanEmailRaw = String(email || '').trim().toLowerCase();
  const cleanPhoneRaw = String(phone || '').trim();
  const cleanPassword = String(password || '').trim();

  if (!cleanName) {
    return res.status(400).json({ success: false, error: 'Kirpya apna poora naam enter karein.' });
  }
  if (cleanPassword.length < 4) {
    return res.status(400).json({
      success: false,
      error: 'Kirpya kam se kam 4 characters ka Password banayein.',
    });
  }
  if (!cleanEmailRaw && !cleanPhoneRaw) {
    return res.status(400).json({
      success: false,
      error: 'Kirpya Email ID ya 10-digit Mobile Number me se kam se kam ek zaroor bharein.',
    });
  }

  if (cleanEmailRaw && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmailRaw)) {
    return res.status(400).json({ success: false, error: 'Kirpya valid Email ID enter karein.' });
  }

  let digits10 = '';
  if (cleanPhoneRaw) {
    digits10 = cleanPhoneRaw
      .replace(/\D/g, '')
      .replace(/^91(\d{10})$/, '$1')
      .replace(/^0(\d{10})$/, '$1');
    if (!/^[6-9]\d{9}$/.test(digits10)) {
      return res.status(400).json({
        success: false,
        error: 'Kirpya valid 10-digit Indian Mobile Number enter karein.',
      });
    }
  }

  const isOwnerAdminSignup = cleanEmailRaw === ADMIN_OWNER_EMAIL;

  let existingUser = db.users.find(u => {
    if (cleanEmailRaw && u.email && u.email.toLowerCase() === cleanEmailRaw) return true;
    if (digits10 && (!u.email || u.email.toLowerCase() !== ADMIN_OWNER_EMAIL)) {
      if (u.phone.replace(/\D/g, '').endsWith(digits10)) return true;
    }
    return false;
  });

  if (existingUser?.status === 'banned') {
    return res.status(403).json({ success: false, error: 'Ye account banned hai.' });
  }

  const formattedPhone = digits10 ? `+91 ${digits10.slice(0, 5)} ${digits10.slice(5)}` : '';
  const userCity = String(city || '').trim() || existingUser?.city || 'Delhi';
  const userState = String(state || '').trim() || existingUser?.state || getStateForCity(userCity) || 'India';

  if (existingUser) {
    if (existingUser.passwordHash && !verifyPassword(cleanPassword, existingUser.passwordHash)) {
      return res.status(409).json({
        success: false,
        error: 'Is Email ya Mobile se account pehle se bana hai. Kirpya Login tab me sahi password enter karein.',
      });
    }
    existingUser.passwordHash = hashPassword(cleanPassword);
    existingUser.name = cleanName || existingUser.name;
    if (cleanEmailRaw) existingUser.email = cleanEmailRaw;
    if (formattedPhone) existingUser.phone = formattedPhone;
    existingUser.city = userCity;
    existingUser.state = userState;
    existingUser.verified = true;
    if (isOwnerAdminSignup) existingUser.role = 'admin';
    saveDb();
  } else {
    existingUser = {
      id: isOwnerAdminSignup ? DEMO_USER.id : `usr-${Date.now().toString().slice(-6)}`,
      name: cleanName,
      email: cleanEmailRaw,
      phone: formattedPhone,
      role: isOwnerAdminSignup ? 'admin' : 'user',
      status: 'active',
      verified: true,
      memberSince: new Date().toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }),
      listingsCount: 0,
      avatar: isOwnerAdminSignup
        ? DEMO_USER.avatar
        : `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(cleanName)}`,
      city: userCity,
      state: userState,
      passwordHash: hashPassword(cleanPassword),
    };
    db.users.push(existingUser);
    saveDb();
  }

  const userProfile: UserProfile = {
    id: existingUser.id,
    name: existingUser.name,
    email: isOwnerAdminSignup ? ADMIN_OWNER_EMAIL : existingUser.email,
    phone: existingUser.phone,
    avatar:
      existingUser.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(existingUser.name)}`,
    memberSince: existingUser.memberSince,
    verified: true,
    city: existingUser.city,
    state: existingUser.state,
    role: isOwnerAdminSignup ? 'admin' : 'user',
  };

  if (isOwnerAdminSignup) {
    const adminToken = createAdminSessionToken(ADMIN_OWNER_EMAIL);
    return res.json({ success: true, user: userProfile, adminToken });
  }

  return res.json({ success: true, user: userProfile });
});

// 1. Health check & Server Status
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'online',
    server: 'SOLDX High-Performance Express Engine',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    nodeVersion: process.version,
    database: {
      listingsCount: db.listings.length,
      categoriesCount: db.categories.length,
      usersCount: db.users.length,
    },
  });
});

// 2. Comprehensive Platform Analytics & Stats (Protected by Admin Session Token)
app.get('/api/stats', requireAdminAuth, (_req, res) => {
  const total = db.listings.length;
  const active = db.listings.filter(l => (l.status || 'active') === 'active').length;
  const pending = db.listings.filter(l => l.status === 'pending').length;
  const rejected = db.listings.filter(l => l.status === 'rejected').length;
  const featured = db.listings.filter(l => l.featured).length;
  const urgent = db.listings.filter(l => l.urgent).length;

  const totalUsers = db.users.length;
  const verifiedUsers = db.users.filter(u => u.verified).length;
  const bannedUsers = db.users.filter(u => u.status === 'banned').length;

  const totalCategories = db.categories.length;
  const totalSubcategories = db.categories.reduce((acc, cat) => acc + (cat.subcategories?.length || 0), 0);

  const safeSettings = { ...db.settings };
  delete safeSettings.adminPin;

  res.json({
    listings: { total, active, pending, rejected, featured, urgent },
    users: { total: totalUsers, verified: verifiedUsers, banned: bannedUsers },
    categories: { total: totalCategories, subcategories: totalSubcategories },
    settings: safeSettings,
    server: { status: 'online', uptime: Math.floor(process.uptime()) },
  });
});

// 3. Site Settings (Never leak adminPin on public GET)
app.get('/api/settings', (_req, res) => {
  const safeSettings = { ...db.settings };
  delete safeSettings.adminPin;
  res.json(safeSettings);
});

app.put('/api/settings', requireAdminAuth, (req, res) => {
  const incoming = { ...req.body };
  const newAdminPassword = String(incoming.newAdminPassword || '').trim();
  delete incoming.newAdminPassword;

  if (newAdminPassword.length >= 4) {
    const ownerUser = db.users.find(u => u.email && u.email.toLowerCase() === ADMIN_OWNER_EMAIL);
    if (ownerUser) {
      ownerUser.passwordHash = hashPassword(newAdminPassword);
    }
  }

  if (!incoming.adminPin || String(incoming.adminPin).trim().length < 4) {
    incoming.adminPin = db.settings.adminPin || '891000';
  } else {
    incoming.adminPin = String(incoming.adminPin).trim();
  }
  db.settings = { ...db.settings, ...incoming };
  saveDb();
  const safeSettings = { ...db.settings };
  delete safeSettings.adminPin;
  res.json({ success: true, settings: safeSettings });
});

// Strict Admin Owner Login & Master PIN Verification (Rate-limited + Signed Session Token)
app.post('/api/admin/verify-pin', (req, res) => {
  const clientIp = String(req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown');
  const now = Date.now();
  const record = adminAttemptTracker.get(clientIp);

  if (record && record.lockUntil > now) {
    const minsLeft = Math.ceil((record.lockUntil - now) / 60000);
    return res.status(429).json({
      success: false,
      error: `Too many failed attempts. Admin login locked for ${minsLeft} minute(s).`,
    });
  }

  const { pin, email } = req.body || {};
  const normalizedEmail = String(email || '').trim().toLowerCase();
  const cleanPin = String(pin || '').trim();
  const expectedPin = getExpectedAdminPin();

  const emailMatches = normalizedEmail === ADMIN_OWNER_EMAIL;
  const pinBufA = Buffer.from(cleanPin, 'utf8');
  const pinBufB = Buffer.from(expectedPin, 'utf8');
  const pinMatches = pinBufA.length === pinBufB.length && crypto.timingSafeEqual(pinBufA, pinBufB);

  if (!emailMatches || !pinMatches) {
    const nextCount = (record?.count || 0) + 1;
    adminAttemptTracker.set(clientIp, {
      count: nextCount,
      lockUntil: nextCount >= 5 ? now + 15 * 60 * 1000 : 0,
    });
    return res.status(403).json({
      success: false,
      error: !emailMatches
        ? 'Access Denied: Ye Email Address Admin Portal ke liye authorized nahi hai.'
        : 'Incorrect Admin Master PIN. Access Denied.',
    });
  }

  adminAttemptTracker.delete(clientIp);
  const adminToken = createAdminSessionToken(ADMIN_OWNER_EMAIL);
  const adminUser: UserProfile = {
    id: DEMO_USER.id,
    name: 'Sonu Varma',
    email: 'Sonuvarma891@gmail.com',
    phone: DEMO_USER.phone,
    avatar: DEMO_USER.avatar,
    memberSince: DEMO_USER.memberSince,
    verified: true,
    otpVerified: true,
    city: DEMO_USER.city,
    state: 'Maharashtra',
    role: 'admin',
  };

  return res.json({
    success: true,
    adminToken,
    user: adminUser,
    message: 'Admin verified successfully',
  });
});

// 4. Listings Management (GET, POST, PUT, DELETE)
app.get('/api/listings', (req, res) => {
  const { status, category, city, state, search, featured } = req.query;
  let result = [...db.listings];

  if (status && typeof status === 'string' && status !== 'all') {
    result = result.filter(l => (l.status || 'active') === status);
  }
  if (category && typeof category === 'string' && category !== 'all') {
    result = result.filter(l => l.category.toLowerCase() === category.toLowerCase());
  }
  if (state && typeof state === 'string' && state.trim() !== '') {
    const stLower = state.toLowerCase();
    result = result.filter(l => {
      const itemState = (l.location.state || getStateForCity(l.location.city) || '').toLowerCase();
      return itemState === stLower;
    });
  }
  if (city && typeof city === 'string' && city !== 'All India' && !city.startsWith('All ')) {
    result = result.filter(l => l.location.city.toLowerCase() === city.toLowerCase());
  }
  if (featured === 'true') {
    result = result.filter(l => l.featured);
  }
  if (search && typeof search === 'string') {
    const q = search.toLowerCase();
    result = result.filter(
      l =>
        l.title.toLowerCase().includes(q) ||
        l.description.toLowerCase().includes(q) ||
        l.location.city.toLowerCase().includes(q)
    );
  }

  res.json(result);
});

app.post('/api/listings', (req, res) => {
  const newListing: Listing & { status?: 'active' | 'pending' | 'rejected' } = {
    ...req.body,
    id: req.body.id || `soldx-${Date.now()}`,
    postedDate: req.body.postedDate || 'Just now',
    viewsCount: req.body.viewsCount || 1,
    likesCount: req.body.likesCount || 0,
    status: db.settings.requireAdApproval ? 'pending' : req.body.status || 'active',
  };

  db.listings.unshift(newListing);
  saveDb();
  res.status(201).json({ success: true, listing: newListing });
});

app.put('/api/listings/:id', requireAdminAuth, (req, res) => {
  const { id } = req.params;
  const index = db.listings.findIndex(l => l.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Listing not found' });
  }

  db.listings[index] = { ...db.listings[index], ...req.body };
  saveDb();
  res.json({ success: true, listing: db.listings[index] });
});

app.post('/api/listings/:id/action', requireAdminAuth, (req, res) => {
  const { id } = req.params;
  const { action, reason } = req.body;
  const listing = db.listings.find(l => l.id === id);

  if (!listing) {
    return res.status(404).json({ error: 'Listing not found' });
  }

  if (action === 'approve') {
    listing.status = 'active';
    delete listing.moderationReason;
  } else if (action === 'reject') {
    listing.status = 'rejected';
    listing.moderationReason = reason || 'Does not comply with community guidelines';
  } else if (action === 'toggle_featured') {
    listing.featured = !listing.featured;
  } else if (action === 'toggle_urgent') {
    listing.urgent = !listing.urgent;
  }

  saveDb();
  res.json({ success: true, listing });
});

app.delete('/api/listings/:id', (req, res) => {
  const { id } = req.params;
  const target = db.listings.find(l => l.id === id);
  if (!target) {
    return res.status(404).json({ error: 'Listing not found' });
  }

  // Non-user listings require Admin Token to delete
  const adminToken = req.headers['x-admin-token'] as string | undefined;
  if (!target.isUserListing && !verifyAdminSessionToken(adminToken)) {
    return res.status(403).json({ error: 'Unauthorized to delete marketplace listing' });
  }

  db.listings = db.listings.filter(l => l.id !== id);
  saveDb();
  res.json({ success: true, message: 'Listing successfully deleted' });
});

// 5. Category Management
app.get('/api/categories', (_req, res) => {
  res.json(db.categories);
});

app.post('/api/categories', requireAdminAuth, (req, res) => {
  const newCat: CategoryInfo = {
    ...req.body,
    id: req.body.id || req.body.name.toLowerCase().replace(/[^a-z0-9]/g, '_'),
    subcategories: req.body.subcategories || [],
    popularAttributes: req.body.popularAttributes || ['Condition', 'Brand', 'Price'],
    color: req.body.color || 'bg-slate-50 text-slate-700 border-slate-200',
    iconName: req.body.iconName || 'Package',
  };

  db.categories.push(newCat);
  saveDb();
  res.status(201).json({ success: true, category: newCat });
});

app.post('/api/categories/:id/subcategories', requireAdminAuth, (req, res) => {
  const { id } = req.params;
  const { subcategory } = req.body;
  const cat = db.categories.find(c => c.id === id);

  if (!cat) {
    return res.status(404).json({ error: 'Category not found' });
  }

  if (!cat.subcategories.includes(subcategory)) {
    cat.subcategories.push(subcategory);
    saveDb();
  }

  res.json({ success: true, category: cat });
});

app.delete('/api/categories/:id', requireAdminAuth, (req, res) => {
  const { id } = req.params;
  db.categories = db.categories.filter(c => c.id !== id);
  saveDb();
  res.json({ success: true, message: 'Category deleted' });
});

// 6. User Management (Strictly Protected by Admin Session Token)
app.get('/api/users', requireAdminAuth, (_req, res) => {
  res.json(db.users.map(sanitizeUserForAdminList));
});

app.put('/api/users/:id', requireAdminAuth, (req, res) => {
  const { id } = req.params;
  const user = db.users.find(u => u.id === id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  const safeBody = { ...req.body };
  delete safeBody.passwordHash;

  if (user.email.toLowerCase() === ADMIN_OWNER_EMAIL) {
    delete safeBody.role;
    delete safeBody.status;
    Object.assign(user, safeBody);
  } else {
    Object.assign(user, safeBody);
  }
  saveDb();
  res.json({ success: true, user: sanitizeUserForAdminList(user) });
});

// 7. Backup & Restore (Protected by Admin Session Token)
app.get('/api/export', requireAdminAuth, (_req, res) => {
  const safeDb = {
    ...db,
    users: db.users.map(sanitizeUserForAdminList),
    settings: { ...db.settings, adminPin: undefined },
  };
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', 'attachment; filename="soldx_backup.json"');
  res.send(JSON.stringify(safeDb, null, 2));
});

const CRC32_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[i] = c >>> 0;
  }
  return table;
})();

function crc32Buffer(buf: Buffer): number {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc = CRC32_TABLE[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function collectProjectFiles(
  dirPath: string,
  baseDir: string,
  out: { relPath: string; fullPath: string }[] = [],
  isSourceRoot = true
) {
  const EXCLUDED = new Set([
    'node_modules',
    'dist',
    '.git',
    '.aistudio',
    'aistudio',
    '.env',
    '.env.local',
    '.DS_Store',
    'bun.lock',
    'bun.lockb',
    'wrangler.jsonc',
    'worker.ts',
    'soldx-marketplace.zip',
    'soldx-github-update.zip',
    'soldx-cloudflare-direct.zip',
    'backend_data.json',
  ]);
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  for (const entry of entries) {
    if (EXCLUDED.has(entry.name) || entry.name.endsWith('.zip')) continue;
    const fullPath = path.join(dirPath, entry.name);
    const relPath = path.relative(baseDir, fullPath).split(path.sep).join('/');

    if (
      isSourceRoot &&
      (relPath === 'assets' ||
        relPath.startsWith('assets/') ||
        relPath === 'src/assets' ||
        relPath.startsWith('src/assets/') ||
        relPath === 'public/assets/aistudio' ||
        relPath.startsWith('public/assets/aistudio/'))
    ) {
      continue;
    }

    if (entry.isDirectory()) {
      collectProjectFiles(fullPath, baseDir, out, isSourceRoot);
    } else if (entry.isFile()) {
      out.push({ relPath, fullPath });
    }
  }
  return out;
}

const STORE_ONLY_EXTENSIONS = new Set([
  '.jpg',
  '.jpeg',
  '.png',
  '.webp',
  '.gif',
  '.ico',
  '.woff',
  '.woff2',
]);

function buildProjectZip(rootDir: string, isSourceRoot = true): Buffer {
  const files = collectProjectFiles(rootDir, rootDir, [], isSourceRoot);
  const localParts: Buffer[] = [];
  const centralParts: Buffer[] = [];
  let offset = 0;

  for (const file of files) {
    const rawBuf = fs.readFileSync(file.fullPath);
    const ext = path.extname(file.relPath).toLowerCase();
    const useStore = STORE_ONLY_EXTENSIONS.has(ext);
    const compMethod = useStore ? 0 : 8;
    const compBuf = useStore ? rawBuf : zlib.deflateRawSync(rawBuf);
    const crc = crc32Buffer(rawBuf);
    const nameBuf = Buffer.from(file.relPath, 'utf8');

    const localHeader = Buffer.alloc(30);
    localHeader.writeUInt32LE(0x04034b50, 0);
    localHeader.writeUInt16LE(20, 4);
    localHeader.writeUInt16LE(0x0800, 6);
    localHeader.writeUInt16LE(compMethod, 8);
    localHeader.writeUInt16LE(0, 10);
    localHeader.writeUInt16LE(0x0021, 12);
    localHeader.writeUInt32LE(crc, 14);
    localHeader.writeUInt32LE(compBuf.length, 18);
    localHeader.writeUInt32LE(rawBuf.length, 22);
    localHeader.writeUInt16LE(nameBuf.length, 26);
    localHeader.writeUInt16LE(0, 28);

    localParts.push(localHeader, nameBuf, compBuf);

    const centralHeader = Buffer.alloc(46);
    centralHeader.writeUInt32LE(0x02014b50, 0);
    centralHeader.writeUInt16LE(20, 4);
    centralHeader.writeUInt16LE(20, 6);
    centralHeader.writeUInt16LE(0x0800, 8);
    centralHeader.writeUInt16LE(compMethod, 10);
    centralHeader.writeUInt16LE(0, 12);
    centralHeader.writeUInt16LE(0x0021, 14);
    centralHeader.writeUInt32LE(crc, 16);
    centralHeader.writeUInt32LE(compBuf.length, 20);
    centralHeader.writeUInt32LE(rawBuf.length, 24);
    centralHeader.writeUInt16LE(nameBuf.length, 28);
    centralHeader.writeUInt16LE(0, 30);
    centralHeader.writeUInt16LE(0, 32);
    centralHeader.writeUInt16LE(0, 34);
    centralHeader.writeUInt16LE(0, 36);
    centralHeader.writeUInt32LE(0, 38);
    centralHeader.writeUInt32LE(offset, 42);

    centralParts.push(centralHeader, nameBuf);
    offset += localHeader.length + nameBuf.length + compBuf.length;
  }

  const centralDirBuf = Buffer.concat(centralParts);
  const eocd = Buffer.alloc(22);
  eocd.writeUInt32LE(0x06054b50, 0);
  eocd.writeUInt16LE(0, 4);
  eocd.writeUInt16LE(0, 6);
  eocd.writeUInt16LE(files.length, 8);
  eocd.writeUInt16LE(files.length, 10);
  eocd.writeUInt32LE(centralDirBuf.length, 12);
  eocd.writeUInt32LE(offset, 16);
  eocd.writeUInt16LE(0, 20);

  return Buffer.concat([...localParts, centralDirBuf, eocd]);
}

let cachedSourceZip: { buffer: Buffer; timestamp: number } | null = null;

function getCachedProjectSourceZip(): Buffer {
  const now = Date.now();
  if (cachedSourceZip && now - cachedSourceZip.timestamp < 5000) {
    return cachedSourceZip.buffer;
  }
  const buffer = buildProjectZip(__dirname, true);
  cachedSourceZip = { buffer, timestamp: now };
  return buffer;
}

function sendProjectSourceZip(req: express.Request, res: express.Response, filename: string) {
  try {
    const zipBuffer = getCachedProjectSourceZip();
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', String(zipBuffer.length));
    res.setHeader('Accept-Ranges', 'bytes');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition, Content-Length');
    if (req.method === 'HEAD') {
      res.status(200).end();
      return;
    }
    res.status(200).end(zipBuffer);
  } catch (err) {
    console.error('Failed to generate project ZIP:', err);
    res.status(500).json({ error: 'Failed to generate ZIP archive' });
  }
}

app.get('/soldx-github-update.zip', (req, res) => {
  sendProjectSourceZip(req, res, 'soldx-github-update.zip');
});

app.get('/soldx-marketplace.zip', (req, res) => {
  sendProjectSourceZip(req, res, 'soldx-github-update.zip');
});

app.get('/api/download-zip', (req, res) => {
  sendProjectSourceZip(req, res, 'soldx-github-update.zip');
});

app.get('/api/download-cloudflare-zip', requireAdminAuth, (_req, res) => {
  try {
    const distDir = path.resolve(__dirname, 'dist');
    execSync('npm run build', { cwd: __dirname, stdio: 'pipe' });
    const zipBuffer = buildProjectZip(distDir, false);
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', 'attachment; filename="soldx-cloudflare-direct.zip"');
    res.setHeader('Content-Length', String(zipBuffer.length));
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.status(200).end(zipBuffer);
  } catch (err) {
    console.error('Failed to generate Cloudflare Direct Upload ZIP:', err);
    res.status(500).json({ error: 'Failed to generate Cloudflare Direct Upload ZIP' });
  }
});

app.post('/api/import', requireAdminAuth, (req, res) => {
  const imported = req.body;
  if (!imported.listings || !imported.categories) {
    return res.status(400).json({ error: 'Invalid backup file structure' });
  }

  db = {
    ...imported,
    settings: {
      ...imported.settings,
      adminPin: db.settings.adminPin || '891000',
    },
  };
  saveDb();
  res.json({ success: true, message: 'Data successfully restored from backup' });
});

app.post('/api/reset', requireAdminAuth, (_req, res) => {
  db = {
    listings: INITIAL_LISTINGS.map(l => ({ ...l, status: 'active' })),
    categories: CATEGORIES,
    users: DEFAULT_USERS,
    settings: {
      ...DEFAULT_SETTINGS,
      adminPin: db.settings.adminPin || '891000',
    },
  };
  saveDb();
  res.json({ success: true, message: 'Reset to factory defaults complete' });
});

async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[SOLDX Backend Engine] Ready & listening on port ${PORT}`);
  });
}

startServer();
