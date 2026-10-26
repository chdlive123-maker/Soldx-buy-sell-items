import React from 'react';
import {
  X,
  User,
  Mail,
  Phone,
  MapPin,
  ShieldCheck,
  Package,
  Heart,
  MessageSquare,
  FolderTree,
  LogOut,
  LogIn,
  UserPlus,
  ChevronRight,
} from 'lucide-react';
import { UserProfile } from '../types';

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile | null;
  onOpenAuth: (tab?: 'login' | 'signup' | 'forgot_password') => void;
  onLogout: () => void;
  onOpenMyAds: () => void;
  onOpenFavorites: () => void;
  onOpenChats: () => void;
  onOpenAdminPanel?: () => void;
  onOpenCategoryManager?: () => void;
  myAdsCount: number;
  favoritesCount: number;
  unreadChatsCount: number;
}

export const AccountModal: React.FC<AccountModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onOpenAuth,
  onLogout,
  onOpenMyAds,
  onOpenFavorites,
  onOpenChats,
  onOpenAdminPanel,
  onOpenCategoryManager,
  myAdsCount,
  favoritesCount,
  unreadChatsCount,
}) => {
  if (!isOpen) return null;

  const isAdmin = Boolean(
    currentUser &&
      currentUser.role === 'admin' &&
      currentUser.email?.trim().toLowerCase() === 'sonuvarma891@gmail.com'
  );

  const getUserInitials = () => {
    if (!currentUser?.name) return 'U';
    return currentUser.name
      .split(' ')
      .map(n => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in">
      <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl relative flex flex-col max-h-[90vh] animate-in zoom-in-95">
        {/* Top Header */}
        <div className="bg-[#002f34] text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-[#23e5db]" />
            <h2 className="font-extrabold text-base tracking-tight">Account & Profile (खाता)</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-4">
          {currentUser ? (
            /* Logged-in State */
            <div className="space-y-4">
              {/* User Identity Card */}
              <div className="p-4 bg-linear-to-br from-slate-50 to-teal-50/30 rounded-xl border border-slate-200">
                <div className="flex items-center gap-3.5">
                  {currentUser.avatar ? (
                    <img
                      src={currentUser.avatar}
                      alt={currentUser.name}
                      className="w-14 h-14 rounded-full object-cover border-2 border-[#002f34] shadow-sm shrink-0"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-[#002f34] text-white font-extrabold text-lg flex items-center justify-center border-2 border-[#23e5db] shadow-sm shrink-0">
                      {getUserInitials()}
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-black text-slate-900 text-base truncate">
                        {currentUser.name}
                      </h3>
                      {isAdmin ? (
                        <span className="text-[10px] font-black text-amber-800 bg-amber-100 border border-amber-300 px-1.5 py-0.5 rounded uppercase tracking-wider shrink-0">
                          Admin
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded shrink-0">
                          Verified
                        </span>
                      )}
                    </div>
                    {currentUser.phone && (
                      <p className="text-xs text-slate-600 truncate mt-0.5 flex items-center gap-1">
                        <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                        <span>{currentUser.phone}</span>
                      </p>
                    )}
                    {currentUser.email && (
                      <p className="text-xs text-slate-600 truncate mt-0.5 flex items-center gap-1">
                        <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                        <span>{currentUser.email}</span>
                      </p>
                    )}
                    <p className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                      <span>
                        {currentUser.city || 'India'}
                        {currentUser.state && currentUser.state !== 'India'
                          ? `, ${currentUser.state}`
                          : ''}
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Navigation Options */}
              <div className="space-y-1.5 bg-slate-50/70 p-2 rounded-xl border border-slate-200/80">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenMyAds();
                  }}
                  className="w-full flex items-center justify-between p-3 rounded-lg bg-white hover:bg-slate-100/80 border border-slate-100 text-left transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center">
                      <Package className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">My Posted Ads</p>
                      <p className="text-[11px] text-slate-500">Manage, edit, or remove your listings</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-full">
                      {myAdsCount}
                    </span>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenFavorites();
                  }}
                  className="w-full flex items-center justify-between p-3 rounded-lg bg-white hover:bg-slate-100/80 border border-slate-100 text-left transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center">
                      <Heart className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">Saved Favorites</p>
                      <p className="text-[11px] text-slate-500">Bookmarked cars, bikes, and products</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-full">
                      {favoritesCount}
                    </span>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenChats();
                  }}
                  className="w-full flex items-center justify-between p-3 rounded-lg bg-white hover:bg-slate-100/80 border border-slate-100 text-left transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-teal-50 text-teal-700 flex items-center justify-center">
                      <MessageSquare className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">Buyer & Seller Chats</p>
                      <p className="text-[11px] text-slate-500">Live conversations and price offers</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {unreadChatsCount > 0 && (
                      <span className="text-[11px] font-black text-white bg-teal-600 px-2 py-0.5 rounded-full">
                        {unreadChatsCount}
                      </span>
                    )}
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </button>

                {isAdmin && onOpenCategoryManager && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenCategoryManager();
                    }}
                    className="w-full flex items-center justify-between p-3 rounded-lg bg-white hover:bg-slate-100/80 border border-slate-100 text-left transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-cyan-50 text-cyan-700 flex items-center justify-center">
                        <FolderTree className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900">Manage Categories</p>
                        <p className="text-[11px] text-slate-500">Add subcategories and view hierarchy</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                )}

                {isAdmin && onOpenAdminPanel && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenAdminPanel();
                    }}
                    className="w-full flex items-center justify-between p-3 rounded-lg bg-amber-50/70 hover:bg-amber-100/70 border border-amber-200 text-left transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#002f34] text-[#23e5db] flex items-center justify-center">
                        <ShieldCheck className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-black text-amber-950 flex items-center gap-1.5">
                          <span>Admin Panel (एडमिन पैनल)</span>
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        </p>
                        <p className="text-[11px] text-amber-800">
                          Moderation, platform stats, users & site settings
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-amber-700 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                )}
              </div>

              {/* Logout Button */}
              <div className="pt-2">
                <button
                  type="button"
                  id="account-modal-logout-btn"
                  onClick={() => {
                    onLogout();
                    onClose();
                  }}
                  className="w-full py-3 px-4 rounded-xl bg-red-50 hover:bg-red-100 active:bg-red-200 text-red-700 border border-red-200 font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-xs"
                >
                  <LogOut className="w-4 h-4 text-red-600" />
                  <span>Log Out (लॉग आउट करें)</span>
                </button>
                <p className="text-[11px] text-slate-400 text-center mt-2">
                  Clicking Log Out will end your active session on this device.
                </p>
              </div>
            </div>
          ) : (
            /* Logged-out State (Zero Admin Mention) */
            <div className="space-y-4 py-2">
              <div className="text-center space-y-2">
                <div className="w-16 h-16 rounded-full bg-slate-100 border-2 border-dashed border-slate-300 text-slate-400 flex items-center justify-center mx-auto">
                  <User className="w-8 h-8" />
                </div>
                <h3 className="font-extrabold text-slate-900 text-base">
                  Login to Your SOLDX Account
                </h3>
                <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
                  Login with your Email ID or Mobile Number & Password to post free classified ads, chat with sellers, and save favorite deals across India.
                </p>
              </div>

              <div className="space-y-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenAuth('login');
                  }}
                  className="w-full py-3 px-4 rounded-xl bg-[#002f34] hover:bg-[#003d44] text-white font-extrabold text-sm flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-md"
                >
                  <LogIn className="w-4 h-4 text-[#23e5db]" />
                  <span>Login (लॉग इन करें)</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenAuth('signup');
                  }}
                  className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-slate-50 text-[#002f34] border-2 border-[#002f34] font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer transition-colors"
                >
                  <UserPlus className="w-4 h-4 text-[#002f34]" />
                  <span>Create New Account (रजिस्टर करें)</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
