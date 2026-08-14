import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { v2 as cloudinary } from 'cloudinary';
import { GoogleGenAI } from '@google/genai';
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
} from './src/data/mockData.js';
import { getDb, initDbSchema } from './src/db/index.js';
import { seedDatabase } from './src/db/seed.js';
import * as schema from './src/db/schema.js';
import { eq, or, ilike, and, desc } from 'drizzle-orm';

const currentFilename = typeof __filename !== 'undefined' ? __filename : '';
const currentDirname = typeof __dirname !== 'undefined' ? __dirname : process.cwd();

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;

  app.use(express.json({ limit: '10mb' }));

  // Persistent state for B2B session
  let productsStore: any[] = [];
  let quotationsStore = [...INITIAL_QUOTATIONS];
  let ordersStore = [...INITIAL_ORDERS];
  let leadsStore = [...INITIAL_LEADS];
  let brandsStore = [...INITIAL_BRANDS];
  let usersStore = [...INITIAL_USER_PROFILES];
  let promotionsStore = [...INITIAL_PROMOTIONS];
  let callbacksStore = [...INITIAL_CALLBACKS];
  let demandStore = [...INITIAL_DEMAND_INSIGHTS];
  let categoriesStore = [...INITIAL_CATEGORIES];

  // Cloudinary Configuration for persistent owner photos and media
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });

  async function uploadMediaToCloudinary(
    dataUrl: string,
    categoryFolder: 'products' | 'equipment' | 'categories' | 'owners' | 'general' = 'general',
    customPublicId?: string
  ): Promise<{ url: string; public_id: string } | null> {
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      return null;
    }

    let targetFolder = 'melala/general';
    if (categoryFolder === 'products') targetFolder = 'melala/products';
    else if (categoryFolder === 'equipment') targetFolder = 'melala/equipment';
    else if (categoryFolder === 'categories') targetFolder = 'melala/categories';
    else if (categoryFolder === 'owners') targetFolder = 'melala/owners';

    const options: any = {
      folder: targetFolder,
      resource_type: 'image',
      transformation: [{ quality: 'auto', fetch_format: 'auto' }],
    };

    if (customPublicId) {
      options.public_id = customPublicId;
      options.overwrite = true;
      options.invalidate = true;
    }

    const result = await cloudinary.uploader.upload(dataUrl, options);
    return {
      url: result.secure_url,
      public_id: result.public_id,
    };
  }

  async function deleteMediaFromCloudinary(publicId: string): Promise<boolean> {
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      return false;
    }
    try {
      const res = await cloudinary.uploader.destroy(publicId, { invalidate: true });
      return res.result === 'ok' || res.result === 'not found';
    } catch (err) {
      console.error('Error destroying Cloudinary asset:', err);
      return false;
    }
  }

  function extractCloudinaryPublicId(url: string): string | null {
    if (!url || typeof url !== 'string' || !url.includes('cloudinary.com')) return null;

    try {
      const uploadIndex = url.indexOf('/upload/');
      if (uploadIndex === -1) return null;

      let pathAfterUpload = url.substring(uploadIndex + 8);
      if (pathAfterUpload.match(/^v\d+\//)) {
        pathAfterUpload = pathAfterUpload.replace(/^v\d+\//, '');
      }

      const lastDotIndex = pathAfterUpload.lastIndexOf('.');
      if (lastDotIndex !== -1) {
        pathAfterUpload = pathAfterUpload.substring(0, lastDotIndex);
      }

      if (pathAfterUpload.startsWith('melala/') || pathAfterUpload.startsWith('melala_owners/')) {
        return pathAfterUpload;
      }
    } catch (err) {
      console.error('Error extracting Cloudinary public_id:', err);
    }

    return null;
  }

  async function uploadOwnerPhotoToCloudinary(dataUrl: string, ownerKey: 'samuel' | 'emnet'): Promise<string | null> {
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      return null;
    }
    const result = await cloudinary.uploader.upload(dataUrl, {
      folder: 'melala_owners',
      public_id: `${ownerKey}_owner`,
      overwrite: true,
      invalidate: true,
      resource_type: 'image',
    });
    return result.secure_url;
  }

  async function removeOwnerPhotoFromCloudinary(ownerKey: 'samuel' | 'emnet'): Promise<boolean> {
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      return false;
    }
    try {
      await cloudinary.uploader.destroy(`melala_owners/${ownerKey}_owner`, { invalidate: true });
      return true;
    } catch (err) {
      console.error(`Cloudinary destroy error for ${ownerKey}:`, err);
      return false;
    }
  }

  const DATA_DIR = path.join(process.cwd(), 'data');
  const OWNER_PHOTOS_FILE = path.join(DATA_DIR, 'owner_photos.json');
  const PRODUCTS_FILE = path.join(DATA_DIR, 'products.json');

  function loadProductsStore(): any[] {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      if (fs.existsSync(PRODUCTS_FILE)) {
        const fileData = fs.readFileSync(PRODUCTS_FILE, 'utf-8');
        const parsed = JSON.parse(fileData);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
      // Idempotently seed EFDA catalog initial products if file does not exist or is empty
      fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(INITIAL_PRODUCTS, null, 2), 'utf-8');
      return [...INITIAL_PRODUCTS];
    } catch (err) {
      console.error('Error loading persistent products store:', err);
      return [...INITIAL_PRODUCTS];
    }
  }

  function saveProductsStore(products: any[]): void {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(products, null, 2), 'utf-8');
    } catch (err) {
      console.error('Error saving persistent products store:', err);
    }
  }

  // Initialize persistent stores and PostgreSQL database
  productsStore = loadProductsStore();
  await initDbSchema();
  await seedDatabase();

  async function fetchCloudinaryPhotoUrl(ownerKey: 'samuel' | 'emnet'): Promise<string> {
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      return '';
    }
    try {
      const resource = await cloudinary.api.resource(`melala_owners/${ownerKey}_owner`);
      if (resource && resource.secure_url) {
        return `${resource.secure_url}?v=${resource.version || Date.now()}`;
      }
    } catch (err) {
      // Asset does not exist on Cloudinary yet or was deleted
    }
    return '';
  }

  async function getOwnerPhotos(): Promise<{ samuel: string; emnet: string }> {
    const isCloudinaryConfigured = Boolean(
      process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
    );

    if (isCloudinaryConfigured) {
      const [samuelUrl, emnetUrl] = await Promise.all([
        fetchCloudinaryPhotoUrl('samuel'),
        fetchCloudinaryPhotoUrl('emnet'),
      ]);
      return { samuel: samuelUrl, emnet: emnetUrl };
    }

    return loadOwnerPhotos();
  }

  function loadOwnerPhotos(): { samuel: string; emnet: string } {
    try {
      if (fs.existsSync(OWNER_PHOTOS_FILE)) {
        const fileData = fs.readFileSync(OWNER_PHOTOS_FILE, 'utf-8');
        return JSON.parse(fileData);
      }
    } catch (err) {
      console.error('Error reading owner photos data file:', err);
    }
    return { samuel: '', emnet: '' };
  }

  function saveOwnerPhotos(photos: { samuel?: string; emnet?: string }) {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      const current = loadOwnerPhotos();
      const updated = { ...current, ...photos };
      fs.writeFileSync(OWNER_PHOTOS_FILE, JSON.stringify(updated, null, 2), 'utf-8');
      return updated;
    } catch (err) {
      console.error('Error writing owner photos data file:', err);
      return null;
    }
  }

  // Initialize Gemini AI Client lazily/safely
  function getGeminiClient() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return null;
    }
    return new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }

  // --- REST API ROUTES ---

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', company: 'Melala Pharmaceutical Wholesale B2B' });
  });

  // Owner Photos Persistence API
  app.get('/api/owners/photos', async (req, res) => {
    const photos = await getOwnerPhotos();
    res.json(photos);
  });

  app.post('/api/owners/photos', async (req, res) => {
    const { samuel, emnet } = req.body || {};
    const updatedPhotos: { samuel?: string; emnet?: string } = {};

    try {
      const isCloudinaryConfigured = Boolean(
        process.env.CLOUDINARY_CLOUD_NAME &&
        process.env.CLOUDINARY_API_KEY &&
        process.env.CLOUDINARY_API_SECRET
      );

      if (typeof samuel === 'string') {
        if (samuel.startsWith('data:image/')) {
          if (isCloudinaryConfigured) {
            const cUrl = await uploadOwnerPhotoToCloudinary(samuel, 'samuel');
            if (cUrl) updatedPhotos.samuel = cUrl;
          } else {
            updatedPhotos.samuel = samuel;
          }
        } else if (samuel === '') {
          if (isCloudinaryConfigured) {
            await removeOwnerPhotoFromCloudinary('samuel');
          }
          updatedPhotos.samuel = '';
        } else {
          updatedPhotos.samuel = samuel;
        }
      }

      if (typeof emnet === 'string') {
        if (emnet.startsWith('data:image/')) {
          if (isCloudinaryConfigured) {
            const cUrl = await uploadOwnerPhotoToCloudinary(emnet, 'emnet');
            if (cUrl) updatedPhotos.emnet = cUrl;
          } else {
            updatedPhotos.emnet = emnet;
          }
        } else if (emnet === '') {
          if (isCloudinaryConfigured) {
            await removeOwnerPhotoFromCloudinary('emnet');
          }
          updatedPhotos.emnet = '';
        } else {
          updatedPhotos.emnet = emnet;
        }
      }

      if (!isCloudinaryConfigured) {
        saveOwnerPhotos(updatedPhotos);
      }

      const currentAndUpdated = await getOwnerPhotos();
      res.json({
        success: true,
        cloudinaryActive: isCloudinaryConfigured,
        ownerPhotos: currentAndUpdated,
      });
    } catch (err: any) {
      console.error('Error in /api/owners/photos:', err);
      res.status(500).json({ error: err?.message || 'Failed to process owner photo upload.' });
    }
  });

  // General Media Upload API for Products, Equipment, Categories, Owners
  app.post('/api/media/upload', async (req, res) => {
    try {
      const { dataUrl, folder, publicId } = req.body || {};

      if (!dataUrl || typeof dataUrl !== 'string') {
        return res.status(400).json({ error: 'Missing or invalid dataUrl parameter.' });
      }

      // Reject remote URLs to prevent SSRF security vulnerabilities; accept direct base64 image data URLs only
      if (dataUrl.startsWith('http://') || dataUrl.startsWith('https://')) {
        return res.status(400).json({
          error: 'Remote URL uploads are disabled for SSRF security protection. Please upload direct base64 image files.',
        });
      }

      if (!dataUrl.startsWith('data:image/')) {
        return res.status(400).json({ error: 'Payload must be a valid base64 image data URL (data:image/...;base64,...).' });
      }

      // Format check: JPEG, PNG, WebP only
      const isAllowedFormat = /^data:image\/(jpeg|jpg|png|webp);base64,/i.test(dataUrl);
      if (!isAllowedFormat) {
        return res.status(400).json({ error: 'Invalid image format. Allowed formats: JPEG, PNG, WebP.' });
      }

      // Enforce 10MB maximum payload limit (~14MB base64 string length)
      if (dataUrl.length > 14 * 1024 * 1024) {
        return res.status(400).json({ error: 'Image file size exceeds maximum limit of 10MB.' });
      }

      const isCloudinaryConfigured = Boolean(
        process.env.CLOUDINARY_CLOUD_NAME &&
        process.env.CLOUDINARY_API_KEY &&
        process.env.CLOUDINARY_API_SECRET
      );

      if (isCloudinaryConfigured) {
        const uploadResult = await uploadMediaToCloudinary(dataUrl, folder || 'products', publicId);
        if (uploadResult) {
          return res.json({
            success: true,
            url: uploadResult.url,
            public_id: uploadResult.public_id,
            cloudinaryActive: true,
          });
        }
      }

      // Fallback response when Cloudinary is not configured in local environment
      return res.json({
        success: true,
        url: dataUrl,
        public_id: `local-${Date.now()}`,
        cloudinaryActive: false,
      });
    } catch (err: any) {
      console.error('Error in /api/media/upload:', err);
      res.status(500).json({ error: err?.message || 'Failed to process media upload.' });
    }
  });

  // Media Deletion API to remove orphaned Cloudinary assets
  app.post('/api/media/delete', async (req, res) => {
    try {
      const { publicId, url } = req.body || {};
      let targetPublicId = publicId;

      if (!targetPublicId && url) {
        targetPublicId = extractCloudinaryPublicId(url);
      }

      if (!targetPublicId) {
        return res.status(400).json({ error: 'Missing or invalid publicId or Cloudinary URL' });
      }

      const success = await deleteMediaFromCloudinary(targetPublicId);
      return res.json({ success, public_id: targetPublicId });
    } catch (err: any) {
      console.error('Error in /api/media/delete:', err);
      res.status(500).json({ error: err?.message || 'Failed to delete media asset.' });
    }
  });

  // Format Helpers
  function formatProductFromDb(p: any) {
    return {
      ...p,
      unitPriceEtb: Number(p.unitPriceEtb),
      moq: Number(p.moq || 1),
      stockQuantity: Number(p.stockQuantity || 0),
      tieredPricing: Array.isArray(p.tieredPricing) ? p.tieredPricing : [],
      images: Array.isArray(p.images) ? p.images : (p.imageUrl ? [p.imageUrl] : []),
    };
  }

  function formatQuoteFromDb(q: any) {
    return {
      ...q,
      subtotalEtb: Number(q.subtotalEtb),
      discountEtb: Number(q.discountEtb || 0),
      vatEtb: Number(q.vatEtb),
      totalEtb: Number(q.totalEtb),
      items: Array.isArray(q.items) ? q.items : [],
      createdAt: q.createdAt instanceof Date ? q.createdAt.toISOString() : q.createdAt,
      updatedAt: q.updatedAt instanceof Date ? q.updatedAt.toISOString() : q.updatedAt,
    };
  }

  function formatOrderFromDb(o: any) {
    return {
      ...o,
      subtotalEtb: Number(o.subtotalEtb),
      discountEtb: Number(o.discountEtb || 0),
      vatEtb: Number(o.vatEtb),
      shippingFeeEtb: Number(o.shippingFeeEtb),
      totalAmountEtb: Number(o.totalAmountEtb),
      items: Array.isArray(o.items) ? o.items : [],
      createdAt: o.createdAt instanceof Date ? o.createdAt.toISOString() : o.createdAt,
      updatedAt: o.updatedAt instanceof Date ? o.updatedAt.toISOString() : o.updatedAt,
    };
  }

  function formatLeadFromDb(l: any) {
    return {
      ...l,
      estimatedMonthlyVolumeEtb: Number(l.estimatedMonthlyVolumeEtb || 0),
      abandonedCartAmountEtb: l.abandonedCartAmountEtb ? Number(l.abandonedCartAmountEtb) : undefined,
      interestedCategories: Array.isArray(l.interestedCategories) ? l.interestedCategories : [],
      notesLog: Array.isArray(l.notesLog) ? l.notesLog : [],
      abandonedItems: Array.isArray(l.abandonedItems) ? l.abandonedItems : [],
      createdAt: l.createdAt instanceof Date ? l.createdAt.toISOString() : l.createdAt,
    };
  }

  function formatDemandFromDb(d: any) {
    return {
      ...d,
      estimatedDemandValEtb: Number(d.estimatedDemandValEtb || 100000),
      lastSearchedAt: d.lastSearchedAt instanceof Date ? d.lastSearchedAt.toISOString() : d.lastSearchedAt,
    };
  }

  function formatUserFromDb(u: any) {
    const { passwordHash, ...rest } = u;
    return {
      ...rest,
      creditLimitEtb: Number(u.creditLimitEtb || 0),
      creditUsedEtb: Number(u.creditUsedEtb || 0),
      createdAt: u.createdAt instanceof Date ? u.createdAt.toISOString() : u.createdAt,
    };
  }

  // GET & PATCH Categories
  app.get('/api/categories', async (req, res) => {
    const db = getDb();
    if (db) {
      try {
        const dbCategories = await db.select().from(schema.categories);
        if (dbCategories.length > 0) {
          return res.json(dbCategories);
        }
      } catch (err) {
        console.error('PostgreSQL get categories error, using fallback:', err);
      }
    }
    res.json(categoriesStore);
  });

  app.patch('/api/categories/:id', async (req, res) => {
    const { imageUrl, description, name } = req.body;
    const db = getDb();
    if (db) {
      try {
        const updateData: any = {};
        if (imageUrl) updateData.imageUrl = imageUrl;
        if (description) updateData.description = description;
        if (name) updateData.name = name;
        if (Object.keys(updateData).length > 0) {
          const [updated] = await db.update(schema.categories)
            .set(updateData)
            .where(eq(schema.categories.id, req.params.id))
            .returning();
          if (updated) {
            const cat = categoriesStore.find((c) => c.id === req.params.id);
            if (cat) Object.assign(cat, updateData);
            return res.json(updated);
          }
        }
      } catch (err) {
        console.error('PostgreSQL patch category error, using fallback:', err);
      }
    }

    const category = categoriesStore.find((c) => c.id === req.params.id);
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }
    if (imageUrl) category.imageUrl = imageUrl;
    if (description) category.description = description;
    if (name) category.name = name;
    res.json(category);
  });

  // GET Products
  app.get('/api/products', async (req, res) => {
    const { category, search, strategic, prescription, coldChain } = req.query;
    const db = getDb();
    if (db) {
      try {
        let conditions: any[] = [];
        if (category && category !== 'all') {
          conditions.push(eq(schema.products.category, category as string));
        }
        if (strategic === 'true') {
          conditions.push(eq(schema.products.isStrategic, true));
        }
        if (prescription === 'true') {
          conditions.push(eq(schema.products.prescriptionRequired, true));
        }
        if (coldChain === 'true') {
          conditions.push(eq(schema.products.coldChain, true));
        }

        let results = conditions.length > 0
          ? await db.select().from(schema.products).where(and(...conditions)).orderBy(desc(schema.products.createdAt))
          : await db.select().from(schema.products).orderBy(desc(schema.products.createdAt));

        if (search) {
          const q = (search as string).toLowerCase();
          results = results.filter(
            (p) =>
              p.name.toLowerCase().includes(q) ||
              p.genericName?.toLowerCase().includes(q) ||
              p.brand.toLowerCase().includes(q) ||
              p.sku.toLowerCase().includes(q) ||
              p.efdaRegistrationNo.toLowerCase().includes(q)
          );
        }

        return res.json(results.map(formatProductFromDb));
      } catch (err) {
        console.error('PostgreSQL get products error, using fallback:', err);
      }
    }

    let filtered = [...productsStore];
    if (category && category !== 'all') {
      filtered = filtered.filter((p) => p.category === category);
    }
    if (search) {
      const q = (search as string).toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.genericName?.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          p.efdaRegistrationNo.toLowerCase().includes(q)
      );
    }
    if (strategic === 'true') {
      filtered = filtered.filter((p) => p.isStrategic);
    }
    if (prescription === 'true') {
      filtered = filtered.filter((p) => p.prescriptionRequired);
    }
    if (coldChain === 'true') {
      filtered = filtered.filter((p) => p.coldChain);
    }

    res.json(filtered);
  });

  // POST Product (Admin)
  app.post('/api/products', async (req, res) => {
    const imagesList = req.body.images && Array.isArray(req.body.images) ? req.body.images : (req.body.imageUrl ? [req.body.imageUrl] : []);
    const mainImageUrl = req.body.imageUrl || imagesList[0] || 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=600&q=80';

    const newProductId = `prod-${Date.now()}`;
    const sku = req.body.sku || `MEL-SKU-${Math.floor(1000 + Math.random() * 9000)}`;

    const newProductData = {
      id: newProductId,
      sku,
      name: req.body.name,
      genericName: req.body.genericName || null,
      category: req.body.category,
      brand: req.body.brand,
      manufacturer: req.body.manufacturer,
      dosageForm: req.body.dosageForm || null,
      packSize: req.body.packSize,
      moq: Number(req.body.moq || 1),
      unitPriceEtb: String(req.body.unitPriceEtb),
      tieredPricing: req.body.tieredPricing || [],
      efdaRegistrationNo: req.body.efdaRegistrationNo,
      batchNo: req.body.batchNo,
      expiryDate: req.body.expiryDate,
      coldChain: Boolean(req.body.coldChain),
      stockQuantity: Number(req.body.stockQuantity || 0),
      warehouseLocation: req.body.warehouseLocation,
      description: req.body.description,
      storageInstructions: req.body.storageInstructions,
      prescriptionRequired: Boolean(req.body.prescriptionRequired),
      isStrategic: Boolean(req.body.isStrategic),
      isFeatured: Boolean(req.body.isFeatured),
      promotionTag: req.body.promotionTag || null,
      imageUrl: mainImageUrl,
      images: imagesList,
    };

    const db = getDb();
    let createdDbProduct = null;
    if (db) {
      try {
        const [inserted] = await db.insert(schema.products).values(newProductData).returning();
        if (inserted) {
          createdDbProduct = formatProductFromDb(inserted);
          for (let i = 0; i < imagesList.length; i++) {
            const imgUrl = imagesList[i];
            const pubId = extractCloudinaryPublicId(imgUrl);
            await db.insert(schema.productImages).values({
              id: `img-${Date.now()}-${i}`,
              productId: newProductId,
              secureUrl: imgUrl,
              cloudinaryPublicId: pubId || null,
              displayOrder: i,
              isPrimary: i === 0,
            }).onConflictDoNothing();
          }
        }
      } catch (err) {
        console.error('PostgreSQL post product error:', err);
      }
    }

    const newProductObj = {
      ...req.body,
      id: newProductId,
      sku,
      imageUrl: mainImageUrl,
      images: imagesList,
      unitPriceEtb: Number(req.body.unitPriceEtb),
    };
    productsStore.unshift(newProductObj);
    saveProductsStore(productsStore);

    res.status(201).json(createdDbProduct || newProductObj);
  });

  // PUT Product (Admin Edit)
  app.put('/api/products/:id', async (req, res) => {
    const imagesList = req.body.images && Array.isArray(req.body.images) ? req.body.images : (req.body.imageUrl ? [req.body.imageUrl] : []);
    const mainImageUrl = req.body.imageUrl || imagesList[0];

    const db = getDb();
    let updatedDbProduct = null;
    if (db) {
      try {
        const updatePayload: any = {
          updatedAt: new Date(),
        };
        if (req.body.name !== undefined) updatePayload.name = req.body.name;
        if (req.body.genericName !== undefined) updatePayload.genericName = req.body.genericName;
        if (req.body.category !== undefined) updatePayload.category = req.body.category;
        if (req.body.brand !== undefined) updatePayload.brand = req.body.brand;
        if (req.body.manufacturer !== undefined) updatePayload.manufacturer = req.body.manufacturer;
        if (req.body.dosageForm !== undefined) updatePayload.dosageForm = req.body.dosageForm;
        if (req.body.packSize !== undefined) updatePayload.packSize = req.body.packSize;
        if (req.body.moq !== undefined) updatePayload.moq = Number(req.body.moq);
        if (req.body.unitPriceEtb !== undefined) updatePayload.unitPriceEtb = String(req.body.unitPriceEtb);
        if (req.body.tieredPricing !== undefined) updatePayload.tieredPricing = req.body.tieredPricing;
        if (req.body.efdaRegistrationNo !== undefined) updatePayload.efdaRegistrationNo = req.body.efdaRegistrationNo;
        if (req.body.batchNo !== undefined) updatePayload.batchNo = req.body.batchNo;
        if (req.body.expiryDate !== undefined) updatePayload.expiryDate = req.body.expiryDate;
        if (req.body.coldChain !== undefined) updatePayload.coldChain = Boolean(req.body.coldChain);
        if (req.body.stockQuantity !== undefined) updatePayload.stockQuantity = Number(req.body.stockQuantity);
        if (req.body.warehouseLocation !== undefined) updatePayload.warehouseLocation = req.body.warehouseLocation;
        if (req.body.description !== undefined) updatePayload.description = req.body.description;
        if (req.body.storageInstructions !== undefined) updatePayload.storageInstructions = req.body.storageInstructions;
        if (req.body.prescriptionRequired !== undefined) updatePayload.prescriptionRequired = Boolean(req.body.prescriptionRequired);
        if (req.body.isStrategic !== undefined) updatePayload.isStrategic = Boolean(req.body.isStrategic);
        if (req.body.isFeatured !== undefined) updatePayload.isFeatured = Boolean(req.body.isFeatured);
        if (req.body.promotionTag !== undefined) updatePayload.promotionTag = req.body.promotionTag;
        if (mainImageUrl) updatePayload.imageUrl = mainImageUrl;
        if (imagesList.length > 0) updatePayload.images = imagesList;

        const [updated] = await db.update(schema.products)
          .set(updatePayload)
          .where(eq(schema.products.id, req.params.id))
          .returning();
        if (updated) {
          updatedDbProduct = formatProductFromDb(updated);
        }
      } catch (err) {
        console.error('PostgreSQL update product error:', err);
      }
    }

    const index = productsStore.findIndex((p) => p.id === req.params.id);
    if (index === -1 && !updatedDbProduct) {
      return res.status(404).json({ error: 'Product not found' });
    }

    let updatedProduct = null;
    if (index !== -1) {
      const finalImagesList = imagesList.length > 0 ? imagesList : productsStore[index].images || [];
      const finalMainImageUrl = mainImageUrl || finalImagesList[0] || productsStore[index].imageUrl;
      updatedProduct = {
        ...productsStore[index],
        ...req.body,
        imageUrl: finalMainImageUrl,
        images: finalImagesList,
      };
      productsStore[index] = updatedProduct;
      saveProductsStore(productsStore);
    }

    res.json(updatedDbProduct || updatedProduct);
  });

  // GET Single Product
  app.get('/api/products/:id', async (req, res) => {
    const db = getDb();
    if (db) {
      try {
        const [product] = await db.select().from(schema.products).where(eq(schema.products.id, req.params.id));
        if (product) {
          return res.json(formatProductFromDb(product));
        }
      } catch (err) {
        console.error('PostgreSQL get single product error, using fallback:', err);
      }
    }

    const product = productsStore.find((p) => p.id === req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(product);
  });

  // DELETE Product (Admin Delete with Cloudinary Asset Cleanup)
  app.delete('/api/products/:id', async (req, res) => {
    const db = getDb();
    let deletedFromDb = false;
    if (db) {
      try {
        const [p] = await db.select().from(schema.products).where(eq(schema.products.id, req.params.id));
        if (p) {
          await db.delete(schema.productImages).where(eq(schema.productImages.productId, req.params.id));
          await db.delete(schema.products).where(eq(schema.products.id, req.params.id));
          deletedFromDb = true;

          const allImages = Array.isArray(p.images) ? (p.images as string[]) : (p.imageUrl ? [p.imageUrl] : []);
          for (const imgUrl of allImages) {
            const pubId = extractCloudinaryPublicId(imgUrl);
            if (pubId) {
              await deleteMediaFromCloudinary(pubId);
            }
          }
        }
      } catch (err) {
        console.error('PostgreSQL delete product error:', err);
      }
    }

    const index = productsStore.findIndex((p) => p.id === req.params.id);
    if (index === -1 && !deletedFromDb) {
      return res.status(404).json({ error: 'Product not found' });
    }

    let deletedProduct = null;
    if (index !== -1) {
      [deletedProduct] = productsStore.splice(index, 1);
      saveProductsStore(productsStore);

      if (!deletedFromDb) {
        const allImages = deletedProduct.images || (deletedProduct.imageUrl ? [deletedProduct.imageUrl] : []);
        for (const imgUrl of allImages) {
          const pubId = extractCloudinaryPublicId(imgUrl);
          if (pubId) {
            await deleteMediaFromCloudinary(pubId);
          }
        }
      }
    }

    res.json({ success: true, deletedProduct });
  });

  // GET Brands
  app.get('/api/brands', async (req, res) => {
    const db = getDb();
    if (db) {
      try {
        const dbBrands = await db.select().from(schema.brands);
        if (dbBrands.length > 0) {
          return res.json(dbBrands);
        }
      } catch (err) {
        console.error('PostgreSQL get brands error, using fallback:', err);
      }
    }
    res.json(brandsStore);
  });

  // GET / POST / PATCH Quotations (RFQ)
  app.get('/api/quotes', async (req, res) => {
    const db = getDb();
    if (db) {
      try {
        const dbQuotes = await db.select().from(schema.quotations).orderBy(desc(schema.quotations.createdAt));
        return res.json(dbQuotes.map(formatQuoteFromDb));
      } catch (err) {
        console.error('PostgreSQL get quotes error:', err);
      }
    }
    res.json(quotationsStore);
  });

  app.post('/api/quotes', async (req, res) => {
    const newQuoteId = `quote-${Date.now()}`;
    const quoteNumber = `MEL-RFQ-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const nowIso = new Date().toISOString();

    const newQuoteData = {
      id: newQuoteId,
      quoteNumber,
      customerId: req.body.customerId || null,
      customerName: req.body.customerName || '',
      facilityName: req.body.facilityName || '',
      facilityType: req.body.facilityType || 'Pharmacy',
      efdaLicenseNo: req.body.efdaLicenseNo || '',
      contactEmail: req.body.contactEmail || '',
      contactPhone: req.body.contactPhone || '',
      shippingCity: req.body.shippingCity || 'Addis Ababa',
      status: req.body.status || 'submitted',
      paymentTerms: req.body.paymentTerms || 'Standard 30-Day B2B Credit',
      items: req.body.items || [],
      subtotalEtb: String(req.body.subtotalEtb || 0),
      discountEtb: String(req.body.discountEtb || 0),
      vatEtb: String(req.body.vatEtb || 0),
      totalEtb: String(req.body.totalEtb || 0),
      customerNotes: req.body.customerNotes || null,
      salesRepNotes: req.body.salesRepNotes || null,
      aiOptimizationNotes: req.body.aiOptimizationNotes || null,
    };

    const db = getDb();
    let createdDbQuote = null;
    if (db) {
      try {
        const [inserted] = await db.insert(schema.quotations).values(newQuoteData).returning();
        if (inserted) {
          createdDbQuote = formatQuoteFromDb(inserted);
        }
      } catch (err) {
        console.error('PostgreSQL post quote error:', err);
      }
    }

    const newQuoteMem = {
      ...req.body,
      id: newQuoteId,
      quoteNumber,
      createdAt: nowIso,
      updatedAt: nowIso,
      status: req.body.status || 'submitted',
    };
    quotationsStore.unshift(newQuoteMem);

    res.status(201).json(createdDbQuote || newQuoteMem);
  });

  app.patch('/api/quotes/:id', async (req, res) => {
    const db = getDb();
    let updatedDbQuote = null;
    if (db) {
      try {
        const updateData: any = { updatedAt: new Date() };
        if (req.body.status !== undefined) updateData.status = req.body.status;
        if (req.body.salesRepNotes !== undefined) updateData.salesRepNotes = req.body.salesRepNotes;
        if (req.body.aiOptimizationNotes !== undefined) updateData.aiOptimizationNotes = req.body.aiOptimizationNotes;
        if (req.body.discountEtb !== undefined) updateData.discountEtb = String(req.body.discountEtb);
        if (req.body.totalEtb !== undefined) updateData.totalEtb = String(req.body.totalEtb);

        const [updated] = await db.update(schema.quotations)
          .set(updateData)
          .where(eq(schema.quotations.id, req.params.id))
          .returning();
        if (updated) {
          updatedDbQuote = formatQuoteFromDb(updated);
        }
      } catch (err) {
        console.error('PostgreSQL patch quote error:', err);
      }
    }

    const index = quotationsStore.findIndex((q) => q.id === req.params.id);
    if (index === -1 && !updatedDbQuote) {
      return res.status(404).json({ error: 'Quotation not found' });
    }

    if (index !== -1) {
      quotationsStore[index] = {
        ...quotationsStore[index],
        ...req.body,
        updatedAt: new Date().toISOString(),
      };
    }

    res.json(updatedDbQuote || quotationsStore[index]);
  });

  // GET / POST / PATCH Wholesale Orders
  app.get('/api/orders', async (req, res) => {
    const db = getDb();
    if (db) {
      try {
        const dbOrders = await db.select().from(schema.orders).orderBy(desc(schema.orders.createdAt));
        return res.json(dbOrders.map(formatOrderFromDb));
      } catch (err) {
        console.error('PostgreSQL get orders error:', err);
      }
    }
    res.json(ordersStore);
  });

  app.post('/api/orders', async (req, res) => {
    const newOrderId = `ord-${Date.now()}`;
    const orderNumber = `MEL-ORD-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const proFormaNumber = `PRO-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const nowIso = new Date().toISOString();

    const newOrderData = {
      id: newOrderId,
      orderNumber,
      proFormaNumber,
      customerId: req.body.customerId || null,
      facilityName: req.body.facilityName || '',
      facilityType: req.body.facilityType || 'Pharmacy',
      contactName: req.body.contactName || null,
      contactPhone: req.body.contactPhone || null,
      contactEmail: req.body.contactEmail || null,
      items: req.body.items || [],
      subtotalEtb: String(req.body.subtotalEtb || 0),
      discountEtb: String(req.body.discountEtb || 0),
      vatEtb: String(req.body.vatEtb || 0),
      shippingFeeEtb: String(req.body.shippingFeeEtb || 0),
      totalAmountEtb: String(req.body.totalAmountEtb || 0),
      status: req.body.status || 'pending_verification',
      paymentStatus: req.body.paymentStatus || 'pro_forma_issued',
      paymentMethod: req.body.paymentMethod || 'Bank Transfer',
      deliveryCity: req.body.deliveryCity || 'Addis Ababa',
      deliveryAddress: req.body.deliveryAddress || 'Central Warehouse',
      coldChainHandling: Boolean(req.body.coldChainHandling),
      customerNotes: req.body.customerNotes || null,
      salesNotes: req.body.salesNotes || null,
      expectedDeliveryDate: req.body.expectedDeliveryDate || null,
      confirmationNotice: req.body.confirmationNotice || null,
    };

    const db = getDb();
    let createdDbOrder = null;
    if (db) {
      try {
        const [inserted] = await db.insert(schema.orders).values(newOrderData).returning();
        if (inserted) {
          createdDbOrder = formatOrderFromDb(inserted);
        }
      } catch (err) {
        console.error('PostgreSQL post order error:', err);
      }
    }

    const newOrderMem = {
      ...req.body,
      id: newOrderId,
      orderNumber,
      proFormaNumber,
      createdAt: nowIso,
      status: req.body.status || 'pending_verification',
      paymentStatus: req.body.paymentStatus || 'pro_forma_issued',
    };
    ordersStore.unshift(newOrderMem);

    res.status(201).json(createdDbOrder || newOrderMem);
  });

  app.patch('/api/orders/:id', async (req, res) => {
    const db = getDb();
    let updatedDbOrder = null;
    if (db) {
      try {
        const updateData: any = { updatedAt: new Date() };
        if (req.body.status !== undefined) updateData.status = req.body.status;
        if (req.body.paymentStatus !== undefined) updateData.paymentStatus = req.body.paymentStatus;
        if (req.body.salesNotes !== undefined) updateData.salesNotes = req.body.salesNotes;
        if (req.body.confirmationNotice !== undefined) updateData.confirmationNotice = req.body.confirmationNotice;
        if (req.body.expectedDeliveryDate !== undefined) updateData.expectedDeliveryDate = req.body.expectedDeliveryDate;

        const [updated] = await db.update(schema.orders)
          .set(updateData)
          .where(eq(schema.orders.id, req.params.id))
          .returning();
        if (updated) {
          updatedDbOrder = formatOrderFromDb(updated);
        }
      } catch (err) {
        console.error('PostgreSQL patch order error:', err);
      }
    }

    const index = ordersStore.findIndex((o) => o.id === req.params.id);
    if (index === -1 && !updatedDbOrder) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (index !== -1) {
      ordersStore[index] = {
        ...ordersStore[index],
        ...req.body,
      };
    }

    res.json(updatedDbOrder || ordersStore[index]);
  });

  // PATCH Product Feature Toggle (Admin)
  app.patch('/api/products/:id/feature', async (req, res) => {
    const { isFeatured, promotionTag } = req.body;
    const db = getDb();
    let dbProduct = null;
    if (db) {
      try {
        const updateData: any = {};
        if (isFeatured !== undefined) updateData.isFeatured = Boolean(isFeatured);
        if (promotionTag !== undefined) updateData.promotionTag = promotionTag;
        const [updated] = await db.update(schema.products)
          .set(updateData)
          .where(eq(schema.products.id, req.params.id))
          .returning();
        if (updated) {
          dbProduct = formatProductFromDb(updated);
        }
      } catch (err) {
        console.error('PostgreSQL patch feature error:', err);
      }
    }

    const product = productsStore.find((p) => p.id === req.params.id);
    if (!product && !dbProduct) {
      return res.status(404).json({ error: 'Product not found' });
    }

    if (product) {
      if (isFeatured !== undefined) product.isFeatured = isFeatured;
      if (promotionTag !== undefined) product.promotionTag = promotionTag;
      saveProductsStore(productsStore);
    }

    res.json(dbProduct || product);
  });

  // GET / POST / PATCH Promotions
  app.get('/api/promotions', async (req, res) => {
    const db = getDb();
    if (db) {
      try {
        const dbPromos = await db.select().from(schema.promotions).orderBy(desc(schema.promotions.createdAt));
        return res.json(dbPromos);
      } catch (err) {
        console.error('PostgreSQL get promotions error:', err);
      }
    }
    res.json(promotionsStore);
  });

  app.post('/api/promotions', async (req, res) => {
    const newPromoId = `promo-${Date.now()}`;
    const newPromoData = {
      id: newPromoId,
      title: req.body.title,
      type: req.body.type,
      description: req.body.description,
      discountPercent: req.body.discountPercent || null,
      code: req.body.code || null,
      applicableProductIds: req.body.applicableProductIds || [],
      badgeText: req.body.badgeText || 'Special Offer',
      active: req.body.active ?? true,
      validUntil: req.body.validUntil || '2026-12-31',
    };

    const db = getDb();
    let createdDbPromo = null;
    if (db) {
      try {
        const [inserted] = await db.insert(schema.promotions).values(newPromoData).returning();
        if (inserted) {
          createdDbPromo = inserted;
        }
      } catch (err) {
        console.error('PostgreSQL post promotion error:', err);
      }
    }

    const newPromoMem = {
      ...req.body,
      id: newPromoId,
      createdAt: new Date().toISOString().split('T')[0],
      active: req.body.active ?? true,
    };
    promotionsStore.unshift(newPromoMem);

    res.status(201).json(createdDbPromo || newPromoMem);
  });

  app.patch('/api/promotions/:id', async (req, res) => {
    const db = getDb();
    let updatedDbPromo = null;
    if (db) {
      try {
        const updateData: any = {};
        if (req.body.active !== undefined) updateData.active = Boolean(req.body.active);
        if (req.body.title !== undefined) updateData.title = req.body.title;
        if (req.body.description !== undefined) updateData.description = req.body.description;
        if (req.body.badgeText !== undefined) updateData.badgeText = req.body.badgeText;

        const [updated] = await db.update(schema.promotions)
          .set(updateData)
          .where(eq(schema.promotions.id, req.params.id))
          .returning();
        if (updated) {
          updatedDbPromo = updated;
        }
      } catch (err) {
        console.error('PostgreSQL patch promotion error:', err);
      }
    }

    const index = promotionsStore.findIndex((p) => p.id === req.params.id);
    if (index === -1 && !updatedDbPromo) {
      return res.status(404).json({ error: 'Promotion not found' });
    }

    if (index !== -1) {
      promotionsStore[index] = {
        ...promotionsStore[index],
        ...req.body,
      };
    }

    res.json(updatedDbPromo || promotionsStore[index]);
  });

  // GET / POST Customer Leads
  app.get('/api/leads', async (req, res) => {
    const db = getDb();
    if (db) {
      try {
        const dbLeads = await db.select().from(schema.customerLeads).orderBy(desc(schema.customerLeads.createdAt));
        return res.json(dbLeads.map(formatLeadFromDb));
      } catch (err) {
        console.error('PostgreSQL get leads error:', err);
      }
    }
    res.json(leadsStore);
  });

  app.post('/api/leads', async (req, res) => {
    const newLeadId = `lead-${Date.now()}`;
    const todayStr = new Date().toISOString().split('T')[0];

    const newLeadData = {
      id: newLeadId,
      facilityName: req.body.facilityName,
      contactPerson: req.body.contactPerson,
      facilityType: req.body.facilityType || 'Pharmacy',
      phone: req.body.phone,
      email: req.body.email || null,
      city: req.body.city || 'Addis Ababa',
      efdaStatus: req.body.efdaStatus || 'pending_verification',
      leadStatus: req.body.leadStatus || 'NEW',
      interestedCategories: req.body.interestedCategories || [],
      estimatedMonthlyVolumeEtb: String(req.body.estimatedMonthlyVolumeEtb || 0),
      lastContacted: todayStr,
      assignedRepName: req.body.assignedRepName || 'Tewodros Bekele',
      notes: req.body.notes || null,
      notesLog: req.body.notesLog || [],
      source: req.body.source || null,
      abandonedCartAmountEtb: req.body.abandonedCartAmountEtb ? String(req.body.abandonedCartAmountEtb) : null,
      abandonedItems: req.body.abandonedItems || [],
    };

    const db = getDb();
    let createdDbLead = null;
    if (db) {
      try {
        const [inserted] = await db.insert(schema.customerLeads).values(newLeadData).returning();
        if (inserted) {
          createdDbLead = formatLeadFromDb(inserted);
        }
      } catch (err) {
        console.error('PostgreSQL post lead error:', err);
      }
    }

    const newLeadMem = {
      ...req.body,
      id: newLeadId,
      lastContacted: todayStr,
      leadStatus: req.body.leadStatus || 'NEW',
      notesLog: req.body.notesLog || [],
    };
    leadsStore.unshift(newLeadMem);

    res.status(201).json(createdDbLead || newLeadMem);
  });

  app.patch('/api/leads/:id', async (req, res) => {
    const todayStr = new Date().toISOString().split('T')[0];
    const db = getDb();
    let updatedDbLead = null;
    if (db) {
      try {
        const updateData: any = { lastContacted: todayStr };
        if (req.body.leadStatus !== undefined) updateData.leadStatus = req.body.leadStatus;
        if (req.body.notes !== undefined) updateData.notes = req.body.notes;
        if (req.body.assignedRepName !== undefined) updateData.assignedRepName = req.body.assignedRepName;
        if (req.body.efdaStatus !== undefined) updateData.efdaStatus = req.body.efdaStatus;

        const [updated] = await db.update(schema.customerLeads)
          .set(updateData)
          .where(eq(schema.customerLeads.id, req.params.id))
          .returning();
        if (updated) {
          updatedDbLead = formatLeadFromDb(updated);
        }
      } catch (err) {
        console.error('PostgreSQL patch lead error:', err);
      }
    }

    const index = leadsStore.findIndex((l) => l.id === req.params.id);
    if (index === -1 && !updatedDbLead) {
      return res.status(404).json({ error: 'Lead not found' });
    }

    if (index !== -1) {
      leadsStore[index] = {
        ...leadsStore[index],
        ...req.body,
        lastContacted: todayStr,
      };
    }

    res.json(updatedDbLead || leadsStore[index]);
  });

  app.post('/api/leads/:id/notes', async (req, res) => {
    const { author, note, actionType } = req.body;
    if (!note) {
      return res.status(400).json({ error: 'Note text required' });
    }

    const newNote = {
      id: `n-${Date.now()}`,
      author: author || 'Sales Rep',
      note,
      createdAt: new Date().toISOString(),
      actionType: actionType || 'call',
    };

    const db = getDb();
    let updatedDbLead = null;
    if (db) {
      try {
        const [existing] = await db.select().from(schema.customerLeads).where(eq(schema.customerLeads.id, req.params.id));
        if (existing) {
          const notesLog = Array.isArray(existing.notesLog) ? existing.notesLog : [];
          notesLog.unshift(newNote);
          const [updated] = await db.update(schema.customerLeads)
            .set({
              notesLog,
              lastContacted: new Date().toISOString().split('T')[0],
            })
            .where(eq(schema.customerLeads.id, req.params.id))
            .returning();
          if (updated) {
            updatedDbLead = formatLeadFromDb(updated);
          }
        }
      } catch (err) {
        console.error('PostgreSQL add note error:', err);
      }
    }

    const lead = leadsStore.find((l) => l.id === req.params.id);
    if (!lead && !updatedDbLead) {
      return res.status(404).json({ error: 'Lead not found' });
    }

    if (lead) {
      if (!lead.notesLog) lead.notesLog = [];
      lead.notesLog.unshift(newNote);
      lead.lastContacted = new Date().toISOString().split('T')[0];
    }

    res.status(201).json({
      message: 'Sales follow-up note recorded.',
      lead: updatedDbLead || lead,
      newNote,
    });
  });

  // GET / POST / PATCH Wholesale Callback Requests
  app.get('/api/callbacks', async (req, res) => {
    const db = getDb();
    if (db) {
      try {
        const dbCallbacks = await db.select().from(schema.callbackRequests).orderBy(desc(schema.callbackRequests.createdAt));
        return res.json(dbCallbacks);
      } catch (err) {
        console.error('PostgreSQL get callbacks error:', err);
      }
    }
    res.json(callbacksStore);
  });

  app.post('/api/callbacks', async (req, res) => {
    const { facilityName, contactPerson, phone, email, facilityType, preferredTime, notes } = req.body;
    if (!facilityName || !contactPerson || !phone) {
      return res.status(400).json({ error: 'Facility Name, Contact Person, and Phone number are required.' });
    }

    const newCallbackId = `cb-${Date.now()}`;
    const nowIso = new Date().toISOString();

    const newCallbackData = {
      id: newCallbackId,
      facilityName,
      contactPerson,
      phone,
      email: email || null,
      facilityType: facilityType || 'Pharmacy',
      preferredTime: preferredTime || 'Anytime',
      notes: notes || 'Requested wholesale pricing consultation',
      status: 'PENDING',
    };

    const db = getDb();
    let createdDbCallback = null;
    if (db) {
      try {
        const [inserted] = await db.insert(schema.callbackRequests).values(newCallbackData).returning();
        if (inserted) createdDbCallback = inserted;

        const existingLeads = await db.select().from(schema.customerLeads).where(eq(schema.customerLeads.facilityName, facilityName));
        if (existingLeads.length === 0) {
          await db.insert(schema.customerLeads).values({
            id: `lead-cb-${Date.now()}`,
            facilityName,
            contactPerson,
            facilityType: facilityType || 'Pharmacy',
            phone,
            email: email || null,
            city: 'Addis Ababa',
            efdaStatus: 'pending_verification',
            leadStatus: 'NEW',
            interestedCategories: ['pharmaceuticals'],
            estimatedMonthlyVolumeEtb: '150000',
            lastContacted: nowIso.split('T')[0],
            assignedRepName: 'Tewodros Bekele',
            notes: `Callback Requested: ${notes || 'Wholesale pricing consultation'}`,
            source: 'Callback Request',
            notesLog: [
              {
                id: `n-cb-${Date.now()}`,
                author: 'Customer Inbound',
                note: `Callback Request: "${notes || 'Requested wholesale callback'}" (Preferred time: ${preferredTime || 'Anytime'})`,
                createdAt: nowIso,
                actionType: 'call',
              },
            ],
          }).onConflictDoNothing();
        }
      } catch (err) {
        console.error('PostgreSQL post callback error:', err);
      }
    }

    const newCallbackMem = {
      id: newCallbackId,
      facilityName,
      contactPerson,
      phone,
      email: email || '',
      facilityType: facilityType || 'Pharmacy',
      preferredTime: preferredTime || 'Anytime',
      notes: notes || 'Requested wholesale pricing consultation',
      status: 'PENDING' as const,
      createdAt: nowIso,
    };
    callbacksStore.unshift(newCallbackMem);

    res.status(201).json({
      message: 'Callback request received. A Melala wholesale advisor will contact you.',
      callback: createdDbCallback || newCallbackMem,
    });
  });

  app.patch('/api/callbacks/:id', async (req, res) => {
    const db = getDb();
    let updatedDbCallback = null;
    if (db) {
      try {
        if (req.body.status) {
          const [updated] = await db.update(schema.callbackRequests)
            .set({ status: req.body.status })
            .where(eq(schema.callbackRequests.id, req.params.id))
            .returning();
          if (updated) updatedDbCallback = updated;
        }
      } catch (err) {
        console.error('PostgreSQL patch callback error:', err);
      }
    }

    const cb = callbacksStore.find((c) => c.id === req.params.id);
    if (!cb && !updatedDbCallback) {
      return res.status(404).json({ error: 'Callback request not found' });
    }

    if (cb && req.body.status) {
      cb.status = req.body.status;
    }

    res.json(updatedDbCallback || cb);
  });

  // GET / POST Product Demand Insights
  app.get('/api/demand-insights', async (req, res) => {
    const db = getDb();
    if (db) {
      try {
        const dbDemand = await db.select().from(schema.demandInsights).orderBy(desc(schema.demandInsights.lastSearchedAt));
        return res.json(dbDemand.map(formatDemandFromDb));
      } catch (err) {
        console.error('PostgreSQL get demand insights error:', err);
      }
    }
    res.json(demandStore);
  });

  app.post('/api/demand-insights/log', async (req, res) => {
    const { searchTerm, category, isQuoteRequest } = req.body;
    if (!searchTerm || !searchTerm.trim()) {
      return res.json({ status: 'ignored' });
    }
    const term = searchTerm.trim();

    const db = getDb();
    if (db) {
      try {
        const [existing] = await db.select().from(schema.demandInsights).where(ilike(schema.demandInsights.searchTerm, term));
        if (existing) {
          await db.update(schema.demandInsights)
            .set({
              searchCount: existing.searchCount + 1,
              quoteRequestCount: isQuoteRequest ? existing.quoteRequestCount + 1 : existing.quoteRequestCount,
              lastSearchedAt: new Date(),
            })
            .where(eq(schema.demandInsights.id, existing.id));
        } else {
          const isProductInStock = productsStore.some(
            (p) => p.name.toLowerCase().includes(term.toLowerCase()) || p.genericName?.toLowerCase().includes(term.toLowerCase())
          );
          await db.insert(schema.demandInsights).values({
            id: `demand-${Date.now()}`,
            searchTerm: term,
            searchCount: 1,
            quoteRequestCount: isQuoteRequest ? 1 : 0,
            category: category || 'pharmaceuticals',
            inStock: isProductInStock,
            estimatedDemandValEtb: String(Math.floor(100000 + Math.random() * 500000)),
          });
        }
      } catch (err) {
        console.error('PostgreSQL log demand error:', err);
      }
    }

    const existingMem = demandStore.find((d) => d.searchTerm.toLowerCase() === term.toLowerCase());
    if (existingMem) {
      existingMem.searchCount += 1;
      if (isQuoteRequest) existingMem.quoteRequestCount += 1;
      existingMem.lastSearchedAt = new Date().toISOString();
    } else {
      const isProductInStock = productsStore.some(
        (p) => p.name.toLowerCase().includes(term.toLowerCase()) || p.genericName?.toLowerCase().includes(term.toLowerCase())
      );
      demandStore.unshift({
        id: `demand-${Date.now()}`,
        searchTerm: term,
        searchCount: 1,
        quoteRequestCount: isQuoteRequest ? 1 : 0,
        category: category || 'pharmaceuticals',
        inStock: isProductInStock,
        estimatedDemandValEtb: Math.floor(100000 + Math.random() * 500000),
        lastSearchedAt: new Date().toISOString(),
      });
    }

    res.json({ message: 'Demand log recorded', demand: demandStore });
  });

  // POST Abandoned Order Event
  app.post('/api/abandoned-cart', async (req, res) => {
    const { facilityName, contactPerson, phone, email, cartTotalEtb, itemsSummary } = req.body;
    if (!facilityName || !phone) {
      return res.status(400).json({ error: 'Facility details required' });
    }

    const newLeadId = `lead-ab-${Date.now()}`;
    const todayStr = new Date().toISOString().split('T')[0];
    const nowIso = new Date().toISOString();

    const abandonedLeadData = {
      id: newLeadId,
      facilityName,
      contactPerson: contactPerson || 'Purchasing Officer',
      facilityType: 'Pharmacy',
      phone,
      email: email || null,
      city: 'Addis Ababa',
      efdaStatus: 'verified',
      leadStatus: 'NEW',
      interestedCategories: ['pharmaceuticals'],
      estimatedMonthlyVolumeEtb: String(cartTotalEtb || 50000),
      lastContacted: todayStr,
      assignedRepName: 'Tewodros Bekele',
      notes: `Abandoned Cart Alert: Total ${cartTotalEtb ? cartTotalEtb.toLocaleString() + ' ETB' : 'significant value'}. Items: ${itemsSummary || 'Multiple products'}`,
      source: 'Abandoned Cart',
      abandonedCartAmountEtb: cartTotalEtb ? String(cartTotalEtb) : null,
      abandonedItems: itemsSummary ? [itemsSummary] : [],
      notesLog: [
        {
          id: `n-ab-${Date.now()}`,
          author: 'System Event',
          note: `Customer created significant cart order (${cartTotalEtb?.toLocaleString()} ETB) but did not complete checkout. Flagged for proactive customer assistance.`,
          createdAt: nowIso,
          actionType: 'status_change',
        },
      ],
    };

    const db = getDb();
    let createdDbLead = null;
    if (db) {
      try {
        const [inserted] = await db.insert(schema.customerLeads).values(abandonedLeadData).returning();
        if (inserted) {
          createdDbLead = formatLeadFromDb(inserted);
        }
      } catch (err) {
        console.error('PostgreSQL post abandoned cart lead error:', err);
      }
    }

    const abandonedLeadMem = {
      ...abandonedLeadData,
      email: email || '',
      efdaStatus: 'verified' as const,
      leadStatus: 'NEW' as const,
      interestedCategories: ['pharmaceuticals' as const],
      estimatedMonthlyVolumeEtb: cartTotalEtb || 50000,
      source: 'Abandoned Cart' as const,
      abandonedCartAmountEtb: cartTotalEtb,
      notesLog: [
        {
          id: `n-ab-${Date.now()}`,
          author: 'System Event',
          note: `Customer created significant cart order (${cartTotalEtb?.toLocaleString()} ETB) but did not complete checkout. Flagged for proactive customer assistance.`,
          createdAt: nowIso,
          actionType: 'status_change' as const,
        },
      ],
    };

    leadsStore.unshift(abandonedLeadMem);
    res.status(201).json({ message: 'Abandoned order lead created for sales follow-up.', lead: createdDbLead || abandonedLeadMem });
  });

  // Helper to strip sensitive fields from user response
  const sanitizeUser = (user: any) => {
    if (!user) return user;
    const { password, passwordHash, ...rest } = user;
    return rest;
  };

  // GET Users Profiles
  app.get('/api/users', async (req, res) => {
    const db = getDb();
    if (db) {
      try {
        const dbUsers = await db.select().from(schema.users).orderBy(desc(schema.users.createdAt));
        return res.json(dbUsers.map(formatUserFromDb));
      } catch (err) {
        console.error('PostgreSQL get users error:', err);
      }
    }
    res.json(usersStore.map(sanitizeUser));
  });

  // B2B Customer / User Registration
  app.post('/api/auth/register', async (req, res) => {
    const {
      name,
      email,
      password,
      facilityName,
      facilityType,
      phone,
      city,
      region,
      businessAddress,
      efdaLicenseNo,
      tinNumber,
      vatRegistered,
      role,
    } = req.body;

    if (!email || !name) {
      return res.status(400).json({ error: 'Missing required account registration fields (Name and Email required).' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const db = getDb();

    if (db) {
      try {
        const [existingUser] = await db.select().from(schema.users).where(eq(schema.users.email, cleanEmail));
        if (existingUser) {
          return res.status(400).json({ error: 'An account with this email address already exists. Please sign in or reset your password.' });
        }

        if (tinNumber && tinNumber.trim()) {
          const [dupTin] = await db.select().from(schema.users).where(eq(schema.users.tinNumber, tinNumber.trim()));
          if (dupTin) {
            return res.status(400).json({ error: 'A business account with this Taxpayer Identification Number (TIN) is already registered.' });
          }
        }
      } catch (err) {
        console.error('PostgreSQL register validation error:', err);
      }
    }

    const existingMem = usersStore.find((u) => u.email.toLowerCase() === cleanEmail);
    if (existingMem) {
      return res.status(400).json({ error: 'An account with this email address already exists. Please sign in or reset your password.' });
    }

    const hasLicense = efdaLicenseNo && efdaLicenseNo.trim().length > 3;
    const finalFacilityName = facilityName && facilityName.trim() ? facilityName.trim() : `${name}'s Healthcare Account`;
    const newUserId = `user-${Date.now()}`;
    const nowIso = new Date().toISOString();

    const newUserData = {
      id: newUserId,
      name: name.trim(),
      email: cleanEmail,
      passwordHash: password || null,
      role: role || 'verified_customer',
      facilityName: finalFacilityName,
      facilityType: facilityType || 'Pharmacy',
      businessAddress: businessAddress || '',
      region: region || 'Addis Ababa',
      city: city || 'Addis Ababa',
      phone: phone || '',
      efdaLicenseNo: efdaLicenseNo || '',
      tinNumber: tinNumber || '',
      vatRegistered: Boolean(vatRegistered),
      verificationStatus: role === 'admin' ? 'APPROVED' : (hasLicense ? 'UNDER_REVIEW' : 'PENDING'),
      efdaVerified: role === 'admin' ? true : false,
      creditLimitEtb: '0',
      creditUsedEtb: '0',
    };

    let createdDbUser = null;
    if (db) {
      try {
        const [inserted] = await db.insert(schema.users).values(newUserData).returning();
        if (inserted) createdDbUser = formatUserFromDb(inserted);
      } catch (err) {
        console.error('PostgreSQL user registration error:', err);
      }
    }

    const newUserMem = {
      ...newUserData,
      password: password || undefined,
      verificationStatus: newUserData.verificationStatus as any,
      role: newUserData.role as any,
      creditLimitEtb: 0,
      creditUsedEtb: 0,
      createdAt: nowIso,
    };
    usersStore.push(newUserMem);

    res.status(201).json({
      message: 'Account registered successfully.',
      user: createdDbUser || sanitizeUser(newUserMem),
    });
  });

  // Associate / Register Healthcare Facility for Existing Account
  app.post('/api/auth/associate-facility', async (req, res) => {
    const {
      userId,
      facilityName,
      facilityType,
      phone,
      city,
      region,
      businessAddress,
      efdaLicenseNo,
      tinNumber,
      vatRegistered,
    } = req.body;

    const db = getDb();
    let updatedDbUser = null;
    if (db) {
      try {
        const hasLicense = efdaLicenseNo && efdaLicenseNo.trim().length > 3;
        const updateData: any = {};
        if (facilityName) updateData.facilityName = facilityName;
        if (facilityType) updateData.facilityType = facilityType;
        if (phone) updateData.phone = phone;
        if (city) updateData.city = city;
        if (region) updateData.region = region;
        if (businessAddress) updateData.businessAddress = businessAddress;
        if (efdaLicenseNo) updateData.efdaLicenseNo = efdaLicenseNo;
        if (tinNumber) updateData.tinNumber = tinNumber;
        if (vatRegistered !== undefined) updateData.vatRegistered = Boolean(vatRegistered);
        if (hasLicense) updateData.verificationStatus = 'UNDER_REVIEW';

        const [updated] = await db.update(schema.users)
          .set(updateData)
          .where(eq(schema.users.id, userId))
          .returning();
        if (updated) updatedDbUser = formatUserFromDb(updated);
      } catch (err) {
        console.error('PostgreSQL associate facility error:', err);
      }
    }

    const user = usersStore.find((u) => u.id === userId);
    if (!user && !updatedDbUser) {
      return res.status(404).json({ error: 'User account not found.' });
    }

    if (user) {
      if (facilityName) user.facilityName = facilityName;
      if (facilityType) user.facilityType = facilityType;
      if (phone) user.phone = phone;
      if (city) user.city = city;
      if (region) user.region = region;
      if (businessAddress) user.businessAddress = businessAddress;
      if (efdaLicenseNo) user.efdaLicenseNo = efdaLicenseNo;
      if (tinNumber) user.tinNumber = tinNumber;
      if (vatRegistered !== undefined) user.vatRegistered = Boolean(vatRegistered);
      if (user.efdaLicenseNo && user.efdaLicenseNo.trim().length > 3) {
        user.verificationStatus = 'UNDER_REVIEW';
      }
    }

    res.json({
      message: 'Healthcare facility details associated successfully.',
      user: updatedDbUser || sanitizeUser(user),
    });
  });

  // B2B Customer Login
  app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email address is required to sign in.' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const db = getDb();

    if (db) {
      try {
        const [user] = await db.select().from(schema.users).where(eq(schema.users.email, cleanEmail));
        if (user) {
          if (password && user.passwordHash && user.passwordHash !== password) {
            return res.status(401).json({ error: 'Invalid password. Please check your password or reset it.' });
          }
          if (user.verificationStatus === 'SUSPENDED') {
            return res.status(403).json({ error: 'This business account has been suspended by Melala Compliance Operations. Please contact sales support.' });
          }
          return res.json({
            message: 'Signed in successfully.',
            user: formatUserFromDb(user),
          });
        }
      } catch (err) {
        console.error('PostgreSQL login error:', err);
      }
    }

    const memUser = usersStore.find((u) => u.email.toLowerCase() === cleanEmail);
    if (!memUser) {
      return res.status(401).json({ error: 'No registered B2B account found for this email address.' });
    }

    if (password && memUser.password && memUser.password !== password) {
      return res.status(401).json({ error: 'Invalid password. Please check your password or reset it.' });
    }

    if (memUser.verificationStatus === 'SUSPENDED') {
      return res.status(403).json({ error: 'This business account has been suspended by Melala Compliance Operations. Please contact sales support.' });
    }

    res.json({
      message: 'Signed in successfully.',
      user: sanitizeUser(memUser),
    });
  });

  // B2B Logout
  app.post('/api/auth/logout', (req, res) => {
    res.json({ message: 'Session logged out successfully.' });
  });

  // B2B Password Reset
  app.post('/api/auth/reset-password', async (req, res) => {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email address is required for password reset.' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const db = getDb();
    if (db) {
      try {
        const [user] = await db.select().from(schema.users).where(eq(schema.users.email, cleanEmail));
        if (user) {
          return res.json({ message: `Password reset verification link dispatched to ${email}. Check your email inbox.` });
        }
      } catch (err) {
        console.error('PostgreSQL reset password error:', err);
      }
    }

    const memUser = usersStore.find((u) => u.email.toLowerCase() === cleanEmail);
    if (!memUser) {
      return res.status(404).json({ error: 'No account registered with this email address.' });
    }

    res.json({ message: `Password reset verification link dispatched to ${email}. Check your email inbox.` });
  });

  // Update Customer Verification Status (Admin/Sales)
  app.patch('/api/auth/users/:id/status', async (req, res) => {
    const { status, creditLimitEtb } = req.body;
    const db = getDb();
    let updatedDbUser = null;

    if (db) {
      try {
        const updateData: any = {};
        if (status) {
          updateData.verificationStatus = status;
          if (status === 'APPROVED') {
            updateData.efdaVerified = true;
            updateData.role = 'verified_customer';
            if (creditLimitEtb !== undefined) updateData.creditLimitEtb = String(creditLimitEtb);
          } else if (status === 'REJECTED' || status === 'SUSPENDED') {
            updateData.efdaVerified = false;
            updateData.role = 'public';
          }
        }

        const [updated] = await db.update(schema.users)
          .set(updateData)
          .where(eq(schema.users.id, req.params.id))
          .returning();
        if (updated) updatedDbUser = formatUserFromDb(updated);
      } catch (err) {
        console.error('PostgreSQL patch status error:', err);
      }
    }

    const user = usersStore.find((u) => u.id === req.params.id);
    if (!user && !updatedDbUser) {
      return res.status(404).json({ error: 'User not found.' });
    }

    if (user && status) {
      user.verificationStatus = status;
      if (status === 'APPROVED') {
        user.efdaVerified = true;
        user.role = 'verified_customer';
        if (creditLimitEtb !== undefined) user.creditLimitEtb = creditLimitEtb;
        else if (user.creditLimitEtb === 0) user.creditLimitEtb = 250000;
      } else if (status === 'REJECTED' || status === 'SUSPENDED') {
        user.efdaVerified = false;
        user.role = 'public';
      }
    }

    const finalUser = updatedDbUser || sanitizeUser(user);
    res.json({ message: `User status updated to ${finalUser.verificationStatus}`, user: finalUser });
  });

  app.post('/api/verifications', async (req, res) => {
    const { userId, efdaLicenseNo, tinNumber } = req.body;
    const db = getDb();
    let updatedDbUser = null;

    if (db) {
      try {
        const updateData: any = { verificationStatus: 'UNDER_REVIEW', efdaVerified: false };
        if (efdaLicenseNo) updateData.efdaLicenseNo = efdaLicenseNo;
        if (tinNumber) updateData.tinNumber = tinNumber;

        const [updated] = await db.update(schema.users)
          .set(updateData)
          .where(eq(schema.users.id, userId))
          .returning();
        if (updated) updatedDbUser = formatUserFromDb(updated);
      } catch (err) {
        console.error('PostgreSQL post verifications error:', err);
      }
    }

    const user = usersStore.find((u) => u.id === userId);
    if (user) {
      user.efdaLicenseNo = efdaLicenseNo || user.efdaLicenseNo;
      user.tinNumber = tinNumber || user.tinNumber;
      user.verificationStatus = 'UNDER_REVIEW';
      user.efdaVerified = false;
    }

    res.json({ message: 'EFDA license document submitted for compliance review.', user: updatedDbUser || sanitizeUser(user) });
  });

  // --- GEMINI AI SERVICES ---

  // 1. AI Smart Quotation Assistant
  app.post('/api/ai/quotation-assistant', async (req, res) => {
    try {
      const { items, facilityName, facilityType, shippingCity } = req.body;

      const ai = getGeminiClient();
      if (!ai) {
        return res.json({
          analysis:
            'B2B Wholesale Optimization Note: Quotation verified for EFDA compliance. Quantities qualify for Tier-2 wholesale pricing.',
          suggestedDiscountPercent: 5,
          coldChainAdvice: 'Includes temperature-sensitive items requiring thermal insulated transport.',
          bundleRecommendation: 'Add 10 extra boxes of Paracetamol 500mg to unlock 8% overall invoice discount.',
        });
      }

      const prompt = `You are a B2B Pharmaceutical Sales Strategy & Quotation AI Specialist for Melala Pharmaceutical Wholesale in Ethiopia.
Analyze the following wholesale RFQ (Request for Quotation):
- Facility Name: ${facilityName || 'Healthcare Facility'}
- Facility Type: ${facilityType || 'Pharmacy'}
- Destination City: ${shippingCity || 'Addis Ababa'}
- Items Requested: ${JSON.stringify(items || [])}

Provide a concise, professional B2B advisory JSON object with key fields:
1. "analysis": A 2-3 sentence strategic summary evaluating order volume, EFDA compliance, and recommended price tier.
2. "suggestedDiscountPercent": Recommended custom discount % (between 3% and 12%).
3. "coldChainAdvice": Logistic handling instructions for any cold-chain or prescription drugs included.
4. "bundleRecommendation": High-margin cross-sell or bundle deal tailored to Ethiopian healthcare facility needs.

Return strictly valid JSON without markdown wrapping.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        },
      });

      const parsed = JSON.parse(response.text || '{}');
      res.json(parsed);
    } catch (err: any) {
      console.error('Gemini Quotation Assistant Error:', err);
      res.json({
        analysis:
          'B2B Quotation processed. Qualified for standard healthcare facility wholesale volume discounts.',
        suggestedDiscountPercent: 5,
        coldChainAdvice: 'All items will be packed according to Ethiopian EFDA temperature storage standards.',
        bundleRecommendation: 'Consider bundling with Melala PureCare antiseptics for additional 3% invoice savings.',
      });
    }
  });

  // 2. AI Sales Rep Demand Insights & Stock Assistant
  app.post('/api/ai/demand-insights', async (req, res) => {
    try {
      const { category, region } = req.body;
      const ai = getGeminiClient();

      if (!ai) {
        return res.json({
          marketTrend:
            'High seasonal demand for respiratory antibiotics and IV crystalloids across regional clinic hubs in Ethiopia.',
          recommendedStockActions: [
            'Maintain at least 60-day buffer stock of Ceftriaxone & Amoxicillin.',
            'Promote Melala PureCare antiseptics to hospital surgical wards.',
            'Reach out to verified pharmacies in Adama & Hawassa for quarterly re-orders.',
          ],
          salesRepScript:
            'Hello Dr., Melala Wholesale has just replenished EFDA-certified Ceftriaxone and Surgical Gloves with guaranteed batch expiries into 2028. Would you like a fast pro-forma invoice for your monthly clinic allocation?',
        });
      }

      const prompt = `You are a B2B Healthcare & Pharma Market Intelligence AI for Melala Pharmaceutical Wholesale in Ethiopia.
Generate demand insights for region: ${region || 'National Ethiopia'} and category: ${category || 'All Categories'}.

Return a JSON object containing:
- "marketTrend": 2 sentence summary of current Ethiopian pharmaceutical wholesale demand drivers.
- "recommendedStockActions": Array of 3 strategic recommendations for inventory management.
- "salesRepScript": A high-converting professional telephone / WhatsApp sales pitch script for a sales rep pitching to a hospital medical director or head pharmacist.

Return strictly valid JSON without markdown wrapping.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        },
      });

      const parsed = JSON.parse(response.text || '{}');
      res.json(parsed);
    } catch (err: any) {
      console.error('Gemini Demand Insights Error:', err);
      res.json({
        marketTrend:
          'Steady demand for essential Rx antibiotics and surgical consumables across major regional hubs.',
        recommendedStockActions: [
          'Monitor batch expiry dates for high-volume items.',
          'Offer volume credit terms to verified hospital accounts.',
        ],
        salesRepScript:
          'Greetings from Melala Wholesale! We have fresh stock of EFDA-registered medical supplies ready for express dispatch.',
      });
    }
  });

  // --- VITE / STATIC SERVING SETUP ---
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Melala Wholesale Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
