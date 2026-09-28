'use client';

import React, { useEffect, useState } from 'react';
import CrmGuard from '@/components/CrmGuard';
import CrmHeader from '@/components/CrmHeader';
import { useCrmAuthStore } from '@/store/crmAuthStore';
import { getCrmInventory } from '@/lib/api';
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
  RefreshCw
} from 'lucide-react';

const FALLBACK_INVENTORY = [
  { id: 'INV-101', name: 'Aged Daawat Basmati Rice', category: 'Grains & Staples', stock: 120, threshold: 30, unit: 'kg', unitCost: 95, supplier: 'Royal Agro Corp', status: 'Optimal', lastRestocked: '2026-09-25' },
  { id: 'INV-102', name: 'Sudha Malai Paneer (Fresh Block)', category: 'Dairy', stock: 8, threshold: 15, unit: 'kg', unitCost: 340, supplier: 'Sudha Dairy Co.', status: 'Low Stock', lastRestocked: '2026-09-26' },
  { id: 'INV-103', name: 'Amul Salted Table Butter', category: 'Dairy', stock: 25, threshold: 10, unit: 'kg', unitCost: 520, supplier: 'Amul Depot Patna', status: 'Optimal', lastRestocked: '2026-09-24' },
  { id: 'INV-104', name: 'Fresh Dairy Cooking Cream 25%', category: 'Dairy', stock: 4, threshold: 12, unit: 'L', unitCost: 220, supplier: 'Amul Depot Patna', status: 'Critical', lastRestocked: '2026-09-22' },
  { id: 'INV-105', name: 'Fresh Chicken Breast Boneless', category: 'Poultry & Meat', stock: 36, threshold: 15, unit: 'kg', unitCost: 260, supplier: 'FreshFarms Quality Meats', status: 'Optimal', lastRestocked: '2026-09-27' },
  { id: 'INV-106', name: 'Prime Mutton Curry Cuts', category: 'Poultry & Meat', stock: 5, threshold: 10, unit: 'kg', unitCost: 780, supplier: 'FreshFarms Quality Meats', status: 'Low Stock', lastRestocked: '2026-09-25' },
  { id: 'INV-107', name: 'Organic Bell Peppers & Broccoli', category: 'Fresh Produce', stock: 22, threshold: 8, unit: 'kg', unitCost: 110, supplier: 'Sabzi Mandi Patna', status: 'Optimal', lastRestocked: '2026-09-27' },
  { id: 'INV-108', name: 'Dabon Mozzarella & Cheddar Blend', category: 'Dairy', stock: 18, threshold: 8, unit: 'kg', unitCost: 480, supplier: 'Dabon Foods Pvt', status: 'Optimal', lastRestocked: '2026-09-23' },
  { id: 'INV-109', name: 'Refined Cold-Pressed Canola Oil', category: 'Grains & Staples', stock: 60, threshold: 25, unit: 'L', unitCost: 145, supplier: 'Fortune Distributorship', status: 'Optimal', lastRestocked: '2026-09-20' },
  { id: 'INV-110', name: 'Royal Shahi Whole Spices Mix', category: 'Spices', stock: 8, threshold: 3, unit: 'kg', unitCost: 850, supplier: 'Purani Dilli Masala Mart', status: 'Optimal', lastRestocked: '2026-09-18' },
  { id: 'INV-111', name: 'Eco 3-Compartment Meal Trays', category: 'Packaging', stock: 480, threshold: 200, unit: 'pcs', unitCost: 12, supplier: 'GreenPack Solutions', status: 'Optimal', lastRestocked: '2026-09-26' },
  { id: 'INV-112', name: 'Biodegradable Cutlery & Napkin Kit', category: 'Packaging', stock: 90, threshold: 200, unit: 'pcs', unitCost: 4.5, supplier: 'EcoWare Products', status: 'Low Stock', lastRestocked: '2026-09-21' }
];

