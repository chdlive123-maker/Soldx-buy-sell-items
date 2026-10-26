import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  Upload, 
  Sparkles, 
  MapPin, 
  CheckCircle2, 
  ChevronRight, 
  Plus, 
  Trash2, 
  Image as ImageIcon,
  Tag,
  ShieldCheck,
  Star,
  Eye,
  Check,
  AlertCircle,
  FileImage,
  Layers,
  LocateFixed,
  RefreshCw
} from 'lucide-react';
import { SAMPLE_IMAGE_PRESETS } from '../data/mockData';
import { INDIA_STATES_AND_CITIES, getCitiesByState, getStateForCity, detectCurrentIndianCity } from '../data/indiaLocations';
import { CategoryInfo, Listing, UserProfile } from '../types';
import { LocationPickerModal } from './LocationPickerModal';
import { formatListingPrice, isPersonalsCategory } from '../utils/formatters';

const DEFAULT_ITEM_IMAGE = 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1000&q=80';
const DEFAULT_PERSONALS_IMAGE = '/assets/personals/personals_cafe_conversation_1793013250297.jpg';

interface PostAdModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdCreated: (newListing: Listing) => void;
  categories: CategoryInfo[];
  currentUser?: UserProfile | null;
  onAddSubcategory?: (categoryId: string, subcategoryName: string) => void;
}

