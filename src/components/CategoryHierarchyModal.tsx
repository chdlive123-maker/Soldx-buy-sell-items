import React, { useState } from 'react';
import { 
  X, 
  FolderTree, 
  Plus, 
  Search, 
  ChevronRight, 
  ChevronDown, 
  Layers, 
  Check, 
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
  Heart,
  Sparkles,
  Tag
} from 'lucide-react';
import { CategoryInfo } from '../types';

interface CategoryHierarchyModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: CategoryInfo[];
  onAddSubcategory: (categoryId: string, subcategoryName: string) => void;
  onSelectCategoryFilter: (categoryId: string, subcategory?: string) => void;
}

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
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
  Heart,
};

export const CategoryHierarchyModal: React.FC<CategoryHierarchyModalProps> = ({
  isOpen,
  onClose,
  categories,
  onAddSubcategory,
  onSelectCategoryFilter,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    electronics: true,
    vehicles: true,
    home_goods: true,
    services: true,
  });
  
  const [addingToCategoryId, setAddingToCategoryId] = useState<string | null>(null);
  const [newSubcategoryName, setNewSubcategoryName] = useState('');
  const [successToast, setSuccessToast] = useState<string | null>(null);

  if (!isOpen) return null;

  const toggleCategory = (catId: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [catId]: !prev[catId],
    }));
  };

  const handleCreateSubcategory = (e: React.FormEvent, catId: string) => {
    e.preventDefault();
    if (!newSubcategoryName.trim()) return;

    onAddSubcategory(catId, newSubcategoryName.trim());
    setSuccessToast(`Added "${newSubcategoryName.trim()}" to category!`);
    setNewSubcategoryName('');
    setAddingToCategoryId(null);

    // Expand category
    setExpandedCategories(prev => ({ ...prev, [catId]: true }));

    setTimeout(() => setSuccessToast(null), 3000);
  };

  const filteredCategories = categories.filter(cat => {
    const matchesName = cat.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSub = cat.subcategories.some(sub => sub.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesName || matchesSub;
  });

  const totalSubcategories = categories.reduce((acc, c) => acc + c.subcategories.length, 0);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl relative my-auto animate-in zoom-in-95 flex flex-col max-h-[88vh]">
        
        {/* Header */}
        <div className="bg-[#002f34] text-white px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <FolderTree className="w-5 h-5 text-[#23e5db]" />
            <div>
              <h2 className="font-extrabold text-base tracking-tight">Category Hierarchy & Subcategory Manager</h2>
              <p className="text-[11px] text-gray-300">Browse top-level categories or add new subcategories dynamically</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Stats Bar */}
        <div className="p-4 bg-gray-50 border-b border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search category or subcategory..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-[#002f34]"
            />
          </div>

          <div className="flex items-center gap-3 text-xs text-gray-600 font-medium">
            <span className="bg-white px-2.5 py-1 rounded border border-gray-200">
              <strong>{categories.length}</strong> Top-Level Categories
            </span>
            <span className="bg-white px-2.5 py-1 rounded border border-gray-200">
              <strong>{totalSubcategories}</strong> Active Subcategories
            </span>
          </div>
        </div>

        {/* Success Alert */}
        {successToast && (
          <div className="bg-emerald-50 px-6 py-2 border-b border-emerald-200 text-xs text-emerald-800 font-medium flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successToast}</span>
          </div>
        )}

        {/* Category Tree List */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-3">
          {filteredCategories.map((category) => {
            const Icon = ICON_MAP[category.iconName] || Tag;
            const isExpanded = expandedCategories[category.id] || searchQuery.length > 0;
            const isAdding = addingToCategoryId === category.id;

            return (
              <div 
                key={category.id} 
                className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-2xs transition-shadow hover:shadow-xs"
              >
                {/* Category Header */}
                <div 
                  className="p-3.5 bg-gray-50/80 hover:bg-gray-100/80 flex items-center justify-between gap-3 cursor-pointer select-none transition-colors"
                  onClick={() => toggleCategory(category.id)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#002f34] text-[#23e5db] flex items-center justify-center shrink-0">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-[#002f34]">{category.name}</span>
                        <span className="text-[10px] bg-gray-200 text-gray-700 px-1.5 py-0.5 rounded-full font-bold">
                          {category.subcategories.length} subcategories
                        </span>
                      </div>
                      {category.description && (
                        <p className="text-[11px] text-gray-500 font-normal">{category.description}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectCategoryFilter(category.id);
                        onClose();
                      }}
                      className="px-2.5 py-1 text-[11px] font-bold text-cyan-700 hover:text-[#002f34] hover:bg-cyan-50 rounded transition-colors"
                    >
                      Browse Ads
                    </button>
                    
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setAddingToCategoryId(isAdding ? null : category.id);
                      }}
                      className="px-2.5 py-1 text-[11px] font-bold text-[#002f34] bg-white border border-gray-300 hover:border-[#002f34] rounded flex items-center gap-1 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Subcategory</span>
                    </button>

                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    )}
                  </div>
                </div>

                {/* Subcategories Tree Content */}
                {isExpanded && (
                  <div className="p-4 border-t border-gray-100 bg-white space-y-3">
                    
                    {/* Add Subcategory Form */}
                    {isAdding && (
                      <form 
                        onSubmit={(e) => handleCreateSubcategory(e, category.id)}
                        className="p-3 bg-cyan-50/60 border border-cyan-200 rounded-lg flex items-center gap-2 animate-in fade-in"
                      >
                        <span className="text-xs font-bold text-[#002f34] shrink-0">New Subcategory:</span>
                        <input
                          type="text"
                          placeholder="e.g. Electric Supercars / Drone Repair"
                          value={newSubcategoryName}
                          onChange={(e) => setNewSubcategoryName(e.target.value)}
                          className="flex-1 px-3 py-1.5 text-xs bg-white border border-gray-300 rounded focus:outline-none focus:border-[#002f34]"
                          autoFocus
                          required
                        />
                        <button
                          type="submit"
                          className="px-3 py-1.5 bg-[#002f34] text-white text-xs font-bold rounded hover:bg-[#00474e] transition-colors cursor-pointer"
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={() => { setAddingToCategoryId(null); setNewSubcategoryName(''); }}
                          className="px-2 text-xs text-gray-500 hover:text-gray-800"
                        >
                          Cancel
                        </button>
                      </form>
                    )}

                    {/* Subcategories Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {category.subcategories.map((sub, idx) => (
                        <div
                          key={idx}
                          onClick={() => {
                            onSelectCategoryFilter(category.id, sub);
                            onClose();
                          }}
                          className="p-2 rounded border border-gray-100 hover:border-cyan-500 hover:bg-cyan-50/40 cursor-pointer flex items-center justify-between text-xs transition-colors group"
                        >
                          <span className="text-gray-700 font-medium group-hover:text-[#002f34] truncate">
                            {sub}
                          </span>
                          <ChevronRight className="w-3 h-3 text-gray-300 group-hover:text-cyan-600 shrink-0" />
                        </div>
                      ))}
                    </div>

                    {/* Popular Attributes Preview */}
                    {category.popularAttributes && category.popularAttributes.length > 0 && (
                      <div className="pt-2 border-t border-gray-100 flex items-center gap-2 text-[11px] text-gray-500">
                        <span className="font-semibold text-gray-700">Supported Attributes:</span>
                        <div className="flex flex-wrap gap-1">
                          {category.popularAttributes.map((attr, idx) => (
                            <span key={idx} className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-600">
                              {attr}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                  </div>
                )}

              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between shrink-0">
          <p className="text-xs text-gray-500">
            Subcategories are synchronized live across the marketplace filters and ad posting forms.
          </p>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-[#002f34] text-white font-bold text-xs rounded-lg hover:bg-[#00474e] transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