export default function CrmInventoryPage() {
  const { restaurant } = useCrmAuthStore();
  const [inventory, setInventory] = useState<any[]>(FALLBACK_INVENTORY);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'LOW' | 'OPTIMAL'>('ALL');
  const [showAddModal, setShowAddModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form state
  const [newItemName, setNewItemName] = useState('');
  const [newItemCategory, setNewItemCategory] = useState('Dairy');
  const [newItemStock, setNewItemStock] = useState('');
  const [newItemThreshold, setNewItemThreshold] = useState('');
  const [newItemUnit, setNewItemUnit] = useState('kg');
  const [newItemCost, setNewItemCost] = useState('');
  const [newItemSupplier, setNewItemSupplier] = useState('');

  const fetchInventory = () => {
    if (!restaurant?._id) return;
    setLoading(true);
    getCrmInventory(restaurant._id)
      .then((res: any) => {
        const items = res?.items || (Array.isArray(res) ? res : []);
        if (items.length > 0) {
          setInventory(items);
        } else {
          setInventory(FALLBACK_INVENTORY);
        }
      })
      .catch((err: any) => {
        console.warn('Inventory fetch failed, fallback to mock data:', err);
        setInventory(FALLBACK_INVENTORY);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchInventory();
  }, [restaurant?._id]);

  const handleRestock = (id: string, name: string) => {
    setInventory(prev =>
      prev.map(item => {
        if (item.id === id) {
          const added = item.threshold * 2;
          return {
            ...item,
            stock: item.stock + added,
            status: 'Optimal',
            lastRestocked: new Date().toISOString().split('T')[0]
          };
        }
        return item;
      })
    );
    setToastMessage(`Restocked ${name}! Inventory level is now optimal.`);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleAddRawMaterial = (e: React.FormEvent) => {
    e.preventDefault();
    const stockVal = Number(newItemStock) || 10;
    const threshVal = Number(newItemThreshold) || 5;
    const item = {
      id: `INV-${Date.now().toString().slice(-4)}`,
      name: newItemName,
      category: newItemCategory,
      stock: stockVal,
      threshold: threshVal,
      unit: newItemUnit,
      unitCost: Number(newItemCost) || 100,
      supplier: newItemSupplier || 'Local Wholesale Market',
      status: stockVal <= threshVal ? (stockVal <= threshVal / 2 ? 'Critical' : 'Low Stock') : 'Optimal',
      lastRestocked: new Date().toISOString().split('T')[0]
    };
    setInventory([item, ...inventory]);
    setToastMessage(`Added raw ingredient "${newItemName}" to stock.`);
    setTimeout(() => setToastMessage(null), 3500);
    setNewItemName('');
    setNewItemStock('');
    setNewItemThreshold('');
    setNewItemCost('');
    setNewItemSupplier('');
    setShowAddModal(false);
  };

  const categories = ['ALL', 'Grains & Staples', 'Dairy', 'Poultry & Meat', 'Fresh Produce', 'Spices', 'Packaging'];

  const filteredItems = inventory.filter(item => {
    const matchesSearch =
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.category.toLowerCase().includes(search.toLowerCase()) ||
      item.supplier?.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;
    if (categoryFilter !== 'ALL' && item.category !== categoryFilter) return false;
    if (statusFilter === 'LOW' && item.status === 'Optimal') return false;
    if (statusFilter === 'OPTIMAL' && item.status !== 'Optimal') return false;
    return true;
  });

  const lowStockCount = inventory.filter(i => i.status === 'Low Stock' || i.status === 'Critical').length;
  const criticalCount = inventory.filter(i => i.status === 'Critical').length;
  const totalValuation = inventory.reduce((acc, i) => acc + (i.stock * (i.unitCost || 0)), 0);

  return (
    <CrmGuard allowedRoles={['RESTAURANT_ADMIN']}>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col transition-colors duration-150">
        <CrmHeader onSync={fetchInventory} syncing={loading} />

        <main className="flex-1 p-6 max-w-7xl w-full mx-auto space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2 mb-1">
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/50">
                  Operations • Stock & Raw Inventory
                </span>
                <span className="text-xs text-slate-400 dark:text-slate-600">•</span>
                <span className="text-xs text-slate-600 dark:text-slate-300 font-medium">{restaurant?.name || 'Floveera Restaurant'}</span>
              </div>
              <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Kitchen Inventory & Ingredient Stock</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Raw material reserves, consumption tracking, supplier references, and threshold reorder alerts.
              </p>
            </div>

            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center space-x-1.5 px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Add Stock Item</span>
            </button>
          </div>

          {toastMessage && (
            <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300 text-xs flex items-center space-x-2 shadow-xs animate-in fade-in duration-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="font-semibold">{toastMessage}</span>
            </div>
          )}

          {/* Metric KPIs */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Tracked SKUs</span>
              <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">{inventory.length} Items</div>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">Across {categories.length - 1} categories</p>
            </div>
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Stock Valuation</span>
              <div className="text-2xl font-black text-emerald-700 dark:text-emerald-400 mt-1">₹{totalValuation.toLocaleString('en-IN')}</div>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">Current pantry & cold-store value</p>
            </div>
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Low Stock Warnings</span>
              <div className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">{lowStockCount} Items</div>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">Below optimal threshold</p>
            </div>
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Critical Reorders</span>
              <div className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1">{criticalCount} Urgent</div>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">Immediate kitchen attention</p>
            </div>
          </div>

          {/* Search & Filters */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search raw items, suppliers, or units..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 shadow-xs"
                />
              </div>

              <div className="flex items-center space-x-1.5">
                {[
                  { key: 'ALL', label: 'All Items' },
                  { key: 'LOW', label: 'Low Stock Only' },
                  { key: 'OPTIMAL', label: 'Optimal Stock' }
                ].map(tab => (
                  <button
                    key={tab.key}
                    onClick={() => setStatusFilter(tab.key as any)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                      statusFilter === tab.key
                        ? 'bg-orange-600 text-white shadow-xs'
                        : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Category pills */}
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
                  {cat === 'ALL' ? 'All Ingredients' : cat}
                </button>
              ))}
            </div>
          </div>

          {/* Inventory Table */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 text-[11px] uppercase font-semibold border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-5">Ingredient / SKU</th>
                  <th className="py-3 px-5">Category</th>
                  <th className="py-3 px-5">Stock Level</th>
                  <th className="py-3 px-5">Threshold</th>
                  <th className="py-3 px-5">Unit Cost</th>
                  <th className="py-3 px-5">Supplier</th>
                  <th className="py-3 px-5">Status</th>
                  <th className="py-3 px-5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {loading && inventory.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-10 text-center text-slate-400 dark:text-slate-500">
                      <div className="flex justify-center items-center space-x-2">
                        <RotateCw className="w-4 h-4 text-orange-600 animate-spin" />
                        <span>Verifying stock levels...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-500 dark:text-slate-400">
                      <Boxes className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                      <p className="font-semibold text-slate-700 dark:text-slate-300 text-sm">No items found</p>
                    </td>
                  </tr>
                ) : (
                  filteredItems.map(item => {
                    const ratio = Math.min(100, Math.round((item.stock / (item.threshold * 2)) * 100));
                    const isCrit = item.status === 'Critical';
                    const isLow = item.status === 'Low Stock';
                    return (
                      <tr key={item.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="py-3.5 px-5">
                          <span className="font-bold text-slate-900 dark:text-white block">{item.name}</span>
                          <span className="text-[11px] text-slate-400 dark:text-slate-500 font-mono">SKU: {item.id}</span>
                        </td>

                        <td className="py-3.5 px-5">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                            {item.category}
                          </span>
                        </td>

                        <td className="py-3.5 px-5">
                          <div className="space-y-1">
                            <span className="font-extrabold text-slate-900 dark:text-white font-mono">
                              {item.stock} {item.unit}
                            </span>
                            <div className="w-24 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${
                                  isCrit ? 'bg-rose-500' : isLow ? 'bg-amber-500' : 'bg-emerald-500'
                                }`}
                                style={{ width: `${ratio}%` }}
                              />
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-5 text-slate-500 dark:text-slate-400 font-mono">
                          {item.threshold} {item.unit}
                        </td>

                        <td className="py-3.5 px-5 font-bold text-slate-800 dark:text-slate-200">
                          ₹{item.unitCost}/{item.unit}
                        </td>

                        <td className="py-3.5 px-5 text-slate-600 dark:text-slate-300">
                          <div className="flex items-center space-x-1">
                            <Truck className="w-3 h-3 text-slate-400 dark:text-slate-500 shrink-0" />
                            <span className="truncate max-w-[140px]">{item.supplier}</span>
                          </div>
                        </td>

                        <td className="py-3.5 px-5">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            isCrit
                              ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800/60'
                              : isLow
                              ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/60'
                              : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60'
                          }`}>
                            {item.status}
                          </span>
                        </td>

                        <td className="py-3.5 px-5 text-right">
                          <button
                            onClick={() => handleRestock(item.id, item.name)}
                            className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-orange-50 dark:bg-orange-950/40 text-orange-700 dark:text-orange-400 hover:bg-orange-100 dark:hover:bg-orange-900/50 border border-orange-200 dark:border-orange-800/60 text-[11px] font-bold transition cursor-pointer"
                          >
                            <RefreshCw className="w-3 h-3" />
                            <span>Restock</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Add Item Modal */}
          {showAddModal && (
            <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-xl">
                <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm">Add Raw Inventory Item</h3>
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 text-sm cursor-pointer"
                  >
                    ✕
                  </button>
                </div>

                <form onSubmit={handleAddRawMaterial} className="space-y-3.5 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">Item / Ingredient Name</label>
                    <input
                      type="text"
                      required
                      value={newItemName}
                      onChange={e => setNewItemName(e.target.value)}
                      placeholder="e.g. Kasuri Methi Extra Grade"
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">Category</label>
                      <select
                        value={newItemCategory}
                        onChange={e => setNewItemCategory(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 focus:outline-none cursor-pointer"
                      >
                        {categories.filter(c => c !== 'ALL').map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">Unit of Measure</label>
                      <select
                        value={newItemUnit}
                        onChange={e => setNewItemUnit(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 focus:outline-none cursor-pointer"
                      >
                        <option value="kg">kg (Kilograms)</option>
                        <option value="L">L (Litres)</option>
                        <option value="pcs">pcs (Pieces)</option>
                        <option value="pkts">pkts (Packets)</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">Current Stock</label>
                      <input
                        type="number"
                        required
                        value={newItemStock}
                        onChange={e => setNewItemStock(e.target.value)}
                        placeholder="25"
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">Low Stock Threshold</label>
                      <input
                        type="number"
                        required
                        value={newItemThreshold}
                        onChange={e => setNewItemThreshold(e.target.value)}
                        placeholder="10"
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">Cost Per Unit (₹)</label>
                      <input
                        type="number"
                        value={newItemCost}
                        onChange={e => setNewItemCost(e.target.value)}
                        placeholder="240"
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">Primary Supplier</label>
                      <input
                        type="text"
                        value={newItemSupplier}
                        onChange={e => setNewItemSupplier(e.target.value)}
                        placeholder="e.g. Royal Spices Mart"
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
                      Save Item
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
