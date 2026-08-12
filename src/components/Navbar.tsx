import React, { useState } from 'react';
import { useApp, PageView } from '../context/AppContext';
import { MelalaLogo } from './MelalaLogo';
import {

  FileText,
  ShoppingBag,
  PhoneCall,
  Search,
  ShieldCheck,
  Building2,
  Briefcase,
  SlidersHorizontal,
  Info,
  ChevronDown,
  Menu,
  X,
  Truck,
  PlusCircle,
  LogIn,
  UserPlus,
  LogOut,
  UserCheck,
  AlertCircle,
  Clock,
  Bell,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const {
    currentPage,
    setCurrentPage,
    currentRole,
    currentUser,
    logoutUser,
    openAuthModal,
    cartCount,
    cartSubtotalEtb,
    setIsQuoteDrawerOpen,
    setIsVerificationModalOpen,
    setIsNewProductModalOpen,
    setIsCallbackModalOpen,
    unreadNotificationCount,
    setIsNotificationModalOpen,
    searchQuery,
    setSearchQuery,
  } = useApp();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setCurrentPage('catalog');
    }
  };


  const navItems: { id: PageView; label: string; icon: React.ReactNode; showFor?: string[] }[] = [
    { id: 'home', label: 'Home', icon: <Building2 className="w-4 h-4" /> },
    { id: 'catalog', label: 'Product Catalog', icon: <SlidersHorizontal className="w-4 h-4" /> },
    {
      id: 'customer-portal',
      label: 'My Hospital / Orders',
      icon: <FileText className="w-4 h-4" />,
      showFor: ['verified_customer', 'public'],
    },
    {
      id: 'sales-rep',
      label: 'Sales Rep Portal',
      icon: <Briefcase className="w-4 h-4" />,
      showFor: ['sales_rep', 'admin'],
    },
    {
      id: 'admin',
      label: 'Admin Operations',
      icon: <ShieldCheck className="w-4 h-4" />,
      showFor: ['admin'],
    },
    { id: 'about-contact', label: 'About & Logistics', icon: <Info className="w-4 h-4" /> },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm">
      {/* Primary Brand & Contact Bar */}
      <div className="bg-slate-900 text-slate-200 border-b border-slate-800 text-xs px-4 py-2">

        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-4 text-slate-300">
            <span className="flex items-center gap-1 text-teal-400 font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" /> EFDA Licensed National Distributor: EFDA/WHOLESALE/2020/001
            </span>
            <span className="hidden md:flex items-center gap-1">
              <Truck className="w-3.5 h-3.5 text-blue-400" /> Cold-Chain Express to Addis, Adama, Hawassa, Bahir Dar
            </span>
          </div>

          <div className="flex items-center gap-4">
            <a
              href="tel:+251116639090"
              className="flex items-center gap-1.5 text-amber-300 hover:text-amber-200 font-medium"
            >
              <PhoneCall className="w-3.5 h-3.5 animate-pulse text-amber-400" />
              <span>Emergency Drug Dispatch: +251 11 663 9090</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Header Container */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setCurrentPage('home')}
            className="flex items-center gap-2.5 text-left cursor-pointer group"
          >
            <MelalaLogo variant="compact" size="md" />
          </button>
        </div>

        {/* Global Search Bar */}
        <form onSubmit={handleSearchSubmit} className="hidden lg:flex items-center flex-1 max-w-md mx-4">
          <div className="relative w-full">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search generic name, EFDA code, Rx medicines, medical supplies..."
              className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:bg-white transition-all"
            />
          </div>
        </form>

        {/* Actions & RFQ Cart */}
        <div className="flex items-center gap-2">
          {/* Status Badge & User Info */}
          {currentUser && currentUser.role !== 'public' ? (
            <div className="hidden sm:flex items-center gap-2 border border-slate-200 bg-slate-50 px-2.5 py-1 rounded-lg text-xs">
              <div className="text-left">
                <div className="font-bold text-slate-900 truncate max-w-[140px]">{currentUser.facilityName}</div>
                <div className="flex items-center gap-1 text-[10px]">
                  {currentUser.verificationStatus === 'APPROVED' && (
                    <span className="text-emerald-700 font-bold flex items-center gap-0.5">
                      <UserCheck className="w-3 h-3 text-emerald-600" /> APPROVED
                    </span>
                  )}
                  {currentUser.verificationStatus === 'UNDER_REVIEW' && (
                    <span className="text-amber-700 font-bold flex items-center gap-0.5">
                      <Clock className="w-3 h-3 text-amber-600" /> REVIEW
                    </span>
                  )}
                  {currentUser.verificationStatus === 'PENDING' && (
                    <span className="text-slate-600 font-semibold flex items-center gap-0.5">
                      <AlertCircle className="w-3 h-3 text-slate-500" /> PENDING
                    </span>
                  )}
                  {currentUser.verificationStatus === 'REJECTED' && (
                    <span className="text-red-700 font-bold flex items-center gap-0.5">
                      REJECTED
                    </span>
                  )}
                  {currentUser.verificationStatus === 'SUSPENDED' && (
                    <span className="text-red-800 font-extrabold flex items-center gap-0.5">
                      SUSPENDED
                    </span>
                  )}
                </div>
              </div>

              <button
                onClick={logoutUser}
                title="Sign Out"
                className="p-1 hover:bg-slate-200 rounded text-slate-500 hover:text-slate-900 cursor-pointer transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-1.5">
              <button
                onClick={() => openAuthModal('login')}
                className="px-2.5 py-1.5 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-lg text-xs font-semibold cursor-pointer transition-all flex items-center gap-1"
              >
                <LogIn className="w-3.5 h-3.5 text-teal-700" />
                <span>Sign In</span>
              </button>

              <button
                onClick={() => openAuthModal('signup')}
                className="px-2.5 py-1.5 border border-teal-600 text-teal-800 bg-teal-50/50 hover:bg-teal-100/80 rounded-lg text-xs font-semibold cursor-pointer transition-all flex items-center gap-1"
              >
                <UserPlus className="w-3.5 h-3.5 text-teal-700" />
                <span>Sign Up</span>
              </button>

              <button
                onClick={() => openAuthModal('register_facility')}
                className="px-3 py-1.5 bg-teal-800 hover:bg-teal-900 text-white rounded-lg text-xs font-semibold cursor-pointer transition-all flex items-center gap-1 shadow-2xs"
              >
                <Building2 className="w-3.5 h-3.5 text-amber-300" />
                <span>Register Facility</span>
              </button>
            </div>

          )}

          {/* Action Button depending on persona */}
          {currentRole === 'admin' && (
            <button
              onClick={() => setIsNewProductModalOpen(true)}
              className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold cursor-pointer shadow-xs transition-all"
            >
              <PlusCircle className="w-3.5 h-3.5 text-amber-400" />
              <span>Add Product</span>
            </button>
          )}

          {(!currentUser.efdaVerified || currentRole === 'public') && (
            <button
              onClick={() => setIsVerificationModalOpen(true)}
              className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 bg-teal-50 text-teal-800 border border-teal-200 hover:bg-teal-100 rounded-lg text-xs font-medium cursor-pointer transition-all"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-teal-700" />
              <span>Upload License</span>
            </button>
          )}

          {/* Notification Bell Center Button */}
          <button
            onClick={() => setIsNotificationModalOpen(true)}
            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold transition-all cursor-pointer relative border border-slate-200"
            title="Notification Architecture & Alert Log"
          >
            <Bell className="w-5 h-5 text-slate-700" />
            {unreadNotificationCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-teal-600 text-white font-extrabold text-[10px] rounded-full flex items-center justify-center border-2 border-white shadow-xs">
                {unreadNotificationCount}
              </span>
            )}
          </button>

          {/* Cart / RFQ Drawer Button */}
          <button
            onClick={() => setIsQuoteDrawerOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-lg text-xs font-semibold shadow-sm transition-all cursor-pointer relative"
          >
            <ShoppingBag className="w-4 h-4" />
            <div className="flex flex-col items-start text-left">
              <span className="leading-none">RFQ Cart</span>
              <span className="text-[10px] text-teal-200 font-normal">
                {cartCount > 0 ? `${cartSubtotalEtb.toLocaleString()} ETB` : 'Empty'}
              </span>
            </div>
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-amber-400 text-slate-950 font-bold text-[10px] rounded-full flex items-center justify-center border-2 border-white shadow-xs">
                {cartCount}
              </span>
            )}
          </button>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Main Navigation Tabs */}
      <nav className="bg-slate-50 border-t border-slate-200 px-4 hidden lg:block">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-1">
            {navItems.map((item) => {
              if (item.showFor && !item.showFor.includes(currentRole)) {
                return null;
              }
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentPage(item.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold transition-all border-b-2 cursor-pointer ${
                    isActive
                      ? 'border-teal-700 text-teal-800 bg-white shadow-xs'
                      : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          <div className="text-xs text-slate-500 font-medium py-2 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
            <span>EFDA Stock Sync Active</span>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 py-3 space-y-2">
          <form onSubmit={handleSearchSubmit} className="mb-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search catalog..."
                className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-9 pr-4 py-2 text-xs"
              />
            </div>
          </form>

          <div className="space-y-1">
            {navItems.map((item) => {
              if (item.showFor && !item.showFor.includes(currentRole)) {
                return null;
              }
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setCurrentPage(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-lg text-left ${
                    isActive ? 'bg-teal-700 text-white' : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
};
