import { getDb } from './index.js';
import * as schema from './schema.js';
import { eq } from 'drizzle-orm';
import fs from 'fs';
import path from 'path';
import {
  INITIAL_PRODUCTS,
  INITIAL_QUOTATIONS,
  INITIAL_ORDERS,
  INITIAL_LEADS,
  INITIAL_BRANDS,
  INITIAL_USER_PROFILES,
  INITIAL_PROMOTIONS,
  INITIAL_CALLBACKS,
  INITIAL_DEMAND_INSIGHTS,
  INITIAL_CATEGORIES,
} from '../data/mockData.js';

export async function seedDatabase() {
  const db = getDb();
  if (!db) {
    console.log('PostgreSQL DATABASE_URL not present, skipping database seeding.');
    return false;
  }

  try {
    console.log('Checking and seeding PostgreSQL database...');

    // 1. Seed Categories
    for (const cat of INITIAL_CATEGORIES) {
      await db.insert(schema.categories).values({
        id: cat.id,
        name: cat.name,
        description: cat.description,
        imageUrl: cat.imageUrl,
        productCount: cat.productCount || 0,
      }).onConflictDoNothing();
    }

    // 2. Seed Brands
    for (const b of INITIAL_BRANDS) {
      await db.insert(schema.brands).values({
        id: b.id,
        name: b.name,
        originCountry: b.originCountry,
        category: b.category,
        description: b.description,
        certifiedQuality: b.certifiedQuality,
        productCount: b.productCount,
        logoUrl: b.logoUrl,
      }).onConflictDoNothing();
    }

    // 3. Seed Users
    for (const u of INITIAL_USER_PROFILES) {
      await db.insert(schema.users).values({
        id: u.id,
        name: u.name,
        email: u.email,
        passwordHash: u.password || null,
        role: u.role,
        facilityName: u.facilityName,
        facilityType: u.facilityType,
        businessAddress: u.businessAddress || '',
        region: u.region || 'Addis Ababa',
        city: u.city,
        phone: u.phone,
        efdaLicenseNo: u.efdaLicenseNo || '',
        tinNumber: u.tinNumber || '',
        vatRegistered: u.vatRegistered,
        verificationStatus: u.verificationStatus,
        efdaVerified: u.efdaVerified,
        creditLimitEtb: String(u.creditLimitEtb || 0),
        creditUsedEtb: String(u.creditUsedEtb || 0),
        assignedSalesRep: u.assignedSalesRep,
        createdAt: u.createdAt ? new Date(u.createdAt) : new Date(),
      }).onConflictDoNothing();
    }

    // 4. Seed Products (Include local products.json if available)
    let productsToSeed = [...INITIAL_PRODUCTS];
    try {
      const productsFilePath = path.join(process.cwd(), 'data', 'products.json');
      if (fs.existsSync(productsFilePath)) {
        const fileContent = fs.readFileSync(productsFilePath, 'utf-8');
        const fileProducts = JSON.parse(fileContent);
        if (Array.isArray(fileProducts) && fileProducts.length > 0) {
          // Merge products so local user additions are preserved
          const existingIds = new Set(productsToSeed.map((p) => p.id));
          for (const fp of fileProducts) {
            if (!existingIds.has(fp.id)) {
              productsToSeed.push(fp);
            }
          }
        }
      }
    } catch (e) {
      console.warn('Could not read data/products.json for migration seeding:', e);
    }

    for (const p of productsToSeed) {
      const imagesList = p.images && Array.isArray(p.images) ? p.images : (p.imageUrl ? [p.imageUrl] : []);
      await db.insert(schema.products).values({
        id: p.id,
        sku: p.sku,
        name: p.name,
        genericName: p.genericName || null,
        category: p.category,
        brand: p.brand,
        manufacturer: p.manufacturer,
        dosageForm: p.dosageForm || null,
        packSize: p.packSize,
        moq: p.moq,
        unitPriceEtb: String(p.unitPriceEtb),
        tieredPricing: p.tieredPricing || [],
        efdaRegistrationNo: p.efdaRegistrationNo,
        batchNo: p.batchNo,
        expiryDate: p.expiryDate,
        coldChain: p.coldChain,
        stockQuantity: p.stockQuantity,
        warehouseLocation: p.warehouseLocation,
        description: p.description,
        storageInstructions: p.storageInstructions,
        prescriptionRequired: p.prescriptionRequired,
        isStrategic: p.isStrategic,
        isFeatured: p.isFeatured || false,
        promotionTag: p.promotionTag || null,
        imageUrl: p.imageUrl,
        images: imagesList,
      }).onConflictDoNothing();
    }

    // 5. Seed Quotations
    for (const q of INITIAL_QUOTATIONS) {
      await db.insert(schema.quotations).values({
        id: q.id,
        quoteNumber: q.quoteNumber,
        customerId: q.customerId || null,
        customerName: q.customerName,
        facilityName: q.facilityName,
        facilityType: q.facilityType,
        efdaLicenseNo: q.efdaLicenseNo,
        contactEmail: q.contactEmail,
        contactPhone: q.contactPhone,
        shippingCity: q.shippingCity,
        status: q.status,
        paymentTerms: q.paymentTerms,
        items: q.items || [],
        subtotalEtb: String(q.subtotalEtb),
        discountEtb: String(q.discountEtb || 0),
        vatEtb: String(q.vatEtb),
        totalEtb: String(q.totalEtb),
        customerNotes: q.customerNotes || null,
        salesRepNotes: q.salesRepNotes || null,
        aiOptimizationNotes: q.aiOptimizationNotes || null,
        createdAt: q.createdAt ? new Date(q.createdAt) : new Date(),
        updatedAt: q.updatedAt ? new Date(q.updatedAt) : new Date(),
      }).onConflictDoNothing();
    }

    // 6. Seed Orders
    for (const o of INITIAL_ORDERS) {
      await db.insert(schema.orders).values({
        id: o.id,
        orderNumber: o.orderNumber,
        proFormaNumber: o.proFormaNumber,
        customerId: o.customerId || null,
        facilityName: o.facilityName,
        facilityType: o.facilityType,
        contactName: o.contactName || null,
        contactPhone: o.contactPhone || null,
        contactEmail: o.contactEmail || null,
        items: o.items || [],
        subtotalEtb: String(o.subtotalEtb),
        discountEtb: String(o.discountEtb || 0),
        vatEtb: String(o.vatEtb),
        shippingFeeEtb: String(o.shippingFeeEtb),
        totalAmountEtb: String(o.totalAmountEtb),
        status: o.status,
        paymentStatus: o.paymentStatus,
        paymentMethod: o.paymentMethod,
        deliveryCity: o.deliveryCity,
        deliveryAddress: o.deliveryAddress,
        coldChainHandling: o.coldChainHandling,
        customerNotes: o.customerNotes || null,
        salesNotes: o.salesNotes || null,
        expectedDeliveryDate: o.expectedDeliveryDate || null,
        confirmationNotice: o.confirmationNotice || null,
        createdAt: o.createdAt ? new Date(o.createdAt) : new Date(),
        updatedAt: o.updatedAt ? new Date(o.updatedAt) : new Date(),
      }).onConflictDoNothing();
    }

    // 7. Seed Customer Leads
    for (const l of INITIAL_LEADS) {
      await db.insert(schema.customerLeads).values({
        id: l.id,
        facilityName: l.facilityName,
        contactPerson: l.contactPerson,
        facilityType: l.facilityType,
        phone: l.phone,
        email: l.email || null,
        city: l.city,
        efdaStatus: l.efdaStatus,
        leadStatus: l.leadStatus,
        interestedCategories: l.interestedCategories || [],
        estimatedMonthlyVolumeEtb: String(l.estimatedMonthlyVolumeEtb || 0),
        lastContacted: l.lastContacted,
        assignedRepName: l.assignedRepName,
        notes: l.notes,
        notesLog: l.notesLog || [],
        source: l.source || null,
        abandonedCartAmountEtb: l.abandonedCartAmountEtb ? String(l.abandonedCartAmountEtb) : null,
        abandonedItems: l.abandonedItems || [],
      }).onConflictDoNothing();
    }

    // 8. Seed Callbacks
    for (const cb of INITIAL_CALLBACKS) {
      await db.insert(schema.callbackRequests).values({
        id: cb.id,
        facilityName: cb.facilityName,
        contactPerson: cb.contactPerson,
        phone: cb.phone,
        email: cb.email || null,
        facilityType: cb.facilityType || 'Pharmacy',
        preferredTime: cb.preferredTime || 'Anytime',
        notes: cb.notes || null,
        status: cb.status,
        createdAt: cb.createdAt ? new Date(cb.createdAt) : new Date(),
      }).onConflictDoNothing();
    }

    // 9. Seed Promotions
    for (const p of INITIAL_PROMOTIONS) {
      await db.insert(schema.promotions).values({
        id: p.id,
        title: p.title,
        type: p.type,
        description: p.description,
        discountPercent: p.discountPercent || null,
        code: p.code || null,
        applicableProductIds: p.applicableProductIds || [],
        badgeText: p.badgeText,
        active: p.active,
        validUntil: p.validUntil,
        createdAt: p.createdAt ? new Date(p.createdAt) : new Date(),
      }).onConflictDoNothing();
    }

    // 10. Seed Demand Insights
    for (const d of INITIAL_DEMAND_INSIGHTS) {
      await db.insert(schema.demandInsights).values({
        id: d.id,
        searchTerm: d.searchTerm,
        searchCount: d.searchCount,
        quoteRequestCount: d.quoteRequestCount,
        category: d.category || null,
        inStock: d.inStock,
        estimatedDemandValEtb: String(d.estimatedDemandValEtb),
        lastSearchedAt: d.lastSearchedAt ? new Date(d.lastSearchedAt) : new Date(),
      }).onConflictDoNothing();
    }

    console.log('PostgreSQL database seeded successfully.');
    return true;
  } catch (err) {
    console.error('Error during PostgreSQL database seeding:', err);
    return false;
  }
}
