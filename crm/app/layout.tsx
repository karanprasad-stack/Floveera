import './globals.css';
import type { Metadata } from 'next';
import CrmThemeInitializer from '@/components/CrmThemeInitializer';

export const metadata: Metadata = {
  title: 'Floveera Restaurant CRM — Operations & Management Portal',
  description: 'Internal operational system for Floveera Restaurant staff and administrators',
};

const themeScript = `
  try {
    const stored = localStorage.getItem('crm_theme') || 'system';
    const isDark = stored === 'dark' || (stored === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    if (isDark) {
      document.documentElement.classList.add('dark');
      document.documentElement.style.colorScheme = 'dark';
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.style.colorScheme = 'light';
    }
  } catch (e) {}
`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 antialiased min-h-screen transition-colors duration-150">
        <CrmThemeInitializer />
        {children}
      </body>
    </html>
  );
}
