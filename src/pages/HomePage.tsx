import React from 'react';
import { useApp } from '../context/AppContext';
import { ProductCard } from '../components/ProductCard';
import { MelalaLogo } from '../components/MelalaLogo';
import melalaFullLogoImg from '../assets/images/melala_full_logo_1786456897798.jpg';
import {
  ShieldCheck,
  Truck,
  FileCheck,
  Building2,
  ArrowRight,
  Sparkles,
  PhoneCall,
  CheckCircle2,
  Activity,
  Layers,
  Award,
  Clock,
  ChevronRight,
  PackageCheck,
  Heart,
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const { products, setCurrentPage, setSelectedProductId, setIsVerificationModalOpen, setIsQuoteDrawerOpen } = useApp();

  const strategicProducts = products.filter((p) => p.isStrategic).slice(0, 4);

  const categories = [
    {
      id: 'pharmaceuticals',
      name: 'Pharmaceutical Medicines',
      desc: 'Rx Antibiotics, Analgesics, Chronic Care, Injectables & IV Solutions',
      count: '400+ Products',
      icon: '💊',
      color: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    },
    {
      id: 'medical-supplies',
      name: 'Medical Supplies',
      desc: 'Sterile Surgical Gloves, Syringes, Gauze, Rapid Diagnostic Kits',
      count: '250+ Products',
      icon: '🩺',
      color: 'bg-blue-50 text-blue-800 border-blue-200',
    },
    {
      id: 'medical-equipment',
      name: 'Medical Equipment',
      desc: 'Patient Monitors, Autoclaves, Hematology Analyzers, Ultrasound',
      count: '80+ Devices',
      icon: '⚙️',
      color: 'bg-indigo-50 text-indigo-800 border-indigo-200',
    },
    {
      id: 'cosmetics',
      name: 'Cosmetics & Dermatology',
      desc: 'Melala PureCare Medicated Skincare, Barrier Creams, Sunscreen',
      count: '120+ Products',
      icon: '✨',
      color: 'bg-amber-50 text-amber-800 border-amber-200',
    },
    {
      id: 'personal-care',
      name: 'Personal Care & Hygiene',
      desc: 'Hospital Chlorhexidine Scrubs, Hand Sanitizers, Antiseptics',
      count: '95+ Products',
      icon: '🧼',
      color: 'bg-teal-50 text-teal-800 border-teal-200',
    },
    {
      id: 'other-healthcare',
      name: 'Healthcare & Nutrition',
      desc: 'WHO Rehydration Salts (ORS), Effervescent Vitamins, Supplements',
      count: '110+ Products',
      icon: '🍏',
      color: 'bg-slate-50 text-slate-800 border-slate-200',
    },
  ];

  return (
    <div className="space-y-12 pb-12">
      {/* Hero Section */}
      <section className="bg-slate-900 text-white relative overflow-hidden py-14 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900 to-teal-950/60 opacity-90"></div>
        <div className="absolute -right-20 -bottom-20 w-96 h-96 bg-teal-600/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <MelalaLogo variant="full" theme="dark" size="lg" />
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-teal-950/80 border border-teal-700/60 rounded-full text-teal-300 text-xs font-semibold">
                <ShieldCheck className="w-4 h-4 text-teal-400" />
                <span>EFDA Licensed National Pharmaceutical Distributor • Ethiopia</span>
              </div>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight text-white">
              Trusted B2B Wholesale Partner for <span className="text-teal-400">Pharmacies, Clinics & Hospitals</span>
            </h1>

            <p className="text-slate-200 text-sm sm:text-base font-medium max-w-2xl leading-relaxed">
              Melala Pharmaceutical Wholesale helps healthcare businesses source medicines and healthcare products efficiently. We supply EFDA-certified prescription medicines, surgical consumables, diagnostic equipment, and cosmetics with guaranteed batch traceability and cold-chain express delivery across Ethiopia.
            </p>

            <div className="flex flex-wrap items-center gap-2.5 pt-2">
              <button
                onClick={() => setCurrentPage('catalog')}
                className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white font-bold rounded-xl text-xs sm:text-sm shadow-md flex items-center gap-2 transition-all cursor-pointer"
              >
                <span>Browse Products</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => setIsQuoteDrawerOpen(true)}
                className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 font-bold rounded-xl text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer"
              >
                <FileCheck className="w-4 h-4 text-amber-400" />
                <span>Request a Quote</span>
              </button>

              <button
                onClick={() => setIsVerificationModalOpen(true)}
                className="px-5 py-2.5 bg-teal-950 hover:bg-teal-900 text-teal-300 border border-teal-700/80 font-bold rounded-xl text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4 text-teal-400" />
                <span>Become a Customer</span>
              </button>

              <button
                onClick={() => setCurrentPage('about-contact')}
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 font-bold rounded-xl text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer"
              >
                <PhoneCall className="w-4 h-4 text-blue-400" />
                <span>Contact Sales</span>
              </button>
            </div>

            {/* Quick Metrics */}
            <div className="pt-6 grid grid-cols-3 gap-4 border-t border-slate-800 text-xs">
              <div>
                <div className="text-xl sm:text-2xl font-black text-amber-400">2,500+</div>
                <div className="text-slate-400 text-[11px] font-medium">Healthcare Facilities Served</div>
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-black text-teal-400">100%</div>
                <div className="text-slate-400 text-[11px] font-medium">EFDA Batch Traceability</div>
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-black text-blue-400">Cold Chain</div>
                <div className="text-slate-400 text-[11px] font-medium">Refrigerated Express Transport</div>
              </div>
            </div>
          </div>

          {/* Quick RFQ Builder Preview Card */}
          <div className="lg:col-span-5 bg-slate-800/80 backdrop-blur-md border border-slate-700 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-700 pb-3">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-teal-400" />
                <h3 className="font-bold text-white text-sm">Instant B2B Order & RFQ Portal</h3>
              </div>
              <span className="text-[10px] font-semibold bg-emerald-950 text-emerald-400 border border-emerald-800 px-2 py-0.5 rounded-full">
                EFDA Live Sync
              </span>
            </div>

            <div className="space-y-3 text-xs text-slate-300">
              <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-700/60 space-y-2">
                <div className="font-semibold text-slate-200 flex items-center justify-between">
                  <span>Fast Wholesale Benefits for Approved Clients:</span>
                </div>
                <ul className="space-y-1.5 text-slate-400 text-[11px]">
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                    <span>Tiered Wholesale Discounts up to 18% off list price</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                    <span>30-Day Revolving Credit Terms up to 1,000,000 ETB</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                    <span>Instant Pro-Forma Invoice Generation for Bank Transfers</span>
                  </li>
                </ul>
              </div>

              <div className="p-3 bg-teal-950/60 border border-teal-800/80 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-teal-200">Are you a Licensed Health Facility?</span>
                  <button
                    onClick={() => setIsVerificationModalOpen(true)}
                    className="text-[10px] font-bold text-amber-300 hover:underline cursor-pointer"
                  >
                    Upload License
                  </button>
                </div>
                <p className="text-[11px] text-teal-300/80">
                  Submit your EFDA license number and TIN to unlock institutional custom pricing.
                </p>
              </div>

              <button
                onClick={() => setCurrentPage('catalog')}
                className="w-full py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-xs transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Enter Wholesale Order Catalog</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Category Grid Section */}
      <section className="max-w-7xl mx-auto px-4 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-slate-200 pb-3">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Wholesale Product Divisions
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Explore EFDA registered categories tailored for hospital stores, retail pharmacies, and clinical networks.
            </p>
          </div>

          <button
            onClick={() => setCurrentPage('catalog')}
            className="text-xs font-bold text-teal-800 hover:text-teal-900 flex items-center gap-1 cursor-pointer"
          >
            <span>View All Categories</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((c) => (
            <div
              key={c.id}
              onClick={() => setCurrentPage('catalog')}
              className={`p-5 rounded-2xl border ${c.color} hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-3xl">{c.icon}</span>
                  <span className="text-[11px] font-bold px-2 py-0.5 bg-white/80 rounded-full border border-slate-200 shadow-2xs">
                    {c.count}
                  </span>
                </div>

                <h3 className="font-bold text-slate-900 text-base group-hover:text-teal-900 transition-colors">
                  {c.name}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">{c.desc}</p>
              </div>

              <div className="pt-4 flex items-center gap-1 text-xs font-bold text-teal-800 group-hover:translate-x-1 transition-transform">
                <span>Browse Products</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* High-Margin & Strategic Products Showcase */}
      <section className="max-w-7xl mx-auto px-4 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-slate-200 pb-3">
          <div>
            <div className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200 mb-1">
              <Sparkles className="w-3 h-3 text-amber-600" />
              <span>Priority B2B Allocation</span>
            </div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Strategic High-Demand Pharmaceuticals & Supplies
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              High-margin essential medicines and hospital consumables with guaranteed immediate dispatch.
            </p>
          </div>

          <button
            onClick={() => setCurrentPage('catalog')}
            className="text-xs font-bold text-teal-800 hover:text-teal-900 flex items-center gap-1 cursor-pointer"
          >
            <span>View Full Catalog ({products.length})</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {strategicProducts.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {/* Regulatory Compliance & Cold Chain Commitment */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="bg-slate-900 text-white rounded-2xl p-8 border border-slate-800 shadow-xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-8 space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-400 bg-teal-950 px-3 py-1 rounded-full border border-teal-800">
              Regulatory Compliance Standards
            </span>
            <h2 className="text-2xl font-extrabold text-white">
              Strict Adherence to Ethiopian EFDA Guidelines & WHO Cold-Chain Standards
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              Every pharmaceutical product supplied by Melala undergoes rigorous quality auditing, verification of manufacturing GMP certificates, and strict batch temperature monitoring during storage and regional transportation.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
              <div className="flex items-start gap-2 bg-slate-800/80 p-3 rounded-xl border border-slate-700">
                <ShieldCheck className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-white">Full Batch Expiry Traceability</h4>
                  <p className="text-slate-400 text-[11px] mt-0.5">
                    Automated EFDA batch code tracking ensures zero expired stock reaches customer stores.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2 bg-slate-800/80 p-3 rounded-xl border border-slate-700">
                <Truck className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-white">Temperature-Controlled Fleet</h4>
                  <p className="text-slate-400 text-[11px] mt-0.5">
                    Insulated cold-chain vehicle logistics for insulin, vaccines, and biologics.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 bg-teal-950/80 border border-teal-800/80 p-6 rounded-2xl text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-teal-700 text-white flex items-center justify-center mx-auto shadow-md">
              <PhoneCall className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Direct B2B Sales Hotline</h3>
              <p className="text-xs text-teal-200 mt-1">
                Speak directly with an assigned pharmaceutical sales representative for custom quotes.
              </p>
            </div>
            <div className="text-lg font-extrabold text-amber-300 font-mono">
              +251 11 663 9090
            </div>
            <button
              onClick={() => setCurrentPage('about-contact')}
              className="w-full py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-xs transition-all cursor-pointer"
            >
              Contact Regional Depots
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
