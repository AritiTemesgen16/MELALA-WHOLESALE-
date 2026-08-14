import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  Product,
  CartItem,
  QuotationRequest,
  WholesaleOrder,
  UserProfile,
  UserRole,
  CustomerLead,
  Promotion,
  CallbackRequest,
  DemandInsight,
  NotificationItem,
  NotificationEventType,
  NotificationChannel,
  NotificationChannelConfig,
  CategoryInfo,
} from '../types';
import {
  INITIAL_PRODUCTS,
  INITIAL_QUOTATIONS,
  INITIAL_ORDERS,
  INITIAL_LEADS,
  INITIAL_USER_PROFILES,
  INITIAL_PROMOTIONS,
  INITIAL_CALLBACKS,
  INITIAL_DEMAND_INSIGHTS,
  INITIAL_CATEGORIES,
} from '../data/mockData';
import {
  INITIAL_NOTIFICATIONS,
  createAndDispatchNotification,
  getChannelStatuses,
} from '../services/notificationService';
import {
  fetchProducts,
  fetchQuotations,
  fetchOrders,
  fetchLeads,
  fetchUsers,
  createQuotation,
  createOrder,
  fetchPromotions,
  fetchCallbacks,
  fetchDemandInsights,
  toggleProductFeature,
  createCallback,
  addLeadNote,
  updateLead,
  fetchCategories,
} from '../services/api';

export type PageView =
  | 'home'
  | 'catalog'
  | 'product-detail'
  | 'customer-portal'
  | 'sales-rep'
  | 'admin'
  | 'about-contact';

interface AppContextType {
  currentPage: PageView;
  setCurrentPage: (page: PageView) => void;
  selectedProductId: string | null;
  setSelectedProductId: (id: string | null) => void;

  // Search Query
  searchQuery: string;
  setSearchQuery: (query: string) => void;

  // Role & User
  currentRole: UserRole;
  switchRole: (role: UserRole) => void;
  currentUser: UserProfile;
  setCurrentUser: React.Dispatch<React.SetStateAction<UserProfile>>;
  allUsers: UserProfile[];
  logoutUser: () => void;

  // Auth Modal
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  authModalMode: 'login' | 'signup' | 'register_facility' | 'forgot_password';
  setAuthModalMode: (mode: 'login' | 'signup' | 'register_facility' | 'forgot_password') => void;
  openAuthModal: (mode?: 'login' | 'signup' | 'register_facility' | 'forgot_password') => void;


  // Data
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  quotations: QuotationRequest[];
  setQuotations: React.Dispatch<React.SetStateAction<QuotationRequest[]>>;
  orders: WholesaleOrder[];
  setOrders: React.Dispatch<React.SetStateAction<WholesaleOrder[]>>;
  leads: CustomerLead[];
  setLeads: React.Dispatch<React.SetStateAction<CustomerLead[]>>;
  promotions: Promotion[];
  setPromotions: React.Dispatch<React.SetStateAction<Promotion[]>>;
  callbacks: CallbackRequest[];
  setCallbacks: React.Dispatch<React.SetStateAction<CallbackRequest[]>>;
  demandInsights: DemandInsight[];
  setDemandInsights: React.Dispatch<React.SetStateAction<DemandInsight[]>>;
  categories: CategoryInfo[];
  setCategories: React.Dispatch<React.SetStateAction<CategoryInfo[]>>;
  editingProduct: Product | null;
  setEditingProduct: (product: Product | null) => void;

  // RFQ Cart & Reorder
  cartItems: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  reorderPastOrder: (order: WholesaleOrder) => void;
  cartCount: number;
  cartSubtotalEtb: number;

  // Wishlist
  favorites: string[];
  toggleFavorite: (productId: string) => void;

  // Modals & Drawers
  isQuoteDrawerOpen: boolean;
  setIsQuoteDrawerOpen: (open: boolean) => void;
  proFormaModalOrder: WholesaleOrder | null;
  setProFormaModalOrder: (order: WholesaleOrder | null) => void;
  isVerificationModalOpen: boolean;
  setIsVerificationModalOpen: (open: boolean) => void;
  isNewProductModalOpen: boolean;
  setIsNewProductModalOpen: (open: boolean) => void;
  isCallbackModalOpen: boolean;
  setIsCallbackModalOpen: (open: boolean) => void;
  isNotificationModalOpen: boolean;
  setIsNotificationModalOpen: (open: boolean) => void;

