'use client';

import React, { useEffect, useState, useMemo } from 'react';
import CrmGuard from '@/components/CrmGuard';
import CrmHeader from '@/components/CrmHeader';
import { useCrmAuthStore } from '@/store/crmAuthStore';
import {
  getCrmInventory,
  consumeCrmInventoryItem,
  restockCrmInventoryItem,
  createCrmInventoryItem,
  getCrmInventoryTransactions
} from '@/lib/api';
import {
  Boxes,
  AlertTriangle,
  RotateCw,
  Search,
  Plus,
  CheckCircle2,
  Package,
  Layers,
  ArrowUpDown,
  Truck,
  IndianRupee,
  RefreshCw,
  UtensilsCrossed,
  Clock,
  History,
  MinusCircle,
  X,
  FileText,
  User,
  ShieldAlert,
  ArrowDownRight,
  ArrowUpRight,
  Check,
  Calendar,
  Sparkles,
  ClipboardList,
  Flame,
  ChefHat
} from 'lucide-react';

const CATEGORIES = [
  'ALL',
  'Grains & Staples',
  'Dairy',
  'Poultry & Meat',
  'Fresh Produce',
  'Spices',
  'Packaging'
];

const QUICK_REASONS = [
  'Lunch Service Prep',
  'Dinner Service Prep',
  'Biryani Batch Cooking',
  'Curry & Gravy Base',
  'Tandoor Marination',
  'Salad & Fresh Garnish',
  'Kitchen Wastage / Spoilage'
];

