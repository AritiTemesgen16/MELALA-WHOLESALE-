import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { createProduct, updateProduct, uploadMedia, deleteMedia } from '../services/api';
import { ProductCategory } from '../types';
import {
  X,
  PlusCircle,
  Snowflake,
  Package,
  Upload,
  Image as ImageIcon,
  Trash2,
  CheckCircle2,
  Cloud,
  Star,
  Edit3,
} from 'lucide-react';

export const NewProductModal: React.FC = () => {
  const {
    isNewProductModalOpen,
    setIsNewProductModalOpen,
    editingProduct,
    setEditingProduct,
    showToast,
    refreshData,
  } = useApp();

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
  
  // Gallery of Cloudinary image URLs
  const [images, setImages] = useState<string[]>([]);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadProgressMsg, setUploadProgressMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (editingProduct) {
      setName(editingProduct.name || '');
      setGenericName(editingProduct.genericName || '');
      setCategory(editingProduct.category || 'pharmaceuticals');
      setBrand(editingProduct.brand || '');
      setManufacturer(editingProduct.manufacturer || '');
      setDosageForm(editingProduct.dosageForm || 'Tablet');
      setPackSize(editingProduct.packSize || '');
      setMoq(editingProduct.moq || 10);
      setUnitPriceEtb(editingProduct.unitPriceEtb || 0);
      setEfdaRegistrationNo(editingProduct.efdaRegistrationNo || '');
      setBatchNo(editingProduct.batchNo || '');
      setExpiryDate(editingProduct.expiryDate || '');
      setColdChain(Boolean(editingProduct.coldChain));
      setIsStrategic(Boolean(editingProduct.isStrategic));
      setStockQuantity(editingProduct.stockQuantity || 0);
      setDescription(editingProduct.description || '');

      const initialGallery = editingProduct.images && editingProduct.images.length > 0
        ? editingProduct.images
        : (editingProduct.imageUrl ? [editingProduct.imageUrl] : []);
      setImages(initialGallery);
    } else {
      // Defaults for brand new product
      setName('');
      setGenericName('');
      setCategory('pharmaceuticals');
      setBrand('Ethiopian Pharmaceuticals Mfg S.C. (EPHARM)');
      setManufacturer('EPHARM Ethiopia');
      setDosageForm('Tablet');
      setPackSize('Box of 100 Tablets');
      setMoq(10);
      setUnitPriceEtb(650);
      setEfdaRegistrationNo('EFDA/DR/2026/0991');
      setBatchNo('BAT-2026-101');
      setExpiryDate('2028-12-31');
      setColdChain(false);
      setIsStrategic(false);
      setStockQuantity(2500);
      setDescription('Certified EFDA compliant pharmaceutical product.');
      setImages([
        'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=600&q=80'
      ]);
    }
  }, [editingProduct, isNewProductModalOpen]);

  if (!isNewProductModalOpen && !editingProduct) return null;

  const handleClose = () => {
    setIsNewProductModalOpen(false);
    setEditingProduct(null);
  };

  const targetFolder = category === 'medical-equipment' ? 'equipment' : 'products';

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (images.length + files.length > 5) {
      showToast('Maximum 5 Images Allowed', 'Products can store up to 5 Cloudinary gallery images.', 'error');
      return;
    }

    setIsUploadingImage(true);
    const newUploadedUrls: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      setUploadProgressMsg(`Uploading image ${i + 1} of ${files.length} to Cloudinary (melala/${targetFolder}/)...`);

      try {
        const reader = new FileReader();
        const dataUrlPromise = new Promise<string>((resolve, reject) => {
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = (err) => reject(err);
        });
        reader.readAsDataURL(file);

        const dataUrl = await dataUrlPromise;
        const uploadRes = await uploadMedia(dataUrl, targetFolder);

        if (uploadRes.success && uploadRes.url) {
          newUploadedUrls.push(uploadRes.url);
        } else {
          showToast('Image Upload Error', uploadRes.error || 'Failed to upload image.', 'error');
        }
      } catch (err: any) {
        console.error('Error reading/uploading file:', err);
        showToast('Upload Failed', 'An error occurred while uploading file.', 'error');
      }
    }

    if (newUploadedUrls.length > 0) {
      setImages((prev) => [...prev, ...newUploadedUrls]);
      showToast('Cloudinary Upload Success', `Added ${newUploadedUrls.length} image(s) to folder melala/${targetFolder}/`, 'success');
    }

    setIsUploadingImage(false);
    setUploadProgressMsg('');
    e.target.value = '';
  };

  const handleRemoveImage = (indexToRemove: number) => {
    const removedUrl = images[indexToRemove];
    setImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
    if (removedUrl && removedUrl.includes('cloudinary.com')) {
      deleteMedia(removedUrl);
    }
  };

  const handleSetPrimaryImage = (indexToPrimary: number) => {
    setImages((prev) => {
      const selected = prev[indexToPrimary];
      const rest = prev.filter((_, idx) => idx !== indexToPrimary);
      return [selected, ...rest];
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    const mainImageUrl = images.length > 0
      ? images[0]
      : 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=600&q=80';

    const payload = {
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
        { minQuantity: moq * 20, unitPriceEtb: Math.round(unitPriceEtb * 0.8), tierLabel: 'Master Wholesaler Tier' },
      ],
      efdaRegistrationNo,
      batchNo,
      expiryDate,
      coldChain,
      isStrategic,
      stockQuantity,
      warehouseLocation: 'Central Depot Addis Ababa - Row 5A',
      description,
      storageInstructions: coldChain ? 'CRITICAL COLD CHAIN: Store 2°C - 8°C' : 'Store below 25°C dry place',
      prescriptionRequired: category === 'pharmaceuticals',
      imageUrl: mainImageUrl,
      images,
    };

    if (editingProduct) {
      const updated = await updateProduct(editingProduct.id, payload);
      setIsSubmitting(false);
      if (updated) {
        showToast('Product Updated!', `${updated.name} updated with Cloudinary media.`, 'success');
        handleClose();
        refreshData();
      }
    } else {
      const newProd = await createProduct(payload);
      setIsSubmitting(false);
      if (newProd) {
        showToast('New Product Cataloged!', `${newProd.name} added to EFDA live inventory.`, 'success');
        handleClose();
        refreshData();
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200 my-8">
        {/* Header */}
        <div className="bg-slate-900 text-white p-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2">
            {editingProduct ? (
              <Edit3 className="w-5 h-5 text-amber-400" />
            ) : (
              <PlusCircle className="w-5 h-5 text-teal-400" />
            )}
            <div>
              <h3 className="font-bold text-sm">
                {editingProduct ? `Edit Catalog Product: ${editingProduct.name}` : 'Add New Product to B2B Catalog'}
              </h3>
              <p className="text-[11px] text-slate-400">
                Cloudinary Media Sync &amp; EFDA Batch Management
              </p>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          
          {/* Cloudinary Image Gallery Uploader */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4 text-teal-700" />
                  Product Media &amp; Cloudinary Image Gallery
                </span>
                <p className="text-[11px] text-slate-500">
                  Target Cloudinary Folder:{' '}
                  <span className="font-mono font-semibold text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded border border-teal-200">
                    melala/{targetFolder}/
                  </span>
                </p>
              </div>

              <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-teal-800 hover:bg-teal-900 text-white rounded-lg font-semibold cursor-pointer text-xs transition-all shadow-xs">
                <Upload className="w-3.5 h-3.5" />
                <span>Upload to Cloudinary</span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileUpload}
                  disabled={isUploadingImage || images.length >= 5}
                  className="hidden"
                />
              </label>
            </div>

            {isUploadingImage && (
              <div className="p-2.5 bg-amber-50 border border-amber-200 text-amber-800 rounded-lg text-[11px] flex items-center gap-2 animate-pulse">
                <Cloud className="w-4 h-4 text-amber-600 animate-spin" />
                <span>{uploadProgressMsg || 'Uploading media to Cloudinary storage...'}</span>
              </div>
            )}

            {/* Gallery Thumbnails */}
            {images.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-1">
                {images.map((imgUrl, idx) => {
                  const isPrimary = idx === 0;
                  const isCloudinaryUrl = imgUrl.includes('cloudinary.com');

                  return (
                    <div
                      key={idx}
                      className={`relative group rounded-xl overflow-hidden border-2 bg-slate-100 aspect-square flex flex-col justify-between ${
                        isPrimary ? 'border-teal-600 ring-2 ring-teal-600/20' : 'border-slate-200'
                      }`}
                    >
                      <img
                        src={imgUrl}
                        alt={`Product image ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />

                      {/* Primary Badge */}
                      {isPrimary && (
                        <div className="absolute top-1 left-1 bg-teal-700 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-xs flex items-center gap-1">
                          <Star className="w-2.5 h-2.5 fill-amber-300 text-amber-300" />
                          Primary
                        </div>
                      )}

                      {/* Cloudinary Tag */}
                      {isCloudinaryUrl && (
                        <div className="absolute bottom-1 left-1 bg-slate-900/80 text-teal-300 text-[8px] font-mono px-1 py-0.5 rounded flex items-center gap-0.5">
                          <Cloud className="w-2 h-2" />
                          Cloudinary
                        </div>
                      )}

                      {/* Action buttons on hover */}
                      <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        {!isPrimary && (
                          <button
                            type="button"
                            onClick={() => handleSetPrimaryImage(idx)}
                            title="Set as Primary Image"
                            className="p-1.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 cursor-pointer"
                          >
                            <Star className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(idx)}
                          title="Remove Image"
                          className="p-1.5 bg-rose-600 text-white rounded-lg hover:bg-rose-700 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center p-4 border border-dashed border-slate-300 rounded-xl bg-white text-slate-500 text-[11px]">
                No product images attached yet. Click "Upload to Cloudinary" to select product images.
              </div>
            )}
          </div>

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
                <option value="cosmetics">Cosmetics &amp; Dermatology</option>
                <option value="personal-care">Personal Care &amp; Hygiene</option>
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

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Description &amp; Specifications</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border border-slate-300 rounded-lg p-2 bg-slate-50"
            />
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
              <span>High Priority Strategic Promotion Product</span>
            </label>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-200">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg font-semibold hover:bg-slate-100 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isUploadingImage}
              className="px-5 py-2 bg-teal-800 hover:bg-teal-900 text-white rounded-lg font-semibold shadow-xs cursor-pointer transition-all flex items-center gap-1.5"
            >
              <Package className="w-4 h-4" />
              <span>{isSubmitting ? 'Saving...' : editingProduct ? 'Save Changes' : 'Catalog Product'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
