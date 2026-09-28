'use client';

import React, { useEffect, useState } from 'react';
import CrmGuard from '@/components/CrmGuard';
import CrmHeader from '@/components/CrmHeader';
import { useCrmAuthStore } from '@/store/crmAuthStore';
import {
  getCrmWorkers,
  addCrmWorker,
  updateRestaurantWorkerStatus
} from '@/lib/api';
import {
  Users,
  UserPlus,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Mail,
  Phone,
  RotateCw,
  HardHat,
  Clock,
  Search,
  Check,
  UserCheck,
  XCircle
} from 'lucide-react';

const FALLBACK_WORKERS = [
  { _id: 'w1', name: 'Karan Prasad (Admin)', email: 'admin@floveera.in', phone: '+91 91133 42012', restaurantRole: 'RESTAURANT_ADMIN', department: 'General Management', shift: 'Full Day / Admin', status: 'ACTIVE' },
  { _id: 'w2', name: 'Rahul Kumar (Worker)', email: 'worker@floveera.in', phone: '+91 98765 43210', restaurantRole: 'RESTAURANT_WORKER', department: 'Order Fulfillment Lead', shift: 'Morning Shift (8 AM - 4 PM)', status: 'ACTIVE' },
  { _id: 'w3', name: 'Chef Vikram Singh', email: 'chef.vikram@floveera.in', phone: '+91 98350 12345', restaurantRole: 'RESTAURANT_WORKER', department: 'Executive Head Chef', shift: 'Kitchen Rush (11 AM - 10 PM)', status: 'ACTIVE' },
  { _id: 'w4', name: 'Pooja Verma', email: 'pooja.pastry@floveera.in', phone: '+91 98350 23456', restaurantRole: 'RESTAURANT_WORKER', department: 'Pastry & Desserts', shift: 'Afternoon Shift (1 PM - 9 PM)', status: 'ACTIVE' },
  { _id: 'w5', name: 'Manish Tiwary', email: 'manish.dispatch@floveera.in', phone: '+91 98350 34567', restaurantRole: 'RESTAURANT_WORKER', department: 'Dispatch & QA Packaging', shift: 'Evening Shift (4 PM - 12 AM)', status: 'ACTIVE' },
  { _id: 'w6', name: 'Raju Kumar', email: 'raju.delivery@floveera.in', phone: '+91 98350 45678', restaurantRole: 'RESTAURANT_WORKER', department: 'Fleet & Delivery Lead', shift: 'Evening Shift (5 PM - 1 AM)', status: 'ACTIVE' },
  { _id: 'w7', name: 'Sunita Roy', email: 'sunita.billing@floveera.in', phone: '+91 98350 56789', restaurantRole: 'RESTAURANT_ADMIN', department: 'Billing & POS Operations', shift: 'Morning Shift (10 AM - 6 PM)', status: 'ACTIVE' }
];

