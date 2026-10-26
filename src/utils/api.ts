import { Listing, CategoryInfo, AdminUser, SiteSettings, PlatformStats, UserProfile } from '../types';

const BASE_URL = (import.meta as unknown as { env?: { VITE_API_URL?: string } }).env?.VITE_API_URL || '';
export const ADMIN_TOKEN_STORAGE_KEY = 'soldx_admin_token_v5';

export interface AuthResult {
  success: boolean;
  user?: UserProfile;
  adminToken?: string;
  error?: string;
}

export interface AdminVerifyResult {
  success: boolean;
  adminToken?: string;
  user?: UserProfile;
  error?: string;
}

export function getStoredAdminToken(): string | null {
  if (typeof window === 'undefined') return null;
  return (
    localStorage.getItem(ADMIN_TOKEN_STORAGE_KEY) ||
    sessionStorage.getItem(ADMIN_TOKEN_STORAGE_KEY) ||
    null
  );
}

export function saveAdminToken(token: string): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(ADMIN_TOKEN_STORAGE_KEY, token);
    sessionStorage.setItem(ADMIN_TOKEN_STORAGE_KEY, token);
  } catch {
    // ignore storage errors
  }
}

export function clearAdminToken(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(ADMIN_TOKEN_STORAGE_KEY);
    localStorage.removeItem('soldx_admin_token_v4');
    sessionStorage.removeItem(ADMIN_TOKEN_STORAGE_KEY);
    sessionStorage.removeItem('soldx_admin_token_v4');
    sessionStorage.removeItem('soldx_admin_unlocked_v4');
    sessionStorage.removeItem('soldx_admin_unlocked_v3');
    sessionStorage.removeItem('oldx_admin_unlocked');
  } catch {
    // ignore storage errors
  }
}

function getAdminHeaders(extra?: Record<string, string>): Record<string, string> {
  const headers: Record<string, string> = { ...(extra || {}) };
  const token = getStoredAdminToken();
  if (token) {
    headers['x-admin-token'] = token;
  }
  return headers;
}

const ADMIN_OWNER_EMAIL = 'sonuvarma891@gmail.com';
const LOCAL_USERS_KEY = 'soldx_registered_users_v1';

interface StoredLocalUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  password: string;
  city: string;
  state: string;
  avatar: string;
  memberSince: string;
}

function getLocalRegisteredUsers(): StoredLocalUser[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(LOCAL_USERS_KEY);
    return raw ? (JSON.parse(raw) as StoredLocalUser[]) : [];
  } catch {
    return [];
  }
}

function saveLocalRegisteredUsers(users: StoredLocalUser[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users));
  } catch {
    // ignore storage errors
  }
}

