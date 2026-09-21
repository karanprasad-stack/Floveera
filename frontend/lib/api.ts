const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL && process.env.NEXT_PUBLIC_API_URL.startsWith('http')) ? process.env.NEXT_PUBLIC_API_URL : 'http://localhost:5000/api';

/**
 * Helper to fetch general endpoints
 */
async function fetchEndpoint(endpoint: string, options: RequestInit = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    credentials: 'include',
    ...options,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.message || `Error fetching ${endpoint}`);
  }

  return response.json();
}

// --- Auth ---
export const registerUser = (data: any) => fetchEndpoint('/auth/register', { method: 'POST', body: JSON.stringify(data) });
export const loginUser = (data: any) => fetchEndpoint('/auth/login', { method: 'POST', body: JSON.stringify(data) });
export const logoutUser = () => fetchEndpoint('/auth/logout', { method: 'POST' });
export const getSettingsCurrentUser = () => fetchEndpoint('/auth/me');
export const firebaseLogin = (idToken: string, rememberMe = false) => fetchEndpoint('/auth/firebase-login', { method: 'POST', body: JSON.stringify({ idToken, rememberMe }) });
export const checkUserExists = (identifier: string) => fetchEndpoint('/auth/check-user-exists', { method: 'POST', body: JSON.stringify({ identifier }) });
export const requestPasswordReset = (email: string) => fetchEndpoint('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) });
export const resetPassword = (data: { token: string; password: string }) => fetchEndpoint('/auth/reset-password', { method: 'POST', body: JSON.stringify(data) });

// --- Categories ---
export const getCategories = () => fetchEndpoint('/categories');
export const createCategory = (data: any) => fetchEndpoint('/categories', { method: 'POST', body: JSON.stringify(data) });

// --- Products ---
export const getProducts = (params?: Record<string, any>) => {
  if (!params) return fetchEndpoint('/products');
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, val]) => {
    if (val !== undefined && val !== null && val !== '') {
      query.append(key, String(val));
    }
  });
  const qs = query.toString();
  return fetchEndpoint(qs ? `/products?${qs}` : '/products');
};
export const getProductById = (id: string) => fetchEndpoint(`/products/${id}`);
export const searchProducts = (q: string) => fetchEndpoint(`/search?q=${encodeURIComponent(q)}`);
export const createProduct = (data: any) => fetchEndpoint('/products', { method: 'POST', body: JSON.stringify(data) });

// --- Cart ---
export const getUserCart = () => fetchEndpoint('/cart');
export const syncUserCart = (guestItems: any[]) => fetchEndpoint('/cart/sync', { method: 'POST', body: JSON.stringify({ guestItems }) });
export const saveUserCart = (items: any[]) => fetchEndpoint('/cart', { method: 'PUT', body: JSON.stringify({ items }) });
export const clearUserCart = () => fetchEndpoint('/cart', { method: 'DELETE' });

// --- Cakes ---
export const getCakes = () => fetchEndpoint('/cakes');
export const createCake = (data: any) => fetchEndpoint('/cakes', { method: 'POST', body: JSON.stringify(data) });

// --- Cake Orders ---
export const getCakeOrders = () => fetchEndpoint('/cake-orders');
export const submitCakeOrder = (data: any) => fetchEndpoint('/cake-orders', { method: 'POST', body: JSON.stringify(data) });

// --- Gallery Images ---
export const getGalleryImages = () => fetchEndpoint('/gallery');
export const uploadGalleryImage = (data: any) => fetchEndpoint('/gallery', { method: 'POST', body: JSON.stringify(data) });
