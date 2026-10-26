import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, ChevronRight, Layers, FolderTree, Plus } from 'lucide-react';
import { CATEGORIES } from '../data/mockData';
import { CategoryInfo } from '../types';

interface CategoryBarProps {
  selectedCategory: string;
  selectedSubcategory: string;
  onSelectCategory: (categoryId: string, subcategory?: string) => void;
  categories?: CategoryInfo[];
  onOpenCategoryManager?: () => void;
}

export const CategoryBar: React.FC<CategoryBarProps> = ({
  selectedCategory,
  selectedSubcategory,
  onSelectCategory,
  categories = CATEGORIES,
  onOpenCategoryManager,
}) => {
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
  const megaMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (megaMenuRef.current && !megaMenuRef.current.contains(e.target as Node)) {
        setIsMegaMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const popularQuickChips = [
    { label: 'Dating & Friendship (18+)', categoryId: 'dating_friendship' },
    { label: 'Electronics', categoryId: 'electronics' },
    { label: 'Vehicles & Cars', categoryId: 'vehicles' },
    { label: 'Home Goods', categoryId: 'home_goods' },
    { label: 'Services', categoryId: 'services' },
    { label: 'Mobiles & Tablets', categoryId: 'mobiles' },
    { label: 'Properties', categoryId: 'properties' },
    { label: 'Fashion & Beauty', categoryId: 'fashion' },
    { label: 'Jobs', categoryId: 'jobs' },
  ];

  return (
    <div className="bg-white border-b border-gray-200 relative z-30 shadow-xs w-full max-w-full overflow-hidden">
      <div className="max-w-[1280px] mx-auto px-2 sm:px-4 w-full">
        <div className="flex items-center h-10 gap-4 sm:gap-6 overflow-x-auto no-scrollbar text-xs sm:text-sm w-full max-w-full overscroll-x-contain">
          
          {/* ALL CATEGORIES Mega Menu Dropdown Toggle */}
          <div className="relative shrink-0" ref={megaMenuRef}>
            <button
              id="all-categories-mega-btn"
              onClick={() => setIsMegaMenuOpen(!isMegaMenuOpen)}
              className={`flex items-center gap-1 font-bold tracking-tight text-xs sm:text-sm py-1 px-1 rounded transition-all cursor-pointer shrink-0 ${
                isMegaMenuOpen || selectedCategory
                  ? 'text-[#002f34] underline decoration-2'
                  : 'text-[#002f34] hover:text-cyan-600'
              }`}
            >
              <span>ALL CATEGORIES</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isMegaMenuOpen ? 'rotate-180 text-[#002f34]' : 'text-[#002f34]'}`} />
            </button>

            {/* Mega Menu Dropdown */}
            {isMegaMenuOpen && (
              <div className="fixed sm:absolute left-2 sm:left-0 right-2 sm:right-auto top-24 sm:top-full mt-2 w-auto sm:w-[85vw] max-w-4xl bg-white rounded-xl shadow-2xl border border-gray-200 p-4 sm:p-6 z-50 animate-in fade-in slide-in-from-top-1 overflow-hidden">
                <div className="flex items-center justify-between pb-3 mb-4 border-b border-gray-100">
                  <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                    <Layers className="w-4 h-4 text-[#002f34]" />
                    <span>Hierarchical Classified Categories</span>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    {onOpenCategoryManager && (
                      <button
                        onClick={() => {
                          setIsMegaMenuOpen(false);
                          onOpenCategoryManager();
                        }}
                        className="text-xs text-[#002f34] font-bold hover:underline flex items-center gap-1"
                      >
                        <FolderTree className="w-3.5 h-3.5" />
                        <span>Manage / Add Subcategories</span>
                      </button>
                    )}
                    <button
                      onClick={() => {
                        onSelectCategory('');
                        setIsMegaMenuOpen(false);
                      }}
                      className="text-xs text-cyan-700 font-semibold hover:underline"
                    >
                      Reset Filter
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 max-h-[65vh] overflow-y-auto pr-2">
                  {categories.map((cat) => (
                    <div key={cat.id} className="space-y-2">
                      <button
                        onClick={() => {
                          onSelectCategory(cat.id);
                          setIsMegaMenuOpen(false);
                        }}
                        className={`font-bold text-xs text-left w-full hover:text-cyan-600 transition-colors flex items-center justify-between group ${
                          selectedCategory === cat.id ? 'text-cyan-600 underline underline-offset-4' : 'text-slate-900'
                        }`}
                      >
                        <span>{cat.name}</span>
                        <ChevronRight className="w-3 h-3 text-slate-400 group-hover:text-cyan-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>

                      <ul className="space-y-1.5 pl-2 border-l border-gray-100">
                        {cat.subcategories.map((sub) => (
                          <li key={sub}>
                            <button
                              onClick={() => {
                                onSelectCategory(cat.id, sub);
                                setIsMegaMenuOpen(false);
                              }}
                              className={`text-[11px] text-left w-full transition-colors hover:text-slate-900 hover:font-medium truncate ${
                                selectedCategory === cat.id && selectedSubcategory === sub
                                  ? 'text-cyan-600 font-bold'
                                  : 'text-slate-600'
                              }`}
                            >
                              {sub}
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Quick Category Chips */}
          <div className="flex items-center gap-6 text-slate-700 shrink-0 text-sm">
            {popularQuickChips.map((chip) => {
              const isActive = selectedCategory === chip.categoryId;

              return (
                <button
                  key={chip.label}
                  onClick={() => onSelectCategory(chip.categoryId)}
                  className={`whitespace-nowrap transition-colors py-1 cursor-pointer hover:text-cyan-600 ${
                    isActive
                      ? 'text-cyan-700 font-bold'
                      : 'text-slate-700 font-normal'
                  }`}
                >
                  {chip.label}
                </button>
              );
            })}
          </div>

        </div>
      </div>
    </div>
  );
};
