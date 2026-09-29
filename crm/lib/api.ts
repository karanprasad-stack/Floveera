const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

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
    const err = new Error(errorData?.message || `HTTP ${response.status} fetching ${endpoint}`);
    (err as any).status = response.status;
    throw err;
  }

  return response.json();
}

// Authentication
export const crmLogin = (
  dataOrIdentifier: { identifier?: string; email?: string; phone?: string; password: string; rememberMe?: boolean } | string,
  maybePassword?: string
) => {
  const payload = typeof dataOrIdentifier === 'string'
    ? { identifier: dataOrIdentifier, password: maybePassword }
    : dataOrIdentifier;
  return fetchEndpoint('/auth/crm-login', { method: 'POST', body: JSON.stringify(payload) });
};

export const registerRestaurantWorker = (data: {
  name: string;
  email?: string;
  phone: string;
  password: string;
  confirmPassword?: string;
}) => {
  return fetchEndpoint('/auth/restaurant/register', {
    method: 'POST',
    body: JSON.stringify(data)
  });
};

export const crmDevAdminLogin = () => 
  fetchEndpoint('/auth/crm-dev-admin', { method: 'POST' });

export const crmDevWorkerLogin = () => 
  fetchEndpoint('/auth/crm-dev-worker', { method: 'POST' });

export const crmLogout = async () => {
  try {
    await fetchEndpoint('/auth/crm-logout', { method: 'POST' });
  } catch (e) {}
  return fetchEndpoint('/auth/logout', { method: 'POST' });
};

// Restaurant Context
export const getMyRestaurant = () => 
  fetchEndpoint('/restaurants/my-restaurant');

// Dashboard (Role-aware: Workers receive order counts; Admins receive revenue & operational KPIs)
export const getRestaurantDashboard = (restaurantId: string) => 
  fetchEndpoint(`/restaurants/${restaurantId}/dashboard`);
export const getCrmDashboard = getRestaurantDashboard;

// Orders
export const getRestaurantOrders = (restaurantId: string, params?: Record<string, any>) => {
  if (!params) return fetchEndpoint(`/restaurants/${restaurantId}/orders`);
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, val]) => {
    if (val !== undefined && val !== null && val !== '') {
      query.append(key, String(val));
    }
  });
  const qs = query.toString();
  return fetchEndpoint(qs ? `/restaurants/${restaurantId}/orders?${qs}` : `/restaurants/${restaurantId}/orders`);
};
export const getCrmOrders = getRestaurantOrders;

export const getRestaurantOrderHistory = (restaurantId: string, params?: Record<string, any>) => {
  if (!params) return fetchEndpoint(`/restaurants/${restaurantId}/orders/history`);
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, val]) => {
    if (val !== undefined && val !== null && val !== '') {
      query.append(key, String(val));
    }
  });
  const qs = query.toString();
  return fetchEndpoint(qs ? `/restaurants/${restaurantId}/orders/history?${qs}` : `/restaurants/${restaurantId}/orders/history`);
};
export const getCrmOrderHistory = getRestaurantOrderHistory;

export const getRestaurantOrderById = (restaurantId: string, orderId: string) => 
  fetchEndpoint(`/restaurants/${restaurantId}/orders/${orderId}`);
export const getCrmOrderById = getRestaurantOrderById;

export const updateRestaurantOrderStatus = (restaurantId: string, orderId: string, status: string, note?: string) => 
  fetchEndpoint(`/restaurants/${restaurantId}/orders/${orderId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status, note })
  });
export const updateCrmOrderStatus = updateRestaurantOrderStatus;

// CRM Invoices (Shares identical backend invoice and PDF with Customer)
export const getCrmOrderInvoice = (restaurantId: string, orderId: string) => 
  fetchEndpoint(`/restaurants/${restaurantId}/orders/${orderId}/invoice`);

export async function downloadCrmOrderInvoicePdf(restaurantId: string, orderId: string, fallbackFilename = 'Flovera-Invoice.pdf') {
  const url = `${API_BASE_URL}/restaurants/${restaurantId}/orders/${orderId}/invoice/pdf`;
  const res = await fetch(url, {
    credentials: 'include'
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => null);
    throw new Error(errorData?.message || 'Failed to download invoice PDF');
  }
  const blob = await res.blob();
  const downloadUrl = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = downloadUrl;
  
  const disposition = res.headers.get('content-disposition');
  let filename = fallbackFilename;
  if (disposition && disposition.includes('filename=')) {
    const match = disposition.match(/filename="?([^"]+)"?/);
    if (match && match[1]) {
      filename = match[1];
    }
  }
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(downloadUrl);
}

// Admin-Only Modules
export const getRestaurantRevenue = (restaurantId: string) => 
  fetchEndpoint(`/restaurants/${restaurantId}/revenue`);
export const getCrmRevenue = getRestaurantRevenue;

export const getRestaurantWorkers = (restaurantId: string) => 
  fetchEndpoint(`/restaurants/${restaurantId}/workers`);
export const getCrmWorkers = getRestaurantWorkers;

export const createRestaurantWorker = (restaurantId: string, data: any) => 
  fetchEndpoint(`/restaurants/${restaurantId}/workers`, { method: 'POST', body: JSON.stringify(data) });
export const addCrmWorker = createRestaurantWorker;

export const updateRestaurantWorkerStatus = (restaurantId: string, workerId: string, status: string) =>
  fetchEndpoint(`/restaurants/${restaurantId}/workers/${workerId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status })
  });

