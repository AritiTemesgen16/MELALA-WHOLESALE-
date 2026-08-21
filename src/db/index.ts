import { drizzle as drizzleNodePg } from 'drizzle-orm/node-postgres';
import { drizzle as drizzlePglite } from 'drizzle-orm/pglite';
import { PGlite } from '@electric-sql/pglite';
import pg from 'pg';
import path from 'path';
import fs from 'fs';
import * as schema from './schema.js';

const { Pool } = pg;

let pool: pg.Pool | null = null;
let pgliteClient: PGlite | null = null;
let dbInstance: any = null;

const INIT_SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS categories (
  id VARCHAR(64) PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT NOT NULL,
  product_count INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS brands (
  id VARCHAR(64) PRIMARY KEY,
  name TEXT NOT NULL,
  origin_country TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  certified_quality BOOLEAN DEFAULT true NOT NULL,
  product_count INTEGER DEFAULT 0 NOT NULL,
  logo_url TEXT
);

CREATE TABLE IF NOT EXISTS products (
  id VARCHAR(64) PRIMARY KEY,
  sku VARCHAR(64) NOT NULL UNIQUE,
  name TEXT NOT NULL,
  generic_name TEXT,
  category TEXT NOT NULL,
  brand TEXT NOT NULL,
  manufacturer TEXT NOT NULL,
  dosage_form TEXT,
  pack_size TEXT NOT NULL,
  moq INTEGER DEFAULT 1 NOT NULL,
  unit_price_etb NUMERIC(12, 2) NOT NULL,
  tiered_pricing JSONB DEFAULT '[]'::jsonb NOT NULL,
  efda_registration_no TEXT NOT NULL,
  batch_no TEXT NOT NULL,
  expiry_date TEXT NOT NULL,
  cold_chain BOOLEAN DEFAULT false NOT NULL,
  stock_quantity INTEGER DEFAULT 0 NOT NULL,
  warehouse_location TEXT NOT NULL,
  description TEXT NOT NULL,
  storage_instructions TEXT NOT NULL,
  prescription_required BOOLEAN DEFAULT false NOT NULL,
  is_strategic BOOLEAN DEFAULT false NOT NULL,
  is_featured BOOLEAN DEFAULT false,
  promotion_tag TEXT,
  image_url TEXT NOT NULL,
  images JSONB DEFAULT '[]'::jsonb NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS product_images (
  id VARCHAR(64) PRIMARY KEY,
  product_id VARCHAR(64) NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  secure_url TEXT NOT NULL,
  cloudinary_public_id TEXT,
  display_order INTEGER DEFAULT 0 NOT NULL,
  is_primary BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(64) PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT,
  role TEXT DEFAULT 'public' NOT NULL,
  facility_name TEXT NOT NULL,
  facility_type TEXT NOT NULL,
  business_address TEXT,
  region TEXT DEFAULT 'Addis Ababa',
  city TEXT NOT NULL,
  phone TEXT NOT NULL,
  efda_license_no TEXT,
  tin_number TEXT,
  vat_registered BOOLEAN DEFAULT false NOT NULL,
  verification_status TEXT DEFAULT 'PENDING' NOT NULL,
  efda_verified BOOLEAN DEFAULT false NOT NULL,
  credit_limit_etb NUMERIC(12, 2) DEFAULT 0 NOT NULL,
  credit_used_etb NUMERIC(12, 2) DEFAULT 0 NOT NULL,
  assigned_sales_rep TEXT,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS quotations (
  id VARCHAR(64) PRIMARY KEY,
  quote_number VARCHAR(64) NOT NULL UNIQUE,
  customer_id VARCHAR(64) REFERENCES users(id),
  customer_name TEXT NOT NULL,
  facility_name TEXT NOT NULL,
  facility_type TEXT NOT NULL,
  efda_license_no TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  contact_phone TEXT NOT NULL,
  shipping_city TEXT NOT NULL,
  status TEXT DEFAULT 'submitted' NOT NULL,
  payment_terms TEXT NOT NULL,
  items JSONB NOT NULL,
  subtotal_etb NUMERIC(12, 2) NOT NULL,
  discount_etb NUMERIC(12, 2) DEFAULT 0 NOT NULL,
  vat_etb NUMERIC(12, 2) NOT NULL,
  total_etb NUMERIC(12, 2) NOT NULL,
  customer_notes TEXT,
  sales_rep_notes TEXT,
  ai_optimization_notes TEXT,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS orders (
  id VARCHAR(64) PRIMARY KEY,
  order_number VARCHAR(64) NOT NULL UNIQUE,
  pro_forma_number VARCHAR(64) NOT NULL,
  customer_id VARCHAR(64) REFERENCES users(id),
  facility_name TEXT NOT NULL,
  facility_type TEXT NOT NULL,
  contact_name TEXT,
  contact_phone TEXT,
  contact_email TEXT,
  items JSONB NOT NULL,
  subtotal_etb NUMERIC(12, 2) NOT NULL,
  discount_etb NUMERIC(12, 2) DEFAULT 0,
  vat_etb NUMERIC(12, 2) NOT NULL,
  shipping_fee_etb NUMERIC(12, 2) NOT NULL,
  total_amount_etb NUMERIC(12, 2) NOT NULL,
  status TEXT DEFAULT 'pending_verification' NOT NULL,
  payment_status TEXT DEFAULT 'pro_forma_issued' NOT NULL,
  payment_method TEXT NOT NULL,
  delivery_city TEXT NOT NULL,
  delivery_address TEXT NOT NULL,
  cold_chain_handling BOOLEAN DEFAULT false NOT NULL,
  customer_notes TEXT,
  sales_notes TEXT,
  expected_delivery_date TEXT,
  confirmation_notice TEXT,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS customer_leads (
  id VARCHAR(64) PRIMARY KEY,
  facility_name TEXT NOT NULL,
  contact_person TEXT NOT NULL,
  facility_type TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  city TEXT NOT NULL,
  efda_status TEXT DEFAULT 'pending_verification' NOT NULL,
  lead_status TEXT DEFAULT 'NEW' NOT NULL,
  interested_categories JSONB DEFAULT '[]'::jsonb NOT NULL,
  estimated_monthly_volume_etb NUMERIC(12, 2) DEFAULT 0,
  last_contacted TEXT,
  assigned_rep_name TEXT DEFAULT 'Tewodros Bekele',
  notes TEXT,
  notes_log JSONB DEFAULT '[]'::jsonb NOT NULL,
  source TEXT,
  abandoned_cart_amount_etb NUMERIC(12, 2),
  abandoned_items JSONB DEFAULT '[]'::jsonb NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS callback_requests (
  id VARCHAR(64) PRIMARY KEY,
  facility_name TEXT NOT NULL,
  contact_person TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  facility_type TEXT DEFAULT 'Pharmacy',
  preferred_time TEXT DEFAULT 'Anytime',
  notes TEXT,
  status TEXT DEFAULT 'PENDING' NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS promotions (
  id VARCHAR(64) PRIMARY KEY,
  title TEXT NOT NULL,
  type TEXT NOT NULL,
  description TEXT NOT NULL,
  discount_percent INTEGER,
  code TEXT,
  applicable_product_ids JSONB DEFAULT '[]'::jsonb,
  badge_text TEXT NOT NULL,
  active BOOLEAN DEFAULT true NOT NULL,
  valid_until TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS demand_insights (
  id VARCHAR(64) PRIMARY KEY,
  search_term TEXT NOT NULL,
  search_count INTEGER DEFAULT 1 NOT NULL,
  quote_request_count INTEGER DEFAULT 0 NOT NULL,
  category TEXT,
  in_stock BOOLEAN DEFAULT true NOT NULL,
  estimated_demand_val_etb NUMERIC(12, 2) DEFAULT 100000,
  last_searched_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS owner_photos (
  id VARCHAR(64) PRIMARY KEY,
  owner_id VARCHAR(64) NOT NULL UNIQUE,
  owner_name TEXT NOT NULL,
  photo_url TEXT NOT NULL,
  cloudinary_public_id TEXT,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);
`;

export async function initDbSchema() {
  const connectionString = process.env.DATABASE_URL;
  const isProduction = process.env.NODE_ENV === 'production' || process.env.STRICT_POSTGRES === 'true';

  if (connectionString) {
    if (!pool) {
      pool = new Pool({
        connectionString,
        max: 10,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 5000,
        ssl: connectionString.includes('sslmode=require') || connectionString.includes('localhost') ? false : { rejectUnauthorized: false },
      });
    }
    const client = await pool.connect();
    try {
      await client.query(INIT_SCHEMA_SQL);
      try {
        await client.query('ALTER TABLE demand_insights RENAME COLUMN last_searchedat TO last_searched_at;');
      } catch (e) {
        // ignore if already renamed
      }
    } finally {
      client.release();
    }
  } else {
    if (isProduction) {
      console.error('FATAL: DATABASE_URL is missing in production mode. Refusing local PGlite fallback.');
      throw new Error('DATABASE_URL environment variable is required in production environment.');
    }
    if (!pgliteClient) {
      const dataDir = path.join(process.cwd(), 'data', 'postgres_db');
      if (!fs.existsSync(path.dirname(dataDir))) {
        fs.mkdirSync(path.dirname(dataDir), { recursive: true });
      }
      pgliteClient = new PGlite(dataDir);
    }
    await pgliteClient.exec(INIT_SCHEMA_SQL);
    try {
      await pgliteClient.exec('ALTER TABLE demand_insights RENAME COLUMN last_searchedat TO last_searched_at;');
    } catch (e) {
      // ignore if already renamed
    }
  }
}

export function getDb() {
  if (dbInstance) return dbInstance;

  const connectionString = process.env.DATABASE_URL;
  const isProduction = process.env.NODE_ENV === 'production' || process.env.STRICT_POSTGRES === 'true';

  if (connectionString) {
    try {
      if (!pool) {
        pool = new Pool({
          connectionString,
          max: 10,
          idleTimeoutMillis: 30000,
          connectionTimeoutMillis: 5000,
          ssl: connectionString.includes('sslmode=require') || connectionString.includes('localhost') ? false : { rejectUnauthorized: false },
        });
      }
      dbInstance = drizzleNodePg(pool, { schema });
      return dbInstance;
    } catch (err) {
      console.error('Error initializing PostgreSQL pool:', err);
      if (isProduction) {
        throw new Error('PostgreSQL database connection failed in production mode.');
      }
      return null;
    }
  }

  if (isProduction) {
    console.error('FATAL: DATABASE_URL is missing in production mode. Refusing local PGlite fallback.');
    throw new Error('DATABASE_URL environment variable is missing in production mode.');
  }

  try {
    if (!pgliteClient) {
      const dataDir = path.join(process.cwd(), 'data', 'postgres_db');
      if (!fs.existsSync(path.dirname(dataDir))) {
        fs.mkdirSync(path.dirname(dataDir), { recursive: true });
      }
      pgliteClient = new PGlite(dataDir);
    }
    dbInstance = drizzlePglite(pgliteClient, { schema });
    return dbInstance;
  } catch (err) {
    console.error('Error initializing PGlite PostgreSQL instance:', err);
    return null;
  }
}

export const db = getDb();
