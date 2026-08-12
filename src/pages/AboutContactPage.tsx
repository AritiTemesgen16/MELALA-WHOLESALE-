import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { MelalaLogo } from '../components/MelalaLogo';
import samuelPhoto from '../assets/images/samuel_temesgen_1786458998149.jpg';
import emnetPhoto from '../assets/images/emnet_amde_1786459015595.jpg';
import {
  Building2,
  MapPin,
  Phone,
  Mail,
  ShieldCheck,
  Truck,
  Award,
  Send,
  Clock,
  CheckCircle2,
  User,
  Camera,
  Upload,
  RotateCcw,
  Sparkles,
} from 'lucide-react';

export const AboutContactPage: React.FC = () => {
  const { showToast } = useApp();

  const [contactName, setContactName] = useState('');
  const [facilityName, setFacilityName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [city, setCity] = useState('Addis Ababa');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  // Custom uploaded photos state with server & localStorage persistence
  const [samuelPhotoUrl, setSamuelPhotoUrl] = useState<string>(() => {
    return localStorage.getItem('melala_owner_samuel_custom_photo') || samuelPhoto;
  });
  const [emnetPhotoUrl, setEmnetPhotoUrl] = useState<string>(() => {
    return localStorage.getItem('melala_owner_emnet_custom_photo') || emnetPhoto;
  });

  const samuelInputRef = useRef<HTMLInputElement>(null);
  const emnetInputRef = useRef<HTMLInputElement>(null);

  // Fetch photos from server on mount
  React.useEffect(() => {
    fetch('/api/owners/photos')
      .then((res) => res.json())
      .then((data) => {
        if (data?.samuel) {
          setSamuelPhotoUrl(data.samuel);
          localStorage.setItem('melala_owner_samuel_custom_photo', data.samuel);
        }
        if (data?.emnet) {
          setEmnetPhotoUrl(data.emnet);
          localStorage.setItem('melala_owner_emnet_custom_photo', data.emnet);
        }
      })
      .catch(() => {
        // ignore fetch error if server offline
      });
  }, []);

  const handlePhotoFileChange = (ownerKey: 'samuel' | 'emnet', e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        if (ownerKey === 'samuel') {
          setSamuelPhotoUrl(dataUrl);
          localStorage.setItem('melala_owner_samuel_custom_photo', dataUrl);
          fetch('/api/owners/photos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ samuel: dataUrl }),
          }).catch(() => {});
          showToast('Samuel Temesgen Photo Saved!', 'Your custom photo is saved on the server and live on the application.', 'success');
        } else {
          setEmnetPhotoUrl(dataUrl);
          localStorage.setItem('melala_owner_emnet_custom_photo', dataUrl);
          fetch('/api/owners/photos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ emnet: dataUrl }),
          }).catch(() => {});
          showToast('Emnet Amde Photo Saved!', 'Your custom photo is saved on the server and live on the application.', 'success');
        }
      }
    };
    reader.readAsDataURL(file);
    // reset input value so re-selecting same file triggers onChange
    e.target.value = '';
  };

  const handleResetPhoto = (ownerKey: 'samuel' | 'emnet') => {
    if (ownerKey === 'samuel') {
      setSamuelPhotoUrl(samuelPhoto);
      localStorage.removeItem('melala_owner_samuel_custom_photo');
      fetch('/api/owners/photos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ samuel: '' }),
      }).catch(() => {});
      showToast('Photo Reverted', 'Reset Samuel Temesgen profile image to default.', 'info');
    } else {
      setEmnetPhotoUrl(emnetPhoto);
      localStorage.removeItem('melala_owner_emnet_custom_photo');
      fetch('/api/owners/photos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emnet: '' }),
      }).catch(() => {});
      showToast('Photo Reverted', 'Reset Emnet Amde profile image to default.', 'info');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    showToast('Wholesale Inquiry Submitted!', 'A Melala sales representative will contact your facility within 2 business hours.', 'success');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-12">
      {/* Header Hero */}
      <div className="bg-slate-900 text-white rounded-2xl p-8 border border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <MelalaLogo variant="full" theme="dark" size="lg" />
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-teal-950 border border-teal-800 rounded-full text-teal-400 text-xs font-semibold">
            <ShieldCheck className="w-4 h-4" /> B2B National Pharmaceutical Supply Chain • Ethiopia
          </div>
        </div>

        <p className="text-slate-300 text-sm max-w-3xl leading-relaxed pt-2">
          Melala Pharmaceutical Wholesale is a leading Ethiopian B2B healthcare distributor committed to elevating medical access across Ethiopia. We connect international pharmaceutical manufacturers with certified local hospitals, clinics, community pharmacies, and drug retailers.
        </p>
      </div>

      {/* Executive Leadership Team */}
      <div className="space-y-6">
        <div className="border-b border-slate-200 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900">Executive Leadership</h2>
            <p className="text-xs text-slate-500">
              Founded and directed by licensed pharmaceutical professionals dedicated to ethical B2B healthcare distribution in Ethiopia.
            </p>
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-200 text-amber-800 rounded-lg text-xs font-medium">
            <Camera className="w-3.5 h-3.5 text-amber-600" />
            <span>Click any avatar to upload your photo</span>
          </div>
        </div>

        {/* Hidden File Inputs */}
        <input
          type="file"
          ref={samuelInputRef}
          accept="image/*"
          className="hidden"
          onChange={(e) => handlePhotoFileChange('samuel', e)}
        />
        <input
          type="file"
          ref={emnetInputRef}
          accept="image/*"
          className="hidden"
          onChange={(e) => handlePhotoFileChange('emnet', e)}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-4xl">
          {/* Samuel Temesgen */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col sm:flex-row items-start gap-4 hover:border-teal-500/50 transition-all relative group">
            <div className="relative shrink-0">
              <img
                src={samuelPhotoUrl}
                alt="Samuel Temesgen - Owner & Pharmacist"
                referrerPolicy="no-referrer"
                className="w-20 h-20 rounded-full object-cover object-top border-2 border-teal-600 shadow-sm cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => samuelInputRef.current?.click()}
                title="Click to upload custom photo for Samuel"
              />
              <button
                type="button"
                onClick={() => samuelInputRef.current?.click()}
                className="absolute -bottom-1 -right-1 p-1.5 bg-teal-600 text-white rounded-full shadow-md hover:bg-teal-700 transition-colors"
                title="Upload Photo"
              >
                <Camera className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between gap-2">
                <h3 className="font-extrabold text-slate-900 text-base">Samuel Temesgen</h3>
                {samuelPhotoUrl !== samuelPhoto && (
                  <button
                    type="button"
                    onClick={() => handleResetPhoto('samuel')}
                    className="text-[11px] text-slate-400 hover:text-slate-600 flex items-center gap-1 font-medium underline"
                  >
                    <RotateCcw className="w-3 h-3" /> Reset
                  </button>
                )}
              </div>
              <p className="text-xs font-bold text-teal-700 uppercase tracking-wide">Owner & Pharmacist</p>
              <p className="text-xs text-slate-500 leading-relaxed">
                Registered Licensed Pharmacist overseeing national supply chain operations, quality assurance, and partner relations.
              </p>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => samuelInputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 hover:bg-teal-50 text-slate-700 hover:text-teal-800 border border-slate-200 hover:border-teal-300 rounded-lg text-xs font-semibold transition-all"
                >
                  <Upload className="w-3 h-3 text-teal-600" />
                  <span>Upload Your Photo</span>
                </button>
              </div>
            </div>
          </div>

          {/* Emnet Amde */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col sm:flex-row items-start gap-4 hover:border-teal-500/50 transition-all relative group">
            <div className="relative shrink-0">
              <img
                src={emnetPhotoUrl}
                alt="Emnet Amde - Owner & Pharmacist"
                referrerPolicy="no-referrer"
                className="w-20 h-20 rounded-full object-cover object-center border-2 border-teal-600 shadow-sm cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => emnetInputRef.current?.click()}
                title="Click to upload custom photo for Emnet"
              />
              <button
                type="button"
                onClick={() => emnetInputRef.current?.click()}
                className="absolute -bottom-1 -right-1 p-1.5 bg-teal-600 text-white rounded-full shadow-md hover:bg-teal-700 transition-colors"
                title="Upload Photo"
              >
                <Camera className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between gap-2">
                <h3 className="font-extrabold text-slate-900 text-base">Emnet Amde</h3>
                {emnetPhotoUrl !== emnetPhoto && (
                  <button
                    type="button"
                    onClick={() => handleResetPhoto('emnet')}
                    className="text-[11px] text-slate-400 hover:text-slate-600 flex items-center gap-1 font-medium underline"
                  >
                    <RotateCcw className="w-3 h-3" /> Reset
                  </button>
                )}
              </div>
              <p className="text-xs font-bold text-teal-700 uppercase tracking-wide">Owner & Pharmacist</p>
              <p className="text-xs text-slate-500 leading-relaxed">
                Registered Licensed Pharmacist directing clinical compliance, EFDA regulatory affairs, and pharmaceutical inventory management.
              </p>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => emnetInputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 hover:bg-teal-50 text-slate-700 hover:text-teal-800 border border-slate-200 hover:border-teal-300 rounded-lg text-xs font-semibold transition-all"
                >
                  <Upload className="w-3 h-3 text-teal-600" />
                  <span>Upload Your Photo</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Regional Depots Directory */}
      <div className="space-y-6">
        <div className="border-b border-slate-200 pb-3">
          <h2 className="text-xl font-extrabold text-slate-900">National Distribution & Depot Network</h2>
          <p className="text-xs text-slate-500">Strategically situated distribution hubs for express cold-chain freight across Ethiopia.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3 shadow-xs">
            <div className="p-2.5 bg-teal-50 border border-teal-200 text-teal-800 rounded-xl w-fit">
              <Building2 className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">Central Operations Depot</h3>
            <div className="text-xs text-slate-600 space-y-1">
              <p className="font-semibold text-slate-800">Kaliti Industrial Zone, Road 4</p>
              <p>Addis Ababa, Ethiopia</p>
              <p className="text-teal-800 font-mono text-[11px] font-bold">Tel: +251 11 663 9090</p>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3 shadow-xs">
            <div className="p-2.5 bg-blue-50 border border-blue-200 text-blue-800 rounded-xl w-fit">
              <Truck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">Adama Regional Freight Hub</h3>
            <div className="text-xs text-slate-600 space-y-1">
              <p className="font-semibold text-slate-800">Commercial Freight Corridor</p>
              <p>Adama, Oromia, Ethiopia</p>
              <p className="text-teal-800 font-mono text-[11px] font-bold">Tel: +251 22 111 8899</p>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3 shadow-xs">
            <div className="p-2.5 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl w-fit">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">Hawassa Regional Care Depot</h3>
            <div className="text-xs text-slate-600 space-y-1">
              <p className="font-semibold text-slate-800">Referral Hospital Logistics Zone</p>
              <p>Hawassa, Sidama, Ethiopia</p>
              <p className="text-teal-800 font-mono text-[11px] font-bold">Tel: +251 46 220 4455</p>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3 shadow-xs">
            <div className="p-2.5 bg-indigo-50 border border-indigo-200 text-indigo-800 rounded-xl w-fit">
              <Award className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">Bahir Dar Medical Center Depot</h3>
            <div className="text-xs text-slate-600 space-y-1">
              <p className="font-semibold text-slate-800">Felege Hiwot Hospital Highway</p>
              <p>Bahir Dar, Amhara, Ethiopia</p>
              <p className="text-teal-800 font-mono text-[11px] font-bold">Tel: +251 58 220 9900</p>
            </div>
          </div>
        </div>
      </div>

      {/* Inquiry Form & Support */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Form */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-5">
          <div>
            <h3 className="text-lg font-extrabold text-slate-900">Direct Wholesale & Account Opening Inquiry</h3>
            <p className="text-xs text-slate-500">Contact our sales operations team for bulk tenders or revolving credit account setups.</p>
          </div>

          {submitted ? (
            <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-2 text-emerald-950">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
              <h4 className="font-extrabold text-base">Wholesale Inquiry Received</h4>
              <p className="text-xs text-emerald-800">
                Thank you for reaching out. A Melala senior sales officer will review your health facility credentials and contact you shortly.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Contact Officer Name</label>
                  <input
                    type="text"
                    required
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder="e.g. Dr. Samuel Tadesse"
                    className="w-full border border-slate-300 rounded-lg p-2.5 bg-slate-50"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Healthcare Facility Name</label>
                  <input
                    type="text"
                    required
                    value={facilityName}
                    onChange={(e) => setFacilityName(e.target.value)}
                    placeholder="e.g. Landmark Specialty Hospital"
                    className="w-full border border-slate-300 rounded-lg p-2.5 bg-slate-50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+251 911 ..."
                    className="w-full border border-slate-300 rounded-lg p-2.5 bg-slate-50"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Official Email</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="pharmacy@hospital.com"
                    className="w-full border border-slate-300 rounded-lg p-2.5 bg-slate-50"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Facility City</label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2.5 bg-slate-50"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Inquiry Details & Requested Product Lines</label>
                <textarea
                  rows={4}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Specify requested pharmaceutical lines, estimated monthly volume, or credit line setup requirements..."
                  className="w-full border border-slate-300 rounded-lg p-2.5 bg-slate-50"
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-teal-700 hover:bg-teal-800 text-white font-bold rounded-xl text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>Submit Wholesale Inquiry</span>
              </button>
            </form>
          )}
        </div>

        {/* Contact Info */}
        <div className="lg:col-span-5 bg-slate-900 text-white rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
          <h3 className="text-lg font-extrabold text-white">Official Contact & Channels</h3>

          <div className="space-y-4 text-xs">
            <div className="flex items-start gap-3">
              <Phone className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-slate-200">Customer Support</div>
                <div className="text-amber-300 font-mono text-sm font-bold mt-0.5">
                  +251 911 848 166
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-teal-400 shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-slate-200">Business Email</div>
                <a
                  href="mailto:melalapharmaceuticalwholesale@mail.com"
                  className="text-teal-300 hover:underline font-mono text-xs block mt-0.5 break-all"
                >
                  melalapharmaceuticalwholesale@mail.com
                </a>
                <p className="text-[11px] text-slate-400 mt-1">
                  Use for general business inquiries, wholesale quotation requests, & supplier/customer communications.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Send className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-slate-200">Telegram Direct Line</div>
                <div className="text-cyan-300 font-mono text-sm font-bold mt-0.5">+251 923 880 065</div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Use for quick customer communications, product inquiries, and wholesale order discussions.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-slate-200">WhatsApp Business Line</div>
                <div className="text-emerald-300 font-mono text-sm font-bold mt-0.5">+251 910 520 479</div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Use for customer inquiries & rapid stock availability questions.
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 bg-slate-800 rounded-xl border border-slate-700 text-xs text-slate-300 space-y-1">
            <div className="font-bold text-white flex items-center gap-1 text-teal-400">
              <ShieldCheck className="w-4 h-4" /> Official EFDA Accreditation
            </div>
            <p className="text-[11px] text-slate-400">
              Melala Pharmaceutical Wholesale is fully licensed under Ethiopian Food and Drug Authority (EFDA) License No. EFDA/WHOLESALE/NATIONAL/2020/001.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
