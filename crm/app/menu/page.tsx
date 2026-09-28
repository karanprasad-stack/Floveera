'use client';

import React, { useEffect, useState } from 'react';
import CrmGuard from '@/components/CrmGuard';
import CrmHeader from '@/components/CrmHeader';
import { useCrmAuthStore } from '@/store/crmAuthStore';
import { getCrmMenu } from '@/lib/api';
import {
  UtensilsCrossed,
  Plus,
  Search,
  Clock,
  Flame,
  CheckCircle2,
  AlertCircle,
  RotateCw,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  TrendingUp,
  Tag
} from 'lucide-react';

const FALLBACK_MENU = [
  { id: 'MNU-101', name: 'Hyderabadi Chicken Dum Biryani', category: 'Biryanis', price: 360, isVeg: false, isAvailable: true, prepTime: '22 mins', isSpecial: true, salesCount: 380, description: 'Fragrant aged basmati rice layered with spiced marinated chicken, brown onions, and saffron.' },
  { id: 'MNU-102', name: 'Awadhi Veg Dum Biryani', category: 'Biryanis', price: 280, isVeg: true, isAvailable: true, prepTime: '18 mins', isSpecial: false, salesCount: 210, description: 'Slow-cooked basmati rice with farm fresh vegetables, paneer cubes, and royal aromatic spices.' },
  { id: 'MNU-103', name: 'Paneer Butter Masala', category: 'Main Course', price: 280, isVeg: true, isAvailable: true, prepTime: '15 mins', isSpecial: true, salesCount: 340, description: 'Soft malai paneer simmered in a velvety tomato-butter gravy with aromatic fenugreek.' },
  { id: 'MNU-104', name: 'Murgh Makhani (Butter Chicken)', category: 'Main Course', price: 340, isVeg: false, isAvailable: true, prepTime: '20 mins', isSpecial: true, salesCount: 395, description: 'Char-grilled tandoori chicken cooked in rich cashew and butter tomato satin sauce.' },
  { id: 'MNU-105', name: 'Dal Makhani Bukhara Style', category: 'Main Course', price: 230, isVeg: true, isAvailable: true, prepTime: '12 mins', isSpecial: false, salesCount: 260, description: 'Slow cooked black lentils simmered overnight over wood charcoal with fresh cream.' },
  { id: 'MNU-106', name: 'Truffle Alfredo Fettuccine Pasta', category: 'Italian', price: 320, isVeg: true, isAvailable: true, prepTime: '15 mins', isSpecial: true, salesCount: 180, description: 'Handmade fettuccine ribbons in creamy parmesan garlic alfredo sauce scented with truffle oil.' },
  { id: 'MNU-107', name: 'Classic Margherita Woodfired Pizza (12")', category: 'Italian', price: 310, isVeg: true, isAvailable: true, prepTime: '16 mins', isSpecial: false, salesCount: 195, description: 'San Marzano tomato sauce, fresh mozzarella fior di latte, and aromatic basil leaves.' },
  { id: 'MNU-108', name: 'Crispy Honey Chilli Lotus Stem', category: 'Starters', price: 220, isVeg: true, isAvailable: true, prepTime: '12 mins', isSpecial: false, salesCount: 150, description: 'Crunchy golden lotus roots tossed in toasted sesame, hot chilli, and sweet honey glaze.' },
  { id: 'MNU-109', name: 'Smoked BBQ Chicken Wings (6 pcs)', category: 'Starters', price: 260, isVeg: false, isAvailable: true, prepTime: '14 mins', isSpecial: true, salesCount: 220, description: 'Tender chicken wings glazed in artisanal house-smoked hickory barbecue sauce.' },
  { id: 'MNU-110', name: 'Tandoori Garlic Butter Naan', category: 'Breads', price: 55, isVeg: true, isAvailable: true, prepTime: '6 mins', isSpecial: false, salesCount: 520, description: 'Crisp clay-oven roasted flatbread brushed with crushed garlic and golden Amul butter.' },
  { id: 'MNU-111', name: 'Belgian Chocolate Truffle Cake Slice', category: 'Desserts', price: 140, isVeg: true, isAvailable: true, prepTime: '2 mins', isSpecial: true, salesCount: 290, description: 'Decadent dark chocolate sponge layered with French ganache and cocoa nibs.' },
  { id: 'MNU-112', name: 'Gulab Jamun with Kesari Rabri (2 pcs)', category: 'Desserts', price: 95, isVeg: true, isAvailable: true, prepTime: '5 mins', isSpecial: false, salesCount: 240, description: 'Warm golden milk dumplings served over thick saffron and cardamom infused rabri.' },
  { id: 'MNU-113', name: 'Cold Brew Hazelnut Frappe', category: 'Beverages', price: 130, isVeg: true, isAvailable: true, prepTime: '5 mins', isSpecial: false, salesCount: 175, description: 'Double shot arabica cold brew blended with roasted hazelnut syrup, milk, and ice cream.' },
  { id: 'MNU-114', name: 'Alphonso Mango Thick Shake', category: 'Beverages', price: 150, isVeg: true, isAvailable: false, prepTime: '5 mins', isSpecial: false, salesCount: 160, description: 'Pure Ratnagiri Alphonso mango pulp blended with rich condensed milk.' }
];

