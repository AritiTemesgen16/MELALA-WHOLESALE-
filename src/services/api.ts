import { Product, QuotationRequest, WholesaleOrder, CustomerLead, UserProfile, CategoryInfo } from '../types';

export function getAuthHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('melala_auth_token');
    const userStr = localStorage.getItem('melala_current_user');
    if (token) {
      headers['x-auth-token'] = token;
      headers['Authorization'] = `Bearer ${token}`;
    }
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user?.id) headers['x-user-id'] = user.id;
        if (user?.role) headers['x-user-role'] = user.role;
      } catch (e) {}
    }
  }
  return headers;
}

export async function fetchProducts(params?: {
  category?: string;
  search?: string;
  strategic?: boolean;
  prescription?: boolean;
  coldChain?: boolean;
}): Promise<Product[]> {
  try {
    const query = new URLSearchParams();
    if (params?.category) query.append('category', params.category);
    if (params?.search) query.append('search', params.search);
    if (params?.strategic) query.append('strategic', 'true');
    if (params?.prescription) query.append('prescription', 'true');
    if (params?.coldChain) query.append('coldChain', 'true');

    const res = await fetch(`/api/products?${query.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch products');
    return await res.json();
  } catch (err) {
    console.error('Error fetching products from API:', err);
    return [];
  }
}

export async function createProduct(productData: Partial<Product>): Promise<Product | null> {
  try {
    const res = await fetch('/api/products', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(productData),
    });
    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      throw new Error(errJson.error || 'Failed to create product');
    }
    return await res.json();
  } catch (err) {
    console.error('Error creating product:', err);
    return null;
  }
}

export async function fetchQuotations(): Promise<QuotationRequest[]> {
  try {
    const res = await fetch('/api/quotes');
    if (!res.ok) throw new Error('Failed to fetch quotations');
    return await res.json();
  } catch (err) {
    console.error('Error fetching quotes:', err);
    return [];
  }
}

export async function createQuotation(quoteData: Partial<QuotationRequest>): Promise<QuotationRequest | null> {
  try {
    const res = await fetch('/api/quotes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(quoteData),
    });
    if (!res.ok) throw new Error('Failed to submit quote');
    return await res.json();
  } catch (err) {
    console.error('Error creating quote:', err);
    return null;
  }
}

export async function updateQuotation(id: string, updates: Partial<QuotationRequest>): Promise<QuotationRequest | null> {
  try {
    const res = await fetch(`/api/quotes/${id}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error('Failed to update quote');
    return await res.json();
  } catch (err) {
    console.error('Error updating quote:', err);
    return null;
  }
}

export async function fetchOrders(): Promise<WholesaleOrder[]> {
  try {
    const res = await fetch('/api/orders');
    if (!res.ok) throw new Error('Failed to fetch orders');
    return await res.json();
  } catch (err) {
    console.error('Error fetching orders:', err);
    return [];
  }
}

export async function createOrder(orderData: Partial<WholesaleOrder>): Promise<WholesaleOrder | null> {
  try {
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData),
    });
    if (!res.ok) throw new Error('Failed to create order');
    return await res.json();
  } catch (err) {
    console.error('Error creating order:', err);
    return null;
  }
}

