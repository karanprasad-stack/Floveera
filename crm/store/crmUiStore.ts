import { create } from 'zustand';

export type CrmTheme = 'light' | 'dark' | 'system';

interface CrmUiState {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  closeSidebar: () => void;
  theme: CrmTheme;
  resolvedTheme: 'light' | 'dark';
  setTheme: (theme: CrmTheme) => void;
  toggleTheme: () => void;
  initTheme: () => void;
}

const applyThemeToDom = (theme: CrmTheme): 'light' | 'dark' => {
  if (typeof window === 'undefined') return 'light';

  let effective: 'light' | 'dark' = 'light';
  if (theme === 'dark') {
    effective = 'dark';
  } else if (theme === 'light') {
    effective = 'light';
  } else {
    // system
    effective = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  const root = document.documentElement;
  if (effective === 'dark') {
    root.classList.add('dark');
    root.style.colorScheme = 'dark';
  } else {
    root.classList.remove('dark');
    root.style.colorScheme = 'light';
  }

  return effective;
};

export const useCrmUiStore = create<CrmUiState>((set, get) => ({
  sidebarOpen: false,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  closeSidebar: () => set({ sidebarOpen: false }),

  theme: 'system',
  resolvedTheme: 'light',

  initTheme: () => {
    if (typeof window === 'undefined') return;
    const stored = (localStorage.getItem('crm_theme') as CrmTheme) || 'system';
    const resolved = applyThemeToDom(stored);
    set({ theme: stored, resolvedTheme: resolved });

    // Listen to OS scheme changes if on system
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const listener = (e: MediaQueryListEvent) => {
      if (get().theme === 'system') {
        const newResolved = e.matches ? 'dark' : 'light';
        applyThemeToDom('system');
        set({ resolvedTheme: newResolved });
      }
    };

    try {
      media.addEventListener('change', listener);
    } catch (e) {
      media.addListener(listener);
    }
  },

  setTheme: (newTheme: CrmTheme) => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('crm_theme', newTheme);
      } catch (e) {}
    }
    const resolved = applyThemeToDom(newTheme);
    set({ theme: newTheme, resolvedTheme: resolved });
  },

  toggleTheme: () => {
    const current = get().resolvedTheme;
    const next: CrmTheme = current === 'dark' ? 'light' : 'dark';
    get().setTheme(next);
  },
}));
