import React from 'react';
import { X, Heart, Trash2, ArrowRight } from 'lucide-react';
import { Listing } from '../types';
import { formatListingPrice } from '../utils/formatters';

interface FavoritesDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  favorites: string[];
  allListings: Listing[];
  onSelectListing: (listing: Listing) => void;
  onRemoveFavorite: (id: string) => void;
}

export const FavoritesDrawer: React.FC<FavoritesDrawerProps> = ({
  isOpen,
  onClose,
  favorites,
  allListings,
  onSelectListing,
  onRemoveFavorite,
}) => {
  if (!isOpen) return null;

  const favoriteListings = allListings.filter(l => favorites.includes(l.id));

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/50 backdrop-blur-xs flex justify-end">
      <div className="bg-white w-full max-w-md h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-red-500 fill-red-500" />
            <h2 className="font-extrabold text-base text-[#002f34]">
              Saved Ads ({favoriteListings.length})
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Listings List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {favoriteListings.length === 0 ? (
            <div className="text-center py-16 space-y-3">
              <div className="w-14 h-14 rounded-full bg-red-50 text-red-400 flex items-center justify-center mx-auto">
                <Heart className="w-7 h-7" />
              </div>
              <h3 className="font-bold text-sm text-slate-800">No saved ads yet</h3>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Click the heart icon on any ad card or detail page to save it for later review!
              </p>
            </div>
          ) : (
            favoriteListings.map((listing) => (
              <div
                key={listing.id}
                className="p-3 border border-slate-200 rounded-xl hover:border-slate-300 hover:shadow-xs transition-all flex gap-3 bg-white"
              >
                <img
                  src={listing.images[0]}
                  alt=""
                  className="w-20 h-20 rounded-lg object-cover bg-slate-100 shrink-0"
                />

                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <span className="font-extrabold text-sm text-[#002f34] block tabular-nums">
                      {formatListingPrice(listing.price, listing.currency, listing.category)}
                    </span>
                    <h4 className="text-xs font-semibold text-slate-800 truncate mt-0.5">
                      {listing.title}
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                      {listing.location.city} • {listing.postedDate}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <button
                      onClick={() => {
                        onClose();
                        onSelectListing(listing);
                      }}
                      className="text-xs font-bold text-teal-700 hover:underline flex items-center gap-1"
                    >
                      <span>View Details</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>

                    <button
                      onClick={() => onRemoveFavorite(listing.id)}
                      className="text-slate-400 hover:text-red-600 p-1"
                      title="Remove"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {favoriteListings.length > 0 && (
          <div className="p-4 border-t border-slate-100 bg-slate-50 text-center">
            <span className="text-xs text-slate-500">
              Prices and availability update in real time
            </span>
          </div>
        )}

      </div>
    </div>
  );
};
