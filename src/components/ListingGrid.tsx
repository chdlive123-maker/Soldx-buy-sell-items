import React from 'react';
import { LayoutGrid, List, SlidersHorizontal, Sparkles, X } from 'lucide-react';
import { Listing, FilterState } from '../types';
import { ListingCard } from './ListingCard';
import { formatListingPrice, formatCategoryDisplayName } from '../utils/formatters';

interface ListingGridProps {
  listings: Listing[];
  favorites: string[];
  onToggleFavorite: (id: string, e: React.MouseEvent) => void;
  onSelectListing: (listing: Listing) => void;
  filters: FilterState;
  onRemoveFilter: (key: keyof FilterState, value?: string) => void;
  onOpenMobileFilters: () => void;
  onResetFilters: () => void;
}

export const ListingGrid: React.FC<ListingGridProps> = ({
  listings,
  favorites,
  onToggleFavorite,
  onSelectListing,
  filters,
  onRemoveFilter,
  onOpenMobileFilters,
  onResetFilters,
}) => {
  const [viewMode, setViewMode] = React.useState<'grid' | 'list'>('grid');
  const [visibleCount, setVisibleCount] = React.useState(12);

  const displayedListings = listings.slice(0, visibleCount);
  const hasMore = visibleCount < listings.length;

  // Active filter pills
  const activePills: { label: string; key: keyof FilterState; value?: string }[] = [];

  if (filters.category) {
    activePills.push({ label: `Category: ${formatCategoryDisplayName(filters.category)}`, key: 'category' });
  }
  if (filters.subcategory) {
    activePills.push({ label: `Sub: ${filters.subcategory}`, key: 'subcategory' });
  }
  if (filters.locationState) {
    activePills.push({ label: `State: ${filters.locationState}`, key: 'locationState' });
  }
  if (
    filters.locationCity &&
    filters.locationCity !== 'All India' &&
    !filters.locationCity.startsWith('All ')
  ) {
    activePills.push({ label: `City: ${filters.locationCity}`, key: 'locationCity' });
  }
  if (filters.searchQuery) {
    activePills.push({ label: `Search: "${filters.searchQuery}"`, key: 'searchQuery' });
  }
  if (filters.minPrice !== '') {
    activePills.push({ label: `Min: ₹${filters.minPrice}`, key: 'minPrice' });
  }
  if (filters.maxPrice !== '') {
    activePills.push({ label: `Max: ₹${filters.maxPrice}`, key: 'maxPrice' });
  }
  filters.condition.forEach(c => {
    activePills.push({ label: `Condition: ${c}`, key: 'condition', value: c });
  });
  if (filters.onlyVerified) {
    activePills.push({ label: 'Verified Only', key: 'onlyVerified' });
  }
  if (filters.onlyUrgent) {
    activePills.push({ label: 'Urgent Deals', key: 'onlyUrgent' });
  }

  return (
    <div className="flex-1 space-y-4 w-full max-w-full overflow-hidden">
      {/* Top Bar: Title, Count, Mobile Filter Button & View Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-3 pb-2 border-b border-gray-200 w-full">
        <div>
          <h2 className="text-lg sm:text-2xl font-bold text-[#002f34] tracking-tight capitalize">
            {filters.category ? `${formatCategoryDisplayName(filters.category)} Listings` : 'Fresh recommendations'}
          </h2>
          <p className="text-xs text-gray-500 font-normal">
            {filters.locationCity && filters.locationCity !== 'All India'
              ? `Showing ads in ${filters.locationCity}${filters.locationState ? `, ${filters.locationState}` : ''} (${listings.length} ads)`
              : `All India marketplace recommendations (${listings.length} ads)`}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Mobile Filter Toggle */}
          <button
            onClick={onOpenMobileFilters}
            className="md:hidden flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-300 rounded text-xs font-bold text-[#002f34] shadow-xs hover:bg-gray-50"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Filters ({activePills.length})</span>
          </button>

          {/* Grid / List switcher */}
          <div className="hidden sm:flex items-center bg-gray-100 p-0.5 rounded border border-gray-200">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded transition-colors ${
                viewMode === 'grid' ? 'bg-white shadow-xs text-[#002f34] font-bold' : 'text-gray-500 hover:text-gray-900'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded transition-colors ${
                viewMode === 'list' ? 'bg-white shadow-xs text-[#002f34] font-bold' : 'text-gray-500 hover:text-gray-900'
              }`}
              title="List View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Active Filter Chips */}
      {activePills.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-xs text-gray-500 font-medium">Active Filters:</span>
          {activePills.map((pill, idx) => (
            <span
              key={idx}
              className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-medium bg-white text-[#002f34] border border-gray-300 shadow-2xs"
            >
              <span>{pill.label}</span>
              <button
                onClick={() => onRemoveFilter(pill.key, pill.value)}
                className="hover:text-red-600 cursor-pointer ml-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
          <button
            onClick={onResetFilters}
            className="text-xs text-red-600 font-semibold hover:underline ml-1 cursor-pointer"
          >
            Clear all
          </button>
        </div>
      )}

      {/* Listings Display */}
      {displayedListings.length === 0 ? (
        <div className="bg-white rounded border border-gray-300 p-10 sm:p-12 text-center my-4 space-y-4">
          <div className="w-16 h-16 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center mx-auto">
            <Sparkles className="w-8 h-8 text-[#002f34]" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-[#002f34]">
              {filters.locationCity && filters.locationCity !== 'All India'
                ? `No ads posted in ${filters.locationCity} yet`
                : 'No matching ads found'}
            </h3>
            <p className="text-sm text-gray-500 mt-1 max-w-md mx-auto">
              {filters.locationCity && filters.locationCity !== 'All India'
                ? `Be the first seller in ${filters.locationCity} or browse verified listings across All India.`
                : "We couldn't find any ads matching your current filter criteria. Try adjusting your search query, expanding the price range, or clearing filters."}
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2.5">
            {filters.locationCity && filters.locationCity !== 'All India' && (
              <button
                onClick={() => {
                  onRemoveFilter('locationState');
                  onRemoveFilter('locationCity');
                }}
                className="px-5 py-2.5 bg-[#002f34] text-white font-bold text-xs rounded hover:bg-[#00474e] transition-colors cursor-pointer"
              >
                Show All India Ads
              </button>
            )}
            <button
              onClick={onResetFilters}
              className="px-5 py-2.5 border border-[#002f34] text-[#002f34] font-bold text-xs rounded hover:bg-gray-50 transition-colors cursor-pointer"
            >
              Reset All Filters
            </button>
          </div>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {displayedListings.map((listing) => (
            <ListingCard
              key={listing.id}
              listing={listing}
              isFavorite={favorites.includes(listing.id)}
              onToggleFavorite={onToggleFavorite}
              onSelectListing={onSelectListing}
            />
          ))}
        </div>
      ) : (
        /* List View */
        <div className="space-y-3">
          {displayedListings.map((listing) => {
            const isFav = favorites.includes(listing.id);
            return (
              <div
                key={listing.id}
                onClick={() => onSelectListing(listing)}
                className={`bg-white rounded-lg border ${
                  listing.featured ? 'border-[#002f34]/40' : 'border-gray-300'
                } hover:border-[#002f34] hover:shadow-xs transition-all p-3 flex flex-col sm:flex-row gap-4 cursor-pointer group`}
              >
                <div className="w-full sm:w-56 h-36 rounded-md overflow-hidden bg-gray-100 shrink-0 relative">
                  <img
                    src={listing.images[0]}
                    alt={listing.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                  {listing.featured && (
                    <span className="absolute top-2 left-2 bg-[#ffce32] text-[#002f34] text-[10px] font-black uppercase px-2 py-0.5 rounded">
                      FEATURED
                    </span>
                  )}
                </div>

                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-xl font-bold text-[#002f34] tabular-nums">
                        {formatListingPrice(listing.price, listing.currency, listing.category)}
                      </span>
                      <button
                        onClick={(e) => onToggleFavorite(listing.id, e)}
                        className="text-gray-400 hover:text-red-500 p-1"
                      >
                        <span className={`text-lg ${isFav ? 'text-red-500' : ''}`}>♥</span>
                      </button>
                    </div>

                    <h3 className="font-semibold text-gray-800 text-sm sm:text-base group-hover:text-cyan-800 transition-colors mt-0.5">
                      {listing.title}
                    </h3>
                    <p className="text-xs text-gray-500 line-clamp-2 mt-1 leading-relaxed">
                      {listing.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-gray-400 pt-2 border-t border-gray-100 mt-2 uppercase">
                    <span>{listing.location.area}, {listing.location.city}</span>
                    <span className="text-[10px]">{listing.postedDate}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Load More Button */}
      {hasMore && (
        <div className="text-center pt-8 pb-4">
          <button
            onClick={() => setVisibleCount(prev => prev + 8)}
            className="border-2 border-[#002f34] text-[#002f34] hover:bg-[#002f34] hover:text-white font-bold p-3 rounded text-sm transition-all cursor-pointer inline-block"
          >
            Load more
          </button>
        </div>
      )}
    </div>
  );
};
