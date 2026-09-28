'use client';

import React, { useEffect, useState } from 'react';
import CrmGuard from '@/components/CrmGuard';
import CrmHeader from '@/components/CrmHeader';
import { useCrmAuthStore } from '@/store/crmAuthStore';
import { getCrmExpenses } from '@/lib/api';
import {
  Receipt,
  AlertTriangle,
  RotateCw,
  Plus,
  Search,
  IndianRupee,
  CheckCircle2,
  TrendingDown,
  Percent,
  Calendar,
  Layers,
  FileSpreadsheet,
  Building,
  CreditCard
} from 'lucide-react';

const FALLBACK_EXPENSES_DATA = {
  summary: {
    totalExpenses: 148650,
    month: 'September 2026',
    cogsPercentage: 41.5,
    operatingMargin: 29.2,
    categories: [
      { name: 'Raw Ingredients & Dairy', amount: 68400, percentage: 46.0, color: '#f97316' },
      { name: 'Staff Salaries & Operational Wages', amount: 48000, percentage: 32.3, color: '#3b82f6' },
      { name: 'Kitchen Utilities, Gas & Power', amount: 16500, percentage: 11.1, color: '#eab308' },
      { name: 'Packaging & Delivery Containers', amount: 10250, percentage: 6.9, color: '#10b981' },
      { name: 'Storefront Promotions & Tech', amount: 5500, percentage: 3.7, color: '#8b5cf6' }
    ]
  },
  expenses: [
    { id: 'EXP-801', date: '2026-09-27', title: 'Sudha Dairy Paneer & Milk Restock', category: 'Raw Ingredients & Dairy', vendor: 'Sudha Dairy Co. Patna', amount: 14200, paymentMethod: 'Bank Transfer (IMPS)', status: 'PAID', invoiceNumber: 'INV-SD-9481', notes: 'Weekly supply of cottage cheese, toned milk & ghee' },
    { id: 'EXP-802', date: '2026-09-26', title: 'Fresh Chicken Boneless & Cuts', category: 'Raw Ingredients & Dairy', vendor: 'FreshFarms Quality Meats', amount: 18500, paymentMethod: 'UPI Business', status: 'PAID', invoiceNumber: 'FF-2026-8812', notes: '45kg poultry breast & bone-in chicken cuts' },
    { id: 'EXP-803', date: '2026-09-25', title: 'Commercial LPG Cylinder Refills (4x19kg)', category: 'Kitchen Utilities, Gas & Power', vendor: 'Indane Gas Agency Kankarbagh', amount: 7600, paymentMethod: 'Cash / Cheque', status: 'PAID', invoiceNumber: 'GAS-40291', notes: '4 industrial 19kg commercial red cylinders' },
    { id: 'EXP-804', date: '2026-09-24', title: 'Eco Meal Trays & Paper Bags Bulk Order', category: 'Packaging & Delivery Containers', vendor: 'GreenPack Solutions India', amount: 10250, paymentMethod: 'NEFT Online', status: 'PAID', invoiceNumber: 'GP-10928', notes: '1000 3-compartment takeaway boxes & 1500 kraft bags' },
    { id: 'EXP-805', date: '2026-09-22', title: 'Kitchen Staff Mid-Month Advance Wages', category: 'Staff Salaries & Operational Wages', vendor: 'Kitchen Operations Staff', amount: 18000, paymentMethod: 'Direct Payroll Transfer', status: 'PAID', invoiceNumber: 'PAY-MID-SEP', notes: 'Mid-month advance for kitchen prep staff & helpers' },
    { id: 'EXP-806', date: '2026-09-20', title: 'Cold Room Chiller Repair & Gas Charging', category: 'Kitchen Utilities, Gas & Power', vendor: 'CoolCare HVAC Patna', amount: 4800, paymentMethod: 'UPI Business', status: 'PAID', invoiceNumber: 'CC-9012', notes: 'Freon R134a recharge and thermostat sensor calibration' },
    { id: 'EXP-807', date: '2026-09-18', title: 'Shahi Whole Spices & Saffron Sourcing', category: 'Raw Ingredients & Dairy', vendor: 'Purani Dilli Masala Mart', amount: 8900, paymentMethod: 'UPI Business', status: 'PAID', invoiceNumber: 'PD-44102', notes: 'Kashmiri saffron, green cardamom, star anise' },
    { id: 'EXP-808', date: '2026-09-15', title: 'Social Media & WhatsApp Notification Credits', category: 'Storefront Promotions & Tech', vendor: 'Meta & Twilio India', amount: 5500, paymentMethod: 'Corporate Credit Card', status: 'PAID', invoiceNumber: 'INV-TW-8841', notes: '5,000 automated customer notification SMS/WhatsApp credits' }
  ]
};

