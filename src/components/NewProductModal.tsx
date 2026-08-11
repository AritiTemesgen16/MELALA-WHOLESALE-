import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { createProduct } from '../services/api';
import { ProductCategory } from '../types';
import { X, PlusCircle, ShieldCheck, Snowflake, Package } from 'lucide-react';

export const NewProductModal: React.FC = () => {
  const { isNewProductModalOpen, setIsNewProductModalOpen, showToast, refreshData } = useApp();

  const [name, setName] = useState('');
  const [genericName, setGenericName] = useState('');
  const [category, setCategory] = useState<ProductCategory>('pharmaceuticals');
  const [brand, setBrand] = useState('Ethiopian Pharmaceuticals Mfg S.C. (EPHARM)');
  const [manufacturer, setManufacturer] = useState('EPHARM Ethiopia');
  const [dosageForm, setDosageForm] = useState('Tablet');
  const [packSize, setPackSize] = useState('Box of 100 Tablets');
  const [moq, setMoq] = useState(10);
  const [unitPriceEtb, setUnitPriceEtb] = useState(650);
  const [efdaRegistrationNo, setEfdaRegistrationNo] = useState('EFDA/DR/2026/0991');
  const [batchNo, setBatchNo] = useState('BAT-2026-101');
  const [expiryDate, setExpiryDate] = useState('2028-12-31');
  const [coldChain, setColdChain] = useState(false);
  const [isStrategic, setIsStrategic] = useState(false);
  const [stockQuantity, setStockQuantity] = useState(2500);
  const [description, setDescription] = useState('Certified EFDA compliant pharmaceutical product.');
  const [imageUrl, setImageUrl] = useState('https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=600&q=80');

  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isNewProductModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);

    const newProd = await createProduct({
      name,
      genericName,
      category,
      brand,
      manufacturer,
      dosageForm,
      packSize,
      moq,
      unitPriceEtb,
      tieredPricing: [
        { minQuantity: moq, unitPriceEtb, tierLabel: 'Standard Wholesale' },
        { minQuantity: moq * 5, unitPriceEtb: Math.round(unitPriceEtb * 0.9), tierLabel: 'Hospital Bulk Tier' },
      ],
      efdaRegistrationNo,
      batchNo,
      expiryDate,
      coldChain,
      isStrategic,
      stockQuantity,
      warehouseLocation: 'Central Depot Addis Ababa - Row 5A',
      description,
      storageInstructions: coldChain ? 'Store 2°C - 8°C Cold Chain' : 'Store below 25°C dry place',
      prescriptionRequired: category === 'pharmaceuticals',
      imageUrl,
    });

    setIsSubmitting(false);

    if (newProd) {
      showToast('New Product Added to B2B Catalog!', `${newProd.name} added to EFDA live inventory.`, 'success');
      setIsNewProductModalOpen(false);
      refreshData();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-slate-900 text-white p-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2">
            <PlusCircle className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="font-bold text-sm">Add New Product to Wholesale Catalog</h3>
              <p className="text-[11px] text-slate-400">EFDA Inventory & Batch Management</p>
            </div>
          </div>

          <button
            onClick={() => setIsNewProductModalOpen(false)}
            className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Product Brand Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Amoxicillin Trihydrate 500mg"
                className="w-full border border-slate-300 rounded-lg p-2 bg-slate-50 font-bold"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Generic / Active Ingredient (API)</label>
              <input
                type="text"
                value={genericName}
                onChange={(e) => setGenericName(e.target.value)}
                placeholder="e.g. Amoxicillin 500mg"
                className="w-full border border-slate-300 rounded-lg p-2 bg-slate-50 italic"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full border border-slate-300 rounded-lg p-2 bg-slate-50 font-medium"
              >
                <option value="pharmaceuticals">Pharmaceutical Medicines</option>
                <option value="medical-supplies">Medical Supplies</option>
                <option value="medical-equipment">Medical Equipment</option>
                <option value="cosmetics">Cosmetics & Dermatology</option>
                <option value="personal-care">Personal Care & Hygiene</option>
                <option value="other-healthcare">Other Healthcare / Nutrition</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Manufacturer Brand</label>
              <input
                type="text"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                className="w-full border border-slate-300 rounded-lg p-2 bg-slate-50"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Pack Size</label>
              <input
                type="text"
                required
                value={packSize}
                onChange={(e) => setPackSize(e.target.value)}
                placeholder="e.g. Box of 100 Capsules"
                className="w-full border border-slate-300 rounded-lg p-2 bg-slate-50"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Min Order Qty (MOQ)</label>
              <input
                type="number"
                min="1"
                required
                value={moq}
                onChange={(e) => setMoq(parseInt(e.target.value) || 1)}
                className="w-full border border-slate-300 rounded-lg p-2 bg-slate-50 font-bold"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Wholesale Price (ETB/pack)</label>
              <input
                type="number"
                min="1"
                required
                value={unitPriceEtb}
                onChange={(e) => setUnitPriceEtb(parseInt(e.target.value) || 0)}
                className="w-full border border-slate-300 rounded-lg p-2 bg-slate-50 font-bold text-teal-800"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Initial Stock (Packs)</label>
              <input
                type="number"
                min="0"
                required
                value={stockQuantity}
                onChange={(e) => setStockQuantity(parseInt(e.target.value) || 0)}
                className="w-full border border-slate-300 rounded-lg p-2 bg-slate-50"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">EFDA Reg No.</label>
              <input
                type="text"
                required
                value={efdaRegistrationNo}
                onChange={(e) => setEfdaRegistrationNo(e.target.value)}
                className="w-full border border-slate-300 rounded-lg p-2 bg-slate-50 font-mono font-bold text-teal-900"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Batch Number</label>
              <input
                type="text"
                required
                value={batchNo}
                onChange={(e) => setBatchNo(e.target.value)}
                className="w-full border border-slate-300 rounded-lg p-2 bg-slate-50 font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Expiration Date</label>
              <input
                type="date"
                required
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="w-full border border-slate-300 rounded-lg p-2 bg-slate-50"
              />
            </div>
          </div>

          <div className="flex items-center gap-6 pt-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
            <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-700">
              <input
                type="checkbox"
                checked={coldChain}
                onChange={(e) => setColdChain(e.target.checked)}
                className="w-4 h-4 text-teal-600 rounded"
              />
              <span className="flex items-center gap-1">
                <Snowflake className="w-3.5 h-3.5 text-blue-600" /> Cold Chain Required (2-8°C)
              </span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-700">
              <input
                type="checkbox"
                checked={isStrategic}
                onChange={(e) => setIsStrategic(e.target.checked)}
                className="w-4 h-4 text-amber-500 rounded"
              />
              <span>High Priority Strategic Product</span>
            </label>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsNewProductModalOpen(false)}
              className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg font-semibold hover:bg-slate-100 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-lg font-semibold shadow-xs cursor-pointer transition-all flex items-center gap-1.5"
            >
              <Package className="w-4 h-4" />
              <span>{isSubmitting ? 'Saving...' : 'Save Product to Catalog'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
