import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Building2,
  ShieldCheck,
  CreditCard,
  Truck,
  RotateCcw,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  Download,
  Plus,
  ShoppingBag,
  ArrowRight,
  User,
  Phone,
  Mail,
  MapPin,
  FileBadge,
  ShieldAlert,
  Edit,
  XCircle,
  HelpCircle,
} from 'lucide-react';

export const CustomerPortalPage: React.FC = () => {
  const {
    currentUser,
    orders,
    quotations,
    setProFormaModalOrder,
    addToCart,
    setCurrentPage,
    setIsVerificationModalOpen,
    openAuthModal,
    showToast,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'orders' | 'profile' | 'quotes'>('orders');

  const myOrders = orders.filter(
    (o) => o.customerId === currentUser.id || o.facilityName === currentUser.facilityName
  );
  const myQuotes = quotations.filter(
    (q) => q.facilityName === currentUser.facilityName || q.customerName === currentUser.name
  );

  const availableCredit = (currentUser.creditLimitEtb || 0) - (currentUser.creditUsedEtb || 0);
  const creditUsagePercent = currentUser.creditLimitEtb
    ? Math.min(100, Math.round(((currentUser.creditUsedEtb || 0) / currentUser.creditLimitEtb) * 100))
    : 0;

  const handleReorder = (order: any) => {
    order.items.forEach((item: any) => {
      const reorderProduct = {
        id: item.productId,
        sku: item.sku || 'MEL-SKU-001',
        name: item.productName,
        category: 'pharmaceuticals' as any,
        brand: 'Ethiopian Pharmaceuticals Mfg S.C. (EPHARM)',
        manufacturer: 'EPHARM',
        packSize: item.packSize,
        moq: 1,
        unitPriceEtb: item.unitPriceEtb,
        tieredPricing: [],
        efdaRegistrationNo: 'EFDA/DR/2026/001',
        batchNo: item.batchNo,
        expiryDate: item.expiryDate,
        coldChain: false,
        stockQuantity: 1000,
        warehouseLocation: 'Central Depot',
        description: 'Reorder item',
        storageInstructions: 'Store dry',
        prescriptionRequired: true,
        isStrategic: false,
        imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=600&q=80',
      };
      addToCart(reorderProduct, item.quantity);
    });

    showToast('Reorder Items Added to Cart!', `${order.items.length} line items loaded into RFQ cart.`, 'success');
  };

  const status = currentUser.verificationStatus || (currentUser.efdaVerified ? 'APPROVED' : 'PENDING');

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Header Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <span className="p-2.5 bg-teal-950 border border-teal-800 rounded-xl text-teal-400">
              <Building2 className="w-6 h-6" />
            </span>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-extrabold text-white">{currentUser.facilityName}</h1>
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase bg-teal-950 border border-teal-800 text-teal-300">
                  {currentUser.facilityType}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Contact: <span className="text-slate-200 font-semibold">{currentUser.name}</span> • Location: <span className="text-slate-200 font-semibold">{currentUser.city}, {currentUser.region || 'Ethiopia'}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2 flex-wrap">
            {status === 'APPROVED' && (
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-800 px-3 py-1 rounded-full">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                EFDA Verified License: {currentUser.efdaLicenseNo || 'EFDA/HOS/AA/2021/0082'}
              </span>
            )}

            {status === 'UNDER_REVIEW' && (
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-300 bg-amber-950/80 border border-amber-800 px-3 py-1 rounded-full">
                <Clock className="w-4 h-4 text-amber-400 animate-spin" />
                EFDA License Under Compliance Review
              </span>
            )}

            {status === 'PENDING' && (
              <button
                onClick={() => setIsVerificationModalOpen(true)}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-300 bg-amber-950/80 border border-amber-800 px-3 py-1 rounded-full hover:bg-amber-900 cursor-pointer transition-all"
              >
                <AlertCircle className="w-4 h-4 text-amber-400" />
                Verification Status: PENDING (Upload License)
              </button>
            )}

            {status === 'REJECTED' && (
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-red-300 bg-red-950/80 border border-red-800 px-3 py-1 rounded-full">
                <XCircle className="w-4 h-4 text-red-400" />
                License Verification Rejected
              </span>
            )}

            {status === 'SUSPENDED' && (
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-red-200 bg-red-950 border border-red-700 px-3 py-1 rounded-full">
                <ShieldAlert className="w-4 h-4 text-red-400" />
                Account Suspended
              </span>
            )}
          </div>
        </div>

        {/* Credit Line Box */}
        <div className="bg-slate-800/90 border border-slate-700 rounded-xl p-4 min-w-[280px] space-y-2">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-slate-300 flex items-center gap-1">
              <CreditCard className="w-4 h-4 text-teal-400" />
              Revolving B2B Credit Line:
            </span>
            <span className="text-amber-400 font-extrabold">
              {currentUser.creditLimitEtb.toLocaleString()} ETB
            </span>
          </div>

          <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
            <div
              className="bg-teal-500 h-full rounded-full transition-all"
              style={{ width: `${creditUsagePercent}%` }}
            ></div>
          </div>

          <div className="flex justify-between text-[11px] text-slate-400 font-medium">
            <span>Used: {currentUser.creditUsedEtb.toLocaleString()} ETB</span>
            <span className="text-emerald-400 font-bold">Avail: {availableCredit.toLocaleString()} ETB</span>
          </div>
        </div>
      </div>

      {/* Verification Limitation Notice Banner */}
      {status !== 'APPROVED' && (
        <div className="bg-amber-50 border border-amber-300 rounded-2xl p-5 text-amber-950 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <ShieldAlert className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="font-extrabold text-sm text-amber-900">
                Regulatory Limitation Notice (Verification Status: {status})
              </h4>
              <p className="text-xs text-amber-800 leading-relaxed">
                In compliance with Ethiopian Food & Drug Authority (EFDA) regulations, unverified accounts cannot place direct dispatch orders for prescription & controlled medicines. You can submit RFQ quote requests and upload facility license documentation for immediate verification.
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsVerificationModalOpen(true)}
            className="px-4 py-2 bg-amber-800 hover:bg-amber-900 text-white text-xs font-bold rounded-xl shrink-0 cursor-pointer transition-all flex items-center gap-1.5"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Upload License Now</span>
          </button>
        </div>
      )}

      {/* Customer Dashboard Navigation Tabs */}
      <div className="flex border-b border-slate-200 bg-white rounded-xl shadow-2xs p-1 text-xs font-bold text-slate-600">
        <button
          onClick={() => setActiveTab('orders')}
          className={`flex-1 py-2.5 px-4 rounded-lg cursor-pointer transition-all flex items-center justify-center gap-2 ${
            activeTab === 'orders'
              ? 'bg-slate-900 text-white shadow-xs font-extrabold'
              : 'hover:bg-slate-100 text-slate-700'
          }`}
        >
          <Truck className="w-4 h-4" />
          <span>Orders & Shipment History ({myOrders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('quotes')}
          className={`flex-1 py-2.5 px-4 rounded-lg cursor-pointer transition-all flex items-center justify-center gap-2 ${
            activeTab === 'quotes'
              ? 'bg-slate-900 text-white shadow-xs font-extrabold'
              : 'hover:bg-slate-100 text-slate-700'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Quotations & RFQs ({myQuotes.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`flex-1 py-2.5 px-4 rounded-lg cursor-pointer transition-all flex items-center justify-center gap-2 ${
            activeTab === 'profile'
              ? 'bg-slate-900 text-white shadow-xs font-extrabold'
              : 'hover:bg-slate-100 text-slate-700'
          }`}
        >
          <User className="w-4 h-4" />
          <span>Facility Profile & Account Status</span>
        </button>
      </div>

      {/* TAB CONTENT 1: ORDERS */}
      {activeTab === 'orders' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h2 className="text-lg font-extrabold text-slate-900">Wholesale Orders & Shipment Tracking</h2>
                <p className="text-xs text-slate-500">View real-time dispatch status and Pro-Forma invoices.</p>
              </div>

              <button
                onClick={() => setCurrentPage('catalog')}
                className="px-3.5 py-1.5 bg-teal-700 hover:bg-teal-800 text-white rounded-lg text-xs font-bold cursor-pointer transition-all flex items-center gap-1 shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Wholesale Order</span>
              </button>
            </div>

            {myOrders.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center space-y-3">
                <FileText className="w-10 h-10 text-slate-400 mx-auto" />
                <h3 className="font-bold text-slate-800 text-sm">No Orders Found for this Facility</h3>
                <p className="text-xs text-slate-500">Place your first order through our product directory.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {myOrders.map((ord) => (
                  <div
                    key={ord.id}
                    className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:border-teal-500 transition-all space-y-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-slate-900 text-sm">{ord.orderNumber}</span>
                          <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                            Pro-Forma: {ord.proFormaNumber}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          Placed on {new Date(ord.createdAt).toLocaleDateString('en-GB')} • Destination: {ord.deliveryCity}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs font-extrabold text-teal-900 bg-teal-50 border border-teal-200 px-2.5 py-1 rounded-lg">
                          {ord.totalAmountEtb.toLocaleString()} ETB
                        </span>

                        <button
                          onClick={() => setProFormaModalOrder(ord)}
                          className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold cursor-pointer flex items-center gap-1"
                          title="View Official Pro-Forma Invoice"
                        >
                          <FileText className="w-3.5 h-3.5 text-teal-700" />
                          <span className="hidden sm:inline">Pro-Forma</span>
                        </button>
                      </div>
                    </div>

                    {/* Order Status & Progress Bar */}
                    <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 space-y-2 text-xs">
                      <div className="flex items-center justify-between font-bold text-slate-800 text-[11px] flex-wrap gap-2">
                        <span className="flex items-center gap-1.5 text-teal-800">
                          <Truck className="w-4 h-4 text-teal-600" />
                          Status:{' '}
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                              ord.status === 'CONFIRMED' || ord.status === 'approved'
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                : ord.status === 'COMPLETED' || ord.status === 'delivered'
                                ? 'bg-teal-100 text-teal-800 border border-teal-300'
                                : ord.status === 'OUT_FOR_DELIVERY' || ord.status === 'READY_FOR_DELIVERY' || ord.status === 'in_transit'
                                ? 'bg-blue-100 text-blue-800 border border-blue-300'
                                : ord.status === 'UNDER_REVIEW' || ord.status === 'SUBMITTED' || ord.status === 'pending_verification'
                                ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                : ord.status === 'DRAFT'
                                ? 'bg-slate-200 text-slate-700'
                                : 'bg-rose-100 text-rose-800 border border-rose-300'
                            }`}
                          >
                            {ord.status.replace(/_/g, ' ')}
                          </span>
                        </span>
                        <span className="text-slate-500">Expected Delivery: {ord.expectedDeliveryDate}</span>
                      </div>

                      {/* Notice Banner */}
                      <div className="text-[10px] text-blue-900 font-medium bg-blue-50/80 px-2.5 py-1 rounded border border-blue-200 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3 text-blue-600 shrink-0" />
                        <span>Order subject to Melala confirmation.</span>
                      </div>

                      <div className="grid grid-cols-5 gap-1 text-[9px] sm:text-[10px] font-semibold text-center pt-1">
                        <div className={ord.status !== 'DRAFT' && ord.status !== 'CANCELLED' ? 'bg-teal-700 text-white py-1 rounded' : 'bg-slate-200 text-slate-500 py-1 rounded'}>
                          1. Submitted
                        </div>
                        <div className={['UNDER_REVIEW', 'CONFIRMED', 'PROCESSING', 'READY_FOR_DELIVERY', 'OUT_FOR_DELIVERY', 'COMPLETED', 'approved', 'dispatch_ready', 'in_transit', 'delivered'].includes(ord.status) ? 'bg-teal-700 text-white py-1 rounded' : 'bg-slate-200 text-slate-500 py-1 rounded'}>
                          2. Reviewed
                        </div>
                        <div className={['CONFIRMED', 'PROCESSING', 'READY_FOR_DELIVERY', 'OUT_FOR_DELIVERY', 'COMPLETED', 'dispatch_ready', 'in_transit', 'delivered'].includes(ord.status) ? 'bg-teal-700 text-white py-1 rounded' : 'bg-slate-200 text-slate-500 py-1 rounded'}>
                          3. Confirmed
                        </div>
                        <div className={['READY_FOR_DELIVERY', 'OUT_FOR_DELIVERY', 'COMPLETED', 'in_transit', 'delivered'].includes(ord.status) ? 'bg-teal-700 text-white py-1 rounded' : 'bg-slate-200 text-slate-500 py-1 rounded'}>
                          4. Dispatched
                        </div>
                        <div className={['COMPLETED', 'delivered'].includes(ord.status) ? 'bg-teal-700 text-white py-1 rounded' : 'bg-slate-200 text-slate-500 py-1 rounded'}>
                          5. Delivered
                        </div>
                      </div>
                    </div>

                    {/* Item Summary */}
                    <div className="space-y-2">
                      <div className="text-[11px] font-bold text-slate-500 uppercase">Items in Shipment:</div>
                      <div className="divide-y divide-slate-100 text-xs">
                        {ord.items.map((it, idx) => (
                          <div key={idx} className="py-1.5 flex items-center justify-between text-slate-800">
                            <div>
                              <span className="font-bold">{it.productName}</span>
                              <span className="text-slate-500 text-[11px] ml-2">({it.packSize})</span>
                              <span className="text-slate-400 font-mono text-[10px] ml-2">Batch #{it.batchNo}</span>
                            </div>
                            <div className="font-semibold text-slate-900">
                              {it.quantity} packs × {it.unitPriceEtb.toLocaleString()} ETB
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-slate-500">
                        Payment Method: <span className="text-slate-800">{ord.paymentMethod}</span>
                      </span>

                      <button
                        onClick={() => handleReorder(ord)}
                        className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold cursor-pointer flex items-center gap-1.5 shadow-xs transition-all"
                      >
                        <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
                        <span>1-Click Reorder All Items</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="lg:col-span-4 space-y-6">
            <div className="bg-teal-900 text-white rounded-2xl p-5 shadow-md space-y-4">
              <div className="flex items-center gap-2 border-b border-teal-800 pb-3">
                <RotateCcw className="w-5 h-5 text-amber-400" />
                <div>
                  <h3 className="font-bold text-sm">Pharmacy Quick Reorder Pad</h3>
                  <p className="text-[10px] text-teal-200">1-Click Preset Allocations</p>
                </div>
              </div>

              <p className="text-xs text-slate-200 leading-relaxed">
                Speed up repeat wholesale purchasing for your pharmacy or clinic. Select a pre-configured allocation preset below to populate your RFQ cart in seconds.
              </p>

              <div className="space-y-2.5">
                <button
                  onClick={() => {
                    const sampleOrder = {
                      items: [
                        { productId: 'prod-1', productName: 'Amoxicillin 500mg Capsules', packSize: 'Box of 100 Capsules', quantity: 20, unitPriceEtb: 420, batchNo: 'AMX-2026-A1', expiryDate: '2028-06-30' },
                        { productId: 'prod-2', productName: 'Ceftriaxone 1g Powder for Injection', packSize: 'Box of 10 Vials', quantity: 15, unitPriceEtb: 850, batchNo: 'CFT-2026-B2', expiryDate: '2027-12-31' },
                        { productId: 'prod-3', productName: 'Paracetamol 500mg Tablets', packSize: 'Box of 100 Tablets', quantity: 30, unitPriceEtb: 180, batchNo: 'PCM-2026-C3', expiryDate: '2028-09-15' },
                      ]
                    };
                    handleReorder(sampleOrder);
                  }}
                  className="w-full text-left p-3 bg-teal-800/80 hover:bg-teal-800 border border-teal-700 rounded-xl transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between text-xs font-bold text-amber-300">
                    <span>💊 Monthly Essential Antibiotics Bundle</span>
                    <ArrowRight className="w-3.5 h-3.5 text-amber-400 group-hover:translate-x-1 transition-transform" />
                  </div>
                  <p className="text-[10px] text-teal-100 mt-1">20x Amoxicillin, 15x Ceftriaxone, 30x Paracetamol</p>
                </button>

                <button
                  onClick={() => {
                    const sampleOrder = {
                      items: [
                        { productId: 'prod-4', productName: 'Normal Saline 0.9% IV Infusion 500ml', packSize: 'Box of 20 Bottles', quantity: 10, unitPriceEtb: 1250, batchNo: 'NS-2026-D4', expiryDate: '2028-03-31' },
                        { productId: 'prod-5', productName: 'Surgical Examination Gloves (Latex Free)', packSize: 'Box of 100 Pairs', quantity: 25, unitPriceEtb: 650, batchNo: 'GLV-2026-E5', expiryDate: '2029-01-31' },
                      ]
                    };
                    handleReorder(sampleOrder);
                  }}
                  className="w-full text-left p-3 bg-teal-800/80 hover:bg-teal-800 border border-teal-700 rounded-xl transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between text-xs font-bold text-amber-300">
                    <span>💧 Emergency IV Fluids & Consumables</span>
                    <ArrowRight className="w-3.5 h-3.5 text-amber-400 group-hover:translate-x-1 transition-transform" />
                  </div>
                  <p className="text-[10px] text-teal-100 mt-1">10x Normal Saline 500ml, 25x Surgical Gloves</p>
                </button>

                <button
                  onClick={() => {
                    const sampleOrder = {
                      items: [
                        { productId: 'prod-6', productName: 'Metformin 500mg Tablets', packSize: 'Box of 100 Tablets', quantity: 15, unitPriceEtb: 310, batchNo: 'MET-2026-F6', expiryDate: '2028-11-30' },
                        { productId: 'prod-7', productName: 'Amlodipine 5mg Tablets', packSize: 'Box of 100 Tablets', quantity: 15, unitPriceEtb: 290, batchNo: 'AML-2026-G7', expiryDate: '2028-08-31' },
                      ]
                    };
                    handleReorder(sampleOrder);
                  }}
                  className="w-full text-left p-3 bg-teal-800/80 hover:bg-teal-800 border border-teal-700 rounded-xl transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between text-xs font-bold text-amber-300">
                    <span>❤️ Chronic Care (Cardio & Diabetes) Bundle</span>
                    <ArrowRight className="w-3.5 h-3.5 text-amber-400 group-hover:translate-x-1 transition-transform" />
                  </div>
                  <p className="text-[10px] text-teal-100 mt-1">15x Metformin 500mg, 15x Amlodipine 5mg</p>
                </button>
              </div>

              <button
                onClick={() => setCurrentPage('catalog')}
                className="w-full py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-xl text-xs cursor-pointer shadow-md transition-all flex items-center justify-center gap-2 mt-2"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Browse Full Wholesale Directory</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT 2: QUOTES */}
      {activeTab === 'quotes' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div>
              <h2 className="text-lg font-extrabold text-slate-900">Submitted Quotations & Custom RFQs</h2>
              <p className="text-xs text-slate-500">Review custom volume pricing and sales representative notes.</p>
            </div>

            <button
              onClick={() => setCurrentPage('catalog')}
              className="px-3 py-1.5 bg-teal-700 hover:bg-teal-800 text-white rounded-lg text-xs font-bold cursor-pointer"
            >
              Request New Quote
            </button>
          </div>

          {myQuotes.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center space-y-2">
              <FileText className="w-10 h-10 text-slate-400 mx-auto" />
              <h3 className="font-bold text-slate-800 text-sm">No Submitted Quotes Found</h3>
              <p className="text-xs text-slate-500">Add items to RFQ Cart to request custom volume wholesale quotes.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {myQuotes.map((q) => (
                <div key={q.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <span className="font-extrabold text-slate-900 text-sm">{q.quoteNumber}</span>
                    <span className="capitalize px-2.5 py-0.5 bg-amber-100 text-amber-900 font-extrabold text-xs rounded-full">
                      {q.status.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="text-xs text-slate-600 space-y-1">
                    <div>Facility: <span className="font-bold text-slate-800">{q.facilityName}</span></div>
                    <div>Destination: <span className="font-bold text-slate-800">{q.shippingCity}</span></div>
                    <div>Payment Terms: <span className="font-bold text-slate-800">{q.paymentTerms}</span></div>
                    <div>Submitted: <span className="font-mono text-slate-500">{new Date(q.createdAt).toLocaleDateString('en-GB')}</span></div>
                  </div>

                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 flex justify-between">
                    <span>Total Invoice Value:</span>
                    <span className="text-teal-800 font-extrabold">{q.totalEtb.toLocaleString()} ETB</span>
                  </div>

                  {q.salesRepNotes && (
                    <div className="bg-teal-50 border border-teal-200 p-2.5 rounded-xl text-xs text-teal-900 italic">
                      Sales Rep Note: "{q.salesRepNotes}"
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT 3: PROFILE & ACCOUNT STATUS */}
      {activeTab === 'profile' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 pb-4">
            <div>
              <h2 className="text-lg font-extrabold text-slate-900">B2B Business Profile & Verification Status</h2>
              <p className="text-xs text-slate-500">Official registered facility credentials and EFDA compliance verification details.</p>
            </div>

            <button
              onClick={() => openAuthModal('login')}
              className="px-3 py-1.5 border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold cursor-pointer"
            >
              Switch Account
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            {/* Left Box: Business Info */}
            <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 space-y-3">
              <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2 border-b border-slate-200 pb-2">
                <Building2 className="w-4 h-4 text-teal-700" />
                Facility & Contact Details
              </h3>

              <div className="space-y-2 text-slate-700">
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Facility / Trade Name:</span>
                  <span className="font-bold text-slate-900">{currentUser.facilityName}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Facility Type:</span>
                  <span className="font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded">{currentUser.facilityType}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Contact Person:</span>
                  <span className="font-semibold text-slate-900">{currentUser.name}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Account Email:</span>
                  <span className="font-mono text-slate-900">{currentUser.email}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Phone Number:</span>
                  <span className="font-mono text-slate-900">{currentUser.phone}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Location / City:</span>
                  <span className="font-semibold text-slate-900">{currentUser.city}, {currentUser.region || 'Ethiopia'}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Physical Address:</span>
                  <span className="font-semibold text-slate-900">{currentUser.businessAddress || 'Main Commercial District'}</span>
                </div>
              </div>
            </div>

            {/* Right Box: License & Compliance */}
            <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 space-y-3">
              <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2 border-b border-slate-200 pb-2">
                <FileBadge className="w-4 h-4 text-teal-700" />
                EFDA Regulatory Credentials
              </h3>

              <div className="space-y-2 text-slate-700">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Verification Status:</span>
                  <span className="font-extrabold px-2.5 py-0.5 rounded-full text-xs uppercase bg-teal-950 text-teal-300">
                    {status}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">EFDA License No:</span>
                  <span className="font-mono font-bold text-teal-900">{currentUser.efdaLicenseNo || 'Pending Submission'}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Ethiopian TIN Number:</span>
                  <span className="font-mono font-bold text-slate-900">{currentUser.tinNumber || 'Not Provided'}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">VAT Registered:</span>
                  <span className="font-semibold text-slate-900">{currentUser.vatRegistered ? 'Yes (15% VAT Applicable)' : 'No'}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Assigned Sales Rep:</span>
                  <span className="font-semibold text-teal-800">{currentUser.assignedSalesRep || 'Tewodros Bekele'}</span>
                </div>

                <div className="pt-3 border-t border-slate-200 flex justify-end">
                  <button
                    onClick={() => setIsVerificationModalOpen(true)}
                    className="px-3.5 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-lg font-bold text-xs cursor-pointer flex items-center gap-1.5"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>Upload Updated EFDA License</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

