'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, ArrowLeft, MapPin, Phone, CreditCard, MessageCircle, CheckCircle } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import AuthGuard from '@/components/AuthGuard';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

function CheckoutContent() {
  const { items, totalPrice, totalItems, deliveryFee, taxes, grandTotal, clearCart } = useCartStore();
  const { user } = useAuthStore();
  const router = useRouter();
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState(user?.phone || '');
  const [paymentMethod, setPaymentMethod] = useState<'online' | 'whatsapp'>('online');

  useEffect(() => {
    if (user?.phone && !phone) {
      setPhone(user.phone);
    }
  }, [user, phone]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;

    if (paymentMethod === 'whatsapp') {
      const orderLines = items.map((i) => {
        let line = `${i.quantity}x ${i.name}`;
        const tags: string[] = [];
        if (i.unit) tags.push(i.unit);
        if (i.customization?.spiceLevel) tags.push(`Spice: ${i.customization.spiceLevel}`);
        if (i.customization?.addOns && i.customization.addOns.length > 0) {
          tags.push(`Add-ons: ${i.customization.addOns.map((a) => a.name).join(', ')}`);
        }
        if (i.customization?.weight) tags.push(`Weight: ${i.customization.weight}`);
        if (i.customization?.isEggless) tags.push('Eggless');
        if (i.customization?.cakeMessage) tags.push(`Message: "${i.customization.cakeMessage}"`);
        if (i.customization?.deliveryDate) tags.push(`Delivery: ${i.customization.deliveryDate} (${i.customization.deliverySlot || ''})`);
        if (i.customization?.notes) tags.push(`Note: ${i.customization.notes}`);

        if (tags.length > 0) {
          line += ` (${tags.join(' | ')})`;
        }
        line += ` - ₹${i.price * i.quantity}`;
        return line;
      });

      const orderText = orderLines.join('%0A');
      const waLink = `https://wa.me/919113342012?text=New%20Floveera%20Order!%0A%0A${orderText}%0A%0A*Total:*%20₹${grandTotal}%0A*Delivery%20Fee:*%20${deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}%0A*Address:*%20${encodeURIComponent(address)}%0A*Phone:*%20${encodeURIComponent(phone)}`;
      window.open(waLink, '_blank');
      clearCart();
      router.push('/order-success');
    } else {
      // Mock Online Payment
      clearCart();
      router.push('/order-success');
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-sm mb-6">
          <ShoppingBag className="h-10 w-10 text-gray-400" />
        </div>
        <h2 className="text-2xl font-bold text-brand-blue mb-2">Cart is Empty</h2>
        <p className="text-gray-500 mb-8">You need to add items to your cart before checking out.</p>
        <Link 
          href="/"
          className="bg-brand-orange text-white px-8 py-3 rounded-xl font-bold hover:bg-brand-orangeHover transition-colors"
        >
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center">
          <button onClick={() => router.back()} className="p-2 -ml-2 hover:bg-gray-50 rounded-full transition-colors">
            <ArrowLeft className="h-6 w-6 text-brand-blue" />
          </button>
          <h1 className="text-lg font-bold text-brand-blue ml-2">Checkout</h1>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6">
        <form onSubmit={handleSubmit} className="space-y-6 flex flex-col md:flex-row md:space-y-0 md:space-x-8">
          
          <div className="flex-1 space-y-6">
            {/* Delivery Details */}
            <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h2 className="text-lg font-bold text-brand-text mb-4 flex items-center">
                <MapPin className="h-5 w-5 mr-2 text-brand-orange" /> Delivery Details
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input 
                      type="tel" 
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="10-digit mobile number"
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-orange focus:border-brand-orange outline-none transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Address</label>
                  <textarea 
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="House No, Area, Landmark"
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-orange focus:border-brand-orange outline-none transition-all resize-none"
                  />
                </div>
              </div>
            </section>

            {/* Payment Method */}
            <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h2 className="text-lg font-bold text-brand-text mb-4 flex items-center">
                <CreditCard className="h-5 w-5 mr-2 text-brand-blue" /> Payment Method
              </h2>
              <div className="space-y-3">
                <label className={`block w-full cursor-pointer p-4 rounded-xl border-2 transition-all ${paymentMethod === 'online' ? 'border-brand-blue bg-brand-blue/5' : 'border-gray-100 hover:border-gray-200'}`}>
                  <div className="flex items-center">
                    <input 
                      type="radio" 
                      name="payment" 
                      value="online" 
                      checked={paymentMethod === 'online'}
                      onChange={() => setPaymentMethod('online')}
                      className="h-5 w-5 text-brand-blue focus:ring-brand-blue"
                    />
                    <div className="ml-3 flex-1 flex items-center justify-between">
                      <span className="font-semibold text-brand-text">Pay Online (Mock)</span>
                      <CreditCard className="h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                </label>
                
                <label className={`block w-full cursor-pointer p-4 rounded-xl border-2 transition-all ${paymentMethod === 'whatsapp' ? 'border-brand-green bg-brand-green/5' : 'border-gray-100 hover:border-gray-200'}`}>
                  <div className="flex items-center">
                    <input 
                      type="radio" 
                      name="payment" 
                      value="whatsapp" 
                      checked={paymentMethod === 'whatsapp'}
                      onChange={() => setPaymentMethod('whatsapp')}
                      className="h-5 w-5 text-brand-green focus:ring-brand-green"
                    />
                    <div className="ml-3 flex-1 flex items-center justify-between">
                      <span className="font-semibold text-brand-text">Order via WhatsApp</span>
                      <MessageCircle className="h-5 w-5 text-brand-green" />
                    </div>
                  </div>
                </label>
              </div>
            </section>
          </div>

          {/* Order Summary */}
          <div className="w-full md:w-80 space-y-6">
            <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 sticky top-24">
              <h2 className="text-lg font-bold text-brand-text mb-4">Order Summary</h2>
              
              <div className="space-y-3 mb-6 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {items.map((item) => (
                  <div key={item.id} className="flex flex-col text-sm border-b border-gray-50 pb-2">
                    <div className="flex justify-between">
                      <span className="text-gray-800 font-semibold truncate mr-2">
                        {item.quantity}x {item.name}
                      </span>
                      <span className="font-bold text-gray-900">₹{item.price * item.quantity}</span>
                    </div>
                    {item.unit && (
                      <span className="text-[11px] text-gray-400 font-medium">{item.unit}</span>
                    )}
                    {item.customization?.spiceLevel && (
                      <span className="text-[11px] text-orange-600">Spice: {item.customization.spiceLevel}</span>
                    )}
                    {item.customization?.addOns && item.customization.addOns.length > 0 && (
                      <span className="text-[11px] text-gray-500">
                        Addons: {item.customization.addOns.map((a) => a.name).join(', ')}
                      </span>
                    )}
                    {item.customization?.cakeMessage && (
                      <span className="text-[11px] italic text-brand-orange">
                        &ldquo;{item.customization.cakeMessage}&rdquo;
                      </span>
                    )}
                    {item.customization?.deliveryDate && (
                      <span className="text-[11px] text-brand-blue">
                        Delivery: {item.customization.deliveryDate} ({item.customization.deliverySlot || ''})
                      </span>
                    )}
                  </div>
                ))}
              </div>

              <div className="space-y-3 pt-4 border-t border-dashed border-gray-200 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Item Total</span>
                  <span>₹{totalPrice}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Delivery Fee</span>
                  <span>₹{deliveryFee}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Taxes (GST)</span>
                  <span>₹{taxes}</span>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-gray-100 flex justify-between items-center mb-6">
                <span className="font-bold text-brand-text text-lg">To Pay</span>
                <span className="font-bold text-brand-orange text-xl">₹{grandTotal}</span>
              </div>

              <button 
                type="submit"
                className="w-full bg-gradient-to-r from-brand-orange to-brand-orangeHover text-white py-4 rounded-xl font-bold text-lg hover:shadow-lg transition-all active:scale-95 flex items-center justify-center space-x-2"
              >
                {paymentMethod === 'whatsapp' ? (
                  <>
                    <span>Send on WhatsApp</span>
                    <MessageCircle className="h-5 w-5" />
                  </>
                ) : (
                  <>
                    <span>Pay ₹{grandTotal}</span>
                    <CheckCircle className="h-5 w-5" />
                  </>
                )}
              </button>
            </section>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <AuthGuard allowedRoles={['user', 'admin']}>
      <CheckoutContent />
    </AuthGuard>
  );
}
