import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { PhoneCall, X, Building2, User, Phone, Mail, Clock, MessageSquare, ShieldCheck, CheckCircle2 } from 'lucide-react';

export const CallbackRequestModal: React.FC = () => {
  const { isCallbackModalOpen, setIsCallbackModalOpen, submitCallbackRequest, currentUser } = useApp();

  const [facilityName, setFacilityName] = useState(currentUser.facilityName || '');
  const [contactPerson, setContactPerson] = useState(currentUser.name || '');
  const [phone, setPhone] = useState(currentUser.phone || '');
  const [email, setEmail] = useState(currentUser.email || '');
  const [facilityType, setFacilityType] = useState(currentUser.facilityType || 'Pharmacy');
  const [preferredTime, setPreferredTime] = useState('Morning (9:00 AM - 12:00 PM)');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  if (!isCallbackModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!facilityName.trim() || !contactPerson.trim() || !phone.trim()) return;

    setIsSubmitting(true);
    const success = await submitCallbackRequest({
      facilityName,
      contactPerson,
      phone,
      email,
      facilityType,
      preferredTime,
      notes,
    });
    setIsSubmitting(false);

    if (success) {
      setSubmittedSuccess(true);
      setTimeout(() => {
        setSubmittedSuccess(false);
      }, 3000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative animate-in fade-in zoom-in duration-200">
        <button
          onClick={() => setIsCallbackModalOpen(false)}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {submittedSuccess ? (
          <div className="text-center py-8 space-y-4">
            <div className="w-16 h-16 bg-teal-100 text-teal-800 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900">Callback Request Received!</h2>
            <p className="text-sm text-slate-600 max-w-sm mx-auto">
              Thank you, <strong>{contactPerson}</strong>. A Melala Wholesale Account Specialist will contact{' '}
              <strong>{facilityName}</strong> at <strong>{phone}</strong> during {preferredTime.toLowerCase()}.
            </p>
            <button
              onClick={() => setIsCallbackModalOpen(false)}
              className="mt-4 bg-teal-900 hover:bg-teal-800 text-white font-bold text-sm px-6 py-2.5 rounded-xl transition-all cursor-pointer shadow-xs"
            >
              Return to Wholesale Catalog
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="p-3 bg-teal-50 text-teal-900 rounded-2xl border border-teal-200">
                <PhoneCall className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-extrabold text-slate-900">Request Wholesale Call</h2>
                <p className="text-xs text-slate-500">
                  Connect directly with a Melala Wholesale Advisor for volume pricing & credit terms.
                </p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-teal-800" /> Facility / Business Name *
                </label>
                <input
                  type="text"
                  required
                  value={facilityName}
                  onChange={(e) => setFacilityName(e.target.value)}
                  placeholder="e.g., Lion Pharmacy or St. Gabriel Hospital"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-medium focus:bg-white focus:border-teal-800 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-teal-800" /> Contact Person *
                  </label>
                  <input
                    type="text"
                    required
                    value={contactPerson}
                    onChange={(e) => setContactPerson(e.target.value)}
                    placeholder="Pharmacist or Purchaser Name"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-medium focus:bg-white focus:border-teal-800 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-teal-800" /> Telephone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+251 911 000 000"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-medium focus:bg-white focus:border-teal-800 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-teal-800" /> Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="info@facility.et"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-medium focus:bg-white focus:border-teal-800 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Facility Category</label>
                  <select
                    value={facilityType}
                    onChange={(e) => setFacilityType(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-bold focus:bg-white focus:border-teal-800 focus:outline-none cursor-pointer"
                  >
                    <option value="Pharmacy">Retail Pharmacy</option>
                    <option value="Drug Store">Drug Store</option>
                    <option value="Clinic">Medical Clinic</option>
                    <option value="Hospital">Hospital / Medical Center</option>
                    <option value="Healthcare Org">NGO / Healthcare Org</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-teal-800" /> Preferred Call Time Slot
                </label>
                <select
                  value={preferredTime}
                  onChange={(e) => setPreferredTime(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-medium focus:bg-white focus:border-teal-800 focus:outline-none cursor-pointer"
                >
                  <option value="Morning (9:00 AM - 12:00 PM)">Morning (9:00 AM - 12:00 PM)</option>
                  <option value="Afternoon (2:00 PM - 5:00 PM)">Afternoon (2:00 PM - 5:00 PM)</option>
                  <option value="Evening (5:00 PM - 7:00 PM)">Evening (5:00 PM - 7:00 PM)</option>
                  <option value="Urgent - Within 1 Hour">Urgent - Contact Me Within 1 Hour</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-teal-800" /> Specific Products or Wholesale Requirements
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Inquiring about bulk discount on IV Saline solutions and 30-day credit terms..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-medium focus:bg-white focus:border-teal-800 focus:outline-none"
                />
              </div>
            </div>

            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2 text-[11px] text-amber-900">
              <ShieldCheck className="w-4 h-4 text-amber-800 shrink-0 mt-0.5" />
              <span>
                <strong>EFDA Privacy & Compliance:</strong> Melala respects your business privacy. Callback requests are assigned exclusively to certified wholesale advisors to provide genuine pricing and supply support.
              </span>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsCallbackModalOpen(false)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-teal-900 hover:bg-teal-800 text-white font-bold text-xs px-6 py-2.5 rounded-xl transition-all cursor-pointer shadow-md flex items-center gap-2"
              >
                <PhoneCall className="w-4 h-4" />
                <span>{isSubmitting ? 'Dispatching...' : 'Request Direct Callback'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
