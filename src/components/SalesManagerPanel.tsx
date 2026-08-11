import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Sparkles,
  Tag,
  Star,
  PlusCircle,
  PhoneCall,
  Clock,
  CheckCircle2,
  Users,
  MessageSquare,
  AlertTriangle,
  TrendingUp,
  Search,
  Building2,
  Filter,
  DollarSign,
  ChevronRight,
  ShoppingBag,
  Send,
  Calendar,
  Layers,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { LeadStatus } from '../types';

export const SalesManagerPanel: React.FC = () => {
  const {
    products,
    leads,
    promotions,
    callbacks,
    demandInsights,
    allUsers,
    orders,
    toggleProductFeatured,
    recordLeadNote,
    changeLeadStatus,
    showToast,
    submitCallbackRequest,
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'pipeline' | 'segments' | 'promotions' | 'featured' | 'callbacks' | 'demand'>('pipeline');

  // Lead CRM state
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(leads[0]?.id || null);
  const [newNoteText, setNewNoteText] = useState('');
  const [leadActionType, setLeadActionType] = useState('Call Follow-up');
  const [leadSegmentFilter, setLeadSegmentFilter] = useState<'all' | 'new' | 'verification_pending' | 'inactive' | 'high_value'>('all');

  // Promotion Form state
  const [showNewPromoModal, setShowNewPromoModal] = useState(false);
  const [promoTitle, setPromoTitle] = useState('');
  const [promoType, setPromoType] = useState<'promotional_product' | 'discount_campaign' | 'bulk_offer' | 'seasonal' | 'new_launch'>('discount_campaign');
  const [promoDiscountPct, setPromoDiscountPct] = useState(10);
  const [promoBannerText, setPromoBannerText] = useState('');
  const [promoTag, setPromoTag] = useState('');

  // Callback action state
  const [callbackFilter, setCallbackFilter] = useState<'PENDING' | 'ALL'>('PENDING');

  const selectedLead = leads.find((l) => l.id === selectedLeadId) || leads[0];

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLeadId || !newNoteText.trim()) return;

    const success = await recordLeadNote(selectedLeadId, newNoteText, leadActionType);
    if (success) {
      setNewNoteText('');
    }
  };

  const handleCreatePromo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoTitle.trim()) return;

    try {
      const res = await fetch('/api/promotions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: promoTitle,
          type: promoType,
          discountPercentage: Number(promoDiscountPct),
          bannerText: promoBannerText || `${promoDiscountPct}% Off Wholesale Volume Order`,
          promotionTag: promoTag || 'SPECIAL OFFER',
          applicableCategory: 'Pharmaceuticals',
          startDate: new Date().toISOString().split('T')[0],
          endDate: '2026-12-31',
        }),
      });
      if (res.ok) {
        showToast('Promotion Created', `Campaign "${promoTitle}" is now live on the catalog.`, 'success');
        setShowNewPromoModal(false);
        setPromoTitle('');
        setPromoBannerText('');
      }
    } catch (err) {
      showToast('Error', 'Failed to save promotion campaign.', 'error');
    }
  };

  // Filter leads based on segment
  const filteredLeads = leads.filter((l) => {
    if (leadSegmentFilter === 'new') return l.leadStatus === 'NEW';
    if (leadSegmentFilter === 'verification_pending') return l.leadStatus === 'CONTACTED' || l.leadStatus === 'QUALIFIED';
    if (leadSegmentFilter === 'inactive') return l.leadStatus === 'LOST' || l.notes?.some((n) => n.note.includes('inactive'));
    if (leadSegmentFilter === 'high_value') return (l.estimatedMonthlyVolumeEtb || 0) >= 200000;
    return true;
  });

  const pendingCallbacks = callbacks.filter((c) => c.status === 'PENDING');

  return (
    <div className="space-y-6">
      {/* Subtab Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 text-xs font-bold overflow-x-auto">
        <button
          onClick={() => setActiveSubTab('pipeline')}
          className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
            activeSubTab === 'pipeline'
              ? 'bg-teal-900 text-white shadow-xs'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          <Users className="w-3.5 h-3.5 text-teal-300" />
          <span>Lead CRM & Pipeline ({leads.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('segments')}
          className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
            activeSubTab === 'segments'
              ? 'bg-teal-900 text-white shadow-xs'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          <Building2 className="w-3.5 h-3.5 text-amber-300" />
          <span>Customer Follow-up Segments</span>
        </button>

        <button
          onClick={() => setActiveSubTab('callbacks')}
          className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
            activeSubTab === 'callbacks'
              ? 'bg-teal-900 text-white shadow-xs'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          <PhoneCall className="w-3.5 h-3.5 text-amber-400" />
          <span>Callback Requests</span>
          {pendingCallbacks.length > 0 && (
            <span className="bg-amber-400 text-slate-950 px-2 py-0.2 rounded-full text-[10px] font-black">
              {pendingCallbacks.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveSubTab('promotions')}
          className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
            activeSubTab === 'promotions'
              ? 'bg-teal-900 text-white shadow-xs'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          <Tag className="w-3.5 h-3.5 text-amber-300" />
          <span>Promotions & Campaigns ({promotions.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('featured')}
          className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
            activeSubTab === 'featured'
              ? 'bg-teal-900 text-white shadow-xs'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
          <span>Featured Strategic Products ({products.filter((p) => p.isFeatured).length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('demand')}
          className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
            activeSubTab === 'demand'
              ? 'bg-teal-900 text-white shadow-xs'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5 text-blue-300" />
          <span>Product Demand Intelligence</span>
        </button>
      </div>

      {/* 1. LEAD CRM & PIPELINE */}
      {activeSubTab === 'pipeline' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-xs">
          {/* Left: Lead List */}
          <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm">Customer Leads & Inquiries</h3>
                <p className="text-[11px] text-slate-500">Track registration, callbacks, and RFQ inquiries</p>
              </div>

              <select
                value={leadSegmentFilter}
                onChange={(e) => setLeadSegmentFilter(e.target.value as any)}
                className="bg-slate-50 border border-slate-300 rounded-lg p-1.5 text-[11px] font-bold text-slate-800"
              >
                <option value="all">All Pipeline ({leads.length})</option>
                <option value="new">NEW Leads Only</option>
                <option value="high_value">High Volume (&gt;200k ETB)</option>
              </select>
            </div>

            <div className="space-y-2 max-h-[550px] overflow-y-auto pr-1">
              {filteredLeads.map((ld) => {
                const isSelected = selectedLead?.id === ld.id;
                return (
                  <div
                    key={ld.id}
                    onClick={() => setSelectedLeadId(ld.id)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-teal-50/80 border-teal-600 shadow-xs'
                        : 'bg-slate-50/60 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-slate-900 text-xs">{ld.facilityName}</span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                          ld.leadStatus === 'NEW'
                            ? 'bg-blue-100 text-blue-800 border border-blue-200'
                            : ld.leadStatus === 'CONVERTED'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : ld.leadStatus === 'LOST'
                            ? 'bg-rose-100 text-rose-800 border border-rose-200'
                            : 'bg-amber-100 text-amber-900 border border-amber-200'
                        }`}
                      >
                        {ld.leadStatus}
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-600 mt-1 flex items-center justify-between">
                      <span>{ld.contactPerson} ({ld.facilityType})</span>
                      <span className="font-mono text-teal-800 font-bold">
                        {ld.estimatedMonthlyVolumeEtb ? `${(ld.estimatedMonthlyVolumeEtb / 1000).toFixed(0)}k ETB` : 'N/A'}
                      </span>
                    </div>

                    <div className="text-[10px] text-slate-500 mt-1 flex items-center justify-between">
                      <span>Source: <strong className="text-slate-700">{ld.source || 'Direct Registration'}</strong></span>
                      <span>City: <strong>{ld.city}</strong></span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: Lead Detail & Notes Log */}
          {selectedLead && (
            <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-5">
              <div className="flex items-start justify-between border-b border-slate-100 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-black text-slate-900">{selectedLead.facilityName}</h3>
                    <span className="text-[10px] font-extrabold bg-slate-100 border border-slate-200 text-slate-800 px-2 py-0.5 rounded uppercase">
                      {selectedLead.facilityType}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Contact: <strong>{selectedLead.contactPerson}</strong> • Phone: <a href={`tel:${selectedLead.phone}`} className="text-teal-800 underline font-bold">{selectedLead.phone}</a> • Email: {selectedLead.email || 'N/A'}
                  </p>
                </div>

                <div className="text-right space-y-1">
                  <div className="text-[10px] text-slate-500">Pipeline Stage</div>
                  <select
                    value={selectedLead.leadStatus}
                    onChange={(e) => changeLeadStatus(selectedLead.id, e.target.value as any)}
                    className="bg-teal-900 text-white font-extrabold text-xs px-3 py-1.5 rounded-xl cursor-pointer shadow-xs focus:outline-none"
                  >
                    <option value="NEW">NEW LEAD</option>
                    <option value="CONTACTED">CONTACTED</option>
                    <option value="QUALIFIED">QUALIFIED</option>
                    <option value="QUOTATION_SENT">QUOTATION SENT</option>
                    <option value="NEGOTIATION">NEGOTIATION</option>
                    <option value="CONVERTED">CONVERTED (CUSTOMER)</option>
                    <option value="LOST">LOST / INACTIVE</option>
                  </select>
                </div>
              </div>

              {/* Lead Metrics */}
              <div className="grid grid-cols-3 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200 text-slate-800">
                <div>
                  <div className="text-[10px] text-slate-500 font-bold">Estimated Monthly Volume</div>
                  <div className="font-extrabold text-sm text-teal-900">
                    {selectedLead.estimatedMonthlyVolumeEtb?.toLocaleString() || '150,000'} ETB
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500 font-bold">Interested Category</div>
                  <div className="font-extrabold text-sm text-slate-900">{selectedLead.interestedCategory || 'General Pharmaceuticals'}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500 font-bold">EFDA Verification</div>
                  <div className="font-bold text-xs text-emerald-700 flex items-center gap-1 mt-0.5">
                    <ShieldCheck className="w-3.5 h-3.5" /> License Checked
                  </div>
                </div>
              </div>

              {/* Sales Notes & Interaction History Log */}
              <div className="space-y-3">
                <h4 className="font-extrabold text-slate-900 text-xs flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4 text-teal-800" /> Sales Follow-up & Interaction History Log
                </h4>

                <div className="bg-slate-50/80 border border-slate-200 rounded-xl p-3 max-h-48 overflow-y-auto space-y-2">
                  {selectedLead.notes && selectedLead.notes.length > 0 ? (
                    selectedLead.notes.map((n, idx) => (
                      <div key={idx} className="bg-white p-2.5 rounded-lg border border-slate-200 space-y-1">
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="font-bold text-teal-900">{n.author} ({n.actionType || 'Call Note'})</span>
                          <span className="text-slate-400 font-mono">{n.createdAt?.split('T')[0] || 'Today'}</span>
                        </div>
                        <p className="text-slate-800 text-[11px] leading-snug">{n.note}</p>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4 text-slate-400 italic text-[11px]">
                      No notes recorded yet for this facility. Record initial call below.
                    </div>
                  )}
                </div>

                {/* Add New Note Form */}
                <form onSubmit={handleAddNote} className="space-y-2 pt-2 border-t border-slate-100">
                  <div className="flex gap-2">
                    <select
                      value={leadActionType}
                      onChange={(e) => setLeadActionType(e.target.value)}
                      className="bg-slate-100 border border-slate-300 rounded-lg px-2 text-[11px] font-bold text-slate-800"
                    >
                      <option value="Call Follow-up">Phone Call</option>
                      <option value="Email Sent">Email Quote</option>
                      <option value="Facility Visit">In-Person Visit</option>
                      <option value="Discount Offer">Special Discount Offer</option>
                    </select>

                    <input
                      type="text"
                      required
                      placeholder="Type sales follow-up notes, facility needs, or pricing discussed..."
                      value={newNoteText}
                      onChange={(e) => setNewNoteText(e.target.value)}
                      className="flex-1 bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 focus:bg-white focus:border-teal-800 focus:outline-none"
                    />

                    <button
                      type="submit"
                      className="bg-teal-900 hover:bg-teal-800 text-white font-bold text-xs px-4 py-2.5 rounded-xl cursor-pointer transition-all shadow-xs flex items-center gap-1"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Log Note</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 2. CUSTOMER SEGMENTS */}
      {activeSubTab === 'segments' && (
        <div className="space-y-6 text-xs">
          <div className="bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="text-base font-extrabold">Strategic B2B Customer Segment Analysis</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Target high-value hospitals, re-engage inactive purchasers, and resolve pending verifications.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* New Customers */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-teal-700" /> New Customer Accounts
                </span>
                <span className="bg-teal-100 text-teal-800 font-bold px-2 py-0.5 rounded-full text-[10px]">
                  {allUsers.filter((u) => u.verificationStatus === 'APPROVED').length}
                </span>
              </div>
              <p className="text-slate-600 text-[11px]">Approved facilities ready for initial wholesale order onboarding.</p>
              <div className="space-y-2">
                {allUsers
                  .filter((u) => u.verificationStatus === 'APPROVED' && u.role !== 'public')
                  .slice(0, 3)
                  .map((u) => (
                    <div key={u.id} className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                      <div>
                        <div className="font-bold text-slate-900">{u.facilityName}</div>
                        <div className="text-[10px] text-slate-500">{u.city} • {u.facilityType}</div>
                      </div>
                      <button
                        onClick={() => showToast('Follow-up Initiated', `Opening communication with ${u.facilityName}`, 'info')}
                        className="px-2 py-1 bg-teal-900 text-white text-[10px] font-bold rounded cursor-pointer"
                      >
                        Contact
                      </button>
                    </div>
                  ))}
              </div>
            </div>

            {/* High-Value Customers */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5">
                  <DollarSign className="w-4 h-4 text-amber-600" /> High-Value Hospitals
                </span>
                <span className="bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded-full text-[10px]">
                  VIP Accounts
                </span>
              </div>
              <p className="text-slate-600 text-[11px]">Accounts ordering &gt;150,000 ETB per quarter with priority cold-chain allocation.</p>
              <div className="space-y-2">
                {allUsers
                  .filter((u) => u.creditLimitEtb && u.creditLimitEtb >= 500000)
                  .map((u) => (
                    <div key={u.id} className="p-2.5 bg-amber-50/60 rounded-xl border border-amber-200 flex items-center justify-between">
                      <div>
                        <div className="font-bold text-slate-900">{u.facilityName}</div>
                        <div className="text-[10px] text-amber-900 font-semibold">Credit Limit: {u.creditLimitEtb?.toLocaleString()} ETB</div>
                      </div>
                      <span className="text-[10px] font-extrabold bg-amber-200 text-amber-900 px-2 py-0.5 rounded">
                        VIP Tier
                      </span>
                    </div>
                  ))}
              </div>
            </div>

            {/* Inactive or Reorder Candidates */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-rose-600" /> Reorder Follow-Up Due
                </span>
                <span className="bg-rose-100 text-rose-800 font-bold px-2 py-0.5 rounded-full text-[10px]">
                  Active Reorder
                </span>
              </div>
              <p className="text-slate-600 text-[11px]">Facilities that ordered over 20 days ago and likely require restocking.</p>
              <div className="space-y-2">
                {orders.slice(0, 3).map((ord) => (
                  <div key={ord.id} className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-900">{ord.facilityName}</div>
                      <div className="text-[10px] text-slate-500">Last Order: #{ord.orderNumber} ({ord.items.length} items)</div>
                    </div>
                    <button
                      onClick={() => showToast('Reorder Offer Sent', `Sent automated restock invitation to ${ord.facilityName}`, 'success')}
                      className="px-2 py-1 bg-amber-600 text-white text-[10px] font-bold rounded cursor-pointer"
                    >
                      Send Restock Offer
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. CALLBACK REQUESTS QUEUE */}
      {activeSubTab === 'callbacks' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4 text-xs">
          <div className="flex items-center justify-between border-b border-slate-200 pb-4">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <PhoneCall className="w-5 h-5 text-amber-600" /> Wholesale Callback Requests Queue
              </h3>
              <p className="text-xs text-slate-500">
                Direct phone inquiries submitted by health facility directors requiring wholesale representative response.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setCallbackFilter('PENDING')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  callbackFilter === 'PENDING' ? 'bg-amber-900 text-white' : 'bg-slate-100 text-slate-700'
                }`}
              >
                Pending ({callbacks.filter((c) => c.status === 'PENDING').length})
              </button>
              <button
                onClick={() => setCallbackFilter('ALL')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  callbackFilter === 'ALL' ? 'bg-amber-900 text-white' : 'bg-slate-100 text-slate-700'
                }`}
              >
                All Records ({callbacks.length})
              </button>
            </div>
          </div>

          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-slate-100 text-slate-700 font-bold uppercase">
                <tr>
                  <th className="p-3">Facility / Business</th>
                  <th className="p-3">Contact Person & Phone</th>
                  <th className="p-3">Preferred Time Slot</th>
                  <th className="p-3">Inquiry Details</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800">
                {callbacks
                  .filter((c) => (callbackFilter === 'PENDING' ? c.status === 'PENDING' : true))
                  .map((cb) => (
                    <tr key={cb.id} className="hover:bg-slate-50">
                      <td className="p-3 font-bold text-slate-900">
                        {cb.facilityName}
                        <div className="text-[10px] text-teal-800 font-semibold">{cb.facilityType || 'Pharmacy'}</div>
                      </td>
                      <td className="p-3">
                        <div className="font-bold text-slate-900">{cb.contactPerson}</div>
                        <a href={`tel:${cb.phone}`} className="text-teal-800 font-mono font-bold hover:underline">
                          {cb.phone}
                        </a>
                      </td>
                      <td className="p-3 font-semibold text-amber-900 bg-amber-50/50 rounded p-1">
                        {cb.preferredTime || 'Anytime'}
                      </td>
                      <td className="p-3 text-slate-600 max-w-xs truncate">{cb.notes || 'Inquiring about bulk discount pricing'}</td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                            cb.status === 'PENDING'
                              ? 'bg-amber-100 text-amber-900 border border-amber-300'
                              : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          }`}
                        >
                          {cb.status}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <a
                          href={`tel:${cb.phone}`}
                          onClick={async () => {
                            await fetch(`/api/callbacks/${cb.id}`, {
                              method: 'PATCH',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ status: 'CONTACTED' }),
                            });
                            showToast('Callback Marked as Contacted', `Logged call to ${cb.contactPerson}`, 'success');
                          }}
                          className="px-3 py-1.5 bg-teal-900 text-white rounded-lg font-bold text-[11px] inline-flex items-center gap-1 hover:bg-teal-800"
                        >
                          <PhoneCall className="w-3.5 h-3.5 text-amber-300" />
                          <span>Call & Resolve</span>
                        </a>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. PROMOTIONS & CAMPAIGNS */}
      {activeSubTab === 'promotions' && (
        <div className="space-y-6 text-xs">
          <div className="flex items-center justify-between bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Active B2B Promotional Campaigns</h3>
              <p className="text-xs text-slate-500">
                Manage promotional products, volume discount campaigns, bulk offers, and new product launches.
              </p>
            </div>

            <button
              onClick={() => setShowNewPromoModal(true)}
              className="px-4 py-2.5 bg-teal-900 hover:bg-teal-800 text-white font-bold rounded-xl flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <PlusCircle className="w-4 h-4 text-amber-300" />
              <span>Create New Campaign</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {promotions.map((p) => (
              <div key={p.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-extrabold bg-amber-100 text-amber-900 px-2 py-0.5 rounded uppercase">
                      {p.type.replace('_', ' ')}
                    </span>
                    <h4 className="font-black text-slate-900 text-sm mt-1">{p.title}</h4>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-black text-teal-800">{p.discountPercentage}% OFF</span>
                  </div>
                </div>

                <div className="bg-teal-50/80 border border-teal-200 p-2.5 rounded-xl text-teal-950 font-bold text-[11px]">
                  "{p.bannerText}"
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-100 pt-2">
                  <span>Category: <strong className="text-slate-800">{p.applicableCategory || 'All'}</strong></span>
                  <span>Valid Until: <strong>{p.endDate}</strong></span>
                </div>
              </div>
            ))}
          </div>

          {showNewPromoModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
              <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in zoom-in duration-150">
                <div className="flex items-center justify-between border-b pb-3">
                  <h3 className="font-extrabold text-slate-900 text-base">Create Wholesale Promotion</h3>
                  <button onClick={() => setShowNewPromoModal(false)} className="text-slate-400 font-bold">X</button>
                </div>

                <form onSubmit={handleCreatePromo} className="space-y-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Campaign Title</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Q3 Antibiotics Bulk Special"
                      value={promoTitle}
                      onChange={(e) => setPromoTitle(e.target.value)}
                      className="w-full bg-slate-50 border p-2 rounded-xl text-xs"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Promotion Type</label>
                      <select
                        value={promoType}
                        onChange={(e) => setPromoType(e.target.value as any)}
                        className="w-full bg-slate-50 border p-2 rounded-xl text-xs font-semibold"
                      >
                        <option value="discount_campaign">Discount Campaign</option>
                        <option value="bulk_offer">Bulk Purchase Offer</option>
                        <option value="seasonal">Seasonal Offer</option>
                        <option value="new_launch">New Product Launch</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Discount %</label>
                      <input
                        type="number"
                        min={1}
                        max={50}
                        value={promoDiscountPct}
                        onChange={(e) => setPromoDiscountPct(Number(e.target.value))}
                        className="w-full bg-slate-50 border p-2 rounded-xl text-xs font-bold text-teal-800"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Banner Announcement Text</label>
                    <input
                      type="text"
                      placeholder="e.g. Save 12% on orders of 500+ packs"
                      value={promoBannerText}
                      onChange={(e) => setPromoBannerText(e.target.value)}
                      className="w-full bg-slate-50 border p-2 rounded-xl text-xs"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowNewPromoModal(false)}
                      className="px-3 py-2 font-bold text-slate-600"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 bg-teal-900 text-white font-bold rounded-xl"
                    >
                      Publish Campaign
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 5. FEATURED STRATEGIC PRODUCTS */}
      {activeSubTab === 'featured' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4 text-xs">
          <div className="flex items-center justify-between border-b border-slate-200 pb-4">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Star className="w-5 h-5 text-amber-500 fill-amber-500" /> Strategic Featured Products
              </h3>
              <p className="text-xs text-slate-500">
                Highlight priority essential medicines, WHO cold-chain vaccines, and high-margin bulk items at the top of the wholesale catalog.
              </p>
            </div>
          </div>

          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-slate-100 text-slate-700 font-bold uppercase">
                <tr>
                  <th className="p-3">Product Name</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Unit Price ETB</th>
                  <th className="p-3">Featured Badge Tag</th>
                  <th className="p-3 text-right">Feature Status Toggle</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50">
                    <td className="p-3 font-bold text-slate-900">{p.name}</td>
                    <td className="p-3 text-slate-600">{p.category}</td>
                    <td className="p-3 font-mono font-bold text-teal-800">{p.unitPriceEtb.toLocaleString()} ETB</td>
                    <td className="p-3">
                      <span className="bg-amber-50 text-amber-900 border border-amber-200 font-bold px-2 py-0.5 rounded text-[10px]">
                        {p.promotionTag || (p.isFeatured ? 'STRATEGIC FEATURED' : 'STANDARD')}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => toggleProductFeatured(p.id, !p.isFeatured, 'NATIONAL PRIORITY')}
                        className={`px-3 py-1.5 rounded-lg font-bold text-[11px] cursor-pointer transition-all ${
                          p.isFeatured
                            ? 'bg-amber-400 text-slate-950 hover:bg-amber-500'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        {p.isFeatured ? 'Featured (Active)' : 'Set as Featured'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 6. DEMAND INTELLIGENCE */}
      {activeSubTab === 'demand' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4 text-xs">
          <div className="flex items-center justify-between border-b border-slate-200 pb-4">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-600" /> Ethiopian Healthcare Demand Intelligence
              </h3>
              <p className="text-xs text-slate-500">
                Real-time tracking of search keywords, stock availability gaps, and quote volume trends across regions.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {demandInsights.map((di, idx) => (
              <div key={idx} className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-black text-slate-900 text-sm">{di.searchTerm}</span>
                  <span className="bg-blue-100 text-blue-800 font-extrabold px-2 py-0.5 rounded text-[10px]">
                    {di.searchCount} Searches
                  </span>
                </div>

                <div className="text-[11px] text-slate-600">
                  Estimated Revenue Potential: <strong className="text-teal-800 font-mono">{(di.estimatedDemandValueEtb / 1000).toFixed(0)}k ETB</strong>
                </div>

                <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                  <span className={`font-bold text-[10px] ${di.inStockStatus ? 'text-emerald-700' : 'text-rose-700'}`}>
                    {di.inStockStatus ? 'IN STOCK' : 'CRITICAL STOCK GAP'}
                  </span>
                  <button
                    onClick={() => showToast('Procurement Alert Triggered', `Central purchasing notified for ${di.searchTerm}`, 'info')}
                    className="text-[10px] text-teal-800 font-extrabold underline"
                  >
                    Notify Procurement
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