export default function CrmMenuPage() {
  const { restaurant } = useCrmAuthStore();
  const [menuItems, setMenuItems] = useState<any[]>(FALLBACK_MENU);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [dietFilter, setDietFilter] = useState<'ALL' | 'VEG' | 'NON_VEG'>('ALL');
  const [showAddModal, setShowAddModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form State
  const [dishName, setDishName] = useState('');
  const [dishCategory, setDishCategory] = useState('Main Course');
  const [dishPrice, setDishPrice] = useState('');
  const [dishIsVeg, setDishIsVeg] = useState(true);
  const [dishPrepTime, setDishPrepTime] = useState('15 mins');
  const [dishDescription, setDishDescription] = useState('');

  const fetchMenu = () => {
    if (!restaurant?._id) return;
    setLoading(true);
    getCrmMenu(restaurant._id)
      .then((res: any) => {
        const items = res?.items || (Array.isArray(res) ? res : []);
        if (items.length > 0) {
          setMenuItems(items);
        } else {
          setMenuItems(FALLBACK_MENU);
        }
      })
      .catch((err: any) => {
        console.warn('Menu fetch failed, fallback to catalog:', err);
        setMenuItems(FALLBACK_MENU);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchMenu();
  }, [restaurant?._id]);

  const toggleAvailability = (id: string) => {
    setMenuItems(prev =>
      prev.map(item => {
        if (item.id === id) {
          const nextState = !item.isAvailable;
          setToastMessage(`"${item.name}" is now marked as ${nextState ? 'Available in Kitchen' : 'Out of Stock'}.`);
          setTimeout(() => setToastMessage(null), 3000);
          return { ...item, isAvailable: nextState };
        }
        return item;
      })
    );
  };

  const handleAddDish = (e: React.FormEvent) => {
    e.preventDefault();
    const newDish = {
      id: `MNU-${Date.now().toString().slice(-4)}`,
      name: dishName,
      category: dishCategory,
      price: Number(dishPrice) || 200,
      isVeg: dishIsVeg,
      isAvailable: true,
      prepTime: dishPrepTime,
      isSpecial: false,
      salesCount: 0,
      description: dishDescription || 'Freshly prepared specialty dish crafted in Floveera kitchen.'
    };
    setMenuItems([newDish, ...menuItems]);
    setToastMessage(`Added "${dishName}" to menu catalog.`);
    setTimeout(() => setToastMessage(null), 3500);
    setDishName('');
    setDishPrice('');
    setDishDescription('');
    setShowAddModal(false);
  };

  const categories = ['ALL', 'Biryanis', 'Main Course', 'Italian', 'Starters', 'Breads', 'Desserts', 'Beverages'];

  const filteredItems = menuItems.filter(item => {
    const matchesSearch =
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.description.toLowerCase().includes(search.toLowerCase()) ||
      item.category.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;
    if (categoryFilter !== 'ALL' && item.category !== categoryFilter) return false;
    if (dietFilter === 'VEG' && !item.isVeg) return false;
    if (dietFilter === 'NON_VEG' && item.isVeg) return false;
    return true;
  });

  const activeCount = menuItems.filter(i => i.isAvailable).length;
  const outOfStockCount = menuItems.filter(i => !i.isAvailable).length;

  return (
    <CrmGuard allowedRoles={['RESTAURANT_ADMIN']}>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col transition-colors duration-150">
        <CrmHeader onSync={fetchMenu} syncing={loading} />

        <main className="flex-1 p-6 max-w-7xl w-full mx-auto space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2 mb-1">
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-50 dark:bg-orange-950/50 text-orange-700 dark:text-orange-400 border border-orange-200 dark:border-orange-800/50">
                  Operations • Menu Catalog
                </span>
                <span className="text-xs text-slate-400 dark:text-slate-600">•</span>
                <span className="text-xs text-slate-600 dark:text-slate-300 font-medium">{restaurant?.name || 'Floveera Restaurant'}</span>
              </div>
              <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Restaurant Menu Catalog</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Live dish items, pricing, dietary indicators, and real-time kitchen availability toggles.
              </p>
            </div>

            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center space-x-1.5 px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Add Menu Item</span>
            </button>
          </div>

          {/* Toast Notification */}
          {toastMessage && (
            <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300 text-xs flex items-center space-x-2 shadow-xs animate-in fade-in duration-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="font-semibold">{toastMessage}</span>
            </div>
          )}

          {/* KPI Metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Total Catalog Items</span>
              <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">{menuItems.length}</div>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">Across {categories.length - 1} food categories</p>
            </div>
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Active in Kitchen</span>
              <div className="text-2xl font-black text-emerald-700 dark:text-emerald-400 mt-1">{activeCount}</div>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">Orderable on customer app</p>
            </div>
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Out of Stock</span>
              <div className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1">{outOfStockCount}</div>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">Kitchen paused items</p>
            </div>
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Top Bestseller</span>
              <div className="text-base font-black text-orange-600 dark:text-orange-400 mt-1 truncate">Hyderabadi Dum Biryani</div>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">380+ monthly portions</p>
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search dishes by name, spice level, or ingredients..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 shadow-xs"
                />
              </div>

              {/* Veg / Non-Veg Diet Filter */}
              <div className="flex items-center space-x-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-1 rounded-xl shadow-xs">
                <button
                  onClick={() => setDietFilter('ALL')}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg transition cursor-pointer ${
                    dietFilter === 'ALL'
                      ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  All Food
                </button>
                <button
                  onClick={() => setDietFilter('VEG')}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg transition flex items-center space-x-1 cursor-pointer ${
                    dietFilter === 'VEG'
                      ? 'bg-emerald-600 text-white'
                      : 'text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span>Pure Veg</span>
                </button>
                <button
                  onClick={() => setDietFilter('NON_VEG')}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg transition flex items-center space-x-1 cursor-pointer ${
                    dietFilter === 'NON_VEG'
                      ? 'bg-rose-600 text-white'
                      : 'text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-rose-400" />
                  <span>Non-Veg</span>
                </button>
              </div>
            </div>

            {/* Category Pills */}
            <div className="flex items-center space-x-1.5 overflow-x-auto pb-1">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                    categoryFilter === cat
                      ? 'bg-orange-600 text-white shadow-xs'
                      : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  {cat === 'ALL' ? 'All Categories' : cat}
                </button>
              ))}
            </div>
          </div>

          {/* Menu Items Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredItems.map(item => (
              <div
                key={item.id}
                className={`bg-white dark:bg-slate-900 border rounded-2xl p-5 shadow-xs transition-all relative flex flex-col justify-between ${
                  item.isAvailable
                    ? 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                    : 'border-slate-200 dark:border-slate-800/60 bg-slate-50/70 dark:bg-slate-950/40 opacity-75'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center space-x-2">
                      {/* Veg / Non-Veg Icon */}
                      <span className={`w-4 h-4 rounded-sm border flex items-center justify-center shrink-0 ${
                        item.isVeg
                          ? 'border-emerald-600 dark:border-emerald-500 bg-white dark:bg-slate-900'
                          : 'border-rose-600 dark:border-rose-500 bg-white dark:bg-slate-900'
                      }`}>
                        <span className={`w-2 h-2 rounded-full ${item.isVeg ? 'bg-emerald-600 dark:bg-emerald-400' : 'bg-rose-600 dark:bg-rose-400'}`} />
                      </span>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                        {item.category}
                      </span>
                    </div>

                    {item.isSpecial && (
                      <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/50">
                        <Sparkles className="w-3 h-3 text-amber-500" />
                        <span>Chef Special</span>
                      </span>
                    )}
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1">{item.name}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <div className="text-base font-black text-slate-900 dark:text-white">
                      ₹{item.price}
                    </div>
                    <div className="flex items-center space-x-2 text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
                      <span className="flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>{item.prepTime}</span>
                      </span>
                      <span>•</span>
                      <span>{item.salesCount} sold</span>
                    </div>
                  </div>

                  {/* Availability Toggle */}
                  <button
                    onClick={() => toggleAvailability(item.id)}
                    className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                      item.isAvailable
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 border border-emerald-200 dark:border-emerald-800/60'
                        : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900/40 border border-rose-200 dark:border-rose-800/60'
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${item.isAvailable ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                    <span>{item.isAvailable ? 'In Stock' : 'Out of Stock'}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Add Dish Modal */}
          {showAddModal && (
            <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-xl">
                <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm">Add New Catalog Item</h3>
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 text-sm cursor-pointer"
                  >
                    ✕
                  </button>
                </div>

                <form onSubmit={handleAddDish} className="space-y-3.5 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">Dish Name</label>
                    <input
                      type="text"
                      required
                      value={dishName}
                      onChange={e => setDishName(e.target.value)}
                      placeholder="e.g. Kashmiri Rogan Josh"
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">Category</label>
                      <select
                        value={dishCategory}
                        onChange={e => setDishCategory(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 focus:outline-none cursor-pointer"
                      >
                        {categories.filter(c => c !== 'ALL').map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">Price (₹)</label>
                      <input
                        type="number"
                        required
                        value={dishPrice}
                        onChange={e => setDishPrice(e.target.value)}
                        placeholder="350"
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">Dietary Type</label>
                      <select
                        value={dishIsVeg ? 'veg' : 'nonveg'}
                        onChange={e => setDishIsVeg(e.target.value === 'veg')}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 focus:outline-none cursor-pointer"
                      >
                        <option value="veg">Pure Vegetarian</option>
                        <option value="nonveg">Non-Vegetarian</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">Prep Time</label>
                      <input
                        type="text"
                        value={dishPrepTime}
                        onChange={e => setDishPrepTime(e.target.value)}
                        placeholder="18 mins"
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">Description</label>
                    <textarea
                      rows={2}
                      value={dishDescription}
                      onChange={e => setDishDescription(e.target.value)}
                      placeholder="Ingredients, spice blend and culinary story..."
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 focus:outline-none"
                    />
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
                      Add Dish
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