export async function updateOrder(id: string, updates: Partial<WholesaleOrder>): Promise<WholesaleOrder | null> {
  try {
    const res = await fetch(`/api/orders/${id}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error('Failed to update order');
    return await res.json();
  } catch (err) {
    console.error('Error updating order:', err);
    return null;
  }
}

export async function fetchLeads(): Promise<CustomerLead[]> {
  try {
    const res = await fetch('/api/leads');
    if (!res.ok) throw new Error('Failed to fetch leads');
    return await res.json();
  } catch (err) {
    console.error('Error fetching leads:', err);
    return [];
  }
}

export async function registerB2BCustomer(payload: {
  name: string;
  email: string;
  password?: string;
  facilityName: string;
  facilityType: string;
  phone: string;
  city: string;
  region?: string;
  businessAddress?: string;
  efdaLicenseNo?: string;
  tinNumber?: string;
  vatRegistered?: boolean;
  role?: string;
}): Promise<{ user?: UserProfile; error?: string; message?: string }> {
  try {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) {
      return { error: data.error || 'Registration failed' };
    }
    return data;
  } catch (err: any) {
    console.error('Error during B2B registration:', err);
    return { error: 'Network error during registration. Please try again.' };
  }
}

export async function loginB2BCustomer(email: string, password?: string): Promise<{ user?: UserProfile; token?: string; error?: string; message?: string }> {
  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) {
      return { error: data.error || 'Login failed' };
    }
    if (data.token) {
      localStorage.setItem('melala_auth_token', data.token);
    }
    if (data.user) {
      localStorage.setItem('melala_current_user', JSON.stringify(data.user));
    }
    return data;
  } catch (err: any) {
    console.error('Error during B2B login:', err);
    return { error: 'Network error during login. Please check connection.' };
  }
}

export async function logoutB2BCustomer(): Promise<{ message?: string }> {
  try {
    const res = await fetch('/api/auth/logout', { method: 'POST', headers: getAuthHeaders() });
    localStorage.removeItem('melala_auth_token');
    localStorage.removeItem('melala_current_user');
    return await res.json();
  } catch (err) {
    localStorage.removeItem('melala_auth_token');
    localStorage.removeItem('melala_current_user');
    return { message: 'Logged out locally.' };
  }
}

export async function resetB2BPassword(email: string): Promise<{ message?: string; error?: string }> {
  try {
    const res = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    if (!res.ok) return { error: data.error || 'Password reset request failed' };
    return data;
  } catch (err) {
    return { error: 'Failed to process password reset request.' };
  }
}

export async function associateFacility(payload: {
  userId: string;
  facilityName?: string;
  facilityType?: string;
  phone?: string;
  city?: string;
  region?: string;
  businessAddress?: string;
  efdaLicenseNo?: string;
  tinNumber?: string;
  vatRegistered?: boolean;
}): Promise<{ user?: UserProfile; error?: string; message?: string }> {
  try {
    const res = await fetch('/api/auth/associate-facility', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) return { error: data.error || 'Failed to associate facility' };
    return data;
  } catch (err) {
    return { error: 'Network error associating facility.' };
  }
}


export async function fetchUsers(): Promise<UserProfile[]> {
  try {
    const res = await fetch('/api/users');
    if (!res.ok) throw new Error('Failed to fetch users');
    return await res.json();
  } catch (err) {
    console.error('Error fetching users:', err);
    return [];
  }
}

export async function updateUserVerificationStatus(
  userId: string,
  status: 'PENDING' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'SUSPENDED',
  creditLimitEtb?: number
): Promise<{ user?: UserProfile; error?: string; message?: string }> {
  try {
    const res = await fetch(`/api/auth/users/${userId}/status`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status, creditLimitEtb }),
    });
    const data = await res.json();
    if (!res.ok) return { error: data.error || 'Status update failed' };
    return data;
  } catch (err) {
    return { error: 'Failed to update user verification status.' };
  }
}

export async function submitVerification(userId: string, efdaLicenseNo: string, tinNumber: string) {
  try {
    const res = await fetch('/api/verifications', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ userId, efdaLicenseNo, tinNumber }),
    });
    if (!res.ok) throw new Error('Failed to submit verification');
    return await res.json();
  } catch (err) {
    console.error('Error submitting verification:', err);
    return null;
  }
}

export async function requestAiQuotationAssistant(payload: {
  items: any[];
  facilityName?: string;
  facilityType?: string;
  shippingCity?: string;
}) {
  try {
    const res = await fetch('/api/ai/quotation-assistant', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('AI Quotation Assistant request failed');
    return await res.json();
  } catch (err) {
    console.error('Error with AI Quotation Assistant:', err);
    return null;
  }
}

export async function toggleProductFeature(id: string, isFeatured: boolean, promotionTag?: string): Promise<Product | null> {
  try {
    const res = await fetch(`/api/products/${id}/feature`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ isFeatured, promotionTag }),
    });
    if (!res.ok) throw new Error('Failed to toggle product feature state');
    return await res.json();
  } catch (err) {
    console.error('Error toggling product feature:', err);
    return null;
  }
}

export async function fetchPromotions(): Promise<any[]> {
  try {
    const res = await fetch('/api/promotions');
    if (!res.ok) throw new Error('Failed to fetch promotions');
    return await res.json();
  } catch (err) {
    console.error('Error fetching promotions:', err);
    return [];
  }
}

export async function createPromotion(promoData: any): Promise<any | null> {
  try {
    const res = await fetch('/api/promotions', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(promoData),
    });
    if (!res.ok) throw new Error('Failed to create promotion');
    return await res.json();
  } catch (err) {
    console.error('Error creating promotion:', err);
    return null;
  }
}

export async function updatePromotion(id: string, updates: any): Promise<any | null> {
  try {
    const res = await fetch(`/api/promotions/${id}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error('Failed to update promotion');
    return await res.json();
  } catch (err) {
    console.error('Error updating promotion:', err);
    return null;
  }
}

export async function updateLead(id: string, updates: Partial<CustomerLead>): Promise<CustomerLead | null> {
  try {
    const res = await fetch(`/api/leads/${id}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error('Failed to update lead');
    return await res.json();
  } catch (err) {
    console.error('Error updating lead:', err);
    return null;
  }
}

export async function addLeadNote(leadId: string, author: string, note: string, actionType?: string): Promise<any | null> {
  try {
    const res = await fetch(`/api/leads/${leadId}/notes`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ author, note, actionType }),
    });
    if (!res.ok) throw new Error('Failed to add lead note');
    return await res.json();
  } catch (err) {
    console.error('Error adding lead note:', err);
    return null;
  }
}

export async function fetchCallbacks(): Promise<any[]> {
  try {
    const res = await fetch('/api/callbacks');
    if (!res.ok) throw new Error('Failed to fetch callbacks');
    return await res.json();
  } catch (err) {
    console.error('Error fetching callbacks:', err);
    return [];
  }
}

export async function createCallback(payload: {
  facilityName: string;
  contactPerson: string;
  phone: string;
  email?: string;
  facilityType?: string;
  preferredTime?: string;
  notes?: string;
}): Promise<{ callback?: any; error?: string; message?: string }> {
  try {
    const res = await fetch('/api/callbacks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) return { error: data.error || 'Failed to submit callback request' };
    return data;
  } catch (err) {
    console.error('Error submitting callback request:', err);
    return { error: 'Network error submitting callback request.' };
  }
}

export async function updateCallbackStatus(id: string, status: 'PENDING' | 'CONTACTED' | 'COMPLETED'): Promise<any | null> {
  try {
    const res = await fetch(`/api/callbacks/${id}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status }),
    });
    if (!res.ok) throw new Error('Failed to update callback status');
    return await res.json();
  } catch (err) {
    console.error('Error updating callback status:', err);
    return null;
  }
}

