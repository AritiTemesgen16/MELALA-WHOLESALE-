/**
 * Melala Pharmaceutical Wholesale B2B Platform
 * Domain Interfaces and Types
 */

export type ProductCategory =
  | 'pharmaceuticals'
  | 'medical-supplies'
  | 'medical-equipment'
  | 'cosmetics'
  | 'personal-care'
  | 'other-healthcare';

export interface PriceTier {
  minQuantity: number;
  unitPriceEtb: number;
  tierLabel: string; // e.g. 'Standard Pharmacy', 'Hospital / Bulk (50+ units)', 'Master Wholesaler (200+ units)'
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  genericName?: string;
  category: ProductCategory;
  brand: string;
  manufacturer: string;
  dosageForm?: string; // e.g., 'Tablets', 'Injectable Vial', 'Oral Suspension', 'Topical Cream'
  packSize: string; // e.g., 'Box of 100 Tablets', 'Bottle of 500ml', 'Pack of 10'
  moq: number; // Minimum Order Quantity
  unitPriceEtb: number; // Base wholesale price per pack
  tieredPricing: PriceTier[];
  efdaRegistrationNo: string; // Ethiopian Food and Drug Authority License/Reg No.
  batchNo: string;
  expiryDate: string; // YYYY-MM-DD
  coldChain: boolean; // Requires 2°C - 8°C storage
  stockQuantity: number;
  warehouseLocation: string; // e.g. 'Addis Ababa Central Depot - Bay A4'
  description: string;
  storageInstructions: string;
  prescriptionRequired: boolean;
  isStrategic: boolean; // High-margin / priority promotion item
  isFeatured?: boolean; // Featured strategic product banner
  promotionTag?: string; // e.g., "10% Bulk Discount", "Seasonal Offer"
  imageUrl: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedTierPrice: number;
  customNotes?: string;
}

export interface QuoteItem {
  productId: string;
  productName: string;
  packSize: string;
  requestedQty: number;
  unitPriceEtb: number;
  lineTotalEtb: number;
  notes?: string;
}

export type OrderStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'QUOTATION_SENT'
  | 'CONFIRMED'
  | 'PROCESSING'
  | 'READY_FOR_DELIVERY'
  | 'OUT_FOR_DELIVERY'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'pending_verification'
  | 'approved'
  | 'dispatch_ready'
  | 'in_transit'
  | 'delivered';

export type QuoteStatus =
  | 'REQUESTED'
  | 'UNDER_REVIEW'
  | 'SENT'
  | 'ACCEPTED'
  | 'REJECTED'
  | 'EXPIRED'
  | 'draft'
  | 'submitted'
  | 'approved'
  | 'converted';

export interface QuotationRequest {
  id: string;
  quoteNumber: string;
  customerId?: string;
  customerName: string;
  facilityName: string;
  facilityType: FacilityType;
  efdaLicenseNo: string;
  contactEmail: string;
  contactPhone: string;
  shippingCity: string;
  status: QuoteStatus;
  paymentTerms: 'Cash on Delivery' | '30-Day Credit Line' | 'Letter of Credit (LC)' | 'Advance Bank Transfer';
  items: QuoteItem[];
  subtotalEtb: number;
  discountEtb: number;
  vatEtb: number;
  totalEtb: number;
  customerNotes?: string;
  salesRepNotes?: string;
  aiOptimizationNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  sku: string;
  packSize: string;
  quantity: number;
  unitPriceEtb: number;
  lineTotalEtb: number;
  batchNo: string;
  expiryDate: string;
  discountEtb?: number;
}

export interface WholesaleOrder {
  id: string;
  orderNumber: string;
  customerId: string;
  facilityName: string;
  facilityType: string;
  contactName?: string;
  contactPhone?: string;
  contactEmail?: string;
  items: OrderItem[];
  subtotalEtb: number;
  discountEtb?: number;
  vatEtb: number;
  shippingFeeEtb: number;
  totalAmountEtb: number;
  status: OrderStatus;
  paymentStatus: 'unpaid' | 'pro_forma_issued' | 'partially_paid' | 'paid_in_full';
  paymentMethod: 'Bank Transfer (CBE)' | 'Dashen Bank' | 'Telebirr SuperApp' | 'Credit Terms';
  deliveryCity: string;
  deliveryAddress: string;
  coldChainHandling: boolean;
  proFormaNumber: string;
  customerNotes?: string;
  salesNotes?: string;
  createdAt: string;
  updatedAt?: string;
  expectedDeliveryDate: string;
  confirmationNotice?: string;
}

export type VerificationStatus = 'PENDING' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';

export type FacilityType =
  | 'Pharmacy'
  | 'Drug Store'
  | 'Clinic'
  | 'Hospital'
  | 'Healthcare Org'
  | 'Medical Retailer'
  | 'Other Approved Business';

