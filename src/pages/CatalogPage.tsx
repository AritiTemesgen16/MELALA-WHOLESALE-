import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { ProductCard } from '../components/ProductCard';
import { ProductTableView } from '../components/ProductTableView';
import { ProductCategory } from '../types';
import {
  Search,
  Filter,
  Grid,
  List,
  Snowflake,
  ShieldCheck,
  Sparkles,
  SlidersHorizontal,
  X,
  PlusCircle,
  ArrowUpDown,
} from 'lucide-react';

export const CatalogPage: React.FC = () => {
  const { products, currentRole, setIsNewProductModalOpen } = useApp();

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedBrand, setSelectedBrand] = useState<string>('all');
  const [selectedAvailability, setSelectedAvailability] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'featured' | 'name-asc' | 'name-desc' | 'price-asc' | 'price-desc' | 'stock'>('featured');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [onlyColdChain, setOnlyColdChain] = useState<boolean>(false);
  const [onlyStrategic, setOnlyStrategic] = useState<boolean>(false);
  const [onlyPrescription, setOnlyPrescription] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  const categoriesList: { id: string; label: string }[] = [
    { id: 'all', label: 'All Products' },
    { id: 'pharmaceuticals', label: 'Medicines' },
    { id: 'medical-supplies', label: 'Medical Supplies' },
    { id: 'medical-equipment', label: 'Medical Equipment' },
    { id: 'cosmetics', label: 'Cosmetics' },
    { id: 'personal-care', label: 'Personal Care' },
    { id: 'other-healthcare', label: 'Other Healthcare Products' },
  ];

  // Extract unique brands for brand filter
  const uniqueBrands = useMemo(() => {
    const brandsSet = new Set<string>();
    products.forEach((p) => {
      if (p.brand) brandsSet.add(p.brand);
    });
    return Array.from(brandsSet).sort();
  }, [products]);

  const filteredProducts = useMemo(() => {
    let result = products.filter((p) => {
      if (selectedCategory !== 'all' && p.category !== selectedCategory) return false;
      if (selectedBrand !== 'all' && p.brand !== selectedBrand) return false;

      if (selectedAvailability === 'in-stock' && p.stockQuantity <= 0) return false;
      if (selectedAvailability === 'low-stock' && (p.stockQuantity <= 0 || p.stockQuantity > 500)) return false;
      if (selectedAvailability === 'out-of-stock' && p.stockQuantity > 0) return false;

      if (onlyColdChain && !p.coldChain) return false;
      if (onlyStrategic && !p.isStrategic) return false;
      if (onlyPrescription && !p.prescriptionRequired) return false;

      if (minPrice && p.unitPriceEtb < parseFloat(minPrice)) return false;
      if (maxPrice && p.unitPriceEtb > parseFloat(maxPrice)) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = p.name.toLowerCase().includes(q);
        const matchesGeneric = p.genericName?.toLowerCase().includes(q);
        const matchesBrand = p.brand.toLowerCase().includes(q);
        const matchesEfda = p.efdaRegistrationNo.toLowerCase().includes(q);
        const matchesSku = p.sku.toLowerCase().includes(q);
        const matchesCat = p.category.toLowerCase().includes(q);
        if (!matchesName && !matchesGeneric && !matchesBrand && !matchesEfda && !matchesSku && !matchesCat) {
          return false;
        }
      }

      return true;
    });

    // Sorting logic
    result = [...result].sort((a, b) => {
      if (sortBy === 'featured') {
        if (a.isStrategic && !b.isStrategic) return -1;
        if (!a.isStrategic && b.isStrategic) return 1;
        return a.name.localeCompare(b.name);
      }
      if (sortBy === 'name-asc') return a.name.localeCompare(b.name);
      if (sortBy === 'name-desc') return b.name.localeCompare(a.name);
      if (sortBy === 'price-asc') return a.unitPriceEtb - b.unitPriceEtb;
      if (sortBy === 'price-desc') return b.unitPriceEtb - a.unitPriceEtb;
      if (sortBy === 'stock') return b.stockQuantity - a.stockQuantity;
      return 0;
    });

    return result;
  }, [
    products,
    selectedCategory,
    selectedBrand,
    selectedAvailability,
    sortBy,
    searchQuery,
    minPrice,
    maxPrice,
    onlyColdChain,
    onlyStrategic,
    onlyPrescription,
  ]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              B2B Pharmaceutical & Healthcare Wholesale Directory
            </h1>
            <span className="text-xs font-bold text-teal-800 bg-teal-50 border border-teal-200 px-2.5 py-0.5 rounded-full">
              {filteredProducts.length} Items Listed
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            EFDA compliant batch inventory with tiered wholesale prices for verified health facilities.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {currentRole === 'admin' && (
            <button
              onClick={() => setIsNewProductModalOpen(true)}
              className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <PlusCircle className="w-4 h-4 text-amber-400" />
              <span>Add Product</span>
            </button>
          )}

          {/* View Mode Toggle */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
            <button
              onClick={() => setViewMode('grid')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                viewMode === 'grid' ? 'bg-white text-teal-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
              <span>Card Grid</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                viewMode === 'table' ? 'bg-white text-teal-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>Bulk Order Table</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-4 shadow-2xs">
        {/* Search Bar & Primary Toggles */}
        <div className="flex flex-col lg:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by product name, generic formulation, brand, SKU, category, or EFDA code..."
              className="w-full bg-white border border-slate-300 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-600"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs w-full lg:w-auto">
            <button
              onClick={() => setOnlyColdChain(!onlyColdChain)}
              className={`px-3 py-2 rounded-xl font-bold flex items-center gap-1.5 border transition-all cursor-pointer ${
                onlyColdChain
                  ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
              }`}
            >
              <Snowflake className="w-3.5 h-3.5" />
              <span>Cold Chain 2-8°C</span>
            </button>

            <button
              onClick={() => setOnlyStrategic(!onlyStrategic)}
              className={`px-3 py-2 rounded-xl font-bold flex items-center gap-1.5 border transition-all cursor-pointer ${
                onlyStrategic
                  ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-xs'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>High Priority</span>
            </button>

            <button
              onClick={() => setOnlyPrescription(!onlyPrescription)}
              className={`px-3 py-2 rounded-xl font-bold flex items-center gap-1.5 border transition-all cursor-pointer ${
                onlyPrescription
                  ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Prescription Rx</span>
            </button>
          </div>
        </div>

        {/* Secondary Filter Row: Brand, Availability, Sort, Price Range */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs pt-1 border-t border-slate-200/80">
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Manufacturer / Brand</label>
            <select
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-xl p-2 font-medium text-slate-800"
            >
              <option value="all">All Brands & Manufacturers</option>
              {uniqueBrands.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Stock Availability</label>
            <select
              value={selectedAvailability}
              onChange={(e) => setSelectedAvailability(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-xl p-2 font-medium text-slate-800"
            >
              <option value="all">All Stock Statuses</option>
              <option value="in-stock">In Stock (&gt; 0)</option>
              <option value="low-stock">Low Stock (&le; 500)</option>
              <option value="out-of-stock">Out of Stock</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Sort Directory By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full bg-white border border-slate-300 rounded-xl p-2 font-semibold text-slate-800"
            >
              <option value="featured">Featured / High Priority First</option>
              <option value="name-asc">Product Name (A-Z)</option>
              <option value="name-desc">Product Name (Z-A)</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="stock">Stock Level (Highest First)</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Price Range (ETB)</label>
            <div className="flex items-center gap-1.5">
              <input
                type="number"
                placeholder="Min"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl p-2 font-medium text-slate-800 text-xs"
              />
              <span className="text-slate-400 font-bold">-</span>
              <input
                type="number"
                placeholder="Max"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl p-2 font-medium text-slate-800 text-xs"
              />
            </div>
          </div>
        </div>

        {/* Category Pill Navigation */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {categoriesList.map((cat) => {
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-1.5 rounded-lg font-bold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-teal-700 text-white shadow-xs'
                    : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Catalog View */}
      {filteredProducts.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-3">
          <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
            <SlidersHorizontal className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-800 text-base">No Matching Products Found</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Try adjusting your search criteria, brand filters, or price range boundaries.
          </p>
          <button
            onClick={() => {
              setSelectedCategory('all');
              setSelectedBrand('all');
              setSelectedAvailability('all');
              setSortBy('featured');
              setSearchQuery('');
              setMinPrice('');
              setMaxPrice('');
              setOnlyColdChain(false);
              setOnlyStrategic(false);
              setOnlyPrescription(false);
            }}
            className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-bold cursor-pointer hover:bg-slate-800"
          >
            Reset All Filters
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredProducts.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      ) : (
        <ProductTableView products={filteredProducts} />
      )}
    </div>
  );
};

