import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { registerB2BCustomer, loginB2BCustomer, resetB2BPassword, associateFacility } from '../services/api';
import { FacilityType } from '../types';
import { MelalaLogo } from './MelalaLogo';
import {
  X,
  Building2,
  Lock,
  Mail,
  Phone,
  ShieldAlert,
  UserCheck,
  CheckCircle2,
  RefreshCw,
  KeyRound,
  User,
  FileCheck,
} from 'lucide-react';

interface B2BAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'signup' | 'register_facility' | 'forgot_password';
}

export const B2BAuthModal: React.FC<B2BAuthModalProps> = ({ isOpen, onClose, initialMode = 'login' }) => {
  const { setCurrentUser, switchRole, currentUser, showToast, refreshData } = useApp();

  const [mode, setMode] = useState<'login' | 'signup' | 'register_facility' | 'forgot_password'>(initialMode);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Login form state
  const [loginEmail, setLoginEmail] = useState<string>('');
  const [loginPassword, setLoginPassword] = useState<string>('');

  // Standard User Signup state
  const [signupName, setSignupName] = useState<string>('');
  const [signupEmail, setSignupEmail] = useState<string>('');
  const [signupPassword, setSignupPassword] = useState<string>('');
  const [signupPhone, setSignupPhone] = useState<string>('');

  // Facility Registration state
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
    setSuccessMessage(null);

    if (!loginEmail.trim()) {
      setErrorMessage('Please enter your account email address.');
      return;
    }

    setLoading(true);
    const res = await loginB2BCustomer(loginEmail.trim(), loginPassword);
    setLoading(false);

    if (res.error) {
      setErrorMessage(res.error);
    } else if (res.user) {
      setCurrentUser(res.user);
      if (res.user.role) {
        switchRole(res.user.role);
      }
      showToast('Welcome Back!', `Signed in as ${res.user.name} (${res.user.facilityName})`, 'success');
      onClose();
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!signupName.trim() || !signupEmail.trim() || !signupPassword.trim()) {
      setErrorMessage('Full Name, Email Address, and Password are required for account creation.');
      return;
    }

    setLoading(true);
    const res = await registerB2BCustomer({
      name: signupName.trim(),
      email: signupEmail.trim(),
      password: signupPassword.trim(),
      phone: signupPhone.trim(),
      facilityName: `${signupName.trim()}'s Healthcare Account`,
      facilityType: 'Pharmacy',
      city: 'Addis Ababa',
      region: 'Addis Ababa',
      businessAddress: '',
      efdaLicenseNo: '',
      tinNumber: '',
      vatRegistered: false,
      role: 'verified_customer',
    });
    setLoading(false);

    if (res.error) {
      setErrorMessage(res.error);
    } else if (res.user) {
      setCurrentUser(res.user);
      showToast(
        'User Account Created',
        `Welcome ${res.user.name}! Your account is active. Next, associate your healthcare facility to request wholesale credit terms.`,
        'success'
      );
      refreshData();
      onClose();
    }
  };

  const handleFacilitySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!regFacilityName.trim() || !regPhone.trim()) {
      setErrorMessage('Healthcare Facility Name and Contact Phone Number are required.');
      return;
    }

    setLoading(true);
    if (currentUser && currentUser.id) {
      const res = await associateFacility({
        userId: currentUser.id,
        facilityName: regFacilityName.trim(),
        facilityType: regFacilityType,
        phone: regPhone.trim(),
        city: regCity.trim(),
        region: regRegion.trim(),
        businessAddress: regAddress.trim(),
        efdaLicenseNo: regEfdaNo.trim(),
        tinNumber: regTin.trim(),
        vatRegistered: regVat,
      });
      setLoading(false);

      if (res.error) {
        setErrorMessage(res.error);
      } else if (res.user) {
        setCurrentUser(res.user);
        showToast(
          'Healthcare Facility Associated',
          `Facility ${res.user.facilityName} registered under EFDA compliance review.`,
          'success'
        );
        refreshData();
        onClose();
      }
    } else {
      // Create new account with full facility registration
      const res = await registerB2BCustomer({
        name: regFacilityName.trim(),
        email: loginEmail || `${regFacilityName.toLowerCase().replace(/\s+/g, '')}@melala-client.et`,
        facilityName: regFacilityName.trim(),
        facilityType: regFacilityType,
        phone: regPhone.trim(),
        city: regCity.trim(),
        region: regRegion.trim(),
        businessAddress: regAddress.trim(),
        efdaLicenseNo: regEfdaNo.trim(),
        tinNumber: regTin.trim(),
        vatRegistered: regVat,
      });
      setLoading(false);

      if (res.error) {
        setErrorMessage(res.error);
      } else if (res.user) {
        setCurrentUser(res.user);
        showToast(
          'Healthcare Facility Account Registered',
          `Facility ${res.user.facilityName} registered under EFDA review status.`,
          'success'
        );
        refreshData();
        onClose();
      }
    }
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!resetEmail.trim()) {
      setErrorMessage('Please enter your account email address.');
      return;
    }

    setLoading(true);
    const res = await resetB2BPassword(resetEmail.trim());
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

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50 text-xs font-bold text-slate-600 overflow-x-auto">
          <button
            onClick={() => {
              setMode('login');
              setErrorMessage(null);
              setSuccessMessage(null);
            }}
            className={`flex-1 py-3 px-3 text-center cursor-pointer border-b-2 whitespace-nowrap transition-all ${
              mode === 'login'
                ? 'border-teal-600 text-teal-900 bg-white font-extrabold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => {
              setMode('signup');
              setErrorMessage(null);
              setSuccessMessage(null);
            }}
            className={`flex-1 py-3 px-3 text-center cursor-pointer border-b-2 whitespace-nowrap transition-all ${
              mode === 'signup'
                ? 'border-teal-600 text-teal-900 bg-white font-extrabold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            Sign Up
          </button>
          <button
            onClick={() => {
              setMode('register_facility');
              setErrorMessage(null);
              setSuccessMessage(null);
            }}
            className={`flex-1 py-3 px-3 text-center cursor-pointer border-b-2 whitespace-nowrap transition-all ${
              mode === 'register_facility'
                ? 'border-teal-600 text-teal-900 bg-white font-extrabold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            Register Facility
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
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
                <label className="block font-semibold text-slate-700 mb-1">Account Email Address *</label>
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
                  <label className="font-semibold text-slate-700">Password *</label>
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
                    placeholder="Enter account password"
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
                <span>Sign In to Account</span>
              </button>

              <div className="pt-3 border-t border-slate-200 text-center">
                <p className="text-slate-500">
                  Don't have an account yet?{' '}
                  <button
                    type="button"
                    onClick={() => setMode('signup')}
                    className="font-bold text-teal-700 hover:text-teal-900 cursor-pointer"
                  >
                    Create User Account
                  </button>
                </p>
              </div>
            </form>
          )}

          {/* MODE: SIGN UP (Standard User Account) */}
          {mode === 'signup' && (
            <form onSubmit={handleSignupSubmit} className="space-y-3.5 text-xs">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-700 space-y-1">
                <div className="font-bold text-slate-900 flex items-center gap-1.5">
                  <User className="w-4 h-4 text-teal-600" />
                  Create Individual / Business User Account
                </div>
                <p className="text-[11px] text-slate-500">
                  Create your user account to access product prices, save quotations, and associate your healthcare facility.
                </p>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Full Name *</label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={signupName}
                    onChange={(e) => setSignupName(e.target.value)}
                    placeholder="e.g. Pharm. Abebe Kebede"
                    className="w-full border border-slate-300 rounded-xl pl-9 pr-3 py-2.5 bg-slate-50 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Email Address *</label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    placeholder="e.g. abebe.k@health.et"
                    className="w-full border border-slate-300 rounded-xl pl-9 pr-3 py-2.5 bg-slate-50 focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Password *</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                    <input
                      type="password"
                      required
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      placeholder="At least 6 characters"
                      className="w-full border border-slate-300 rounded-xl pl-9 pr-3 py-2.5 bg-slate-50 focus:bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Phone Number</label>
                  <div className="relative">
                    <Phone className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                    <input
                      type="tel"
                      value={signupPhone}
                      onChange={(e) => setSignupPhone(e.target.value)}
                      placeholder="+251 911 000 000"
                      className="w-full border border-slate-300 rounded-xl pl-9 pr-3 py-2.5 bg-slate-50 focus:bg-white"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-teal-700 hover:bg-teal-800 text-white font-bold rounded-xl shadow-md cursor-pointer transition-all flex items-center justify-center gap-2"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <UserCheck className="w-4 h-4" />}
                <span>Create User Account</span>
              </button>

              <div className="pt-2 text-center text-slate-500">
                Already registered?{' '}
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="font-bold text-teal-700 hover:text-teal-900 cursor-pointer"
                >
                  Sign In
                </button>
              </div>
            </form>
          )}

          {/* MODE: REGISTER FACILITY (Business / EFDA Compliance Registration) */}
          {mode === 'register_facility' && (
            <form onSubmit={handleFacilitySubmit} className="space-y-3.5 text-xs">
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-2.5 text-amber-900 text-[11px] space-y-0.5">
                <div className="font-bold flex items-center gap-1 text-amber-950">
                  <Building2 className="w-3.5 h-3.5 text-amber-600" />
                  Healthcare Facility & Business Registration
                </div>
                <p>
                  Register or associate your pharmacy, hospital, clinic, or distribution business for EFDA compliance verification and wholesale credit lines.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Contact Phone Number *</label>
                  <input
                    type="text"
                    required
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    placeholder="e.g. +251 911 223 344"
                    className="w-full border border-slate-300 rounded-xl p-2 bg-slate-50 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">City / Town *</label>
                  <input
                    type="text"
                    required
                    value={regCity}
                    onChange={(e) => setRegCity(e.target.value)}
                    placeholder="e.g. Addis Ababa"
                    className="w-full border border-slate-300 rounded-xl p-2 bg-slate-50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Region</label>
                  <input
                    type="text"
                    value={regRegion}
                    onChange={(e) => setRegRegion(e.target.value)}
                    placeholder="e.g. Oromia / Amhara"
                    className="w-full border border-slate-300 rounded-xl p-2 bg-slate-50"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Physical Business Address</label>
                  <input
                    type="text"
                    value={regAddress}
                    onChange={(e) => setRegAddress(e.target.value)}
                    placeholder="e.g. Subcity 02, Ring Road"
                    className="w-full border border-slate-300 rounded-xl p-2 bg-slate-50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-slate-200">
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
                  className="rounded text-teal-600 focus:ring-teal-500 cursor-pointer"
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
                <span>{currentUser ? 'Associate Facility to Account' : 'Register Healthcare Facility'}</span>
              </button>
            </form>
          )}

          {/* MODE: FORGOT PASSWORD */}
          {mode === 'forgot_password' && (
            <form onSubmit={handleResetSubmit} className="space-y-4 text-xs">
              <p className="text-slate-600 leading-relaxed">
                Enter your registered email address below. We will send a secure password reset link and verification instructions.
              </p>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Account Email Address *</label>
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
