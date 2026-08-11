import React from 'react';
import { Product } from '../types';
import { useApp } from '../context/AppContext';
import { ShieldCheck, Snowflake, AlertCircle, ShoppingBag, Eye, Heart, Layers, Check } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart, setSelectedProductId, setCurrentPage, favorites, toggleFavorite } = useApp();
  const isFav = favorites.includes(product.id);

  const formatMoney = (val: number) => `${val.toLocaleString()} ETB`;

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden hover:shadow-md transition-all flex flex-col group relative">
      {/* Top Badges */}
      <div className="absolute top-2.5 left-2.5 right-2.5 z-10 flex items-center justify-between pointer-events-none">
        <div className="flex flex-col gap-1 items-start">
          {product.isStrategic && (
            <span className="bg-amber-400 text-slate-950 font-bold text-[10px] px-2 py-0.5 rounded-full shadow-xs uppercase tracking-wider">
              High Priority
            </span>
          )}
          {product.coldChain && (
            <span className="bg-blue-600 text-white font-semibold text-[10px] px-2 py-0.5 rounded-full shadow-xs flex items-center gap-1">
              <Snowflake className="w-3 h-3" /> Cold Chain 2-8°C
            </span>
          )}
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleFavorite(product.id);
          }}
          className={`p-1.5 rounded-full shadow-xs backdrop-blur-md transition-all pointer-events-auto cursor-pointer ${
            isFav ? 'bg-rose-50 text-rose-600' : 'bg-white/90 text-slate-400 hover:text-slate-700'
          }`}
          title="Save to Facility Favorites"
        >
          <Heart className={`w-4 h-4 ${isFav ? 'fill-rose-600' : ''}`} />
        </button>
      </div>

      {/* Image Banner */}
      <div
        onClick={() => {
          setSelectedProductId(product.id);
          setCurrentPage('product-detail');
        }}
        className="h-44 bg-slate-100 overflow-hidden relative cursor-pointer group-hover:opacity-95 transition-opacity"
      >
        <img
          src={product.imageUrl}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          referrerPolicy="no-referrer"
        />
        <div className="absolute bottom-2 left-2 bg-slate-900/80 text-slate-100 text-[10px] font-mono px-2 py-0.5 rounded backdrop-blur-xs flex items-center gap-1">
          <ShieldCheck className="w-3 h-3 text-teal-400" />
          <span>{product.efdaRegistrationNo}</span>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          <div className="text-[11px] font-semibold text-teal-700 uppercase tracking-wider">
            {product.brand}
          </div>

          <h3
            onClick={() => {
              setSelectedProductId(product.id);
              setCurrentPage('product-detail');
            }}
            className="font-bold text-slate-900 text-sm hover:text-teal-700 transition-colors cursor-pointer line-clamp-2 mt-0.5"
          >
            {product.name}
          </h3>

          {product.genericName && (
            <p className="text-xs text-slate-500 italic mt-0.5 line-clamp-1">
              {product.genericName}
            </p>
          )}

          {/* Pack size & MOQ info */}
          <div className="mt-2.5 pt-2 border-t border-slate-100 grid grid-cols-2 gap-1 text-[11px] text-slate-600">
            <div>
              <span className="text-slate-400 block text-[10px]">Pack Size:</span>
              <span className="font-semibold text-slate-800">{product.packSize}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">Min Order (MOQ):</span>
              <span className="font-semibold text-slate-800">{product.moq} Packs</span>
            </div>
          </div>
        </div>

        {/* Pricing Tier & Stock */}
        <div className="pt-2 border-t border-slate-100 space-y-2">
          <div className="flex items-baseline justify-between">
            <div>
              <div className="text-[10px] font-semibold text-slate-400 uppercase">Wholesale Unit Price</div>
              <div className="text-base font-extrabold text-slate-900">
                {formatMoney(product.unitPriceEtb)}
                <span className="text-[10px] text-slate-500 font-normal"> /pack</span>
              </div>
            </div>

            <div className="text-right">
              {product.stockQuantity > 500 ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                  <Check className="w-3 h-3" /> In Stock ({product.stockQuantity.toLocaleString()})
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                  <AlertCircle className="w-3 h-3" /> Low Stock ({product.stockQuantity})
                </span>
              )}
            </div>
          </div>

          {/* Tier Preview */}
          {product.tieredPricing && product.tieredPricing.length > 1 && (
            <div className="bg-slate-50 rounded-lg p-2 text-[10px] text-slate-600 space-y-1">
              <div className="font-semibold text-slate-700 flex items-center justify-between">
                <span>Tiered Wholesale Discounts:</span>
                <Layers className="w-3 h-3 text-teal-600" />
              </div>
              <div className="flex items-center justify-between text-slate-500">
                <span>{product.tieredPricing[1].tierLabel}</span>
                <span className="font-bold text-teal-700">{formatMoney(product.tieredPricing[1].unitPriceEtb)}</span>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={() => addToCart(product, product.moq)}
              className="flex-1 py-2 px-3 bg-teal-700 hover:bg-teal-800 active:bg-teal-900 text-white font-semibold rounded-lg text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Add to RFQ</span>
            </button>

            <button
              onClick={() => {
                setSelectedProductId(product.id);
                setCurrentPage('product-detail');
              }}
              className="p-2 border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-lg transition-colors cursor-pointer"
              title="View Complete EFDA Specs & Batch Details"
            >
              <Eye className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