function localStaticLoginFallback(params: { identifier: string; password: string }): AuthResult {
  const raw = (params.identifier || '').trim();
  const cleanPass = (params.password || '').trim();
  if (!raw) {
    return { success: false, error: 'Kirpya apna Email ID ya 10-digit Mobile Number enter karein.' };
  }
  if (cleanPass.length < 4) {
    return { success: false, error: 'Kirpya kam se kam 4 characters ka Password enter karein.' };
  }

  let isEmail = false;
  let normalizedEmail = '';
  let digits10 = '';

  if (raw.includes('@')) {
    isEmail = true;
    normalizedEmail = raw.toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      return { success: false, error: 'Kirpya sahi Email ID enter karein (e.g. name@gmail.com).' };
    }
  } else {
    digits10 = raw
      .replace(/\D/g, '')
      .replace(/^91(\d{10})$/, '$1')
      .replace(/^0(\d{10})$/, '$1');
    if (!/^[6-9]\d{9}$/.test(digits10)) {
      return { success: false, error: 'Kirpya valid Email ID ya 10-digit Indian Mobile Number enter karein.' };
    }
  }

  const isOwnerAdmin = isEmail && normalizedEmail === ADMIN_OWNER_EMAIL;
  const users = getLocalRegisteredUsers();
  const matched = users.find(u =>
    isEmail ? u.email.toLowerCase() === normalizedEmail : u.phone.replace(/\D/g, '').endsWith(digits10)
  );

  if (matched && matched.password !== cleanPass) {
    return { success: false, error: 'Galat Password! Kirpya sahi password enter karein.' };
  }

  const formattedPhone = digits10 ? `+91 ${digits10.slice(0, 5)} ${digits10.slice(5)}` : matched?.phone || '';
  const displayName = isOwnerAdmin
    ? 'Sonu Varma'
    : matched?.name || (isEmail ? normalizedEmail.split('@')[0] : `SOLDX User ${digits10.slice(-4)}`);

  const userProfile: UserProfile = {
    id: isOwnerAdmin ? 'usr-sonu-891' : matched?.id || `usr-${Date.now().toString().slice(-6)}`,
    name: displayName,
    email: isOwnerAdmin ? ADMIN_OWNER_EMAIL : isEmail ? normalizedEmail : matched?.email || '',
    phone: isOwnerAdmin ? '+91 98200 12345' : formattedPhone,
    avatar: isOwnerAdmin
      ? 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80'
      : matched?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(displayName)}`,
    memberSince: matched?.memberSince || new Date().toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }),
    verified: true,
    city: isOwnerAdmin ? 'Mumbai' : matched?.city || 'Delhi',
    state: isOwnerAdmin ? 'Maharashtra' : matched?.state || 'Delhi (NCT)',
    role: isOwnerAdmin ? 'admin' : 'user',
  };

  if (isOwnerAdmin) {
    return {
      success: true,
      user: userProfile,
      adminToken: `static.${Date.now() + 7 * 24 * 60 * 60 * 1000}`,
    };
  }
  return { success: true, user: userProfile };
}

function localStaticSignupFallback(params: {
  name: string;
  email?: string;
  phone?: string;
  password: string;
  city?: string;
  state?: string;
}): AuthResult {
  const cleanName = (params.name || '').trim();
  const cleanEmail = (params.email || '').trim().toLowerCase();
  const cleanPhoneRaw = (params.phone || '').trim();
  const cleanPass = (params.password || '').trim();

  if (!cleanName) {
    return { success: false, error: 'Kirpya apna poora naam enter karein.' };
  }
  if (!cleanEmail && !cleanPhoneRaw) {
    return { success: false, error: 'Kirpya Email ID ya Mobile Number enter karein.' };
  }
  if (cleanPass.length < 4) {
    return { success: false, error: 'Kirpya kam se kam 4 characters ka Password banayein.' };
  }
  if (cleanEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
    return { success: false, error: 'Kirpya valid Email ID enter karein.' };
  }

  let digits10 = '';
  if (cleanPhoneRaw) {
    digits10 = cleanPhoneRaw
      .replace(/\D/g, '')
      .replace(/^91(\d{10})$/, '$1')
      .replace(/^0(\d{10})$/, '$1');
    if (!/^[6-9]\d{9}$/.test(digits10)) {
      return { success: false, error: 'Kirpya valid 10-digit Mobile Number enter karein.' };
    }
  }

  const formattedPhone = digits10 ? `+91 ${digits10.slice(0, 5)} ${digits10.slice(5)}` : '';
  const isOwnerAdmin = cleanEmail === ADMIN_OWNER_EMAIL;
  const memberSince = new Date().toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
  const avatar = isOwnerAdmin
    ? 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80'
    : `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(cleanName)}`;
  const id = isOwnerAdmin ? 'usr-sonu-891' : `usr-${Date.now().toString().slice(-6)}`;
  const city = (params.city || '').trim() || 'Delhi';
  const state = (params.state || '').trim() || 'India';

  const users = getLocalRegisteredUsers().filter(
    u => !(cleanEmail && u.email === cleanEmail) && !(digits10 && u.phone.replace(/\D/g, '').endsWith(digits10))
  );
  users.push({
    id,
    name: cleanName,
    email: cleanEmail,
    phone: formattedPhone,
    password: cleanPass,
    city,
    state,
    avatar,
    memberSince,
  });
  saveLocalRegisteredUsers(users);

  const userProfile: UserProfile = {
    id,
    name: isOwnerAdmin ? 'Sonu Varma' : cleanName,
    email: isOwnerAdmin ? ADMIN_OWNER_EMAIL : cleanEmail,
    phone: formattedPhone,
    avatar,
    memberSince,
    verified: true,
    city,
    state,
    role: isOwnerAdmin ? 'admin' : 'user',
  };

  if (isOwnerAdmin) {
    return {
      success: true,
      user: userProfile,
      adminToken: `static.${Date.now() + 7 * 24 * 60 * 60 * 1000}`,
    };
  }
  return { success: true, user: userProfile };
}

export const api = {
  // Direct Email or Mobile + Password Login (No OTP)
  async loginWithPassword(params: {
    identifier: string;
    password: string;
  }): Promise<AuthResult> {
    try {
      const res = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        return await res.json();
      }
      return localStaticLoginFallback(params);
    } catch {
      return localStaticLoginFallback(params);
    }
  },

  async signupWithPassword(params: {
    name: string;
    email?: string;
    phone?: string;
    password: string;
    city?: string;
    state?: string;
  }): Promise<AuthResult> {
    try {
      const res = await fetch(`${BASE_URL}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        return await res.json();
      }
      return localStaticSignupFallback(params);
    } catch {
      return localStaticSignupFallback(params);
    }
  },

  // Health & Server Status
  async getHealth() {
    try {
      const res = await fetch(`${BASE_URL}/api/health`);
      if (!res.ok) throw new Error('Health check failed');
      return await res.json();
    } catch {
      return { status: 'offline', server: 'Local Browser Mode' };
    }
  },

  // Analytics Stats (Admin Protected)
  async getStats(): Promise<PlatformStats | null> {
    try {
      const res = await fetch(`${BASE_URL}/api/stats`, {
        headers: getAdminHeaders(),
      });
      if (!res.ok) throw new Error('Failed to fetch stats');
      return await res.json();
    } catch {
      return null;
    }
  },

  // Site Settings
  async getSettings(): Promise<SiteSettings | null> {
    try {
      const res = await fetch(`${BASE_URL}/api/settings`);
      if (!res.ok) throw new Error('Failed to fetch settings');
      return await res.json();
    } catch {
      return null;
    }
  },

  async updateSettings(
    settings: Partial<SiteSettings> & { newAdminPassword?: string }
  ): Promise<SiteSettings | null> {
    try {
      const res = await fetch(`${BASE_URL}/api/settings`, {
        method: 'PUT',
        headers: getAdminHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(settings),
      });
      if (!res.ok) throw new Error('Failed to update settings');
      const data = await res.json();
      return data.settings;
    } catch {
      return null;
    }
  },

  // Listings CRUD
  async getListings(params?: {
    status?: string;
    category?: string;
    city?: string;
    state?: string;
    search?: string;
  }): Promise<Listing[] | null> {
    try {
      const query = new URLSearchParams();
      if (params?.status) query.set('status', params.status);
      if (params?.category) query.set('category', params.category);
      if (params?.city) query.set('city', params.city);
      if (params?.state) query.set('state', params.state);
      if (params?.search) query.set('search', params.search);

      const res = await fetch(`${BASE_URL}/api/listings?${query.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch listings');
      const contentType = res.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) return null;
      return await res.json();
    } catch {
      return null;
    }
  },

  async createListing(listing: Partial<Listing>): Promise<Listing | null> {
    try {
      const res = await fetch(`${BASE_URL}/api/listings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(listing),
      });
      if (!res.ok) throw new Error('Failed to create listing');
      const data = await res.json();
      return data.listing;
    } catch {
      return null;
    }
  },

  async updateListing(id: string, updates: Partial<Listing>): Promise<Listing | null> {
    try {
      const res = await fetch(`${BASE_URL}/api/listings/${id}`, {
        method: 'PUT',
        headers: getAdminHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(updates),
      });
      if (!res.ok) throw new Error('Failed to update listing');
      const data = await res.json();
      return data.listing;
    } catch {
      return null;
    }
  },

  async moderateListing(
    id: string,
    action: 'approve' | 'reject' | 'toggle_featured' | 'toggle_urgent',
    reason?: string
  ): Promise<Listing | null> {
    try {
      const res = await fetch(`${BASE_URL}/api/listings/${id}/action`, {
        method: 'POST',
        headers: getAdminHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ action, reason }),
      });
      if (!res.ok) throw new Error('Failed to moderate listing');
      const data = await res.json();
      return data.listing;
    } catch {
      return null;
    }
  },

  async deleteListing(id: string): Promise<boolean> {
    try {
      const res = await fetch(`${BASE_URL}/api/listings/${id}`, {
        method: 'DELETE',
        headers: getAdminHeaders(),
      });
      return res.ok;
    } catch {
      return false;
    }
  },

  // Categories CRUD
  async getCategories(): Promise<CategoryInfo[] | null> {
    try {
      const res = await fetch(`${BASE_URL}/api/categories`);
      if (!res.ok) throw new Error('Failed to fetch categories');
      const contentType = res.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) return null;
      return await res.json();
    } catch {
      return null;
    }
  },

  async addCategory(category: Partial<CategoryInfo>): Promise<CategoryInfo | null> {
    try {
      const res = await fetch(`${BASE_URL}/api/categories`, {
        method: 'POST',
        headers: getAdminHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(category),
      });
      if (!res.ok) throw new Error('Failed to create category');
      const data = await res.json();
      return data.category;
    } catch {
      return null;
    }
  },

  async addSubcategory(categoryId: string, subcategory: string): Promise<CategoryInfo | null> {
    try {
      const res = await fetch(`${BASE_URL}/api/categories/${categoryId}/subcategories`, {
        method: 'POST',
        headers: getAdminHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ subcategory }),
      });
      if (!res.ok) throw new Error('Failed to add subcategory');
      const data = await res.json();
      return data.category;
    } catch {
      return null;
    }
  },

  async deleteCategory(id: string): Promise<boolean> {
    try {
      const res = await fetch(`${BASE_URL}/api/categories/${id}`, {
        method: 'DELETE',
        headers: getAdminHeaders(),
      });
      return res.ok;
    } catch {
      return false;
    }
  },

  // Users Management (Admin Protected)
  async getUsers(): Promise<AdminUser[] | null> {
    try {
      const res = await fetch(`${BASE_URL}/api/users`, {
        headers: getAdminHeaders(),
      });
      if (!res.ok) throw new Error('Failed to fetch users');
      const contentType = res.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) return null;
      return await res.json();
    } catch {
      return null;
    }
  },

  async updateUser(id: string, updates: Partial<AdminUser>): Promise<AdminUser | null> {
    try {
      const res = await fetch(`${BASE_URL}/api/users/${id}`, {
        method: 'PUT',
        headers: getAdminHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(updates),
      });
      if (!res.ok) throw new Error('Failed to update user');
      const data = await res.json();
      return data.user;
    } catch {
      return null;
    }
  },

  // Backup & Reset (Admin Protected)
  async resetDatabase(): Promise<boolean> {
    try {
      const res = await fetch(`${BASE_URL}/api/reset`, {
        method: 'POST',
        headers: getAdminHeaders(),
      });
      return res.ok;
    } catch {
      return false;
    }
  },

  // Strict Admin Owner Email + Master PIN Verification
  async verifyAdminPin(pin: string, email: string): Promise<AdminVerifyResult> {
    const fallbackPinCheck = (): AdminVerifyResult => {
      const normalizedEmail = (email || '').trim().toLowerCase();
      if (normalizedEmail !== ADMIN_OWNER_EMAIL) {
        return {
          success: false,
          error: 'Access Denied: Ye Email Address Admin Portal ke liye authorized nahi hai.',
        };
      }
      if ((pin || '').trim() === '891000') {
        return {
          success: true,
          adminToken: `static.${Date.now() + 7 * 24 * 60 * 60 * 1000}`,
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
        };
      }
      return { success: false, error: 'Incorrect Admin Master PIN. Access Denied.' };
    };

    try {
      const res = await fetch(`${BASE_URL}/api/admin/verify-pin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin, email }),
      });
      const contentType = res.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        return fallbackPinCheck();
      }
      return await res.json();
    } catch {
      return fallbackPinCheck();
    }
  },
};

export interface FileDownloadResult {
  success: boolean;
  sizeBytes?: number;
  error?: string;
}

let cachedZipBlob: Blob | null = null;

export async function downloadBinaryFile(
  endpoint: string,
  filename: string,
  options?: {
    requireZipMagic?: boolean;
    useAdminHeaders?: boolean;
    mimeType?: string;
  }
): Promise<FileDownloadResult> {
  try {
    const sep = endpoint.includes('?') ? '&' : '?';
    const url = `${BASE_URL}${endpoint}${sep}_ts=${Date.now()}`;
    const headers = options?.useAdminHeaders ? getAdminHeaders() : {};
    const res = await fetch(url, {
      method: 'GET',
      headers,
      cache: 'no-store',
    });

    if (!res.ok) {
      return {
        success: false,
        error: `Download server error (${res.status}).`,
      };
    }

    const buf = await res.arrayBuffer();
    const bytes = new Uint8Array(buf);

    if (bytes.length === 0) {
      return { success: false, error: 'Empty file received from server.' };
    }

    if (options?.requireZipMagic) {
      if (bytes.length < 22 || bytes[0] !== 0x50 || bytes[1] !== 0x4b) {
        return {
          success: false,
          error: 'Valid ZIP archive nahi mili. Kirpya Direct Link copy karke Chrome tab me kholein.',
        };
      }
    }

    const mimeType = options?.mimeType || (options?.requireZipMagic ? 'application/zip' : 'application/octet-stream');
    const blob = new Blob([buf], { type: mimeType });
    if (filename === 'soldx-github-update.zip') {
      cachedZipBlob = blob;
    }

    const blobUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = filename;
    link.rel = 'noopener';
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();

    // Keep object URL alive for 45 seconds so Android Chrome's async download manager completes reading
    window.setTimeout(() => {
      if (link.parentNode) {
        link.parentNode.removeChild(link);
      }
      window.URL.revokeObjectURL(blobUrl);
    }, 45000);

    return {
      success: true,
      sizeBytes: bytes.length,
    };
  } catch {
    return {
      success: false,
      error: 'Network ya browser restriction ki wajah se download ruka. Neeche Direct Link copy karke Chrome me kholein.',
    };
  }
}

export async function shareProjectZipOnMobile(
  filename = 'soldx-github-update.zip'
): Promise<FileDownloadResult> {
  try {
    let blob = cachedZipBlob;
    if (!blob) {
      const res = await fetch(`${BASE_URL}/api/download-zip?_ts=${Date.now()}`, {
        method: 'GET',
        cache: 'no-store',
      });
      if (!res.ok) {
        return { success: false, error: `Server error (${res.status})` };
      }
      const buf = await res.arrayBuffer();
      const bytes = new Uint8Array(buf);
      if (bytes.length < 22 || bytes[0] !== 0x50 || bytes[1] !== 0x4b) {
        return { success: false, error: 'Valid ZIP archive nahi mili.' };
      }
      blob = new Blob([buf], { type: 'application/zip' });
      cachedZipBlob = blob;
    }

    const file = new File([blob], filename, { type: 'application/zip' });
    const nav = navigator as Navigator & {
      canShare?: (data?: ShareData) => boolean;
    };

    if (typeof nav.share === 'function' && (!nav.canShare || nav.canShare({ files: [file] }))) {
      await nav.share({
        files: [file],
        title: 'SOLDX GitHub Source Code ZIP',
        text: 'SOLDX Marketplace GitHub Update Source Code (.zip)',
      });
      return { success: true, sizeBytes: blob.size };
    }

    return {
      success: false,
      error: 'Is browser preview me Share Sheet supported nahi hai — neeche Copy Direct Link button use karein.',
    };
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      return { success: false, error: 'Share cancel kar diya gaya.' };
    }
    return {
      success: false,
      error: 'Preview frame me Share restricted hai — neeche Copy Direct Link button use karke Chrome tab me paste karein.',
    };
  }
}

