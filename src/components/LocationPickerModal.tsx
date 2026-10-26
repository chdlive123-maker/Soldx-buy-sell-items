import React, { useState, useMemo } from 'react';
import {
  X,
  Search,
  MapPin,
  LocateFixed,
  ChevronRight,
  ChevronLeft,
  Check,
  Building2,
  Globe,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';
import {
  INDIA_STATES_AND_CITIES,
  TOP_POPULAR_CITIES,
  ALL_INDIA_CITIES,
  searchIndiaLocations,
  detectCurrentIndianCity,
} from '../data/indiaLocations';

interface LocationPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCity: string;
  selectedState?: string;
  allowAllIndia?: boolean;
  onSelectLocation: (selection: { city: string; state?: string; area?: string }) => void;
}

export const LocationPickerModal: React.FC<LocationPickerModalProps> = ({
  isOpen,
  onClose,
  selectedCity,
  selectedState,
  allowAllIndia = true,
  onSelectLocation,
}) => {
  const [query, setQuery] = useState('');
  const [activeState, setActiveState] = useState<string | null>(null);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState('');

  const searchResults = useMemo(() => searchIndiaLocations(query, 80), [query]);

  if (!isOpen) return null;

  const activeStateGroup = activeState
    ? INDIA_STATES_AND_CITIES.find(s => s.state === activeState)
    : null;

  const handleUseGps = async () => {
    setGpsError('');
    setGpsLoading(true);
    try {
      const detected = await detectCurrentIndianCity();
      onSelectLocation({
        city: detected.city,
        state: detected.state,
        area: detected.area,
      });
      onClose();
    } catch {
      setGpsError('GPS permission allow karein ya niche search box me apna shehar type karein.');
    } finally {
      setGpsLoading(false);
    }
  };

  const trimmedQuery = query.trim();
  const hasExactCityMatch = searchResults.matchingCities.some(
    c => c.city.toLowerCase() === trimmedQuery.toLowerCase()
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in">
      <div className="bg-white w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col max-h-[90vh] sm:max-h-[85vh] overflow-hidden border border-slate-200">
        {/* Top Header */}
        <div className="bg-[#002f34] text-white px-4 sm:px-5 py-3.5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            {activeState && !trimmedQuery ? (
              <button
                type="button"
                onClick={() => setActiveState(null)}
                className="p-1 -ml-1 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-5 h-5 text-[#23e5db]" />
              </button>
            ) : (
              <MapPin className="w-5 h-5 text-[#23e5db]" />
            )}
            <div>
              <h3 className="font-extrabold text-sm sm:text-base tracking-tight">
                {activeState && !trimmedQuery ? activeState : 'Choose Location (All India)'}
              </h3>
              <p className="text-[11px] text-slate-300">
                {ALL_INDIA_CITIES.length}+ Cities, Districts & All 36 States / UTs
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Input + GPS Button */}
        <div className="p-3.5 bg-slate-50 border-b border-slate-200 space-y-2.5 shrink-0">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search any City, District, Town or State in India..."
              className="w-full pl-10 pr-8 py-2.5 text-xs sm:text-sm bg-white border-2 border-[#002f34]/80 focus:border-[#002f34] rounded-xl outline-none font-medium text-slate-900"
              autoFocus
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="absolute right-2.5 top-2.5 p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleUseGps}
              disabled={gpsLoading}
              className="flex-1 py-2 px-3 rounded-xl bg-teal-50 hover:bg-teal-100 border border-teal-300 text-[#002f34] text-xs font-extrabold flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-60"
            >
              {gpsLoading ? (
                <RefreshCw className="w-4 h-4 text-teal-700 animate-spin" />
              ) : (
                <LocateFixed className="w-4 h-4 text-teal-700" />
              )}
              <span>{gpsLoading ? 'Detecting GPS Location...' : 'Use Current Location (GPS)'}</span>
            </button>

            {allowAllIndia && (
              <button
                type="button"
                onClick={() => {
                  onSelectLocation({ city: 'All India', state: '' });
                  onClose();
                }}
                className={`py-2 px-3 rounded-xl border text-xs font-extrabold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 ${
                  selectedCity === 'All India' && !selectedState
                    ? 'bg-[#002f34] text-white border-[#002f34]'
                    : 'bg-white hover:bg-slate-100 text-slate-800 border-slate-300'
                }`}
              >
                <Globe className="w-3.5 h-3.5 text-[#23e5db]" />
                <span>All India</span>
              </button>
            )}
          </div>

          {gpsError && (
            <div className="p-2 rounded-lg bg-amber-50 border border-amber-200 text-[11px] text-amber-800 flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 shrink-0 text-amber-600" />
              <span>{gpsError}</span>
            </div>
          )}
        </div>

        {/* Scrollable Location Directory */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
          {trimmedQuery ? (
            /* SEARCH RESULTS MODE */
            <div>
              {/* Matching States */}
              {allowAllIndia && searchResults.matchingStates.length > 0 && (
                <div>
                  <div className="px-4 py-1.5 bg-slate-100 text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                    States & Union Territories
                  </div>
                  {searchResults.matchingStates.map(st => (
                    <button
                      key={st.state}
                      type="button"
                      onClick={() => {
                        onSelectLocation({ city: `All ${st.state}`, state: st.state });
                        onClose();
                      }}
                      className="w-full px-4 py-2.5 text-left hover:bg-teal-50/50 flex items-center justify-between text-xs cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5">
                        <Building2 className="w-4 h-4 text-teal-700 shrink-0" />
                        <div>
                          <span className="font-bold text-slate-900">All in {st.state}</span>
                          <span className="text-[11px] text-slate-500 ml-1.5">
                            ({st.cities.length} cities)
                          </span>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </button>
                  ))}
                </div>
              )}

              {/* Matching Cities */}
              <div className="px-4 py-1.5 bg-slate-100 text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                Matching Cities & Districts ({searchResults.matchingCities.length})
              </div>

              {searchResults.matchingCities.map(loc => {
                const isSelected = selectedCity.toLowerCase() === loc.city.toLowerCase();
                return (
                  <button
                    key={`${loc.state}-${loc.city}`}
                    type="button"
                    onClick={() => {
                      onSelectLocation({ city: loc.city, state: loc.state });
                      onClose();
                    }}
                    className="w-full px-4 py-2.5 text-left hover:bg-slate-50 flex items-center justify-between text-xs cursor-pointer border-b border-slate-100"
                  >
                    <div className="flex items-center gap-2.5">
                      <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                      <div>
                        <span className="font-bold text-slate-900">{loc.city}</span>
                        <span className="text-slate-500 text-[11px] ml-1.5">{loc.state}</span>
                      </div>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-teal-600" />}
                  </button>
                );
              })}

              {/* Custom Town / Tehsil / Village Fallback */}
              {!hasExactCityMatch && trimmedQuery.length >= 2 && (
                <button
                  type="button"
                  onClick={() => {
                    const formatted =
                      trimmedQuery.charAt(0).toUpperCase() + trimmedQuery.slice(1);
                    onSelectLocation({
                      city: formatted,
                      state: activeState || 'India',
                    });
                    onClose();
                  }}
                  className="w-full px-4 py-3 text-left bg-teal-50/60 hover:bg-teal-100/70 flex items-center justify-between text-xs cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <MapPin className="w-4 h-4 text-teal-700 shrink-0" />
                    <div>
                      <span className="font-extrabold text-[#002f34]">
                        Use "{trimmedQuery}" as your City / Town
                      </span>
                      <span className="block text-[11px] text-teal-800">
                        Select any Indian town, tehsil, block or village
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-teal-700" />
                </button>
              )}
            </div>
          ) : activeStateGroup ? (
            /* SINGLE STATE DRILLDOWN MODE */
            <div>
              {allowAllIndia && (
                <button
                  type="button"
                  onClick={() => {
                    onSelectLocation({
                      city: `All ${activeStateGroup.state}`,
                      state: activeStateGroup.state,
                    });
                    onClose();
                  }}
                  className="w-full px-4 py-3 text-left bg-teal-50/50 hover:bg-teal-50 flex items-center justify-between text-xs font-extrabold text-[#002f34] cursor-pointer border-b border-teal-100"
                >
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-teal-700" />
                    <span>All Cities in {activeStateGroup.state}</span>
                  </div>
                  {selectedState === activeStateGroup.state &&
                    selectedCity.startsWith('All ') && <Check className="w-4 h-4 text-teal-700" />}
                </button>
              )}

              <div className="px-4 py-1.5 bg-slate-100 text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                Select District / City in {activeStateGroup.state} ({activeStateGroup.cities.length})
              </div>

              {activeStateGroup.cities.map(rawCity => {
                const city = rawCity.charAt(0).toUpperCase() + rawCity.slice(1);
                const isSelected = selectedCity.toLowerCase() === city.toLowerCase();
                return (
                  <button
                    key={city}
                    type="button"
                    onClick={() => {
                      onSelectLocation({ city, state: activeStateGroup.state });
                      onClose();
                    }}
                    className="w-full px-4 py-2.5 text-left hover:bg-slate-50 flex items-center justify-between text-xs cursor-pointer border-b border-slate-100"
                  >
                    <div className="flex items-center gap-2.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span className={`font-semibold ${isSelected ? 'text-teal-800 font-extrabold' : 'text-slate-800'}`}>
                        {city}
                      </span>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-teal-600" />}
                  </button>
                );
              })}
            </div>
          ) : (
            /* DEFAULT BROWSE MODE: POPULAR CITIES + ALL 36 STATES/UTs */
            <div>
              {/* Popular Cities Chips */}
              <div className="p-4">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 block mb-2.5">
                  Popular Cities in India
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {TOP_POPULAR_CITIES.map(item => {
                    const isSelected = selectedCity.toLowerCase() === item.city.toLowerCase();
                    return (
                      <button
                        key={item.city}
                        type="button"
                        onClick={() => {
                          onSelectLocation({ city: item.city, state: item.state });
                          onClose();
                        }}
                        className={`px-2.5 py-2 rounded-lg border text-xs font-bold text-left truncate flex items-center gap-1.5 transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-[#002f34] text-white border-[#002f34]'
                            : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200'
                        }`}
                      >
                        <MapPin className={`w-3 h-3 shrink-0 ${isSelected ? 'text-[#23e5db]' : 'text-slate-400'}`} />
                        <span className="truncate">{item.city}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* All 28 States + 8 UTs */}
              <div>
                <div className="px-4 py-2 bg-slate-100 text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                  All States & Union Territories (36) — Tap to Choose City
                </div>
                {INDIA_STATES_AND_CITIES.map(group => (
                  <button
                    key={group.state}
                    type="button"
                    onClick={() => setActiveState(group.state)}
                    className="w-full px-4 py-2.5 text-left hover:bg-slate-50 flex items-center justify-between text-xs cursor-pointer border-b border-slate-100 group"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="w-6 h-6 rounded bg-slate-100 text-[#002f34] font-extrabold text-[10px] flex items-center justify-center shrink-0">
                        {group.code}
                      </span>
                      <div>
                        <span className="font-bold text-slate-900 group-hover:text-[#002f34]">
                          {group.state}
                        </span>
                        <span className="text-[11px] text-slate-400 ml-1.5">
                          ({group.cities.length} cities)
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
