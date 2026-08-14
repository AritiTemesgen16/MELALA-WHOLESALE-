import { pgTable, text, integer, boolean, timestamp, numeric, varchar, jsonb } from 'drizzle-orm/pg-core';

// 1. Categories
export const categories = pgTable('categories', {
  id: varchar('id', { length: 64 }).primaryKey(), // e.g. 'pharmaceuticals'
  name: text('name').notNull(),
  description: text('description').notNull(),
  imageUrl: text('image_url').notNull(),
  productCount: integer('product_count').default(0),
});

// 2. Brands
export const brands = pgTable('brands', {
  id: varchar('id', { length: 64 }).primaryKey(),
  name: text('name').notNull(),
  originCountry: text('origin_country').notNull(),
  category: text('category').notNull(),
  description: text('description').notNull(),
  certifiedQuality: boolean('certified_quality').default(true).notNull(),
  productCount: integer('product_count').default(0).notNull(),
  logoUrl: text('logo_url'),
});

// 3. Products
export const products = pgTable('products', {
  id: varchar('id', { length: 64 }).primaryKey(),
  sku: varchar('sku', { length: 64 }).notNull().unique(),
  name: text('name').notNull(),
  genericName: text('generic_name'),
  category: text('category').notNull(),
  brand: text('brand').notNull(),
  manufacturer: text('manufacturer').notNull(),
  dosageForm: text('dosage_form'),
  packSize: text('pack_size').notNull(),
  moq: integer('moq').default(1).notNull(),
  unitPriceEtb: numeric('unit_price_etb', { precision: 12, scale: 2 }).notNull(),
  tieredPricing: jsonb('tiered_pricing').default([]).notNull(), // PriceTier[]
  efdaRegistrationNo: text('efda_registration_no').notNull(),
  batchNo: text('batch_no').notNull(),
  expiryDate: text('expiry_date').notNull(),
  coldChain: boolean('cold_chain').default(false).notNull(),
  stockQuantity: integer('stock_quantity').default(0).notNull(),
  warehouseLocation: text('warehouse_location').notNull(),
  description: text('description').notNull(),
  storageInstructions: text('storage_instructions').notNull(),
  prescriptionRequired: boolean('prescription_required').default(false).notNull(),
  isStrategic: boolean('is_strategic').default(false).notNull(),
  isFeatured: boolean('is_featured').default(false),
  promotionTag: text('promotion_tag'),
  imageUrl: text('image_url').notNull(),
  images: jsonb('images').default([]).notNull(), // string[] gallery
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 4. Product Images (Relational gallery mapping to Cloudinary)
export const productImages = pgTable('product_images', {
  id: varchar('id', { length: 64 }).primaryKey(),
  productId: varchar('product_id', { length: 64 }).references(() => products.id, { onDelete: 'cascade' }).notNull(),
  secureUrl: text('secure_url').notNull(),
  cloudinaryPublicId: text('cloudinary_public_id'),
  displayOrder: integer('display_order').default(0).notNull(),
  isPrimary: boolean('is_primary').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 5. Users & B2B Customer Profiles
export const users = pgTable('users', {
  id: varchar('id', { length: 64 }).primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash'),
  role: text('role').default('public').notNull(),
  facilityName: text('facility_name').notNull(),
  facilityType: text('facility_type').notNull(),
  businessAddress: text('business_address'),
  region: text('region').default('Addis Ababa'),
  city: text('city').notNull(),
  phone: text('phone').notNull(),
  efdaLicenseNo: text('efda_license_no'),
  tinNumber: text('tin_number'),
  vatRegistered: boolean('vat_registered').default(false).notNull(),
  verificationStatus: text('verification_status').default('PENDING').notNull(),
  efdaVerified: boolean('efda_verified').default(false).notNull(),
  creditLimitEtb: numeric('credit_limit_etb', { precision: 12, scale: 2 }).default('0').notNull(),
  creditUsedEtb: numeric('credit_used_etb', { precision: 12, scale: 2 }).default('0').notNull(),
  assignedSalesRep: text('assigned_sales_rep'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 6. Quotations (RFQs)
export const quotations = pgTable('quotations', {
  id: varchar('id', { length: 64 }).primaryKey(),
  quoteNumber: varchar('quote_number', { length: 64 }).notNull().unique(),
  customerId: varchar('customer_id', { length: 64 }).references(() => users.id),
  customerName: text('customer_name').notNull(),
  facilityName: text('facility_name').notNull(),
  facilityType: text('facility_type').notNull(),
  efdaLicenseNo: text('efda_license_no').notNull(),
  contactEmail: text('contact_email').notNull(),
  contactPhone: text('contact_phone').notNull(),
  shippingCity: text('shipping_city').notNull(),
  status: text('status').default('submitted').notNull(),
  paymentTerms: text('payment_terms').notNull(),
  items: jsonb('items').notNull(), // QuoteItem[]
  subtotalEtb: numeric('subtotal_etb', { precision: 12, scale: 2 }).notNull(),
  discountEtb: numeric('discount_etb', { precision: 12, scale: 2 }).default('0').notNull(),
  vatEtb: numeric('vat_etb', { precision: 12, scale: 2 }).notNull(),
  totalEtb: numeric('total_etb', { precision: 12, scale: 2 }).notNull(),
  customerNotes: text('customer_notes'),
  salesRepNotes: text('sales_rep_notes'),
  aiOptimizationNotes: text('ai_optimization_notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 7. Wholesale Orders
export const orders = pgTable('orders', {
  id: varchar('id', { length: 64 }).primaryKey(),
  orderNumber: varchar('order_number', { length: 64 }).notNull().unique(),
  proFormaNumber: varchar('pro_forma_number', { length: 64 }).notNull(),
  customerId: varchar('customer_id', { length: 64 }).references(() => users.id),
  facilityName: text('facility_name').notNull(),
  facilityType: text('facility_type').notNull(),
  contactName: text('contact_name'),
  contactPhone: text('contact_phone'),
  contactEmail: text('contact_email'),
  items: jsonb('items').notNull(), // OrderItem[]
  subtotalEtb: numeric('subtotal_etb', { precision: 12, scale: 2 }).notNull(),
  discountEtb: numeric('discount_etb', { precision: 12, scale: 2 }).default('0'),
  vatEtb: numeric('vat_etb', { precision: 12, scale: 2 }).notNull(),
  shippingFeeEtb: numeric('shipping_fee_etb', { precision: 12, scale: 2 }).notNull(),
  totalAmountEtb: numeric('total_amount_etb', { precision: 12, scale: 2 }).notNull(),
  status: text('status').default('pending_verification').notNull(),
  paymentStatus: text('payment_status').default('pro_forma_issued').notNull(),
  paymentMethod: text('payment_method').notNull(),
  deliveryCity: text('delivery_city').notNull(),
  deliveryAddress: text('delivery_address').notNull(),
  coldChainHandling: boolean('cold_chain_handling').default(false).notNull(),
  customerNotes: text('customer_notes'),
  salesNotes: text('sales_notes'),
  expectedDeliveryDate: text('expected_delivery_date'),
  confirmationNotice: text('confirmation_notice'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 8. Customer Leads
export const customerLeads = pgTable('customer_leads', {
  id: varchar('id', { length: 64 }).primaryKey(),
  facilityName: text('facility_name').notNull(),
  contactPerson: text('contact_person').notNull(),
  facilityType: text('facility_type').notNull(),
  phone: text('phone').notNull(),
  email: text('email'),
  city: text('city').notNull(),
  efdaStatus: text('efda_status').default('pending_verification').notNull(),
  leadStatus: text('lead_status').default('NEW').notNull(),
  interestedCategories: jsonb('interested_categories').default([]).notNull(),
  estimatedMonthlyVolumeEtb: numeric('estimated_monthly_volume_etb', { precision: 12, scale: 2 }).default('0'),
  lastContacted: text('last_contacted'),
  assignedRepName: text('assigned_rep_name').default('Tewodros Bekele'),
  notes: text('notes'),
  notesLog: jsonb('notes_log').default([]).notNull(), // CustomerLeadNote[]
  source: text('source'),
  abandonedCartAmountEtb: numeric('abandoned_cart_amount_etb', { precision: 12, scale: 2 }),
  abandonedItems: jsonb('abandoned_items').default([]).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 9. Callback Requests
export const callbackRequests = pgTable('callback_requests', {
  id: varchar('id', { length: 64 }).primaryKey(),
  facilityName: text('facility_name').notNull(),
  contactPerson: text('contact_person').notNull(),
  phone: text('phone').notNull(),
  email: text('email'),
  facilityType: text('facility_type').default('Pharmacy'),
  preferredTime: text('preferred_time').default('Anytime'),
  notes: text('notes'),
  status: text('status').default('PENDING').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 10. Promotions
export const promotions = pgTable('promotions', {
  id: varchar('id', { length: 64 }).primaryKey(),
  title: text('title').notNull(),
  type: text('type').notNull(),
  description: text('description').notNull(),
  discountPercent: integer('discount_percent'),
  code: text('code'),
  applicableProductIds: jsonb('applicable_product_ids').default([]),
  badgeText: text('badge_text').notNull(),
  active: boolean('active').default(true).notNull(),
  validUntil: text('valid_until').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 11. Demand Insights
export const demandInsights = pgTable('demand_insights', {
  id: varchar('id', { length: 64 }).primaryKey(),
  searchTerm: text('search_term').notNull(),
  searchCount: integer('search_count').default(1).notNull(),
  quoteRequestCount: integer('quote_request_count').default(0).notNull(),
  category: text('category'),
  inStock: boolean('in_stock').default(true).notNull(),
  estimatedDemandValEtb: numeric('estimated_demand_val_etb', { precision: 12, scale: 2 }).default('100000'),
  lastSearchedAt: timestamp('last_searched_at').defaultNow().notNull(),
});