  // Notifications Engine
  notifications: NotificationItem[];
  unreadNotificationCount: number;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  clearNotifications: () => void;
  dispatchNotification: (params: {
    eventType: NotificationEventType;
    audience: 'CUSTOMER' | 'ADMIN' | 'SALES_REP' | 'ALL';
    recipientId?: string;
    recipientName?: string;
    recipientEmail?: string;
    recipientPhone?: string;
    title: string;
    message: string;
    targetChannels?: NotificationChannel[];
    relatedEntityId?: string;
  }) => Promise<NotificationItem>;
  channelConfigs: NotificationChannelConfig[];
  sendTestNotification: (eventType: NotificationEventType, targetChannel: NotificationChannel) => Promise<void>;

  // Toast
  toastMessage: { title: string; desc?: string; type?: 'success' | 'info' | 'error' } | null;
  showToast: (title: string, desc?: string, type?: 'success' | 'info' | 'error') => void;

  // Actions
  toggleProductFeatured: (productId: string, isFeatured: boolean, tag?: string) => Promise<boolean>;
  submitCallbackRequest: (payload: {
    facilityName: string;
    contactPerson: string;
    phone: string;
    email?: string;
    facilityType?: string;
    preferredTime?: string;
    notes?: string;
  }) => Promise<boolean>;
  recordLeadNote: (leadId: string, note: string, actionType?: string) => Promise<boolean>;
  changeLeadStatus: (leadId: string, status: any) => Promise<boolean>;

  submitQuoteRequest: (payload: {
    paymentTerms: 'Cash on Delivery' | '30-Day Credit Line' | 'Letter of Credit (LC)' | 'Advance Bank Transfer';
    shippingCity: string;
    customNotes?: string;
  }) => Promise<boolean>;

  submitDirectOrder: (payload: {
    paymentMethod: 'Bank Transfer (CBE)' | 'Dashen Bank' | 'Telebirr SuperApp' | 'Credit Terms';
    deliveryCity: string;
    deliveryAddress: string;
    customerNotes?: string;
  }) => Promise<WholesaleOrder | null>;

  saveOrderDraft: (payload: {
    deliveryCity: string;
    deliveryAddress: string;
    customerNotes?: string;
  }) => Promise<WholesaleOrder | null>;

  updateOrderStatus: (orderId: string, status: any) => Promise<boolean>;
  updateQuoteStatus: (quoteId: string, status: any, salesRepNotes?: string) => Promise<boolean>;

  refreshData: () => Promise<void>;
}

function getPageViewFromPath(): PageView {
  if (typeof window === 'undefined') return 'home';
  const path = window.location.pathname.toLowerCase();
  const hash = window.location.hash.toLowerCase();

  if (path.includes('/about') || hash.includes('about') || path.includes('/contact')) return 'about-contact';
  if (path.includes('/catalog') || hash.includes('catalog')) return 'catalog';
  if (path.includes('/product') || hash.includes('product')) return 'product-detail';
  if (path.includes('/customer') || path.includes('/orders') || hash.includes('customer')) return 'customer-portal';
  if (path.includes('/sales') || hash.includes('sales')) return 'sales-rep';
  if (path.includes('/admin') || hash.includes('admin')) return 'admin';
  return 'home';
}

