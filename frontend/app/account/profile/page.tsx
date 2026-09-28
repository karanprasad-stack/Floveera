'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import AuthGuard from '@/components/AuthGuard';
import ProfileNav from '@/components/account/ProfileNav';
import { useAuthStore } from '@/store/authStore';
import {
  getUserProfile,
  updateUserProfile,
  changeUserPassword,
  updateNotificationPreferences,
  addUserAddress,
  updateUserAddress,
  deleteUserAddress,
  setDefaultUserAddress,
  addUserPaymentMethod,
  deleteUserPaymentMethod
} from '@/lib/api';
import {
  User,
  MapPin,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  Edit2,
  Eye,
  EyeOff,
  X,
  Smartphone,
  Mail,
  Home,
  Briefcase,
  ShieldCheck,
  Check,
  ArrowLeft,
  Store
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export interface AddressItem {
  _id: string;
  label: 'Home' | 'Work' | 'Other';
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
  isDefault?: boolean;
}

export interface PaymentMethodItem {
  _id: string;
  type: 'card' | 'upi';
  cardBrand?: string;
  last4?: string;
  holderName?: string;
  expiryMonth?: string;
  expiryYear?: string;
  upiId?: string;
  isDefault?: boolean;
}

export default function ProfileSettingsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Active section derived from URL query param (?section=personal, etc.)
  const sectionParam = searchParams.get('section') || searchParams.get('tab') || 'personal';
  const [activeSection, setActiveSection] = useState(sectionParam);

  const { user, setUser } = useAuthStore();

  const [isLoading, setIsLoading] = useState(true);
  const [profileData, setProfileData] = useState<any>(null);
  const [addresses, setAddresses] = useState<AddressItem[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodItem[]>([]);
  const [notifications, setNotifications] = useState({
    orderUpdates: true,
    promotionalNotifications: false,
    emailNotifications: true,
    whatsappOrderUpdates: true,
    smsNotifications: true
  });

  // Feedback toast banner
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Profile Form State
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // Address Modal
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [addressForm, setAddressForm] = useState({
    label: 'Home' as 'Home' | 'Work' | 'Other',
    fullName: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    landmark: '',
    city: 'Bhagwanpur',
    state: 'Bihar',
    pincode: '821102',
    isDefault: false
  });
  const [isSavingAddress, setIsSavingAddress] = useState(false);

  // Payment Method Modal
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentType, setPaymentType] = useState<'card' | 'upi'>('card');
  const [cardForm, setCardForm] = useState({
    cardBrand: 'Visa',
    last4: '',
    holderName: '',
    expiryMonth: '12',
    expiryYear: '28'
  });
  const [upiForm, setUpiForm] = useState({ upiId: '' });
  const [isSavingPayment, setIsSavingPayment] = useState(false);

  // Password Form
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: ''
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  // Load all user profile information
  const loadProfile = async () => {
    setIsLoading(true);
    try {
      const data = await getUserProfile();
      setProfileData(data);
      if (data && data._id) {
        setUser(data);
      }
      setEditName(data.name || '');
      setEditPhone(data.phone || '');
      setAddresses(data.addresses || []);
      setPaymentMethods(data.paymentMethods || []);
      if (data.notificationPreferences) {
        setNotifications(data.notificationPreferences);
      }
    } catch (err: any) {
      console.error('Failed to load profile', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  // Sync state with URL parameter (?section=...)
  useEffect(() => {
    const param = searchParams.get('section') || searchParams.get('tab');
    if (param && ['personal', 'addresses', 'payments', 'security', 'notifications'].includes(param)) {
      setActiveSection(param);
    } else {
      setActiveSection('personal');
    }
  }, [searchParams]);

  const handleSectionChange = (sectionId: string) => {
    setActiveSection(sectionId);
    router.push(`/account/profile?section=${sectionId}`);
  };



  const showToast = (type: 'success' | 'error', text: string) => {
    setStatusMessage({ type, text });
    setTimeout(() => {
      setStatusMessage(null);
    }, 4500);
  };

  // --- Handlers: Profile ---
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim()) {
      showToast('error', 'Full name is required');
      return;
    }

    if (editPhone.trim() && !/^[0-9+ -]{8,15}$/.test(editPhone.trim())) {
      showToast('error', 'Please enter a valid phone number');
      return;
    }

    setIsUpdatingProfile(true);
    try {
      const res = await updateUserProfile({
        name: editName.trim(),
        phone: editPhone.trim()
      });
      setUser(res.user);
      setProfileData(res.user);
      showToast('success', 'Profile updated successfully!');
    } catch (err: any) {
      showToast('error', err?.message || 'Failed to update profile');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  // --- Handlers: Address ---
  const handleOpenAddAddress = () => {
    setEditingAddressId(null);
    setAddressForm({
      label: 'Home',
      fullName: user?.name || '',
      phone: user?.phone || '',
      addressLine1: '',
      addressLine2: '',
      landmark: '',
      city: 'Bhagwanpur',
      state: 'Bihar',
      pincode: '821102',
      isDefault: addresses.length === 0
    });
    setIsAddressModalOpen(true);
  };

  const handleOpenEditAddress = (addr: AddressItem) => {
    setEditingAddressId(addr._id);
    setAddressForm({
      label: addr.label,
      fullName: addr.fullName,
      phone: addr.phone,
      addressLine1: addr.addressLine1,
      addressLine2: addr.addressLine2 || '',
      landmark: addr.landmark || '',
      city: addr.city,
      state: addr.state,
      pincode: addr.pincode,
      isDefault: Boolean(addr.isDefault)
    });
    setIsAddressModalOpen(true);
  };

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addressForm.fullName.trim() || !addressForm.phone.trim() || !addressForm.addressLine1.trim() || !addressForm.city.trim() || !addressForm.pincode.trim()) {
      showToast('error', 'Please fill in all required address fields.');
      return;
    }

    if (!/^[0-9]{6}$/.test(addressForm.pincode.trim())) {
      showToast('error', 'Please enter a valid 6-digit pincode.');
      return;
    }

    setIsSavingAddress(true);
    try {
      if (editingAddressId) {
        const res = await updateUserAddress(editingAddressId, addressForm);
        setAddresses(res.addresses);
        showToast('success', 'Address updated successfully!');
      } else {
        const res = await addUserAddress(addressForm);
        setAddresses(res.addresses);
        showToast('success', 'New address added successfully!');
      }
      setIsAddressModalOpen(false);
    } catch (err: any) {
      showToast('error', err?.message || 'Failed to save address');
    } finally {
      setIsSavingAddress(false);
    }
  };

  const handleDeleteAddress = async (id: string) => {
    if (!window.confirm('Are you sure you want to remove this address?')) return;

    try {
      const res = await deleteUserAddress(id);
      setAddresses(res.addresses);
      showToast('success', 'Address removed');
    } catch (err: any) {
      showToast('error', err?.message || 'Failed to delete address');
    }
  };

  const handleSetDefaultAddress = async (id: string) => {
    try {
      const res = await setDefaultUserAddress(id);
      setAddresses(res.addresses);
      showToast('success', 'Default address updated');
    } catch (err: any) {
      showToast('error', err?.message || 'Failed to set default address');
    }
  };

  // --- Handlers: Payment Methods ---
  const handleSavePaymentMethod = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingPayment(true);
    try {
      if (paymentType === 'card') {
        if (!cardForm.last4 || !/^[0-9]{4}$/.test(cardForm.last4.trim())) {
          showToast('error', 'Please enter 4 digits for the card');
          setIsSavingPayment(false);
          return;
        }
        const res = await addUserPaymentMethod({
          type: 'card',
          cardBrand: cardForm.cardBrand,
          last4: cardForm.last4.trim(),
          holderName: cardForm.holderName.trim() || user?.name,
          expiryMonth: cardForm.expiryMonth,
          expiryYear: cardForm.expiryYear
        });
        setPaymentMethods(res.paymentMethods);
      } else {
        if (!upiForm.upiId || !/^[\w.-]+@[\w.-]+$/.test(upiForm.upiId.trim())) {
          showToast('error', 'Please enter a valid UPI ID (e.g. name@bank)');
          setIsSavingPayment(false);
          return;
        }
        const res = await addUserPaymentMethod({
          type: 'upi',
          upiId: upiForm.upiId.trim()
        });
        setPaymentMethods(res.paymentMethods);
      }
      setIsPaymentModalOpen(false);
      showToast('success', 'Payment method saved securely');
      setCardForm({ cardBrand: 'Visa', last4: '', holderName: '', expiryMonth: '12', expiryYear: '28' });
      setUpiForm({ upiId: '' });
    } catch (err: any) {
      showToast('error', err?.message || 'Failed to save payment method');
    } finally {
      setIsSavingPayment(false);
    }
  };

  const handleDeletePaymentMethod = async (id: string) => {
    if (!window.confirm('Are you sure you want to remove this payment method?')) return;
    try {
      const res = await deleteUserPaymentMethod(id);
      setPaymentMethods(res.paymentMethods);
      showToast('success', 'Payment method removed');
    } catch (err: any) {
      showToast('error', err?.message || 'Failed to remove payment method');
    }
  };

  // --- Handlers: Password ---
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const { currentPassword, newPassword, confirmNewPassword } = passwordForm;

    if (!currentPassword || !newPassword || !confirmNewPassword) {
      showToast('error', 'Please fill in all password fields');
      return;
    }

    if (newPassword.length < 6) {
      showToast('error', 'New password must be at least 6 characters long');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      showToast('error', 'New passwords do not match');
      return;
    }

    setIsUpdatingPassword(true);
    try {
      await changeUserPassword({ currentPassword, newPassword, confirmNewPassword });
      setPasswordForm({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
      showToast('success', 'Password updated successfully!');
    } catch (err: any) {
      showToast('error', err?.message || 'Failed to change password. Verify your current password.');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  // --- Handlers: Notifications ---
  const handleToggleNotification = async (key: keyof typeof notifications) => {
    const updated = {
      ...notifications,
      [key]: !notifications[key]
    };
    setNotifications(updated);
    try {
      await updateNotificationPreferences(updated);
      showToast('success', 'Notification preferences saved');
    } catch (err: any) {
      showToast('error', 'Could not save notification setting');
      setNotifications(notifications); // revert
    }
  };

  return (
    <AuthGuard>
      <div className="min-h-screen flex flex-col bg-[#FAFAF9] text-brand-text font-sans selection:bg-brand-orange selection:text-white">
        <Navigation />

        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
          {/* Subtle Top-Left Back Button (Redirects to Home) */}
          <div className="mb-3">
            <Link
              href="/"
              className="inline-flex items-center space-x-1.5 text-xs sm:text-sm font-semibold text-gray-500 hover:text-gray-900 transition-colors py-1.5 px-2.5 -ml-2.5 rounded-xl hover:bg-gray-100"
              aria-label="Back to Home"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </Link>
          </div>

          {/* Page Header Aligned With Page Content */}
          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-brand-blue tracking-tight">
              Profile & Settings
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Manage your personal information, saved addresses, payment methods, and account security.
            </p>
          </div>

          {/* Main Layout: Sidebar + Active Section */}
          <div className="flex flex-col lg:flex-row items-start gap-8">
            {/* Dedicated Profile Settings Sidebar (No My Orders / No Back to Store) */}
            <ProfileNav activeSection={activeSection} onSectionChange={handleSectionChange} />

            {/* Current Section Content Area */}
            <div className="flex-1 w-full min-w-0">
              {/* Toast Feedback Banner */}
              <AnimatePresence>
                {statusMessage && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className={`p-4 rounded-2xl mb-6 flex items-center space-x-3 text-xs sm:text-sm font-semibold shadow-sm ${
                      statusMessage.type === 'success'
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : 'bg-red-50 text-red-800 border border-red-200'
                    }`}
                  >
                    {statusMessage.type === 'success' ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                    )}
                    <span>{statusMessage.text}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ==================================================== */}
              {/* SECTION 1: PERSONAL INFORMATION */}
              {/* ==================================================== */}
              {activeSection === 'personal' && (
                <div className="bg-white rounded-3xl border border-gray-100 shadow-card p-6 sm:p-8 space-y-6">
                  <div>
                    <h2 className="text-lg font-display font-bold text-gray-900">
                      Personal Information
                    </h2>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Manage your profile details and contact information
                    </p>
                  </div>

                  <form onSubmit={handleUpdateProfile} className="space-y-6">
                    {/* Profile Picture / Avatar Display */}
                    <div>
                      <p className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                        Profile Picture
                      </p>
                      <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-orange to-amber-500 text-white flex items-center justify-center font-display font-black text-2xl shadow-md shadow-brand-orange/20 flex-shrink-0">
                          {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900">{profileData?.name || user?.name || 'Customer'}</p>
                          <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-100 text-brand-blue rounded-full uppercase mt-1 inline-block">
                            {profileData?.role || user?.role || 'Customer'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1.5">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs sm:text-sm focus:outline-none focus:border-brand-orange focus:ring-1 focus:ring-brand-orange transition-all"
                          placeholder="Enter your full name"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1.5">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          value={editPhone}
                          onChange={(e) => setEditPhone(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs sm:text-sm focus:outline-none focus:border-brand-orange focus:ring-1 focus:ring-brand-orange transition-all"
                          placeholder="e.g. +91 98765 43210"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-gray-700 mb-1.5">
                          Email Address
                        </label>
                        <input
                          type="email"
                          disabled
                          value={profileData?.email || user?.email || ''}
                          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50/80 text-gray-500 text-xs sm:text-sm cursor-not-allowed"
                        />
                        <p className="text-[11px] text-gray-400 mt-1">
                          Email is connected to your login credentials and cannot be edited.
                        </p>
                      </div>
                    </div>

                    <div className="flex justify-end pt-2">
                      <button
                        type="submit"
                        disabled={isUpdatingProfile}
                        className="px-6 py-2.5 rounded-xl bg-brand-orange hover:bg-brand-orangeHover text-white text-xs font-bold shadow-sm shadow-brand-orange/20 transition-all disabled:opacity-50"
                      >
                        {isUpdatingProfile ? 'Saving Changes...' : 'Save Changes'}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* ==================================================== */}
              {/* SECTION 2: SAVED ADDRESSES */}
              {/* ==================================================== */}
              {activeSection === 'addresses' && (
                <div className="bg-white rounded-3xl border border-gray-100 shadow-card p-6 sm:p-8 space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <h2 className="text-lg font-display font-bold text-gray-900">
                        Saved Addresses
                      </h2>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Manage your saved delivery addresses
                      </p>
                    </div>

                    {/* ONLY show top-right button when addresses EXIST (no duplicate button on empty state!) */}
                    {addresses.length > 0 && (
                      <button
                        onClick={handleOpenAddAddress}
                        className="inline-flex items-center space-x-1.5 px-5 py-2.5 rounded-xl bg-brand-orange hover:bg-brand-orangeHover text-white text-xs font-bold transition-all shadow-sm shadow-brand-orange/20 self-start sm:self-auto"
                      >
                        <Plus className="w-4 h-4" />
                        <span>+ Add Address</span>
                      </button>
                    )}
                  </div>

                  {/* Empty State: Only ONE button centered inside empty state */}
                  {addresses.length === 0 && (
                    <div className="p-12 text-center rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50/50 flex flex-col items-center justify-center">
                      <MapPin className="w-12 h-12 text-gray-300 mb-3" />
                      <h3 className="font-display font-bold text-gray-700 text-base mb-1">
                        No saved addresses
                      </h3>
                      <p className="text-xs text-gray-400 max-w-sm mb-5">
                        Save an address for faster checkout.
                      </p>
                      <button
                        onClick={handleOpenAddAddress}
                        className="px-6 py-2.5 rounded-xl bg-brand-orange hover:bg-brand-orangeHover text-white text-xs font-bold transition-all shadow-sm shadow-brand-orange/20"
                      >
                        + Add Address
                      </button>
                    </div>
                  )}

                  {/* Addresses Grid (Full width) */}
                  {addresses.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {addresses.map((addr) => (
                        <div
                          key={addr._id}
                          className={`p-5 rounded-2xl border transition-all ${
                            addr.isDefault
                              ? 'border-brand-orange/40 bg-orange-50/20 shadow-sm'
                              : 'border-gray-100 bg-white hover:border-gray-200'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2.5">
                            <div className="flex items-center space-x-2">
                              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 flex items-center space-x-1">
                                {addr.label === 'Home' && <Home className="w-3 h-3 text-brand-orange" />}
                                {addr.label === 'Work' && <Briefcase className="w-3 h-3 text-brand-blue" />}
                                {addr.label === 'Other' && <MapPin className="w-3 h-3 text-gray-500" />}
                                <span>{addr.label}</span>
                              </span>
                              {addr.isDefault && (
                                <span className="text-[10px] font-black uppercase tracking-wider text-brand-orange bg-brand-orange/10 px-2 py-0.5 rounded-full">
                                  Default
                                </span>
                              )}
                            </div>

                            <div className="flex items-center space-x-1">
                              <button
                                onClick={() => handleOpenEditAddress(addr)}
                                className="p-1.5 rounded-lg text-gray-400 hover:text-brand-blue hover:bg-gray-50 transition-colors"
                                title="Edit Address"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteAddress(addr._id)}
                                className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                                title="Delete Address"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          <p className="font-bold text-gray-900 text-sm">{addr.fullName}</p>
                          <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                            {addr.addressLine1}
                            {addr.addressLine2 && `, ${addr.addressLine2}`}
                          </p>
                          {addr.landmark && (
                            <p className="text-xs text-gray-400 mt-0.5">
                              Landmark: {addr.landmark}
                            </p>
                          )}
                          <p className="text-xs text-gray-600 mt-0.5">
                            {addr.city}, {addr.state} - {addr.pincode}
                          </p>
                          <p className="text-xs font-semibold text-gray-700 mt-2">
                            Phone: {addr.phone}
                          </p>

                          {!addr.isDefault && (
                            <button
                              onClick={() => handleSetDefaultAddress(addr._id)}
                              className="mt-3 text-xs font-bold text-brand-orange hover:text-brand-orangeHover transition-colors block"
                            >
                              Set as Default Address
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ==================================================== */}
              {/* SECTION 3: PAYMENT METHODS */}
              {/* ==================================================== */}
              {activeSection === 'payments' && (
                <div className="bg-white rounded-3xl border border-gray-100 shadow-card p-6 sm:p-8 space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <h2 className="text-lg font-display font-bold text-gray-900">
                        Saved Payment Methods
                      </h2>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Manage your preferred payment methods
                      </p>
                    </div>

                    {/* ONLY show top-right button when payment methods EXIST */}
                    {paymentMethods.length > 0 && (
                      <button
                        onClick={() => setIsPaymentModalOpen(true)}
                        className="inline-flex items-center space-x-1.5 px-5 py-2.5 rounded-xl bg-brand-orange hover:bg-brand-orangeHover text-white text-xs font-bold transition-all shadow-sm shadow-brand-orange/20 self-start sm:self-auto"
                      >
                        <Plus className="w-4 h-4" />
                        <span>+ Add Payment Method</span>
                      </button>
                    )}
                  </div>

                  {/* Subtle, non-dominant security message */}
                  <div className="flex items-center space-x-2 text-xs text-gray-500 bg-gray-50/80 border border-gray-100 p-3 rounded-2xl">
                    <span className="text-gray-400 font-bold ml-1">ⓘ</span>
                    <span>
                      Payment information is securely tokenized. Floveera never stores full card numbers, CVV, or PIN.
                    </span>
                  </div>

                  {/* Empty State: Only ONE button centered inside empty state */}
                  {paymentMethods.length === 0 && (
                    <div className="p-12 text-center rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50/50 flex flex-col items-center justify-center">
                      <CreditCard className="w-12 h-12 text-gray-300 mb-3" />
                      <h3 className="font-display font-bold text-gray-700 text-base mb-1">
                        No saved payment methods
                      </h3>
                      <p className="text-xs text-gray-400 max-w-sm mb-5">
                        Save your preferred payment method for faster checkout.
                      </p>
                      <button
                        onClick={() => setIsPaymentModalOpen(true)}
                        className="px-6 py-2.5 rounded-xl bg-brand-orange hover:bg-brand-orangeHover text-white text-xs font-bold transition-all shadow-sm shadow-brand-orange/20"
                      >
                        + Add Payment Method
                      </button>
                    </div>
                  )}

                  {/* Payment Methods Grid */}
                  {paymentMethods.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {paymentMethods.map((pm) => (
                        <div
                          key={pm._id}
                          className="p-5 rounded-2xl border border-gray-100 bg-white hover:border-gray-200 transition-all flex items-start justify-between"
                        >
                          <div className="flex items-start space-x-3.5">
                            <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center text-brand-blue font-black text-xs">
                              {pm.type === 'card' ? (
                                <CreditCard className="w-5 h-5 text-brand-blue" />
                              ) : (
                                <Smartphone className="w-5 h-5 text-emerald-600" />
                              )}
                            </div>

                            <div>
                              {pm.type === 'card' ? (
                                <>
                                  <div className="flex items-center space-x-2">
                                    <p className="font-bold text-gray-900 text-sm">
                                      {pm.cardBrand || 'Card'}
                                    </p>
                                    {pm.isDefault && (
                                      <span className="text-[10px] font-black uppercase text-brand-orange bg-brand-orange/10 px-2 py-0.5 rounded-full">
                                        Default
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-xs text-gray-500 font-mono mt-1">
                                    •••• •••• •••• {pm.last4}
                                  </p>
                                  <p className="text-[11px] text-gray-400 mt-0.5">
                                    Expires {pm.expiryMonth}/{pm.expiryYear}
                                  </p>
                                </>
                              ) : (
                                <>
                                  <div className="flex items-center space-x-2">
                                    <p className="font-bold text-gray-900 text-sm">UPI</p>
                                    {pm.isDefault && (
                                      <span className="text-[10px] font-black uppercase text-brand-orange bg-brand-orange/10 px-2 py-0.5 rounded-full">
                                        Default
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-xs text-gray-600 font-mono mt-1 font-semibold">
                                    {pm.upiId}
                                  </p>
                                </>
                              )}
                            </div>
                          </div>

                          <button
                            onClick={() => handleDeletePaymentMethod(pm._id)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                            title="Remove"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ==================================================== */}
              {/* SECTION 4: SECURITY */}
              {/* ==================================================== */}
              {activeSection === 'security' && (
                <div className="bg-white rounded-3xl border border-gray-100 shadow-card p-6 sm:p-8 space-y-6">
                  <div>
                    <h2 className="text-lg font-display font-bold text-gray-900">
                      Security & Password
                    </h2>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Keep your customer account secure with a strong password
                    </p>
                  </div>

                  {/* Change Password Form */}
                  <form onSubmit={handleUpdatePassword} className="max-w-md space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1.5">
                        Current Password *
                      </label>
                      <div className="relative">
                        <input
                          type={showCurrentPassword ? 'text' : 'password'}
                          required
                          value={passwordForm.currentPassword}
                          onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs sm:text-sm focus:outline-none focus:border-brand-orange focus:ring-1 focus:ring-brand-orange pr-10"
                          placeholder="Enter your current password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                        >
                          {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1.5">
                        New Password (minimum 6 characters) *
                      </label>
                      <div className="relative">
                        <input
                          type={showNewPassword ? 'text' : 'password'}
                          required
                          minLength={6}
                          value={passwordForm.newPassword}
                          onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs sm:text-sm focus:outline-none focus:border-brand-orange focus:ring-1 focus:ring-brand-orange pr-10"
                          placeholder="Enter a new secure password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                        >
                          {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1.5">
                        Confirm New Password *
                      </label>
                      <input
                        type="password"
                        required
                        minLength={6}
                        value={passwordForm.confirmNewPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, confirmNewPassword: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs sm:text-sm focus:outline-none focus:border-brand-orange focus:ring-1 focus:ring-brand-orange"
                        placeholder="Re-type your new password"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isUpdatingPassword}
                      className="px-6 py-2.5 rounded-xl bg-brand-orange hover:bg-brand-orangeHover text-white text-xs font-bold shadow-md shadow-brand-orange/20 transition-all disabled:opacity-50"
                    >
                      {isUpdatingPassword ? 'Updating Password...' : 'Update Password'}
                    </button>
                  </form>
                </div>
              )}

              {/* ==================================================== */}
              {/* SECTION 5: NOTIFICATIONS */}
              {/* ==================================================== */}
              {activeSection === 'notifications' && (
                <div className="bg-white rounded-3xl border border-gray-100 shadow-card p-6 sm:p-8 space-y-6">
                  <div>
                    <h2 className="text-lg font-display font-bold text-gray-900">
                      Notifications
                    </h2>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Select which updates you wish to receive from Floveera
                    </p>
                  </div>

                  <div className="divide-y divide-gray-100 border border-gray-100 rounded-2xl overflow-hidden">
                    {[
                      {
                        key: 'orderUpdates' as const,
                        label: 'Order Updates',
                        description: 'Receive live notifications when your order is placed, confirmed, out for delivery, and delivered.'
                      },
                      {
                        key: 'whatsappOrderUpdates' as const,
                        label: 'WhatsApp Order Updates',
                        description: 'Receive WhatsApp updates about your orders and invoice tracking.'
                      },
                      {
                        key: 'smsNotifications' as const,
                        label: 'SMS Text Notifications',
                        description: 'Receive essential SMS delivery updates to your registered mobile phone.'
                      },
                      {
                        key: 'emailNotifications' as const,
                        label: 'Email Receipts & Account Alerts',
                        description: 'Receive invoices, receipts, and important account security notices via email.'
                      },
                      {
                        key: 'promotionalNotifications' as const,
                        label: 'Promotional Notifications',
                        description: 'Receive promotional offers, seasonal discounts, and special menu announcements.'
                      }
                    ].map((item) => (
                      <div key={item.key} className="p-4 sm:p-5 flex items-center justify-between bg-white hover:bg-gray-50/50 transition-colors">
                        <div className="pr-4">
                          <p className="font-bold text-gray-900 text-xs sm:text-sm">{item.label}</p>
                          <p className="text-xs text-gray-400 mt-0.5">{item.description}</p>
                        </div>
                        <button
                          type="button"
                          role="switch"
                          aria-checked={notifications[item.key]}
                          onClick={() => handleToggleNotification(item.key)}
                          className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                            notifications[item.key] ? 'bg-brand-orange' : 'bg-gray-200'
                          }`}
                        >
                          <span
                            aria-hidden="true"
                            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                              notifications[item.key] ? 'translate-x-5' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>

        <Footer />



        {/* ==================================================== */}
        {/* MODAL: ADD / EDIT ADDRESS */}
        {/* ==================================================== */}
        <AnimatePresence>
          {isAddressModalOpen && (
            <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto"
              >
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-display font-bold text-gray-900 text-lg">
                    {editingAddressId ? 'Edit Address' : 'Add New Delivery Address'}
                  </h3>
                  <button
                    onClick={() => setIsAddressModalOpen(false)}
                    className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSaveAddress} className="space-y-4">
                  {/* Address Type Selector */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">
                      Address Label *
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {(['Home', 'Work', 'Other'] as const).map((lbl) => (
                        <button
                          key={lbl}
                          type="button"
                          onClick={() => setAddressForm({ ...addressForm, label: lbl })}
                          className={`py-2 rounded-xl text-xs font-bold transition-all border ${
                            addressForm.label === lbl
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
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={addressForm.fullName}
                        onChange={(e) => setAddressForm({ ...addressForm, fullName: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs sm:text-sm focus:outline-none focus:border-brand-orange"
                        placeholder="Recipient Name"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        required
                        value={addressForm.phone}
                        onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
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
                      value={addressForm.addressLine1}
                      onChange={(e) => setAddressForm({ ...addressForm, addressLine1: e.target.value })}
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
                      value={addressForm.addressLine2}
                      onChange={(e) => setAddressForm({ ...addressForm, addressLine2: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs sm:text-sm focus:outline-none focus:border-brand-orange"
                      placeholder="e.g. Ward 3, Matar"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        Landmark
                      </label>
                      <input
                        type="text"
                        value={addressForm.landmark}
                        onChange={(e) => setAddressForm({ ...addressForm, landmark: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs sm:text-sm focus:outline-none focus:border-brand-orange"
                        placeholder="Near Bank"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        City / Town *
                      </label>
                      <input
                        type="text"
                        required
                        value={addressForm.city}
                        onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs sm:text-sm focus:outline-none focus:border-brand-orange"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        Pincode (6 digits) *
                      </label>
                      <input
                        type="text"
                        required
                        maxLength={6}
                        value={addressForm.pincode}
                        onChange={(e) => setAddressForm({ ...addressForm, pincode: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs sm:text-sm focus:outline-none focus:border-brand-orange"
                        placeholder="821102"
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 pt-2">
                    <input
                      type="checkbox"
                      id="isDefaultAddr"
                      checked={addressForm.isDefault}
                      onChange={(e) => setAddressForm({ ...addressForm, isDefault: e.target.checked })}
                      className="w-4 h-4 accent-brand-orange"
                    />
                    <label htmlFor="isDefaultAddr" className="text-xs font-semibold text-gray-700 cursor-pointer">
                      Set as default delivery address
                    </label>
                  </div>

                  <div className="pt-3 flex justify-end space-x-3 border-t border-gray-100">
                    <button
                      type="button"
                      onClick={() => setIsAddressModalOpen(false)}
                      className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSavingAddress}
                      className="px-5 py-2 rounded-xl bg-brand-orange text-white text-xs font-bold hover:bg-brand-orangeHover disabled:opacity-50"
                    >
                      {isSavingAddress ? 'Saving...' : 'Save Address'}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* ==================================================== */}
        {/* MODAL: ADD PAYMENT METHOD */}
        {/* ==================================================== */}
        <AnimatePresence>
          {isPaymentModalOpen && (
            <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-gray-100"
              >
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-display font-bold text-gray-900 text-lg">
                    Add Payment Method
                  </h3>
                  <button
                    onClick={() => setIsPaymentModalOpen(false)}
                    className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Tab selector */}
                <div className="grid grid-cols-2 gap-2 mb-5">
                  <button
                    type="button"
                    onClick={() => setPaymentType('card')}
                    className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                      paymentType === 'card'
                        ? 'bg-brand-orange text-white border-brand-orange shadow-sm'
                        : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    Credit / Debit Card
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentType('upi')}
                    className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                      paymentType === 'upi'
                        ? 'bg-brand-orange text-white border-brand-orange shadow-sm'
                        : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    UPI ID
                  </button>
                </div>

                <form onSubmit={handleSavePaymentMethod} className="space-y-4">
                  {paymentType === 'card' ? (
                    <>
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">
                          Card Brand
                        </label>
                        <select
                          value={cardForm.cardBrand}
                          onChange={(e) => setCardForm({ ...cardForm, cardBrand: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs sm:text-sm focus:outline-none focus:border-brand-orange"
                        >
                          <option value="Visa">Visa</option>
                          <option value="Mastercard">Mastercard</option>
                          <option value="RuPay">RuPay</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">
                          Last 4 Digits *
                        </label>
                        <input
                          type="text"
                          required
                          maxLength={4}
                          value={cardForm.last4}
                          onChange={(e) => setCardForm({ ...cardForm, last4: e.target.value.replace(/\D/g, '') })}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs sm:text-sm focus:outline-none focus:border-brand-orange font-mono"
                          placeholder="e.g. 4821"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-bold text-gray-700 mb-1">
                            Expiry Month
                          </label>
                          <input
                            type="text"
                            maxLength={2}
                            value={cardForm.expiryMonth}
                            onChange={(e) => setCardForm({ ...cardForm, expiryMonth: e.target.value })}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs sm:text-sm"
                            placeholder="MM"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-700 mb-1">
                            Expiry Year
                          </label>
                          <input
                            type="text"
                            maxLength={2}
                            value={cardForm.expiryYear}
                            onChange={(e) => setCardForm({ ...cardForm, expiryYear: e.target.value })}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs sm:text-sm"
                            placeholder="YY"
                          />
                        </div>
                      </div>
                    </>
                  ) : (
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        UPI ID *
                      </label>
                      <input
                        type="text"
                        required
                        value={upiForm.upiId}
                        onChange={(e) => setUpiForm({ upiId: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs sm:text-sm focus:outline-none focus:border-brand-orange"
                        placeholder="e.g. username@oksbi"
                      />
                    </div>
                  )}

                  <div className="p-3 bg-gray-50 rounded-xl text-[11px] text-gray-500 leading-relaxed">
                    Note: Floveera uses secure payment gateways. We never save raw CVVs or card credentials.
                  </div>

                  <div className="pt-2 flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => setIsPaymentModalOpen(false)}
                      className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSavingPayment}
                      className="px-5 py-2 rounded-xl bg-brand-orange text-white text-xs font-bold hover:bg-brand-orangeHover disabled:opacity-50"
                    >
                      {isSavingPayment ? 'Saving...' : 'Save Method'}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </AuthGuard>
  );
}
