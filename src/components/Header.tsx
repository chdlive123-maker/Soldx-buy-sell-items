import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  MapPin,
  ChevronDown,
  Heart,
  MessageSquare,
  Bell,
  Plus,
  Check,
  Sparkles,
  Package,
  LogOut,
  FolderTree,
  ShieldCheck,
  LogIn,
  LocateFixed,
  Download,
} from 'lucide-react';
import { NotificationItem, UserProfile } from '../types';
import { LocationPickerModal } from './LocationPickerModal';
import { downloadBinaryFile } from '../utils/api';

interface HeaderProps {
  selectedCity: string;
  selectedState?: string;
  onSelectLocation: (loc: { city: string; state?: string }) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSearchSubmit: () => void;
  favoritesCount: number;
  unreadChatsCount: number;
  notifications: NotificationItem[];
  currentUser: UserProfile | null;
  onOpenAuth: (tab?: 'login' | 'signup' | 'forgot_password') => void;
  onLogout: () => void;
  onOpenSellModal: () => void;
  onOpenChats: () => void;
  onOpenFavorites: () => void;
  onOpenMyAds: () => void;
  onOpenCategoryManager?: () => void;
  onSelectNotificationListing?: (listingId: string) => void;
  onOpenAdminPanel?: () => void;
  onOpenAccount?: () => void;
  onOpenZipModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  selectedCity,
  selectedState,
  onSelectLocation,
  searchQuery,
  onSearchChange,
  onSearchSubmit,
  favoritesCount,
  unreadChatsCount,
  notifications,
  currentUser,
  onOpenAuth,
  onLogout,
  onOpenSellModal,
  onOpenChats,
  onOpenFavorites,
  onOpenMyAds,
  onOpenCategoryManager,
  onSelectNotificationListing,
  onOpenAdminPanel,
  onOpenZipModal,
}) => {
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [selectedLang, setSelectedLang] = useState('English');
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const langRef = useRef<HTMLDivElement>(null);

  const unreadNotifs = notifications.filter(n => !n.read).length;

  const isAdminUser = Boolean(
    currentUser &&
      currentUser.role === 'admin' &&
      currentUser.email?.trim().toLowerCase() === 'sonuvarma891@gmail.com'
  );

  const isPreviewHost =
    typeof window !== 'undefined' &&
    (window.location.hostname.endsWith('.run.app') ||
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1');

  const showZipShortcut = Boolean(onOpenZipModal && (isAdminUser || isPreviewHost));

  const handleQuickZipClick = () => {
    void downloadBinaryFile('/api/download-zip', 'soldx-github-update.zip', {
      requireZipMagic: true,
      mimeType: 'application/zip',
    });
    if (onOpenZipModal) {
      onOpenZipModal();
    }
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setIsNotifOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setIsLangOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getUserInitials = () => {
    if (!currentUser?.name) return 'SX';
    return currentUser.name
      .split(' ')
      .map(n => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  const locationDisplayLabel =
    !selectedCity || selectedCity === 'All India'
      ? 'All India'
      : selectedCity.startsWith('All ')
      ? selectedCity
      : selectedState && selectedState !== 'India'
      ? `${selectedCity}, ${selectedState}`
      : selectedCity;

  return (
    <>
      <header className="sticky top-0 z-40 bg-[#f7f8f8] border-b border-gray-200 w-full max-w-full">
        {/* Top Banner Notice */}
        <div className="bg-[#002f34] text-white text-[11px] sm:text-xs py-1.5 px-3 sm:px-4 text-center font-medium flex flex-wrap items-center justify-center gap-2 overflow-hidden w-full">
          <div className="flex items-center gap-1.5 min-w-0">
            <Sparkles className="w-3.5 h-3.5 text-[#23e5db] shrink-0" />
            <span className="truncate max-w-[85vw] sm:max-w-none">
              Sell smarter, faster & safer across <strong>All 36 States & 800+ Indian Cities!</strong>
            </span>
          </div>
          {showZipShortcut && (
            <button
              type="button"
              id="header-download-zip-btn"
              onClick={handleQuickZipClick}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#23e5db] hover:bg-[#1dd4ca] text-[#002f34] text-[11px] font-extrabold shadow-xs transition-colors cursor-pointer shrink-0"
            >
              <Download className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Download GitHub ZIP</span>
            </button>
          )}
        </div>

        {/* Mobile Location Selector Bar (Visible on all phones!) */}
        <div className="sm:hidden bg-white border-b border-slate-200 px-3 py-1.5 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => setIsLocationModalOpen(true)}
            className="flex items-center gap-1.5 text-xs font-extrabold text-[#002f34] truncate max-w-[75%] cursor-pointer"
          >
            <MapPin className="w-3.5 h-3.5 text-teal-600 shrink-0" />
            <span className="truncate">{locationDisplayLabel}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-500 shrink-0" />
          </button>

          <button
            type="button"
            onClick={() => setIsLocationModalOpen(true)}
            className="text-[11px] font-bold text-teal-700 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-md flex items-center gap-1 shrink-0 cursor-pointer"
          >
            <LocateFixed className="w-3 h-3" />
            <span>Change City</span>
          </button>
        </div>

        <div className="max-w-[1280px] mx-auto px-2.5 sm:px-4 py-2 sm:py-3 w-full">
          <div className="flex items-center gap-2 sm:gap-3 md:gap-4 justify-between h-12 sm:h-16 w-full">
            {/* Brand Logo */}
            <div
              onClick={() => {
                onSearchChange('');
                onSelectLocation({ city: 'All India', state: '' });
              }}
              className="cursor-pointer flex items-center select-none group shrink-0"
              id="brand-logo"
            >
              <div className="flex items-center">
                <span className="text-2xl sm:text-4xl font-black tracking-tight text-[#002f34] group-hover:text-[#004f57] transition-colors">
                  <span className="text-[#002f34]">S</span>
                  <span className="text-[#23e5db]">O</span>
                  <span className="text-[#002f34]">L</span>
                  <span className="text-[#ffce32]">D</span>
                  <span className="text-[#23e5db]">X</span>
                </span>
              </div>
            </div>

            {/* Desktop Location Selector Button */}
            <div className="relative shrink-0 hidden sm:block w-48 md:w-60 lg:w-[250px]">
              <button
                type="button"
                id="location-selector-btn"
                onClick={() => setIsLocationModalOpen(true)}
                className="w-full flex items-center justify-between gap-2 px-3 bg-white border-2 border-[#002f34] rounded h-10 sm:h-12 text-xs sm:text-sm font-semibold hover:bg-slate-50 transition-all cursor-pointer"
              >
                <div className="flex items-center gap-2 truncate text-slate-800">
                  <MapPin className="w-4 h-4 text-teal-700 shrink-0" />
                  <span className="truncate">{locationDisplayLabel}</span>
                </div>
                <ChevronDown className="w-4 h-4 text-slate-700 shrink-0" />
              </button>
            </div>

            {/* Search Bar */}
            <form
              onSubmit={e => {
                e.preventDefault();
                onSearchSubmit();
              }}
              className="flex-1 relative flex items-center min-w-0 mx-1 sm:mx-0"
            >
              <div className="flex items-center bg-white border-2 border-[#002f34] rounded h-10 sm:h-12 flex-grow overflow-hidden w-full min-w-0">
                <input
                  type="text"
                  id="main-search-input"
                  value={searchQuery}
                  onChange={e => onSearchChange(e.target.value)}
                  placeholder="Find Cars, Mobile Phones, Properties..."
                  className="flex-grow px-2.5 sm:px-4 outline-none text-xs sm:text-sm text-slate-800 placeholder-slate-400 bg-transparent font-normal min-w-0"
                />
                <button
                  type="submit"
                  id="main-search-submit-btn"
                  className="bg-[#002f34] hover:bg-[#003d44] h-full w-9 sm:w-12 flex items-center justify-center cursor-pointer text-white shrink-0 transition-colors"
                  title="Search"
                >
                  <Search className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </button>
              </div>
            </form>

            {/* Right Action Controls */}
            <div className="flex items-center gap-1 sm:gap-2.5 shrink-0">
              {/* Language Switcher */}
              <div className="relative hidden xl:block" ref={langRef}>
                <button
                  type="button"
                  onClick={() => setIsLangOpen(!isLangOpen)}
                  className="flex items-center gap-1 text-xs font-bold text-[#002f34] px-2 py-1.5 rounded hover:bg-slate-200/60 uppercase cursor-pointer"
                >
                  <span>{selectedLang === 'English' ? 'ENGLISH' : selectedLang.toUpperCase()}</span>
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
                {isLangOpen && (
                  <div className="absolute right-0 mt-1 w-32 bg-white rounded-md shadow-lg border border-slate-200 py-1 z-50 text-xs">
                    {['English', 'हिन्दी'].map(lang => (
                      <button
                        key={lang}
                        type="button"
                        onClick={() => {
                          setSelectedLang(lang);
                          setIsLangOpen(false);
                        }}
                        className="w-full text-left px-3 py-1.5 hover:bg-slate-100 flex items-center justify-between cursor-pointer"
                      >
                        <span>{lang}</span>
                        {selectedLang === lang && <Check className="w-3 h-3 text-[#002f34]" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Chat Icon */}
              <button
                type="button"
                id="header-chat-btn"
                onClick={onOpenChats}
                className="hidden sm:flex p-2 text-[#002f34] hover:bg-slate-200/70 rounded-full relative transition-colors cursor-pointer"
                title="Chats & Bargaining"
              >
                <MessageSquare className="w-5 h-5" />
                {unreadChatsCount > 0 && (
                  <span className="absolute top-0.5 right-0.5 min-w-[18px] h-[18px] bg-[#23e5db] text-[#002f34] text-[11px] font-black rounded-full flex items-center justify-center border border-[#002f34]">
                    {unreadChatsCount}
                  </span>
                )}
              </button>

              {/* Notifications */}
              <div className="relative" ref={notifRef}>
                <button
                  type="button"
                  id="header-notif-btn"
                  onClick={() => setIsNotifOpen(!isNotifOpen)}
                  className="p-1.5 sm:p-2 text-[#002f34] hover:bg-slate-200/70 rounded-full relative transition-colors cursor-pointer"
                  title="Notifications"
                >
                  <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
                  {unreadNotifs > 0 && (
                    <span className="absolute top-0.5 right-0.5 w-2 h-2 sm:w-2.5 sm:h-2.5 bg-red-500 rounded-full ring-2 ring-white"></span>
                  )}
                </button>

                {isNotifOpen && (
                  <div className="absolute right-0 top-full mt-1.5 w-72 sm:w-80 bg-white rounded-lg shadow-xl border border-slate-200 z-50 overflow-hidden animate-in fade-in">
                    <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                      <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                        Notifications
                      </span>
                    </div>
                    <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                      {notifications.length === 0 ? (
                        <div className="p-6 text-center text-xs text-slate-400">No notifications yet</div>
                      ) : (
                        notifications.map(n => (
                          <div
                            key={n.id}
                            onClick={() => {
                              if (n.listingId && onSelectNotificationListing) {
                                onSelectNotificationListing(n.listingId);
                              }
                              setIsNotifOpen(false);
                            }}
                            className={`p-3 text-xs hover:bg-slate-50 cursor-pointer transition-colors ${
                              !n.read ? 'bg-teal-50/40' : ''
                            }`}
                          >
                            <div className="flex items-start justify-between gap-1">
                              <span className="font-semibold text-slate-900">{n.title}</span>
                              <span className="text-[10px] text-slate-400 shrink-0">{n.date}</span>
                            </div>
                            <p className="text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                              {n.message}
                            </p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Saved / Favorites */}
              <button
                type="button"
                id="header-fav-btn"
                onClick={onOpenFavorites}
                className="hidden sm:flex p-2 text-[#002f34] hover:bg-slate-200/70 rounded-full relative transition-colors cursor-pointer"
                title="Saved Ads"
              >
                <Heart className={`w-5 h-5 ${favoritesCount > 0 ? 'text-red-500 fill-red-500' : ''}`} />
                {favoritesCount > 0 && (
                  <span className="absolute top-0.5 right-0.5 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {favoritesCount}
                  </span>
                )}
              </button>

              {/* Admin Panel Button — Visible ONLY when logged in as sonuvarma891@gmail.com */}
              {isAdminUser && onOpenAdminPanel && (
                <button
                  type="button"
                  id="header-admin-btn"
                  onClick={onOpenAdminPanel}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-full text-[11px] sm:text-xs font-extrabold transition-colors cursor-pointer shrink-0 border bg-amber-100 text-amber-900 border-amber-300 hover:bg-amber-200"
                  title="Admin Panel"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-700" />
                  <span className="hidden xs:inline sm:inline">Admin Panel</span>
                </button>
              )}

              {/* User Profile / Login Button */}
              {currentUser ? (
                <div className="relative" ref={userMenuRef}>
                  <button
                    type="button"
                    id="header-user-btn"
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-1 p-1 hover:bg-slate-200/60 rounded-full transition-colors cursor-pointer"
                  >
                    {currentUser.avatar ? (
                      <img
                        src={currentUser.avatar}
                        alt=""
                        className="w-8 h-8 rounded-full object-cover border border-[#002f34]"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-[#002f34] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                        {getUserInitials()}
                      </div>
                    )}
                    <ChevronDown className="w-3.5 h-3.5 text-slate-700 hidden sm:block" />
                  </button>

                  {isUserMenuOpen && (
                    <div className="absolute right-0 top-full mt-1.5 w-60 bg-white rounded-lg shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in">
                      <div className="px-4 py-2.5 border-b border-slate-100">
                        <div className="flex items-center justify-between gap-1">
                          <p className="text-xs font-bold text-slate-900 truncate">{currentUser.name}</p>
                          <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded shrink-0">
                            {isAdminUser ? 'Admin' : 'Verified'}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 truncate">
                          {currentUser.email || currentUser.phone}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          onOpenMyAds();
                          setIsUserMenuOpen(false);
                        }}
                        className="w-full px-4 py-2 text-left text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 font-medium cursor-pointer"
                      >
                        <Package className="w-4 h-4 text-slate-500" />
                        <span>My Published Ads</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          onOpenFavorites();
                          setIsUserMenuOpen(false);
                        }}
                        className="w-full px-4 py-2 text-left text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 font-medium cursor-pointer"
                      >
                        <Heart className="w-4 h-4 text-slate-500" />
                        <span>Saved Favorites ({favoritesCount})</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          onOpenChats();
                          setIsUserMenuOpen(false);
                        }}
                        className="w-full px-4 py-2 text-left text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 font-medium cursor-pointer"
                      >
                        <MessageSquare className="w-4 h-4 text-slate-500" />
                        <span>Chat Inbox & Offers</span>
                      </button>

                      {isAdminUser && onOpenCategoryManager && (
                        <button
                          type="button"
                          onClick={() => {
                            onOpenCategoryManager();
                            setIsUserMenuOpen(false);
                          }}
                          className="w-full px-4 py-2 text-left text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 font-medium cursor-pointer"
                        >
                          <FolderTree className="w-4 h-4 text-slate-500" />
                          <span>Manage Categories</span>
                        </button>
                      )}

                      {onOpenAdminPanel && isAdminUser && (
                        <button
                          type="button"
                          onClick={() => {
                            onOpenAdminPanel();
                            setIsUserMenuOpen(false);
                          }}
                          className="w-full px-4 py-2 text-left text-xs text-teal-800 hover:bg-teal-50 flex items-center gap-2.5 font-bold cursor-pointer"
                        >
                          <ShieldCheck className="w-4 h-4 text-teal-600" />
                          <span>Admin Backend Panel</span>
                        </button>
                      )}

                      <div className="border-t border-slate-100 my-1"></div>

                      <button
                        type="button"
                        id="header-logout-btn"
                        onClick={() => {
                          onLogout();
                          setIsUserMenuOpen(false);
                        }}
                        className="w-full px-4 py-2.5 text-left text-xs text-red-600 hover:bg-red-50 flex items-center gap-2.5 font-black cursor-pointer transition-colors"
                      >
                        <LogOut className="w-4 h-4 text-red-600" />
                        <span>Log Out (लॉग आउट करें)</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  type="button"
                  id="header-login-btn"
                  onClick={() => onOpenAuth('login')}
                  className="flex items-center gap-1.5 bg-[#002f34] hover:bg-[#003d44] text-white px-3 sm:px-4 py-1.5 rounded-full text-xs font-black cursor-pointer shadow-xs transition-colors shrink-0"
                >
                  <LogIn className="w-3.5 h-3.5 text-[#23e5db]" />
                  <span>Login</span>
                </button>
              )}

              {/* SELL Button */}
              <button
                type="button"
                id="header-sell-btn"
                onClick={onOpenSellModal}
                className="hidden sm:flex bg-white rounded-full border-[5px] border-l-yellow-400 border-t-cyan-400 border-r-blue-500 border-b-yellow-400 px-4 sm:px-6 py-1.5 sm:py-2 items-center gap-1.5 sm:gap-2 cursor-pointer shadow-xs hover:shadow-sm hover:scale-105 active:scale-95 transition-transform shrink-0"
              >
                <Plus className="w-4 h-4 text-[#002f34] stroke-[3]" />
                <span className="font-bold text-xs sm:text-sm tracking-widest text-[#002f34] uppercase">
                  SELL
                </span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* All-India Location Picker Modal */}
      <LocationPickerModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
        selectedCity={selectedCity}
        selectedState={selectedState}
        allowAllIndia={true}
        onSelectLocation={loc => onSelectLocation(loc)}
      />
    </>
  );
};
