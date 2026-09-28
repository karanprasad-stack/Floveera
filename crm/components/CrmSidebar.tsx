'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useCrmAuthStore } from '@/store/crmAuthStore';
import { useCrmUiStore } from '@/store/crmUiStore';
import {
  LayoutDashboard,
  ShoppingBag,
  Users,
  Briefcase,
  UtensilsCrossed,
  Boxes,
  MessageSquare,
  TrendingUp,
  Receipt,
  FileBarChart2,
  Settings,
  User,
  LogOut,
  Store,
  ShieldCheck,
  HardHat,
  X,
  Sun,
  Moon
} from 'lucide-react';

export default function CrmSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { role, user, restaurant, logout } = useCrmAuthStore();
  const { sidebarOpen, closeSidebar, toggleTheme, resolvedTheme } = useCrmUiStore();
  const isWorker = role === 'RESTAURANT_WORKER';

  const handleLogout = async () => {
    closeSidebar();
    await logout();
    router.replace('/login');
  };

  const isActive = (path: string) => {
    if (path === '/dashboard') return pathname === '/dashboard' || pathname === '/restaurant/dashboard';
    return pathname.startsWith(path) || pathname.startsWith(`/restaurant${path}`);
  };

  const linkClass = (active: boolean) =>
    `flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
      active
        ? 'bg-orange-50 dark:bg-orange-950/40 text-orange-700 dark:text-orange-400 font-bold border border-orange-200/60 dark:border-orange-800/60 shadow-xs'
        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800/60'
    }`;

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {sidebarOpen && (
        <div
          onClick={closeSidebar}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-30 md:hidden transition-opacity duration-200"
          aria-hidden="true"
        />
      )}

      {/* Viewport-Bound Fixed Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-40 h-screen h-[100dvh] w-60 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col transition-transform duration-200 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Top Branding */}
        <div className="h-16 px-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center space-x-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-orange-600 flex items-center justify-center text-white shadow-xs shrink-0">
              <Store className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="font-extrabold text-xs text-slate-900 dark:text-white tracking-wider truncate">FLOVEERA CRM</h1>
              <p className="text-[10px] font-bold text-orange-600 dark:text-orange-400 uppercase tracking-widest truncate">
                {isWorker ? 'Worker Station' : 'Admin Workspace'}
              </p>
            </div>
          </div>

          {/* Mobile Close Button */}
          <button
            onClick={closeSidebar}
            className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            aria-label="Close menu"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Content — Naturally stacked with compact, controlled spacing */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3.5 crm-sidebar-scroll scrollbar-thin">
          {/* ================= WORKER NAVIGATION ================= */}
          {isWorker ? (
            <>
              {/* Overview */}
              <div>
                <p className="text-[10px] font-bold tracking-wider text-slate-400 uppercase px-3 mb-1">
                  Overview
                </p>
                <div className="space-y-0.5">
                  <Link
                    href="/dashboard"
                    onClick={closeSidebar}
                    className={linkClass(isActive('/dashboard'))}
                  >
                    <LayoutDashboard className="w-4 h-4 flex-shrink-0" />
                    <span>Dashboard</span>
                  </Link>
                  <Link
                    href="/orders"
                    onClick={closeSidebar}
                    className={linkClass(isActive('/orders'))}
                  >
                    <ShoppingBag className="w-4 h-4 flex-shrink-0" />
                    <span>Orders</span>
                  </Link>
                </div>
              </div>

              {/* Account */}
              <div>
                <p className="text-[10px] font-bold tracking-wider text-slate-400 uppercase px-3 mb-1">
                  Account
                </p>
                <div className="space-y-0.5">
                  <Link
                    href="/profile"
                    onClick={closeSidebar}
                    className={linkClass(isActive('/profile'))}
                  >
                    <User className="w-4 h-4 flex-shrink-0" />
                    <span>My Profile</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer text-left"
                  >
                    <LogOut className="w-4 h-4 flex-shrink-0" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            </>
          ) : (
            /* ================= ADMIN NAVIGATION ================= */
            <>
              {/* Overview */}
              <div>
                <p className="text-[10px] font-bold tracking-wider text-slate-400 uppercase px-3 mb-1">
                  Overview
                </p>
                <div className="space-y-0.5">
                  <Link
                    href="/dashboard"
                    onClick={closeSidebar}
                    className={linkClass(isActive('/dashboard'))}
                  >
                    <LayoutDashboard className="w-4 h-4 flex-shrink-0" />
                    <span>Dashboard</span>
                  </Link>
                  <Link
                    href="/orders"
                    onClick={closeSidebar}
                    className={linkClass(isActive('/orders'))}
                  >
                    <ShoppingBag className="w-4 h-4 flex-shrink-0" />
                    <span>Orders</span>
                  </Link>
                </div>
              </div>

              {/* Operations */}
              <div>
                <p className="text-[10px] font-bold tracking-wider text-slate-400 uppercase px-3 mb-1">
                  Operations
                </p>
                <div className="space-y-0.5">
                  <Link
                    href="/customers"
                    onClick={closeSidebar}
                    className={linkClass(isActive('/customers'))}
                  >
                    <Users className="w-4 h-4 flex-shrink-0" />
                    <span>Customers</span>
                  </Link>
                  <Link
                    href="/workers"
                    onClick={closeSidebar}
                    className={linkClass(isActive('/workers'))}
                  >
                    <Briefcase className="w-4 h-4 flex-shrink-0" />
                    <span>Workers</span>
                  </Link>
                  <Link
                    href="/menu"
                    onClick={closeSidebar}
                    className={linkClass(isActive('/menu'))}
                  >
                    <UtensilsCrossed className="w-4 h-4 flex-shrink-0" />
                    <span>Menu</span>
                  </Link>
                  <Link
                    href="/inventory"
                    onClick={closeSidebar}
                    className={linkClass(isActive('/inventory'))}
                  >
                    <Boxes className="w-4 h-4 flex-shrink-0" />
                    <span>Inventory</span>
                  </Link>
                </div>
              </div>

              {/* Communication */}
              <div>
                <p className="text-[10px] font-bold tracking-wider text-slate-400 uppercase px-3 mb-1">
                  Communication
                </p>
                <div className="space-y-0.5">
                  <Link
                    href="/whatsapp"
                    onClick={closeSidebar}
                    className={linkClass(isActive('/whatsapp'))}
                  >
                    <MessageSquare className="w-4 h-4 flex-shrink-0" />
                    <span>WhatsApp</span>
                  </Link>
                </div>
              </div>

              {/* Finance */}
              <div>
                <p className="text-[10px] font-bold tracking-wider text-slate-400 uppercase px-3 mb-1">
                  Finance
                </p>
                <div className="space-y-0.5">
                  <Link
                    href="/revenue"
                    onClick={closeSidebar}
                    className={linkClass(isActive('/revenue'))}
                  >
                    <TrendingUp className="w-4 h-4 flex-shrink-0" />
                    <span>Revenue</span>
                  </Link>
                  <Link
                    href="/expenses"
                    onClick={closeSidebar}
                    className={linkClass(isActive('/expenses'))}
                  >
                    <Receipt className="w-4 h-4 flex-shrink-0" />
                    <span>Expenses</span>
                  </Link>
                  <Link
                    href="/reports"
                    onClick={closeSidebar}
                    className={linkClass(isActive('/reports'))}
                  >
                    <FileBarChart2 className="w-4 h-4 flex-shrink-0" />
                    <span>Reports</span>
                  </Link>
                </div>
              </div>

              {/* Settings & Account */}
              <div>
                <p className="text-[10px] font-bold tracking-wider text-slate-400 uppercase px-3 mb-1">
                  Settings
                </p>
                <div className="space-y-0.5">
                  <Link
                    href="/settings"
                    onClick={closeSidebar}
                    className={linkClass(isActive('/settings'))}
                  >
                    <Settings className="w-4 h-4 flex-shrink-0" />
                    <span>Restaurant Settings</span>
                  </Link>
                  <Link
                    href="/profile"
                    onClick={closeSidebar}
                    className={linkClass(isActive('/profile'))}
                  >
                    <User className="w-4 h-4 flex-shrink-0" />
                    <span>My Profile</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer text-left"
                  >
                    <LogOut className="w-4 h-4 flex-shrink-0" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Compact User Info Footer */}
        <div className="p-3 border-t border-slate-100 dark:border-slate-800 flex-shrink-0">
          <div className="px-2.5 py-2 bg-slate-50 dark:bg-slate-800/80 rounded-xl flex items-center space-x-2 border border-slate-100 dark:border-slate-800">
            <div
              className={`w-7 h-7 rounded-lg font-bold text-xs flex items-center justify-center shrink-0 ${
                isWorker
                  ? 'bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400'
                  : 'bg-orange-100 dark:bg-orange-950/60 text-orange-700 dark:text-orange-400'
              }`}
            >
              {user?.name?.charAt(0).toUpperCase() || (isWorker ? 'W' : 'A')}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate leading-tight">
                {user?.name || (isWorker ? 'Worker' : 'Administrator')}
              </p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate leading-tight">
                {isWorker ? 'Staff Operations' : 'Restaurant Admin'}
              </p>
            </div>
            <button
              onClick={toggleTheme}
              title={`Switch to ${resolvedTheme === 'dark' ? 'Light' : 'Dark'} mode`}
              aria-label="Toggle theme"
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-700/60 transition cursor-pointer"
            >
              {resolvedTheme === 'dark' ? (
                <Sun className="w-3.5 h-3.5 text-amber-400" />
              ) : (
                <Moon className="w-3.5 h-3.5 text-slate-500" />
              )}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
