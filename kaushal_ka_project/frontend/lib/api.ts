const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

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

// --- Categories ---
export const getCategories = () => fetchEndpoint('/categories');
export const createCategory = (data: any) => fetchEndpoint('/categories', { method: 'POST', body: JSON.stringify(data) });

// --- Products ---
export const getProducts = () => fetchEndpoint('/products');
export const createProduct = (data: any) => fetchEndpoint('/products', { method: 'POST', body: JSON.stringify(data) });

// --- Cakes ---
export const getCakes = () => fetchEndpoint('/cakes');
export const createCake = (data: any) => fetchEndpoint('/cakes', { method: 'POST', body: JSON.stringify(data) });

// --- Cake Orders ---
export const getCakeOrders = () => fetchEndpoint('/cake-orders');
export const submitCakeOrder = (data: any) => fetchEndpoint('/cake-orders', { method: 'POST', body: JSON.stringify(data) });

// --- Gallery Images ---
export const getGalleryImages = () => fetchEndpoint('/gallery');
export const uploadGalleryImage = (data: any) => fetchEndpoint('/gallery', { method: 'POST', body: JSON.stringify(data) });
