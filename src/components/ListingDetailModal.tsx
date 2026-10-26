import React, { useState } from 'react';
import { 
  X, 
  Heart, 
  Share2, 
  MapPin, 
  ShieldCheck, 
  MessageSquare, 
  Phone, 
  AlertTriangle, 
  ChevronLeft, 
  ChevronRight, 
  Tag, 
  Check, 
  Clock, 
  Eye, 
  CheckCircle2, 
  Calendar,
  Sparkles
} from 'lucide-react';
import { Listing } from '../types';
import { formatCurrency, formatListingPrice, formatCategoryDisplayName, isPersonalsCategory } from '../utils/formatters';

interface ListingDetailModalProps {
  listing: Listing | null;
  onClose: () => void;
  isFavorite: boolean;
  onToggleFavorite: (id: string, e: React.MouseEvent) => void;
  onStartChat: (listing: Listing, initialMessage?: string) => void;
  onSelectSimilarListing?: (listing: Listing) => void;
  allListings: Listing[];
}

export const ListingDetailModal: React.FC<ListingDetailModalProps> = ({
  listing,
  onClose,
  isFavorite,
  onToggleFavorite,
  onStartChat,
  onSelectSimilarListing,
  allListings,
}) => {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [showPhone, setShowPhone] = useState(false);
  const [isOfferOpen, setIsOfferOpen] = useState(false);
  const [customOffer, setCustomOffer] = useState<number | ''>('');
  const [copiedLink, setCopiedLink] = useState(false);

  if (!listing) return null;

  const isPersonals = isPersonalsCategory(listing.category);
  const images = listing.images.length > 0 ? listing.images : ['/assets/personals/personals_cafe_conversation_1793013250297.jpg'];

  const similarListings = allListings
    .filter(item => item.id !== listing.id && (item.category === listing.category || item.location.city === listing.location.city))
    .slice(0, 4);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleQuickOffer = (discountPct: number) => {
    const offerPrice = Math.round(listing.price * (1 - discountPct / 100));
    onStartChat(listing, `Hi, I am interested in "${listing.title}". Would you accept an offer of ${formatCurrency(offerPrice, listing.currency)}?`);
    setIsOfferOpen(false);
  };

  const handleSendCustomOffer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customOffer) return;
    onStartChat(listing, `Hi, I would like to make an offer of ${formatCurrency(Number(customOffer), listing.currency)} for "${listing.title}". Let me know if that works for you!`);
    setIsOfferOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4">
      <div className="bg-[#f2f4f5] rounded-2xl w-full max-w-6xl overflow-hidden shadow-2xl relative my-auto animate-in zoom-in-95 duration-200">
        
        {/* Top Header bar with close */}
        <div className="bg-white px-4 sm:px-6 py-3 border-b border-slate-200 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-2 text-xs text-slate-500 truncate">
            <span className="font-semibold text-slate-800">Home</span>
            <span>/</span>
            <span className="capitalize">{formatCategoryDisplayName(listing.category)}</span>
            <span>/</span>
            <span className="text-slate-900 font-medium truncate max-w-[200px] sm:max-w-md">{listing.title}</span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 max-h-[85vh] overflow-y-auto space-y-6">
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left 2 Columns: Gallery, Overview Specs, Description */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Image Gallery */}
              <div className="bg-black rounded-xl overflow-hidden shadow-sm relative group">
                <div className="relative aspect-16/10 flex items-center justify-center bg-black/90">
                  <img
                    src={images[activeImageIndex]}
                    alt={listing.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-contain"
                  />

                  {/* Previous / Next buttons */}
                  {images.length > 1 && (
                    <>
                      <button
                        onClick={() => setActiveImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))}
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 hover:bg-black text-white flex items-center justify-center transition-all cursor-pointer"
                      >
                        <ChevronLeft className="w-6 h-6" />
                      </button>
                      <button
                        onClick={() => setActiveImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))}
                        className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 hover:bg-black text-white flex items-center justify-center transition-all cursor-pointer"
                      >
                        <ChevronRight className="w-6 h-6" />
                      </button>
                    </>
                  )}

                  {/* Badges */}
                  <div className="absolute top-3 left-3 flex gap-2">
                    {listing.featured && (
                      <span className="bg-[#ffce32] text-[#002f34] text-xs font-black px-2.5 py-1 rounded shadow-md uppercase tracking-wider">
                        Featured Ad
                      </span>
                    )}
                    {listing.urgent && (
                      <span className="bg-red-600 text-white text-xs font-black px-2.5 py-1 rounded shadow-md uppercase tracking-wider">
                        Urgent
                      </span>
                    )}
                  </div>
                </div>

                {/* Thumbnail strip */}
                {images.length > 1 && (
                  <div className="p-3 bg-neutral-900 flex items-center gap-2 overflow-x-auto">
                    {images.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActiveImageIndex(idx)}
                        className={`w-16 h-12 rounded overflow-hidden border-2 transition-all shrink-0 cursor-pointer ${
                          activeImageIndex === idx ? 'border-[#23e5db] scale-105' : 'border-transparent opacity-60 hover:opacity-100'
                        }`}
                      >
                        <img src={img} alt="" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Key Details & Overview Specs Matrix */}
              <div className="bg-white rounded-xl p-5 border border-slate-200 space-y-4 shadow-2xs">
                <h3 className="font-extrabold text-base text-[#002f34] pb-2 border-b border-slate-100">
                  {isPersonals ? 'Profile Details & Preferences (18+)' : 'Overview & Specifications'}
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {isPersonals ? (
                    <div className="p-3 bg-rose-50/60 rounded-lg border border-rose-100">
                      <span className="text-[11px] text-rose-600 font-medium block">Category</span>
                      <span className="text-sm font-bold text-slate-800 truncate block">{listing.subcategory}</span>
                    </div>
                  ) : (
                    <div className="p-3 bg-slate-50 rounded-lg">
                      <span className="text-[11px] text-slate-400 font-medium block">Condition</span>
                      <span className="text-sm font-bold text-slate-800">{listing.condition}</span>
                    </div>
                  )}

                  {Object.entries(listing.attributes || {}).map(([key, val]) => (
                    <div key={key} className="p-3 bg-slate-50 rounded-lg">
                      <span className="text-[11px] text-slate-400 font-medium block">{key}</span>
                      <span className="text-sm font-bold text-slate-800 truncate block">{val}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Full Description */}
              <div className="bg-white rounded-xl p-5 border border-slate-200 space-y-3 shadow-2xs">
                <h3 className="font-extrabold text-base text-[#002f34] pb-2 border-b border-slate-100">
                  Description
                </h3>
                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                  {listing.description}
                </p>
              </div>

              {/* Map & Location Area */}
              <div className="bg-white rounded-xl p-5 border border-slate-200 space-y-3 shadow-2xs">
                <h3 className="font-extrabold text-base text-[#002f34] pb-2 border-b border-slate-100 flex items-center justify-between">
                  <span>Ad Location</span>
                  <span className="text-xs font-semibold text-teal-700 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    {listing.location.city}, {listing.location.area}
                  </span>
                </h3>

                <div className="h-40 rounded-lg bg-linear-to-br from-slate-100 to-slate-200 border border-slate-200 flex flex-col items-center justify-center p-4 text-center relative overflow-hidden">
                  <div className="w-10 h-10 rounded-full bg-[#002f34] text-white flex items-center justify-center mb-2 shadow-md animate-bounce">
                    <MapPin className="w-5 h-5 text-[#23e5db]" />
                  </div>
                  <span className="font-bold text-sm text-slate-800">{listing.location.area}</span>
                  <span className="text-xs text-slate-500">{listing.location.city}, {listing.location.state || 'India'}</span>
                </div>
              </div>

            </div>

            {/* Right Column: Pricing, Seller, Contact CTAs, Safety */}
            <div className="space-y-5">
              
              {/* Pricing & Title Card */}
              <div className="bg-white rounded-xl p-5 border border-slate-200 space-y-4 shadow-2xs">
                <div className="flex items-start justify-between">
                  <div>
                    <span className={`text-2xl sm:text-3xl font-extrabold tracking-tight block tabular-nums ${isPersonals && listing.price === 0 ? 'text-rose-700' : 'text-[#002f34]'}`}>
                      {formatListingPrice(listing.price, listing.currency, listing.category)}
                    </span>
                    <span className="text-xs text-teal-700 font-semibold">
                      {isPersonals ? '18+ Verified Adult Connection' : 'Negotiable & Verified'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleShare}
                      className="p-2 rounded-full border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors relative"
                      title="Share link"
                    >
                      <Share2 className="w-4 h-4" />
                      {copiedLink && (
                        <span className="absolute -bottom-7 right-0 bg-[#002f34] text-white text-[10px] py-0.5 px-2 rounded whitespace-nowrap shadow-md">
                          Link copied!
                        </span>
                      )}
                    </button>

                    <button
                      onClick={(e) => onToggleFavorite(listing.id, e)}
                      className="p-2 rounded-full border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors"
                      title="Favorite"
                    >
                      <Heart className={`w-4 h-4 ${isFavorite ? 'text-red-500 fill-red-500' : ''}`} />
                    </button>
                  </div>
                </div>

                <h1 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                  {listing.title}
                </h1>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{listing.location.area}, {listing.location.city}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{listing.postedDate}</span>
                  </div>
                </div>
              </div>

              {/* Seller / Member Profile Card */}
              <div className="bg-white rounded-xl p-5 border border-slate-200 space-y-4 shadow-2xs">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  {isPersonals ? 'Posted By (18+ Member)' : 'Seller Description'}
                </h4>

                <div className="flex items-center gap-3">
                  <img
                    src={listing.seller.avatar}
                    alt={listing.seller.name}
                    referrerPolicy="no-referrer"
                    className="w-12 h-12 rounded-full object-cover border-2 border-teal-500"
                  />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-slate-900 text-sm">{listing.seller.name}</span>
                      {listing.seller.verified && (
                        <CheckCircle2 className="w-4 h-4 text-teal-600 fill-teal-100" />
                      )}
                    </div>
                    <p className="text-xs text-slate-500">Member since {listing.seller.memberSince}</p>
                    <p className="text-[11px] text-teal-700 font-medium">{listing.seller.responseTime}</p>
                  </div>
                </div>

                {/* Primary Action Buttons */}
                <div className="space-y-2.5 pt-2">
                  <button
                    onClick={() => onStartChat(listing)}
                    className="w-full py-3 bg-[#002f34] hover:bg-[#00424a] text-white font-extrabold text-sm rounded-lg flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
                  >
                    <MessageSquare className="w-4 h-4 text-[#23e5db]" />
                    <span>{isPersonals ? 'Send Message / Connect' : 'Chat with Seller'}</span>
                  </button>

                  {!isPersonals && listing.price > 0 && (
                    <button
                      onClick={() => setIsOfferOpen(true)}
                      className="w-full py-2.5 bg-white border-2 border-[#002f34] text-[#002f34] hover:bg-slate-50 font-bold text-xs rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Tag className="w-4 h-4 text-[#002f34]" />
                      <span>Make an Offer</span>
                    </button>
                  )}

                  {/* Reveal Phone Button */}
                  <button
                    onClick={() => setShowPhone(!showPhone)}
                    className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-lg flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <Phone className="w-4 h-4 text-slate-600" />
                    <span>{showPhone ? listing.seller.phone : `${listing.seller.phone.substring(0, 8)} ••••• (Show Number)`}</span>
                  </button>
                </div>
              </div>

              {/* Safety & Trust Tips */}
              <div className="bg-amber-50 rounded-xl p-4 border border-amber-200 text-xs space-y-2">
                <div className="flex items-center gap-2 font-bold text-amber-900">
                  <AlertTriangle className="w-4 h-4 text-amber-700" />
                  <span>{isPersonals ? '18+ Dating & Meetup Safety Tips' : 'Safety Tips for Buyers'}</span>
                </div>
                {isPersonals ? (
                  <ul className="list-disc list-inside text-amber-800 space-y-1 pl-1 text-[11px] leading-relaxed">
                    <li>Always meet first at a busy, safe public cafe or restaurant.</li>
                    <li>Never transfer advance money, gifts, or private financial details.</li>
                    <li>Respect mutual consent, privacy, and 18+ community guidelines.</li>
                  </ul>
                ) : (
                  <ul className="list-disc list-inside text-amber-800 space-y-1 pl-1 text-[11px] leading-relaxed">
                    <li>Meet the seller at a safe, public location.</li>
                    <li>Check the item thoroughly before paying any money.</li>
                    <li>Beware of unrealistically low prices or fake courier requests.</li>
                  </ul>
                )}
              </div>

              {/* Ad metadata stats */}
              <div className="text-center text-[11px] text-slate-400 space-x-3">
                <span>AD ID: {listing.id}</span>
                <span>•</span>
                <span>Views: {listing.viewsCount}</span>
                <span>•</span>
                <span>Likes: {listing.likesCount}</span>
              </div>

            </div>

          </div>

          {/* Similar Items Carousel */}
          {similarListings.length > 0 && (
            <div className="pt-6 border-t border-slate-200 space-y-4">
              <h3 className="font-extrabold text-lg text-[#002f34]">
                Similar Ads in this category
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {similarListings.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => onSelectSimilarListing && onSelectSimilarListing(item)}
                    className="bg-white rounded-lg border border-slate-200 p-2.5 hover:shadow-md cursor-pointer transition-all flex flex-col justify-between"
                  >
                    <div className="aspect-16/10 rounded overflow-hidden mb-2 bg-slate-100">
                      <img src={item.images[0]} alt="" className="w-full h-full object-cover" />
                    </div>
                    <span className="font-extrabold text-sm text-[#002f34] tabular-nums">
                      {formatListingPrice(item.price, item.currency, item.category)}
                    </span>
                    <p className="text-xs text-slate-700 truncate font-medium">{item.title}</p>
                    <span className="text-[10px] text-slate-400 mt-1">{item.location.city}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>

      {/* Make Offer Popup */}
      {isOfferOpen && (
        <div className="fixed inset-0 z-60 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Tag className="w-5 h-5 text-teal-700" />
                <h3 className="font-extrabold text-base text-slate-900">Make an Offer</h3>
              </div>
              <button onClick={() => setIsOfferOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Listed Price: <strong className="text-slate-900">{formatCurrency(listing.price, listing.currency)}</strong>
            </p>

            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-700 block">Quick Suggestions:</span>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => handleQuickOffer(5)}
                  className="p-2 border border-slate-200 rounded-lg text-xs hover:border-teal-600 hover:bg-teal-50 transition-colors text-center"
                >
                  <span className="font-bold text-slate-900 block">{formatCurrency(Math.round(listing.price * 0.95), listing.currency)}</span>
                  <span className="text-[10px] text-slate-500">5% off</span>
                </button>
                <button
                  onClick={() => handleQuickOffer(10)}
                  className="p-2 border border-slate-200 rounded-lg text-xs hover:border-teal-600 hover:bg-teal-50 transition-colors text-center"
                >
                  <span className="font-bold text-slate-900 block">{formatCurrency(Math.round(listing.price * 0.9), listing.currency)}</span>
                  <span className="text-[10px] text-slate-500">10% off</span>
                </button>
                <button
                  onClick={() => handleQuickOffer(15)}
                  className="p-2 border border-slate-200 rounded-lg text-xs hover:border-teal-600 hover:bg-teal-50 transition-colors text-center"
                >
                  <span className="font-bold text-slate-900 block">{formatCurrency(Math.round(listing.price * 0.85), listing.currency)}</span>
                  <span className="text-[10px] text-slate-500">15% off</span>
                </button>
              </div>
            </div>

            <form onSubmit={handleSendCustomOffer} className="space-y-3 pt-2">
              <label className="text-xs font-bold text-slate-700 block">Or enter custom offer amount (₹):</label>
              <input
                type="number"
                placeholder="Enter your price"
                value={customOffer}
                onChange={(e) => setCustomOffer(e.target.value ? Number(e.target.value) : '')}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-[#002f34]"
                autoFocus
              />
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsOfferOpen(false)}
                  className="flex-1 py-2.5 border border-slate-300 text-slate-700 font-bold text-xs rounded-lg hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!customOffer}
                  className="flex-1 py-2.5 bg-[#002f34] text-white font-bold text-xs rounded-lg hover:bg-[#00474e] disabled:opacity-50"
                >
                  Send Offer in Chat
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