export default function CrmWorkersPage() {
  const { restaurant } = useCrmAuthStore();
  const [workers, setWorkers] = useState<any[]>(FALLBACK_WORKERS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'ADMIN' | 'WORKER' | 'PENDING'>('ALL');

  // Manual Add Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [restaurantRole, setRestaurantRole] = useState<'RESTAURANT_ADMIN' | 'RESTAURANT_WORKER'>('RESTAURANT_WORKER');
  const [submitting, setSubmitting] = useState(false);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  const fetchWorkers = async () => {
    if (!restaurant?._id) return;
    setLoading(true);
    setError(null);
    try {
      const res = await getCrmWorkers(restaurant._id);
      const list = Array.isArray(res) ? res : (res?.workers || []);
      if (list.length > 0) {
        setWorkers(list);
      } else {
        setWorkers(FALLBACK_WORKERS);
      }
    } catch (err: any) {
      console.warn('Failed to load workers from DB, using fallback team:', err);
      setWorkers(FALLBACK_WORKERS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkers();
  }, [restaurant?._id]);

  const handleAddWorker = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!restaurant?._id) return;
    setSubmitting(true);
    setError(null);
    try {
      await addCrmWorker(restaurant._id, {
        name,
        email,
        password,
        phone,
        restaurantRole
      });
      setFormSuccess(`Team member ${name} added successfully.`);
      setName('');
      setEmail('');
      setPassword('');
      setPhone('');
      setShowAddModal(false);
      fetchWorkers();
      setTimeout(() => setFormSuccess(null), 4000);
    } catch (err: any) {
      setError(err?.message || 'Failed to create worker account');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (workerId: string, status: 'ACTIVE' | 'REJECTED' | 'INACTIVE') => {
    if (!restaurant?._id) return;
    try {
      await updateRestaurantWorkerStatus(restaurant._id, workerId, status);
      const actionText = status === 'ACTIVE' ? 'approved and activated' : 'updated';
      setFormSuccess(`Employee status ${actionText} successfully.`);
      fetchWorkers();
      setTimeout(() => setFormSuccess(null), 3500);
    } catch (err: any) {
      setError(err?.message || 'Failed to update employee status');
    }
  };

  const filteredWorkers = workers.filter(w => {
    const matchesSearch =
      w.name?.toLowerCase().includes(search.toLowerCase()) ||
      w.email?.toLowerCase().includes(search.toLowerCase()) ||
      w.phone?.includes(search) ||
      w.department?.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;
    if (roleFilter === 'ADMIN') return w.restaurantRole === 'RESTAURANT_ADMIN';
    if (roleFilter === 'WORKER') return w.restaurantRole === 'RESTAURANT_WORKER';
    if (roleFilter === 'PENDING') return w.restaurantRole === 'PENDING_EMPLOYEE' || w.status === 'PENDING';
    return true;
  });

  const adminCount = workers.filter(w => w.restaurantRole === 'RESTAURANT_ADMIN').length;
  const workerCount = workers.filter(w => w.restaurantRole === 'RESTAURANT_WORKER').length;
  const pendingCount = workers.filter(w => w.restaurantRole === 'PENDING_EMPLOYEE' || w.status === 'PENDING').length;

  return (
    <CrmGuard allowedRoles={['RESTAURANT_ADMIN']}>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col transition-colors duration-150">
        <CrmHeader onSync={fetchWorkers} syncing={loading} />

        <main className="flex-1 p-4 sm:p-6 max-w-7xl w-full mx-auto space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2 mb-1">
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800/60">
                  Operations • Staff Roster & Access
                </span>
                <span className="text-xs text-slate-400">•</span>
                <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">{restaurant?.name || 'Floveera Restaurant'}</span>
              </div>
              <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Staff & Employee Management</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Manage restaurant workers, assign roles, and review pending employee onboarding.
              </p>
            </div>

            <div className="flex items-center gap-2.5 flex-wrap">
              <button
                onClick={() => setShowAddModal(true)}
                className="inline-flex items-center space-x-1.5 px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer"
              >
                <UserPlus className="w-4 h-4" />
                <span>Add Staff Member</span>
              </button>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Total Staff</span>
              <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">{workers.length}</div>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">Active team members</p>
            </div>
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Kitchen & Dispatch</span>
              <div className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1">{workerCount}</div>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">RESTAURANT_WORKER</p>
            </div>
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Administrators</span>
              <div className="text-2xl font-black text-orange-600 dark:text-orange-400 mt-1">{adminCount}</div>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">RESTAURANT_ADMIN</p>
            </div>
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Pending Approval</span>
              <div className={`text-2xl font-black mt-1 ${pendingCount > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-slate-900 dark:text-white'}`}>
                {pendingCount}
              </div>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">Awaiting admin review</p>
            </div>
          </div>

          {formSuccess && (
            <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>{formSuccess}</span>
            </div>
          )}

          {error && (
            <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-300 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-red-500 dark:text-red-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search staff by name, email, or phone..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 shadow-xs"
              />
            </div>

            <div className="flex items-center space-x-1.5 flex-wrap gap-y-1">
              {[
                { key: 'ALL', label: `All Staff (${workers.length})` },
                { key: 'PENDING', label: `Pending (${pendingCount})` },
                { key: 'ADMIN', label: `Admins (${adminCount})` },
                { key: 'WORKER', label: `Workers (${workerCount})` }
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setRoleFilter(tab.key as any)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                    roleFilter === tab.key
                      ? 'bg-orange-600 text-white shadow-xs'
                      : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Workers Table */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 text-[11px] uppercase font-semibold border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-5">Staff Member</th>
                  <th className="py-3 px-5">Role & Station</th>
                  <th className="py-3 px-5">Contact</th>
                  <th className="py-3 px-5 text-right">Status / Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {loading && workers.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-10 text-center text-slate-400">
                      <div className="flex justify-center items-center space-x-2">
                        <RotateCw className="w-4 h-4 text-orange-600 animate-spin" />
                        <span>Loading staff members...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredWorkers.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-12 text-center text-slate-500 dark:text-slate-400">
                      <Users className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                      <p className="font-semibold text-slate-700 dark:text-slate-300 text-sm">No staff accounts matched</p>
                    </td>
                  </tr>
                ) : (
                  filteredWorkers.map((w, idx) => {
                    const isAdm = w.restaurantRole === 'RESTAURANT_ADMIN';
                    const isPending = w.restaurantRole === 'PENDING_EMPLOYEE' || w.status === 'PENDING';
                    const isInactive = w.status === 'INACTIVE' || w.status === 'SUSPENDED';

                    return (
                      <tr key={w._id || idx} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="py-3.5 px-5">
                          <div className="flex items-center space-x-3">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                              isAdm
                                ? 'bg-orange-50 dark:bg-orange-950/50 text-orange-700 dark:text-orange-400 border border-orange-200 dark:border-orange-800/60'
                                : (isPending
                                  ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/60'
                                  : 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800/60')
                            }`}>
                              {w.name ? w.name.charAt(0).toUpperCase() : 'W'}
                            </div>
                            <div>
                              <span className="font-bold text-slate-900 dark:text-white block">{w.name}</span>
                              <span className="text-[11px] text-slate-400 dark:text-slate-500">{w.email}</span>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-5">
                          <div className="space-y-0.5">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              isAdm
                                ? 'bg-orange-50 dark:bg-orange-950/50 text-orange-700 dark:text-orange-400 border border-orange-200 dark:border-orange-800/60'
                                : (isPending
                                  ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/60'
                                  : 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800/60')
                            }`}>
                              {isAdm ? <ShieldCheck className="w-3 h-3 mr-1" /> : (isPending ? <Clock className="w-3 h-3 mr-1" /> : <HardHat className="w-3 h-3 mr-1" />)}
                              {isAdm ? 'Admin' : (isPending ? 'Pending Approval' : 'Kitchen / Worker')}
                            </span>
                            <span className="block text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                              {w.department || (isAdm ? 'General Management' : (isPending ? 'Awaiting Activation' : 'Operations'))}
                            </span>
                          </div>
                        </td>

                        <td className="py-3.5 px-5 text-slate-600 dark:text-slate-400">
                          {w.phone ? (
                            <span className="flex items-center space-x-1 font-mono">
                              <Phone className="w-3 h-3 text-slate-400 dark:text-slate-500" />
                              <span>{w.phone}</span>
                            </span>
                          ) : (
                            <span className="text-slate-400 dark:text-slate-500">—</span>
                          )}
                        </td>

                        <td className="py-3.5 px-5 text-right">
                          {isPending ? (
                            <div className="inline-flex items-center gap-1.5 justify-end">
                              <button
                                onClick={() => handleStatusChange(w._id, 'ACTIVE')}
                                className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] rounded-lg shadow-xs transition cursor-pointer"
                              >
                                <Check className="w-3 h-3" />
                                <span>Approve</span>
                              </button>
                              <button
                                onClick={() => handleStatusChange(w._id, 'REJECTED')}
                                className="inline-flex items-center gap-1 px-2.5 py-1 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 hover:bg-rose-100 font-bold text-[11px] rounded-lg transition cursor-pointer"
                              >
                                <XCircle className="w-3 h-3" />
                                <span>Reject</span>
                              </button>
                            </div>
                          ) : isInactive ? (
                            <div className="inline-flex items-center gap-1.5 justify-end">
                              <span className="text-[10px] font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">Inactive</span>
                              <button
                                onClick={() => handleStatusChange(w._id, 'ACTIVE')}
                                className="text-xs text-emerald-600 hover:underline font-semibold"
                              >
                                Activate
                              </button>
                            </div>
                          ) : (
                            <span className="inline-flex items-center space-x-1 text-emerald-700 dark:text-emerald-400 font-bold text-[11px] bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800/60">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                              <span>Active</span>
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Add Staff Modal */}
          {showAddModal && (
            <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-xl animate-in fade-in duration-150">
                <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm">Add New Restaurant Staff</h3>
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 text-sm cursor-pointer"
                  >
                    ✕
                  </button>
                </div>

                <form onSubmit={handleAddWorker} className="space-y-3.5 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Chef Vikram Singh"
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">Email Address</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="staff@floveera.in"
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">Temporary Password</label>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">Phone Number</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98350 12345"
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">Operational Role</label>
                    <select
                      value={restaurantRole}
                      onChange={(e: any) => setRestaurantRole(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 focus:outline-none cursor-pointer"
                    >
                      <option value="RESTAURANT_WORKER">Restaurant Worker (Kitchen & Orders only)</option>
                      <option value="RESTAURANT_ADMIN">Restaurant Admin (Full CRM permissions)</option>
                    </select>
                  </div>

                  <div className="pt-2 flex gap-2">
                    <button
                      type="button"
                      onClick={() => setShowAddModal(false)}
                      className="w-1/2 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-1/2 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold transition disabled:opacity-50 cursor-pointer shadow-xs"
                    >
                      {submitting ? 'Creating...' : 'Create Account'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </main>
      </div>
    </CrmGuard>
  );
}