export const PostAdModal: React.FC<PostAdModalProps> = ({
  isOpen,
  onClose,
  onAdCreated,
  categories,
  currentUser,
  onAddSubcategory,
}) => {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [selectedCategory, setSelectedCategory] = useState(categories[0]?.id || 'electronics');
  const [selectedSubcategory, setSelectedSubcategory] = useState(categories[0]?.subcategories[0] || 'Laptops & Computers');
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState<number | ''>('');
  const [condition, setCondition] = useState<'Brand New' | 'Like New' | 'Good' | 'Fair'>('Like New');
  const [attributes, setAttributes] = useState<Record<string, string>>({
    'Brand': '',
    'Year': '2024',
    'Warranty': '6 Months Seller Warranty',
  });

  // Dedicated 18+ Dating & Friendship fields
  const [personalAge, setPersonalAge] = useState<string>('25');
  const [personalGender, setPersonalGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [personalLookingFor, setPersonalLookingFor] = useState<string>('Women');
  const [personalInterests, setPersonalInterests] = useState<string>('Coffee, Travel, Movies, Music');
  const [personalLanguages, setPersonalLanguages] = useState<string>('Hindi, English');
  const [confirmedAdult18Plus, setConfirmedAdult18Plus] = useState<boolean>(false);

  const [images, setImages] = useState<string[]>([
    DEFAULT_ITEM_IMAGE,
  ]);
  const [customImageUrl, setCustomImageUrl] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedState, setSelectedState] = useState(
    currentUser?.state || getStateForCity(currentUser?.city || 'Delhi') || 'Delhi (NCT)'
  );
  const [city, setCity] = useState(currentUser?.city || 'Delhi');
  const [area, setArea] = useState('');
  const [sellerName, setSellerName] = useState(currentUser?.name || '');
  const [sellerPhone, setSellerPhone] = useState(currentUser?.phone || '');
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [gpsDetecting, setGpsDetecting] = useState(false);

  // Custom subcategory creation inline
  const [isAddingSubcategory, setIsAddingSubcategory] = useState(false);
  const [newSubcategoryInput, setNewSubcategoryInput] = useState('');

  const [isSuccess, setIsSuccess] = useState(false);
  const [createdListing, setCreatedListing] = useState<Listing | null>(null);

  // Update seller info if currentUser updates
  useEffect(() => {
    if (currentUser) {
      setSellerName(currentUser.name);
      setSellerPhone(currentUser.phone);
      if (currentUser.city) {
        setCity(currentUser.city);
        const st = currentUser.state || getStateForCity(currentUser.city);
        if (st) setSelectedState(st);
      }
    }
  }, [currentUser]);

  if (!isOpen) return null;

  const currentCatInfo = categories.find(c => c.id === selectedCategory) || categories[0];
  const isPersonals = isPersonalsCategory(selectedCategory);

  const applySubcategoryDefaults = (catId: string, sub: string) => {
    if (catId === 'dating_friendship') {
      if (sub === 'Men Looking for Women') {
        setPersonalGender('Male');
        setPersonalLookingFor('Women');
      } else if (sub === 'Women Looking for Men') {
        setPersonalGender('Female');
        setPersonalLookingFor('Men');
      } else if (sub.toLowerCase().includes('friendship')) {
        setPersonalLookingFor('Friendship & Hangouts');
      }
    }
  };

  // Handle local file selection (Multiple files supported)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newImageUrls: string[] = [];
    Array.from(files).forEach((file: File) => {
      if (file.type.startsWith('image/')) {
        const objectUrl = URL.createObjectURL(file);
        newImageUrls.push(objectUrl);
      }
    });

    if (newImageUrls.length > 0) {
      setImages(prev => [...prev, ...newImageUrls].slice(0, 10));
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (!files || files.length === 0) return;

    const newImageUrls: string[] = [];
    Array.from(files).forEach((file: File) => {
      if (file.type.startsWith('image/')) {
        const objectUrl = URL.createObjectURL(file);
        newImageUrls.push(objectUrl);
      }
    });

    if (newImageUrls.length > 0) {
      setImages(prev => [...prev, ...newImageUrls].slice(0, 10));
    }
  };

  const handleAddPresetImage = (url: string) => {
    if (!images.includes(url) && images.length < 10) {
      setImages([...images, url]);
    }
  };

  const handleAddCustomImage = (e: React.FormEvent) => {
    e.preventDefault();
    if (customImageUrl && customImageUrl.startsWith('http') && images.length < 10) {
      setImages([...images, customImageUrl]);
      setCustomImageUrl('');
    }
  };

  const handleRemoveImage = (index: number) => {
    if (images.length > 1) {
      setImages(images.filter((_, i) => i !== index));
    }
  };

  const handleSetCoverImage = (index: number) => {
    if (index === 0) return;
    const selected = images[index];
    const rest = images.filter((_, i) => i !== index);
    setImages([selected, ...rest]);
  };

  const handleCreateSubcategoryInline = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubcategoryInput.trim()) return;

    if (onAddSubcategory) {
      onAddSubcategory(selectedCategory, newSubcategoryInput.trim());
    }
    setSelectedSubcategory(newSubcategoryInput.trim());
    setNewSubcategoryInput('');
    setIsAddingSubcategory(false);
  };

  const handlePublishAd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || (!isPersonals && !price) || images.length === 0) return;
    if (isPersonals && (Number(personalAge) < 18 || !confirmedAdult18Plus)) return;

    const finalAttributes: Record<string, string | number> = isPersonals
      ? {
          'Age': `${personalAge} Years`,
          'Gender': personalGender,
          'Looking For': personalLookingFor,
          'Interests': personalInterests.trim() || 'Coffee, Conversations, Travel',
          'Languages': personalLanguages.trim() || 'Hindi, English',
          'Verification': '18+ Verified Adult',
        }
      : {
          ...attributes,
          'Listed By': currentUser?.name || sellerName,
        };

    const newAd: Listing = {
      id: `olx-user-${Date.now()}`,
      title: title.trim(),
      description:
        description.trim() ||
        (isPersonals
          ? `18+ personal connection post by ${currentUser?.name || sellerName} in ${area || city}, ${city}. Looking forward to respectful conversations and safe public meetups.`
          : `Verified listing for ${title}. In inspected condition, available for immediate pickup in ${area}, ${city}.`),
      price: isPersonals ? Number(price || 0) : Number(price),
      currency: '₹',
      category: selectedCategory,
      subcategory: selectedSubcategory,
      images,
      location: {
        city,
        area: area.trim() || city,
        state: selectedState || getStateForCity(city) || 'India',
      },
      postedDate: 'Just now',
      featured: true,
      urgent: false,
      condition,
      attributes: finalAttributes,
      seller: {
        id: currentUser?.id || 'user-self',
        name: currentUser?.name || sellerName,
        avatar: currentUser?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(currentUser?.name || sellerName || 'User')}`,
        memberSince: currentUser?.memberSince || 'Aug 2026',
        rating: 5.0,
        reviewsCount: 1,
        verified: true,
        phone: sellerPhone,
        responseTime: 'Replies within 15 mins',
      },
      viewsCount: 1,
      likesCount: 0,
      isUserListing: true,
    };

    onAdCreated(newAd);
    setCreatedListing(newAd);
    setIsSuccess(true);
  };

  const handleResetAndClose = () => {
    setIsSuccess(false);
    setStep(1);
    setTitle('');
    setDescription('');
    setPrice('');
    setConfirmedAdult18Plus(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl relative my-auto animate-in zoom-in-95 flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="bg-[#002f34] text-white px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xl font-black tracking-tight">
              <span className="text-white">S</span><span className="text-[#23e5db]">O</span><span className="text-white">L</span><span className="text-[#ffce32]">D</span><span className="text-[#23e5db]">X</span>
            </span>
            <span className="text-xs font-bold text-slate-200 ml-2 tracking-wider">POST YOUR AD</span>
          </div>

          <button
            onClick={handleResetAndClose}
            className="p-1 rounded-full text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success View */}
        {isSuccess ? (
          <div className="p-8 text-center space-y-5 overflow-y-auto">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto animate-bounce">
              <CheckCircle2 className="w-10 h-10 text-emerald-600" />
            </div>

            <div className="space-y-1">
              <h3 className="text-2xl font-extrabold text-[#002f34]">Your Ad is LIVE!</h3>
              <p className="text-xs text-gray-600 max-w-md mx-auto">
                Congratulations, <strong className="text-gray-900">"{createdListing?.title}"</strong> has been successfully published and is now visible to active buyers.
              </p>
            </div>

            {/* Published Item Card Preview */}
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 max-w-md mx-auto flex items-center gap-4 text-left shadow-2xs">
              <img
                src={createdListing?.images[0]}
                alt=""
                className="w-20 h-20 rounded-lg object-cover bg-gray-200 shrink-0 border border-gray-300"
              />
              <div className="flex-1 min-w-0">
                <span className="font-extrabold text-base text-[#002f34] block tabular-nums">
                  {createdListing
                    ? formatListingPrice(createdListing.price, createdListing.currency, createdListing.category)
                    : '₹ 0'}
                </span>
                <p className="text-xs text-gray-800 font-bold truncate">{createdListing?.title}</p>
                <p className="text-[11px] text-gray-500">{createdListing?.location.area}, {createdListing?.location.city}</p>
                <span className="inline-block mt-1 bg-emerald-100 text-emerald-800 text-[9px] font-black px-1.5 py-0.5 rounded">
                  FEATURED AD
                </span>
              </div>
            </div>

            <div className="pt-2 flex justify-center gap-3">
              <button
                onClick={handleResetAndClose}
                className="px-6 py-2.5 bg-[#002f34] text-white font-bold text-xs rounded-lg hover:bg-[#00474e] transition-colors cursor-pointer shadow-xs"
              >
                Go to Marketplace
              </button>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col overflow-hidden">
            
            {/* Step Progress Indicators */}
            <div className="bg-gray-100 px-6 py-2.5 border-b border-gray-200 flex items-center justify-between text-xs font-bold text-gray-600 shrink-0">
              <div className={`flex items-center gap-1.5 ${step >= 1 ? 'text-[#002f34]' : 'text-gray-400'}`}>
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step >= 1 ? 'bg-[#002f34] text-white' : 'bg-gray-300'}`}>1</span>
                <span>Category</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-gray-400" />

              <div className={`flex items-center gap-1.5 ${step >= 2 ? 'text-[#002f34]' : 'text-gray-400'}`}>
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step >= 2 ? 'bg-[#002f34] text-white' : 'bg-gray-300'}`}>2</span>
                <span>Details & Price</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-gray-400" />

              <div className={`flex items-center gap-1.5 ${step >= 3 ? 'text-[#002f34]' : 'text-gray-400'}`}>
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step >= 3 ? 'bg-[#002f34] text-white' : 'bg-gray-300'}`}>3</span>
                <span>Photos ({images.length})</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-gray-400" />

              <div className={`flex items-center gap-1.5 ${step >= 4 ? 'text-[#002f34]' : 'text-gray-400'}`}>
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step >= 4 ? 'bg-[#002f34] text-white' : 'bg-gray-300'}`}>4</span>
                <span>Location & Review</span>
              </div>
            </div>

            {/* STEP 1: HIERARCHICAL CATEGORY SELECTION */}
            {step === 1 && (
              <div className="p-6 space-y-5 overflow-y-auto flex-1">
                <div>
                  <h3 className="text-base font-bold text-[#002f34]">Choose a Category</h3>
                  <p className="text-xs text-gray-500">Select the top-level category and specific subcategory for your listing</p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => {
                        const firstSub = cat.subcategories[0] || 'General';
                        setSelectedCategory(cat.id);
                        setSelectedSubcategory(firstSub);
                        if (cat.id === 'dating_friendship') {
                          setPrice(0);
                          applySubcategoryDefaults(cat.id, firstSub);
                          if (images.length === 1 && images[0] === DEFAULT_ITEM_IMAGE) {
                            setImages([DEFAULT_PERSONALS_IMAGE]);
                          }
                        } else if (images.length === 1 && images[0] === DEFAULT_PERSONALS_IMAGE) {
                          setImages([DEFAULT_ITEM_IMAGE]);
                          if (price === 0) setPrice('');
                        }
                      }}
                      className={`p-3 rounded-lg border text-left flex flex-col justify-between transition-all cursor-pointer ${
                        selectedCategory === cat.id
                          ? 'border-[#002f34] bg-cyan-50/60 ring-2 ring-[#002f34]'
                          : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                      }`}
                    >
                      <span className="font-bold text-xs text-[#002f34]">{cat.name}</span>
                      <span className="text-[10px] text-gray-500 mt-1.5">{cat.subcategories.length} subcategories</span>
                    </button>
                  ))}
                </div>

                {/* Subcategories selector */}
                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Subcategories in {currentCatInfo.name}
                    </h4>
                    <button
                      type="button"
                      onClick={() => setIsAddingSubcategory(!isAddingSubcategory)}
                      className="text-xs text-cyan-700 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>+ Add Subcategory</span>
                    </button>
                  </div>

                  {/* Inline Add Subcategory form */}
                  {isAddingSubcategory && (
                    <form onSubmit={handleCreateSubcategoryInline} className="p-2.5 bg-cyan-50 border border-cyan-200 rounded-lg flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="Enter new subcategory name"
                        value={newSubcategoryInput}
                        onChange={(e) => setNewSubcategoryInput(e.target.value)}
                        className="flex-1 px-2.5 py-1 text-xs bg-white border border-gray-300 rounded focus:outline-none focus:border-[#002f34]"
                        autoFocus
                      />
                      <button
                        type="submit"
                        className="px-3 py-1 bg-[#002f34] text-white text-xs font-bold rounded"
                      >
                        Add
                      </button>
                    </form>
                  )}

                  <div className="flex flex-wrap gap-2 pt-1">
                    {currentCatInfo.subcategories.map((sub) => (
                      <button
                        key={sub}
                        type="button"
                        onClick={() => {
                          setSelectedSubcategory(sub);
                          applySubcategoryDefaults(selectedCategory, sub);
                        }}
                        className={`px-3 py-1.5 rounded text-xs font-medium transition-colors cursor-pointer ${
                          selectedSubcategory === sub
                            ? 'bg-[#002f34] text-white font-bold'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
                        }`}
                      >
                        {sub}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="px-6 py-2.5 bg-[#002f34] hover:bg-[#00474e] text-white font-bold text-xs rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                  >
                    <span>Next: Title & Details</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: DETAILS & PRICE */}
            {step === 2 && (
              <div className="p-6 space-y-4 overflow-y-auto flex-1">
                <div>
                  <h3 className="text-base font-bold text-[#002f34]">
                    {isPersonals ? 'Create Your 18+ Personal / Friendship Post' : 'Include some details'}
                  </h3>
                  <p className="text-xs text-gray-500">
                    {isPersonals
                      ? 'Share respectful details about yourself and who you would like to meet (Strictly 18+ Adults)'
                      : 'Provide clear info to help buyers find and trust your ad'}
                  </p>
                </div>

                {isPersonals ? (
                  <div className="space-y-3.5">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-bold text-slate-700">
                          Post Headline * <span className="text-gray-400 font-normal">(Your vibe & what you are looking for)</span>
                        </label>
                        <span className="text-[10px] text-gray-400">{title.length}/70</span>
                      </div>
                      <input
                        type="text"
                        maxLength={70}
                        placeholder="e.g. 27M Software Engineer Seeking Friendly Coffee Partner in Mumbai"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:border-[#002f34]"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">
                          Your Age (18+) *
                        </label>
                        <input
                          type="number"
                          min={18}
                          max={95}
                          placeholder="e.g. 26"
                          value={personalAge}
                          onChange={(e) => setPersonalAge(e.target.value)}
                          className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg font-bold text-gray-900 focus:outline-none focus:border-[#002f34]"
                          required
                        />
                        {personalAge && Number(personalAge) < 18 && (
                          <span className="text-[10px] text-red-600 font-semibold mt-0.5 block">
                            Minimum age must be 18 years.
                          </span>
                        )}
                      </div>

                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">Your Gender *</label>
                        <div className="grid grid-cols-3 gap-1.5">
                          {(['Male', 'Female', 'Other'] as const).map((g) => (
                            <button
                              key={g}
                              type="button"
                              onClick={() => setPersonalGender(g)}
                              className={`py-2 text-[11px] font-semibold rounded border transition-colors cursor-pointer ${
                                personalGender === g
                                  ? 'border-[#002f34] bg-[#002f34] text-white'
                                  : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                              }`}
                            >
                              {g}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">Looking For *</label>
                        <select
                          value={personalLookingFor}
                          onChange={(e) => setPersonalLookingFor(e.target.value)}
                          className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg bg-white font-medium text-slate-800 focus:outline-none focus:border-[#002f34]"
                        >
                          <option value="Women">Women</option>
                          <option value="Men">Men</option>
                          <option value="Friendship & Hangouts">Friendship & Hangouts</option>
                          <option value="Coffee & Travel Partner">Coffee & Travel Partner</option>
                          <option value="Serious Relationship">Serious Relationship</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">Interests & Hobbies</label>
                        <input
                          type="text"
                          placeholder="e.g. Coffee, Long Drives, Movies, Music"
                          value={personalInterests}
                          onChange={(e) => setPersonalInterests(e.target.value)}
                          className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:border-[#002f34]"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">Languages Spoken</label>
                        <input
                          type="text"
                          placeholder="e.g. Hindi, English, Punjabi"
                          value={personalLanguages}
                          onChange={(e) => setPersonalLanguages(e.target.value)}
                          className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:border-[#002f34]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        About Yourself & Partner Preferences *
                      </label>
                      <textarea
                        rows={3}
                        placeholder="Introduce yourself, your profession/hobbies, and the kind of friendship or relationship you are looking for..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:border-[#002f34]"
                      />
                    </div>

                    <label className="flex items-start gap-2.5 p-3 rounded-xl bg-rose-50/70 border border-rose-200 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={confirmedAdult18Plus}
                        onChange={(e) => setConfirmedAdult18Plus(e.target.checked)}
                        className="mt-0.5 rounded border-rose-300 text-[#002f34] focus:ring-[#002f34] w-4 h-4"
                      />
                      <span className="text-xs text-slate-700 leading-relaxed">
                        <strong className="text-slate-900">18+ Age Confirmation:</strong> Meri umar 18 saal ya usse adhik hai aur main confirm karta/karti hoon ki is post me koi explicit, abusive ya paid illegal service shamil nahi hai.
                      </span>
                    </label>
                  </div>
                ) : (
                  <div className="space-y-3.5">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-bold text-slate-700">
                          Ad Title * <span className="text-gray-400 font-normal">(Brand, model, key specs)</span>
                        </label>
                        <span className="text-[10px] text-gray-400">{title.length}/70</span>
                      </div>
                      <input
                        type="text"
                        maxLength={70}
                        placeholder="e.g. Apple MacBook Air M2 256GB Midnight with Bill & Box"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:border-[#002f34]"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">
                          Price (₹) *
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-2 text-xs font-bold text-gray-400">₹</span>
                          <input
                            type="number"
                            placeholder="Set your asking price"
                            value={price}
                            onChange={(e) => setPrice(e.target.value ? Number(e.target.value) : '')}
                            className="w-full pl-7 pr-3 py-2 text-xs border border-gray-300 rounded-lg font-bold text-gray-900 focus:outline-none focus:border-[#002f34]"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">Item Condition</label>
                        <div className="grid grid-cols-4 gap-1.5">
                          {(['Brand New', 'Like New', 'Good', 'Fair'] as const).map((c) => (
                            <button
                              key={c}
                              type="button"
                              onClick={() => setCondition(c)}
                              className={`py-2 text-[11px] font-semibold rounded border transition-colors ${
                                condition === c
                                  ? 'border-[#002f34] bg-[#002f34] text-white'
                                  : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                              }`}
                            >
                              {c}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        Detailed Description * <span className="text-gray-400 font-normal">(Condition, reasons for selling, inclusions)</span>
                      </label>
                      <textarea
                        rows={3}
                        placeholder="Mention condition, accessories included, original invoice availability, any scratches or defects..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:border-[#002f34]"
                      />
                    </div>

                    {/* Category-Specific Attributes */}
                    <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 space-y-2">
                      <span className="text-xs font-bold text-slate-700 block">Item Attributes</span>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        <div>
                          <label className="text-[10px] text-gray-500 block">Brand / Manufacturer</label>
                          <input
                            type="text"
                            placeholder="e.g. Apple / Sony / Samsung"
                            value={attributes['Brand'] || ''}
                            onChange={(e) => setAttributes({ ...attributes, 'Brand': e.target.value })}
                            className="w-full px-2.5 py-1 text-xs bg-white border border-gray-300 rounded"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-gray-500 block">Model / Edition</label>
                          <input
                            type="text"
                            placeholder="e.g. M2 2024"
                            value={attributes['Model'] || ''}
                            onChange={(e) => setAttributes({ ...attributes, 'Model': e.target.value })}
                            className="w-full px-2.5 py-1 text-xs bg-white border border-gray-300 rounded"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-gray-500 block">Warranty Status</label>
                          <input
                            type="text"
                            placeholder="e.g. 6 Months Left"
                            value={attributes['Warranty'] || ''}
                            onChange={(e) => setAttributes({ ...attributes, 'Warranty': e.target.value })}
                            className="w-full px-2.5 py-1 text-xs bg-white border border-gray-300 rounded"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="pt-4 flex justify-between">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="px-4 py-2 text-xs text-gray-600 font-semibold hover:bg-gray-100 rounded-lg"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    disabled={
                      !title.trim() ||
                      (isPersonals
                        ? !personalAge || Number(personalAge) < 18 || !confirmedAdult18Plus
                        : !price)
                    }
                    className="px-6 py-2.5 bg-[#002f34] hover:bg-[#00474e] disabled:opacity-50 text-white font-bold text-xs rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                  >
                    <span>Next: Upload Photos</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: MULTI-IMAGE UPLOAD */}
            {step === 3 && (
              <div className="p-6 space-y-4 overflow-y-auto flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-[#002f34]">Upload Multiple Photos</h3>
                    <p className="text-xs text-gray-500">Upload up to 10 photos of your item. Click any photo to set as Cover!</p>
                  </div>
                  <span className="text-xs font-bold text-cyan-800 bg-cyan-50 px-2.5 py-1 rounded border border-cyan-200">
                    {images.length} / 10 Photos
                  </span>
                </div>

                {/* Drag and Drop File Upload Area */}
                <div
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                    isDragging
                      ? 'border-[#002f34] bg-cyan-50/70 scale-[1.01]'
                      : 'border-gray-300 hover:border-[#002f34] bg-gray-50/60'
                  }`}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    multiple
                    accept="image/*"
                    className="hidden"
                  />
                  <Upload className="w-8 h-8 text-[#002f34] mx-auto mb-2 opacity-80" />
                  <p className="text-xs font-bold text-[#002f34]">
                    Click to browse files or drag & drop images here
                  </p>
                  <p className="text-[11px] text-gray-400 mt-1">
                    Supports JPG, PNG, WEBP files from your computer or phone
                  </p>
                </div>

                {/* Selected Images Gallery */}
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 pt-2">
                  {images.map((img, idx) => (
                    <div 
                      key={idx} 
                      onClick={() => handleSetCoverImage(idx)}
                      className={`relative aspect-square rounded-lg overflow-hidden border-2 group bg-gray-100 cursor-pointer shadow-2xs transition-all ${
                        idx === 0 ? 'border-cyan-600 ring-2 ring-cyan-500' : 'border-gray-200 hover:border-gray-400'
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                      
                      {idx === 0 ? (
                        <span className="absolute bottom-1 left-1 bg-[#002f34] text-[#23e5db] text-[9px] font-black px-1.5 py-0.5 rounded">
                          COVER PHOTO
                        </span>
                      ) : (
                        <span className="absolute bottom-1 left-1 bg-black/60 text-white text-[8px] font-medium px-1 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                          Set as Cover
                        </span>
                      )}

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveImage(idx);
                        }}
                        className="absolute top-1 right-1 w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shadow-sm"
                        title="Remove image"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Add Image by Web URL */}
                <form onSubmit={handleAddCustomImage} className="flex gap-2 pt-2">
                  <input
                    type="url"
                    placeholder="Or paste an image web URL (https://...)"
                    value={customImageUrl}
                    onChange={(e) => setCustomImageUrl(e.target.value)}
                    className="flex-1 px-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:outline-none focus:border-[#002f34]"
                  />
                  <button
                    type="submit"
                    className="px-3.5 py-1.5 bg-gray-800 text-white text-xs font-bold rounded-lg hover:bg-gray-900 cursor-pointer"
                  >
                    Add URL
                  </button>
                </form>

                {/* Sample Presets to quickly pick */}
                <div className="pt-2">
                  <span className="text-[11px] font-bold text-gray-600 block mb-1.5">Or add sample photos:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {SAMPLE_IMAGE_PRESETS.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleAddPresetImage(preset.url)}
                        className="text-[10px] px-2 py-1 bg-gray-100 hover:bg-cyan-50 hover:text-cyan-900 border border-gray-200 rounded transition-colors cursor-pointer"
                      >
                        + {preset.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-4 flex justify-between">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="px-4 py-2 text-xs text-gray-600 font-semibold hover:bg-gray-100 rounded-lg"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep(4)}
                    disabled={images.length === 0}
                    className="px-6 py-2.5 bg-[#002f34] hover:bg-[#00474e] disabled:opacity-50 text-white font-bold text-xs rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                  >
                    <span>Next: Location & Contact</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 4: LOCATION, CONTACT & LIVE PREVIEW */}
            {step === 4 && (
              <form onSubmit={handlePublishAd} className="p-6 space-y-4 overflow-y-auto flex-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h3 className="text-base font-bold text-[#002f34]">Confirm Location & Contact</h3>
                    <p className="text-xs text-gray-500">Choose any State, District, City or Town across All India</p>
                  </div>
                  <button
                    type="button"
                    disabled={gpsDetecting}
                    onClick={async () => {
                      setGpsDetecting(true);
                      try {
                        const detected = await detectCurrentIndianCity();
                        setCity(detected.city);
                        setSelectedState(detected.state);
                        if (detected.area) setArea(detected.area);
                      } catch {
                        // Open search picker if GPS denied
                        setIsLocationModalOpen(true);
                      } finally {
                        setGpsDetecting(false);
                      }
                    }}
                    className="px-3 py-1.5 rounded-lg bg-teal-50 hover:bg-teal-100 border border-teal-300 text-xs font-extrabold text-[#002f34] flex items-center gap-1.5 cursor-pointer"
                  >
                    {gpsDetecting ? (
                      <RefreshCw className="w-3.5 h-3.5 text-teal-700 animate-spin" />
                    ) : (
                      <LocateFixed className="w-3.5 h-3.5 text-teal-700" />
                    )}
                    <span>{gpsDetecting ? 'Detecting...' : 'Auto-Detect GPS'}</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">State / UT *</label>
                    <select
                      value={selectedState}
                      onChange={(e) => {
                        const nextState = e.target.value;
                        setSelectedState(nextState);
                        const stateCities = getCitiesByState(nextState);
                        if (stateCities.length > 0) {
                          setCity(stateCities[0]);
                        }
                      }}
                      className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:border-[#002f34] bg-white font-medium"
                    >
                      {INDIA_STATES_AND_CITIES.map(s => (
                        <option key={s.state} value={s.state}>{s.state}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-bold text-slate-700">City / District *</label>
                      <button
                        type="button"
                        onClick={() => setIsLocationModalOpen(true)}
                        className="text-[11px] font-bold text-teal-700 hover:underline cursor-pointer"
                      >
                        Search All Cities
                      </button>
                    </div>
                    <select
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:border-[#002f34] bg-white font-medium"
                    >
                      {!getCitiesByState(selectedState).includes(city) && (
                        <option value={city}>{city}</option>
                      )}
                      {getCitiesByState(selectedState).map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Neighborhood / Locality / Village *</label>
                  <input
                    type="text"
                    placeholder="e.g. Sector 14, Civil Lines, MG Road, Tehsil..."
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:border-[#002f34]"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Seller Name *</label>
                    <input
                      type="text"
                      value={sellerName}
                      onChange={(e) => setSellerName(e.target.value)}
                      placeholder="Your full name"
                      className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:border-[#002f34]"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Contact Phone *</label>
                    <input
                      type="tel"
                      value={sellerPhone}
                      onChange={(e) => setSellerPhone(e.target.value)}
                      placeholder="+91 98XXXXXXXX"
                      className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:border-[#002f34]"
                      required
                    />
                  </div>
                </div>

                {/* Final Ad Preview Box */}
                <div className="p-3.5 bg-cyan-50/70 border border-cyan-200 rounded-xl space-y-2">
                  <span className="text-[11px] font-black uppercase tracking-wider text-cyan-900 block">
                    LIVE AD PREVIEW
                  </span>
                  <div className="flex items-center gap-3">
                    <img
                      src={images[0]}
                      alt=""
                      className="w-16 h-16 rounded-lg object-cover bg-gray-200 border border-gray-300"
                    />
                    <div className="flex-1 min-w-0">
                      <span className="text-base font-extrabold text-[#002f34] block tabular-nums">
                        {formatListingPrice(Number(price || 0), '₹', selectedCategory)}
                      </span>
                      <p className="text-xs font-bold text-gray-900 truncate">{title || 'Your ad title'}</p>
                      <p className="text-[11px] text-gray-500 truncate">
                        {currentCatInfo.name} · {selectedSubcategory} · {area ? `${area}, ` : ''}{city}, {selectedState}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex justify-between items-center">
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    className="px-4 py-2 text-xs text-gray-600 font-semibold hover:bg-gray-100 rounded-lg cursor-pointer"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    className="px-8 py-3 bg-[#002f34] hover:bg-[#00474e] text-white font-extrabold text-xs rounded-lg shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4 text-[#23e5db]" />
                    <span>POST AD NOW</span>
                  </button>
                </div>
              </form>
            )}

          </div>
        )}

      </div>

      <LocationPickerModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
        selectedCity={city}
        selectedState={selectedState}
        allowAllIndia={false}
        onSelectLocation={(loc) => {
          setCity(loc.city);
          if (loc.state) setSelectedState(loc.state);
          if (loc.area && !area) setArea(loc.area);
        }}
      />
    </div>
  );
};
