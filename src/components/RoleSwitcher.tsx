import React from 'react';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';
import { Shield, UserCheck, Briefcase, Building2, Eye, Award } from 'lucide-react';

export const RoleSwitcher: React.FC = () => {
  const { currentRole, switchRole, currentUser } = useApp();

  const roles: { role: UserRole; title: string; subtitle: string; icon: React.ReactNode; color: string }[] = [
    {
      role: 'public',
      title: 'Public Visitor',
      subtitle: 'Browse Catalog & Request Quotes',
      icon: <Eye className="w-4 h-4" />,
      color: 'border-slate-300 bg-slate-50 text-slate-700',
    },
    {
      role: 'verified_customer',
      title: 'Addis General Hospital',
      subtitle: 'Verified Customer (Credit Limit: 750k ETB)',
      icon: <Building2 className="w-4 h-4 text-emerald-600" />,
      color: 'border-emerald-500 bg-emerald-50 text-emerald-900',
    },
    {
      role: 'sales_rep',
      title: 'Sales Representative',
      subtitle: 'Lead Management & Quote Approvals',
      icon: <Briefcase className="w-4 h-4 text-blue-600" />,
      color: 'border-blue-500 bg-blue-50 text-blue-900',
    },
    {
      role: 'admin',
      title: 'Operations Admin',
      subtitle: 'Catalog, EFDA Queue & Analytics',
      icon: <Shield className="w-4 h-4 text-indigo-600" />,
      color: 'border-indigo-500 bg-indigo-50 text-indigo-900',
    },
  ];

  return (
    <div className="bg-slate-900 text-slate-100 border-b border-slate-800 text-xs px-4 py-2">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Award className="w-4 h-4 text-amber-400" />
          <span className="font-semibold text-slate-300">DEMO B2B PERSONA SWITCHER:</span>
          <span className="text-slate-400 hidden sm:inline">Switch views to test role permissions</span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {roles.map((r) => {
            const isActive = currentRole === r.role;
            return (
              <button
                key={r.role}
                onClick={() => switchRole(r.role)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all cursor-pointer ${
                  isActive
                    ? 'bg-amber-400 text-slate-950 font-bold shadow-sm'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
                }`}
                title={r.subtitle}
              >
                {r.icon}
                <span>{r.title}</span>
                {isActive && <UserCheck className="w-3 h-3 ml-0.5" />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
