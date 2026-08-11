import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { requestAiQuotationAssistant } from '../services/api';
import {
  X,
  Trash2,
  Plus,
  Minus,
  Sparkles,
  ShoppingBag,
  Send,
  Building,
  CreditCard,
  Truck,
  Snowflake,
  ShieldCheck,
  CheckCircle,
  AlertCircle,
  FileCheck,
  Bookmark,
  Info,
} from 'lucide-react';

export const QuotationDrawer: React.FC = () => {
  const {
    isQuoteDrawerOpen,
    setIsQuoteDrawerOpen,
    cartItems,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    cartCount,
    cartSubtotalEtb,
    currentUser,
    submitQuoteRequest,
    submitDirectOrder,
    saveOrderDraft,
    showToast,
  } = useApp();

  const [shippingCity, setShippingCity] = useState('Addis Ababa');
  const [paymentTerms, setPaymentTerms] = useState<
    'Cash on Delivery' | '30-Day Credit Line' | 'Letter of Credit (LC)' | 'Advance Bank Transfer'
  >('30-Day Credit Line');
  const [paymentMethod, setPaymentMethod] = useState<
    'Bank Transfer (CBE)' | 'Dashen Bank' | 'Telebirr SuperApp' | 'Credit Terms'
  >('Credit Terms');
  const [deliveryAddress, setDeliveryAddress] = useState(
    'Central Pharmacy Medical Store, Main Facility'
  );
  const [customerNotes, setCustomerNotes] = useState('');

  const [aiLoading, setAiLoading] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<any | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isQuoteDrawerOpen) return null;

  const hasColdChain = cartItems.some((ci) => ci.product.coldChain);
  const moqViolations = cartItems.filter((ci) => ci.quantity < ci.product.moq);
  const discountEtb = cartSubtotalEtb > 50000 ? Math.round(cartSubtotalEtb * 0.05) : 0;
  const vatEtb = Math.round((cartSubtotalEtb - discountEtb) * 0.15);
  const shippingFeeEtb = hasColdChain ? 1500 : 800;
  const grandTotalEtb = cartSubtotalEtb - discountEtb + vatEtb + shippingFeeEtb;

  const handleFixMoqs = () => {
    cartItems.forEach((ci) => {
      if (ci.quantity < ci.product.moq) {
        updateCartQuantity(ci.product.id, ci.product.moq);
      }
    });
    showToast('MOQ Auto-Adjusted', 'All line quantities updated to meet minimum order quantities.', 'info');
  };

  const handleRunAiAssistant = async () => {
    if (cartItems.length === 0) return;
    setAiLoading(true);

    const result = await requestAiQuotationAssistant({
      items: cartItems.map((c) => ({
        name: c.product.name,
        qty: c.quantity,
        packSize: c.product.packSize,
        price: c.selectedTierPrice,
      })),
      facilityName: currentUser.facilityName,
      facilityType: currentUser.facilityType,
      shippingCity,
    });

    setAiLoading(false);
    if (result) {
      setAiAnalysis(result);
      showToast('AI Smart Quotation Analysis Complete', 'Gemini verified EFDA pack optimization and tier savings.', 'success');
    }
  };

  const handleRFSubmit = async () => {
    if (moqViolations.length > 0) {
      showToast('MOQ Required', 'Please adjust item quantities to meet Minimum Order Quantities before submitting.', 'error');
      return;
    }
    setIsSubmitting(true);
    await submitQuoteRequest({
      paymentTerms,
      shippingCity,
      customNotes: customerNotes,
    });
    setIsSubmitting(false);
  };

  const handleOrderSubmit = async () => {
    if (moqViolations.length > 0) {
      showToast('MOQ Required', 'Please adjust item quantities to meet Minimum Order Quantities before submitting.', 'error');
      return;
    }
    setIsSubmitting(true);
    await submitDirectOrder({
      paymentMethod,
      deliveryCity: shippingCity,
      deliveryAddress,
      customerNotes,
    });
    setIsSubmitting(false);
  };

  const handleDraftSave = async () => {
    setIsSubmitting(true);
    await saveOrderDraft({
      deliveryCity: shippingCity,
      deliveryAddress,
      customerNotes,
    });
    setIsSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/60 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-300">
        {/* Drawer Header */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-teal-400" />
            <div>
              <h3 className="font-bold text-base leading-none">B2B Wholesale RFQ & Order Cart</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Facility: <span className="text-teal-300 font-semibold">{currentUser.facilityName}</span>
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsQuoteDrawerOpen(false)}
            className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cart Body */}
        <div className="p-4 flex-1 overflow-y-auto space-y-4">
          {cartItems.length === 0 ? (
            <div className="text-center py-16 space-y-3">
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <h4 className="font-bold text-slate-800 text-base">Your RFQ Cart is Empty</h4>
              <p className="text-slate-500 text-xs max-w-sm mx-auto">
                Browse our EFDA-registered pharmaceuticals, medical equipment, and supplies catalog to build your wholesale order or quotation request.
              </p>
            </div>
          ) : (
            <>
              {/* Item List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700 border-b border-slate-200 pb-2">
                  <span>Requested Line Items ({cartItems.length})</span>
                  <button
                    onClick={clearCart}
                    className="text-rose-600 hover:underline text-[11px] font-medium cursor-pointer"
                  >
                    Clear All Items
                  </button>
                </div>

                {moqViolations.length > 0 && (
                  <div className="p-2.5 bg-amber-50 border border-amber-300 rounded-xl flex items-center justify-between text-amber-900 text-xs">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>{moqViolations.length} item(s) below Minimum Order Quantity (MOQ).</span>
                    </div>
                    <button
                      onClick={handleFixMoqs}
                      className="px-2 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded text-[10px] font-bold cursor-pointer transition-all"
                    >
                      Adjust All to MOQ
                    </button>
                  </div>
                )}

                {cartItems.map((ci) => {
                  const isMoqViolated = ci.quantity < ci.product.moq;
                  return (
                    <div
                      key={ci.product.id}
                      className={`p-3 border rounded-xl flex items-start justify-between gap-3 text-xs transition-all ${
                        isMoqViolated
                          ? 'bg-amber-50/50 border-amber-300'
                          : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-bold text-slate-900">{ci.product.name}</span>
                          {ci.product.coldChain && (
                            <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-1.5 py-0.2 rounded flex items-center gap-0.5">
                              <Snowflake className="w-2.5 h-2.5" /> Cold Chain
                            </span>
                          )}
                          {isMoqViolated && (
                            <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-1.5 py-0.2 rounded border border-amber-300">
                              MOQ: {ci.product.moq} packs
                            </span>
                          )}
                        </div>

                        <div className="text-[11px] text-slate-500">
                          {ci.product.packSize} • Unit Price:{' '}
                          <span className="font-semibold text-slate-800">
                            {ci.selectedTierPrice.toLocaleString()} ETB
                          </span>
                        </div>

                        <div className="text-[10px] font-mono text-teal-800 flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3 text-teal-600" />
                          <span>{ci.product.efdaRegistrationNo}</span>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-2">
                        <div className="flex items-center gap-1 bg-white border border-slate-300 rounded px-1.5 py-0.5">
                          <button
                            onClick={() => updateCartQuantity(ci.product.id, ci.quantity - 1)}
                            className="p-0.5 hover:bg-slate-100 rounded cursor-pointer text-slate-600"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className={`w-8 text-center font-bold text-xs ${isMoqViolated ? 'text-amber-700' : ''}`}>
                            {ci.quantity}
                          </span>
                          <button
                            onClick={() => updateCartQuantity(ci.product.id, ci.quantity + 1)}
                            className="p-0.5 hover:bg-slate-100 rounded cursor-pointer text-slate-600"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <div className="font-extrabold text-slate-900 text-sm">
                          {(ci.selectedTierPrice * ci.quantity).toLocaleString()} ETB
                        </div>

                        <button
                          onClick={() => removeFromCart(ci.product.id)}
                          className="text-slate-400 hover:text-rose-600 cursor-pointer text-[10px]"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Delivery & Payment Options */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-3 text-xs">
                <h4 className="font-bold text-slate-800 flex items-center gap-1.5">
                  <Truck className="w-4 h-4 text-teal-700" /> Dispatch & Payment Terms
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Destination City
                    </label>
                    <select
                      value={shippingCity}
                      onChange={(e) => setShippingCity(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs font-medium"
                    >
                      <option value="Addis Ababa">Addis Ababa (Same-Day Express)</option>
                      <option value="Adama">Adama Freight Hub</option>
                      <option value="Hawassa">Hawassa Regional Care</option>
                      <option value="Bahir Dar">Bahir Dar Logistics Center</option>
                      <option value="Mekelle">Mekelle Distribution Hub</option>
                      <option value="Dire Dawa">Dire Dawa Commercial Hub</option>
                      <option value="Gondar">Gondar Medical Depot</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Payment Terms
                    </label>
                    <select
                      value={paymentTerms}
                      onChange={(e) => setPaymentTerms(e.target.value as any)}
                      className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs font-medium"
                    >
                      <option value="30-Day Credit Line">30-Day Revolving Credit Line</option>
                      <option value="Cash on Delivery">Cash / Telebirr on Delivery</option>
                      <option value="Advance Bank Transfer">Advance CBE Bank Transfer</option>
                      <option value="Letter of Credit (LC)">Letter of Credit (LC)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Specific Delivery Address
                  </label>
                  <input
                    type="text"
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    placeholder="e.g. Central Pharmacy Store, Gate 2"
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Facility Special Notes & Instructions
                  </label>
                  <textarea
                    rows={2}
                    value={customerNotes}
                    onChange={(e) => setCustomerNotes(e.target.value)}
                    placeholder="e.g. Require batch expiry > 18 months; deliver before 2:00 PM."
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs"
                  />
                </div>
              </div>

              {/* Legal Confirmation Notice */}
              <div className="bg-blue-50/80 border border-blue-200 rounded-xl p-3 flex items-start gap-2 text-blue-900 text-[11px]">
                <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Commercial Notice:</p>
                  <p className="text-blue-800 font-semibold mt-0.5">
                    "Order subject to Melala confirmation."
                  </p>
                  <p className="text-blue-700 text-[10px] mt-0.5">
                    Orders undergo stock allocation verification and EFDA compliance checks before formal dispatch.
                  </p>
                </div>
              </div>

              {/* Gemini AI Quotation Assistant Callout */}
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-amber-900 font-bold text-xs">
                    <Sparkles className="w-4 h-4 text-amber-600 animate-spin" />
                    <span>Gemini AI Quotation Advisor</span>
                  </div>
                  <button
                    onClick={handleRunAiAssistant}
                    disabled={aiLoading}
                    className="px-2.5 py-1 bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold rounded text-[11px] cursor-pointer shadow-xs transition-all disabled:opacity-50"
                  >
                    {aiLoading ? 'Analyzing...' : 'Analyze Order Tier'}
                  </button>
                </div>

                {aiAnalysis && (
                  <div className="text-[11px] text-amber-950 space-y-1.5 pt-1 border-t border-amber-200/60">
                    <p className="font-medium">{aiAnalysis.analysis}</p>
                    {aiAnalysis.coldChainAdvice && (
                      <p className="text-blue-800 font-semibold text-[10px]">
                        ❄️ {aiAnalysis.coldChainAdvice}
                      </p>
                    )}
                    {aiAnalysis.bundleRecommendation && (
                      <p className="text-teal-900 font-bold text-[10px] bg-amber-100 p-1.5 rounded">
                        💡 {aiAnalysis.bundleRecommendation}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Drawer Footer & Order Summary */}
        {cartItems.length > 0 && (
          <div className="p-4 bg-slate-900 text-white border-t border-slate-800 space-y-3">
            <div className="space-y-1 text-xs text-slate-300">
              <div className="flex justify-between">
                <span>Subtotal ({cartCount} packs):</span>
                <span className="font-bold text-slate-100">{cartSubtotalEtb.toLocaleString()} ETB</span>
              </div>

              {discountEtb > 0 && (
                <div className="flex justify-between text-emerald-400 font-medium">
                  <span>B2B Volume Discount (5%):</span>
                  <span>-{discountEtb.toLocaleString()} ETB</span>
                </div>
              )}

              <div className="flex justify-between text-slate-400">
                <span>Estimated Ethiopian VAT (15%):</span>
                <span>+{vatEtb.toLocaleString()} ETB</span>
              </div>

              <div className="flex justify-between text-slate-400">
                <span>{hasColdChain ? 'Cold Chain Express Freight:' : 'Standard Freight:'}</span>
                <span>+{shippingFeeEtb.toLocaleString()} ETB</span>
              </div>

              <div className="flex justify-between text-sm font-extrabold text-amber-400 pt-2 border-t border-slate-800">
                <span>Grand Total:</span>
                <span>{grandTotalEtb.toLocaleString()} ETB</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-1">
              <button
                onClick={handleDraftSave}
                disabled={isSubmitting}
                className="py-2.5 px-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 rounded-lg text-xs font-bold cursor-pointer transition-all flex items-center justify-center gap-1"
                title="Save as Draft Order"
              >
                <Bookmark className="w-3.5 h-3.5 text-amber-400" />
                <span>Save Draft</span>
              </button>

              <button
                onClick={handleRFSubmit}
                disabled={isSubmitting}
                className="py-2.5 px-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 rounded-lg text-xs font-bold cursor-pointer transition-all flex items-center justify-center gap-1"
                title="Request Price Quotation for Bulk/Special Order"
              >
                <Send className="w-3.5 h-3.5 text-teal-400" />
                <span>Request Quote</span>
              </button>

              <button
                onClick={handleOrderSubmit}
                disabled={isSubmitting}
                className="py-2.5 px-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-bold cursor-pointer transition-all flex items-center justify-center gap-1 shadow-md"
                title="Submit Wholesale Order & Generate Pro-Forma Invoice"
              >
                <FileCheck className="w-3.5 h-3.5" />
                <span>Submit Order</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
