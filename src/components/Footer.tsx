import React from 'react';
import { Smartphone, ShieldCheck, Shield, MapPin } from 'lucide-react';
import { getStateForCity } from '../data/indiaLocations';

interface FooterProps {
  isAdminUser?: boolean;
  onOpenAdminPanel?: () => void;
  onSelectCity?: (loc: { city: string; state?: string }) => void;
  onSelectSearch?: (query: string) => void;
}

const FOOTER_CITIES = [
  'Mumbai',
  'Delhi',
  'Bengaluru',
  'Hyderabad',
  'Pune',
  'Chennai',
  'Kolkata',
  'Jaipur',
  'Lucknow',
  'Patna',
  'Ahmedabad',
  'Chandigarh',
];

export const Footer: React.FC<FooterProps> = ({
  isAdminUser = false,
  onOpenAdminPanel,
  onSelectCity,
  onSelectSearch,
}) => {
  const handleCityClick = (city: string) => {
    if (onSelectCity) {
      onSelectCity({ city, state: getStateForCity(city) });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSearchClick = (q: string) => {
    if (onSelectSearch) {
      onSelectSearch(q);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <footer className="bg-[#ebeeef] text-slate-700 mt-12 border-t border-gray-300 w-full max-w-full overflow-hidden">
      {/* App Promo Banner */}
      <div className="bg-[#ebeeef] border-b border-gray-300 py-6 px-4 w-full max-w-full overflow-hidden">
        <div className="max-w-[1280px] mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 sm:w-14 h-12 sm:h-14 rounded bg-[#002f34] text-white flex items-center justify-center font-black text-xl sm:text-2xl shadow-xs shrink-0 select-none">
              <span className="text-white">S</span>
              <span className="text-[#23e5db]">O</span>
              <span className="text-white">L</span>
              <span className="text-[#ffce32]">D</span>
              <span className="text-[#23e5db]">X</span>
            </div>
            <div>
              <h3 className="text-base font-bold text-[#002f34]">SOLDX ALL-INDIA MARKETPLACE</h3>
              <p className="text-xs text-gray-500 max-w-md leading-relaxed">
                Buy, sell and find anything across all 28 States, 8 Union Territories & 800+ Indian cities with verified accounts and instant buyer-seller chat!
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
            <div className="flex items-center gap-2 border-r border-gray-300 pr-4">
              <ShieldCheck className="w-6 h-6 text-cyan-700 shrink-0" />
              <div className="text-xs">
                <span className="font-bold text-[#002f34] block">Trusted Buyer & Seller Accounts</span>
                <span className="text-gray-500 text-[11px]">Safe Local Deals Across India</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="px-4 py-2 bg-[#002f34] text-white text-xs font-bold rounded hover:bg-slate-800 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Smartphone className="w-4 h-4 text-[#23e5db]" />
                <span>Browse All India</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-[1280px] mx-auto px-4 py-8">
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6 text-xs">
          <div className="col-span-2 sm:col-span-1">
            <h4 className="font-bold text-[#002f34] uppercase tracking-wider mb-2.5 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-teal-700" />
              <span>Popular Cities</span>
            </h4>
            <ul className="grid grid-cols-2 gap-x-3 gap-y-1 text-gray-600">
              {FOOTER_CITIES.map(city => (
                <li key={city}>
                  <button
                    type="button"
                    onClick={() => handleCityClick(city)}
                    className="hover:text-[#002f34] hover:underline text-left cursor-pointer"
                  >
                    {city}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-[#002f34] uppercase tracking-wider mb-2.5">
              Trending Searches
            </h4>
            <ul className="space-y-1 text-gray-600">
              {['Royal Enfield', 'Hyundai Creta', 'iPhone 15', 'MacBook Pro', '3 BHK Apartment', 'PlayStation 5'].map(
                term => (
                  <li key={term}>
                    <button
                      type="button"
                      onClick={() => handleSearchClick(term)}
                      className="hover:text-[#002f34] hover:underline text-left cursor-pointer"
                    >
                      {term}
                    </button>
                  </li>
                )
              )}
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-[#002f34] uppercase tracking-wider mb-2.5">
              About SOLDX
            </h4>
            <ul className="space-y-1 text-gray-500">
              <li>About SOLDX India</li>
              <li>All 36 States Coverage</li>
              <li>Verified Seller Program</li>
              <li>SOLDX for Businesses</li>
              <li>Contact Support</li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-[#002f34] uppercase tracking-wider mb-2.5">
              Help & Safety
            </h4>
            <ul className="space-y-1 text-gray-500">
              <li>Account Security Center</li>
              <li>Safe Local Buying Tips</li>
              <li>Terms of Use</li>
              <li>Privacy Policy</li>
            </ul>
          </div>

          <div className="col-span-2 sm:col-span-2 lg:col-span-1 space-y-3">
            <h4 className="font-bold text-[#002f34] uppercase tracking-wider mb-2">
              Follow SOLDX
            </h4>
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-white border border-gray-300 flex items-center justify-center font-bold text-xs text-[#002f34]">
                f
              </span>
              <span className="w-7 h-7 rounded-full bg-white border border-gray-300 flex items-center justify-center font-bold text-xs text-[#002f34]">
                𝕏
              </span>
              <span className="w-7 h-7 rounded-full bg-white border border-gray-300 flex items-center justify-center font-bold text-xs text-[#002f34]">
                yt
              </span>
              <span className="w-7 h-7 rounded-full bg-white border border-gray-300 flex items-center justify-center font-bold text-xs text-[#002f34]">
                ig
              </span>
            </div>
            <p className="text-[10px] text-gray-400 pt-2">
              Free Classifieds Across All India. © 2026 SOLDX.
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Bar (Admin button ONLY visible to OTP-verified site owner!) */}
      <div className="bg-[#002f34] text-white py-3.5 px-4 text-xs w-full max-w-full overflow-hidden">
        <div className="max-w-[1280px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-gray-300 text-[11px] w-full">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 sm:gap-3 text-center sm:text-left">
            <span className="font-bold text-white">Help - Sitemap - Privacy</span>
            <span>•</span>
            <span>All rights reserved © 2026 SOLDX India</span>
          </div>
          <div className="flex flex-wrap items-center justify-center sm:justify-end gap-3 sm:gap-4 text-[10px] text-gray-400">
            <span>All 28 States & 8 UTs Supported</span>
            {isAdminUser && onOpenAdminPanel && (
              <button
                type="button"
                id="footer-admin-portal-btn"
                onClick={onOpenAdminPanel}
                className="bg-white/10 hover:bg-white/20 text-gray-200 hover:text-white px-2.5 py-1 rounded transition-colors flex items-center gap-1.5 cursor-pointer font-bold border border-white/20"
                title="Admin Dashboard"
              >
                <Shield className="w-3.5 h-3.5 text-[#23e5db]" />
                <span>Admin Panel</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
};
