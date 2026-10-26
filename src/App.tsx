import React, { useState, useEffect, useMemo } from 'react';
import { Header } from './components/Header';
import { CategoryBar } from './components/CategoryBar';
import { HeroBanner } from './components/HeroBanner';
import { CategoryExplorer } from './components/CategoryExplorer';
import { FilterSidebar } from './components/FilterSidebar';
import { ListingGrid } from './components/ListingGrid';
import { ListingDetailModal } from './components/ListingDetailModal';
import { PostAdModal } from './components/PostAdModal';
import { ChatModal } from './components/ChatModal';
import { MyAdsModal } from './components/MyAdsModal';
import { FavoritesDrawer } from './components/FavoritesDrawer';
import { AuthModal } from './components/AuthModal';
import { AccountModal } from './components/AccountModal';
import { CategoryHierarchyModal } from './components/CategoryHierarchyModal';
import { AdminPanelModal } from './components/AdminPanelModal';
import { Footer } from './components/Footer';
import { MobileBottomNav } from './components/MobileBottomNav';
import { AgeVerificationModal } from './components/AgeVerificationModal';
import { GitHubZipModal } from './components/GitHubZipModal';
import { api, saveAdminToken, clearAdminToken } from './utils/api';
import { isPersonalsCategory } from './utils/formatters';
import {
  INITIAL_LISTINGS,
  INITIAL_CONVERSATIONS,
  INITIAL_NOTIFICATIONS,
  CATEGORIES,
} from './data/mockData';
import { getStateForCity } from './data/indiaLocations';
import {
  Listing,
  FilterState,
  Conversation,
  NotificationItem,
  UserProfile,
  CategoryInfo,
  SiteSettings,
} from './types';
import { X, SlidersHorizontal, CheckCircle2, Megaphone, Wrench } from 'lucide-react';

const STORAGE_KEYS = {
  LISTINGS: 'olx_listings_v2',
  FAVORITES: 'olx_favorites_v2',
  CONVERSATIONS: 'olx_conversations_v2',
  NOTIFICATIONS: 'olx_notifications_v2',
  USER: 'soldx_auth_user_v3',
  CATEGORIES: 'olx_categories_v2',
};

const AUTHORIZED_ADMIN_EMAIL = 'sonuvarma891@gmail.com';