export async function requestAiDemandInsights(productName?: string, region?: string): Promise<any | null> {
  try {
    const res = await fetch('/api/ai/demand-insights', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productName, region }),
    });
    if (!res.ok) throw new Error('AI demand insights request failed');
    return await res.json();
  } catch (err) {
    console.error('Error fetching AI demand insights:', err);
    return {
      demandTrend: 'High Regional Demand (+28% MoM)',
      insights: `Hospital networks in ${region || 'Hawassa'} are experiencing elevated demand for ${productName || 'Amoxicillin'}. Recommended proactive stocking.`,
      recommendedPitch: `Highlight Melala's cold-chain guarantee, EFDA compliance certification, and volume discount on orders over 100,000 ETB.`,
    };
  }
}

export async function fetchDemandInsights(): Promise<any[]> {
  try {
    const res = await fetch('/api/demand-insights');
    if (!res.ok) throw new Error('Failed to fetch demand insights');
    return await res.json();
  } catch (err) {
    console.error('Error fetching demand insights:', err);
    return [];
  }
}

export async function logDemandSearch(searchTerm: string, category?: string, isQuoteRequest?: boolean): Promise<void> {
  try {
    await fetch('/api/demand-insights/log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ searchTerm, category, isQuoteRequest }),
    });
  } catch (err) {
    console.error('Error logging demand search:', err);
  }
}

export async function logAbandonedCart(payload: {
  facilityName: string;
  contactPerson?: string;
  phone: string;
  email?: string;
  cartTotalEtb: number;
  itemsSummary: string;
}): Promise<void> {
  try {
    await fetch('/api/abandoned-cart', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch (err) {
    console.error('Error logging abandoned cart:', err);
  }
}

export async function uploadMedia(
  dataUrl: string,
  folder: 'products' | 'equipment' | 'categories' | 'owners' | 'general' = 'products',
  publicId?: string
): Promise<{ success: boolean; url?: string; public_id?: string; error?: string }> {
  try {
    const res = await fetch('/api/media/upload', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ dataUrl, folder, publicId }),
    });
    const data = await res.json();
    if (!res.ok) {
      return { success: false, error: data.error || 'Failed to upload media to server.' };
    }
    return data;
  } catch (err: any) {
    console.error('Error uploading media:', err);
    return { success: false, error: err?.message || 'Network error during upload.' };
  }
}

export async function updateProduct(id: string, updates: Partial<Product>): Promise<Product | null> {
  try {
    const res = await fetch(`/api/products/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error('Failed to update product');
    return await res.json();
  } catch (err) {
    console.error('Error updating product:', err);
    return null;
  }
}

export async function fetchCategories(): Promise<CategoryInfo[]> {
  try {
    const res = await fetch('/api/categories');
    if (!res.ok) throw new Error('Failed to fetch categories');
    return await res.json();
  } catch (err) {
    console.error('Error fetching categories:', err);
    return [];
  }
}

export async function deleteMedia(
  urlOrPublicId: string
): Promise<{ success: boolean; public_id?: string; error?: string }> {
  try {
    const res = await fetch('/api/media/delete', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ url: urlOrPublicId, publicId: urlOrPublicId }),
    });
    const data = await res.json();
    if (!res.ok) {
      return { success: false, error: data.error || 'Failed to delete media asset.' };
    }
    return data;
  } catch (err: any) {
    console.error('Error deleting media:', err);
    return { success: false, error: err?.message || 'Network error during media deletion.' };
  }
}

export async function deleteProduct(id: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/products/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to delete product');
    return true;
  } catch (err) {
    console.error('Error deleting product:', err);
    return false;
  }
}

export async function updateCategory(id: string, updates: Partial<CategoryInfo>): Promise<CategoryInfo | null> {
  try {
    const res = await fetch(`/api/categories/${id}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error('Failed to update category');
    return await res.json();
  } catch (err) {
    console.error('Error updating category:', err);
    return null;
  }
}
