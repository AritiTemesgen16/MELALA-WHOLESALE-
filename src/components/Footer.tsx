import React from 'react';
import { ShieldCheck, MapPin, Phone, Mail, FileText, Truck, Clock, Award } from 'lucide-react';
import { MelalaLogo } from './MelalaLogo';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 text-xs border-t border-slate-800">
      {/* Top Value Banner */}
      <div className="border-b border-slate-800 bg-slate-950/60 py-6 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-teal-950/80 border border-teal-800/60 rounded-lg text-teal-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-slate-100 text-sm">100% EFDA Compliant</h4>
              <p className="text-slate-400 text-xs mt-0.5">
                Full batch traceability and regulatory accreditation across all pharmaceutical lines.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-blue-950/80 border border-blue-800/60 rounded-lg text-blue-400">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-slate-100 text-sm">Cold-Chain Express Logistics</h4>
              <p className="text-slate-400 text-xs mt-0.5">
                Temperature-monitored refrigerated transport to Addis Ababa, Adama, Hawassa, & regional hubs.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-amber-950/80 border border-amber-800/60 rounded-lg text-amber-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-slate-100 text-sm">Flexible B2B Credit Terms</h4>
              <p className="text-slate-400 text-xs mt-0.5">
                30-day revolving credit lines and pro-forma invoice issuance for verified healthcare facilities.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-indigo-950/80 border border-indigo-800/60 rounded-lg text-indigo-400">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-slate-100 text-sm">Dedicated Account Managers</h4>
              <p className="text-slate-400 text-xs mt-0.5">
                Assigned pharmaceutical sales reps providing customized quotation & fast dispatch support.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {/* Col 1: About */}
        <div className="space-y-3">
          <MelalaLogo theme="dark" variant="full" size="md" />
          <p className="text-slate-400 leading-relaxed text-xs pt-1">
            Melala Pharmaceutical Wholesale PLC is a premier B2B healthcare distributor in Ethiopia supplying certified pharmaceutical medicines, medical equipment, hospital consumables, and dermatological cosmetics.
          </p>
          <div className="text-[11px] text-teal-400 font-semibold bg-slate-800/80 p-2.5 rounded-md border border-slate-700">
            EFDA License No: EFDA/WHOLESALE/NATIONAL/2020/001
          </div>
        </div>

        {/* Col 2: Categories */}
        <div>
          <h5 className="font-bold text-white text-sm uppercase tracking-wider mb-3">Product Portfolio</h5>
          <ul className="space-y-2 text-slate-400 text-xs">
            <li><a href="#catalog" className="hover:text-teal-400 transition-colors">Prescription (Rx) & Essential Medicines</a></li>
            <li><a href="#catalog" className="hover:text-teal-400 transition-colors">Hospital Surgical Consumables & Supplies</a></li>
            <li><a href="#catalog" className="hover:text-teal-400 transition-colors">Diagnostic Equipment & Patient Monitors</a></li>
            <li><a href="#catalog" className="hover:text-teal-400 transition-colors">Melala PureCare Dermatological Line</a></li>
            <li><a href="#catalog" className="hover:text-teal-400 transition-colors">Personal Hygiene & Antiseptic Scrubs</a></li>
            <li><a href="#catalog" className="hover:text-teal-400 transition-colors">Nutritional Supplements & Rehydration Salts</a></li>
          </ul>
        </div>

        {/* Col 3: Distribution Hubs */}
        <div>
          <h5 className="font-bold text-white text-sm uppercase tracking-wider mb-3">Logistics & Depots</h5>
          <ul className="space-y-2.5 text-slate-400 text-xs">
            <li className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
              <span><strong>Central Depot:</strong> Kaliti Industrial Zone, Road 4, Addis Ababa, Ethiopia</span>
            </li>
            <li className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
              <span><strong>Adama Regional Hub:</strong> Main Commercial Freight Hub</span>
            </li>
            <li className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
              <span><strong>Hawassa Regional Depot:</strong> Referral Care Logistics Center</span>
            </li>
          </ul>
        </div>

        {/* Col 4: Contact & Channels */}
        <div>
          <h5 className="font-bold text-white text-sm uppercase tracking-wider mb-3">Official Support & Channels</h5>
          <div className="space-y-2.5 text-slate-400 text-xs">
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-amber-400 shrink-0" />
              <div>
                <span className="text-slate-400 text-[11px] block">Customer Support:</span>
                <span className="text-amber-300 font-semibold font-mono">+251 911 848 166</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-teal-400 shrink-0" />
              <div>
                <span className="text-slate-400 text-[11px] block">Business Email:</span>
                <a href="mailto:melalapharmaceuticalwholesale@mail.com" className="text-teal-300 hover:underline font-mono text-[11px]">
                  melalapharmaceuticalwholesale@mail.com
                </a>
              </div>
            </div>
            <div className="flex items-center gap-4 pt-1">
              <div className="flex items-center gap-1.5 text-[11px]">
                <span className="p-1 rounded bg-slate-800 text-cyan-400 font-bold">Telegram</span>
                <span className="font-mono text-slate-300">+251 923 880 065</span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px]">
                <span className="p-1 rounded bg-slate-800 text-emerald-400 font-bold">WhatsApp</span>
                <span className="font-mono text-slate-300">+251 910 520 479</span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800">
              <div className="text-[11px] font-semibold text-slate-300 mb-1.5">Approved Payment Partners:</div>
              <div className="flex flex-wrap gap-1.5 text-[10px] font-bold text-slate-200">
                <span className="bg-slate-800 px-2 py-1 rounded border border-slate-700">Commercial Bank of Ethiopia (CBE)</span>
                <span className="bg-slate-800 px-2 py-1 rounded border border-slate-700">Dashen Bank</span>
                <span className="bg-slate-800 px-2 py-1 rounded border border-slate-700">Telebirr SuperApp</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Legal Disclaimer */}
      <div className="border-t border-slate-800 py-4 px-4 bg-slate-950">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2 text-slate-500 text-[11px]">
          <div>
            © {new Date().getFullYear()} Melala Pharmaceutical Wholesale PLC. All rights reserved.
          </div>
          <div>
            Regulated by Ethiopian Food and Drug Authority (EFDA) | B2B Wholesale Only
          </div>
        </div>
      </div>
    </footer>
  );
};
