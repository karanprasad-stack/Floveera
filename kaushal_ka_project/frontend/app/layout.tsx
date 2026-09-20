import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import FloatingCart from '@/components/FloatingCart';
import CartDrawer from '@/components/CartDrawer';

const inter = Inter({ subsets: ['latin'] });

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
    <html lang="en">
      <body className={inter.className}>
        {children}
        <FloatingCart />
        <CartDrawer />
      </body>
    </html>
  );
}