export type UserRole = 'public' | 'verified_customer' | 'sales_rep' | 'admin';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  facilityName: string;
  facilityType: FacilityType;
  businessAddress?: string;
  region?: string;
  city: string;
  phone: string;
  efdaLicenseNo: string;
  tinNumber: string;
  vatRegistered: boolean;
  verificationStatus: VerificationStatus;
  efdaVerified: boolean;
  creditLimitEtb: number;
  creditUsedEtb: number;
  assignedSalesRep?: string;
  createdAt?: string;
}

export type LeadStatus =
  | 'NEW'
  | 'CONTACTED'
  | 'QUALIFIED'
  | 'QUOTATION_SENT'
  | 'NEGOTIATION'
  | 'CONVERTED'
  | 'LOST'
  | 'new'
  | 'contacted'
  | 'quote_sent'
  | 'negotiation'
  | 'active_client';

export interface CustomerLeadNote {
  id: string;
  author: string;
  note: string;
  createdAt: string;
  actionType?: 'call' | 'email' | 'meeting' | 'quote' | 'status_change';
}

export interface CustomerLead {
  id: string;
  facilityName: string;
  contactPerson: string;
  facilityType: string;
  phone: string;
  email: string;
  city: string;
  efdaStatus: 'verified' | 'pending_verification' | 'unregistered';
  leadStatus: LeadStatus;
  interestedCategories: ProductCategory[];
  estimatedMonthlyVolumeEtb: number;
  lastContacted: string;
  assignedRepName: string;
  notes: string;
  notesLog?: CustomerLeadNote[];
  source?: 'Callback Request' | 'Abandoned Cart' | 'Registration' | 'Inbound Lead' | 'Outbound Pitch';
  abandonedCartAmountEtb?: number;
  abandonedItems?: string[];
}

export type PromotionType =
  | 'promotional_product'
  | 'discount_campaign'
  | 'bulk_purchase_offer'
  | 'seasonal_campaign'
  | 'new_product_promotion';

export interface Promotion {
  id: string;
  title: string;
  type: PromotionType;
  description: string;
  discountPercent?: number;
  code?: string;
  applicableProductIds?: string[];
  badgeText: string;
  active: boolean;
  validUntil: string;
  createdAt: string;
}

export interface CallbackRequest {
  id: string;
  facilityName: string;
  contactPerson: string;
  phone: string;
  email?: string;
  facilityType?: string;
  preferredTime?: string;
  notes?: string;
  status: 'PENDING' | 'CONTACTED' | 'COMPLETED';
  createdAt: string;
}

export interface DemandInsight {
  id: string;
  searchTerm: string;
  searchCount: number;
  quoteRequestCount: number;
  category?: string;
  inStock: boolean;
  estimatedDemandValEtb: number;
  lastSearchedAt: string;
}

export interface Brand {
  id: string;
  name: string;
  originCountry: string;
  category: ProductCategory;
  description: string;
  certifiedQuality: boolean;
  productCount: number;
  logoUrl?: string;
}

export type NotificationChannel = 'EMAIL' | 'SMS' | 'TELEGRAM' | 'WHATSAPP' | 'IN_APP';

export type CustomerNotificationEvent =
  | 'CUSTOMER_REGISTRATION_RECEIVED'
  | 'CUSTOMER_ACCOUNT_APPROVED'
  | 'CUSTOMER_ACCOUNT_REJECTED'
  | 'CUSTOMER_ORDER_SUBMITTED'
  | 'CUSTOMER_ORDER_STATUS_CHANGED'
  | 'CUSTOMER_QUOTATION_READY'
  | 'CUSTOMER_PROMOTION_ANNOUNCED'
  | 'CUSTOMER_REORDER_REMINDER';

export type AdminNotificationEvent =
  | 'ADMIN_NEW_CUSTOMER'
  | 'ADMIN_NEW_ORDER'
  | 'ADMIN_NEW_QUOTATION'
  | 'ADMIN_CALLBACK_REQUEST'
  | 'ADMIN_NEW_LEAD'
  | 'ADMIN_LOW_STOCK_WARNING'
  | 'ADMIN_EXPIRY_WARNING';

export type NotificationEventType = CustomerNotificationEvent | AdminNotificationEvent;

export interface NotificationItem {
  id: string;
  eventType: NotificationEventType;
  audience: 'CUSTOMER' | 'ADMIN' | 'SALES_REP' | 'ALL';
  recipientId?: string; // User ID or 'ADMIN'
  recipientName?: string;
  recipientEmail?: string;
  recipientPhone?: string;
  title: string;
  message: string;
  channelsTriggered: NotificationChannel[];
  channelsDelivered: {
    channel: NotificationChannel;
    status: 'DELIVERED' | 'DEVELOPMENT_MOCK_LOGGED' | 'FAILED' | 'SKIPPED';
    detail: string;
  }[];
  read: boolean;
  createdAt: string;
  relatedEntityId?: string; // Order ID, Quote ID, Lead ID, etc.
}

export interface NotificationChannelConfig {
  channel: NotificationChannel;
  name: string;
  isConfigured: boolean;
  providerName: string;
  envKeys: string[];
  statusText: string;
  enabled: boolean;
}