export default function App() {
  // 1. Core State
  const [listings, setListings] = useState<Listing[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.LISTINGS);
      if (!saved) return INITIAL_LISTINGS;
      const parsed: Listing[] = JSON.parse(saved);
      const missingPersonals = INITIAL_LISTINGS.filter(
        l => l.category === 'dating_friendship' && !parsed.some(existing => existing.id === l.id)
      );
      return missingPersonals.length > 0 ? [...missingPersonals, ...parsed] : parsed;
    } catch {
      return INITIAL_LISTINGS;
    }
  });

  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.FAVORITES);
      return saved ? JSON.parse(saved) : ['olx-102', 'olx-103'];
    } catch {
      return ['olx-102', 'olx-103'];
    }
  });

  const [conversations, setConversations] = useState<Conversation[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CONVERSATIONS);
      return saved ? JSON.parse(saved) : INITIAL_CONVERSATIONS;
    } catch {
      return INITIAL_CONVERSATIONS;
    }
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
      return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
    } catch {
      return INITIAL_NOTIFICATIONS;
    }
  });

  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    try {
      localStorage.removeItem('olx_user_profile_v2');
      sessionStorage.removeItem('oldx_admin_unlocked');

      const saved = localStorage.getItem(STORAGE_KEYS.USER);
      if (!saved || saved === 'null' || saved === 'logged_out') return null;
      const parsed: UserProfile = JSON.parse(saved);
      if (!parsed || (!parsed.email && !parsed.phone)) return null;
      const isAuthorizedOwner = parsed.email?.trim().toLowerCase() === AUTHORIZED_ADMIN_EMAIL;
      if (!isAuthorizedOwner) {
        clearAdminToken();
        return { ...parsed, role: 'user' };
      }
      return { ...parsed, role: 'admin' };
    } catch {
      return null;
    }
  });

  const [categories, setCategories] = useState<CategoryInfo[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
      if (!saved) return CATEGORIES;
      const parsed: CategoryInfo[] = JSON.parse(saved);
      const missingCats = CATEGORIES.filter(c => !parsed.some(existing => existing.id === c.id));
      return missingCats.length > 0 ? [...parsed, ...missingCats] : parsed;
    } catch {
      return CATEGORIES;
    }
  });

  // 2. Filter State
  const [filters, setFilters] = useState<FilterState>({
    searchQuery: '',
    category: '',
    subcategory: '',
    locationCity: 'All India',
    locationState: '',
    minPrice: '',
    maxPrice: '',
    condition: [],
    sortBy: 'featured',
    onlyUrgent: false,
    onlyVerified: false,
  });

  // 3. UI Modals & Drawers
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [isSellModalOpen, setIsSellModalOpen] = useState(false);
  const [pendingSellAfterLogin, setPendingSellAfterLogin] = useState(false);
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);
  const [activeConversationId, setActiveConversationId] = useState<string | null>('conv-1');
  const [isFavoritesOpen, setIsFavoritesOpen] = useState(false);
  const [isMyAdsOpen, setIsMyAdsOpen] = useState(false);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalInitialTab, setAuthModalInitialTab] = useState<'login' | 'signup' | 'forgot_password'>('login');
  const [isCategoryHierarchyModalOpen, setIsCategoryHierarchyModalOpen] = useState(false);
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [isAgeGateOpen, setIsAgeGateOpen] = useState(false);
  const [isZipModalOpen, setIsZipModalOpen] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    const params = new URLSearchParams(window.location.search);
    return params.get('download') === 'zip' || params.get('zip') === '1';
  });
  const [pendingAdultAction, setPendingAdultAction] = useState<(() => void) | null>(null);
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(() => {
    try {
      const saved = localStorage.getItem('soldx_settings_v2') || localStorage.getItem('oldx_settings_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...parsed,
          siteName: parsed.siteName?.replace(/S*OLDX/gi, 'SOLDX') || 'SOLDX Classifieds',
          announcementText: parsed.announcementText?.replace(/S*OLDX/gi, 'SOLDX') || '🎉 Welcome to SOLDX! Post unlimited free classified ads with real-time buyer-seller chat.',
          contactEmail: 'support@soldx.in',
          contactPhone: '1800-SOLDX-HELP',
        };
      }
      return {
        siteName: 'SOLDX Classifieds',
        announcementText: '🎉 Welcome to SOLDX! Post unlimited free classified ads with real-time buyer-seller chat.',
        announcementActive: true,
        announcementType: 'info',
        maintenanceMode: false,
        currencySymbol: '₹',
        defaultCity: 'All India',
        requireAdApproval: false,
        contactEmail: 'support@soldx.in',
        contactPhone: '1800-SOLDX-HELP',
      };
    } catch {
      return {
        siteName: 'SOLDX Classifieds',
        announcementText: '🎉 Welcome to SOLDX! Post unlimited free classified ads with real-time buyer-seller chat.',
        announcementActive: true,
        announcementType: 'info',
        maintenanceMode: false,
        currencySymbol: '₹',
        defaultCity: 'All India',
        requireAdApproval: false,
        contactEmail: 'support@soldx.in',
        contactPhone: '1800-SOLDX-HELP',
      };
    }
  });
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Synchronize initial data with Node.js Backend Server (/api/*)
  useEffect(() => {
    const fetchBackendData = async () => {
      try {
        const s = await api.getSettings();
        if (s) setSiteSettings(s);
        
        const l = await api.getListings();
        if (l && l.length > 0) setListings(l);

        const c = await api.getCategories();
        if (c && c.length > 0) setCategories(c);
      } catch (e) {
        console.warn('Backend server connecting...');
      }
    };
    fetchBackendData();
  }, []);

  const handleUpdateSettings = (newSettings: SiteSettings) => {
    setSiteSettings(newSettings);
    try {
      localStorage.setItem('soldx_settings_v2', JSON.stringify(newSettings));
    } catch (e) {
      console.error(e);
    }
  };

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.LISTINGS, JSON.stringify(listings));
    } catch (e) {
      console.error(e);
    }
  }, [listings]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(favorites));
    } catch (e) {
      console.error(e);
    }
  }, [favorites]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CONVERSATIONS, JSON.stringify(conversations));
    } catch (e) {
      console.error(e);
    }
  }, [conversations]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(currentUser));
    } catch (e) {
      console.error(e);
    }
  }, [currentUser]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
    } catch (e) {
      console.error(e);
    }
  }, [categories]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Category Subcategory Addition Handler
  const handleAddSubcategory = (categoryId: string, subcategoryName: string) => {
    setCategories(prev =>
      prev.map(cat => {
        if (cat.id === categoryId) {
          if (cat.subcategories.includes(subcategoryName)) return cat;
          return {
            ...cat,
            subcategories: [...cat.subcategories, subcategoryName],
          };
        }
        return cat;
      })
    );
    showToast(`Added subcategory "${subcategoryName}" successfully!`);
  };

  const isAdminUser = Boolean(
    currentUser &&
      currentUser.role === 'admin' &&
      currentUser.email?.trim().toLowerCase() === AUTHORIZED_ADMIN_EMAIL
  );

  useEffect(() => {
    if (!isAdminUser) {
      if (isAdminPanelOpen) setIsAdminPanelOpen(false);
      if (isCategoryHierarchyModalOpen) setIsCategoryHierarchyModalOpen(false);
    }
  }, [isAdminUser, isAdminPanelOpen, isCategoryHierarchyModalOpen]);

  // Auth & Protected Action Handlers
  const handleOpenAuth = (tab: 'login' | 'signup' | 'forgot_password' = 'login') => {
    setAuthModalInitialTab(tab);
    setIsAuthModalOpen(true);
  };

  const handleRequestSell = () => {
    if (!currentUser) {
      setPendingSellAfterLogin(true);
      setAuthModalInitialTab('login');
      setIsAuthModalOpen(true);
      showToast('Ad post karne ke liye pehle Login karein');
      return;
    }
    setIsSellModalOpen(true);
  };

  const handleOpenAdminPanel = () => {
    if (!isAdminUser) return;
    setIsAdminPanelOpen(true);
  };

  const handleLoginSuccess = (user: UserProfile, adminToken?: string) => {
    const isOwner = user.email?.trim().toLowerCase() === AUTHORIZED_ADMIN_EMAIL;
    const safeUser: UserProfile = {
      ...user,
      verified: true,
      role: isOwner ? 'admin' : 'user',
    };
    if (isOwner && adminToken) {
      saveAdminToken(adminToken);
    } else if (!isOwner) {
      clearAdminToken();
    }
    setCurrentUser(safeUser);
    try {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(safeUser));
    } catch (e) {
      console.error(e);
    }
    showToast(`Welcome, ${safeUser.name}!`);
    if (pendingSellAfterLogin) {
      setPendingSellAfterLogin(false);
      setIsSellModalOpen(true);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    clearAdminToken();
    try {
      localStorage.removeItem(STORAGE_KEYS.USER);
      localStorage.removeItem('olx_user_profile_v2');
    } catch (e) {
      console.error(e);
    }
    setIsAdminPanelOpen(false);
    setIsCategoryHierarchyModalOpen(false);
    setIsAccountModalOpen(false);
    showToast('Aap successfully log out ho chuke hain!');
  };

  // Favorites Handler
  const handleToggleFavorite = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setFavorites(prev => {
      if (prev.includes(id)) {
        showToast('Removed from saved favorites');
        return prev.filter(item => item !== id);
      } else {
        showToast('Saved to your favorites!');
        return [...prev, id];
      }
    });
  };

  const requireAdultConfirmation = (action: () => void) => {
    try {
      if (localStorage.getItem('soldx_18plus_verified') === 'true') {
        action();
        return;
      }
    } catch {
      // Proceed to modal prompt
    }
    setPendingAdultAction(() => action);
    setIsAgeGateOpen(true);
  };

  const handleConfirmAdultAge = () => {
    try {
      localStorage.setItem('soldx_18plus_verified', 'true');
    } catch {
      // Ignore storage errors
    }
    setIsAgeGateOpen(false);
    if (pendingAdultAction) {
      pendingAdultAction();
      setPendingAdultAction(null);
    }
  };

  const handleSelectListingWithGate = (listing: Listing) => {
    if (isPersonalsCategory(listing.category)) {
      requireAdultConfirmation(() => setSelectedListing(listing));
      return;
    }
    setSelectedListing(listing);
  };

  const handleFilterChange = (newFilters: Partial<FilterState>) => {
    if (newFilters.category && isPersonalsCategory(newFilters.category)) {
      requireAdultConfirmation(() => {
        setFilters(prev => ({ ...prev, ...newFilters }));
      });
      return;
    }
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const handleResetFilters = () => {
    setFilters({
      searchQuery: '',
      category: '',
      subcategory: '',
      locationCity: 'All India',
      locationState: '',
      minPrice: '',
      maxPrice: '',
      condition: [],
      sortBy: 'featured',
      onlyUrgent: false,
      onlyVerified: false,
    });
  };

  const handleRemoveFilter = (key: keyof FilterState, value?: string) => {
    if (key === 'condition' && value) {
      setFilters(prev => ({ ...prev, condition: prev.condition.filter(c => c !== value) }));
    } else if (key === 'category' || key === 'subcategory') {
      setFilters(prev => ({ ...prev, category: '', subcategory: '' }));
    } else if (key === 'locationState') {
      setFilters(prev => ({
        ...prev,
        locationState: '',
        locationCity: prev.locationCity.startsWith('All ') ? 'All India' : prev.locationCity,
      }));
    } else if (key === 'locationCity') {
      setFilters(prev => ({
        ...prev,
        locationCity: prev.locationState ? `All ${prev.locationState}` : 'All India',
      }));
    } else if (key === 'searchQuery') {
      setFilters(prev => ({ ...prev, searchQuery: '' }));
    } else if (key === 'minPrice' || key === 'maxPrice') {
      setFilters(prev => ({ ...prev, [key]: '' }));
    } else if (key === 'onlyVerified' || key === 'onlyUrgent') {
      setFilters(prev => ({ ...prev, [key]: false }));
    }
  };

  const handleAdCreated = (newListing: Listing) => {
    const isApprovalRequired = siteSettings.requireAdApproval;
    const finalListing = {
      ...newListing,
      status: isApprovalRequired ? ('pending' as const) : ('active' as const)
    };

    // Save to backend REST API
    api.createListing(finalListing);

    setListings(prev => [finalListing, ...prev]);

    // Add notification
    const notif: NotificationItem = {
      id: `notif-${Date.now()}`,
      title: isApprovalRequired ? 'Ad Submitted for Review ⏳' : 'Your ad is Live! 🚀',
      message: isApprovalRequired 
        ? `Your listing "${newListing.title}" was submitted and is pending admin approval.`
        : `Your listing "${newListing.title}" was published successfully in ${newListing.location.city}.`,
      date: 'Just now',
      read: false,
      type: 'listing_approved',
      listingId: newListing.id,
    };
    setNotifications(prev => [notif, ...prev]);
    showToast(isApprovalRequired ? 'Ad submitted for review!' : '🎉 Your Ad was posted successfully!');
  };

  const handleDeleteListing = (id: string) => {
    api.deleteListing(id);
    setListings(prev => prev.filter(item => item.id !== id));
    showToast('Listing deleted successfully.');
  };

  // Start chat with seller on an ad
  const handleStartChat = (listing: Listing, initialMessage?: string) => {
    // Find existing conversation or create new
    const existing = conversations.find(c => c.listingId === listing.id);

    if (existing) {
      setActiveConversationId(existing.id);
      if (initialMessage) {
        handleSendMessage(existing.id, initialMessage);
      }
    } else {
      const newConvId = `conv-${Date.now()}`;
      const isPersonals = isPersonalsCategory(listing.category);
      const defaultMsg =
        initialMessage ||
        (isPersonals
          ? `Hi ${listing.seller.name}! Saw your post "${listing.title}" on SOLDX and would love to connect.`
          : `Hi ${listing.seller.name}, is this still available?`);
      const isOffer = initialMessage?.includes('offer of');
      
      const newConv: Conversation = {
        id: newConvId,
        listingId: listing.id,
        listingTitle: listing.title,
        listingImage: listing.images[0] || '',
        listingPrice: listing.price,
        currency: listing.currency,
        sellerId: listing.seller.id,
        sellerName: listing.seller.name,
        sellerAvatar: listing.seller.avatar,
        lastMessage: defaultMsg,
        lastTimestamp: 'Just now',
        unreadCount: 0,
        messages: [
          {
            id: `m-${Date.now()}`,
            sender: 'buyer',
            text: defaultMsg,
            timestamp: 'Just now',
            isOffer: isOffer,
            offerStatus: isOffer ? 'pending' : undefined,
          },
        ],
      };
      setConversations(prev => [newConv, ...prev]);
      setActiveConversationId(newConvId);

      // Automated member/seller reply after 1.4 seconds
      setTimeout(() => {
        const replies = isPersonals
          ? [
              `Hey! Thanks for reaching out on SOLDX. Nice to connect here — tell me a bit about yourself!`,
              `Hi there! Glad you messaged. What are your favorite spots around ${listing.location.city} for coffee or hangouts?`,
              `Hello! Lovely to hear from you. Looking forward to chatting and getting to know each other!`,
            ]
          : [
              `Hi! Yes, ${listing.title} is available in ${listing.location.area}. When would you like to inspect it?`,
              `Hello! Yes, it is in excellent condition as described. Let me know if you want any specific details or photos.`,
              `Hi there! Yes, ready for pickup. You can reach me on my number or chat here.`,
            ];
        const randomReply = replies[Math.floor(Math.random() * replies.length)];
        
        setConversations(currentConvs => 
          currentConvs.map(c => {
            if (c.id === newConvId) {
              return {
                ...c,
                lastMessage: randomReply,
                lastTimestamp: 'Just now',
                messages: [
                  ...c.messages,
                  {
                    id: `m-reply-${Date.now()}`,
                    sender: 'seller',
                    text: randomReply,
                    timestamp: 'Just now',
                  },
                ],
              };
            }
            return c;
          })
        );
      }, 1400);
    }

    setIsChatModalOpen(true);
  };

  // Send message or Bargaining Offer
  const handleSendMessage = (conversationId: string, text: string, isOffer?: boolean, offerAmount?: number) => {
    const newMessage = {
      id: `m-${Date.now()}`,
      sender: 'buyer' as const,
      text,
      timestamp: 'Just now',
      isOffer,
      offerAmount,
      offerStatus: isOffer ? ('pending' as const) : undefined,
    };

    setConversations(prev =>
      prev.map(c => {
        if (c.id === conversationId) {
          return {
            ...c,
            lastMessage: text,
            lastTimestamp: 'Just now',
            messages: [...c.messages, newMessage],
          };
        }
        return c;
      })
    );

    // Auto seller bargaining reply logic
    setTimeout(() => {
      let replyText = 'Thanks for your message! Let me check and get back to you shortly.';
      
      if (isOffer && offerAmount) {
        const conv = conversations.find(c => c.id === conversationId);
        const listingPrice = conv?.listingPrice || 10000;
        const discountPct = (listingPrice - offerAmount) / listingPrice;

        if (discountPct <= 0.15) {
          // Accept realistic modest discount
          replyText = `Thank you for the fair offer of ₹${offerAmount.toLocaleString('en-IN')}! I accept your offer. Please let me know what time works for pickup.`;
          
          setConversations(prev =>
            prev.map(c => {
              if (c.id === conversationId) {
                return {
                  ...c,
                  agreedPrice: offerAmount,
                  lastMessage: replyText,
                  lastTimestamp: 'Just now',
                  messages: [
                    ...c.messages.map(m => {
                      if (m.isOffer && m.id === newMessage.id) {
                        return { ...m, offerStatus: 'accepted' as const };
                      }
                      return m;
                    }),
                    {
                      id: `m-auto-${Date.now()}`,
                      sender: 'seller',
                      text: replyText,
                      timestamp: 'Just now',
                    },
                  ],
                };
              }
              return c;
            })
          );
          return;
        } else if (discountPct > 0.4) {
          // Decline lowball
          replyText = `Sorry, ₹${offerAmount.toLocaleString('en-IN')} is too low for this item given its pristine condition.`;
          
          setConversations(prev =>
            prev.map(c => {
              if (c.id === conversationId) {
                return {
                  ...c,
                  lastMessage: replyText,
                  lastTimestamp: 'Just now',
                  messages: [
                    ...c.messages.map(m => {
                      if (m.isOffer && m.id === newMessage.id) {
                        return { ...m, offerStatus: 'declined' as const };
                      }
                      return m;
                    }),
                    {
                      id: `m-auto-${Date.now()}`,
                      sender: 'seller',
                      text: replyText,
                      timestamp: 'Just now',
                    },
                  ],
                };
              }
              return c;
            })
          );
          return;
        } else {
          // Counter offer with midway price
          const counterPrice = Math.round(listingPrice - (listingPrice - offerAmount) * 0.5);
          replyText = `I cannot do ₹${offerAmount.toLocaleString('en-IN')}, but how about ₹${counterPrice.toLocaleString('en-IN')}? That is my best final price!`;
          
          setConversations(prev =>
            prev.map(c => {
              if (c.id === conversationId) {
                return {
                  ...c,
                  lastMessage: replyText,
                  lastTimestamp: 'Just now',
                  messages: [
                    ...c.messages.map(m => {
                      if (m.isOffer && m.id === newMessage.id) {
                        return { 
                          ...m, 
                          offerStatus: 'countered' as const,
                          counterAmount: counterPrice 
                        };
                      }
                      return m;
                    }),
                    {
                      id: `m-auto-${Date.now()}`,
                      sender: 'seller',
                      text: replyText,
                      timestamp: 'Just now',
                      isOffer: true,
                      offerAmount: counterPrice,
                      offerStatus: 'pending' as const,
                    },
                  ],
                };
              }
              return c;
            })
          );
          return;
        }
      }

      setConversations(prev =>
        prev.map(c => {
          if (c.id === conversationId) {
            return {
              ...c,
              lastMessage: replyText,
              lastTimestamp: 'Just now',
              messages: [
                ...c.messages,
                {
                  id: `m-auto-${Date.now()}`,
                  sender: 'seller',
                  text: replyText,
                  timestamp: 'Just now',
                },
              ],
            };
          }
          return c;
        })
      );
    }, 1500);
  };

  // Bargaining Action Handlers
  const handleAcceptOffer = (conversationId: string, messageId: string) => {
    setConversations(prev =>
      prev.map(c => {
        if (c.id === conversationId) {
          const targetMsg = c.messages.find(m => m.id === messageId);
          const agreed = targetMsg?.offerAmount;
          return {
            ...c,
            agreedPrice: agreed,
            messages: c.messages.map(m => {
              if (m.id === messageId) {
                return { ...m, offerStatus: 'accepted' as const };
              }
              return m;
            }),
          };
        }
        return c;
      })
    );
    showToast('Offer accepted! You can now arrange inspection and pickup.');
  };

  const handleDeclineOffer = (conversationId: string, messageId: string) => {
    setConversations(prev =>
      prev.map(c => {
        if (c.id === conversationId) {
          return {
            ...c,
            messages: c.messages.map(m => {
              if (m.id === messageId) {
                return { ...m, offerStatus: 'declined' as const };
              }
              return m;
            }),
          };
        }
        return c;
      })
    );
    showToast('Offer was declined.');
  };

  const handleCounterOffer = (conversationId: string, messageId: string, counterAmount: number) => {
    const counterMsgText = `I have countered with ₹${counterAmount.toLocaleString('en-IN')}.`;
    handleSendMessage(conversationId, counterMsgText, true, counterAmount);
    
    setConversations(prev =>
      prev.map(c => {
        if (c.id === conversationId) {
          return {
            ...c,
            messages: c.messages.map(m => {
              if (m.id === messageId) {
                return { ...m, offerStatus: 'countered' as const, counterAmount };
              }
              return m;
            }),
          };
        }
        return c;
      })
    );
    showToast(`Counter offer of ₹${counterAmount.toLocaleString('en-IN')} sent!`);
  };

  // Filter listings pipeline
  const filteredListings = useMemo(() => {
    return listings.filter(item => {
      // 1. Search Query
      if (filters.searchQuery.trim()) {
        const q = filters.searchQuery.toLowerCase();
        const matchTitle = item.title.toLowerCase().includes(q);
        const matchDesc = item.description.toLowerCase().includes(q);
        const matchCat = item.category.toLowerCase().includes(q);
        const matchSub = item.subcategory.toLowerCase().includes(q);
        const matchArea = item.location.area.toLowerCase().includes(q);
        const matchCity = item.location.city.toLowerCase().includes(q);
        const itemState = item.location.state || getStateForCity(item.location.city) || '';
        const matchState = itemState.toLowerCase().includes(q);
        const matchAttrs = Object.values(item.attributes || {}).some(v => 
          String(v).toLowerCase().includes(q)
        );
        if (!matchTitle && !matchDesc && !matchCat && !matchSub && !matchArea && !matchCity && !matchState && !matchAttrs) {
          return false;
        }
      }

      // 2. Category
      if (filters.category && item.category !== filters.category) {
        return false;
      }

      // 3. Subcategory
      if (filters.subcategory && item.subcategory !== filters.subcategory) {
        return false;
      }

      // 4. Location State & City (All-India 36 States/UTs & 800+ Cities)
      if (filters.locationState) {
        const resolvedState = item.location.state || getStateForCity(item.location.city) || '';
        if (resolvedState.toLowerCase() !== filters.locationState.toLowerCase()) {
          return false;
        }
      }

      if (
        filters.locationCity &&
        filters.locationCity !== 'All India' &&
        !filters.locationCity.startsWith('All ')
      ) {
        if (item.location.city.toLowerCase() !== filters.locationCity.toLowerCase()) {
          return false;
        }
      }

      // 5. Min / Max Price
      if (filters.minPrice !== '' && item.price < Number(filters.minPrice)) {
        return false;
      }
      if (filters.maxPrice !== '' && item.price > Number(filters.maxPrice)) {
        return false;
      }

      // 6. Condition
      if (filters.condition.length > 0 && !filters.condition.includes(item.condition)) {
        return false;
      }

      // 7. Verified Seller
      if (filters.onlyVerified && !item.seller.verified) {
        return false;
      }

      // 8. Urgent
      if (filters.onlyUrgent && !item.urgent) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      if (filters.sortBy === 'newest') {
        return (b.isUserListing ? 1 : 0) - (a.isUserListing ? 1 : 0);
      }
      if (filters.sortBy === 'price_low') {
        return a.price - b.price;
      }
      if (filters.sortBy === 'price_high') {
        return b.price - a.price;
      }
      if (filters.sortBy === 'popular') {
        return b.viewsCount - a.viewsCount;
      }
      // default: 'featured'
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;
      return 0;
    });
  }, [listings, filters]);

  const myListings = listings.filter(l => l.isUserListing);
  const totalUnreadChats = conversations.reduce((acc, c) => acc + (c.unreadCount || 0), 0);

  return (
    <div className="min-h-screen flex flex-col bg-[#f7f8f8] text-[#002f34] pb-16 md:pb-0 w-full max-w-full overflow-x-hidden">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-[#002f34] text-white px-5 py-2.5 rounded-full shadow-2xl flex items-center gap-2 text-xs font-bold animate-in fade-in slide-in-from-top-3 max-w-[90vw] text-center">
          <CheckCircle2 className="w-4 h-4 text-[#23e5db] shrink-0" />
          <span className="truncate">{toastMessage}</span>
        </div>
      )}

      {/* Live Site Announcement Banner (Admin Controlled) */}
      {siteSettings.announcementActive && siteSettings.announcementText && (
        <div className={`px-3 sm:px-4 py-2 text-xs font-bold text-center flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 border-b transition-all w-full max-w-full overflow-hidden ${
          siteSettings.announcementType === 'warning' 
            ? 'bg-amber-400 text-slate-900 border-amber-500' 
            : siteSettings.announcementType === 'success'
            ? 'bg-emerald-600 text-white border-emerald-700'
            : 'bg-[#002f34] text-white border-[#003d44]'
        }`}>
          <div className="flex items-center gap-1.5 max-w-full">
            <Megaphone className="w-4 h-4 shrink-0 text-[#23e5db]" />
            <span className="break-words">{siteSettings.announcementText}</span>
          </div>
        </div>
      )}

      {/* Maintenance Mode Notice */}
      {siteSettings.maintenanceMode && (
        <div className="bg-red-600 text-white px-3 sm:px-4 py-2 text-xs font-bold text-center flex flex-wrap items-center justify-center gap-2 w-full max-w-full overflow-hidden">
          <Wrench className="w-4 h-4 shrink-0" />
          <span className="break-words">SOLDX is currently in Maintenance Mode. Visitors can only browse in read-only mode.</span>
        </div>
      )}

      {/* 1. SOLDX Global Header */}
      <Header
        selectedCity={filters.locationCity}
        selectedState={filters.locationState}
        onSelectLocation={({ city, state }) =>
          handleFilterChange({ locationCity: city, locationState: state || '' })
        }
        searchQuery={filters.searchQuery}
        onSearchChange={(query) => handleFilterChange({ searchQuery: query })}
        onSearchSubmit={() => {}}
        favoritesCount={favorites.length}
        unreadChatsCount={totalUnreadChats}
        notifications={notifications}
        currentUser={currentUser}
        onOpenAuth={handleOpenAuth}
        onLogout={handleLogout}
        onOpenSellModal={handleRequestSell}
        onOpenChats={() => setIsChatModalOpen(true)}
        onOpenFavorites={() => setIsFavoritesOpen(true)}
        onOpenMyAds={() => setIsMyAdsOpen(true)}
        onOpenCategoryManager={isAdminUser ? () => setIsCategoryHierarchyModalOpen(true) : undefined}
        onOpenAdminPanel={isAdminUser ? handleOpenAdminPanel : undefined}
        onOpenAccount={() => setIsAccountModalOpen(true)}
        onOpenZipModal={() => setIsZipModalOpen(true)}
        onSelectNotificationListing={(listingId) => {
          const target = listings.find(l => l.id === listingId);
          if (target) setSelectedListing(target);
        }}
      />

      {/* 2. Sub-Header Category Navigation Bar */}
      <CategoryBar
        selectedCategory={filters.category}
        selectedSubcategory={filters.subcategory}
        onSelectCategory={(catId, sub) => handleFilterChange({ category: catId, subcategory: sub || '' })}
        categories={categories}
        onOpenCategoryManager={isAdminUser ? () => setIsCategoryHierarchyModalOpen(true) : undefined}
      />

      {/* 3. Hero Promotional Banner (Only if not actively drilling into search/category) */}
      {!filters.category && !filters.searchQuery && (
        <HeroBanner
          onOpenSellModal={handleRequestSell}
          onExploreCategory={(catId) => handleFilterChange({ category: catId, subcategory: '' })}
        />
      )}

      {/* 4. Visual Category Icons Explorer */}
      <CategoryExplorer
        selectedCategory={filters.category}
        onSelectCategory={(catId) => handleFilterChange({ category: catId, subcategory: '' })}
        categories={categories}
        onOpenCategoryManager={isAdminUser ? () => setIsCategoryHierarchyModalOpen(true) : undefined}
      />

      {/* 5. Main Browse Marketplace Container */}
      <main className="max-w-[1280px] mx-auto px-3 sm:px-4 py-3 sm:py-4 w-full max-w-full flex-1 overflow-x-hidden">
        <div className="flex flex-col md:flex-row gap-4 sm:gap-5 w-full max-w-full">
          
          {/* Desktop Filter Sidebar */}
          <div className="hidden md:block w-60 lg:w-64 shrink-0">
            <FilterSidebar
              filters={filters}
              onFilterChange={handleFilterChange}
              onResetFilters={handleResetFilters}
              totalResultsCount={filteredListings.length}
              categories={categories}
              onOpenCategoryManager={isAdminUser ? () => setIsCategoryHierarchyModalOpen(true) : undefined}
            />
          </div>

          {/* Listings Grid */}
          <ListingGrid
            listings={filteredListings}
            favorites={favorites}
            onToggleFavorite={handleToggleFavorite}
            onSelectListing={handleSelectListingWithGate}
            filters={filters}
            onRemoveFilter={handleRemoveFilter}
            onOpenMobileFilters={() => setIsMobileFiltersOpen(true)}
            onResetFilters={handleResetFilters}
          />

        </div>
      </main>

      {/* 6. Footer */}
      <Footer
        isAdminUser={isAdminUser}
        onOpenAdminPanel={isAdminUser ? handleOpenAdminPanel : undefined}
        onSelectCity={({ city, state }) =>
          handleFilterChange({ locationCity: city, locationState: state || '' })
        }
        onSelectSearch={(query) => handleFilterChange({ searchQuery: query })}
      />

      {/* 7. Mobile Sticky Bottom Navigation */}
      <MobileBottomNav
        unreadChatsCount={totalUnreadChats}
        favoritesCount={favorites.length}
        myAdsCount={myListings.length}
        currentUser={currentUser}
        onOpenHome={handleResetFilters}
        onOpenChats={() => setIsChatModalOpen(true)}
        onOpenSellModal={handleRequestSell}
        onOpenMyAds={() => setIsMyAdsOpen(true)}
        onOpenAccount={() => setIsAccountModalOpen(true)}
      />

      {/* 8. Mobile Filter Drawer */}
      {isMobileFiltersOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs flex justify-end">
          <div className="bg-white w-full max-w-sm h-full shadow-2xl flex flex-col p-4 overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-5 h-5 text-[#002f34]" />
                <span className="font-extrabold text-base text-[#002f34]">Filters</span>
              </div>
              <button
                onClick={() => setIsMobileFiltersOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-3 flex-1">
              <FilterSidebar
                filters={filters}
                onFilterChange={handleFilterChange}
                onResetFilters={handleResetFilters}
                totalResultsCount={filteredListings.length}
                categories={categories}
                onOpenCategoryManager={
                  isAdminUser
                    ? () => {
                        setIsMobileFiltersOpen(false);
                        setIsCategoryHierarchyModalOpen(true);
                      }
                    : undefined
                }
              />
            </div>

            <div className="pt-3 border-t border-slate-200">
              <button
                onClick={() => setIsMobileFiltersOpen(false)}
                className="w-full py-3 bg-[#002f34] text-white font-extrabold text-xs rounded-lg uppercase tracking-wider"
              >
                Apply Filters ({filteredListings.length} Ads)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 9. Listing Detail Modal */}
      {selectedListing && (
        <ListingDetailModal
          listing={selectedListing}
          onClose={() => setSelectedListing(null)}
          isFavorite={favorites.includes(selectedListing.id)}
          onToggleFavorite={handleToggleFavorite}
          onStartChat={(listing, msg) => {
            setSelectedListing(null);
            handleStartChat(listing, msg);
          }}
          onSelectSimilarListing={(similar) => setSelectedListing(similar)}
          allListings={listings}
        />
      )}

      {/* 10. Post Ad ("+ SELL") Modal */}
      <PostAdModal
        isOpen={isSellModalOpen}
        onClose={() => setIsSellModalOpen(false)}
        onAdCreated={handleAdCreated}
        categories={categories}
        onAddSubcategory={handleAddSubcategory}
        currentUser={currentUser}
      />

      {/* 11. Chat & Inquiries / Bargaining Modal */}
      <ChatModal
        isOpen={isChatModalOpen}
        onClose={() => setIsChatModalOpen(false)}
        conversations={conversations}
        activeConversationId={activeConversationId}
        onSelectConversation={(id) => setActiveConversationId(id)}
        onSendMessage={handleSendMessage}
        onAcceptOffer={handleAcceptOffer}
        onDeclineOffer={handleDeclineOffer}
        onCounterOffer={handleCounterOffer}
        onViewListing={(listingId) => {
          const target = listings.find(l => l.id === listingId);
          if (target) {
            setIsChatModalOpen(false);
            setSelectedListing(target);
          }
        }}
      />

      {/* 12. Saved Favorites Drawer */}
      <FavoritesDrawer
        isOpen={isFavoritesOpen}
        onClose={() => setIsFavoritesOpen(false)}
        favorites={favorites}
        allListings={listings}
        onSelectListing={(listing) => {
          setIsFavoritesOpen(false);
          setSelectedListing(listing);
        }}
        onRemoveFavorite={(id) => handleToggleFavorite(id)}
      />

      {/* 13. My Posted Ads Modal */}
      <MyAdsModal
        isOpen={isMyAdsOpen}
        onClose={() => setIsMyAdsOpen(false)}
        myListings={myListings}
        onOpenSellModal={handleRequestSell}
        onSelectListing={(listing) => {
          setIsMyAdsOpen(false);
          setSelectedListing(listing);
        }}
        onDeleteListing={handleDeleteListing}
      />

      {/* 14. User Authentication Modal (Mandatory 6-Digit OTP Login / Signup) */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => {
          setIsAuthModalOpen(false);
          setPendingSellAfterLogin(false);
        }}
        onLoginSuccess={handleLoginSuccess}
        initialTab={authModalInitialTab}
      />

      {/* Account Profile & Logout Drawer/Modal */}
      <AccountModal
        isOpen={isAccountModalOpen}
        onClose={() => setIsAccountModalOpen(false)}
        currentUser={currentUser}
        onOpenAuth={handleOpenAuth}
        onLogout={handleLogout}
        onOpenMyAds={() => setIsMyAdsOpen(true)}
        onOpenFavorites={() => setIsFavoritesOpen(true)}
        onOpenChats={() => setIsChatModalOpen(true)}
        onOpenAdminPanel={isAdminUser ? handleOpenAdminPanel : undefined}
        onOpenCategoryManager={isAdminUser ? () => setIsCategoryHierarchyModalOpen(true) : undefined}
        myAdsCount={myListings.length}
        favoritesCount={favorites.length}
        unreadChatsCount={totalUnreadChats}
      />

      {/* 15. Hierarchical Category Management Modal */}
      {isAdminUser && (
        <CategoryHierarchyModal
          isOpen={isCategoryHierarchyModalOpen}
          onClose={() => setIsCategoryHierarchyModalOpen(false)}
          categories={categories}
          onAddSubcategory={handleAddSubcategory}
          onSelectCategoryFilter={(catId, sub) => {
            handleFilterChange({ category: catId, subcategory: sub || '' });
            setIsCategoryHierarchyModalOpen(false);
          }}
        />
      )}

      {/* 16. SOLDX Backend & Admin Control Center Modal (Strictly Owner Only) */}
      {isAdminUser && (
        <AdminPanelModal
          isOpen={isAdminPanelOpen}
          onClose={() => setIsAdminPanelOpen(false)}
          currentUser={currentUser}
          onAdminAuthenticated={(adminUser) => {
            setCurrentUser(adminUser);
            try {
              localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(adminUser));
            } catch (e) {
              console.error(e);
            }
          }}
          listings={listings}
          onUpdateListings={(newListings) => setListings(newListings)}
          categories={categories}
          onUpdateCategories={(newCats) => setCategories(newCats)}
          siteSettings={siteSettings}
          onUpdateSettings={handleUpdateSettings}
          onOpenZipModal={() => setIsZipModalOpen(true)}
        />
      )}

      {/* 17. 18+ Age Verification Gate Modal (Triggered only on user intent) */}
      <AgeVerificationModal
        isOpen={isAgeGateOpen}
        onConfirm={handleConfirmAdultAge}
        onCancel={() => {
          setIsAgeGateOpen(false);
          setPendingAdultAction(null);
        }}
      />

      {/* 18. GitHub Source Code ZIP Download Center Modal */}
      <GitHubZipModal
        isOpen={isZipModalOpen}
        onClose={() => setIsZipModalOpen(false)}
      />

    </div>
  );
}
