import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { requestAiDemandInsights } from '../services/api';
import { SalesManagerPanel } from '../components/SalesManagerPanel';
import {
  Briefcase,
  Users,
  Sparkles,
  FileCheck,
  CheckCircle,
  PhoneCall,
  Clock,
  Send,
  Building,
  TrendingUp,
  AlertCircle,
  Search,
} from 'lucide-react';

export const SalesRepDashboardPage: React.FC = () => {
  const { leads, quotations, updateLeadStatus, updateQuoteStatus, showToast } = useApp();

  const [aiProductFilter, setAiProductFilter] = useState('Amoxicillin Trihydrate 500mg');
  const [aiRegionFilter, setAiRegionFilter] = useState('Hawassa');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiInsights, setAiInsights] = useState<any | null>(null);

  const [notesInput, setNotesInput] = useState<{ [quoteId: string]: string }>({});

  const handleRunAiInsights = async () => {
    setAiLoading(true);
    const res = await requestAiDemandInsights(aiProductFilter, aiRegionFilter);
    setAiLoading(false);
    if (res) {
      setAiInsights(res);
      showToast('AI Sales & Demand Analysis Complete!', 'Gemini generated region demand forecasts and pitch strategies.', 'success');
    }
  };

  const handleApproveQuote = async (quoteId: string) => {
    const note = notesInput[quoteId] || 'Approved with 5% volume discount';
    await updateQuoteStatus(quoteId, 'SENT', note);
    showToast('Quotation Approved & Sent!', 'Quotation updated and client notified with formal Pro-Forma terms.', 'success');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Header Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-teal-950 border border-teal-800 rounded-full text-teal-400 text-xs font-semibold mb-2">
            <Briefcase className="w-4 h-4" /> Sales Rep Account Manager Console
          </div>
          <h1 className="text-2xl font-extrabold text-white">B2B Lead Pipeline & Sales Operations</h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage hospital quote requests, follow up with medical directors, and drive wholesale reorder volume.
          </p>
        </div>

        <div className="flex items-center gap-3 bg-slate-800 p-3 rounded-xl border border-slate-700 text-xs">
          <div>
            <div className="text-slate-400 text-[10px]">Active Pipeline Value:</div>
            <div className="text-lg font-extrabold text-amber-400">4,250,000 ETB</div>
          </div>
        </div>
      </div>

      {/* Gemini AI Sales Pitch & Demand Forecaster */}
      <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-teal-500/10 border border-amber-300 rounded-2xl p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-amber-200/60 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-amber-400 text-slate-950 rounded-lg shadow-xs font-bold">
              <Sparkles className="w-5 h-5 animate-spin" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">Gemini AI Sales Representative & Demand Assistant</h3>
              <p className="text-xs text-slate-600">Get AI-generated pitch points, regional hospital demand alerts, and reorder triggers.</p>
            </div>
          </div>

          <button
            onClick={handleRunAiInsights}
            disabled={aiLoading}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs rounded-xl cursor-pointer shadow-md transition-all flex items-center gap-1.5 disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4" />
            <span>{aiLoading ? 'Generating Insights...' : 'Run Demand AI Insights'}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Target Product Line</label>
            <input
              type="text"
              value={aiProductFilter}
              onChange={(e) => setAiProductFilter(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Target Ethiopian Region / Hub</label>
            <select
              value={aiRegionFilter}
              onChange={(e) => setAiRegionFilter(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs font-medium"
            >
              <option value="Hawassa">Hawassa Regional Care Hub</option>
              <option value="Addis Ababa">Addis Ababa Central District</option>
              <option value="Adama">Adama Industrial & Logistics Hub</option>
              <option value="Bahir Dar">Bahir Dar Medical Center</option>
              <option value="Mekelle">Mekelle Distribution Zone</option>
            </select>
          </div>
        </div>

        {aiInsights && (
          <div className="bg-white border border-amber-200 rounded-xl p-4 text-xs text-slate-800 space-y-3 animate-in fade-in duration-300">
            <div className="font-bold text-amber-900 text-sm flex items-center gap-1.5 border-b border-slate-100 pb-2">
              <TrendingUp className="w-4 h-4 text-amber-600" />
              <span>Demand Forecast: {aiInsights.demandTrend}</span>
            </div>

            <p className="text-slate-700 leading-relaxed">{aiInsights.insights}</p>

            <div className="bg-teal-50 border border-teal-200 p-3 rounded-lg text-teal-950 space-y-1">
              <div className="font-bold text-teal-900">Recommended Pitch Strategy for Sales Reps:</div>
              <p className="text-[11px] text-teal-900/90">{aiInsights.recommendedPitch}</p>
            </div>
          </div>
        )}
      </div>

      {/* Comprehensive Sales & CRM Management Hub */}
      <SalesManagerPanel />

      {/* Main Grid: Quotes awaiting approval */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Quotes awaiting approval */}
        <div className="lg:col-span-7 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div>
              <h2 className="text-lg font-extrabold text-slate-900">Quotation Requests Awaiting Sales Action</h2>
              <p className="text-xs text-slate-500">Review requested volumes and approve special tier discounts.</p>
            </div>
            <span className="text-xs font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full">
              {quotations.filter((q) => q.status === 'pending').length} Pending
            </span>
          </div>

          <div className="space-y-4">
            {quotations.map((q) => (
              <div
                key={q.id}
                className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3 text-xs"
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <div>
                    <span className="font-bold text-slate-900 text-sm">{q.quoteNumber}</span>
                    <span className="text-[11px] text-slate-500 ml-2">({q.facilityName})</span>
                  </div>
                  <span className="font-mono font-bold text-teal-800 text-xs">{q.totalEtb.toLocaleString()} ETB</span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600">
                  <div>Contact: <strong>{q.customerName}</strong></div>
                  <div>Phone: <strong>{q.contactPhone || 'N/A'}</strong></div>
                  <div>Destination: <strong>{q.shippingCity}</strong></div>
                  <div>Payment Terms: <strong>{q.paymentTerms}</strong></div>
                </div>

                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 space-y-1">
                  <div className="font-semibold text-slate-700">Requested Items ({q.items.length}):</div>
                  <div className="divide-y divide-slate-200 text-[11px]">
                    {q.items.map((it, idx) => (
                      <div key={idx} className="py-1 flex justify-between">
                        <span>{it.productName} ({it.packSize})</span>
                        <span className="font-bold">{it.requestedQty || (it as any).quantity} packs</span>
                      </div>
                    ))}
                  </div>
                </div>

                {['REQUESTED', 'UNDER_REVIEW', 'submitted', 'pending'].includes(q.status) ? (
                  <div className="space-y-2 pt-1">
                    <input
                      type="text"
                      placeholder="Add custom sales discount notes..."
                      value={notesInput[q.id] || ''}
                      onChange={(e) => setNotesInput({ ...notesInput, [q.id]: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs"
                    />

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleApproveQuote(q.id)}
                        className="flex-1 py-2 bg-teal-700 hover:bg-teal-800 text-white font-bold rounded-lg cursor-pointer transition-all flex items-center justify-center gap-1"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Approve Quote & Issue Pro-Forma</span>
                      </button>

                      <button
                        onClick={() => updateQuoteStatus(q.id, 'REJECTED', 'Order size below minimum wholesale threshold')}
                        className="px-3 py-2 border border-rose-300 text-rose-700 hover:bg-rose-50 rounded-lg font-bold cursor-pointer"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-[11px] font-bold text-emerald-700 bg-emerald-50 p-2 rounded-lg border border-emerald-200 flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Quote Status: {q.status.toUpperCase()}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Leads Pipeline */}
        <div className="lg:col-span-5 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <h2 className="text-lg font-extrabold text-slate-900">Healthcare Leads ({leads.length})</h2>
            <Users className="w-4 h-4 text-teal-700" />
          </div>

          <div className="space-y-3">
            {leads.map((ld) => (
              <div
                key={ld.id}
                className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-slate-900 text-sm">{ld.facilityName}</span>
                  <span className="text-[10px] font-bold bg-slate-100 text-slate-800 px-2 py-0.5 rounded uppercase">
                    {ld.facilityType}
                  </span>
                </div>

                <div className="text-slate-600 text-[11px]">
                  City: <strong>{ld.city}</strong> • Representative: <strong>{ld.contactPerson}</strong>
                </div>

                <div className="text-slate-500 italic text-[11px] bg-slate-50 p-2 rounded border border-slate-100">
                  Interested Line: {ld.interestedCategory} (Est Vol: {ld.estimatedMonthlyVolumeEtb?.toLocaleString()} ETB)
                </div>

                <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                  <select
                    value={ld.status}
                    onChange={(e) => updateLeadStatus(ld.id, e.target.value as any)}
                    className="bg-slate-50 border border-slate-300 rounded-lg p-1.5 font-semibold text-xs text-slate-800"
                  >
                    <option value="new">New Lead</option>
                    <option value="contacted">Contacted</option>
                    <option value="quote_sent">Quote Sent</option>
                    <option value="closed_won">Closed Won</option>
                    <option value="closed_lost">Closed Lost</option>
                  </select>

                  <a
                    href={`tel:${ld.phone}`}
                    className="p-1.5 bg-teal-50 text-teal-800 hover:bg-teal-100 rounded-lg font-semibold flex items-center gap-1"
                  >
                    <PhoneCall className="w-3.5 h-3.5 text-teal-700" />
                    <span>Call Lead</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
