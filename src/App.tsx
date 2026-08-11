import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { QuotationDrawer } from './components/QuotationDrawer';
import { ProFormaInvoiceModal } from './components/ProFormaInvoiceModal';
import { EfdaVerificationModal } from './components/EfdaVerificationModal';
import { NewProductModal } from './components/NewProductModal';
import { B2BAuthModal } from './components/B2BAuthModal';
import { CallbackRequestModal } from './components/CallbackRequestModal';
import { NotificationCenterModal } from './components/NotificationCenterModal';

import { HomePage } from './pages/HomePage';
import { CatalogPage } from './pages/CatalogPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { CustomerPortalPage } from './pages/CustomerPortalPage';
import { SalesRepDashboardPage } from './pages/SalesRepDashboardPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { AboutContactPage } from './pages/AboutContactPage';

const MainContent: React.FC = () => {
  const { currentPage, toastMessage, isAuthModalOpen, setIsAuthModalOpen, authModalMode } = useApp();

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage />;
      case 'catalog':
        return <CatalogPage />;
      case 'product-detail':
        return <ProductDetailPage />;
      case 'customer-portal':
        return <CustomerPortalPage />;
      case 'sales-rep':
        return <SalesRepDashboardPage />;
      case 'admin':
        return <AdminDashboardPage />;
      case 'about-contact':
        return <AboutContactPage />;
      default:
        return <HomePage />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-900 antialiased selection:bg-teal-700 selection:text-white">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 max-w-md bg-slate-900 text-white rounded-xl p-4 shadow-2xl border border-slate-700 animate-in slide-in-from-bottom duration-200">
          <div className="font-bold text-sm text-teal-400">{toastMessage.title}</div>
          {toastMessage.desc && <div className="text-xs text-slate-300 mt-0.5">{toastMessage.desc}</div>}
        </div>
      )}

      {/* Main App Navigation */}
      <Navbar />

      {/* Page View Container */}
      <main className="flex-1">{renderPage()}</main>

      {/* Modals & Drawers */}
      <QuotationDrawer />
      <ProFormaInvoiceModal />
      <EfdaVerificationModal />
      <NewProductModal />
      <CallbackRequestModal />
      <NotificationCenterModal />
      <B2BAuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode={authModalMode}
      />

      {/* App Footer */}
      <Footer />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}
