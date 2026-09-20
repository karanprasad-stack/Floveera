'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getProductById } from '@/lib/api';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { ShoppingCart, ArrowLeft, Star, TrendingUp } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';

export default function ProductPage() {
  const { id } = useParams();
  const router = useRouter();
  const { addItem } = useCartStore();
  const [product, setProduct] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setIsLoading(true);
        // Call the backend API correctly using id (which is a string or array, coerce to string)
        const productId = Array.isArray(id) ? id[0] : id;
        const data = await getProductById(productId);
        
        // Map the backend returned structure to the frontend structure
        setProduct({
          _id: data._id,
          name: data.name,
          category: data.categoryId ? data.categoryId.name : "General",
          price: data.price,
          description: data.description || "Detailed description of the product goes here. This product is top-rated among our customers and delivers excellent value and quality. Enjoy seamless shopping with Floveera.",
          image: data.imageUrl || "https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=500&q=80",
        });
      } catch (err) {
        console.error("Failed to fetch product:", err);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (id) {
      fetchProduct();
    }
  }, [id]);

  const handleAddToCart = () => {
    if (product) {
      addItem({ 
        name: product.name, 
        price: product.price, 
        image: product.image,
        description: product.description 
      });
      if (navigator.vibrate) navigator.vibrate(50);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navigation />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-orange"></div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <button 
          onClick={() => router.back()}
          className="flex items-center text-gray-500 hover:text-brand-orange mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to browsing
        </button>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex flex-col md:flex-row">
          {/* Image Gallery Side */}
          <div className="w-full md:w-1/2 bg-gray-50 p-8 flex items-center justify-center">
            {product?.image ? (
              <img 
                src={product.image} 
                alt={product.name} 
                className="max-w-full h-auto max-h-[500px] object-contain rounded-2xl shadow-xl mix-blend-multiply" 
              />
            ) : (
              <div className="w-64 h-64 bg-gray-200 rounded-2xl flex items-center justify-center">
                No Image Available
              </div>
            )}
          </div>
          
          {/* Details Side */}
          <div className="w-full md:w-1/2 p-8 lg:p-12 flex flex-col">
            <div className="mb-2">
              <span className="bg-brand-blue/10 text-brand-blue text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                {product?.category}
              </span>
            </div>
            
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4">{product?.name}</h1>
            
            <div className="flex items-center mb-6">
              <div className="flex text-yellow-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-current" />
                ))}
              </div>
              <span className="ml-2 text-sm text-gray-500">(128 Reviews)</span>
            </div>
            
            <div className="text-4xl font-black text-brand-orange mb-8">
              ₹{product?.price}
              <span className="text-lg text-gray-400 font-medium ml-2 line-through">₹{Math.floor(product?.price * 1.2)}</span>
            </div>
            
            <p className="text-gray-600 leading-relaxed mb-8 flex-1">
              {product?.description}
            </p>
            
            <div className="border-t border-gray-100 pt-8 mt-auto flex gap-4">
               <button 
                onClick={handleAddToCart}
                className="flex-1 bg-brand-orange hover:bg-brand-orangeHover text-white px-8 py-4 rounded-xl font-bold text-lg flex items-center justify-center shadow-lg hover:shadow-xl transition-all hover:-translate-y-1"
              >
                <ShoppingCart className="w-5 h-5 mr-3" />
                Add to Cart
              </button>
            </div>
            
            <div className="mt-6 flex items-center text-sm text-gray-500">
              <TrendingUp className="w-4 h-4 mr-2 text-brand-green" />
              High demand item. Typically ships within 24 hours.
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}
