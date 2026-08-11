import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { submitVerification } from '../services/api';
import { X, ShieldCheck, Upload, CheckCircle, FileText, Building, Award } from 'lucide-react';

export const EfdaVerificationModal: React.FC = () => {
  const { isVerificationModalOpen, setIsVerificationModalOpen, currentUser, showToast, refreshData } = useApp();

  const [facilityName, setFacilityName] = useState(currentUser.facilityName || '');
  const [facilityType, setFacilityType] = useState<'Pharmacy' | 'Drug Store' | 'Clinic' | 'Hospital' | 'Healthcare Org'>('Hospital');
  const [efdaLicenseNo, setEfdaLicenseNo] = useState(currentUser.efdaLicenseNo || 'EFDA/HOS/AA/2024/0912');
  const [tinNumber, setTinNumber] = useState(currentUser.tinNumber || '0039281745');
  const [pharmacistName, setPharmacistName] = useState('Dr. Meron Assefa (Pharmacist in Charge)');
  const [uploadedFileName, setUploadedFileName] = useState<string | null>('EFDA_Facility_License_2026.pdf');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isVerificationModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const res = await submitVerification(currentUser.id, efdaLicenseNo, tinNumber);
    setIsSubmitting(false);

    if (res) {
      showToast(
        'EFDA Facility Verification Submitted!',
        'License verification submitted to Melala Regulatory Operations. Account elevated to Verified Customer.',
        'success'
      );
      setIsVerificationModalOpen(false);
      refreshData();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-slate-900 text-white p-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-teal-400" />
            <div>
              <h3 className="font-bold text-sm">EFDA Healthcare Facility Verification</h3>
              <p className="text-[11px] text-slate-400">Unlock Tiered Wholesale Prices & Credit Lines</p>
            </div>
          </div>

          <button
            onClick={() => setIsVerificationModalOpen(false)}
            className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div className="bg-teal-50 border border-teal-200 rounded-xl p-3 text-teal-900 flex items-start gap-2.5">
            <Award className="w-5 h-5 text-teal-700 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <h4 className="font-bold">Ethiopian Regulatory Compliance Requirement</h4>
              <p className="text-[11px] text-teal-800">
                In accordance with Ethiopian Food & Drug Authority (EFDA) directives, wholesale pharmaceutical sales require valid facility license verification.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Facility Trade Name</label>
              <input
                type="text"
                required
                value={facilityName}
                onChange={(e) => setFacilityName(e.target.value)}
                className="w-full border border-slate-300 rounded-lg p-2.5 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-teal-600 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Facility Category</label>
                <select
                  value={facilityType}
                  onChange={(e) => setFacilityType(e.target.value as any)}
                  className="w-full border border-slate-300 rounded-lg p-2.5 bg-slate-50 font-medium"
                >
                  <option value="Hospital">Hospital / Specialty Care</option>
                  <option value="Clinic">Clinic / Health Center</option>
                  <option value="Pharmacy">Community Pharmacy</option>
                  <option value="Drug Store">Drug Store</option>
                  <option value="Healthcare Org">Healthcare Org / NGO</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Ethiopian TIN Number</label>
                <input
                  type="text"
                  required
                  value={tinNumber}
                  onChange={(e) => setTinNumber(e.target.value)}
                  placeholder="e.g. 0039281745"
                  className="w-full border border-slate-300 rounded-lg p-2.5 bg-slate-50 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">EFDA License Registration Number</label>
              <input
                type="text"
                required
                value={efdaLicenseNo}
                onChange={(e) => setEfdaLicenseNo(e.target.value)}
                placeholder="e.g. EFDA/HOS/AA/2024/0912"
                className="w-full border border-slate-300 rounded-lg p-2.5 bg-slate-50 font-mono font-bold text-teal-900"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Licensed Pharmacist in Charge</label>
              <input
                type="text"
                required
                value={pharmacistName}
                onChange={(e) => setPharmacistName(e.target.value)}
                className="w-full border border-slate-300 rounded-lg p-2.5 bg-slate-50"
              />
            </div>

            {/* Simulated Document Drag & Drop */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Upload EFDA License Certificate Copy</label>
              <div className="border-2 border-dashed border-slate-300 hover:border-teal-600 rounded-xl p-4 text-center bg-slate-50 hover:bg-teal-50/40 transition-all cursor-pointer">
                <Upload className="w-6 h-6 text-slate-400 mx-auto mb-1" />
                <p className="font-semibold text-slate-700">Click or Drag EFDA License PDF / Image</p>
                <p className="text-[10px] text-slate-400 mt-0.5">PDF, PNG, JPG up to 10MB</p>

                {uploadedFileName && (
                  <div className="mt-2 text-[11px] font-semibold text-teal-800 bg-white border border-teal-200 py-1 px-2.5 rounded-md inline-flex items-center gap-1.5 shadow-2xs">
                    <FileText className="w-3.5 h-3.5 text-teal-600" />
                    <span>{uploadedFileName}</span>
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600 ml-1" />
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsVerificationModalOpen(false)}
              className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg font-semibold hover:bg-slate-100 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-lg font-semibold shadow-sm cursor-pointer transition-all flex items-center gap-1.5"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{isSubmitting ? 'Verifying...' : 'Submit Verification'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
