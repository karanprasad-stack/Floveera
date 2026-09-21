'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { getProductById, getProducts } from '@/lib/api';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import {
  ShoppingCart,
  ArrowLeft,
  Star,
  Flame,
  Check,
  Calendar,
  Clock,
  MessageSquare,
  Sparkles,
  Plus,
  Minus,
  Truck,
  ShieldCheck,
  Tag,
} from 'lucide-react';
import { useCartStore, CartCustomization } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';

export default function ProductPage() {
  const { id } = useParams();
  const router = useRouter();
  const { addItem, toggleCart } = useCartStore();

  const [product, setProduct] = useState<any>(null);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [quantity, setQuantity] = useState(1);
  const [selectedUnit, setSelectedUnit] = useState<string>('');
  const [basePrice, setBasePrice] = useState<number>(0);

  // Restaurant customization
  const [spiceLevel, setSpiceLevel] = useState<string>('');
  const [selectedAddOns, setSelectedAddOns] = useState<Array<{ name: string; price: number }>>([]);
  const [cookingNotes, setCookingNotes] = useState<string>('');

  // Cakes customization
  const [cakeWeight, setCakeWeight] = useState<string>('500g');
  const [isEggless, setIsEggless] = useState<boolean>(true);
  const [cakeMessage, setCakeMessage] = useState<string>('');
  const [deliveryDate, setDeliveryDate] = useState<string>('Today');
  const [deliverySlot, setDeliverySlot] = useState<string>('4:00 PM - 7:00 PM');

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setIsLoading(true);
        const productId = Array.isArray(id) ? id[0] : id;
        const data = await getProductById(productId);

        if (data) {
          setProduct(data);

          // Setup unit & price
          if (data.units && data.units.length > 0) {
            setSelectedUnit(data.units[0].label);
            setBasePrice(data.units[0].price);
          } else {
            setSelectedUnit('');
            setBasePrice(data.price || 0);
          }

          // Setup spice
          if (data.customizationOptions?.spiceLevels && data.customizationOptions.spiceLevels.length > 0) {
            setSpiceLevel(data.customizationOptions.spiceLevels[0]);
          } else {
            setSpiceLevel(data.vertical === 'restaurant' ? 'Medium' : '');
          }

          if (data.vertical === 'cakes') {
            setIsEggless(data.dietary === 'eggless');
            setCakeWeight('500g');
          }

          // Fetch related products
          if (data.vertical) {
            getProducts({ vertical: data.vertical }).then((res) => {
              if (Array.isArray(res)) {
                setRelatedProducts(res.filter((p: any) => p._id !== data._id).slice(0, 4));
              }
            }).catch(() => {});
          }
        }
      } catch (err) {
        console.error('Failed to fetch product:', err);
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAFAF9] flex flex-col font-sans">
        <Navigation />
        <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full" aria-busy="true">
          <div className="h-4 w-32 bg-gray-200 rounded animate-shimmer mb-8" />
          <div className="bg-white rounded-3xl shadow-card border border-gray-100 overflow-hidden flex flex-col md:flex-row">
            <div className="w-full md:w-1/2 h-80 md:h-[450px] bg-gray-100 animate-shimmer" />
            <div className="w-full md:w-1/2 p-8 sm:p-12 flex flex-col space-y-6">
              <div className="h-4 w-24 bg-gray-200 rounded-full animate-shimmer" />
              <div className="h-8 w-3/4 bg-gray-200 rounded-lg animate-shimmer" />
              <div className="h-8 w-32 bg-gray-200 rounded-lg animate-shimmer" />
              <div className="space-y-2 pt-4">
                <div className="h-3 w-full bg-gray-100 rounded animate-shimmer" />
                <div className="h-3 w-5/6 bg-gray-100 rounded animate-shimmer" />
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
        <Navigation />
        <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
          <h2 className="text-2xl font-bold font-display text-gray-800">Product Not Found</h2>
          <p className="text-gray-500 text-sm mt-1 mb-6">The item you requested could not be located in our catalog.</p>
          <button onClick={() => router.back()} className="px-6 py-3 bg-brand-orange text-white font-bold rounded-xl">
            Go Back
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  const toggleAddOn = (addon: { name: string; price: number }) => {
    setSelectedAddOns((prev) => {
      const exists = prev.some((a) => a.name === addon.name);
      return exists ? prev.filter((a) => a.name !== addon.name) : [...prev, addon];
    });
  };

  const addOnsTotal = selectedAddOns.reduce((sum, a) => sum + a.price, 0);
  const effectivePrice = (basePrice + addOnsTotal) * quantity;

  const handleAddToCart = () => {
    const user = useAuthStore.getState().user;
    if (!user) {
      useAuthStore.getState().openLoginPrompt('You need to login first to add items to your cart.');
      return;
    }

    const customization: CartCustomization = {};

    if (product.vertical === 'restaurant') {
      if (spiceLevel) customization.spiceLevel = spiceLevel;
      if (selectedAddOns.length > 0) customization.addOns = selectedAddOns;
      if (cookingNotes.trim()) customization.notes = cookingNotes.trim();
    } else if (product.vertical === 'cakes') {
      customization.weight = cakeWeight || selectedUnit || '500g';
      customization.isEggless = isEggless;
      if (cakeMessage.trim()) customization.cakeMessage = cakeMessage.trim();
      customization.deliveryDate = deliveryDate;
      customization.deliverySlot = deliverySlot;
    } else if (product.vertical === 'supermart') {
      customization.selectedUnit = selectedUnit;
    }

    addItem({
      productId: product._id || product.name,
      name: product.name,
      price: basePrice,
      originalPrice: product.originalPrice,
      image: product.imageUrl || product.image,
      vertical: product.vertical || 'restaurant',
      unit: selectedUnit,
      description: product.description,
      customization,
      quantity,
    });

    toggleCart(true);
  };

  const imgSrc = product.imageUrl || product.image || '/images/pizza.jpg';

  return (
    <div className="min-h-screen bg-[#FAFAF9] flex flex-col font-sans text-brand-text">
      <Navigation />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="inline-flex items-center text-xs font-semibold text-gray-500 hover:text-brand-orange mb-6 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5 group-hover:-translate-x-1 transition-transform" />
          Back to browsing
        </button>

        {/* Product Card Container */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex flex-col lg:flex-row mb-12">
          {/* Product Image Section */}
          <div className="w-full lg:w-1/2 relative bg-gray-50 min-h-[340px] sm:min-h-[420px] overflow-hidden flex items-center justify-center p-6">
            <div className="relative w-full h-80 sm:h-96 rounded-2xl overflow-hidden shadow-sm">
              <Image
                src={imgSrc}
                alt={product.name}
                fill
                className="object-cover"
                priority
              />
            </div>

            {/* Dietary Badge */}
            <div className="absolute top-6 left-6 z-10 flex items-center gap-2">
              {product.dietary === 'veg' && (
                <span className="bg-emerald-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                  🌱 100% Pure Veg
                </span>
              )}
              {product.dietary === 'eggless' && (
                <span className="bg-emerald-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                  🌱 100% Eggless Bakery
                </span>
              )}
            </div>
          </div>

          {/* Product Actions & Details Section */}
          <div className="w-full lg:w-1/2 p-6 sm:p-10 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-brand-orange bg-orange-50 px-2.5 py-1 rounded-full">
                  {product.vertical}
                </span>
                <div className="flex items-center text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-lg">
                  <Star className="w-3.5 h-3.5 fill-emerald-600 text-emerald-600 mr-1" />
                  <span>{product.rating || 4.8} ({product.ratingCount || 40} reviews)</span>
                </div>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-gray-900 leading-tight">
                {product.name}
              </h1>

              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-black text-brand-orange font-display">
                  ₹{basePrice + addOnsTotal}
                </span>
                {product.originalPrice && product.originalPrice > basePrice && (
                  <span className="text-base text-gray-400 line-through">
                    ₹{product.originalPrice}
                  </span>
                )}
                {selectedUnit && (
                  <span className="text-xs text-gray-500 font-medium">({selectedUnit})</span>
                )}
              </div>

              <p className="text-sm text-gray-600 leading-relaxed">
                {product.description}
              </p>

              <hr className="border-gray-100" />

              {/* Unit Variants */}
              {product.units && product.units.length > 1 && (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                    Select Variant / Size
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {product.units.map((u: any) => (
                      <button
                        key={u.label}
                        type="button"
                        onClick={() => {
                          setSelectedUnit(u.label);
                          setBasePrice(u.price);
                        }}
                        className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                          selectedUnit === u.label
                            ? 'border-brand-orange bg-orange-50 text-brand-orange ring-1 ring-brand-orange'
                            : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {u.label} · ₹{u.price}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* RESTAURANT SPECIFIC: Spice Level */}
              {product.vertical === 'restaurant' &&
                product.customizationOptions?.spiceLevels &&
                product.customizationOptions.spiceLevels.length > 0 && (
                  <div>
                    <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                      <Flame className="w-3.5 h-3.5 text-orange-500" />
                      Spice Preference
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {product.customizationOptions.spiceLevels.map((lvl: string) => (
                        <button
                          key={lvl}
                          type="button"
                          onClick={() => setSpiceLevel(lvl)}
                          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                            spiceLevel === lvl
                              ? 'border-brand-orange bg-orange-50 text-brand-orange ring-1 ring-brand-orange font-bold'
                              : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                          }`}
                        >
                          {lvl}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

              {/* RESTAURANT SPECIFIC: Add-ons */}
              {product.vertical === 'restaurant' &&
                product.customizationOptions?.addOns &&
                product.customizationOptions.addOns.length > 0 && (
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                      Customize with Add-ons
                    </label>
                    <div className="space-y-1.5">
                      {product.customizationOptions.addOns.map((addon: any) => {
                        const isSelected = selectedAddOns.some((a) => a.name === addon.name);
                        return (
                          <button
                            key={addon.name}
                            type="button"
                            onClick={() => toggleAddOn(addon)}
                            className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-xs transition-all ${
                              isSelected
                                ? 'border-brand-orange bg-orange-50/50 text-brand-text'
                                : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <div
                                className={`w-4 h-4 rounded border flex items-center justify-center ${
                                  isSelected ? 'bg-brand-orange border-brand-orange text-white' : 'border-gray-300'
                                }`}
                              >
                                {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                              </div>
                              <span className="font-semibold">{addon.name}</span>
                            </div>
                            <span className="font-bold text-brand-orange">+₹{addon.price}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

              {/* CAKES SPECIFIC: Inscription & Scheduled Delivery */}
              {product.vertical === 'cakes' && (
                <div className="space-y-3 pt-2">
                  <div>
                    <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-brand-orange" />
                      Free Message on Cake
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Happy Birthday Ananya!"
                      value={cakeMessage}
                      onChange={(e) => setCakeMessage(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs focus:border-brand-orange outline-none"
                      maxLength={35}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs font-bold text-gray-700 mb-1 block">Delivery Date</label>
                      <select
                        value={deliveryDate}
                        onChange={(e) => setDeliveryDate(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-xl border border-gray-200 text-xs bg-white focus:border-brand-orange outline-none"
                      >
                        <option value="Today">Today</option>
                        <option value="Tomorrow">Tomorrow</option>
                        <option value="Day After Tomorrow">Day After Tomorrow</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-700 mb-1 block">Delivery Window</label>
                      <select
                        value={deliverySlot}
                        onChange={(e) => setDeliverySlot(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-xl border border-gray-200 text-xs bg-white focus:border-brand-orange outline-none"
                      >
                        <option value="10:00 AM - 1:00 PM">Morning (10AM - 1PM)</option>
                        <option value="2:00 PM - 5:00 PM">Afternoon (2PM - 5PM)</option>
                        <option value="5:00 PM - 8:00 PM">Evening (5PM - 8PM)</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Sticky/Bottom Add to Cart bar */}
            <div className="pt-6 mt-6 border-t border-gray-100 flex items-center justify-between gap-4">
              <div className="flex items-center bg-gray-100 rounded-xl p-1 border border-gray-200">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-8 h-8 flex items-center justify-center text-gray-600 hover:text-brand-orange hover:bg-white rounded-lg transition-colors active:scale-95"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-8 text-center text-sm font-bold text-gray-900">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => q + 1)}
                  className="w-8 h-8 flex items-center justify-center text-gray-600 hover:text-brand-orange hover:bg-white rounded-lg transition-colors active:scale-95"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              <button
                type="button"
                onClick={handleAddToCart}
                className="flex-1 bg-gradient-to-r from-brand-orange to-brand-orangeHover hover:opacity-95 text-white py-3.5 px-6 rounded-xl font-bold text-sm sm:text-base shadow-lg shadow-brand-orange/25 active:scale-[0.98] transition-all flex items-center justify-between"
              >
                <span className="flex items-center gap-2">
                  <ShoppingCart className="w-4 h-4" /> Add to Order
                </span>
                <span className="font-black text-white">₹{effectivePrice}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Related / Frequently Bought Together Section */}
        {relatedProducts.length > 0 && (
          <section className="mb-12">
            <h3 className="text-xl font-bold font-display text-gray-900 mb-4">
              More from this collection
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {relatedProducts.map((rel) => (
                <Link
                  key={rel._id}
                  href={`/product/${rel._id}`}
                  className="bg-white p-3.5 rounded-2xl border border-gray-100 hover:shadow-md transition-all group flex flex-col"
                >
                  <div className="h-32 rounded-xl overflow-hidden bg-gray-50 mb-2 relative">
                    <Image
                      src={rel.imageUrl || rel.image || '/images/pizza.jpg'}
                      alt={rel.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <h4 className="text-xs font-bold text-gray-800 line-clamp-1 group-hover:text-brand-orange transition-colors">
                    {rel.name}
                  </h4>
                  <p className="text-xs font-black text-brand-orange mt-1">₹{rel.price}</p>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}
