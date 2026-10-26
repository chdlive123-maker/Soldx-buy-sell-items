import React, { useState } from 'react';
import { SlidersHorizontal, RotateCcw, ChevronRight, FolderTree, MapPin, Search } from 'lucide-react';
import { CATEGORIES } from '../data/mockData';
import { INDIA_STATES_AND_CITIES, getCitiesByState } from '../data/indiaLocations';
import { CategoryInfo, FilterState } from '../types';
import { LocationPickerModal } from './LocationPickerModal';

interface FilterSidebarProps {
  filters: FilterState;
  onFilterChange: (newFilters: Partial<FilterState>) => void;
  onResetFilters: () => void;
  totalResultsCount: number;
  categories?: CategoryInfo[];
  onOpenCategoryManager?: () => void;
}

export const FilterSidebar: React.FC<FilterSidebarProps> = ({
  filters,
  onFilterChange,
  onResetFilters,
  totalResultsCount,
  categories = CATEGORIES,
  onOpenCategoryManager,
}) => {
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const currentCategory = categories.find(c => c.id === filters.category);

  const conditionOptions = ['Brand New', 'Like New', 'Good', 'Fair'];

  const handleConditionToggle = (cond: string) => {
    const exists = filters.condition.includes(cond);
    if (exists) {
      onFilterChange({ condition: filters.condition.filter(c => c !== cond) });
    } else {
      onFilterChange({ condition: [...filters.condition, cond] });
    }
  };

  const citiesForSelectedState = filters.locationState
    ? getCitiesByState(filters.locationState)
    : [];

  return (
    <>
      <aside className="w-full bg-white rounded border border-gray-300 p-3.5 space-y-4 shadow-2xs">
        {/* Header */}
        <div className="flex items-center justify-between pb-2.5 border-b border-gray-200">
          <div className="flex items-center gap-1.5">
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#002f34]" />
            <span className="font-bold text-xs text-[#002f34] uppercase tracking-wider">Filters</span>
          </div>
          <button
            type="button"
            onClick={onResetFilters}
            className="text-xs text-gray-500 hover:text-[#002f34] font-medium flex items-center gap-1 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Clear All</span>
          </button>
        </div>

        {/* All-India State & City Location Filter */}
        <div className="space-y-2 pb-2 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#002f34] flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-teal-700" />
              <span>Location (All India)</span>
            </h4>
            {(filters.locationCity !== 'All India' || filters.locationState) && (
              <button
                type="button"
                onClick={() => onFilterChange({ locationCity: 'All India', locationState: '' })}
                className="text-[10px] font-bold text-teal-700 hover:underline cursor-pointer"
              >
                Reset
              </button>
            )}
          </div>

          {/* State Dropdown (All 36 States/UTs) */}
          <div>
            <label className="text-[10px] text-gray-500 font-semibold block mb-1">
              State / Union Territory
            </label>
            <select
              value={filters.locationState || ''}
              onChange={e => {
                const st = e.target.value;
                if (!st) {
                  onFilterChange({ locationState: '', locationCity: 'All India' });
                } else {
                  onFilterChange({ locationState: st, locationCity: `All ${st}` });
                }
              }}
              className="w-full px-2.5 py-1.5 text-xs bg-white border border-gray-300 rounded font-medium text-slate-800 focus:outline-none focus:border-[#002f34]"
            >
              <option value="">All India (36 States & UTs)</option>
              {INDIA_STATES_AND_CITIES.map(s => (
                <option key={s.state} value={s.state}>
                  {s.state}
                </option>
              ))}
            </select>
          </div>

          {/* City / District Dropdown when a State is chosen */}
          {filters.locationState && citiesForSelectedState.length > 0 && (
            <div>
              <label className="text-[10px] text-gray-500 font-semibold block mb-1">
                City / District in {filters.locationState}
              </label>
              <select
                value={filters.locationCity}
                onChange={e => onFilterChange({ locationCity: e.target.value })}
                className="w-full px-2.5 py-1.5 text-xs bg-white border border-gray-300 rounded font-medium text-slate-800 focus:outline-none focus:border-[#002f34]"
              >
                <option value={`All ${filters.locationState}`}>
                  All Cities in {filters.locationState}
                </option>
                {citiesForSelectedState.map(city => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>
          )}

          <button
            type="button"
            onClick={() => setIsLocationModalOpen(true)}
            className="w-full py-1.5 px-2.5 rounded bg-teal-50 hover:bg-teal-100 border border-teal-200 text-[#002f34] text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <Search className="w-3 h-3 text-teal-700" />
            <span>Search 800+ Cities / GPS</span>
          </button>
        </div>

        {/* Categories Drilldown */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#002f34]">
              Categories
            </h4>
            {onOpenCategoryManager && (
              <button
                type="button"
                onClick={onOpenCategoryManager}
                className="text-[10px] text-cyan-800 font-bold hover:underline flex items-center gap-0.5 cursor-pointer"
              >
                <FolderTree className="w-3 h-3" />
                <span>Tree View</span>
              </button>
            )}
          </div>

          {currentCategory ? (
            <div className="space-y-1 text-xs">
              <button
                type="button"
                onClick={() => onFilterChange({ category: '', subcategory: '' })}
                className="font-bold text-cyan-700 hover:underline flex items-center gap-1 mb-1.5 cursor-pointer"
              >
                <span>← All Categories</span>
              </button>
              <div className="pl-2 font-bold text-[#002f34] border-l-2 border-[#002f34]">
                {currentCategory.name}
              </div>
              <div className="pl-4 space-y-1 mt-1 max-h-44 overflow-y-auto">
                {currentCategory.subcategories.map(sub => (
                  <button
                    key={sub}
                    type="button"
                    onClick={() =>
                      onFilterChange({ subcategory: filters.subcategory === sub ? '' : sub })
                    }
                    className={`block text-left w-full truncate py-0.5 cursor-pointer ${
                      filters.subcategory === sub
                        ? 'text-cyan-700 font-bold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {sub}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-1 text-xs max-h-52 overflow-y-auto pr-1">
              {categories.map(cat => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => onFilterChange({ category: cat.id, subcategory: '' })}
                  className="w-full text-left py-1 text-slate-600 hover:text-[#002f34] flex items-center justify-between group cursor-pointer"
                >
                  <span>{cat.name}</span>
                  <ChevronRight className="w-3 h-3 text-slate-300 group-hover:text-slate-600" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Price Range Filter */}
        <div className="pt-2 border-t border-gray-200">
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#002f34] mb-2">
            Price Range
          </h4>
          <div className="flex items-center gap-2 mb-2.5">
            <div className="flex-1">
              <label className="text-[10px] text-gray-400 font-medium">Min (₹)</label>
              <input
                type="number"
                placeholder="0"
                value={filters.minPrice}
                onChange={e =>
                  onFilterChange({ minPrice: e.target.value ? Number(e.target.value) : '' })
                }
                className="w-full px-2.5 py-1.5 text-xs bg-white border border-gray-300 rounded focus:outline-none focus:border-[#002f34]"
              />
            </div>
            <span className="text-gray-400 text-xs mt-3">to</span>
            <div className="flex-1">
              <label className="text-[10px] text-gray-400 font-medium">Max (₹)</label>
              <input
                type="number"
                placeholder="Any"
                value={filters.maxPrice}
                onChange={e =>
                  onFilterChange({ maxPrice: e.target.value ? Number(e.target.value) : '' })
                }
                className="w-full px-2.5 py-1.5 text-xs bg-white border border-gray-300 rounded focus:outline-none focus:border-[#002f34]"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {[
              { label: '< ₹10k', max: 10000 },
              { label: '₹10k - ₹50k', min: 10000, max: 50000 },
              { label: '₹50k - ₹5L', min: 50000, max: 500000 },
              { label: '> ₹5L', min: 500000 },
            ].map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() =>
                  onFilterChange({ minPrice: preset.min ?? '', maxPrice: preset.max ?? '' })
                }
                className="text-[10px] px-2 py-1 bg-gray-100 hover:bg-gray-200 text-slate-700 rounded-sm font-medium transition-colors cursor-pointer"
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* Condition Filter */}
        <div className="pt-2 border-t border-gray-200">
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#002f34] mb-2">
            Item Condition
          </h4>
          <div className="space-y-1.5">
            {conditionOptions.map(cond => {
              const checked = filters.condition.includes(cond);
              return (
                <label
                  key={cond}
                  className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer hover:text-slate-900 select-none"
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => handleConditionToggle(cond)}
                    className="rounded border-gray-300 text-[#002f34] focus:ring-[#002f34] w-3.5 h-3.5"
                  />
                  <span>{cond}</span>
                </label>
              );
            })}
          </div>
        </div>

        {/* Special Badges Filter */}
        <div className="pt-2 border-t border-gray-200 space-y-1.5">
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#002f34] mb-2">
            Verified & Urgent
          </h4>
          <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={filters.onlyVerified}
              onChange={e => onFilterChange({ onlyVerified: e.target.checked })}
              className="rounded border-gray-300 text-[#002f34] focus:ring-[#002f34] w-3.5 h-3.5"
            />
            <span>Verified Sellers Only</span>
          </label>
          <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={filters.onlyUrgent}
              onChange={e => onFilterChange({ onlyUrgent: e.target.checked })}
              className="rounded border-gray-300 text-[#002f34] focus:ring-[#002f34] w-3.5 h-3.5"
            />
            <span>Urgent Deals Only</span>
          </label>
        </div>

        {/* Sort By Filter */}
        <div className="pt-2 border-t border-gray-200">
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#002f34] mb-2">
            Sort Results By
          </h4>
          <select
            value={filters.sortBy}
            onChange={e => onFilterChange({ sortBy: e.target.value as FilterState['sortBy'] })}
            className="w-full px-3 py-2 text-xs bg-white border border-gray-300 rounded font-medium text-slate-800 focus:outline-none focus:border-[#002f34]"
          >
            <option value="featured">Featured First</option>
            <option value="newest">Newly Listed First</option>
            <option value="price_low">Price: Low to High</option>
            <option value="price_high">Price: High to Low</option>
            <option value="popular">Most Viewed</option>
          </select>
        </div>

        <div className="pt-2 border-t border-gray-200 text-center">
          <p className="text-xs text-gray-500 font-medium">
            Showing <strong>{totalResultsCount}</strong> matching listings
          </p>
        </div>
      </aside>

      <LocationPickerModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
        selectedCity={filters.locationCity}
        selectedState={filters.locationState}
        allowAllIndia={true}
        onSelectLocation={loc =>
          onFilterChange({ locationCity: loc.city, locationState: loc.state || '' })
        }
      />
    </>
  );
};
