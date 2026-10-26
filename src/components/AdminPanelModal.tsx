import React, { useState, useEffect } from 'react';
import { 
  X, 
  ShieldCheck, 
  Layers, 
  Users, 
  Settings, 
  Database, 
  BarChart3, 
  CheckCircle, 
  XCircle, 
  Trash2, 
  Star, 
  Flame, 
  Search, 
  RefreshCw, 
  Plus, 
  AlertTriangle, 
  Download, 
  Upload, 
  Sliders, 
  Check, 
  ExternalLink,
  ShieldAlert,
  Server,
  DollarSign,
  Megaphone,
  Eye,
  EyeOff,
  Lock,
  KeyRound,
  Activity
} from 'lucide-react';
import { Listing, CategoryInfo, AdminUser, SiteSettings, PlatformStats, UserProfile } from '../types';
import { api, getStoredAdminToken, saveAdminToken, downloadBinaryFile } from '../utils/api';

const AUTHORIZED_ADMIN_EMAIL = 'sonuvarma891@gmail.com';

interface AdminPanelModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser?: UserProfile | null;
  onAdminAuthenticated?: (adminUser: UserProfile) => void;
  listings: Listing[];
  onUpdateListings: (updated: Listing[]) => void;
  categories: CategoryInfo[];
  onUpdateCategories: (updated: CategoryInfo[]) => void;
  siteSettings: SiteSettings;
  onUpdateSettings: (settings: SiteSettings) => void;
  onOpenZipModal?: () => void;
}