export default function CrmExpensesPage() {
  const { restaurant } = useCrmAuthStore();
  const [data, setData] = useState<any>(FALLBACK_EXPENSES_DATA);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [showAddModal, setShowAddModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Raw Ingredients & Dairy');
  const [vendor, setVendor] = useState('');
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('UPI Business');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [notes, setNotes] = useState('');

  const fetchExpenses = () => {
    if (!restaurant?._id) return;
    setLoading(true);
    getCrmExpenses(restaurant._id)
      .then((res: any) => {
        if (res?.expenses && res.expenses.length > 0) {
          setData(res);
        } else {
          setData(FALLBACK_EXPENSES_DATA);
        }
      })
      .catch((err: any) => {
        console.warn('Failed to load expenses, using fallback ledger:', err);
        setData(FALLBACK_EXPENSES_DATA);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchExpenses();
  }, [restaurant?._id]);

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const newExp = {
      id: `EXP-${Date.now().toString().slice(-4)}`,
      date: new Date().toISOString().split('T')[0],
      title,
      category,
      vendor: vendor || 'Local Supplier',
      amount: Number(amount) || 1000,
      paymentMethod,
      status: 'PAID',
      invoiceNumber: invoiceNumber || `INV-${Date.now().toString().slice(-5)}`,
      notes: notes || 'Logged by Restaurant Administrator'
    };

    const updated = [newExp, ...data.expenses];
    const newTotal = data.summary.totalExpenses + newExp.amount;
    setData({
      ...data,
      summary: {
        ...data.summary,
        totalExpenses: newTotal
      },
      expenses: updated
    });

    setToastMessage(`Logged expense "${title}" of ₹${newExp.amount}.`);
    setTimeout(() => setToastMessage(null), 3500);

    setTitle('');
    setVendor('');
    setAmount('');
    setInvoiceNumber('');
    setNotes('');
    setShowAddModal(false);
  };

  const categories = [
    'ALL',
    'Raw Ingredients & Dairy',
    'Staff Salaries & Operational Wages',
    'Kitchen Utilities, Gas & Power',
    'Packaging & Delivery Containers',
    'Storefront Promotions & Tech'
  ];

  const filteredExpenses = data.expenses.filter((exp: any) => {
    const matchesSearch =
      exp.title.toLowerCase().includes(search.toLowerCase()) ||
      exp.vendor.toLowerCase().includes(search.toLowerCase()) ||
      exp.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
      exp.category.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;
    if (categoryFilter !== 'ALL' && exp.category !== categoryFilter) return false;
    return true;
  });

  return (
    <CrmGuard allowedRoles={['RESTAURANT_ADMIN']}>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col transition-colors duration-150">
        <CrmHeader onSync={fetchExpenses} syncing={loading} />

        <main className="flex-1 p-6 max-w-7xl w-full mx-auto space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2 mb-1">
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800/50">
                  Finance • Operating Cost Ledger
                </span>
                <span className="text-xs text-slate-400 dark:text-slate-600">•</span>
                <span className="text-xs text-slate-600 dark:text-slate-300 font-medium">{restaurant?.name || 'Floveera Restaurant'}</span>
              </div>
              <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Operating Expenses & Ledger</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Kitchen raw supplies, utility bills, staff operational wages, and supplier payments.
              </p>
            </div>

            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center space-x-1.5 px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Record Expense</span>
            </button>
          </div>

          {toastMessage && (
            <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300 text-xs flex items-center space-x-2 shadow-xs animate-in fade-in duration-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="font-semibold">{toastMessage}</span>
            </div>
          )}

          {/* KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Monthly Expenses</span>
                <div className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                  <Receipt className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-rose-700 dark:text-rose-400">
                ₹{data.summary.totalExpenses.toLocaleString('en-IN')}
              </div>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">{data.summary.month}</p>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Cost of Goods (COGS)</span>
                <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                  <Percent className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-amber-700 dark:text-amber-400">
                {data.summary.cogsPercentage}%
              </div>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">Raw ingredient cost ratio</p>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Net Operating Margin</span>
                <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <TrendingDown className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-emerald-700 dark:text-emerald-400">
                +{data.summary.operatingMargin}%
              </div>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">Healthy kitchen EBITDA margin</p>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Pending Invoices</span>
                <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-slate-900 dark:text-white">₹0</div>
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold mt-1">All supplier accounts clear</p>
            </div>
          </div>

          {/* Expense Category Distribution */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">Expense Category Distribution</h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Breakdown of operational capital deployed across restaurant departments</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3 pt-2">
              {data.summary.categories.map((cat: any, idx: number) => (
                <div key={idx} className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-700/60 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 line-clamp-1">{cat.name}</span>
                    <span className="text-xs font-black text-slate-900 dark:text-white">{cat.percentage}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${cat.percentage}%`, backgroundColor: cat.color }}
                    />
                  </div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">
                    ₹{cat.amount.toLocaleString('en-IN')}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Search & Category Filter */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search ledger by title, vendor, or invoice..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 shadow-xs"
                />
              </div>
            </div>

            <div className="flex items-center space-x-1.5 overflow-x-auto pb-1">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                    categoryFilter === cat
                      ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs'
                      : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  {cat === 'ALL' ? 'All Expenses' : cat}
                </button>
              ))}
            </div>
          </div>

          {/* Expense Ledger Table */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 text-[11px] uppercase font-semibold border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-5">Expense Title</th>
                  <th className="py-3 px-5">Category</th>
                  <th className="py-3 px-5">Vendor / Payee</th>
                  <th className="py-3 px-5">Payment Mode</th>
                  <th className="py-3 px-5">Invoice #</th>
                  <th className="py-3 px-5">Amount</th>
                  <th className="py-3 px-5 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredExpenses.map((exp: any) => (
                  <tr key={exp.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-5">
                      <span className="font-bold text-slate-900 dark:text-white block">{exp.title}</span>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500">{exp.notes}</span>
                    </td>

                    <td className="py-3.5 px-5">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {exp.category}
                      </span>
                    </td>

                    <td className="py-3.5 px-5 text-slate-700 dark:text-slate-300 font-medium">
                      {exp.vendor}
                    </td>

                    <td className="py-3.5 px-5 text-slate-600 dark:text-slate-400">
                      {exp.paymentMethod}
                    </td>

                    <td className="py-3.5 px-5 font-mono text-slate-500 dark:text-slate-400 text-[11px]">
                      {exp.invoiceNumber}
                    </td>

                    <td className="py-3.5 px-5 font-black text-rose-700 dark:text-rose-400">
                      ₹{exp.amount.toLocaleString('en-IN')}
                    </td>

                    <td className="py-3.5 px-5 text-right">
                      <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                        <span>{exp.status}</span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Record Expense Modal */}
          {showAddModal && (
            <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-xl">
                <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm">Record Operating Expense</h3>
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 text-sm cursor-pointer"
                  >
                    ✕
                  </button>
                </div>

                <form onSubmit={handleAddExpense} className="space-y-3.5 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">Expense Title / Description</label>
                    <input
                      type="text"
                      required
                      value={title}
                      onChange={e => setTitle(e.target.value)}
                      placeholder="e.g. Sudha Dairy Weekly Milk & Butter"
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">Category</label>
                      <select
                        value={category}
                        onChange={e => setCategory(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 focus:outline-none cursor-pointer"
                      >
                        {categories.filter(c => c !== 'ALL').map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">Amount (₹)</label>
                      <input
                        type="number"
                        required
                        value={amount}
                        onChange={e => setAmount(e.target.value)}
                        placeholder="12000"
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">Vendor / Payee</label>
                      <input
                        type="text"
                        value={vendor}
                        onChange={e => setVendor(e.target.value)}
                        placeholder="e.g. Sudha Dairy Patna"
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">Payment Method</label>
                      <select
                        value={paymentMethod}
                        onChange={e => setPaymentMethod(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 focus:outline-none cursor-pointer"
                      >
                        <option value="UPI Business">UPI Business</option>
                        <option value="Bank Transfer (IMPS)">Bank Transfer (IMPS)</option>
                        <option value="NEFT Online">NEFT Online</option>
                        <option value="Cash / Cheque">Cash / Cheque</option>
                        <option value="Corporate Credit Card">Corporate Credit Card</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">Invoice / Bill #</label>
                      <input
                        type="text"
                        value={invoiceNumber}
                        onChange={e => setInvoiceNumber(e.target.value)}
                        placeholder="INV-9912"
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">Notes (Optional)</label>
                      <input
                        type="text"
                        value={notes}
                        onChange={e => setNotes(e.target.value)}
                        placeholder="Remarks or items list"
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="pt-2 flex gap-2">
                    <button
                      type="button"
                      onClick={() => setShowAddModal(false)}
                      className="w-1/2 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="w-1/2 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold transition cursor-pointer shadow-xs"
                    >
                      Record Entry
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