export const getRestaurantInvitations = (restaurantId: string) =>
  fetchEndpoint(`/restaurants/${restaurantId}/invitations`);

export const createRestaurantInvitation = (restaurantId: string, data: {
  email?: string;
  maxUses?: number;
  expiresInDays?: number;
  autoApprove?: boolean;
  codePrefix?: string;
}) =>
  fetchEndpoint(`/restaurants/${restaurantId}/invitations`, {
    method: 'POST',
    body: JSON.stringify(data)
  });

export const revokeRestaurantInvitation = (restaurantId: string, invitationId: string) =>
  fetchEndpoint(`/restaurants/${restaurantId}/invitations/${invitationId}`, {
    method: 'DELETE'
  });

export const getRestaurantSettings = (restaurantId: string) => 
  fetchEndpoint(`/restaurants/${restaurantId}/settings`);
export const getCrmSettings = getRestaurantSettings;

export const updateRestaurantSettings = (restaurantId: string, data: any) => 
  fetchEndpoint(`/restaurants/${restaurantId}/settings`, { method: 'PATCH', body: JSON.stringify(data) });
export const updateCrmSettings = updateRestaurantSettings;

export const getRestaurantInventory = (restaurantId: string) => 
  fetchEndpoint(`/restaurants/${restaurantId}/inventory`);
export const getCrmInventory = getRestaurantInventory;

export const getRestaurantCustomers = (restaurantId: string) => 
  fetchEndpoint(`/restaurants/${restaurantId}/customers`);
export const getCrmCustomers = getRestaurantCustomers;

export const getRestaurantExpenses = (restaurantId: string) => 
  fetchEndpoint(`/restaurants/${restaurantId}/expenses`);
export const getCrmExpenses = getRestaurantExpenses;

export const getRestaurantReports = (restaurantId: string) => 
  fetchEndpoint(`/restaurants/${restaurantId}/reports`);
export const getCrmReports = getRestaurantReports;

export const getRestaurantMenu = (restaurantId: string) => 
  fetchEndpoint(`/restaurants/${restaurantId}/menu`);
export const getCrmMenu = getRestaurantMenu;

export const getRestaurantWhatsapp = (restaurantId: string) => 
  fetchEndpoint(`/restaurants/${restaurantId}/whatsapp`);
export const getCrmWhatsapp = getRestaurantWhatsapp;

// Personal Profile (Workers & Admins - strictly their own profile)
export const getMyProfile = (restaurantId: string) => 
  fetchEndpoint(`/restaurants/${restaurantId}/profile/me`);
export const getCrmMyProfile = getMyProfile;

export const updateMyProfile = (restaurantId: string, data: { name?: string; phone?: string; email?: string }) => 
  fetchEndpoint(`/restaurants/${restaurantId}/profile/me`, { method: 'PUT', body: JSON.stringify(data) });
export const updateCrmMyProfile = updateMyProfile;

export const changeMyPassword = (restaurantId: string, dataOrCurrent: { currentPassword: string; newPassword: string } | string, maybeNew?: string) => {
  const payload = typeof dataOrCurrent === 'string'
    ? { currentPassword: dataOrCurrent, newPassword: maybeNew }
    : dataOrCurrent;
  return fetchEndpoint(`/restaurants/${restaurantId}/profile/me/password`, { method: 'PUT', body: JSON.stringify(payload) });
};
export const updateCrmMyPassword = changeMyPassword;
