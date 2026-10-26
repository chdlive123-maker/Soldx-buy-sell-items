import React from 'react';
import { X, Package, Trash2, Eye, Heart, Plus, CheckCircle } from 'lucide-react';
import { Listing } from '../types';
import { formatListingPrice } from '../utils/formatters';

interface MyAdsModalProps {
  isOpen: boolean;
  onClose: () => void;
  myListings: Listing[];
  onOpenSellModal: () => void;
  onSelectListing: (listing: Listing) => void;
  onDeleteListing: (id: string) => void;
}

export const MyAdsModal: React.FC<MyAdsModalProps> = ({
  isOpen,
  onClose,
  myListings,
  onOpenSellModal,
  onSelectListing,
  onDeleteListing,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl relative flex flex-col max-h-[85vh] animate-in zoom-in-95">
        
        {/* Header */}
        <div className="bg-[#002f34] text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-[#23e5db]" />
            <h2 className="font-extrabold text-base tracking-tight">My Posted Ads ({myListings.length})</h2>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4">
          {myListings.length === 0 ? (
            <div className="text-center py-12 space-y-4">
              <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto">
                <Package className="w-8 h-8" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-800">You haven't posted any ads yet</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  Turn your unused electronics, vehicles, furniture, or clothes into instant cash on SOLDX.
                </p>
              </div>
              <button
                onClick={() => {
                  onClose();
                  onOpenSellModal();
                }}
                className="px-6 py-2.5 bg-[#002f34] text-white font-bold text-xs rounded-lg hover:bg-[#00474e] transition-colors"
              >
                + Post Your First Ad
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-xs font-bold text-slate-600">Active Listings</span>
                <button
                  onClick={() => {
                    onClose();
                    onOpenSellModal();
                  }}
                  className="text-xs font-bold text-teal-700 hover:underline flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Post Another Ad</span>
                </button>
              </div>

              {myListings.map((ad) => (
                <div
                  key={ad.id}
                  className="p-3 bg-slate-50 hover:bg-slate-100/80 border border-slate-200 rounded-xl flex items-center justify-between gap-4 transition-colors"
                >
                  <div 
                    onClick={() => {
                      onClose();
                      onSelectListing(ad);
                    }}
                    className="flex items-center gap-3 cursor-pointer min-w-0 flex-1"
                  >
                    <img
                      src={ad.images[0]}
                      alt=""
                      className="w-16 h-16 rounded-lg object-cover bg-slate-200 shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <span className="text-xs font-extrabold text-[#002f34] block tabular-nums">
                        {formatListingPrice(ad.price, ad.currency, ad.category)}
                      </span>
                      <p className="text-xs font-bold text-slate-800 truncate">{ad.title}</p>
                      <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1">
                        <span>{ad.location.city}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Eye className="w-3 h-3" /> {ad.viewsCount} views
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Heart className="w-3 h-3 text-red-500" /> {ad.likesCount} likes
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-1 rounded-full">
                      <CheckCircle className="w-3 h-3" /> Active
                    </span>

                    <button
                      onClick={() => onDeleteListing(ad.id)}
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete ad"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