function getPathFromPageView(page: PageView): string {
  switch (page) {
    case 'about-contact':
      return '/about';
    case 'catalog':
      return '/catalog';
    case 'product-detail':
      return '/product-detail';
    case 'customer-portal':
      return '/customer-portal';
    case 'sales-rep':
      return '/sales-rep';
    case 'admin':
      return '/admin';
    case 'home':
    default:
      return '/';
  }
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentPage, setCurrentPageState] = useState<PageView>(() => getPageViewFromPath());

  const setCurrentPage = (page: PageView) => {
    setCurrentPageState(page);
    if (typeof window !== 'undefined') {
      const targetPath = getPathFromPageView(page);
      if (window.location.pathname !== targetPath) {
        window.history.pushState({ page }, '', targetPath);
      }
    }
  };

  useEffect(() => {
    const handlePopState = () => {
      const page = getPageViewFromPath();
      setCurrentPageState(page);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [allUsers, setAllUsers] = useState<UserProfile[]>(INITIAL_USER_PROFILES);
  const [currentRole, setCurrentRole] = useState<UserRole>('public');
  const [currentUser, setCurrentUser] = useState<UserProfile>(INITIAL_USER_PROFILES[0]);


  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [quotations, setQuotations] = useState<QuotationRequest[]>(INITIAL_QUOTATIONS);
  const [orders, setOrders] = useState<WholesaleOrder[]>(INITIAL_ORDERS);
  const [leads, setLeads] = useState<CustomerLead[]>(INITIAL_LEADS);
  const [promotions, setPromotions] = useState<Promotion[]>(INITIAL_PROMOTIONS);
  const [callbacks, setCallbacks] = useState<CallbackRequest[]>(INITIAL_CALLBACKS);
  const [demandInsights, setDemandInsights] = useState<DemandInsight[]>(INITIAL_DEMAND_INSIGHTS);
  const [categories, setCategories] = useState<CategoryInfo[]>(INITIAL_CATEGORIES);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [favorites, setFavorites] = useState<string[]>(['prod-101', 'prod-201']);

  // Modals
  const [isQuoteDrawerOpen, setIsQuoteDrawerOpen] = useState<boolean>(false);
  const [proFormaModalOrder, setProFormaModalOrder] = useState<WholesaleOrder | null>(null);
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState<boolean>(false);
  const [isNewProductModalOpen, setIsNewProductModalOpen] = useState<boolean>(false);
  const [isCallbackModalOpen, setIsCallbackModalOpen] = useState<boolean>(false);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState<boolean>(false);

  // Notifications State & Logic
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);

  const unreadNotificationCount = notifications.filter((n) => !n.read).length;

  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const markAllNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const dispatchNotification = async (params: {
    eventType: NotificationEventType;
    audience: 'CUSTOMER' | 'ADMIN' | 'SALES_REP' | 'ALL';
    recipientId?: string;
    recipientName?: string;
    recipientEmail?: string;
    recipientPhone?: string;
    title: string;
    message: string;
    targetChannels?: NotificationChannel[];
    relatedEntityId?: string;
  }): Promise<NotificationItem> => {
    const notif = await createAndDispatchNotification(params);
    setNotifications((prev) => [notif, ...prev]);
    return notif;
  };

  const channelConfigs = getChannelStatuses();

  const sendTestNotification = async (eventType: NotificationEventType, targetChannel: NotificationChannel) => {
    await dispatchNotification({
      eventType,
      audience: 'ALL',
      title: `[TEST EVENT] ${eventType.replace(/_/g, ' ')}`,
      message: `Simulated test notification triggered for channel [${targetChannel}]. Verified multi-channel dispatch engine.`,
      targetChannels: [targetChannel, 'IN_APP'],
    });
    showToast('Test Notification Dispatched', `Triggered ${eventType} on channel [${targetChannel}]`, 'info');
  };

  // Auth Modal
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'signup' | 'register_facility' | 'forgot_password'>('login');

  const openAuthModal = (mode: 'login' | 'signup' | 'register_facility' | 'forgot_password' = 'login') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };


  const logoutUser = () => {
    const publicUser = allUsers.find((u) => u.role === 'public') || INITIAL_USER_PROFILES[0];
    setCurrentUser(publicUser);
    setCurrentRole('public');
    showToast('Logged Out', 'Your session has been logged out.', 'info');
  };

  // Toast
  const [toastMessage, setToastMessage] = useState<{ title: string; desc?: string; type?: 'success' | 'info' | 'error' } | null>(null);

  const showToast = (title: string, desc?: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToastMessage({ title, desc, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Sync initial data from backend if available
  const refreshData = async () => {
    const fetchedProds = await fetchProducts();
    if (fetchedProds && fetchedProds.length > 0) setProducts(fetchedProds);

    const fetchedQuotes = await fetchQuotations();
    if (fetchedQuotes && fetchedQuotes.length > 0) setQuotations(fetchedQuotes);

    const fetchedOrds = await fetchOrders();
    if (fetchedOrds && fetchedOrds.length > 0) setOrders(fetchedOrds);

    const fetchedLeads = await fetchLeads();
    if (fetchedLeads && fetchedLeads.length > 0) setLeads(fetchedLeads);

    const fetchedUsers = await fetchUsers();
    if (fetchedUsers && fetchedUsers.length > 0) setAllUsers(fetchedUsers);

    const fetchedPromos = await fetchPromotions();
    if (fetchedPromos && fetchedPromos.length > 0) setPromotions(fetchedPromos);

    const fetchedCbs = await fetchCallbacks();
    if (fetchedCbs && fetchedCbs.length > 0) setCallbacks(fetchedCbs);

    const fetchedDemands = await fetchDemandInsights();
    if (fetchedDemands && fetchedDemands.length > 0) setDemandInsights(fetchedDemands);

    const fetchedCats = await fetchCategories();
    if (fetchedCats && fetchedCats.length > 0) setCategories(fetchedCats);
  };

  useEffect(() => {
    refreshData();
  }, []);

  // Reorder past order
  const reorderPastOrder = (order: WholesaleOrder) => {
    if (!order.items || order.items.length === 0) return;

    let addedCount = 0;
    order.items.forEach((item) => {
      const match = products.find((p) => p.id === item.productId || p.sku === item.sku);
      if (match) {
        addToCart(match, item.quantity);
        addedCount++;
      }
    });

    if (addedCount > 0) {
      showToast(
        'Order Added to Cart',
        `Added ${addedCount} product(s) from Order #${order.orderNumber} to your current RFQ cart.`,
        'success'
      );
      setIsQuoteDrawerOpen(true);
    } else {
      showToast('Reorder Error', 'Products from this past order are currently unavailable.', 'error');
    }
  };

  // Feature Toggle
  const toggleProductFeatured = async (productId: string, isFeatured: boolean, tag?: string) => {
    const updated = await toggleProductFeature(productId, isFeatured, tag);
    if (updated) {
      setProducts((prev) => prev.map((p) => (p.id === productId ? updated : p)));
      showToast(
        'Product Feature Status Updated',
        `${updated.name} is now ${isFeatured ? 'featured' : 'removed from featured'} on the wholesale portal.`,
        'success'
      );
      return true;
    }
    return false;
  };

  // Callback request
  const submitCallbackRequest = async (payload: {
    facilityName: string;
    contactPerson: string;
    phone: string;
    email?: string;
    facilityType?: string;
    preferredTime?: string;
    notes?: string;
  }) => {
    const res = await createCallback(payload);
    if (res.callback) {
      setCallbacks((prev) => [res.callback, ...prev]);
      setIsCallbackModalOpen(false);
      showToast(
        'Callback Request Dispatched',
        `A Melala wholesale specialist will call ${payload.contactPerson} at ${payload.phone}.`,
        'success'
      );

      // Dispatch Notification
      dispatchNotification({
        eventType: 'ADMIN_CALLBACK_REQUEST',
        audience: 'ADMIN',
        title: `Callback Request: ${payload.facilityName}`,
        message: `${payload.contactPerson} (${payload.phone}) requested: "Contact me about wholesale pricing."`,
        recipientPhone: payload.phone,
        recipientEmail: payload.email,
        relatedEntityId: res.callback.id,
        targetChannels: ['IN_APP', 'EMAIL', 'SMS', 'TELEGRAM', 'WHATSAPP'],
      });

      refreshData();
      return true;
    } else {
      showToast('Callback Error', res.error || 'Failed to submit callback request', 'error');
      return false;
    }
  };

  // Record Lead Note
  const recordLeadNote = async (leadId: string, note: string, actionType?: string) => {
    const res = await addLeadNote(leadId, currentUser.name, note, actionType);
    if (res && res.lead) {
      setLeads((prev) => prev.map((l) => (l.id === leadId ? res.lead : l)));
      showToast('Sales Follow-Up Note Recorded', 'Interaction added to customer history log.', 'success');
      return true;
    }
    return false;
  };

  // Change Lead Status
  const changeLeadStatus = async (leadId: string, status: any) => {
    const updated = await updateLead(leadId, { leadStatus: status });
    if (updated) {
      setLeads((prev) => prev.map((l) => (l.id === leadId ? updated : l)));
      showToast('Lead Status Updated', `Pipeline status changed to ${status}`, 'success');
      return true;
    }
    return false;
  };

  useEffect(() => {
    refreshData();
  }, []);

  // Switch role persona
  const switchRole = (role: UserRole) => {
    setCurrentRole(role);
    const matchedUser = allUsers.find((u) => u.role === role) || allUsers[0];
    setCurrentUser(matchedUser);

    showToast(
      `Role Persona Switched to ${role.toUpperCase()}`,
      `Active account: ${matchedUser.facilityName} (${matchedUser.name})`,
      'info'
    );
  };

  // Cart operations
  const addToCart = (product: Product, quantity?: number) => {
    const qty = quantity && quantity > 0 ? quantity : product.moq || 1;

    setCartItems((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        const newQty = existing.quantity + qty;
        // Calculate tiered unit price
        let unitPrice = product.unitPriceEtb;
        if (product.tieredPricing && product.tieredPricing.length > 0) {
          const sorted = [...product.tieredPricing].sort((a, b) => b.minQuantity - a.minQuantity);
          const tier = sorted.find((t) => newQty >= t.minQuantity);
          if (tier) unitPrice = tier.unitPriceEtb;
        }

        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: newQty, selectedTierPrice: unitPrice }
            : item
        );
      } else {
        let unitPrice = product.unitPriceEtb;
        if (product.tieredPricing && product.tieredPricing.length > 0) {
          const sorted = [...product.tieredPricing].sort((a, b) => b.minQuantity - a.minQuantity);
          const tier = sorted.find((t) => qty >= t.minQuantity);
          if (tier) unitPrice = tier.unitPriceEtb;
        }

        return [...prev, { product, quantity: qty, selectedTierPrice: unitPrice }];
      }
    });

    showToast(
      'Item Added to RFQ Cart',
      `${product.name} (Qty: ${qty} ${product.dosageForm || 'Packs'}) added`,
      'success'
    );
  };

  const removeFromCart = (productId: string) => {
    setCartItems((prev) => prev.filter((i) => i.product.id !== productId));
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCartItems((prev) =>
      prev.map((item) => {
        if (item.product.id === productId) {
          let unitPrice = item.product.unitPriceEtb;
          if (item.product.tieredPricing && item.product.tieredPricing.length > 0) {
            const sorted = [...item.product.tieredPricing].sort((a, b) => b.minQuantity - a.minQuantity);
            const tier = sorted.find((t) => quantity >= t.minQuantity);
            if (tier) unitPrice = tier.unitPriceEtb;
          }
          return { ...item, quantity, selectedTierPrice: unitPrice };
        }
        return item;
      })
    );
  };

  const clearCart = () => setCartItems([]);

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const cartSubtotalEtb = cartItems.reduce(
    (acc, item) => acc + item.selectedTierPrice * item.quantity,
    0
  );

  const toggleFavorite = (productId: string) => {
    setFavorites((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    );
  };

  // Submit Quote Request
  const submitQuoteRequest = async (payload: {
    paymentTerms: 'Cash on Delivery' | '30-Day Credit Line' | 'Letter of Credit (LC)' | 'Advance Bank Transfer';
    shippingCity: string;
    customNotes?: string;
  }): Promise<boolean> => {
    if (cartItems.length === 0) return false;

    const items = cartItems.map((ci) => ({
      productId: ci.product.id,
      productName: ci.product.name,
      packSize: ci.product.packSize,
      requestedQty: ci.quantity,
      unitPriceEtb: ci.selectedTierPrice,
      lineTotalEtb: ci.selectedTierPrice * ci.quantity,
      notes: ci.customNotes,
    }));

    const subtotalEtb = items.reduce((acc, i) => acc + i.lineTotalEtb, 0);
    const discountEtb = subtotalEtb > 50000 ? Math.round(subtotalEtb * 0.05) : 0;
    const vatEtb = Math.round((subtotalEtb - discountEtb) * 0.15);
    const totalEtb = subtotalEtb - discountEtb + vatEtb;

    const newQuote: Partial<QuotationRequest> = {
      customerId: currentUser.id,
      customerName: currentUser.name,
      facilityName: currentUser.facilityName || 'Healthcare Facility',
      facilityType: currentUser.facilityType || 'Pharmacy',
      efdaLicenseNo: currentUser.efdaLicenseNo || 'Pending Submission',
      contactEmail: currentUser.email,
      contactPhone: currentUser.phone || '+251 900 000 000',
      shippingCity: payload.shippingCity,
      paymentTerms: payload.paymentTerms,
      customerNotes: payload.customNotes,
      items,
      subtotalEtb,
      discountEtb,
      vatEtb,
      totalEtb,
      status: 'REQUESTED',
    };

    const result = await createQuotation(newQuote);
    if (result) {
      setQuotations((prev) => [result, ...prev]);
      clearCart();
      setIsQuoteDrawerOpen(false);
      showToast(
        'Quotation Request Submitted!',
        `RFQ #${result.quoteNumber} received. "Order subject to Melala confirmation."`,
        'success'
      );

      // Dispatch Notifications
      dispatchNotification({
        eventType: 'ADMIN_NEW_QUOTATION',
        audience: 'ADMIN',
        title: `New RFQ #${result.quoteNumber} Submitted`,
        message: `${currentUser.facilityName || 'Facility'} requested pricing for ${items.length} items (${totalEtb.toLocaleString()} ETB).`,
        relatedEntityId: result.id,
        targetChannels: ['IN_APP', 'EMAIL', 'TELEGRAM'],
      });
      dispatchNotification({
        eventType: 'CUSTOMER_QUOTATION_READY',
        audience: 'CUSTOMER',
        recipientId: currentUser.id,
        recipientEmail: currentUser.email,
        title: `RFQ #${result.quoteNumber} Confirmation`,
        message: `Your quotation request was received. Melala sales team is preparing pro-forma response.`,
        relatedEntityId: result.id,
        targetChannels: ['IN_APP', 'EMAIL', 'SMS'],
      });

      return true;
    }
    return false;
  };

  // Submit Direct Order
  const submitDirectOrder = async (payload: {
    paymentMethod: 'Bank Transfer (CBE)' | 'Dashen Bank' | 'Telebirr SuperApp' | 'Credit Terms';
    deliveryCity: string;
    deliveryAddress: string;
    customerNotes?: string;
  }): Promise<WholesaleOrder | null> => {
    if (cartItems.length === 0) return null;

    const hasColdChain = cartItems.some((ci) => ci.product.coldChain);
    const orderItems = cartItems.map((ci) => ({
      productId: ci.product.id,
      productName: ci.product.name,
      sku: ci.product.sku,
      packSize: ci.product.packSize,
      quantity: ci.quantity,
      unitPriceEtb: ci.selectedTierPrice,
      lineTotalEtb: ci.selectedTierPrice * ci.quantity,
      batchNo: ci.product.batchNo,
      expiryDate: ci.product.expiryDate,
    }));

    const subtotalEtb = orderItems.reduce((acc, i) => acc + i.lineTotalEtb, 0);
    const discountEtb = subtotalEtb > 50000 ? Math.round(subtotalEtb * 0.05) : 0;
    const vatEtb = Math.round((subtotalEtb - discountEtb) * 0.15);
    const shippingFeeEtb = hasColdChain ? 1500 : 800;
    const totalAmountEtb = subtotalEtb - discountEtb + vatEtb + shippingFeeEtb;

    const expectedDeliveryDate = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0];

    const newOrder: Partial<WholesaleOrder> = {
      customerId: currentUser.id,
      facilityName: currentUser.facilityName || 'Health Facility',
      facilityType: currentUser.facilityType || 'Pharmacy',
      contactName: currentUser.name,
      contactPhone: currentUser.phone,
      contactEmail: currentUser.email,
      items: orderItems,
      subtotalEtb,
      discountEtb,
      vatEtb,
      shippingFeeEtb,
      totalAmountEtb,
      status: 'SUBMITTED',
      paymentStatus: 'pro_forma_issued',
      paymentMethod: payload.paymentMethod,
      deliveryCity: payload.deliveryCity,
      deliveryAddress: payload.deliveryAddress,
      customerNotes: payload.customerNotes,
      coldChainHandling: hasColdChain,
      expectedDeliveryDate,
      confirmationNotice: 'Order subject to Melala confirmation.',
    };

    const created = await createOrder(newOrder);
    if (created) {
      setOrders((prev) => [created, ...prev]);
      clearCart();
      setIsQuoteDrawerOpen(false);
      setProFormaModalOrder(created);
      showToast(
        'Wholesale Order Placed!',
        `Order ${created.orderNumber} placed. "Order subject to Melala confirmation."`,
        'success'
      );

      // Dispatch Notifications
      dispatchNotification({
        eventType: 'ADMIN_NEW_ORDER',
        audience: 'ADMIN',
        title: `New Order Placed #${created.orderNumber}`,
        message: `${created.facilityName} placed an order for ${created.totalAmountEtb.toLocaleString()} ETB.`,
        relatedEntityId: created.id,
        targetChannels: ['IN_APP', 'EMAIL', 'TELEGRAM', 'WHATSAPP'],
      });
      dispatchNotification({
        eventType: 'CUSTOMER_ORDER_SUBMITTED',
        audience: 'CUSTOMER',
        recipientId: currentUser.id,
        recipientEmail: currentUser.email,
        recipientPhone: currentUser.phone,
        title: `Order Received #${created.orderNumber}`,
        message: `Your wholesale order totaling ${created.totalAmountEtb.toLocaleString()} ETB was received. Order subject to Melala confirmation.`,
        relatedEntityId: created.id,
        targetChannels: ['IN_APP', 'EMAIL', 'SMS'],
      });

      return created;
    }
    return null;
  };

  // Save Order Draft
  const saveOrderDraft = async (payload: {
    deliveryCity: string;
    deliveryAddress: string;
    customerNotes?: string;
  }): Promise<WholesaleOrder | null> => {
    if (cartItems.length === 0) return null;

    const hasColdChain = cartItems.some((ci) => ci.product.coldChain);
    const orderItems = cartItems.map((ci) => ({
      productId: ci.product.id,
      productName: ci.product.name,
      sku: ci.product.sku,
      packSize: ci.product.packSize,
      quantity: ci.quantity,
      unitPriceEtb: ci.selectedTierPrice,
      lineTotalEtb: ci.selectedTierPrice * ci.quantity,
      batchNo: ci.product.batchNo,
      expiryDate: ci.product.expiryDate,
    }));

    const subtotalEtb = orderItems.reduce((acc, i) => acc + i.lineTotalEtb, 0);
    const discountEtb = subtotalEtb > 50000 ? Math.round(subtotalEtb * 0.05) : 0;
    const vatEtb = Math.round((subtotalEtb - discountEtb) * 0.15);
    const shippingFeeEtb = hasColdChain ? 1500 : 800;
    const totalAmountEtb = subtotalEtb - discountEtb + vatEtb + shippingFeeEtb;

    const draftOrder: Partial<WholesaleOrder> = {
      customerId: currentUser.id,
      facilityName: currentUser.facilityName || 'Health Facility',
      facilityType: currentUser.facilityType || 'Pharmacy',
      contactName: currentUser.name,
      items: orderItems,
      subtotalEtb,
      discountEtb,
      vatEtb,
      shippingFeeEtb,
      totalAmountEtb,
      status: 'DRAFT',
      paymentStatus: 'unpaid',
      paymentMethod: 'Credit Terms',
      deliveryCity: payload.deliveryCity,
      deliveryAddress: payload.deliveryAddress,
      customerNotes: payload.customerNotes,
      coldChainHandling: hasColdChain,
      expectedDeliveryDate: 'Pending Confirmation',
      confirmationNotice: 'Order subject to Melala confirmation.',
    };

    const created = await createOrder(draftOrder);
    if (created) {
      setOrders((prev) => [created, ...prev]);
      showToast('Order Saved as Draft', `Draft #${created.orderNumber} saved to your facility portal.`, 'info');
      return created;
    }
    return null;
  };

  const updateOrderStatus = async (orderId: string, status: any): Promise<boolean> => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, updatedAt: new Date().toISOString() }),
      });
      if (res.ok) {
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, status, updatedAt: new Date().toISOString() } : o))
        );
        showToast('Order Status Updated', `Order changed to ${status}`, 'success');

        dispatchNotification({
          eventType: 'CUSTOMER_ORDER_STATUS_CHANGED',
          audience: 'CUSTOMER',
          title: `Order Status Update: ${status}`,
          message: `Your wholesale order status was updated to ${status}.`,
          relatedEntityId: orderId,
          targetChannels: ['IN_APP', 'EMAIL', 'SMS', 'WHATSAPP'],
        });

        return true;
      }
    } catch (e) {
      console.error(e);
    }
    return false;
  };

  const updateQuoteStatus = async (quoteId: string, status: any, salesRepNotes?: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/quotes/${quoteId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, salesRepNotes, updatedAt: new Date().toISOString() }),
      });
      if (res.ok) {
        setQuotations((prev) =>
          prev.map((q) =>
            q.id === quoteId
              ? { ...q, status, salesRepNotes: salesRepNotes || q.salesRepNotes, updatedAt: new Date().toISOString() }
              : q
          )
        );
        showToast('Quotation Updated', `Quote changed to ${status}`, 'success');

        dispatchNotification({
          eventType: 'CUSTOMER_QUOTATION_READY',
          audience: 'CUSTOMER',
          title: `Pro-Forma Quote Updated: ${status}`,
          message: `Your requested quotation #${quoteId} is now ${status}. ${salesRepNotes ? 'Note: ' + salesRepNotes : ''}`,
          relatedEntityId: quoteId,
          targetChannels: ['IN_APP', 'EMAIL', 'SMS'],
        });

        return true;
      }
    } catch (e) {
      console.error(e);
    }
    return false;
  };

  return (
    <AppContext.Provider
      value={{
        currentPage,
        setCurrentPage,
        selectedProductId,
        setSelectedProductId,
        searchQuery,
        setSearchQuery,
        currentRole,
        switchRole,
        currentUser,
        setCurrentUser,
        allUsers,
        logoutUser,

        isAuthModalOpen,
        setIsAuthModalOpen,
        authModalMode,
        setAuthModalMode,
        openAuthModal,
        products,
        setProducts,
        quotations,
        setQuotations,
        orders,
        setOrders,
        leads,
        setLeads,
        promotions,
        setPromotions,
        callbacks,
        setCallbacks,
        demandInsights,
        setDemandInsights,
        categories,
        setCategories,
        editingProduct,
        setEditingProduct,
        cartItems,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        reorderPastOrder,
        cartCount,
        cartSubtotalEtb,
        favorites,
        toggleFavorite,
        isQuoteDrawerOpen,
        setIsQuoteDrawerOpen,
        proFormaModalOrder,
        setProFormaModalOrder,
        isVerificationModalOpen,
        setIsVerificationModalOpen,
        isNewProductModalOpen,
        setIsNewProductModalOpen,
        isCallbackModalOpen,
        setIsCallbackModalOpen,
        isNotificationModalOpen,
        setIsNotificationModalOpen,
        notifications,
        unreadNotificationCount,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        clearNotifications,
        dispatchNotification,
        channelConfigs,
        sendTestNotification,
        toastMessage,
        showToast,
        toggleProductFeatured,
        submitCallbackRequest,
        recordLeadNote,
        changeLeadStatus,
        submitQuoteRequest,
        submitDirectOrder,
        saveOrderDraft,
        updateOrderStatus,
        updateQuoteStatus,
        refreshData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
