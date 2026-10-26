import React from 'react';
import { Home, MessageSquare, Plus, Package, User } from 'lucide-react';
import { UserProfile } from '../types';

interface MobileBottomNavProps {
  unreadChatsCount: number;
  favoritesCount: number;
  myAdsCount: number;
  currentUser: UserProfile | null;
  onOpenHome: () => void;
  onOpenChats: () => void;
  onOpenSellModal: () => void;
  onOpenMyAds: () => void;
  onOpenAccount: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  unreadChatsCount,
  favoritesCount,
  myAdsCount,
  currentUser,
  onOpenHome,
  onOpenChats,
  onOpenSellModal,
  onOpenMyAds,
  onOpenAccount,
}) => {
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 px-2 py-1 shadow-lg flex items-center justify-around w-full max-w-full">
      {/* Home */}
      <button
        id="mobile-nav-home"
        onClick={onOpenHome}
        className="flex flex-col items-center py-1 px-2.5 text-slate-700 hover:text-[#002f34] transition-colors cursor-pointer"
      >
        <Home className="w-5 h-5" />
        <span className="text-[10px] font-bold mt-0.5">Home</span>
      </button>

      {/* Chats */}
      <button
        id="mobile-nav-chats"
        onClick={onOpenChats}
        className="flex flex-col items-center py-1 px-2.5 text-slate-700 hover:text-[#002f34] transition-colors relative cursor-pointer"
      >
        <MessageSquare className="w-5 h-5" />
        {unreadChatsCount > 0 && (
          <span className="absolute top-0 right-2 w-4 h-4 bg-[#23e5db] text-[#002f34] text-[9px] font-black rounded-full flex items-center justify-center border border-[#002f34]">
            {unreadChatsCount}
          </span>
        )}
        <span className="text-[10px] font-bold mt-0.5">Chats</span>
      </button>

      {/* SELL Floating Button */}
      <button
        id="mobile-nav-sell"
        onClick={onOpenSellModal}
        className="flex flex-col items-center -top-4 relative group cursor-pointer"
      >
        <div className="w-12 h-12 rounded-full bg-linear-to-br from-[#23e5db] via-[#ffce32] to-[#002f34] p-0.5 shadow-lg flex items-center justify-center group-hover:scale-105 active:scale-95 transition-transform">
          <div className="w-full h-full bg-white rounded-full flex items-center justify-center">
            <Plus className="w-6 h-6 text-[#002f34] stroke-[3]" />
          </div>
        </div>
        <span className="text-[10px] font-black uppercase text-[#002f34] mt-0.5">SELL</span>
      </button>

      {/* My Ads */}
      <button
        id="mobile-nav-myads"
        onClick={onOpenMyAds}
        className="flex flex-col items-center py-1 px-2.5 text-slate-700 hover:text-[#002f34] transition-colors cursor-pointer"
      >
        <Package className="w-5 h-5" />
        <span className="text-[10px] font-bold mt-0.5">My Ads</span>
      </button>

      {/* Account / Profile / Logout (Standard OLX Mobile pattern) */}
      <button
        id="mobile-nav-account"
        onClick={onOpenAccount}
        className="flex flex-col items-center py-1 px-2.5 text-slate-700 hover:text-[#002f34] transition-colors relative cursor-pointer"
      >
        {currentUser ? (
          currentUser.avatar ? (
            <img 
              src={currentUser.avatar} 
              alt={currentUser.name} 
              className="w-5 h-5 rounded-full object-cover border border-[#002f34]" 
            />
          ) : (
            <div className="w-5 h-5 rounded-full bg-[#002f34] text-white text-[9px] font-black flex items-center justify-center">
              {currentUser.name ? currentUser.name[0].toUpperCase() : 'U'}
            </div>
          )
        ) : (
          <User className="w-5 h-5 text-slate-600" />
        )}
        <span className={`text-[10px] font-bold mt-0.5 ${currentUser ? 'text-teal-900 font-extrabold' : ''}`}>
          {currentUser ? 'Account' : 'Login'}
        </span>
      </button>
    </div>
  );
};
