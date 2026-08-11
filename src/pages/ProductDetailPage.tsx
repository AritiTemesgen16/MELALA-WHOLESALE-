import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ProductCard } from '../components/ProductCard';
import {
  ArrowLeft,
  ShieldCheck,
  Snowflake,
  ShoppingBag,
  Layers,
  Building,
  CheckCircle,
  AlertCircle,
  FileText,
  Calendar,
  Package,
  Heart,
  Share2,
  FileCheck,
  PhoneCall,
} from 'lucide-react';

export const ProductDetailPage: React.FC = () => {
  const {
    products,
    selectedProductId,
    setSelectedProductId,
    setCurrentPage,
    addToCart,
    favorites,
    toggleFavorite,
    setIsQuoteDrawerOpen,
    showToast,
  } = useApp();

  const product = products.find((p) => p.id === selectedProductId) || products[0];

  const [quantity, setQuantity] = useState<number>(product.moq || 1);
  const isFav = favorites.includes(product.id);

  const formatMoney = (val: number) => `${val.toLocaleString()} ETB`;

  // Related products from the same category or brand
  const relatedProducts = products
    .filter((p) => p.id !== product.id && (p.category === product.category || p.brand === product.brand))
    .slice(0, 4);

  // Calculate tier price for selected quantity
  let currentTierPrice = product.unitPriceEtb;
  if (product.tieredPricing && product.tieredPricing.length > 0) {
    const sorted = [...product.tieredPricing].sort((a, b) => b.minQuantity - a.minQuantity);
    const tier = sorted.find((t) => quantity >= t.minQuantity);
    if (tier) currentTierPrice = tier.unitPriceEtb;
  }

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    showToast('Product Link Copied!', 'Shareable link copied to clipboard.', 'info');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Top Back Navigation */}
      <button
        onClick={() => setCurrentPage('catalog')}
        className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Product Directory</span>
      </button>

      {/* Main Spec Grid */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm grid grid-cols-1 md:grid-cols-12 gap-6 p-6 sm:p-8">
        {/* Left Col: Image & Badges */}
        <div className="md:col-span-5 space-y-4">
          <div className="h-80 bg-slate-100 rounded-xl overflow-hidden relative border border-slate-200">
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />

            <div className="absolute top-3 left-3 flex flex-col gap-1.5">
              {product.isStrategic && (
                <span className="bg-amber-400 text-slate-950 font-bold text-[11px] px-2.5 py-0.5 rounded-full shadow-xs">
                  Strategic Product
                </span>
              )}
              {product.coldChain && (
                <span className="bg-blue-600 text-white font-bold text-[11px] px-2.5 py-0.5 rounded-full shadow-xs flex items-center gap-1">
                  <Snowflake className="w-3.5 h-3.5" /> Cold Chain (2-8°C)
                </span>
              )}
            </div>

            <button
              onClick={() => toggleFavorite(product.id)}
              className={`absolute top-3 right-3 p-2 rounded-full shadow-xs backdrop-blur-md cursor-pointer ${
                isFav ? 'bg-rose-50 text-rose-600' : 'bg-white/90 text-slate-500 hover:text-slate-800'
              }`}
            >
              <Heart className={`w-5 h-5 ${isFav ? 'fill-rose-600' : ''}`} />
            </button>
          </div>

          {/* EFDA Regulatory Card */}
          <div className="p-4 bg-teal-50 border border-teal-200 rounded-xl space-y-2 text-xs text-teal-950">
            <div className="flex items-center gap-2 font-bold text-teal-900 border-b border-teal-200/80 pb-2">
              <ShieldCheck className="w-4 h-4 text-teal-700" />
              <span>EFDA Regulatory Quality Audit</span>
            </div>

            <div className="space-y-1 font-mono text-[11px]">
              <div>Registration Code: <span className="font-bold text-teal-900">{product.efdaRegistrationNo}</span></div>
              <div>Batch Number: <span className="font-bold text-teal-900">{product.batchNo}</span></div>
              <div>Expiry Date: <span className="font-bold text-teal-900">{product.expiryDate}</span></div>
              <div>Warehouse Storage: <span className="font-semibold text-slate-800">{product.warehouseLocation}</span></div>
            </div>
          </div>
        </div>

        {/* Right Col: Details & Purchase Matrix */}
        <div className="md:col-span-7 space-y-5">
          <div>
            <div className="text-xs font-bold text-teal-700 uppercase tracking-wider">
              {product.brand} • {product.manufacturer}
            </div>

            <h1 className="text-2xl font-extrabold text-slate-900 mt-0.5">
              {product.name}
            </h1>

            {product.genericName && (
              <p className="text-sm text-slate-600 italic font-medium mt-1">
                Active Ingredient / Formulation: {product.genericName}
              </p>
            )}
          </div>

          <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200">
            {product.description}
          </p>

          {/* Key Specs Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <div>
              <span className="text-slate-400 block text-[10px] font-semibold">Dosage Form:</span>
              <span className="font-bold text-slate-800">{product.dosageForm || 'Standard Packaging'}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] font-semibold">Pack Size:</span>
              <span className="font-bold text-slate-800">{product.packSize}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] font-semibold">Min Order (MOQ):</span>
              <span className="font-bold text-slate-800">{product.moq} Packs</span>
            </div>
          </div>

          {/* Tiered Pricing Discount Chart */}
          {product.tieredPricing && product.tieredPricing.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                <span className="flex items-center gap-1">
                  <Layers className="w-4 h-4 text-teal-700" />
                  Wholesale Tiered Discount Structure:
                </span>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
                <table className="w-full text-left">
                  <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px]">
                    <tr>
                      <th className="p-2">Wholesale Tier</th>
                      <th className="p-2">Min Qty</th>
                      <th className="p-2 text-right">Unit Price (ETB)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-800">
                    {product.tieredPricing.map((tier, idx) => (
                      <tr
                        key={idx}
                        className={quantity >= tier.minQuantity ? 'bg-teal-50/70 font-bold text-teal-900' : ''}
                      >
                        <td className="p-2">{tier.tierLabel}</td>
                        <td className="p-2">{tier.minQuantity}+ packs</td>
                        <td className="p-2 text-right font-bold">{formatMoney(tier.unitPriceEtb)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Order Calculator Bar & CTAs */}
          <div className="p-4 bg-slate-900 text-white rounded-xl space-y-3">
            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-[10px] text-slate-400 font-semibold block uppercase">Active Tier Unit Price</span>
                <span className="text-xl font-extrabold text-amber-400">
                  {formatMoney(currentTierPrice)}
                  <span className="text-xs text-slate-300 font-normal"> / pack</span>
                </span>
              </div>

              <div className="text-right">
                <span className="text-[10px] text-slate-400 font-semibold block uppercase">Line Total</span>
                <span className="text-xl font-extrabold text-white">
                  {formatMoney(currentTierPrice * quantity)}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800">
              <div className="flex items-center bg-slate-800 border border-slate-700 rounded-lg p-1 text-xs">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="px-2.5 py-1 text-slate-300 hover:text-white cursor-pointer font-bold"
                >
                  -
                </button>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                  className="w-16 text-center font-bold bg-transparent text-white focus:outline-none"
                />
                <button
                  onClick={() => setQuantity((q) => q + 1)}
                  className="px-2.5 py-1 text-slate-300 hover:text-white cursor-pointer font-bold"
                >
                  +
                </button>
              </div>

              {/* Action CTAs */}
              <button
                onClick={() => addToCart(product, quantity)}
                className="flex-1 py-2.5 px-3 bg-teal-600 hover:bg-teal-500 font-bold text-white rounded-lg text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-md transition-all"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Add to Order ({quantity} Packs)</span>
              </button>

              <button
                onClick={() => {
                  addToCart(product, quantity);
                  setIsQuoteDrawerOpen(true);
                }}
                className="py-2.5 px-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 font-bold text-amber-300 rounded-lg text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all"
              >
                <FileCheck className="w-4 h-4" />
                <span>Request Quote</span>
              </button>

              <button
                onClick={() => setCurrentPage('about-contact')}
                className="py-2.5 px-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 font-bold text-slate-200 rounded-lg text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all"
              >
                <PhoneCall className="w-4 h-4 text-blue-400" />
                <span>Contact Sales</span>
              </button>

              <button
                onClick={handleShare}
                className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg cursor-pointer"
                title="Share Product Spec"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products Section */}
      {relatedProducts.length > 0 && (
        <div className="space-y-4 pt-4 border-t border-slate-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-extrabold text-slate-900">
              Related Pharmaceutical & Healthcare Lines
            </h2>
            <button
              onClick={() => setCurrentPage('catalog')}
              className="text-xs font-bold text-teal-700 hover:text-teal-900 cursor-pointer"
            >
              View Full Catalog &rarr;
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

