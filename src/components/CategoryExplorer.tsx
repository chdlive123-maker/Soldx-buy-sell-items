import React from 'react';
import { 
  Tv,
  Car,
  Armchair,
  Wrench,
  Smartphone, 
  Home, 
  Shirt, 
  Briefcase, 
  PawPrint, 
  BookOpen,
  Bike,
  Truck,
  Heart,
  Layers,
  FolderTree
} from 'lucide-react';
import { CATEGORIES } from '../data/mockData';
import { CategoryInfo } from '../types';

interface CategoryExplorerProps {
  selectedCategory: string;
  onSelectCategory: (categoryId: string) => void;
  categories?: CategoryInfo[];
  onOpenCategoryManager?: () => void;
}

const ICON_MAP: Record<string, React.FC<{ className?: string }>> = {
  Tv,
  Car,
  Armchair,
  Wrench,
  Smartphone,
  Home,
  Shirt,
  Briefcase,
  PawPrint,
  BookOpen,
  Bike,
  Truck,
  Heart,
};

export const CategoryExplorer: React.FC<CategoryExplorerProps> = ({
  selectedCategory,
  onSelectCategory,
  categories = CATEGORIES,
  onOpenCategoryManager,
}) => {
  return (
    <div className="max-w-[1280px] mx-auto px-3 sm:px-4 py-3 sm:py-4 w-full max-w-full overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <h2 className="text-sm sm:text-base md:text-lg font-bold text-[#002f34] tracking-tight">
            Browse by Top Categories
          </h2>
          <span className="text-[11px] text-gray-500 font-normal hidden sm:inline">
            (Electronics, Vehicles, Dating & Friendship 18+, Services & more)
          </span>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {onOpenCategoryManager && (
            <button
              onClick={onOpenCategoryManager}
              className="text-xs text-[#002f34] font-bold hover:underline flex items-center gap-1 cursor-pointer"
            >
              <FolderTree className="w-3.5 h-3.5 text-cyan-800" />
              <span>Category Hierarchy</span>
            </button>
          )}

          {selectedCategory && (
            <button
              onClick={() => onSelectCategory('')}
              className="text-xs text-cyan-700 font-bold hover:underline cursor-pointer"
            >
              Show All Categories
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-11 gap-2.5 sm:gap-3">
        {categories.map((cat) => {
          const IconComponent = ICON_MAP[cat.iconName] || Tv;
          const isSelected = selectedCategory === cat.id;
          const isAdultCategory = cat.id === 'dating_friendship';

          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(isSelected ? '' : cat.id)}
              className={`flex flex-col items-center justify-center p-2.5 rounded-lg transition-all duration-150 group text-center cursor-pointer ${
                isSelected
                  ? 'bg-cyan-50 border-2 border-cyan-700 shadow-2xs'
                  : 'bg-white border border-gray-300 hover:border-[#002f34] hover:shadow-xs'
              }`}
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center mb-1.5 transition-transform group-hover:scale-105 ${
                  isSelected
                    ? 'bg-[#002f34] text-[#23e5db]'
                    : isAdultCategory
                    ? 'bg-rose-50 text-rose-600 group-hover:bg-rose-100'
                    : 'bg-gray-100 text-[#002f34] group-hover:bg-gray-200'
                }`}
              >
                <IconComponent className="w-5 h-5" />
              </div>
              <span
                className={`text-[11px] font-medium leading-tight line-clamp-2 ${
                  isSelected ? 'text-cyan-900 font-bold' : 'text-slate-700 group-hover:text-[#002f34]'
                }`}
              >
                {cat.name}
              </span>
              <span className="text-[9px] text-gray-400 mt-0.5 font-normal">
                {cat.subcategories.length} subcats
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
