'use client';

import React, { useEffect, useState } from 'react';
import CrmGuard from '@/components/CrmGuard';
import CrmHeader from '@/components/CrmHeader';
import { useCrmAuthStore } from '@/store/crmAuthStore';
import { getCrmSettings, updateCrmSettings } from '@/lib/api';
import {
  Settings,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export default function CrmSettingsPage() {
  const { restaurant } = useCrmAuthStore();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [openingHours, setOpeningHours] = useState('');
  const [isOpen, setIsOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (restaurant?._id) {
      setLoading(true);
      getCrmSettings(restaurant._id)
        .then((res: any) => {
          const s = res?.restaurant || res;
          if (s) {
            setName(s.name || '');
            setPhone(s.phone || '');
            setAddress(s.address || s.city || '');
            setOpeningHours(s.openingHours || '10:00 AM - 11:00 PM');
            setIsOpen(s.isOpen !== false);
          }
        })
        .catch((err: any) => setMessage({ type: 'error', text: err?.message || 'Failed to load settings' }))
        .finally(() => setLoading(false));
    }
  }, [restaurant?._id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!restaurant?._id) return;
    setSaving(true);
    setMessage(null);
    try {
      await updateCrmSettings(restaurant._id, {
        name,
        phone,
        address,
        openingHours,
        isOpen
      });
      setMessage({ type: 'success', text: 'Restaurant settings updated successfully.' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err?.message || 'Failed to update settings' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <CrmGuard allowedRoles={['RESTAURANT_ADMIN']}>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col transition-colors duration-150">
        <CrmHeader />

        <main className="flex-1 p-4 sm:p-6 max-w-3xl w-full mx-auto space-y-6">
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Restaurant Settings</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Operating hours, store contacts, and branch settings (Admin only).
            </p>
          </div>

          {message && (
            <div className={`p-4 rounded-xl text-xs flex items-center space-x-2 ${
              message.type === 'success'
                ? 'bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                : 'bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-300'
            }`}>
              {message.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-500 dark:text-red-400 shrink-0" />
              )}
              <span>{message.text}</span>
            </div>
          )}

          {/* Restaurant Details Form */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-xs">
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Restaurant Branch Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Store Contact Phone
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Branch Location / Address
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Shop 14, Main Market, City"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Operating Hours
                </label>
                <input
                  type="text"
                  value={openingHours}
                  onChange={(e) => setOpeningHours(e.target.value)}
                  placeholder="10:00 AM - 11:00 PM"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center space-x-2.5 pt-1">
                <input
                  type="checkbox"
                  id="isOpenToggle"
                  checked={isOpen}
                  onChange={(e) => setIsOpen(e.target.checked)}
                  className="w-4 h-4 rounded text-orange-600 border-slate-300 dark:border-slate-700 focus:ring-orange-500 cursor-pointer"
                />
                <label htmlFor="isOpenToggle" className="text-slate-800 dark:text-slate-200 font-semibold cursor-pointer">
                  Branch Open & Accepting Orders
                </label>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="submit"
                  disabled={saving || loading}
                  className="py-2.5 px-6 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-xl transition disabled:opacity-50 cursor-pointer shadow-xs"
                >
                  {saving ? 'Saving Settings...' : 'Save Settings'}
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </CrmGuard>
  );
}
