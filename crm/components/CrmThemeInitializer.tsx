'use client';

import { useEffect } from 'react';
import { useCrmUiStore } from '@/store/crmUiStore';

export default function CrmThemeInitializer() {
  const { initTheme } = useCrmUiStore();

  useEffect(() => {
    initTheme();
  }, [initTheme]);

  return null;
}
