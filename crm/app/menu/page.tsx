'use client';

import React, { useEffect, useState, useMemo, useRef } from 'react';
import CrmGuard from '@/components/CrmGuard';
import CrmHeader from '@/components/CrmHeader';
import { useCrmAuthStore } from '@/store/crmAuthStore';
import { getCrmSocket } from '@/store/crmPresenceStore';
import {
  getCrmMenu,
  updateCrmMenuAvailability,
  createCrmMenuItem,
  updateCrmMenuItem,
  deleteCrmMenuItem,
  uploadCrmMenuImage
} from '@/lib/api';
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
  TrendingUp,
  Tag,
  Pencil,
  Trash2,
  ShieldCheck,
  HardHat,
  X,
  Check,
  Upload,
  Image as ImageIcon,
  Loader2,
  RefreshCw
} from 'lucide-react';

const resolveMenuImageUrl = (url?: string) => {
  if (!url) return '';
  if (url.startsWith('http') || url.startsWith('data:')) return url;
  if (url.startsWith('/uploads')) {
    return `http://localhost:5000${url}`;
  }
  return url;
};

const validateImageFile = (file: File): string | null => {
  const validMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!validMimes.includes(file.type.toLowerCase())) {
    return 'Unsupported format. Please select a JPG, JPEG, PNG, or WebP image.';
  }
  const maxBytes = 5 * 1024 * 1024; // 5 MB
  if (file.size > maxBytes) {
    return `Image exceeds 5 MB limit (${(file.size / (1024 * 1024)).toFixed(2)} MB). Please select a smaller photo.`;
  }
  return null;
};

