'use client';

import Link from 'next/link';
import { Facebook, Instagram, Phone, Mail, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-brand-blue text-white mt-auto border-t border-white/10 relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-2xl font-bold mb-4 text-brand-orange">Floveera</h3>
            <p className="text-sm text-gray-300">
              FLOVEERA PRIVATE LIMITED
            </p>
            <p className="text-sm text-gray-400 mt-2">
              Your one-stop destination for shopping, sweets, bakery, and restaurant food.
            </p>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li><Link href="/" className="text-gray-300 hover:text-brand-orange transition-colors">Home</Link></li>
              <li><Link href="/supermart" className="text-gray-300 hover:text-brand-orange transition-colors">Supermart</Link></li>
              <li><Link href="/restaurant" className="text-gray-300 hover:text-brand-orange transition-colors">Restaurant</Link></li>
              <li><Link href="/cakes" className="text-gray-300 hover:text-brand-orange transition-colors">Cakes & Bakery</Link></li>
              <li><Link href="/contact" className="text-gray-300 hover:text-brand-orange transition-colors">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">Contact Info</h4>
            <ul className="space-y-3 text-sm text-gray-300">
              <li className="flex items-start space-x-2">
                <MapPin className="h-5 w-5 text-brand-orange flex-shrink-0 mt-0.5" />
                <span>Matar, Umapur, Bhagwanpur, Kaimur (Bhabua) - 821102, Bihar</span>
              </li>
              <li className="flex items-center space-x-2">
                <Phone className="h-5 w-5 text-brand-orange" />
                <span>9113342012</span>
              </li>
              <li className="flex items-center space-x-2">
                <Mail className="h-5 w-5 text-brand-orange" />
                <span>mart.floveera@gmail.com</span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">Follow Us</h4>
            <div className="flex space-x-4">
              <a
                href="https://www.instagram.com/floveeraindiaofficial/"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-brand-orange p-3 rounded-full hover:bg-brand-orangeHover transition-colors"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="https://www.facebook.com/floveeraindiaoffical"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-brand-orange p-3 rounded-full hover:bg-brand-orangeHover transition-colors"
              >
                <Facebook className="h-5 w-5" />
              </a>
            </div>
            <div className="mt-6">
              <p className="text-sm font-semibold text-gray-300">Business Hours</p>
              <p className="text-sm text-gray-400 mt-1">9 AM - 10 PM</p>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-sm text-gray-400">
          <p>&copy; {new Date().getFullYear()} FLOVEERA PRIVATE LIMITED. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