export default function CrmInventoryPage() {
  const { user, restaurant, role } = useCrmAuthStore();
  const isAdmin = role === 'RESTAURANT_ADMIN';
  const isManager = role === 'RESTAURANT_MANAGER' || (user as any)?.role === 'MANAGER';
  const isWorker = role === 'RESTAURANT_WORKER';
  const canManageStock = isAdmin || isManager;

  // Tabs: 'items' (Raw Material Stock) | 'transactions' (Consumption & Audit History)
  const [activeTab, setActiveTab] = useState<'items' | 'transactions'>('items');

  // Inventory list state
  const [inventory, setInventory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'LOW' | 'OPTIMAL'>('ALL');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Transactions state
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loadingTransactions, setLoadingTransactions] = useState(false);
  const [isPersonalLog, setIsPersonalLog] = useState(false);

  // Modal 1: Record Raw Material Usage
  const [usageModalItem, setUsageModalItem] = useState<any | null>(null);
  const [usageQuantity, setUsageQuantity] = useState('');
  const [usageReason, setUsageReason] = useState('');
  const [usageError, setUsageError] = useState<string | null>(null);
  const [submittingUsage, setSubmittingUsage] = useState(false);

  // Modal 2: Stock Replenishment (Admin & Manager)
  const [restockModalItem, setRestockModalItem] = useState<any | null>(null);
  const [restockQuantity, setRestockQuantity] = useState('');
  const [restockSupplier, setRestockSupplier] = useState('');
  const [restockReason, setRestockReason] = useState('');
  const [restockError, setRestockError] = useState<string | null>(null);
  const [submittingRestock, setSubmittingRestock] = useState(false);

  // Modal 3: Add Stock Item (Admin only)
  const [showAddModal, setShowAddModal] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemCategory, setNewItemCategory] = useState('Grains & Staples');
  const [newItemStock, setNewItemStock] = useState('');
  const [newItemThreshold, setNewItemThreshold] = useState('');
  const [newItemUnit, setNewItemUnit] = useState('kg');
  const [newItemCost, setNewItemCost] = useState('');
  const [newItemSupplier, setNewItemSupplier] = useState('');
  const [addError, setAddError] = useState<string | null>(null);
  const [submittingAdd, setSubmittingAdd] = useState(false);

  // Fetch Inventory from API
  const fetchInventory = async () => {
    if (!restaurant?._id) return;
    setLoading(true);
    setError(null);
    try {
      const res = await getCrmInventory(restaurant._id);
      const items = res?.items || (Array.isArray(res) ? res : []);
      setInventory(items);
    } catch (err: any) {
      console.error('Inventory fetch error:', err);
      setError(err?.message || 'Failed to fetch inventory records');
    } finally {
      setLoading(false);
    }
  };

  // Fetch Consumption History Transactions from API
  const fetchTransactions = async () => {
    if (!restaurant?._id) return;
    setLoadingTransactions(true);
    try {
      const res = await getCrmInventoryTransactions(restaurant._id);
      setTransactions(res?.transactions || []);
      setIsPersonalLog(!!res?.isPersonalLog);
    } catch (err: any) {
      console.error('Fetch transactions error:', err);
    } finally {
      setLoadingTransactions(false);
    }
  };

  useEffect(() => {
    if (restaurant?._id) {
      fetchInventory();
      fetchTransactions();
    }
  }, [restaurant?._id]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4500);
  };

  // Handle Record Usage Submission (Atomic consumption)
  const handleConfirmUsage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!usageModalItem || !restaurant?._id) return;

    const qty = parseFloat(usageQuantity);
    if (isNaN(qty) || qty <= 0) {
      setUsageError('Please enter a valid quantity greater than zero');
      return;
    }
    if (qty > usageModalItem.stock) {
      setUsageError(`Quantity exceeds available stock of ${usageModalItem.stock} ${usageModalItem.unit}`);
      return;
    }

    setSubmittingUsage(true);
    setUsageError(null);

    try {
      const res = await consumeCrmInventoryItem(restaurant._id, usageModalItem._id, {
        quantity: qty,
        reason: usageReason.trim() || 'Kitchen cooking & prep'
      });

      // Update state immediately with new stock from server
      const updatedItem = res.item;
      setInventory(prev =>
        prev.map(i => (i._id === updatedItem._id ? { ...i, ...updatedItem } : i))
      );

      // Refresh transactions log
      fetchTransactions();

      showToast(
        res.message ||
          `${qty} ${usageModalItem.unit} of ${usageModalItem.name} usage recorded successfully. Remaining stock: ${updatedItem.stock} ${usageModalItem.unit}.`
      );

      // Close modal
      setUsageModalItem(null);
      setUsageQuantity('');
      setUsageReason('');
    } catch (err: any) {
      console.error('Failed to record consumption:', err);
      setUsageError(err?.message || 'Failed to record usage. Please try again.');
    } finally {
      setSubmittingUsage(false);
    }
  };

  // Handle Restock Submission (Admin & Manager)
  const handleConfirmRestock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!restockModalItem || !restaurant?._id) return;

    const qty = parseFloat(restockQuantity);
    if (isNaN(qty) || qty <= 0) {
      setRestockError('Please enter a valid replenishment quantity greater than zero');
      return;
    }

    setSubmittingRestock(true);
    setRestockError(null);

    try {
      const res = await restockCrmInventoryItem(restaurant._id, restockModalItem._id, {
        quantity: qty,
        supplier: restockSupplier.trim() || restockModalItem.supplier,
        reason: restockReason.trim() || 'Shipment received'
      });

      const updatedItem = res.item;
      setInventory(prev =>
        prev.map(i => (i._id === updatedItem._id ? { ...i, ...updatedItem } : i))
      );

      fetchTransactions();

      showToast(
        res.message ||
          `Restocked ${qty} ${restockModalItem.unit} of ${restockModalItem.name}. New stock: ${updatedItem.stock} ${restockModalItem.unit}.`
      );

      setRestockModalItem(null);
      setRestockQuantity('');
      setRestockSupplier('');
      setRestockReason('');
    } catch (err: any) {
      console.error('Failed to restock item:', err);
      setRestockError(err?.message || 'Failed to record restock.');
    } finally {
      setSubmittingRestock(false);
    }
  };

  // Handle Add Raw Material Item (Admin only)
  const handleAddNewItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!restaurant?._id) return;

    if (!newItemName.trim()) {
      setAddError('Item name is required');
      return;
    }

    setSubmittingAdd(true);
    setAddError(null);

    try {
      const res = await createCrmInventoryItem(restaurant._id, {
        name: newItemName.trim(),
        category: newItemCategory,
        stock: parseFloat(newItemStock) || 0,
        threshold: parseFloat(newItemThreshold) || 10,
        unit: newItemUnit.trim() || 'kg',
        unitCost: parseFloat(newItemCost) || 0,
        supplier: newItemSupplier.trim() || 'Local Wholesale Market'
      });

      if (res?.item) {
        setInventory(prev => [res.item, ...prev]);
        fetchTransactions();
      } else {
        fetchInventory();
      }

      showToast(`Added raw ingredient "${newItemName}" to kitchen inventory.`);
      setShowAddModal(false);
      setNewItemName('');
      setNewItemStock('');
      setNewItemThreshold('');
      setNewItemCost('');
      setNewItemSupplier('');
    } catch (err: any) {
      console.error('Failed to create inventory item:', err);
      setAddError(err?.message || 'Failed to create item.');
    } finally {
      setSubmittingAdd(false);
    }
  };

  // Filtered inventory items
  const filteredItems = useMemo(() => {
    return inventory.filter(item => {
      const q = search.toLowerCase();
      const matchesSearch =
        item.name.toLowerCase().includes(q) ||
        (item.sku && item.sku.toLowerCase().includes(q)) ||
        item.category.toLowerCase().includes(q) ||
        (item.supplier && item.supplier.toLowerCase().includes(q));

      if (!matchesSearch) return false;
      if (categoryFilter !== 'ALL' && item.category !== categoryFilter) return false;
      if (statusFilter === 'LOW' && item.status === 'Optimal') return false;
      if (statusFilter === 'OPTIMAL' && item.status !== 'Optimal') return false;
      return true;
    });
  }, [inventory, search, categoryFilter, statusFilter]);

  // Counts and metrics
  const lowStockCount = inventory.filter(i => i.status === 'Low Stock' || i.status === 'Critical').length;
  const criticalCount = inventory.filter(i => i.status === 'Critical').length;
  const totalValuation = inventory.reduce((acc, i) => acc + (i.stock * (i.unitCost || 0)), 0);

  // Status badge styling helper
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'Critical':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800/60">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-pulse" />
            <span>Critical</span>
          </span>
        );
      case 'Low Stock':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/60">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
            <span>Low Stock</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
            <span>Optimal</span>
          </span>
        );
    }
  };

  return (
    <CrmGuard allowedRoles={['RESTAURANT_ADMIN', 'RESTAURANT_MANAGER', 'RESTAURANT_WORKER']}>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col transition-colors duration-150 text-slate-900 dark:text-slate-100">
        <CrmHeader onSync={fetchInventory} syncing={loading} />

        <main className="flex-1 p-3 sm:p-5 lg:p-6 max-w-7xl w-full mx-auto space-y-6">
          {/* Header */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2 mb-1.5">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                    isAdmin
                      ? 'bg-orange-50 dark:bg-orange-950/50 text-orange-700 dark:text-orange-400 border border-orange-200 dark:border-orange-800/60'
                      : isManager
                      ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/60'
                      : 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800/60'
                  }`}
                >
                  {isAdmin
                    ? 'Admin Inventory Control'
                    : isManager
                    ? 'Manager Inventory Control'
                    : 'Worker Station • Ingredient Usage'}
                </span>
                <span className="text-xs text-slate-400 dark:text-slate-600">•</span>
                <span className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                  {restaurant?.name || 'Floveera Restaurant'}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                Kitchen Inventory & Raw Materials
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
                {isWorker
                  ? 'View pantry stock levels and record ingredient consumption used during kitchen preparation.'
                  : 'Track raw material reserves, record kitchen consumption, receive shipments, and audit stock history.'}
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-2.5 self-start sm:self-auto flex-wrap">
              <button
                onClick={() => {
                  fetchInventory();
                  fetchTransactions();
                }}
                disabled={loading}
                className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 transition cursor-pointer"
              >
                <RotateCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-orange-600' : ''}`} />
                <span>Refresh</span>
              </button>

              {isAdmin && (
                <button
                  onClick={() => setShowAddModal(true)}
                  className="inline-flex items-center space-x-1.5 px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Material</span>
                </button>
              )}
            </div>
          </div>

          {/* Toast Message */}
          {toastMessage && (
            <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300 text-xs flex items-center space-x-2.5 shadow-xs animate-in fade-in duration-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="font-semibold">{toastMessage}</span>
            </div>
          )}

          {/* Error Banner */}
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 text-rose-800 dark:text-rose-300 text-xs flex items-center justify-between">
              <span>{error}</span>
              <button onClick={fetchInventory} className="font-bold underline cursor-pointer">
                Retry
              </button>
            </div>
          )}

          {/* Summary KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
            {/* Card 1: Total SKUs */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 sm:p-5 rounded-2xl shadow-xs">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Tracked Raw Materials
                </span>
                <Boxes className="w-4 h-4 text-orange-600" />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                {inventory.length} SKUs
              </div>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
                Across {CATEGORIES.length - 1} categories
              </p>
            </div>

            {/* Card 2: Low Stock Warnings */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 sm:p-5 rounded-2xl shadow-xs">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Low Stock Warnings
                </span>
                <AlertTriangle className="w-4 h-4 text-amber-500" />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-400">
                {lowStockCount} Items
              </div>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
                {criticalCount > 0 ? `${criticalCount} critically low` : 'Needs restocking soon'}
              </p>
            </div>

            {/* Card 3: Role-specific - Valuation or Consumption */}
            {canManageStock ? (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 sm:p-5 rounded-2xl shadow-xs">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Stock Valuation
                  </span>
                  <IndianRupee className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400">
                  ₹{totalValuation.toLocaleString('en-IN')}
                </div>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
                  Current pantry & cold-store value
                </p>
              </div>
            ) : (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 sm:p-5 rounded-2xl shadow-xs">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    My Recorded Usage
                  </span>
                  <ChefHat className="w-4 h-4 text-blue-600" />
                </div>
                <div className="text-2xl sm:text-3xl font-black text-blue-600 dark:text-blue-400">
                  {transactions.length} Logs
                </div>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
                  Kitchen batches logged by you
                </p>
              </div>
            )}

            {/* Card 4: Optimal Status */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 sm:p-5 rounded-2xl shadow-xs">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Healthy Reserves
                </span>
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                {inventory.length - lowStockCount} Items
              </div>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
                Above minimum threshold
              </p>
            </div>
          </div>

          {/* Navigation Tabs: Raw Materials Stock vs Usage History */}
          <div className="flex items-center space-x-2 border-b border-slate-200 dark:border-slate-800 pb-2">
            <button
              onClick={() => setActiveTab('items')}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition cursor-pointer flex items-center space-x-2 ${
                activeTab === 'items'
                  ? 'bg-orange-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800'
              }`}
            >
              <Boxes className="w-4 h-4" />
              <span>Raw Materials Stock ({inventory.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('transactions')}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition cursor-pointer flex items-center space-x-2 ${
                activeTab === 'transactions'
                  ? 'bg-orange-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800'
              }`}
            >
              <History className="w-4 h-4" />
              <span>
                {isWorker ? 'My Usage History' : 'Consumption & Audit Log'} ({transactions.length})
              </span>
            </button>
          </div>

          {/* ========================================================
              TAB 1: RAW MATERIALS STOCK LIST
              ======================================================== */}
          {activeTab === 'items' && (
            <div className="space-y-4">
              {/* Search & Filter Bar */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="relative flex-1 max-w-md">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search by material name, category, or SKU..."
                    className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-orange-500 text-slate-900 dark:text-slate-100"
                  />
                </div>

                <div className="flex items-center space-x-2 overflow-x-auto pb-1 md:pb-0 scrollbar-thin">
                  {/* Status Filter */}
                  <select
                    value={statusFilter}
                    onChange={(e: any) => setStatusFilter(e.target.value)}
                    className="px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-200 focus:outline-none"
                  >
                    <option value="ALL">All Statuses</option>
                    <option value="LOW">Low & Critical Stock</option>
                    <option value="OPTIMAL">Optimal Only</option>
                  </select>

                  {/* Category Pills */}
                  <select
                    value={categoryFilter}
                    onChange={e => setCategoryFilter(e.target.value)}
                    className="px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-200 focus:outline-none"
                  >
                    {CATEGORIES.map(c => (
                      <option key={c} value={c}>
                        {c === 'ALL' ? 'All Categories' : c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Items Table / Cards */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 text-[11px] uppercase font-semibold border-b border-slate-100 dark:border-slate-800">
                      <tr>
                        <th className="py-3.5 px-4">Item & SKU</th>
                        <th className="py-3.5 px-4">Category</th>
                        <th className="py-3.5 px-4">Available Stock</th>
                        <th className="py-3.5 px-4">Threshold</th>
                        {canManageStock && <th className="py-3.5 px-4">Unit Cost</th>}
                        <th className="py-3.5 px-4">Status</th>
                        <th className="py-3.5 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {loading ? (
                        <tr>
                          <td colSpan={7} className="py-12 text-center text-slate-400">
                            <div className="flex justify-center items-center space-x-2">
                              <RotateCw className="w-4 h-4 text-orange-600 animate-spin" />
                              <span>Loading kitchen inventory...</span>
                            </div>
                          </td>
                        </tr>
                      ) : filteredItems.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="py-12 text-center text-slate-400">
                            <Boxes className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                            <p className="font-semibold text-slate-700 dark:text-slate-300 text-sm">
                              No raw materials match your filter
                            </p>
                            <p className="text-xs text-slate-400 mt-0.5">Try clearing your search query</p>
                          </td>
                        </tr>
                      ) : (
                        filteredItems.map(item => {
                          const isLow = item.stock <= item.threshold;
                          const percentOfThreshold = Math.min(
                            100,
                            Math.round((item.stock / Math.max(item.threshold * 2, 1)) * 100)
                          );

                          return (
                            <tr
                              key={item._id || item.id}
                              className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition"
                            >
                              {/* Item & SKU */}
                              <td className="py-3.5 px-4">
                                <div className="font-bold text-slate-900 dark:text-white">
                                  {item.name}
                                </div>
                                <div className="text-[10px] font-mono text-slate-400 dark:text-slate-500">
                                  {item.sku || item.id}
                                </div>
                              </td>

                              {/* Category */}
                              <td className="py-3.5 px-4">
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                                  {item.category}
                                </span>
                              </td>

                              {/* Available Stock */}
                              <td className="py-3.5 px-4">
                                <div className="flex items-baseline space-x-1">
                                  <span
                                    className={`text-sm font-black ${
                                      item.stock <= item.threshold / 2
                                        ? 'text-rose-600 dark:text-rose-400'
                                        : isLow
                                        ? 'text-amber-600 dark:text-amber-400'
                                        : 'text-slate-900 dark:text-white'
                                    }`}
                                  >
                                    {item.stock}
                                  </span>
                                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                                    {item.unit}
                                  </span>
                                </div>
                                <div className="w-24 bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full mt-1.5 overflow-hidden">
                                  <div
                                    className={`h-full rounded-full transition-all ${
                                      item.stock <= item.threshold / 2
                                        ? 'bg-rose-500'
                                        : isLow
                                        ? 'bg-amber-500'
                                        : 'bg-emerald-500'
                                    }`}
                                    style={{ width: `${percentOfThreshold}%` }}
                                  />
                                </div>
                              </td>

                              {/* Threshold */}
                              <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400 font-medium">
                                {item.threshold} {item.unit}
                              </td>

                              {/* Unit Cost (Admin / Manager only) */}
                              {canManageStock && (
                                <td className="py-3.5 px-4 font-mono font-semibold text-slate-700 dark:text-slate-300">
                                  {item.unitCost ? `₹${item.unitCost}/${item.unit}` : '—'}
                                </td>
                              )}

                              {/* Status */}
                              <td className="py-3.5 px-4">{renderStatusBadge(item.status)}</td>

                              {/* Actions */}
                              <td className="py-3.5 px-4 text-right">
                                <div className="flex items-center justify-end space-x-2">
                                  {/* Prominent Record Usage Action (Worker, Manager, Admin) */}
                                  <button
                                    onClick={() => {
                                      setUsageModalItem(item);
                                      setUsageQuantity('');
                                      setUsageReason('');
                                      setUsageError(null);
                                    }}
                                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer"
                                  >
                                    <MinusCircle className="w-3.5 h-3.5" />
                                    <span>Record Usage</span>
                                  </button>

                                  {/* Restock Button (Admin & Manager only) */}
                                  {canManageStock && (
                                    <button
                                      onClick={() => {
                                        setRestockModalItem(item);
                                        setRestockQuantity('');
                                        setRestockSupplier(item.supplier || '');
                                        setRestockReason('');
                                        setRestockError(null);
                                      }}
                                      className="inline-flex items-center space-x-1 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 transition cursor-pointer"
                                    >
                                      <Truck className="w-3.5 h-3.5" />
                                      <span>Restock</span>
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================
              TAB 2: RAW MATERIAL CONSUMPTION & AUDIT HISTORY
              ======================================================== */}
          {activeTab === 'transactions' && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
              <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                    <History className="w-4 h-4 text-orange-600" />
                    <span>
                      {isWorker ? 'My Raw Material Usage Log' : 'Kitchen Consumption Audit Trail'}
                    </span>
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {isWorker
                      ? 'Detailed history of kitchen ingredient consumption recorded by your profile.'
                      : 'Auditable record of raw materials used and restocked across all kitchen staff members.'}
                  </p>
                </div>

                <button
                  onClick={fetchTransactions}
                  disabled={loadingTransactions}
                  className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 transition cursor-pointer self-start sm:self-auto"
                >
                  <RotateCw className={`w-3.5 h-3.5 ${loadingTransactions ? 'animate-spin' : ''}`} />
                  <span>Refresh Log</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 text-[11px] uppercase font-semibold border-b border-slate-100 dark:border-slate-800">
                    <tr>
                      <th className="py-3 px-4">Date & Time</th>
                      <th className="py-3 px-4">Staff Member</th>
                      <th className="py-3 px-4">Raw Material</th>
                      <th className="py-3 px-4">Type</th>
                      <th className="py-3 px-4">Quantity Changed</th>
                      <th className="py-3 px-4">Stock Balance</th>
                      <th className="py-3 px-4">Reason / Notes</th>
                      <th className="py-3 px-4">Txn ID</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {loadingTransactions ? (
                      <tr>
                        <td colSpan={8} className="py-12 text-center text-slate-400">
                          <RotateCw className="w-4 h-4 text-orange-600 animate-spin mx-auto mb-2" />
                          <span>Loading consumption history...</span>
                        </td>
                      </tr>
                    ) : transactions.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-12 text-center text-slate-400">
                          <History className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                          <p className="font-semibold text-slate-700 dark:text-slate-300 text-sm">
                            No consumption transactions recorded yet
                          </p>
                          <p className="text-xs text-slate-400 mt-0.5">
                            Use the &quot;Record Usage&quot; button to log raw ingredients used in cooking
                          </p>
                        </td>
                      </tr>
                    ) : (
                      transactions.map(t => {
                        const isConsumption = t.type === 'CONSUMPTION';
                        return (
                          <tr
                            key={t.id || t.transactionId}
                            className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition"
                          >
                            {/* Date */}
                            <td className="py-3 px-4 whitespace-nowrap text-slate-500 dark:text-slate-400">
                              {new Date(t.createdAt).toLocaleDateString([], {
                                day: '2-digit',
                                month: 'short'
                              })}{' '}
                              •{' '}
                              <span className="font-mono text-[11px]">
                                {new Date(t.createdAt).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span>
                            </td>

                            {/* Staff Member */}
                            <td className="py-3 px-4">
                              <div className="font-bold text-slate-900 dark:text-white">
                                {t.workerName}
                              </div>
                              <div className="text-[10px] text-slate-400 capitalize">
                                {t.workerRole?.replace(/_/g, ' ').toLowerCase()}
                              </div>
                            </td>

                            {/* Item */}
                            <td className="py-3 px-4 font-semibold text-slate-800 dark:text-slate-200">
                              {t.itemName}
                              {t.category && (
                                <span className="block text-[10px] text-slate-400 font-normal">
                                  {t.category}
                                </span>
                              )}
                            </td>

                            {/* Type */}
                            <td className="py-3 px-4">
                              <span
                                className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                                  isConsumption
                                    ? 'bg-orange-50 dark:bg-orange-950/50 text-orange-700 dark:text-orange-400 border border-orange-200 dark:border-orange-800/60'
                                    : 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60'
                                }`}
                              >
                                {isConsumption ? 'Consumption' : 'Restock'}
                              </span>
                            </td>

                            {/* Quantity */}
                            <td className="py-3 px-4 font-bold">
                              <span
                                className={
                                  isConsumption
                                    ? 'text-orange-600 dark:text-orange-400'
                                    : 'text-emerald-600 dark:text-emerald-400'
                                }
                              >
                                {isConsumption ? `-${t.quantity}` : `+${t.quantity}`} {t.unit}
                              </span>
                            </td>

                            {/* Balance */}
                            <td className="py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">
                              {t.stockAfter} {t.unit}
                              <span className="block text-[10px] text-slate-400 font-normal">
                                from {t.stockBefore} {t.unit}
                              </span>
                            </td>

                            {/* Reason */}
                            <td className="py-3 px-4 text-slate-600 dark:text-slate-400 max-w-xs truncate">
                              {t.reason || t.notes || '—'}
                            </td>

                            {/* Txn ID */}
                            <td className="py-3 px-4 font-mono text-[10px] text-slate-400">
                              {t.transactionId}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ========================================================
              MODAL 1: RECORD RAW MATERIAL USAGE
              ======================================================== */}
          {usageModalItem && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
                {/* Modal Header */}
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-xl bg-orange-600 text-white flex items-center justify-center shadow-xs">
                      <MinusCircle className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-base font-black text-slate-900 dark:text-white">
                        Record Raw Material Usage
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Log raw ingredients consumed during kitchen operations.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setUsageModalItem(null)}
                    disabled={submittingUsage}
                    className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Target Item Summary Card */}
                <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 rounded-xl p-3.5 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Material Item
                    </span>
                    <div className="font-extrabold text-sm text-slate-900 dark:text-white">
                      {usageModalItem.name}
                    </div>
                    <span className="text-[11px] text-slate-500">
                      Category: {usageModalItem.category}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Current Available
                    </span>
                    <div className="text-lg font-black text-emerald-600 dark:text-emerald-400">
                      {usageModalItem.stock} {usageModalItem.unit}
                    </div>
                  </div>
                </div>

                {/* Error Banner */}
                {usageError && (
                  <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800/60 text-rose-700 dark:text-rose-300 text-xs flex items-center space-x-2">
                    <ShieldAlert className="w-4 h-4 shrink-0 text-rose-600" />
                    <span>{usageError}</span>
                  </div>
                )}

                {/* Form */}
                <form onSubmit={handleConfirmUsage} className="space-y-4">
                  {/* Quantity Input */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Quantity Used ({usageModalItem.unit}) *
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="any"
                        min="0.01"
                        max={usageModalItem.stock}
                        value={usageQuantity}
                        onChange={e => {
                          setUsageQuantity(e.target.value);
                          setUsageError(null);
                        }}
                        required
                        placeholder={`Enter amount in ${usageModalItem.unit}...`}
                        className="w-full px-3.5 py-2.5 text-sm font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-orange-500 text-slate-900 dark:text-white"
                      />
                      <span className="absolute right-3.5 top-1/2 -translate-y-1/2 font-bold text-xs text-slate-400">
                        {usageModalItem.unit}
                      </span>
                    </div>

                    {/* Live Remaining Stock Preview */}
                    {usageQuantity && !isNaN(parseFloat(usageQuantity)) && (
                      <div className="mt-2 text-xs flex items-center justify-between p-2 rounded-lg bg-orange-50/60 dark:bg-orange-950/30 border border-orange-200/60 dark:border-orange-900/40">
                        <span className="text-slate-600 dark:text-slate-400 font-medium">
                          Remaining Stock After Usage:
                        </span>
                        <span
                          className={`font-black ${
                            usageModalItem.stock - parseFloat(usageQuantity) < 0
                              ? 'text-rose-600'
                              : 'text-orange-600 dark:text-orange-400'
                          }`}
                        >
                          {Math.max(0, Number((usageModalItem.stock - parseFloat(usageQuantity)).toFixed(2)))}{' '}
                          {usageModalItem.unit}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Reason / Notes */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Reason / Production Note (Optional)
                    </label>
                    <input
                      type="text"
                      value={usageReason}
                      onChange={e => setUsageReason(e.target.value)}
                      placeholder="e.g. Lunch batch cooking, sauce prep, buffet refilling..."
                      className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-orange-500 text-slate-900 dark:text-white"
                    />

                    {/* Quick Selection Chips */}
                    <div className="flex items-center gap-1.5 flex-wrap mt-2">
                      {QUICK_REASONS.map(r => (
                        <button
                          key={r}
                          type="button"
                          onClick={() => setUsageReason(r)}
                          className="px-2 py-0.5 text-[10px] font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition"
                        >
                          + {r}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Modal Footer Actions */}
                  <div className="flex items-center justify-end space-x-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={() => setUsageModalItem(null)}
                      disabled={submittingUsage}
                      className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={
                        submittingUsage ||
                        !usageQuantity ||
                        parseFloat(usageQuantity) <= 0 ||
                        parseFloat(usageQuantity) > usageModalItem.stock
                      }
                      className="inline-flex items-center space-x-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-orange-600 hover:bg-orange-500 text-white shadow-xs transition cursor-pointer disabled:opacity-50"
                    >
                      {submittingUsage ? (
                        <>
                          <RotateCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Updating Stock...</span>
                        </>
                      ) : (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Confirm Usage</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* ========================================================
              MODAL 2: STOCK REPLENISHMENT (Admin & Manager)
              ======================================================== */}
          {restockModalItem && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                      <Truck className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-base font-black text-slate-900 dark:text-white">
                        Restock Raw Material
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Record shipment delivery to increase available reserves.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setRestockModalItem(null)}
                    disabled={submittingRestock}
                    className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 rounded-xl p-3.5 flex items-center justify-between">
                  <div>
                    <div className="font-extrabold text-sm text-slate-900 dark:text-white">
                      {restockModalItem.name}
                    </div>
                    <span className="text-[11px] text-slate-500">
                      Threshold: {restockModalItem.threshold} {restockModalItem.unit}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Current Stock
                    </span>
                    <div className="text-lg font-black text-slate-900 dark:text-white">
                      {restockModalItem.stock} {restockModalItem.unit}
                    </div>
                  </div>
                </div>

                {restockError && (
                  <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800/60 text-rose-700 text-xs">
                    {restockError}
                  </div>
                )}

                <form onSubmit={handleConfirmRestock} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Received Quantity ({restockModalItem.unit}) *
                    </label>
                    <input
                      type="number"
                      step="any"
                      min="0.01"
                      value={restockQuantity}
                      onChange={e => setRestockQuantity(e.target.value)}
                      required
                      placeholder={`Enter amount to add in ${restockModalItem.unit}...`}
                      className="w-full px-3.5 py-2.5 text-sm font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-emerald-500 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Supplier Name
                    </label>
                    <input
                      type="text"
                      value={restockSupplier}
                      onChange={e => setRestockSupplier(e.target.value)}
                      placeholder="e.g. Royal Agro Corp, Sudha Dairy..."
                      className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-emerald-500 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Invoice / Purchase Note
                    </label>
                    <input
                      type="text"
                      value={restockReason}
                      onChange={e => setRestockReason(e.target.value)}
                      placeholder="e.g. PO #10842, Weekly dairy delivery..."
                      className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-emerald-500 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div className="flex items-center justify-end space-x-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={() => setRestockModalItem(null)}
                      disabled={submittingRestock}
                      className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submittingRestock || !restockQuantity || parseFloat(restockQuantity) <= 0}
                      className="inline-flex items-center space-x-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs transition"
                    >
                      {submittingRestock ? (
                        <>
                          <RotateCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Receiving Stock...</span>
                        </>
                      ) : (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Confirm Restock</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* ========================================================
              MODAL 3: ADD NEW RAW MATERIAL ITEM (Admin Only)
              ======================================================== */}
          {showAddModal && isAdmin && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-xl bg-orange-600 text-white flex items-center justify-center shadow-xs">
                      <Plus className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-base font-black text-slate-900 dark:text-white">
                        Add Raw Ingredient SKU
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Create a tracked inventory material with reorder threshold.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowAddModal(false)}
                    disabled={submittingAdd}
                    className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {addError && (
                  <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800/60 text-rose-700 text-xs">
                    {addError}
                  </div>
                )}

                <form onSubmit={handleAddNewItem} className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Ingredient Name *
                    </label>
                    <input
                      type="text"
                      value={newItemName}
                      onChange={e => setNewItemName(e.target.value)}
                      required
                      placeholder="e.g. Kashmiri Red Chilli Whole, Basmati Rice..."
                      className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-orange-500 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Category *
                      </label>
                      <select
                        value={newItemCategory}
                        onChange={e => setNewItemCategory(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-orange-500 text-slate-900 dark:text-white"
                      >
                        {CATEGORIES.filter(c => c !== 'ALL').map(c => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Measurement Unit *
                      </label>
                      <select
                        value={newItemUnit}
                        onChange={e => setNewItemUnit(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-orange-500 text-slate-900 dark:text-white"
                      >
                        <option value="kg">kg (Kilograms)</option>
                        <option value="g">g (Grams)</option>
                        <option value="L">L (Litres)</option>
                        <option value="ml">ml (Millilitres)</option>
                        <option value="pcs">pcs (Pieces)</option>
                        <option value="packets">packets (Packs)</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Initial Stock ({newItemUnit})
                      </label>
                      <input
                        type="number"
                        step="any"
                        min="0"
                        value={newItemStock}
                        onChange={e => setNewItemStock(e.target.value)}
                        placeholder="e.g. 50"
                        className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-orange-500 text-slate-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Low Stock Alert Threshold
                      </label>
                      <input
                        type="number"
                        step="any"
                        min="1"
                        value={newItemThreshold}
                        onChange={e => setNewItemThreshold(e.target.value)}
                        placeholder="e.g. 15"
                        className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-orange-500 text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Unit Cost (₹)
                      </label>
                      <input
                        type="number"
                        step="any"
                        min="0"
                        value={newItemCost}
                        onChange={e => setNewItemCost(e.target.value)}
                        placeholder="e.g. 120"
                        className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-orange-500 text-slate-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Supplier Reference
                      </label>
                      <input
                        type="text"
                        value={newItemSupplier}
                        onChange={e => setNewItemSupplier(e.target.value)}
                        placeholder="e.g. Local Mandi, Metro Cash"
                        className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-orange-500 text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-end space-x-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={() => setShowAddModal(false)}
                      disabled={submittingAdd}
                      className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submittingAdd || !newItemName.trim()}
                      className="inline-flex items-center space-x-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-orange-600 hover:bg-orange-500 text-white shadow-xs transition"
                    >
                      {submittingAdd ? (
                        <>
                          <RotateCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Creating SKU...</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add Material</span>
                        </>
                      )}
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
