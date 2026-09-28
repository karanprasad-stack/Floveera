'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { User, MapPin, CreditCard, Shield, Bell, LogOut, ShieldCheck, Store } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

export interface ProfileNavProps {
  activeSection?: string;
  onSectionChange?: (section: string) => void;
}

export const PROFILE_SECTIONS = [
  { id: 'personal', label: 'Personal Information', shortLabel: 'Personal Information', icon: User },
  { id: 'addresses', label: 'Saved Addresses', shortLabel: 'Saved Addresses', icon: MapPin },
  { id: 'payments', label: 'Payment Methods', shortLabel: 'Payment Methods', icon: CreditCard },
  { id: 'security', label: 'Security', shortLabel: 'Security', icon: Shield },
  { id: 'notifications', label: 'Notifications', shortLabel: 'Notifications', icon: Bell },
];

export default function ProfileNav({ activeSection, onSectionChange }: ProfileNavProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const currentSection = activeSection || searchParams.get('section') || 'personal';

  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to log out of your account?')) {
      await logout();
      router.push('/login');
    }
  };

  const handleSelectSection = (sectionId: string) => {
    if (onSectionChange) {
      onSectionChange(sectionId);
    }
    router.push(`/account/profile?section=${sectionId}`);
  };

  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : 'U';

  return (
    <>
      {/* Desktop Profile Sidebar */}
      <aside className="w-72 bg-white rounded-3xl border border-gray-100 shadow-card p-6 hidden lg:flex flex-col flex-shrink-0 self-start sticky top-24">
        {/* User Card Header */}
        <div className="flex items-center space-x-3.5 pb-6 border-b border-gray-100">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-orange to-amber-500 text-white flex items-center justify-center font-display font-black text-xl shadow-md shadow-brand-orange/20 flex-shrink-0">
            {userInitial}
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="font-display font-bold text-gray-900 text-base truncate">
              {user?.name || 'Customer Account'}
            </h2>
            <p className="text-xs text-gray-400 truncate mt-0.5">
              {user?.email || ''}
            </p>
          </div>
        </div>

        {/* Profile Settings Navigation (Strictly Profile Subsections Only) */}
        <div className="py-6 space-y-1.5 flex-1">
          <p className="text-[11px] font-bold tracking-wider text-gray-400 uppercase px-3 mb-3">
            Profile & Settings
          </p>

          {PROFILE_SECTIONS.map((sub) => {
            const Icon = sub.icon;
            const isActive = currentSection === sub.id;

            return (
              <button
                key={sub.id}
                onClick={() => handleSelectSection(sub.id)}
                className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold transition-all text-left ${
                  isActive
                    ? 'bg-brand-orange text-white font-bold shadow-sm shadow-brand-orange/20'
                    : 'text-gray-600 hover:text-brand-orange hover:bg-orange-50/50'
                }`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span>{sub.shortLabel}</span>
              </button>
            );
          })}
        </div>

        {/* Footer Actions */}
        <div className="pt-4 border-t border-gray-100">
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-2xl text-xs font-semibold text-red-600 hover:bg-red-50 active:scale-98 transition-all"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Mobile Profile Navigation */}
      <div className="lg:hidden w-full mb-6 space-y-2">
        <div className="bg-white p-3 rounded-2xl border border-gray-100 shadow-sm">
          <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
            Profile Section
          </label>
          <select
            value={currentSection}
            onChange={(e) => handleSelectSection(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 text-gray-800 text-xs sm:text-sm font-semibold rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-brand-orange"
          >
            {PROFILE_SECTIONS.map((sec) => (
              <option key={sec.id} value={sec.id}>
                {sec.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </>
  );
}