export const AdminPanelModal: React.FC<AdminPanelModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onAdminAuthenticated,
  listings,
  onUpdateListings,
  categories,
  onUpdateCategories,
  siteSettings,
  onUpdateSettings,
  onOpenZipModal,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'listings' | 'users' | 'categories' | 'settings' | 'backup'>('overview');
  const [downloadingZipType, setDownloadingZipType] = useState<'github' | 'cloudflare' | 'json' | null>(null);
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [serverStatus, setServerStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const [notification, setNotification] = useState<string | null>(null);

  const isAuthorizedOwner =
    Boolean(currentUser) && currentUser?.email?.trim().toLowerCase() === AUTHORIZED_ADMIN_EMAIL;

  // Automatically unlocked when sonuvarma891@gmail.com has a valid admin session token from Login
  const [isUnlocked, setIsUnlocked] = useState<boolean>(() => Boolean(getStoredAdminToken()));
  const [enteredPin, setEnteredPin] = useState('');
  const [pinError, setPinError] = useState('');
  const [verifyingPin, setVerifyingPin] = useState(false);
  const [showPin, setShowPin] = useState(false);
  const [newMasterPin, setNewMasterPin] = useState('');
  const [showNewMasterPin, setShowNewMasterPin] = useState(false);
  const [confirmResetPending, setConfirmResetPending] = useState(false);

  // Listing moderation filter & search
  const [searchListing, setSearchListing] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'pending' | 'rejected' | 'featured'>('all');

  // Category creation form
  const [newCatName, setNewCatName] = useState('');
  const [newCatIcon, setNewCatIcon] = useState('Package');
  const [newSubcatInput, setNewSubcatInput] = useState<{ [catId: string]: string }>({});

  // Settings edit form
  const [settingsForm, setSettingsForm] = useState<SiteSettings>(siteSettings);

  useEffect(() => {
    setSettingsForm(siteSettings);
  }, [siteSettings]);

  useEffect(() => {
    if (isOpen && isAuthorizedOwner && getStoredAdminToken()) {
      setIsUnlocked(true);
    }
  }, [isOpen, isAuthorizedOwner]);

  // Load backend stats, health & users
  const refreshData = async () => {
    setLoading(true);
    try {
      const health = await api.getHealth();
      setServerStatus(health.status === 'online' ? 'online' : 'offline');

      const statsData = await api.getStats();
      if (statsData) setStats(statsData);

      const usersData = await api.getUsers();
      if (usersData) setUsers(usersData);
    } catch {
      setServerStatus('offline');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && isAuthorizedOwner && isUnlocked) {
      refreshData();
    }
  }, [isOpen, isAuthorizedOwner, isUnlocked]);

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  const handleVerifyPin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setPinError('');
    if (!enteredPin.trim()) {
      setPinError('Kirpya apna Admin Password enter karein.');
      return;
    }
    setVerifyingPin(true);
    try {
      const res = await api.loginWithPassword({
        identifier: AUTHORIZED_ADMIN_EMAIL,
        password: enteredPin.trim(),
      });
      if (res.success && res.adminToken) {
        saveAdminToken(res.adminToken);
        setIsUnlocked(true);
        setEnteredPin('');
        if (res.user && onAdminAuthenticated) {
          onAdminAuthenticated(res.user);
        }
        showToast('Admin Panel Ready!');
        refreshData();
      } else {
        setPinError(res.error || 'Galat Admin Password!');
      }
    } catch {
      setPinError('Server se connect nahi ho paya. Dubara koshish karein.');
    } finally {
      setVerifyingPin(false);
    }
  };

  // Strictly block rendering if closed or if logged-in user is NOT sonuvarma891@gmail.com
  if (!isOpen || !isAuthorizedOwner) return null;

  // Listing Actions
  const handleApproveAd = async (id: string) => {
    await api.moderateListing(id, 'approve');
    const newListings = listings.map(l => (l.id === id ? { ...l, status: 'active' as const } : l));
    onUpdateListings(newListings);
    showToast('Listing Approved & Published Live!');
  };

  const handleRejectAd = async (id: string) => {
    const reason = 'Rejected by administrator';
    await api.moderateListing(id, 'reject', reason);
    const newListings = listings.map(l =>
      l.id === id ? { ...l, status: 'rejected' as const, moderationReason: reason } : l
    );
    onUpdateListings(newListings);
    showToast('Listing marked as Rejected.');
  };

  const handleToggleFeatured = async (id: string) => {
    const item = listings.find(l => l.id === id);
    const nextFeatured = !item?.featured;
    await api.moderateListing(id, 'toggle_featured');
    const newListings = listings.map(l => (l.id === id ? { ...l, featured: nextFeatured } : l));
    onUpdateListings(newListings);
    showToast(nextFeatured ? 'Promoted to Featured Ads!' : 'Removed from Featured Ads.');
  };

  const handleToggleUrgent = async (id: string) => {
    const item = listings.find(l => l.id === id);
    const nextUrgent = !item?.urgent;
    await api.moderateListing(id, 'toggle_urgent');
    const newListings = listings.map(l => (l.id === id ? { ...l, urgent: nextUrgent } : l));
    onUpdateListings(newListings);
    showToast(nextUrgent ? 'Marked as Urgent Ad!' : 'Removed Urgent badge.');
  };

  const handleDeleteListing = async (id: string) => {
    await api.deleteListing(id);
    const newListings = listings.filter(l => l.id !== id);
    onUpdateListings(newListings);
    showToast('Listing permanently deleted.');
  };

  // User Actions
  const handleToggleUserBan = async (user: AdminUser) => {
    const nextStatus = user.status === 'active' ? 'banned' : 'active';
    await api.updateUser(user.id, { status: nextStatus });
    setUsers(users.map(u => u.id === user.id ? { ...u, status: nextStatus } : u));
    showToast(nextStatus === 'banned' ? `User ${user.name} has been banned.` : `User ${user.name} unbanned.`);
  };

  const handleToggleUserVerified = async (user: AdminUser) => {
    const nextVerified = !user.verified;
    await api.updateUser(user.id, { verified: nextVerified });
    setUsers(users.map(u => u.id === user.id ? { ...u, verified: nextVerified } : u));
    showToast(nextVerified ? `Verified Seller badge granted to ${user.name}.` : 'Verified badge revoked.');
  };

  // Category Actions
  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    const catId = newCatName.toLowerCase().replace(/[^a-z0-9]/g, '_');
    const newCat: CategoryInfo = {
      id: catId,
      name: newCatName.trim(),
      iconName: newCatIcon,
      color: 'bg-teal-50 text-teal-800 border-teal-200',
      subcategories: ['General'],
      popularAttributes: ['Brand', 'Condition', 'Price'],
      description: `Browse all ${newCatName.trim()} on SOLDX`,
    };

    await api.addCategory(newCat);
    onUpdateCategories([...categories, newCat]);
    setNewCatName('');
    showToast(`New category "${newCat.name}" created!`);
  };

  const handleAddSubcategory = async (catId: string) => {
    const subName = newSubcatInput[catId]?.trim();
    if (!subName) return;

    await api.addSubcategory(catId, subName);
    const updated = categories.map(cat => {
      if (cat.id === catId && !cat.subcategories.includes(subName)) {
        return { ...cat, subcategories: [...cat.subcategories, subName] };
      }
      return cat;
    });
    onUpdateCategories(updated);
    setNewSubcatInput({ ...newSubcatInput, [catId]: '' });
    showToast(`Added "${subName}" subcategory.`);
  };

  const handleDeleteCategory = async (catId: string) => {
    await api.deleteCategory(catId);
    onUpdateCategories(categories.filter(c => c.id !== catId));
    showToast('Category deleted.');
  };

  // Settings Save
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload: SiteSettings & { newAdminPassword?: string } = { ...settingsForm };
    if (newMasterPin.trim().length >= 4) {
      payload.newAdminPassword = newMasterPin.trim();
      payload.adminPin = newMasterPin.trim();
    } else {
      delete payload.adminPin;
    }
    await api.updateSettings(payload);
    const sanitized = { ...settingsForm };
    delete sanitized.adminPin;
    onUpdateSettings(sanitized);
    setNewMasterPin('');
    showToast('Site settings & Admin configuration updated!');
  };

  const handleDownloadSourceZip = async () => {
    setDownloadingZipType('github');
    const res = await downloadBinaryFile('/api/download-zip', 'soldx-github-update.zip', {
      requireZipMagic: true,
      mimeType: 'application/zip',
    });
    setDownloadingZipType(null);
    if (res.success) {
      showToast('soldx-github-update.zip download shuru ho gayi hai!');
    } else if (onOpenZipModal) {
      onOpenZipModal();
    } else {
      showToast(res.error || 'Download failed.');
    }
  };

  const handleDownloadCloudflareZip = async () => {
    setDownloadingZipType('cloudflare');
    showToast('Building ready-to-upload Cloudflare ZIP...');
    const res = await downloadBinaryFile(
      '/api/download-cloudflare-zip',
      'soldx-cloudflare-direct.zip',
      {
        requireZipMagic: true,
        useAdminHeaders: true,
        mimeType: 'application/zip',
      }
    );
    setDownloadingZipType(null);
    if (res.success) {
      showToast('soldx-cloudflare-direct.zip downloaded!');
    } else {
      showToast(res.error || 'Failed to build Cloudflare ZIP.');
    }
  };

  const handleDownloadBackupJson = async () => {
    setDownloadingZipType('json');
    const res = await downloadBinaryFile('/api/export', 'soldx_backup.json', {
      useAdminHeaders: true,
      mimeType: 'application/json',
    });
    setDownloadingZipType(null);
    if (res.success) {
      showToast('soldx_backup.json downloaded!');
    } else {
      showToast(res.error || 'Failed to export backup JSON.');
    }
  };

  // Filtered listings
  const filteredListings = listings.filter(l => {
    const matchesSearch = l.title.toLowerCase().includes(searchListing.toLowerCase()) || 
                          l.seller.name.toLowerCase().includes(searchListing.toLowerCase()) ||
                          l.category.toLowerCase().includes(searchListing.toLowerCase());
    if (!matchesSearch) return false;

    if (statusFilter === 'active') return (l.status || 'active') === 'active';
    if (statusFilter === 'pending') return l.status === 'pending';
    if (statusFilter === 'rejected') return l.status === 'rejected';
    if (statusFilter === 'featured') return !!l.featured;
    return true;
  });

  // Fallback password re-confirmation ONLY if owner's stored adminToken expired
  if (!isUnlocked) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in">
        <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-slate-200">
          <div className="bg-[#002f34] text-white px-5 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-teal-500/20 border border-teal-400/30 flex items-center justify-center text-[#23e5db]">
                <Lock className="w-4 h-4" />
              </div>
              <span className="font-bold text-sm tracking-wide">Confirm Owner Password</span>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-6">
            <form onSubmit={handleVerifyPin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Owner Account
                </label>
                <input
                  type="email"
                  value={AUTHORIZED_ADMIN_EMAIL}
                  readOnly
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-100 text-slate-700 font-semibold border border-slate-200 rounded-xl outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Enter Your Password *
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type={showPin ? 'text' : 'password'}
                    value={enteredPin}
                    onChange={e => {
                      setEnteredPin(e.target.value);
                      setPinError('');
                    }}
                    placeholder="Enter password"
                    required
                    className={`w-full pl-9 pr-10 py-2.5 text-sm border rounded-xl outline-none transition-all ${
                      pinError
                        ? 'border-red-400 bg-red-50/30 focus:ring-2 focus:ring-red-200'
                        : 'border-slate-300 focus:border-[#002f34] focus:ring-2 focus:ring-teal-100'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPin(!showPin)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {pinError && (
                  <p className="text-xs text-red-600 mt-2 font-medium flex items-start gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                    <span>{pinError}</span>
                  </p>
                )}
              </div>

              <div className="pt-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={verifyingPin}
                  className="flex-1 py-2.5 bg-[#002f34] hover:bg-[#00464e] text-white text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm disabled:opacity-50"
                >
                  {verifyingPin ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <ShieldCheck className="w-3.5 h-3.5 text-[#23e5db]" />
                      <span>Open Admin Panel</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-2 sm:p-4 animate-in fade-in">
      <div className="bg-white w-full max-w-6xl h-[92vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-200">
        
        {/* Modal Top Header */}
        <div className="bg-[#002f34] text-white px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-2.5 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-teal-500/20 border border-teal-400/30 flex items-center justify-center text-teal-300 shrink-0">
              <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6 text-[#23e5db]" />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-sm sm:text-lg font-bold tracking-tight truncate">SOLDX Backend & Admin Control Center</h2>
                <span className={`text-[10px] sm:text-[11px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1.5 shrink-0 ${
                  serverStatus === 'online' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40' : 'bg-amber-500/20 text-amber-300 border border-amber-400/40'
                }`}>
                  <span className={`w-2 h-2 rounded-full ${serverStatus === 'online' ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`}></span>
                  {serverStatus === 'online' ? 'Backend Live' : 'Local Mode'}
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-300 hidden sm:block">Manage all ads, user accounts, categories, live banner & site settings</p>
            </div>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <button
              type="button"
              onClick={() => {
                void handleDownloadSourceZip();
                if (onOpenZipModal) onOpenZipModal();
              }}
              disabled={downloadingZipType === 'github'}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#23e5db] text-[#002f34] hover:bg-[#1fd1c8] rounded-lg text-xs font-extrabold transition-colors cursor-pointer shadow-xs disabled:opacity-60"
              title="Download Full Source Code ZIP for GitHub & Cloudflare"
            >
              {downloadingZipType === 'github' ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Download className="w-3.5 h-3.5" />
              )}
              <span>Download GitHub ZIP</span>
            </button>
            <button
              onClick={refreshData}
              disabled={loading}
              className="p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
              title="Refresh Data"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Toast alert */}
        {notification && (
          <div className="bg-emerald-600 text-white text-xs font-semibold px-4 py-2.5 flex items-center justify-between transition-all">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              <span>{notification}</span>
            </div>
            <button onClick={() => setNotification(null)} className="text-white/80 hover:text-white">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="bg-slate-100 border-b border-slate-200 px-4 sm:px-6 flex items-center gap-1 sm:gap-2 overflow-x-auto shrink-0 scrollbar-none py-1.5">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer ${
              activeTab === 'overview' ? 'bg-[#002f34] text-white shadow-xs' : 'text-slate-600 hover:bg-slate-200/80 hover:text-slate-900'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Overview & Stats</span>
          </button>

          <button
            onClick={() => setActiveTab('listings')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer ${
              activeTab === 'listings' ? 'bg-[#002f34] text-white shadow-xs' : 'text-slate-600 hover:bg-slate-200/80 hover:text-slate-900'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Ad Moderation & Listings ({listings.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('users')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer ${
              activeTab === 'users' ? 'bg-[#002f34] text-white shadow-xs' : 'text-slate-600 hover:bg-slate-200/80 hover:text-slate-900'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>User & Seller Accounts</span>
          </button>

          <button
            onClick={() => setActiveTab('categories')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer ${
              activeTab === 'categories' ? 'bg-[#002f34] text-white shadow-xs' : 'text-slate-600 hover:bg-slate-200/80 hover:text-slate-900'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Categories & Subcategories</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer ${
              activeTab === 'settings' ? 'bg-[#002f34] text-white shadow-xs' : 'text-slate-600 hover:bg-slate-200/80 hover:text-slate-900'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Live Banner & Settings</span>
          </button>

          <button
            onClick={() => setActiveTab('backup')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer ${
              activeTab === 'backup' ? 'bg-[#002f34] text-white shadow-xs' : 'text-slate-600 hover:bg-slate-200/80 hover:text-slate-900'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>Database Backup</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50/50">
          
          {/* TAB 1: OVERVIEW & STATS */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Stat Cards Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                  <div className="flex items-center justify-between text-slate-500 mb-1">
                    <span className="text-xs font-semibold">Total Advertisements</span>
                    <Layers className="w-4 h-4 text-teal-600" />
                  </div>
                  <div className="text-2xl font-black text-slate-900">{listings.length}</div>
                  <div className="text-[11px] text-emerald-600 font-medium mt-1">
                    {listings.filter(l => (l.status || 'active') === 'active').length} live on site
                  </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                  <div className="flex items-center justify-between text-slate-500 mb-1">
                    <span className="text-xs font-semibold">Pending Approval</span>
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                  </div>
                  <div className="text-2xl font-black text-slate-900">
                    {listings.filter(l => l.status === 'pending').length}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">Awaiting moderation</div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                  <div className="flex items-center justify-between text-slate-500 mb-1">
                    <span className="text-xs font-semibold">Featured VIP Ads</span>
                    <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
                  </div>
                  <div className="text-2xl font-black text-slate-900">
                    {listings.filter(l => l.featured).length}
                  </div>
                  <div className="text-[11px] text-amber-700 font-medium mt-1">Promoted listings</div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                  <div className="flex items-center justify-between text-slate-500 mb-1">
                    <span className="text-xs font-semibold">Categories</span>
                    <Sliders className="w-4 h-4 text-indigo-600" />
                  </div>
                  <div className="text-2xl font-black text-slate-900">{categories.length}</div>
                  <div className="text-[11px] text-slate-500 mt-1">
                    {categories.reduce((acc, c) => acc + (c.subcategories?.length || 0), 0)} subcategories
                  </div>
                </div>
              </div>

              {/* Server Engine Status Card */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Server className="w-5 h-5 text-[#002f34]" />
                    <h3 className="text-sm font-bold text-slate-900">Backend Server Information</h3>
                  </div>
                  <span className="text-xs font-bold px-2.5 py-1 bg-teal-50 text-teal-800 rounded-md border border-teal-200">
                    Node.js + Express + Vite
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <span className="text-slate-500 block">HTTP REST API Port</span>
                    <span className="font-bold text-slate-900 text-sm">3000 (0.0.0.0:3000)</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <span className="text-slate-500 block">Database Storage Engine</span>
                    <span className="font-bold text-slate-900 text-sm">Persistent File Storage (`backend_data.json`)</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <span className="text-slate-500 block">Ad Approval Policy</span>
                    <span className="font-bold text-slate-900 text-sm">
                      {siteSettings.requireAdApproval ? 'Strict (Admin Review Required)' : 'Instant (Immediate Live Posting)'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-gradient-to-r from-[#002f34] to-[#004f57] text-white p-5 rounded-xl shadow-xs">
                <h3 className="text-sm font-bold mb-2 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-[#23e5db]" />
                  <span>Administrative Control Actions</span>
                </h3>
                <p className="text-xs text-slate-200 mb-4">
                  Quickly manage site operations, purge flagged items, or broadcast notices to all site visitors.
                </p>
                <div className="flex flex-wrap gap-2.5">
                  <button
                    onClick={() => setActiveTab('listings')}
                    className="px-3 py-1.5 bg-white text-[#002f34] font-bold text-xs rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    Review All Ads
                  </button>
                  <button
                    onClick={() => setActiveTab('settings')}
                    className="px-3 py-1.5 bg-teal-500 text-white font-bold text-xs rounded-lg hover:bg-teal-600 transition-colors cursor-pointer"
                  >
                    Edit Announcement Banner
                  </button>
                  <button
                    onClick={() => setActiveTab('categories')}
                    className="px-3 py-1.5 bg-white/10 text-white font-bold text-xs rounded-lg hover:bg-white/20 transition-colors cursor-pointer"
                  >
                    Add New Category
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: AD MODERATION & LISTINGS */}
          {activeTab === 'listings' && (
            <div className="space-y-4">
              {/* Filter and Search Bar */}
              <div className="flex flex-col sm:flex-row gap-2.5 justify-between bg-white p-3.5 rounded-xl border border-slate-200">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={searchListing}
                    onChange={e => setSearchListing(e.target.value)}
                    placeholder="Search by Ad title, Seller name, or Category..."
                    className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg outline-none focus:border-[#002f34]"
                  />
                </div>

                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                  {(['all', 'active', 'pending', 'rejected', 'featured'] as const).map(tab => (
                    <button
                      key={tab}
                      onClick={() => setStatusFilter(tab)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer shrink-0 ${
                        statusFilter === tab 
                          ? 'bg-[#002f34] text-white' 
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>

              {/* Listings Table */}
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                      <tr>
                        <th className="p-3">Ad Details</th>
                        <th className="p-3">Category</th>
                        <th className="p-3">Price</th>
                        <th className="p-3">Seller</th>
                        <th className="p-3">Status</th>
                        <th className="p-3 text-right">Moderation Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredListings.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="p-8 text-center text-slate-400">
                            No listings match this filter criteria.
                          </td>
                        </tr>
                      ) : (
                        filteredListings.map(l => (
                          <tr key={l.id} className="hover:bg-slate-50/80 transition-colors">
                            {/* Ad Details */}
                            <td className="p-3 min-w-[220px]">
                              <div className="flex items-center gap-3">
                                <img
                                  src={l.images[0] || 'https://images.unsplash.com/photo-1581291518655-9523c932edcf?auto=format&fit=crop&w=150&q=80'}
                                  alt=""
                                  className="w-12 h-12 rounded-lg object-cover shrink-0 border border-slate-200"
                                />
                                <div>
                                  <div className="font-bold text-slate-900 line-clamp-1">{l.title}</div>
                                  <div className="text-[11px] text-slate-400 line-clamp-1">{l.location.city}, {l.location.area}</div>
                                  <div className="flex items-center gap-1 mt-1">
                                    {l.featured && (
                                      <span className="text-[9px] font-bold bg-amber-100 text-amber-800 px-1 rounded flex items-center gap-0.5">
                                        <Star className="w-2.5 h-2.5 fill-amber-500" /> Featured
                                      </span>
                                    )}
                                    {l.urgent && (
                                      <span className="text-[9px] font-bold bg-red-100 text-red-800 px-1 rounded flex items-center gap-0.5">
                                        <Flame className="w-2.5 h-2.5 fill-red-500" /> Urgent
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </td>

                            {/* Category */}
                            <td className="p-3">
                              <span className="font-medium text-slate-700 capitalize">{l.category}</span>
                              <div className="text-[10px] text-slate-400">{l.subcategory}</div>
                            </td>

                            {/* Price */}
                            <td className="p-3 font-bold text-slate-900 tabular-nums">
                              {l.category === 'dating_friendship' && l.price === 0
                                ? 'Free Connect'
                                : `${l.currency}${l.price.toLocaleString('en-IN')}`}
                            </td>

                            {/* Seller */}
                            <td className="p-3">
                              <div className="font-medium text-slate-800">{l.seller.name}</div>
                              <div className="text-[10px] text-slate-400">{l.seller.phone}</div>
                            </td>

                            {/* Status */}
                            <td className="p-3">
                              {l.status === 'pending' ? (
                                <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-100 text-amber-800 rounded-full border border-amber-300">
                                  Pending Review
                                </span>
                              ) : l.status === 'rejected' ? (
                                <span className="px-2 py-0.5 text-[10px] font-bold bg-red-100 text-red-800 rounded-full border border-red-300">
                                  Rejected
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-100 text-emerald-800 rounded-full border border-emerald-300">
                                  Live / Active
                                </span>
                              )}
                            </td>

                            {/* Actions */}
                            <td className="p-3 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                {l.status === 'pending' || l.status === 'rejected' ? (
                                  <button
                                    onClick={() => handleApproveAd(l.id)}
                                    className="p-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-md transition-colors"
                                    title="Approve & Publish"
                                  >
                                    <CheckCircle className="w-4 h-4" />
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => handleRejectAd(l.id)}
                                    className="p-1.5 bg-amber-50 text-amber-700 hover:bg-amber-100 rounded-md transition-colors"
                                    title="Reject Listing"
                                  >
                                    <XCircle className="w-4 h-4" />
                                  </button>
                                )}

                                <button
                                  onClick={() => handleToggleFeatured(l.id)}
                                  className={`p-1.5 rounded-md transition-colors ${
                                    l.featured ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                  }`}
                                  title="Toggle Featured Ad"
                                >
                                  <Star className="w-4 h-4" />
                                </button>

                                <button
                                  onClick={() => handleToggleUrgent(l.id)}
                                  className={`p-1.5 rounded-md transition-colors ${
                                    l.urgent ? 'bg-red-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                  }`}
                                  title="Toggle Urgent Tag"
                                >
                                  <Flame className="w-4 h-4" />
                                </button>

                                <button
                                  onClick={() => handleDeleteListing(l.id)}
                                  className="p-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-md transition-colors"
                                  title="Permanently Delete"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: USERS & SELLERS */}
          {activeTab === 'users' && (
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Registered Users & Sellers Directory</h3>
                  <p className="text-xs text-slate-500">Monitor seller reputation, grant official Verified badges, or ban spam accounts.</p>
                </div>
                <span className="text-xs font-bold text-teal-800 bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
                  {users.length} Total Users
                </span>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                    <tr>
                      <th className="p-3">User</th>
                      <th className="p-3">Contact Email</th>
                      <th className="p-3">Phone</th>
                      <th className="p-3">City</th>
                      <th className="p-3">Role & Verification</th>
                      <th className="p-3">Account Status</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {users.map(u => (
                      <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-3 font-bold text-slate-900">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-[#002f34] text-white flex items-center justify-center font-bold text-xs shrink-0">
                              {u.name.charAt(0)}
                            </div>
                            <span>{u.name}</span>
                          </div>
                        </td>
                        <td className="p-3 text-slate-600">{u.email}</td>
                        <td className="p-3 text-slate-600">{u.phone}</td>
                        <td className="p-3 text-slate-600">{u.city || 'India'}</td>
                        <td className="p-3">
                          <div className="flex items-center gap-1.5">
                            <span className="font-semibold capitalize text-slate-800 bg-slate-100 px-1.5 py-0.5 rounded text-[10px]">
                              {u.role}
                            </span>
                            {u.verified && (
                              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 flex items-center gap-0.5">
                                <Check className="w-3 h-3 text-emerald-600" /> Verified
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${
                            u.status === 'banned' 
                              ? 'bg-red-100 text-red-800 border-red-300' 
                              : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                          }`}>
                            {u.status === 'banned' ? 'Banned' : 'Active'}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleToggleUserVerified(u)}
                              className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors cursor-pointer ${
                                u.verified ? 'bg-amber-100 text-amber-800 hover:bg-amber-200' : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                              }`}
                            >
                              {u.verified ? 'Revoke Verified' : 'Grant Verified'}
                            </button>
                            <button
                              onClick={() => handleToggleUserBan(u)}
                              className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors cursor-pointer ${
                                u.status === 'banned' ? 'bg-emerald-600 text-white hover:bg-emerald-700' : 'bg-red-600 text-white hover:bg-red-700'
                              }`}
                            >
                              {u.status === 'banned' ? 'Unban User' : 'Ban User'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: CATEGORIES & SUBCATEGORIES */}
          {activeTab === 'categories' && (
            <div className="space-y-6">
              {/* Add New Category Form */}
              <form onSubmit={handleAddCategory} className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                <h3 className="text-sm font-bold text-slate-900 mb-2">Create New Main Category</h3>
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="text"
                    value={newCatName}
                    onChange={e => setNewCatName(e.target.value)}
                    placeholder="Category Name (e.g. Musical Instruments, Industrial Tools)..."
                    className="flex-1 px-3 py-2 text-xs border border-slate-200 rounded-lg outline-none focus:border-[#002f34]"
                  />
                  <select
                    value={newCatIcon}
                    onChange={e => setNewCatIcon(e.target.value)}
                    className="px-3 py-2 text-xs border border-slate-200 rounded-lg outline-none bg-white font-medium"
                  >
                    <option value="Package">Package (Default)</option>
                    <option value="Smartphone">Smartphone</option>
                    <option value="Car">Car</option>
                    <option value="Tv">TV / Electronics</option>
                    <option value="Armchair">Furniture</option>
                    <option value="Home">Real Estate</option>
                    <option value="Briefcase">Jobs</option>
                    <option value="Shirt">Fashion</option>
                    <option value="PawPrint">Pets</option>
                    <option value="Wrench">Services</option>
                    <option value="Heart">Heart (Dating & Friendship 18+)</option>
                  </select>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#002f34] text-white text-xs font-bold rounded-lg hover:bg-[#003d44] transition-colors flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Category</span>
                  </button>
                </div>
              </form>

              {/* Existing Categories List */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {categories.map(cat => (
                  <div key={cat.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-slate-900">{cat.name}</span>
                          <span className="text-[10px] text-slate-400 font-mono">({cat.id})</span>
                        </div>
                        <button
                          onClick={() => handleDeleteCategory(cat.id)}
                          className="p-1 text-red-500 hover:bg-red-50 rounded transition-colors"
                          title="Delete Category"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Subcategories Tags */}
                      <div className="mt-3">
                        <span className="text-[11px] font-bold text-slate-500 block mb-1.5">Subcategories:</span>
                        <div className="flex flex-wrap gap-1.5">
                          {cat.subcategories.map(sub => (
                            <span key={sub} className="text-[11px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-medium">
                              {sub}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Add Subcategory input */}
                    <div className="mt-4 pt-3 border-t border-slate-100 flex gap-2">
                      <input
                        type="text"
                        value={newSubcatInput[cat.id] || ''}
                        onChange={e => setNewSubcatInput({ ...newSubcatInput, [cat.id]: e.target.value })}
                        placeholder="Add subcategory..."
                        className="flex-1 px-2.5 py-1 text-xs border border-slate-200 rounded-md outline-none"
                      />
                      <button
                        onClick={() => handleAddSubcategory(cat.id)}
                        className="px-2.5 py-1 bg-teal-600 text-white font-bold text-xs rounded-md hover:bg-teal-700 transition-colors"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: SITE SETTINGS & ANNOUNCEMENT BANNER */}
          {activeTab === 'settings' && (
            <form onSubmit={handleSaveSettings} className="space-y-6 max-w-3xl">
              {/* Live Banner Control */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                  <Megaphone className="w-5 h-5 text-teal-600" />
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Live Announcement Notice Banner</h3>
                    <p className="text-xs text-slate-500">Show special promotions, holiday notices, or safety guidelines at the very top of SOLDX.</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settingsForm.announcementActive}
                      onChange={e => setSettingsForm({ ...settingsForm, announcementActive: e.target.checked })}
                      className="w-4 h-4 rounded text-teal-600 accent-teal-600 cursor-pointer"
                    />
                    <span className="text-xs font-bold text-slate-800">Enable Announcement Banner on Live Site</span>
                  </label>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Banner Announcement Text</label>
                  <input
                    type="text"
                    value={settingsForm.announcementText}
                    onChange={e => setSettingsForm({ ...settingsForm, announcementText: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg outline-none focus:border-[#002f34]"
                    placeholder="e.g. 🎉 Diwali Special: Free instant ad promotion on all categories!"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Banner Color / Style</label>
                  <select
                    value={settingsForm.announcementType}
                    onChange={e => setSettingsForm({ ...settingsForm, announcementType: e.target.value as any })}
                    className="w-full sm:w-60 px-3 py-1.5 text-xs border border-slate-200 rounded-lg outline-none bg-white font-medium"
                  >
                    <option value="info">Info (Teal / Blue Banner)</option>
                    <option value="warning">Warning / Alert (Amber Banner)</option>
                    <option value="success">Success / Offer (Emerald Banner)</option>
                  </select>
                </div>
              </div>

              {/* Ad Posting & Security Policies */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                  <ShieldCheck className="w-5 h-5 text-indigo-600" />
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Security & Ad Moderation Policy</h3>
                    <p className="text-xs text-slate-500">Configure how new ads are published to prevent spam.</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settingsForm.requireAdApproval}
                      onChange={e => setSettingsForm({ ...settingsForm, requireAdApproval: e.target.checked })}
                      className="w-4 h-4 rounded text-teal-600 accent-teal-600 cursor-pointer"
                    />
                    <div>
                      <span className="text-xs font-bold text-slate-800 block">Require Admin Approval before Ad goes Live</span>
                      <span className="text-[11px] text-slate-500">When checked, new ads go to Pending tab until approved.</span>
                    </div>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settingsForm.maintenanceMode}
                      onChange={e => setSettingsForm({ ...settingsForm, maintenanceMode: e.target.checked })}
                      className="w-4 h-4 rounded text-red-600 accent-red-600 cursor-pointer"
                    />
                    <div>
                      <span className="text-xs font-bold text-red-700 block">Maintenance Mode</span>
                      <span className="text-[11px] text-slate-500">Displays a maintenance notice to visitors.</span>
                    </div>
                  </label>
                </div>
              </div>

              {/* General Site Information */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                  <Settings className="w-5 h-5 text-slate-700" />
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Platform Contact & Localization</h3>
                    <p className="text-xs text-slate-500">Support phone numbers, help desk emails and currency symbol.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Currency Symbol</label>
                    <input
                      type="text"
                      value={settingsForm.currencySymbol}
                      onChange={e => setSettingsForm({ ...settingsForm, currencySymbol: e.target.value })}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Default City</label>
                    <input
                      type="text"
                      value={settingsForm.defaultCity}
                      onChange={e => setSettingsForm({ ...settingsForm, defaultCity: e.target.value })}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Support Email</label>
                    <input
                      type="email"
                      value={settingsForm.contactEmail}
                      onChange={e => setSettingsForm({ ...settingsForm, contactEmail: e.target.value })}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Support Helpline</label>
                    <input
                      type="text"
                      value={settingsForm.contactPhone}
                      onChange={e => setSettingsForm({ ...settingsForm, contactPhone: e.target.value })}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Admin Password Configuration */}
              <div className="bg-white p-5 rounded-xl border border-amber-200 shadow-xs space-y-4">
                <div className="flex items-center gap-2 border-b border-amber-100 pb-3">
                  <Lock className="w-5 h-5 text-amber-600" />
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Owner Admin Password ({AUTHORIZED_ADMIN_EMAIL})</h3>
                    <p className="text-xs text-slate-500">Admin Panel sirf {AUTHORIZED_ADMIN_EMAIL} se login karne par hi dikhta hai.</p>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Update Admin Login Password (Optional — leave blank to keep current password)
                  </label>
                  <div className="relative w-full sm:w-80">
                    <input
                      type={showNewMasterPin ? 'text' : 'password'}
                      value={newMasterPin}
                      onChange={e => setNewMasterPin(e.target.value)}
                      maxLength={32}
                      className="w-full pl-3 pr-10 py-2 text-xs font-semibold border border-amber-300 rounded-lg outline-none bg-amber-50/30 focus:border-[#002f34]"
                      placeholder="Enter new Admin password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewMasterPin(!showNewMasterPin)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showNewMasterPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1.5">
                    Security Note: Aapka password backend me securely hashed rehta hai aur kabhi screen par show nahi hota.
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#002f34] text-white text-xs font-bold rounded-lg hover:bg-[#003d44] transition-colors shadow-xs cursor-pointer flex items-center gap-2"
                >
                  <Check className="w-4 h-4 text-[#23e5db]" />
                  <span>Save All Site Settings</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 6: DATABASE BACKUP & RESTORE */}
          {activeTab === 'backup' && (
            <div className="space-y-6 max-w-3xl">
              <div className="bg-emerald-50/80 p-5 rounded-xl border border-emerald-300 shadow-xs">
                <h3 className="text-sm font-extrabold text-[#002f34] mb-1 flex items-center gap-2">
                  <Download className="w-4 h-4 text-emerald-700" />
                  <span>1-Click Cloudflare Direct Upload (.ZIP) — Bina GitHub ke Seedha Live!</span>
                </h3>
                <p className="text-xs text-slate-600 mb-4 leading-relaxed">
                  Is ZIP me <strong>ready-built website</strong> (<code>index.html</code>, <code>assets</code>, <code>_redirects</code>, SEO files) taiyaar hai. Ise <strong>extract MAT karein</strong> — Cloudflare Pages ke <strong>Direct Upload</strong> me seedha yahi ZIP select karke 10 second me site live karein!
                </p>
                <button
                  type="button"
                  onClick={handleDownloadCloudflareZip}
                  disabled={downloadingZipType === 'cloudflare'}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-700 text-white text-xs font-extrabold rounded-lg hover:bg-emerald-800 transition-colors shadow-sm cursor-pointer disabled:opacity-60"
                >
                  {downloadingZipType === 'cloudflare' ? (
                    <RefreshCw className="w-4 h-4 animate-spin text-emerald-200" />
                  ) : (
                    <Download className="w-4 h-4 text-emerald-200" />
                  )}
                  <span>Download soldx-cloudflare-direct.zip (Direct Upload)</span>
                </button>
              </div>

              <div className="bg-teal-50/70 p-5 rounded-xl border border-teal-200 shadow-xs space-y-3">
                <h3 className="text-sm font-extrabold text-[#002f34] flex items-center gap-2">
                  <Download className="w-4 h-4 text-teal-700" />
                  <span>Download Full Project Source Code (.ZIP) — GitHub Update Ready</span>
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Is ZIP file me poora latest <strong>SOLDX</strong> source code (<code>src/</code>, <code>public/</code>, <code>server.ts</code>, <code>worker.ts</code>, <code>wrangler.jsonc</code>, <code>package.json</code>) bina <code>node_modules</code> ke clean format me hai.
                </p>
                <div className="bg-white/90 border border-teal-200/80 rounded-lg p-3 text-xs text-slate-700 space-y-1">
                  <div className="font-bold text-[#002f34]">GitHub par Update karne ka Aasan Tarika:</div>
                  <div>1. Neeche button se <code>soldx-github-update.zip</code> download karein aur pehle <strong>Unzip / Extract</strong> karein.</div>
                  <div>2. Apne GitHub repo me jayein → <strong>Add file</strong> → <strong>Upload files</strong> par click karein.</div>
                  <div>3. Extracted folder ke andar ki saari files aur folders drag &amp; drop karein aur neeche <strong>Commit changes</strong> dabayein.</div>
                </div>
                <div className="flex flex-wrap items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      void handleDownloadSourceZip();
                      if (onOpenZipModal) onOpenZipModal();
                    }}
                    disabled={downloadingZipType === 'github'}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#002f34] text-white text-xs font-extrabold rounded-lg hover:bg-[#003d44] transition-colors shadow-sm cursor-pointer disabled:opacity-60"
                  >
                    {downloadingZipType === 'github' ? (
                      <RefreshCw className="w-4 h-4 animate-spin text-[#23e5db]" />
                    ) : (
                      <Download className="w-4 h-4 text-[#23e5db]" />
                    )}
                    <span>Download soldx-github-update.zip (GitHub Source)</span>
                  </button>
                </div>
              </div>

              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
                <h3 className="text-sm font-bold text-slate-900 mb-1 flex items-center gap-2">
                  <Database className="w-4 h-4 text-teal-600" />
                  <span>Download Website Data Backup (JSON)</span>
                </h3>
                <p className="text-xs text-slate-500 mb-4">
                  Export all classified listings, categories, user profiles, and site settings into a single downloadable JSON backup file.
                </p>
                <button
                  type="button"
                  onClick={handleDownloadBackupJson}
                  disabled={downloadingZipType === 'json'}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 text-white text-xs font-bold rounded-lg hover:bg-slate-900 transition-colors shadow-xs cursor-pointer disabled:opacity-60"
                >
                  {downloadingZipType === 'json' ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Download className="w-4 h-4" />
                  )}
                  <span>Download Backup JSON</span>
                </button>
              </div>

              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
                <h3 className="text-sm font-bold text-slate-900 mb-1 flex items-center gap-2 text-red-600">
                  <AlertTriangle className="w-4 h-4 text-red-500" />
                  <span>Reset to Factory Defaults</span>
                </h3>
                <p className="text-xs text-slate-500 mb-4">
                  Restore initial demo listings, default categories, and sample user profiles if you ever want to start fresh.
                </p>
                {!confirmResetPending ? (
                  <button
                    type="button"
                    onClick={() => setConfirmResetPending(true)}
                    className="px-4 py-2 bg-red-600 text-white text-xs font-bold rounded-lg hover:bg-red-700 transition-colors shadow-xs cursor-pointer"
                  >
                    Reset Entire Database
                  </button>
                ) : (
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={async () => {
                        await api.resetDatabase();
                        setConfirmResetPending(false);
                        window.location.reload();
                      }}
                      className="px-4 py-2 bg-red-700 text-white text-xs font-bold rounded-lg hover:bg-red-800 transition-colors cursor-pointer"
                    >
                      Confirm Factory Reset
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmResetPending(false)}
                      className="px-4 py-2 border border-slate-300 text-slate-700 text-xs font-bold rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
