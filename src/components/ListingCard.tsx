import React, { useState } from 'react';
import { Heart, MapPin, Sparkles, ShieldCheck, Zap, ImageOff } from 'lucide-react';
import { Listing } from '../types';
import { formatListingPrice, isPersonalsCategory } from '../utils/formatters';

interface ListingCardProps {
  listing: Listing;
  isFavorite: boolean;
  onToggleFavorite: (listingId: string, e: React.MouseEvent) => void;
  onSelectListing: (listing: Listing) => void;
}

export const ListingCard: React.FC<ListingCardProps> = ({
  listing,
  isFavorite,
  onToggleFavorite,
  onSelectListing,
}) => {
  const [imgError, setImgError] = useState(false);
  const isPersonals = isPersonalsCategory(listing.category);

  // Extract key attribute snippet depending on category
  const getSpecsSnippet = () => {
    const attrs = listing.attributes;
    if (!attrs) return null;

    if (isPersonals) {
      const age = attrs['Age'] || '';
      const lookingFor = attrs['Looking For'] || listing.subcategory || '';
      if (age && lookingFor) return `${age} · ${lookingFor}`;
      return age || lookingFor || '18+ Verified Adult';
    }

    if (listing.category === 'cars' || listing.category === 'bikes' || listing.category === 'vehicles') {
      const year = attrs['Year'] || '';
      const km = attrs['KM driven'] || '';
      if (year && km) return `${year} · ${km}`;
      if (year) return `${year}`;
    }

    if (listing.category === 'properties') {
      const bed = attrs['Bedrooms'] || attrs['Type'] || '';
      const area = attrs['Super Area'] || attrs['Carpet Area'] || '';
      if (bed && area) return `${bed} · ${area}`;
      if (bed) return `${bed}`;
    }

    if (listing.category === 'mobiles') {
      const storage = attrs['Storage'] || '';
      const brand = attrs['Brand'] || '';
      if (brand && storage) return `${brand} · ${storage}`;
    }

    if (listing.category === 'electronics') {
      const brand = attrs['Brand'] || '';
      const model = attrs['Model'] || attrs['Edition'] || '';
      if (brand && model) return `${brand} ${model}`;
    }

    return listing.condition ? `Condition: ${listing.condition}` : null;
  };

  const specsSnippet = getSpecsSnippet();

  return (
    <div
      onClick={() => onSelectListing(listing)}
      className={`bg-white rounded-lg border ${
        listing.featured ? 'border-[#002f34]/40' : 'border-gray-300'
      } hover:border-[#002f34] hover:shadow-xs transition-all duration-150 p-2.5 relative flex flex-col justify-between cursor-pointer group w-full max-w-full overflow-hidden`}
      id={`listing-card-${listing.id}`}
    >
      {/* Top Image Container */}
      <div className="relative w-full h-36 sm:h-40 bg-slate-100 rounded-md overflow-hidden mb-2">
        {!imgError && listing.images[0] ? (
          <img
            src={listing.images[0]}
            alt={listing.title}
            referrerPolicy="no-referrer"
            onError={() => setImgError(true)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-slate-100 text-slate-400 p-3 text-center">
            <ImageOff className="w-6 h-6 mb-1" />
            <span className="text-[10px] font-medium line-clamp-2">{listing.title}</span>
          </div>
        )}

        {/* Featured / Urgent / 18+ Label */}
        <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
          {listing.featured && (
            <span className="inline-flex items-center gap-1 bg-[#ffce32] text-[#002f34] text-[10px] font-black uppercase px-2 py-0.5 rounded shadow-xs tracking-wider">
              <Sparkles className="w-2.5 h-2.5 fill-current" />
              FEATURED
            </span>
          )}
          {listing.urgent && (
            <span className="inline-flex items-center gap-1 bg-red-600 text-white text-[10px] font-black uppercase px-2 py-0.5 rounded shadow-xs tracking-wider">
              <Zap className="w-2.5 h-2.5 fill-current" />
              URGENT
            </span>
          )}
          {listing.isUserListing && (
            <span className="inline-flex items-center gap-1 bg-[#002f34] text-[#23e5db] text-[10px] font-black uppercase px-2 py-0.5 rounded shadow-xs tracking-wider">
              YOUR AD
            </span>
          )}
        </div>

        {/* Favorite Button */}
        <button
          onClick={(e) => onToggleFavorite(listing.id, e)}
          className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/90 backdrop-blur-xs flex items-center justify-center text-slate-700 hover:text-red-600 shadow-xs hover:bg-white hover:scale-110 transition-all z-10 cursor-pointer border border-gray-100"
          title={isFavorite ? 'Remove from Saved' : 'Save to Favorites'}
        >
          <Heart
            className={`w-3.5 h-3.5 transition-transform active:scale-125 ${
              isFavorite ? 'text-red-500 fill-red-500' : 'text-slate-600 hover:text-red-500'
            }`}
          />
        </button>

        {/* Image count indicator */}
        {listing.images.length > 1 && (
          <div className="absolute bottom-1.5 right-1.5 bg-black/60 backdrop-blur-xs text-white text-[9px] font-bold px-1.5 py-0.5 rounded tabular-nums">
            1/{listing.images.length}
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="flex-1 flex flex-col justify-between px-1">
        <div>
          {/* Price or Free Connect */}
          <div className="flex items-baseline justify-between gap-2 mb-0.5">
            <span
              className={`text-base sm:text-lg font-bold tracking-tight tabular-nums ${
                isPersonals && listing.price === 0 ? 'text-rose-700 text-sm sm:text-base' : 'text-[#002f34]'
              }`}
            >
              {formatListingPrice(listing.price, listing.currency, listing.category)}
            </span>
            {listing.seller?.verified && (
              <span className="inline-flex items-center text-[10px] text-teal-700 font-semibold shrink-0">
                <ShieldCheck className="w-3 h-3 mr-0.5 text-teal-600" />
                {isPersonals ? '18+ Verified' : 'Verified'}
              </span>
            )}
          </div>

          {/* Specs Snippet (clean unboxed text) */}
          {specsSnippet && (
            <p className="text-xs text-gray-500 font-medium truncate mb-0.5">
              {specsSnippet}
            </p>
          )}

          {/* Title */}
          <h3 className="text-xs sm:text-sm text-gray-700 truncate font-medium leading-snug group-hover:text-cyan-800 transition-colors">
            {listing.title}
          </h3>
        </div>

        {/* Location & Time Footer */}
        <div className="mt-2 pt-1.5 border-t border-gray-100 flex items-center justify-between text-[10px] text-gray-500 font-medium">
          <div className="flex items-center gap-1 truncate max-w-[65%]">
            <MapPin className="w-2.5 h-2.5 text-gray-400 shrink-0" />
            <span className="truncate">{listing.location.area || listing.location.city}</span>
          </div>
          <span className="shrink-0 text-[10px] font-normal text-gray-400">
            {listing.postedDate}
          </span>
        </div>
      </div>
    </div>
  );
};
