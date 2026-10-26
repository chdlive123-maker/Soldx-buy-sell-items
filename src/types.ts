export interface Location {
  city: string;
  area: string;
  state?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  memberSince: string;
  verified: boolean;
  otpVerified?: boolean;
  city?: string;
  state?: string;
  role?: 'admin' | 'user';
}

export interface Seller {
  id: string;
  name: string;
  avatar: string;
  memberSince: string;
  rating: number;
  reviewsCount: number;
  verified: boolean;
  phone: string;
  responseTime: string;
}

export interface Listing {
  id: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  category: string;
  subcategory: string;
  images: string[];
  location: Location;
  postedDate: string;
  featured?: boolean;
  urgent?: boolean;
  condition: 'Brand New' | 'Like New' | 'Good' | 'Fair';
  attributes: Record<string, string | number>;
  seller: Seller;
  viewsCount: number;
  likesCount: number;
  isUserListing?: boolean;
  status?: 'active' | 'pending' | 'rejected';
  moderationReason?: string;
  reportedCount?: number;
}

export interface CategoryInfo {
  id: string;
  name: string;
  iconName: string;
  color: string;
  subcategories: string[];
  popularAttributes: string[];
  description?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'buyer' | 'seller';
  text: string;
  timestamp: string;
  isOffer?: boolean;
  offerAmount?: number;
  offerStatus?: 'pending' | 'accepted' | 'declined' | 'countered';
  counterAmount?: number;
  attachmentUrl?: string;
}

export interface Conversation {
  id: string;
  listingId: string;
  listingTitle: string;
  listingImage: string;
  listingPrice: number;
  currency: string;
  sellerId: string;
  sellerName: string;
  sellerAvatar: string;
  lastMessage: string;
  lastTimestamp: string;
  unreadCount: number;
  messages: ChatMessage[];
  agreedPrice?: number;
  isTyping?: boolean;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  date: string;
  read: boolean;
  type: 'chat' | 'price_drop' | 'listing_approved' | 'offer' | 'system';
  listingId?: string;
}

export interface FilterState {
  searchQuery: string;
  category: string;
  subcategory: string;
  locationCity: string;
  locationState?: string;
  minPrice: number | '';
  maxPrice: number | '';
  condition: string[];
  sortBy: 'featured' | 'newest' | 'price_low' | 'price_high' | 'popular';
  onlyUrgent: boolean;
  onlyVerified: boolean;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'admin' | 'moderator' | 'user';
  status: 'active' | 'banned';
  verified: boolean;
  memberSince: string;
  listingsCount: number;
  avatar?: string;
  city?: string;
}

export interface SiteSettings {
  siteName: string;
  announcementText: string;
  announcementActive: boolean;
  announcementType: 'info' | 'warning' | 'success';
  maintenanceMode: boolean;
  currencySymbol: string;
  defaultCity: string;
  requireAdApproval: boolean;
  contactEmail: string;
  contactPhone: string;
  adminPin?: string;
}

export interface PlatformStats {
  listings: {
    total: number;
    active: number;
    pending: number;
    rejected: number;
    featured: number;
    urgent: number;
  };
  users: {
    total: number;
    verified: number;
    banned: number;
  };
  categories: {
    total: number;
    subcategories: number;
  };
  settings?: SiteSettings;
  server: {
    status: 'online' | 'offline' | 'degraded';
    uptime: number;
  };
}

