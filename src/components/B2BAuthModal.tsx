import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { registerB2BCustomer, loginB2BCustomer, resetB2BPassword } from '../services/api';
import { FacilityType } from '../types';
import { MelalaLogo } from './MelalaLogo';
import {
  X,
  Building2,
  Lock,
  Mail,
  Phone,
  MapPin,
  FileCheck,
  ShieldAlert,
  UserCheck,
  CheckCircle2,
  ArrowRight,
  RefreshCw,
  KeyRound,
} from 'lucide-react';

interface B2BAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register' | 'forgot_password';
}

export const B2BAuthModal: React.FC<B2BAuthModalProps> = ({ isOpen, onClose, initialMode = 'login' }) => {
  const { setCurrentUser, switchRole, allUsers, showToast, refreshData } = useApp();

  const [mode, setMode] = useState<'login' | 'register' | 'forgot_password'>(initialMode);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Login form state
  const [loginEmail, setLoginEmail] = useState<string>('melalapharmaceuticalwholesale@mail.com');
  const [loginPassword, setLoginPassword] = useState<string>('');

  // Register form state
  const [regName, setRegName] = useState<string>('');
  const [regEmail, setRegEmail] = useState<string>('');
  const [regFacilityName, setRegFacilityName] = useState<string>('');
  const [regFacilityType, setRegFacilityType] = useState<FacilityType>('Pharmacy');
  const [regPhone, setRegPhone] = useState<string>('');
  const [regCity, setRegCity] = useState<string>('Addis Ababa');
  const [regRegion, setRegRegion] = useState<string>('Addis Ababa');
  const [regAddress, setRegAddress] = useState<string>('');
  const [regEfdaNo, setRegEfdaNo] = useState<string>('');
  const [regTin, setRegTin] = useState<string>('');
  const [regVat, setRegVat] = useState<boolean>(true);

  // Forgot Password state
  const [resetEmail, setResetEmail] = useState<string>('');

  if (!isOpen) return null;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);

    const res = await loginB2BCustomer(loginEmail, loginPassword);
    setLoading(false);

    if (res.error) {
      setErrorMessage(res.error);
    } else if (res.user) {
      setCurrentUser(res.user);
      if (res.user.role) {
        switchRole(res.user.role);
      }
      showToast('Welcome Back!', `Signed in as ${res.user.facilityName} (${res.user.name}) - Role: ${res.user.role.toUpperCase()}`, 'success');
      onClose();
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setLoading(true);

    const res = await registerB2BCustomer({
      name: regName,
      email: regEmail,
      facilityName: regFacilityName,
      facilityType: regFacilityType,
      phone: regPhone,
      city: regCity,
      region: regRegion,
      businessAddress: regAddress,
      efdaLicenseNo: regEfdaNo,
      tinNumber: regTin,
      vatRegistered: regVat,
    });

    setLoading(false);

    if (res.error) {
      setErrorMessage(res.error);
    } else if (res.user) {
      setCurrentUser(res.user);
      showToast(
        'B2B Customer Account Created',
        `Welcome ${res.user.facilityName}! Status: ${res.user.verificationStatus}. Compliance review initiated.`,
        'success'
      );
      refreshData();
      onClose();
    }
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setLoading(true);

    const res = await resetB2BPassword(resetEmail);
    setLoading(false);

    if (res.error) {
      setErrorMessage(res.error);
    } else if (res.message) {
      setSuccessMessage(res.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <MelalaLogo theme="dark" variant="full" size="sm" />
          </div>

          <button
            onClick={onClose}
            className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-200 bg-slate-50 text-xs font-bold text-slate-600">
          <button
            onClick={() => {
              setMode('login');
              setErrorMessage(null);
              setSuccessMessage(null);
            }}
            className={`flex-1 py-3 px-4 text-center cursor-pointer border-b-2 transition-all ${
              mode === 'login'
                ? 'border-teal-600 text-teal-900 bg-white font-extrabold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => {
              setMode('register');
              setErrorMessage(null);
              setSuccessMessage(null);
            }}
            className={`flex-1 py-3 px-4 text-center cursor-pointer border-b-2 transition-all ${
              mode === 'register'
                ? 'border-teal-600 text-teal-900 bg-white font-extrabold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            Register Facility
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 space-y-4">
          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 font-medium flex items-start gap-2">
              <ShieldAlert className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-medium flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* MODE: LOGIN */}
          {mode === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Business Account Email</label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="e.g. hana.wolde@addisgeneral.et"
                    className="w-full border border-slate-300 rounded-xl pl-9 pr-3 py-2.5 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-teal-600 focus:outline-none font-medium text-slate-900"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="font-semibold text-slate-700">Password</label>
                  <button
                    type="button"
                    onClick={() => {
                      setMode('forgot_password');
                      setErrorMessage(null);
                      setSuccessMessage(null);
                    }}
                    className="text-[11px] font-bold text-teal-700 hover:text-teal-900 cursor-pointer"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Enter password"
                    className="w-full border border-slate-300 rounded-xl pl-9 pr-3 py-2.5 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-teal-600 focus:outline-none font-medium text-slate-900"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-teal-700 hover:bg-teal-800 text-white font-bold rounded-xl shadow-md cursor-pointer transition-all flex items-center justify-center gap-2"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <UserCheck className="w-4 h-4" />}
                <span>Sign In to B2B Account</span>
              </button>

              {/* Demo Quick Account Selector */}
              <div className="pt-3 border-t border-slate-200/80 space-y-2">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Quick Demo Accounts (Click to Select)
                </p>
                <div className="grid grid-cols-1 gap-1.5 text-left">
                  {allUsers.map((u) => (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => {
                        setLoginEmail(u.email);
                        setLoginPassword(u.password || '#1Kiya@sami');
                      }}
                      className="p-2 border border-slate-200 rounded-lg hover:border-teal-500 hover:bg-teal-50/50 flex items-center justify-between text-left cursor-pointer transition-all"
                    >
                      <div>
                        <div className="font-bold text-slate-800">{u.facilityName}</div>
                        <div className="text-[10px] text-slate-500">{u.email} • Role: <span className="font-bold text-teal-800 uppercase">{u.role}</span></div>
                      </div>
                      <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded">
                        Select
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </form>
          )}

          {/* MODE: REGISTER */}
          {mode === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5 text-xs">
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-2.5 text-amber-900 text-[11px] space-y-0.5">
                <div className="font-bold flex items-center gap-1 text-amber-950">
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                  EFDA Compliance & Verification
                </div>
                <p>
                  Regulated medicines require valid EFDA facility licenses before order fulfillment. Unverified accounts can browse products and submit RFQ inquiries.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Facility / Business Name *</label>
                  <input
                    type="text"
                    required
                    value={regFacilityName}
                    onChange={(e) => setRegFacilityName(e.target.value)}
                    placeholder="e.g. Shewa Central Pharmacy"
                    className="w-full border border-slate-300 rounded-xl p-2 bg-slate-50 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Business Type *</label>
                  <select
                    value={regFacilityType}
                    onChange={(e) => setRegFacilityType(e.target.value as FacilityType)}
                    className="w-full border border-slate-300 rounded-xl p-2 bg-slate-50 font-medium"
                  >
                    <option value="Pharmacy">Pharmacy</option>
                    <option value="Drug Store">Drug store</option>
                    <option value="Clinic">Clinic</option>
                    <option value="Hospital">Hospital</option>
                    <option value="Healthcare Org">Healthcare Organization</option>
                    <option value="Medical Retailer">Medical Retailer</option>
                    <option value="Other Approved Business">Other Approved Business</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Contact Person *</label>
                  <input
                    type="text"
                    required
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="e.g. Dr. Meron Assefa"
                    className="w-full border border-slate-300 rounded-xl p-2 bg-slate-50"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Phone Number *</label>
                  <input
                    type="text"
                    required
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    placeholder="e.g. +251 911 223 344"
                    className="w-full border border-slate-300 rounded-xl p-2 bg-slate-50 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Business Account Email *</label>
                <input
                  type="email"
                  required
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="e.g. contact@shewapharm.et"
                  className="w-full border border-slate-300 rounded-xl p-2 bg-slate-50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">City / Town *</label>
                  <input
                    type="text"
                    required
                    value={regCity}
                    onChange={(e) => setRegCity(e.target.value)}
                    placeholder="e.g. Hawassa"
                    className="w-full border border-slate-300 rounded-xl p-2 bg-slate-50"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Region</label>
                  <input
                    type="text"
                    value={regRegion}
                    onChange={(e) => setRegRegion(e.target.value)}
                    placeholder="e.g. Sidama"
                    className="w-full border border-slate-300 rounded-xl p-2 bg-slate-50"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Facility Physical Address</label>
                <input
                  type="text"
                  value={regAddress}
                  onChange={(e) => setRegAddress(e.target.value)}
                  placeholder="e.g. Subcity 02, Commercial Street"
                  className="w-full border border-slate-300 rounded-xl p-2 bg-slate-50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1 border-t border-slate-200">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">EFDA License No. (Optional)</label>
                  <input
                    type="text"
                    value={regEfdaNo}
                    onChange={(e) => setRegEfdaNo(e.target.value)}
                    placeholder="EFDA/PH/SD/2026/001"
                    className="w-full border border-slate-300 rounded-xl p-2 bg-slate-50 font-mono text-[11px]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Ethiopian TIN Number</label>
                  <input
                    type="text"
                    value={regTin}
                    onChange={(e) => setRegTin(e.target.value)}
                    placeholder="0048192031"
                    className="w-full border border-slate-300 rounded-xl p-2 bg-slate-50 font-mono text-[11px]"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="vatCheck"
                  checked={regVat}
                  onChange={(e) => setRegVat(e.target.checked)}
                  className="rounded text-teal-600 focus:ring-teal-500"
                />
                <label htmlFor="vatCheck" className="text-[11px] font-medium text-slate-700 cursor-pointer">
                  Facility is VAT Registered in Ethiopia
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-teal-700 hover:bg-teal-800 text-white font-bold rounded-xl shadow-md cursor-pointer transition-all flex items-center justify-center gap-2"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <FileCheck className="w-4 h-4" />}
                <span>Register B2B Account</span>
              </button>
            </form>
          )}

          {/* MODE: FORGOT PASSWORD */}
          {mode === 'forgot_password' && (
            <form onSubmit={handleResetSubmit} className="space-y-4 text-xs">
              <p className="text-slate-600 leading-relaxed">
                Enter your registered business account email below. We will send a secure password reset link and verification instructions.
              </p>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Business Account Email</label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    placeholder="e.g. hana.wolde@addisgeneral.et"
                    className="w-full border border-slate-300 rounded-xl pl-9 pr-3 py-2.5 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-teal-600 focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-teal-700 hover:bg-teal-800 text-white font-bold rounded-xl shadow-md cursor-pointer transition-all flex items-center justify-center gap-2"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <KeyRound className="w-4 h-4" />}
                <span>Send Password Reset Link</span>
              </button>

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setErrorMessage(null);
                    setSuccessMessage(null);
                  }}
                  className="text-xs font-bold text-slate-600 hover:text-slate-900 cursor-pointer"
                >
                  &larr; Back to Sign In
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
