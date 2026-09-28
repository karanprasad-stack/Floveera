'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShoppingBag, 
  ArrowLeft, 
  MapPin, 
  Phone, 
  CreditCard, 
  MessageCircle, 
  CheckCircle2, 
  Plus, 
  X, 
  ChevronRight,
  Home,
  Briefcase,
  Banknote
} from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import AuthGuard from '@/components/AuthGuard';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createCustomerOrder, getUserAddresses, getUserProfile, addUserAddress } from '@/lib/api';

function CheckoutContent() {
  const { items, totalPrice, deliveryFee, taxes, grandTotal, clearCart } = useCartStore();
  const { user } = useAuthStore();
  const router = useRouter();

  // Form Fields State
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState(user?.phone || '');
  const [paymentMethod, setPaymentMethod] = useState<'online' | 'whatsapp' | 'cod'>('online');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Saved Addresses State
  const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [selectedAddressLabel, setSelectedAddressLabel] = useState<string | null>(null);
  const [selectedAddressObj, setSelectedAddressObj] = useState<any>(null);

  // Modal State
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [isAddingNewAddress, setIsAddingNewAddress] = useState(false);
  const [isSavingAddress, setIsSavingAddress] = useState(false);
  const [newAddressForm, setNewAddressForm] = useState({
    label: 'Home' as 'Home' | 'Work' | 'Other',
    fullName: user?.name || '',
    phone: user?.phone || '',
    addressLine1: '',
    addressLine2: '',
    landmark: '',
    city: 'Bhagwanpur',
    state: 'Bihar',
    pincode: '821102'
  });

  // Load saved addresses on mount and automatically prefill
  useEffect(() => {
    async function loadUserAddresses() {
      try {
        const [addrs, profile] = await Promise.all([
          getUserAddresses().catch(() => []),
          getUserProfile().catch(() => null)
        ]);

        const validAddrs = Array.isArray(addrs) ? addrs : [];
        setSavedAddresses(validAddrs);

        const fallbackPhone = profile?.phone || user?.phone || '';

        if (validAddrs.length > 0) {
          // Select default or first address
          const defaultAddr = validAddrs.find((a: any) => a.isDefault) || validAddrs[0];
          applySelectedAddress(defaultAddr);
        } else if (fallbackPhone && !phone) {
          setPhone(fallbackPhone);
        }
      } catch (err) {
        console.error('Error loading saved addresses:', err);
      }
    }

    loadUserAddresses();
  }, [user]);

  // Apply a saved address to the checkout form fields
  const applySelectedAddress = (addr: any) => {
    setSelectedAddressId(addr._id);
    setSelectedAddressLabel(addr.label || 'Home');
    setSelectedAddressObj(addr);

    // Format address string
    const formatted = [
      addr.addressLine1,
      addr.addressLine2,
      addr.landmark ? `Near ${addr.landmark}` : '',
      `${addr.city}, ${addr.state || 'Bihar'} - ${addr.pincode}`
    ].filter(Boolean).join(', ');

    setAddress(formatted);

    // Auto-fill phone number
    if (addr.phone) {
      setPhone(addr.phone);
    } else if (user?.phone) {
      setPhone(user.phone);
    }
  };

  // User manually edits phone or address (clears preset badge if manually modified)
  const handleAddressChange = (val: string) => {
    setAddress(val);
    if (selectedAddressLabel) {
      setSelectedAddressLabel(null);
      setSelectedAddressObj(null);
    }
  };

  const handlePhoneChange = (val: string) => {
    setPhone(val);
  };

  // Add new address from checkout modal
  const handleSaveNewAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddressForm.fullName.trim() || !newAddressForm.phone.trim() || !newAddressForm.addressLine1.trim() || !newAddressForm.city.trim() || !newAddressForm.pincode.trim()) {
      alert('Please fill in all required address fields.');
      return;
    }

    setIsSavingAddress(true);
    try {
      const res = await addUserAddress(newAddressForm);
      const updatedList = res.addresses || [];
      setSavedAddresses(updatedList);

      // Find the newly added address (usually the last or matching form)
      const newlyAdded = updatedList[updatedList.length - 1] || updatedList[0];
      if (newlyAdded) {
        applySelectedAddress(newlyAdded);
      }

      setIsAddingNewAddress(false);
      setIsAddressModalOpen(false);
    } catch (err: any) {
      alert(err?.message || 'Failed to save address. Please try again.');
    } finally {
      setIsSavingAddress(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0 || isSubmitting) return;

    if (!phone.trim()) {
      alert('Please provide a delivery phone number.');
      return;
    }

    if (!address.trim()) {
      alert('Please provide a delivery address.');
      return;
    }

    setIsSubmitting(true);

    // Create address snapshot for the order
    const addressSnapshot = {
      label: selectedAddressLabel || 'Custom',
      fullName: selectedAddressObj?.fullName || user?.name || 'Customer',
      phone: phone.trim(),
      addressLine1: address.trim(),
      city: selectedAddressObj?.city || 'Bhagwanpur',
      state: selectedAddressObj?.state || 'Bihar',
      pincode: selectedAddressObj?.pincode || '821102',
    };

    try {
      await createCustomerOrder({
        items: items.map((i) => ({
          productId: i.productId,
          name: i.name,
          price: i.price,
          originalPrice: i.originalPrice,
          quantity: i.quantity,
          unit: i.unit,
          image: i.image,
          customization: i.customization,
        })),
        storeName: items.some(i => i.vertical === 'cakes') 
          ? 'Floveera Cakes & Bakery' 
          : items.some(i => i.vertical === 'supermart') 
          ? 'Floveera Supermart' 
          : 'Floveera Restaurant',
        vertical: items[0]?.vertical || 'restaurant',
        deliveryAddress: addressSnapshot,
        paymentMethod: paymentMethod,
        deliveryFee,
        taxes,
        discount: 0,
      });
    } catch (err) {
      console.error('Order creation error:', err);
    } finally {
      setIsSubmitting(false);
    }

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
      // Online and Cash on Delivery (COD) confirmation flow
      clearCart();
      router.push('/order-success');
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-[#FAFAF9] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 bg-white rounded-3xl border border-gray-100 flex items-center justify-center shadow-card mb-5">
          <ShoppingBag className="h-10 w-10 text-gray-400" />
        </div>
        <h2 className="text-2xl font-display font-extrabold text-brand-blue mb-2">Cart is Empty</h2>
        <p className="text-gray-500 text-sm max-w-sm mb-6">
          Your cart is currently empty. Browse our menu to add delicious items before checking out.
        </p>
        <Link 
          href="/"
          className="bg-brand-orange text-white px-7 py-3 rounded-2xl font-bold text-sm hover:bg-brand-orangeHover shadow-sm shadow-brand-orange/20 transition-all"
        >
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAF9] text-brand-text font-sans">
      <main className="max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {/* Subtle Top-Left Back Button and Page Header */}
        <div className="mb-6">
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex items-center space-x-1.5 text-xs sm:text-sm font-semibold text-gray-500 hover:text-gray-900 transition-colors py-1.5 px-2.5 -ml-2.5 rounded-xl hover:bg-gray-100 mb-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
          <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-brand-blue tracking-tight">
            Checkout
          </h1>
        </div>

        {/* Balanced Two-Column Desktop Grid in Normal Page Flow */}
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Column: Delivery Details & Payment Method (Normal Document Flow) */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Delivery Details Card */}
              <section className="bg-white p-6 sm:p-7 rounded-3xl shadow-card border border-gray-100 space-y-5">
                <div className="flex items-center justify-between pb-1">
                  <h2 className="text-lg font-display font-bold text-gray-900 flex items-center">
                    <MapPin className="h-5 w-5 mr-2 text-brand-orange flex-shrink-0" />
                    <span>Delivery Details</span>
                  </h2>
                </div>

                <div className="space-y-4">
                  {/* Phone Number Input */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">
                      Phone Number *
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input 
                        type="tel" 
                        required
                        value={phone}
                        onChange={(e) => handlePhoneChange(e.target.value)}
                        placeholder="10-digit mobile number"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:ring-1 focus:ring-brand-orange focus:border-brand-orange outline-none transition-all text-xs sm:text-sm font-medium"
                      />
                    </div>
                  </div>

                  {/* Full Delivery Address Input */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">
                      Full Delivery Address *
                    </label>
                    <textarea 
                      required
                      value={address}
                      onChange={(e) => handleAddressChange(e.target.value)}
                      placeholder="Flat, House no., Building, Street, Area, Landmark, City, Pincode"
                      rows={3}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-1 focus:ring-brand-orange focus:border-brand-orange outline-none transition-all resize-none text-xs sm:text-sm font-medium leading-relaxed"
                    />

                    {/* Action Bar below Full Delivery Address */}
                    <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2.5">
                      <button
                        type="button"
                        onClick={() => {
                          setIsAddingNewAddress(false);
                          setIsAddressModalOpen(true);
                        }}
                        className="inline-flex items-center space-x-1.5 text-xs font-semibold text-gray-600 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 border border-gray-200 px-3.5 py-1.5 rounded-xl transition-all"
                      >
                        <MapPin className="w-3.5 h-3.5 text-gray-400" />
                        <span>See Saved Addresses →</span>
                      </button>

                      {selectedAddressLabel && (
                        <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-full flex items-center space-x-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>✓ {selectedAddressLabel} address selected</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </section>

              {/* Payment Method Card */}
              <section className="bg-white p-6 sm:p-7 rounded-3xl shadow-card border border-gray-100 space-y-4">
                <h2 className="text-lg font-display font-bold text-gray-900 flex items-center">
                  <CreditCard className="h-5 w-5 mr-2 text-brand-orange flex-shrink-0" />
                  <span>Payment Method</span>
                </h2>

                <div className="space-y-3 pt-1">
                  {/* Pay Online */}
                  <label 
                    className={`block w-full cursor-pointer p-4 rounded-2xl border-2 transition-all ${
                      paymentMethod === 'online' 
                        ? 'border-brand-orange bg-orange-50/20' 
                        : 'border-gray-100 hover:border-gray-200 bg-white'
                    }`}
                  >
                    <div className="flex items-center">
                      <input 
                        type="radio" 
                        name="payment" 
                        value="online" 
                        checked={paymentMethod === 'online'}
                        onChange={() => setPaymentMethod('online')}
                        className="h-4 w-4 accent-brand-orange"
                      />
                      <div className="ml-3 flex-1 flex items-center justify-between">
                        <div>
                          <p className="font-bold text-gray-900 text-xs sm:text-sm">Pay Online</p>
                          <p className="text-[11px] text-gray-400">Cards, UPI (Google Pay, PhonePe), NetBanking</p>
                        </div>
                        <CreditCard className="h-5 w-5 text-gray-400 flex-shrink-0" />
                      </div>
                    </div>
                  </label>
                  
                  {/* Cash on Delivery (COD) */}
                  <label 
                    className={`block w-full cursor-pointer p-4 rounded-2xl border-2 transition-all ${
                      paymentMethod === 'cod' 
                        ? 'border-brand-orange bg-orange-50/20' 
                        : 'border-gray-100 hover:border-gray-200 bg-white'
                    }`}
                  >
                    <div className="flex items-center">
                      <input 
                        type="radio" 
                        name="payment" 
                        value="cod" 
                        checked={paymentMethod === 'cod'}
                        onChange={() => setPaymentMethod('cod')}
                        className="h-4 w-4 accent-brand-orange"
                      />
                      <div className="ml-3 flex-1 flex items-center justify-between">
                        <div>
                          <p className="font-bold text-gray-900 text-xs sm:text-sm">Cash on Delivery (COD)</p>
                          <p className="text-[11px] text-gray-400">Pay cash or UPI at your doorstep upon delivery</p>
                        </div>
                        <Banknote className="h-5 w-5 text-gray-400 flex-shrink-0" />
                      </div>
                    </div>
                  </label>

                  {/* Order via WhatsApp */}
                  <label 
                    className={`block w-full cursor-pointer p-4 rounded-2xl border-2 transition-all ${
                      paymentMethod === 'whatsapp' 
                        ? 'border-emerald-600 bg-emerald-50/20' 
                        : 'border-gray-100 hover:border-gray-200 bg-white'
                    }`}
                  >
                    <div className="flex items-center">
                      <input 
                        type="radio" 
                        name="payment" 
                        value="whatsapp" 
                        checked={paymentMethod === 'whatsapp'}
                        onChange={() => setPaymentMethod('whatsapp')}
                        className="h-4 w-4 accent-emerald-600"
                      />
                      <div className="ml-3 flex-1 flex items-center justify-between">
                        <div>
                          <p className="font-bold text-gray-900 text-xs sm:text-sm">Order via WhatsApp</p>
                          <p className="text-[11px] text-gray-400">Send order directly to restaurant team via WhatsApp</p>
                        </div>
                        <MessageCircle className="h-5 w-5 text-emerald-600 flex-shrink-0" />
                      </div>
                    </div>
                  </label>
                </div>
              </section>
            </div>

            {/* Right Column: Order Summary in NORMAL Document Flow (Not Sticky) */}
            <div className="lg:col-span-5">
              <section className="bg-white p-6 sm:p-7 rounded-3xl shadow-card border border-gray-100 space-y-5">
                <h2 className="text-lg font-display font-bold text-gray-900">
                  Order Summary
                </h2>
                
                {/* Items List - Rendered in natural page flow without inner scrollbar */}
                <div className="space-y-3 divide-y divide-gray-50">
                  {items.map((item) => (
                    <div key={item.id} className="pt-3 first:pt-0 flex items-start justify-between text-xs sm:text-sm">
                      <div className="pr-3 flex-1 min-w-0">
                        <p className="font-semibold text-gray-800 truncate">
                          {item.quantity}× {item.name}
                        </p>
                        {item.unit && (
                          <p className="text-[11px] text-gray-400">{item.unit}</p>
                        )}
                        {item.customization?.spiceLevel && (
                          <span className="text-[10px] text-orange-600 font-medium">
                            Spice: {item.customization.spiceLevel}
                          </span>
                        )}
                      </div>
                      <span className="font-bold text-gray-900 flex-shrink-0">
                        ₹{item.price * item.quantity}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Price Breakdown */}
                <div className="space-y-2.5 pt-4 border-t border-dashed border-gray-200 text-xs sm:text-sm">
                  <div className="flex justify-between text-gray-500">
                    <span>Item Total</span>
                    <span className="font-semibold text-gray-800">₹{totalPrice}</span>
                  </div>
                  <div className="flex justify-between text-gray-500">
                    <span>Delivery Fee</span>
                    <span className="font-semibold text-gray-800">
                      {deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}
                    </span>
                  </div>
                  {taxes > 0 && (
                    <div className="flex justify-between text-gray-500">
                      <span>Taxes (GST)</span>
                      <span className="font-semibold text-gray-800">₹{taxes}</span>
                    </div>
                  )}
                </div>

                {/* Total To Pay */}
                <div className="pt-4 border-t border-gray-100 flex justify-between items-baseline">
                  <span className="font-display font-bold text-gray-900 text-base">To Pay</span>
                  <span className="font-display font-black text-brand-orange text-2xl">
                    ₹{grandTotal}
                  </span>
                </div>

                {/* Pay Action Button */}
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-brand-orange hover:bg-brand-orangeHover text-white py-3.5 rounded-2xl font-bold text-sm shadow-md shadow-brand-orange/20 transition-all active:scale-98 flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  {paymentMethod === 'whatsapp' ? (
                    <>
                      <span>Send on WhatsApp</span>
                      <MessageCircle className="h-4 w-4" />
                    </>
                  ) : paymentMethod === 'cod' ? (
                    <>
                      <span>Place COD Order (₹{grandTotal})</span>
                      <ChevronRight className="h-4 w-4" />
                    </>
                  ) : (
                    <>
                      <span>Pay ₹{grandTotal}</span>
                      <ChevronRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </section>
            </div>

          </div>
        </form>
      </main>

      {/* ==================================================== */}
      {/* MODAL: SEE SAVED ADDRESSES */}
      {/* ==================================================== */}
      <AnimatePresence>
        {isAddressModalOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-6 sm:p-7 max-w-lg w-full shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto"
            >
              {/* Modal Header */}
              <div className="flex justify-between items-start mb-5">
                <div>
                  <h3 className="font-display font-bold text-gray-900 text-lg">
                    {isAddingNewAddress ? 'Add New Address' : 'Select Saved Address'}
                  </h3>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {isAddingNewAddress 
                      ? 'Enter delivery details for this address' 
                      : 'Choose a delivery address for this order.'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsAddressModalOpen(false);
                    setIsAddingNewAddress(false);
                  }}
                  className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* View 1: Select From Saved Addresses */}
              {!isAddingNewAddress && (
                <div className="space-y-4">
                  <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                    {savedAddresses.map((addr) => {
                      const isSelected = selectedAddressId === addr._id;
                      return (
                        <div
                          key={addr._id}
                          onClick={() => {
                            applySelectedAddress(addr);
                            setIsAddressModalOpen(false);
                          }}
                          className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                            isSelected
                              ? 'border-brand-orange bg-orange-50/30 ring-1 ring-brand-orange'
                              : 'border-gray-200 hover:border-gray-300 bg-white'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1.5">
                            <div className="flex items-center space-x-2">
                              {/* Selection Indicator Bullet */}
                              <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                                isSelected ? 'border-brand-orange' : 'border-gray-300'
                              }`}>
                                {isSelected && <div className="w-2 h-2 rounded-full bg-brand-orange" />}
                              </div>

                              <span className="text-xs font-bold text-gray-900 flex items-center space-x-1">
                                {addr.label === 'Home' && <Home className="w-3 h-3 text-brand-orange" />}
                                {addr.label === 'Work' && <Briefcase className="w-3 h-3 text-brand-blue" />}
                                <span>{addr.label || 'Home'}</span>
                              </span>
                            </div>

                            {addr.isDefault && (
                              <span className="text-[10px] font-bold text-brand-orange bg-brand-orange/10 px-2 py-0.5 rounded-full uppercase tracking-wider">
                                Default
                              </span>
                            )}
                          </div>

                          <p className="text-xs font-bold text-gray-900 ml-6">{addr.fullName}</p>
                          <p className="text-xs text-gray-600 mt-0.5 ml-6 leading-relaxed">
                            {addr.addressLine1}
                            {addr.addressLine2 && `, ${addr.addressLine2}`}
                          </p>
                          {addr.landmark && (
                            <p className="text-[11px] text-gray-400 ml-6">Landmark: {addr.landmark}</p>
                          )}
                          <p className="text-xs text-gray-500 mt-0.5 ml-6">
                            {addr.city}, {addr.state} - {addr.pincode}
                          </p>
                          <p className="text-xs font-semibold text-gray-700 mt-1 ml-6">
                            Phone: {addr.phone}
                          </p>
                        </div>
                      );
                    })}
                  </div>

                  {/* Add New Address Button */}
                  <div className="pt-2 border-t border-gray-100 flex justify-between items-center">
                    <button
                      type="button"
                      onClick={() => setIsAddingNewAddress(true)}
                      className="inline-flex items-center space-x-1.5 text-xs font-bold text-brand-orange hover:text-brand-orangeHover transition-colors py-2"
                    >
                      <Plus className="w-4 h-4" />
                      <span>+ Add New Address</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsAddressModalOpen(false)}
                      className="px-4 py-2 text-xs font-semibold text-gray-500 hover:text-gray-800"
                    >
                      Done
                    </button>
                  </div>
                </div>
              )}

              {/* View 2: Add New Address Form Inside Modal */}
              {isAddingNewAddress && (
                <form onSubmit={handleSaveNewAddress} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">
                      Address Label
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {(['Home', 'Work', 'Other'] as const).map((lbl) => (
                        <button
                          key={lbl}
                          type="button"
                          onClick={() => setNewAddressForm({ ...newAddressForm, label: lbl })}
                          className={`py-2 rounded-xl text-xs font-bold transition-all border ${
                            newAddressForm.label === lbl
                              ? 'bg-brand-orange text-white border-brand-orange shadow-sm'
                              : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                          }`}
                        >
                          {lbl}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Full Name *</label>
                      <input
                        type="text"
                        required
                        value={newAddressForm.fullName}
                        onChange={(e) => setNewAddressForm({ ...newAddressForm, fullName: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs sm:text-sm focus:outline-none focus:border-brand-orange"
                        placeholder="Recipient Name"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Phone Number *</label>
                      <input
                        type="tel"
                        required
                        value={newAddressForm.phone}
                        onChange={(e) => setNewAddressForm({ ...newAddressForm, phone: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs sm:text-sm focus:outline-none focus:border-brand-orange"
                        placeholder="10-digit number"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Address Line 1 (Flat, House no., Building) *
                    </label>
                    <input
                      type="text"
                      required
                      value={newAddressForm.addressLine1}
                      onChange={(e) => setNewAddressForm({ ...newAddressForm, addressLine1: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs sm:text-sm focus:outline-none focus:border-brand-orange"
                      placeholder="e.g. House #42, Main Road"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Address Line 2 (Area, Colony, Street)
                    </label>
                    <input
                      type="text"
                      value={newAddressForm.addressLine2}
                      onChange={(e) => setNewAddressForm({ ...newAddressForm, addressLine2: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs sm:text-sm focus:outline-none focus:border-brand-orange"
                      placeholder="e.g. Ward 3, Matar"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Landmark</label>
                      <input
                        type="text"
                        value={newAddressForm.landmark}
                        onChange={(e) => setNewAddressForm({ ...newAddressForm, landmark: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs sm:text-sm focus:outline-none focus:border-brand-orange"
                        placeholder="Near Temple"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">City *</label>
                      <input
                        type="text"
                        required
                        value={newAddressForm.city}
                        onChange={(e) => setNewAddressForm({ ...newAddressForm, city: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs sm:text-sm focus:outline-none focus:border-brand-orange"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">State *</label>
                      <input
                        type="text"
                        required
                        value={newAddressForm.state}
                        onChange={(e) => setNewAddressForm({ ...newAddressForm, state: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs sm:text-sm focus:outline-none focus:border-brand-orange"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Pincode *</label>
                      <input
                        type="text"
                        required
                        maxLength={6}
                        value={newAddressForm.pincode}
                        onChange={(e) => setNewAddressForm({ ...newAddressForm, pincode: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs sm:text-sm focus:outline-none focus:border-brand-orange"
                        placeholder="821102"
                      />
                    </div>
                  </div>

                  <div className="pt-3 flex justify-end space-x-3 border-t border-gray-100">
                    <button
                      type="button"
                      onClick={() => setIsAddingNewAddress(false)}
                      className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100"
                    >
                      Back to Saved Addresses
                    </button>
                    <button
                      type="submit"
                      disabled={isSavingAddress}
                      className="px-5 py-2 rounded-xl bg-brand-orange text-white text-xs font-bold hover:bg-brand-orangeHover disabled:opacity-50 shadow-sm"
                    >
                      {isSavingAddress ? 'Saving...' : 'Save & Select Address'}
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
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
