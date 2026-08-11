import React, { useState } from 'react';
import { Product } from '../types';
import { useApp } from '../context/AppContext';
import { ShieldCheck, Snowflake, ShoppingBag, Eye, Plus, Minus } from 'lucide-react';

interface ProductTableViewProps {
  products: Product[];
}

export const ProductTableView: React.FC<ProductTableViewProps> = ({ products }) => {
  const { addToCart, setSelectedProductId, setCurrentPage } = useApp();
  const [quantities, setQuantities] = useState<{ [productId: string]: number }>({});

  const getQty = (p: Product) => quantities[p.id] ?? p.moq;

  const setQty = (productId: string, val: number) => {
    setQuantities((prev) => ({
      ...prev,
      [productId]: Math.max(1, val),
    }));
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-x-auto shadow-xs">
      <table className="w-full text-left text-xs">
        <thead className="bg-slate-100 text-slate-700 font-bold uppercase tracking-wider border-b border-slate-200">
          <tr>
            <th className="p-3">Product Name & Generic</th>
            <th className="p-3">Category / Brand</th>
            <th className="p-3">Pack Size</th>
            <th className="p-3">EFDA Reg & Batch</th>
            <th className="p-3 text-right">Wholesale Price</th>
            <th className="p-3 text-center">Order Qty</th>
            <th className="p-3 text-right">Line Est.</th>
            <th className="p-3 text-center">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 text-slate-800">
          {products.map((p) => {
            const qty = getQty(p);
            // Calculate tier price based on current input qty
            let unitPrice = p.unitPriceEtb;
            if (p.tieredPricing && p.tieredPricing.length > 0) {
              const sorted = [...p.tieredPricing].sort((a, b) => b.minQuantity - a.minQuantity);
              const tier = sorted.find((t) => qty >= t.minQuantity);
              if (tier) unitPrice = tier.unitPriceEtb;
            }
            const lineTotal = unitPrice * qty;

            return (
              <tr key={p.id} className="hover:bg-teal-50/30 transition-colors">
                <td className="p-3 max-w-xs">
                  <div
                    onClick={() => {
                      setSelectedProductId(p.id);
                      setCurrentPage('product-detail');
                    }}
                    className="font-bold text-slate-900 hover:text-teal-700 cursor-pointer flex items-center gap-1.5"
                  >
                    <span>{p.name}</span>
                    {p.coldChain && (
                      <Snowflake className="w-3.5 h-3.5 text-blue-600 shrink-0" title="Cold Chain 2-8°C Required" />
                    )}
                  </div>
                  {p.genericName && <div className="text-[11px] text-slate-500 italic">{p.genericName}</div>}
                </td>

                <td className="p-3">
                  <div className="font-semibold text-slate-800">{p.brand}</div>
                  <div className="text-[10px] text-slate-500 capitalize">{p.category.replace('-', ' ')}</div>
                </td>

                <td className="p-3 font-medium text-slate-700">
                  <div>{p.packSize}</div>
                  <div className="text-[10px] text-slate-400">MOQ: {p.moq} packs</div>
                </td>

                <td className="p-3">
                  <div className="flex items-center gap-1 text-[11px] font-mono text-teal-800 font-semibold">
                    <ShieldCheck className="w-3 h-3 text-teal-600" />
                    {p.efdaRegistrationNo}
                  </div>
                  <div className="text-[10px] text-slate-500">Exp: {p.expiryDate} (Batch #{p.batchNo})</div>
                </td>

                <td className="p-3 text-right">
                  <div className="font-extrabold text-slate-900">{unitPrice.toLocaleString()} ETB</div>
                  {unitPrice < p.unitPriceEtb && (
                    <div className="text-[10px] text-emerald-600 font-bold">Tier Discount Active</div>
                  )}
                </td>

                <td className="p-3">
                  <div className="flex items-center justify-center gap-1">
                    <button
                      onClick={() => setQty(p.id, qty - 1)}
                      className="p-1 bg-slate-100 hover:bg-slate-200 rounded text-slate-700 cursor-pointer"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <input
                      type="number"
                      min="1"
                      value={qty}
                      onChange={(e) => setQty(p.id, parseInt(e.target.value) || 1)}
                      className="w-14 text-center font-bold border border-slate-300 rounded py-0.5 bg-slate-50 text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-teal-600"
                    />
                    <button
                      onClick={() => setQty(p.id, qty + 1)}
                      className="p-1 bg-slate-100 hover:bg-slate-200 rounded text-slate-700 cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </td>

                <td className="p-3 text-right font-extrabold text-teal-800">
                  {lineTotal.toLocaleString()} ETB
                </td>

                <td className="p-3 text-center">
                  <button
                    onClick={() => addToCart(p, qty)}
                    className="px-3 py-1.5 bg-teal-700 hover:bg-teal-800 text-white rounded-lg text-xs font-semibold cursor-pointer shadow-xs transition-all flex items-center gap-1 mx-auto"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>Add</span>
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