const readFileAsDataUrl = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Failed to read image file.'));
    reader.readAsDataURL(file);
  });
};

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
  const { restaurant, role, user } = useCrmAuthStore();
  const isAdmin = role === 'RESTAURANT_ADMIN' || user?.restaurantRole === 'RESTAURANT_ADMIN';
  const isManager = role === 'RESTAURANT_MANAGER' || user?.restaurantRole === 'RESTAURANT_MANAGER';
  const isWorker = role === 'RESTAURANT_WORKER' || user?.restaurantRole === 'RESTAURANT_WORKER';

  const [menuItems, setMenuItems] = useState<any[]>(FALLBACK_MENU);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [dietFilter, setDietFilter] = useState<'ALL' | 'VEG' | 'NON_VEG'>('ALL');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  // Modals (Admin Only)
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);

  // Add Dish Form State
  const [dishName, setDishName] = useState('');
  const [dishCategory, setDishCategory] = useState('Main Course');
  const [dishPrice, setDishPrice] = useState('');
  const [dishIsVeg, setDishIsVeg] = useState(true);
  const [dishPrepTime, setDishPrepTime] = useState('15 mins');
  const [dishIsSpecial, setDishIsSpecial] = useState(false);
  const [dishDescription, setDishDescription] = useState('');
  const [addDishImageFile, setAddDishImageFile] = useState<File | null>(null);
  const [addDishImagePreview, setAddDishImagePreview] = useState<string | null>(null);
  const [addDishImageUploading, setAddDishImageUploading] = useState(false);
  const [addDishImageError, setAddDishImageError] = useState<string | null>(null);
  const [isDraggingAdd, setIsDraggingAdd] = useState(false);
  const addFileInputRef = useRef<HTMLInputElement>(null);

  // Edit Dish Form State
  const [editName, setEditName] = useState('');
  const [editCategory, setEditCategory] = useState('Main Course');
  const [editPrice, setEditPrice] = useState('');
  const [editIsVeg, setEditIsVeg] = useState(true);
  const [editPrepTime, setEditPrepTime] = useState('15 mins');
  const [editIsSpecial, setEditIsSpecial] = useState(false);
  const [editDescription, setEditDescription] = useState('');
  const [editDishImageFile, setEditDishImageFile] = useState<File | null>(null);
  const [editDishImagePreview, setEditDishImagePreview] = useState<string | null>(null);
  const [editDishImageRemoved, setEditDishImageRemoved] = useState(false);
  const [editDishImageUploading, setEditDishImageUploading] = useState(false);
  const [editDishImageError, setEditDishImageError] = useState<string | null>(null);
  const [isDraggingEdit, setIsDraggingEdit] = useState(false);
  const editFileInputRef = useRef<HTMLInputElement>(null);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToastMessage(msg);
    setToastType(type);
    setTimeout(() => setToastMessage(null), 3500);
  };

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
        console.warn('Menu fetch note (fallback catalog in use):', err);
        setMenuItems(FALLBACK_MENU);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchMenu();
  }, [restaurant?._id]);

  // Real-Time Socket.IO Synchronization Across All Roles
  useEffect(() => {
    const socket = getCrmSocket();
    if (!socket) return;

    const handleStockUpdated = (payload: { itemId: string; isAvailable: boolean; updatedBy?: string; role?: string }) => {
      setMenuItems(prev =>
        prev.map(item => {
          const match = item._id === payload.itemId || item.id === payload.itemId;
          if (match) {
            return { ...item, isAvailable: payload.isAvailable };
          }
          return item;
        })
      );
    };

    const handleItemAdded = (newItem: any) => {
      setMenuItems(prev => {
        const exists = prev.some(i => (i._id || i.id) === (newItem._id || newItem.id));
        if (exists) return prev;
        return [newItem, ...prev];
      });
    };

    const handleItemUpdated = (updatedItem: any) => {
      setMenuItems(prev =>
        prev.map(i => {
          const match = (i._id || i.id) === (updatedItem._id || updatedItem.id);
          return match ? { ...i, ...updatedItem } : i;
        })
      );
    };

    const handleItemDeleted = (payload: { itemId: string }) => {
      setMenuItems(prev => prev.filter(i => (i._id || i.id) !== payload.itemId));
    };

    socket.on('menu:stock_updated', handleStockUpdated);
    socket.on('menu:item_added', handleItemAdded);
    socket.on('menu:item_updated', handleItemUpdated);
    socket.on('menu:item_deleted', handleItemDeleted);

    return () => {
      socket.off('menu:stock_updated', handleStockUpdated);
      socket.off('menu:item_added', handleItemAdded);
      socket.off('menu:item_updated', handleItemUpdated);
      socket.off('menu:item_deleted', handleItemDeleted);
    };
  }, []);

  // Stock Availability Toggle (Operational permission for Admin, Manager & Worker)
  const toggleAvailability = async (id: string, currentState: boolean) => {
    const nextState = !currentState;
    const targetItem = menuItems.find(i => i.id === id || i._id === id);

    // Optimistic UI update
    setMenuItems(prev =>
      prev.map(item => {
        if (item.id === id || item._id === id) {
          return { ...item, isAvailable: nextState };
        }
        return item;
      })
    );

    showToast(
      `"${targetItem?.name || 'Dish'}" is now marked as ${nextState ? 'In Stock' : 'Out of Stock'}.`,
      'success'
    );

    if (restaurant?._id) {
      try {
        await updateCrmMenuAvailability(restaurant._id, id, nextState);
      } catch (err: any) {
        // Revert on error
        setMenuItems(prev =>
          prev.map(item => {
            if (item.id === id || item._id === id) {
              return { ...item, isAvailable: currentState };
            }
            return item;
          })
        );
        showToast(err?.message || 'Failed to update stock status on server', 'error');
      }
    }
  };

  // Admin Only: Add Menu Item
  const handleAddDish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) {
      showToast('Only Restaurant Administrators can add menu items.', 'error');
      return;
    }

    let finalImageUrl = '';

    if (addDishImagePreview && addDishImageFile) {
      try {
        setAddDishImageUploading(true);
        const uploadRes = await uploadCrmMenuImage(restaurant?._id || 'default', {
          dataUrl: addDishImagePreview,
          filename: addDishImageFile.name
        });
        finalImageUrl = uploadRes.imageUrl || uploadRes.relativeUrl || '';
      } catch (uploadErr: any) {
        setAddDishImageUploading(false);
        setAddDishImageError(uploadErr?.message || 'Failed to upload photo to server');
        showToast(`Image upload failed: ${uploadErr?.message || 'Server error'}`, 'error');
        return;
      } finally {
        setAddDishImageUploading(false);
      }
    }

    const payload = {
      name: dishName.trim(),
      category: dishCategory,
      price: Number(dishPrice) || 200,
      isVeg: dishIsVeg,
      prepTime: dishPrepTime || '15 mins',
      isSpecial: dishIsSpecial,
      description: dishDescription.trim() || 'Freshly prepared specialty dish crafted in Floveera kitchen.',
      imageUrl: finalImageUrl
    };

    if (restaurant?._id) {
      try {
        const res = await createCrmMenuItem(restaurant._id, payload);
        const created = res?.item || {
          id: `MNU-${Date.now().toString().slice(-4)}`,
          ...payload,
          isAvailable: true,
          salesCount: 0
        };
        setMenuItems(prev => [created, ...prev.filter(i => (i._id || i.id) !== (created._id || created.id))]);
        showToast(`Added "${payload.name}" to menu catalog.`, 'success');
      } catch (err: any) {
        showToast(err?.message || 'Failed to create menu item', 'error');
        return;
      }
    } else {
      const mockCreated = {
        id: `MNU-${Date.now().toString().slice(-4)}`,
        ...payload,
        isAvailable: true,
        salesCount: 0
      };
      setMenuItems(prev => [mockCreated, ...prev]);
      showToast(`Added "${payload.name}" to menu catalog.`, 'success');
    }

    // Reset Form
    setDishName('');
    setDishPrice('');
    setDishDescription('');
    setDishIsSpecial(false);
    setAddDishImageFile(null);
    setAddDishImagePreview(null);
    setAddDishImageError(null);
    setShowAddModal(false);
  };

  // Admin Only: Open Edit Modal
  const handleOpenEditModal = (item: any) => {
    if (!isAdmin) return;
    setEditingItem(item);
    setEditName(item.name || '');
    setEditCategory(item.category || 'Main Course');
    setEditPrice(String(item.price || ''));
    setEditIsVeg(item.isVeg !== undefined ? item.isVeg : (item.dietary === 'veg' || item.dietary === 'eggless'));
    setEditPrepTime(item.prepTime || '15 mins');
    setEditIsSpecial(Boolean(item.isSpecial));
    setEditDescription(item.description || '');
    setEditDishImageFile(null);
    setEditDishImagePreview(item.imageUrl ? resolveMenuImageUrl(item.imageUrl) : null);
    setEditDishImageRemoved(false);
    setEditDishImageError(null);
  };

  // Admin Only: Submit Edit Dish
  const handleSaveEditDish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin || !editingItem) {
      showToast('Only Restaurant Administrators can edit menu items.', 'error');
      return;
    }

    let finalImageUrl = editingItem.imageUrl || '';

    if (editDishImageRemoved) {
      finalImageUrl = '';
    } else if (editDishImageFile && editDishImagePreview?.startsWith('data:')) {
      try {
        setEditDishImageUploading(true);
        const uploadRes = await uploadCrmMenuImage(restaurant?._id || 'default', {
          dataUrl: editDishImagePreview,
          filename: editDishImageFile.name
        });
        finalImageUrl = uploadRes.imageUrl || uploadRes.relativeUrl || '';
      } catch (uploadErr: any) {
        setEditDishImageUploading(false);
        setEditDishImageError(uploadErr?.message || 'Failed to upload photo to server');
        showToast(`Image upload failed: ${uploadErr?.message || 'Server error'}`, 'error');
        return;
      } finally {
        setEditDishImageUploading(false);
      }
    }

    const itemId = editingItem._id || editingItem.id;
    const payload = {
      name: editName.trim(),
      category: editCategory,
      price: Number(editPrice) || editingItem.price,
      isVeg: editIsVeg,
      dietary: editIsVeg ? 'veg' : 'non-veg',
      prepTime: editPrepTime || '15 mins',
      isSpecial: editIsSpecial,
      description: editDescription.trim(),
      imageUrl: finalImageUrl
    };

    if (restaurant?._id) {
      try {
        const res = await updateCrmMenuItem(restaurant._id, itemId, payload);
        const updated = res?.item || { ...editingItem, ...payload };
        setMenuItems(prev => prev.map(i => ((i._id || i.id) === itemId ? { ...i, ...updated } : i)));
        showToast(`Updated "${payload.name}" successfully.`, 'success');
      } catch (err: any) {
        showToast(err?.message || 'Failed to update menu item', 'error');
        return;
      }
    } else {
      setMenuItems(prev => prev.map(i => ((i._id || i.id) === itemId ? { ...i, ...payload } : i)));
      showToast(`Updated "${payload.name}" successfully.`, 'success');
    }

    setEditingItem(null);
  };

  // Admin Only: Delete Menu Item
  const handleDeleteDish = async (id: string, name: string) => {
    if (!isAdmin) {
      showToast('Only Restaurant Administrators can delete menu items.', 'error');
      return;
    }

    const confirmed = window.confirm(`Are you sure you want to permanently delete "${name}" from the menu catalog?`);
    if (!confirmed) return;

    if (restaurant?._id) {
      try {
        await deleteCrmMenuItem(restaurant._id, id);
        setMenuItems(prev => prev.filter(i => (i._id || i.id) !== id));
        showToast(`Deleted "${name}" from menu catalog.`, 'success');
      } catch (err: any) {
        showToast(err?.message || 'Failed to delete menu item', 'error');
      }
    } else {
      setMenuItems(prev => prev.filter(i => (i._id || i.id) !== id));
      showToast(`Deleted "${name}" from menu catalog.`, 'success');
    }
  };

  const categories = useMemo(() => {
    const list = ['ALL', 'Biryanis', 'Main Course', 'Italian', 'Starters', 'Breads', 'Desserts', 'Beverages'];
    // Merge any custom categories added
    menuItems.forEach(item => {
      if (item.category && !list.includes(item.category)) {
        list.push(item.category);
      }
    });
    return list;
  }, [menuItems]);

  const filteredItems = useMemo(() => {
    return menuItems.filter(item => {
      const matchesSearch =
        (item.name || '').toLowerCase().includes(search.toLowerCase()) ||
        (item.description || '').toLowerCase().includes(search.toLowerCase()) ||
        (item.category || '').toLowerCase().includes(search.toLowerCase());

      if (!matchesSearch) return false;
      if (categoryFilter !== 'ALL' && item.category !== categoryFilter) return false;
      if (dietFilter === 'VEG' && !item.isVeg) return false;
      if (dietFilter === 'NON_VEG' && item.isVeg) return false;
      return true;
    });
  }, [menuItems, search, categoryFilter, dietFilter]);

  const activeCount = menuItems.filter(i => i.isAvailable).length;
  const outOfStockCount = menuItems.filter(i => !i.isAvailable).length;

  return (
    <CrmGuard allowedRoles={['RESTAURANT_ADMIN', 'RESTAURANT_MANAGER', 'RESTAURANT_WORKER']}>
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
                <span className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                  {restaurant?.name || 'Floveera Restaurant'}
                </span>
                <span className="text-xs text-slate-400 dark:text-slate-600">•</span>
                <span className={`inline-flex items-center px-2 py-0.2 rounded-full text-[10px] font-semibold ${
                  isAdmin
                    ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/60'
                    : isManager
                    ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/60'
                    : 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800/60'
                }`}>
                  {isAdmin ? 'Admin View (Full Access)' : isManager ? 'Manager View (Stock Control)' : 'Worker View (Stock Control)'}
                </span>
              </div>
              <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Restaurant Menu Catalog</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Live dishes, pricing, dietary indicators, and real-time kitchen stock availability toggles.
              </p>
            </div>

            {/* Admin-Only: Add Menu Item Button */}
            {isAdmin && (
              <button
                onClick={() => setShowAddModal(true)}
                className="inline-flex items-center space-x-1.5 px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer self-start sm:self-auto"
              >
                <Plus className="w-4 h-4" />
                <span>Add Menu Item</span>
              </button>
            )}
          </div>

          {/* Toast Notification */}
          {toastMessage && (
            <div
              className={`p-3.5 rounded-xl text-xs flex items-center space-x-2 shadow-xs animate-in fade-in duration-200 border ${
                toastType === 'success'
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300'
                  : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800/60 text-rose-800 dark:text-rose-300'
              }`}
            >
              {toastType === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              )}
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
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">In Stock (Active)</span>
              <div className="text-2xl font-black text-emerald-700 dark:text-emerald-400 mt-1">{activeCount}</div>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">Live for customer orders</p>
            </div>
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Out of Stock (Paused)</span>
              <div className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1">{outOfStockCount}</div>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">Kitchen paused items</p>
            </div>
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Top Bestseller</span>
              <div className="text-base font-black text-orange-600 dark:text-orange-400 mt-1 truncate">
                {menuItems.find(i => i.isSpecial || i.isBestseller)?.name || 'Hyderabadi Dum Biryani'}
              </div>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">Popular kitchen favorite</p>
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
            {filteredItems.map(item => {
              const itemId = item._id || item.id;
              const isItemAvailable = Boolean(item.isAvailable);

              return (
                <div
                  key={itemId}
                  className={`bg-white dark:bg-slate-900 border rounded-2xl p-5 shadow-xs transition-all relative flex flex-col justify-between ${
                    isItemAvailable
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

                      <div className="flex items-center space-x-1.5">
                        {item.isSpecial && (
                          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/50">
                            <Sparkles className="w-3 h-3 text-amber-500" />
                            <span>Special</span>
                          </span>
                        )}

                        {/* Admin Only Actions: Edit & Delete */}
                        {isAdmin && (
                          <div className="flex items-center space-x-1 ml-1">
                            <button
                              onClick={() => handleOpenEditModal(item)}
                              title="Edit Dish (Admin only)"
                              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteDish(itemId, item.name)}
                              title="Delete Dish (Admin only)"
                              className="p-1.5 rounded-lg text-rose-400 hover:text-rose-600 dark:hover:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {item.imageUrl && (
                      <div className="w-full h-32 mb-2.5 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 relative group">
                        <img
                          src={resolveMenuImageUrl(item.imageUrl)}
                          alt={item.name}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/images/pizza.jpg';
                          }}
                        />
                        {!isItemAvailable && (
                          <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center">
                            <span className="bg-rose-600 text-white font-bold text-[10px] uppercase tracking-wider px-2 py-0.5 rounded shadow">
                              Out of Stock
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                    <h3 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1">{item.name}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                    <div>
                      <div className="text-base font-black text-slate-900 dark:text-white">
                        ₹{item.price}
                      </div>
                      <div className="flex items-center space-x-2 text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
                        <span className="flex items-center space-x-1">
                          <Clock className="w-3 h-3" />
                          <span>{item.prepTime || '15 mins'}</span>
                        </span>
                        <span>•</span>
                        <span>{item.salesCount || 0} sold</span>
                      </div>
                    </div>

                    {/* Interactive Stock Availability Toggle (Admin, Manager, and Worker) */}
                    <button
                      onClick={() => toggleAvailability(itemId, isItemAvailable)}
                      title={`Click to mark as ${isItemAvailable ? 'Out of Stock' : 'In Stock'}`}
                      className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer select-none shrink-0 ${
                        isItemAvailable
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 border border-emerald-200 dark:border-emerald-800/60'
                          : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900/40 border border-rose-200 dark:border-rose-800/60'
                      }`}
                    >
                      <span className={`w-2 h-2 rounded-full ${isItemAvailable ? 'bg-emerald-500 ring-2 ring-emerald-400/40' : 'bg-rose-500 ring-2 ring-rose-400/40'}`} />
                      <span>{isItemAvailable ? 'In Stock' : 'Out of Stock'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Admin Only: Add Dish Modal */}
          {isAdmin && showAddModal && (
            <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm">Add New Catalog Item</h3>
                  <button
                    onClick={() => {
                      setShowAddModal(false);
                      setAddDishImageFile(null);
                      setAddDishImagePreview(null);
                      setAddDishImageError(null);
                    }}
                    className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 text-sm cursor-pointer"
                  >
                    <X className="w-4 h-4" />
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

                  {/* Food Image Upload Section */}
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                      Dish Image
                    </label>
                    <input
                      ref={addFileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const err = validateImageFile(file);
                        if (err) {
                          setAddDishImageError(err);
                          return;
                        }
                        try {
                          const dataUrl = await readFileAsDataUrl(file);
                          setAddDishImageFile(file);
                          setAddDishImagePreview(dataUrl);
                          setAddDishImageError(null);
                        } catch {
                          setAddDishImageError('Failed to read image file.');
                        }
                      }}
                    />

                    {addDishImagePreview ? (
                      <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 p-2.5 flex flex-col gap-2">
                        <div className="relative w-full h-32 rounded-lg overflow-hidden bg-slate-900 border border-slate-700/60">
                          <img
                            src={addDishImagePreview}
                            alt="Dish Preview"
                            className="w-full h-full object-cover"
                          />
                          {addDishImageUploading && (
                            <div className="absolute inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center gap-2 text-white text-xs font-semibold">
                              <Loader2 className="w-4 h-4 animate-spin text-orange-500" />
                              <span>Uploading image to server...</span>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center justify-between text-[11px] text-slate-700 dark:text-slate-300 pt-1">
                          <span className="truncate max-w-[190px] font-mono text-slate-500 dark:text-slate-400">
                            {addDishImageFile?.name || 'dish_photo.jpg'}
                          </span>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              type="button"
                              disabled={addDishImageUploading}
                              onClick={() => addFileInputRef.current?.click()}
                              className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-orange-600 dark:text-orange-400 font-semibold border border-slate-200 dark:border-slate-700 transition cursor-pointer"
                            >
                              Replace Image
                            </button>
                            <button
                              type="button"
                              disabled={addDishImageUploading}
                              onClick={() => {
                                setAddDishImageFile(null);
                                setAddDishImagePreview(null);
                                setAddDishImageError(null);
                              }}
                              className="px-2.5 py-1 rounded-lg bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 dark:hover:bg-rose-900 text-rose-700 dark:text-rose-300 font-semibold border border-rose-200 dark:border-rose-800 transition cursor-pointer"
                            >
                              Remove Image
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div
                        onDragOver={(e) => {
                          e.preventDefault();
                          setIsDraggingAdd(true);
                        }}
                        onDragLeave={() => setIsDraggingAdd(false)}
                        onDrop={async (e) => {
                          e.preventDefault();
                          setIsDraggingAdd(false);
                          const file = e.dataTransfer.files?.[0];
                          if (!file) return;
                          const err = validateImageFile(file);
                          if (err) {
                            setAddDishImageError(err);
                            return;
                          }
                          try {
                            const dataUrl = await readFileAsDataUrl(file);
                            setAddDishImageFile(file);
                            setAddDishImagePreview(dataUrl);
                            setAddDishImageError(null);
                          } catch {
                            setAddDishImageError('Failed to read image file.');
                          }
                        }}
                        onClick={() => addFileInputRef.current?.click()}
                        className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-1.5 ${
                          isDraggingAdd
                            ? 'border-orange-500 bg-orange-500/10'
                            : 'border-slate-300 dark:border-slate-700 hover:border-orange-500 bg-slate-50 dark:bg-slate-800/40 hover:bg-orange-50/20 dark:hover:bg-slate-800/80'
                        }`}
                      >
                        <Upload className="w-5 h-5 text-orange-500 mb-0.5" />
                        <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                          Drag and drop an image here, or <span className="text-orange-500 underline">browse files</span>
                        </p>
                        <p className="text-[10px] text-slate-400">
                          JPG, JPEG, PNG, or WebP up to 5 MB
                        </p>
                      </div>
                    )}

                    {addDishImageError && (
                      <p className="text-[11px] text-rose-500 font-medium mt-1.5 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        {addDishImageError}
                      </p>
                    )}
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

                  <div className="flex items-center space-x-2 pt-1">
                    <input
                      type="checkbox"
                      id="isSpecialCheck"
                      checked={dishIsSpecial}
                      onChange={e => setDishIsSpecial(e.target.checked)}
                      className="rounded border-slate-300 text-orange-600 focus:ring-orange-500 cursor-pointer"
                    />
                    <label htmlFor="isSpecialCheck" className="text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                      Mark as Chef Special
                    </label>
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
                      disabled={addDishImageUploading}
                      onClick={() => {
                        setShowAddModal(false);
                        setAddDishImageFile(null);
                        setAddDishImagePreview(null);
                        setAddDishImageError(null);
                      }}
                      className="w-1/2 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={addDishImageUploading}
                      className="w-1/2 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold transition cursor-pointer shadow-xs flex items-center justify-center gap-1.5"
                    >
                      {addDishImageUploading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Saving Dish...</span>
                        </>
                      ) : (
                        <span>Add Dish</span>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Admin Only: Edit Dish Modal */}
          {isAdmin && editingItem && (
            <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm">Edit Menu Dish</h3>
                  <button
                    onClick={() => {
                      setEditingItem(null);
                      setEditDishImageFile(null);
                      setEditDishImagePreview(null);
                      setEditDishImageError(null);
                    }}
                    className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 text-sm cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <form onSubmit={handleSaveEditDish} className="space-y-3.5 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">Dish Name</label>
                    <input
                      type="text"
                      required
                      value={editName}
                      onChange={e => setEditName(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 focus:outline-none"
                    />
                  </div>

                  {/* Food Image Edit & Replace Section */}
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                      Dish Image
                    </label>
                    <input
                      ref={editFileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const err = validateImageFile(file);
                        if (err) {
                          setEditDishImageError(err);
                          return;
                        }
                        try {
                          const dataUrl = await readFileAsDataUrl(file);
                          setEditDishImageFile(file);
                          setEditDishImagePreview(dataUrl);
                          setEditDishImageRemoved(false);
                          setEditDishImageError(null);
                        } catch {
                          setEditDishImageError('Failed to read image file.');
                        }
                      }}
                    />

                    {editDishImagePreview && !editDishImageRemoved ? (
                      <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 p-2.5 flex flex-col gap-2">
                        <div className="relative w-full h-32 rounded-lg overflow-hidden bg-slate-900 border border-slate-700/60">
                          <img
                            src={editDishImagePreview}
                            alt="Current Dish"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/images/pizza.jpg';
                            }}
                          />
                          {editDishImageUploading && (
                            <div className="absolute inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center gap-2 text-white text-xs font-semibold">
                              <Loader2 className="w-4 h-4 animate-spin text-orange-500" />
                              <span>Uploading replacement photo...</span>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center justify-between text-[11px] text-slate-700 dark:text-slate-300 pt-1">
                          <span className="truncate max-w-[190px] font-mono text-slate-500 dark:text-slate-400">
                            {editDishImageFile?.name || (editingItem.imageUrl ? 'Current Photo' : 'dish_photo.jpg')}
                          </span>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              type="button"
                              disabled={editDishImageUploading}
                              onClick={() => editFileInputRef.current?.click()}
                              className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-orange-600 dark:text-orange-400 font-semibold border border-slate-200 dark:border-slate-700 transition cursor-pointer"
                            >
                              Replace Image
                            </button>
                            <button
                              type="button"
                              disabled={editDishImageUploading}
                              onClick={() => {
                                setEditDishImageFile(null);
                                setEditDishImagePreview(null);
                                setEditDishImageRemoved(true);
                                setEditDishImageError(null);
                              }}
                              className="px-2.5 py-1 rounded-lg bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 dark:hover:bg-rose-900 text-rose-700 dark:text-rose-300 font-semibold border border-rose-200 dark:border-rose-800 transition cursor-pointer"
                            >
                              Remove Image
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div
                        onDragOver={(e) => {
                          e.preventDefault();
                          setIsDraggingEdit(true);
                        }}
                        onDragLeave={() => setIsDraggingEdit(false)}
                        onDrop={async (e) => {
                          e.preventDefault();
                          setIsDraggingEdit(false);
                          const file = e.dataTransfer.files?.[0];
                          if (!file) return;
                          const err = validateImageFile(file);
                          if (err) {
                            setEditDishImageError(err);
                            return;
                          }
                          try {
                            const dataUrl = await readFileAsDataUrl(file);
                            setEditDishImageFile(file);
                            setEditDishImagePreview(dataUrl);
                            setEditDishImageRemoved(false);
                            setEditDishImageError(null);
                          } catch {
                            setEditDishImageError('Failed to read image file.');
                          }
                        }}
                        onClick={() => editFileInputRef.current?.click()}
                        className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-1.5 ${
                          isDraggingEdit
                            ? 'border-orange-500 bg-orange-500/10'
                            : 'border-slate-300 dark:border-slate-700 hover:border-orange-500 bg-slate-50 dark:bg-slate-800/40 hover:bg-orange-50/20 dark:hover:bg-slate-800/80'
                        }`}
                      >
                        <Upload className="w-5 h-5 text-orange-500 mb-0.5" />
                        <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                          Drag and drop replacement photo here, or <span className="text-orange-500 underline">browse files</span>
                        </p>
                        <p className="text-[10px] text-slate-400">
                          JPG, JPEG, PNG, or WebP up to 5 MB
                        </p>
                      </div>
                    )}

                    {editDishImageError && (
                      <p className="text-[11px] text-rose-500 font-medium mt-1.5 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        {editDishImageError}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">Category</label>
                      <select
                        value={editCategory}
                        onChange={e => setEditCategory(e.target.value)}
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
                        value={editPrice}
                        onChange={e => setEditPrice(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">Dietary Type</label>
                      <select
                        value={editIsVeg ? 'veg' : 'nonveg'}
                        onChange={e => setEditIsVeg(e.target.value === 'veg')}
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
                        value={editPrepTime}
                        onChange={e => setEditPrepTime(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 pt-1">
                    <input
                      type="checkbox"
                      id="editIsSpecialCheck"
                      checked={editIsSpecial}
                      onChange={e => setEditIsSpecial(e.target.checked)}
                      className="rounded border-slate-300 text-orange-600 focus:ring-orange-500 cursor-pointer"
                    />
                    <label htmlFor="editIsSpecialCheck" className="text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                      Mark as Chef Special
                    </label>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">Description</label>
                    <textarea
                      rows={2}
                      value={editDescription}
                      onChange={e => setEditDescription(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 focus:outline-none"
                    />
                  </div>

                  <div className="pt-2 flex gap-2">
                    <button
                      type="button"
                      disabled={editDishImageUploading}
                      onClick={() => {
                        setEditingItem(null);
                        setEditDishImageFile(null);
                        setEditDishImagePreview(null);
                        setEditDishImageError(null);
                      }}
                      className="w-1/2 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={editDishImageUploading}
                      className="w-1/2 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold transition cursor-pointer shadow-xs flex items-center justify-center gap-1.5"
                    >
                      {editDishImageUploading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Saving Changes...</span>
                        </>
                      ) : (
                        <span>Save Changes</span>
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
