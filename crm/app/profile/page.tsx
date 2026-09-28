'use client';

import React, { useState, useEffect } from 'react';
import CrmGuard from '@/components/CrmGuard';
import CrmHeader from '@/components/CrmHeader';
import { useCrmAuthStore } from '@/store/crmAuthStore';
import { getCrmMyProfile, updateCrmMyProfile, updateCrmMyPassword } from '@/lib/api';
import {
  UserCheck,
  Key,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  LogOut,
  Store,
  HardHat,
  Building2
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function CrmProfilePage() {
  const router = useRouter();
  const { user, restaurant, role, logout } = useCrmAuthStore();

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [email, setEmail] = useState(user?.email || '');

  // Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [profileMessage, setProfileMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [passwordMessage, setPasswordMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (restaurant?._id) {
      getCrmMyProfile(restaurant._id)
        .then((res: any) => {
          const profileData = res?.user || res;
          if (profileData) {
            setName(profileData.name || '');
            setPhone(profileData.phone || '');
            setEmail(profileData.email || '');
          }
        })
        .catch((err: any) => console.error('Error fetching profile:', err));
    }
  }, [restaurant?._id]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!restaurant?._id) return;
    setSavingProfile(true);
    setProfileMessage(null);
    try {
      const res = await updateCrmMyProfile(restaurant._id, { 
        name, 
        phone: phone.trim() || undefined,
        email: email.trim() || undefined
      });
      setProfileMessage({ type: 'success', text: 'Personal details updated successfully.' });
      const updatedUser = res?.user || res;
      if (updatedUser) {
        setName(updatedUser.name || '');
        setPhone(updatedUser.phone || '');
        setEmail(updatedUser.email || '');
        useCrmAuthStore.getState().updateUser({
          name: updatedUser.name,
          phone: updatedUser.phone,
          email: updatedUser.email
        });
      }
    } catch (err: any) {
      setProfileMessage({ type: 'error', text: err?.message || 'Failed to update personal profile' });
    } finally {
      setSavingProfile(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!restaurant?._id) return;
    if (newPassword.length < 6) {
      setPasswordMessage({ type: 'error', text: 'New password must be at least 6 characters.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: 'error', text: 'New passwords do not match.' });
      return;
    }

    setSavingPassword(true);
    setPasswordMessage(null);
    try {
      await updateCrmMyPassword(restaurant._id, currentPassword, newPassword);
      setPasswordMessage({ type: 'success', text: 'Password changed successfully.' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setPasswordMessage({ type: 'error', text: err?.message || 'Failed to update password' });
    } finally {
      setSavingPassword(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.replace('/login');
  };

  const isAdmin = role === 'RESTAURANT_ADMIN';
  const displayEmail = email && !email.includes('@floveera.worker.internal') && !email.includes('@flovera.worker.internal') ? email : 'Not added';

  return (
    <CrmGuard allowedRoles={['RESTAURANT_ADMIN', 'RESTAURANT_WORKER']}>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col transition-colors duration-150">
        <CrmHeader />

        <main className="flex-1 p-4 sm:p-6 max-w-4xl w-full mx-auto space-y-6">
          {/* Header Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 rounded-2xl bg-orange-600 text-white flex items-center justify-center font-black text-xl shadow-xs shrink-0">
                {name ? name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div>
                <div className="flex items-center space-x-2 mb-1.5 flex-wrap gap-y-1">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    isAdmin 
                      ? 'bg-orange-50 dark:bg-orange-950/60 text-orange-700 dark:text-orange-400 border border-orange-200 dark:border-orange-800/80' 
                      : 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800/80'
                  }`}>
                    {isAdmin ? <ShieldCheck className="w-3 h-3 mr-1" /> : <HardHat className="w-3 h-3 mr-1" />}
                    {isAdmin ? 'Restaurant Admin' : 'Restaurant Worker'}
                  </span>
                  <span className="text-xs text-slate-400">•</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">{restaurant?.name || 'Floveera Restaurant'}</span>
                </div>
                <h1 className="text-xl font-black text-slate-900 dark:text-white">{name || 'CRM Staff User'}</h1>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 dark:text-slate-400 mt-1">
                  <span><strong className="text-slate-700 dark:text-slate-300">Email:</strong> {displayEmail}</span>
                  <span>•</span>
                  <span><strong className="text-slate-700 dark:text-slate-300">Mobile:</strong> {phone || 'Not added'}</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="inline-flex items-center space-x-1.5 px-4 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 dark:hover:bg-rose-900/60 border border-rose-200 dark:border-rose-800 rounded-xl transition cursor-pointer self-start sm:self-auto"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>

          {/* Employee Profile Overview (Full Name, Mobile, Email, Role, Restaurant) */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
            <h2 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
              Employee Profile Details
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 text-xs">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800">
                <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-0.5">Full Name</span>
                <span className="font-bold text-slate-900 dark:text-white truncate block">{name || 'Not added'}</span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800">
                <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-0.5">Mobile Number</span>
                <span className="font-bold text-slate-900 dark:text-white truncate block">{phone || 'Not added'}</span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800">
                <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-0.5">Email</span>
                <span className={`font-bold truncate block ${displayEmail === 'Not added' ? 'text-amber-600 dark:text-amber-400 font-medium' : 'text-slate-900 dark:text-white'}`}>
                  {displayEmail}
                </span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800">
                <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-0.5">Role</span>
                <span className="font-bold text-slate-900 dark:text-white truncate block">{isAdmin ? 'Restaurant Admin' : 'Restaurant Worker'}</span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800">
                <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-0.5">Restaurant</span>
                <span className="font-bold text-slate-900 dark:text-white truncate block">{restaurant?.name || 'Floveera Restaurant'}</span>
              </div>
            </div>
          </div>

          {/* Two Forms: Personal Info & Security */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Personal Details */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-xs space-y-4">
              <div className="flex items-center space-x-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                <UserCheck className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                <h2 className="font-bold text-slate-900 dark:text-white text-sm">Personal Information</h2>
              </div>

              {profileMessage && (
                <div className={`p-3 rounded-xl text-xs flex items-center space-x-2 ${
                  profileMessage.type === 'success'
                    ? 'bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                    : 'bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-300'
                }`}>
                  {profileMessage.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-500 dark:text-red-400 shrink-0" />
                  )}
                  <span>{profileMessage.text}</span>
                </div>
              )}

              <form onSubmit={handleUpdateProfile} className="space-y-3.5 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Full Name
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
                    Assigned Role
                  </label>
                  <input
                    type="text"
                    value={isAdmin ? 'Restaurant Admin' : 'Restaurant Worker'}
                    disabled
                    className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-300 font-medium text-xs cursor-not-allowed font-semibold"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={(email.includes('@floveera.worker.internal') || email.includes('@flovera.worker.internal')) ? '' : email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Add your email"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 focus:outline-none"
                  />
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
                    Optional. Once added, you can sign in using your email address or mobile number.
                  </p>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Mobile Number
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    required
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 focus:outline-none"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={savingProfile}
                    className="w-full py-2.5 px-4 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-xl text-xs transition disabled:opacity-50 cursor-pointer shadow-xs"
                  >
                    {savingProfile ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>

            {/* Change Password */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-xs space-y-4">
              <div className="flex items-center space-x-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                <Key className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <h2 className="font-bold text-slate-900 dark:text-white text-sm">Security & Password</h2>
              </div>

              {passwordMessage && (
                <div className={`p-3 rounded-xl text-xs flex items-center space-x-2 ${
                  passwordMessage.type === 'success'
                    ? 'bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                    : 'bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-300'
                }`}>
                  {passwordMessage.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-500 dark:text-red-400 shrink-0" />
                  )}
                  <span>{passwordMessage.text}</span>
                </div>
              )}

              <form onSubmit={handleUpdatePassword} className="space-y-3.5 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Current Password
                  </label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 focus:outline-none"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={savingPassword}
                    className="w-full py-2.5 px-4 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white font-bold rounded-xl text-xs transition disabled:opacity-50 cursor-pointer"
                  >
                    {savingPassword ? 'Updating Password...' : 'Update Password'}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Assigned Workspace info */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 shadow-xs">
            <div className="flex items-center space-x-3">
              <Store className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              <div>
                <span className="font-bold text-slate-900 dark:text-white block">Assigned Restaurant Branch</span>
                <span>{restaurant?.name || 'Floveera Restaurant Branch'} ({restaurant?._id})</span>
              </div>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 font-bold border border-emerald-200 dark:border-emerald-800/80">
              Active Tenant
            </span>
          </div>
        </main>
      </div>
    </CrmGuard>
  );
}
