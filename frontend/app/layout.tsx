import './globals.css';
import type { Metadata } from 'next';
import { Inter, Outfit } from 'next/font/google';
import FloatingCart from '@/components/FloatingCart';
import CartDrawer from '@/components/CartDrawer';
import LoginPromptModal from '@/components/LoginPromptModal';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Floveera - Fresh Taste & Everyday Essentials',
  description: 'A modern shopping and food destination offering supermart shopping, sweets, bakery items, and restaurant food in one place. Located in Matar, Kaimur, Bihar.',
  openGraph: {
    images: [
      {
        url: 'https://bolt.new/static/og_default.png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    images: [
      {
        url: 'https://bolt.new/static/og_default.png',
      },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable}`}>
      <body className={`${inter.className} font-sans antialiased text-brand-text bg-[#FAFAF9]`}>
        {children}
        <FloatingCart />
        <CartDrawer />
        <LoginPromptModal />
      </body>
    </html>
  );
}
