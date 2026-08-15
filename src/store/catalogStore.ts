import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from './authStore';

export interface Category {
  id: string;
  name: string;
}

export interface CatalogProduct {
  id: string;
  name: string;
  packSize: string;
  ptr: number;
  mrp: number;
  stockStatus: 'in-stock' | 'out-of-stock' | 'low-stock' | 'high' | 'low' | 'out';
  discountPercentage: number;
  quantityInCart: number;
}

interface CatalogState {
  categories: Category[];
  products: CatalogProduct[];
  activeTab: 'mapped' | 'non-mapped';
  selectedCategory: string | null;
  isLoadingCategories: boolean;
  isLoadingProducts: boolean;
  connectionRequestStatus: 'idle' | 'pending' | 'success' | 'error';
  
  setActiveTab: (tab: 'mapped' | 'non-mapped') => void;
  setSelectedCategory: (categoryId: string | null) => void;
  
  fetchCategories: (distributorId: string) => Promise<void>;
  fetchProducts: (distributorId: string, categoryId: string | null, tab: 'mapped' | 'non-mapped') => Promise<void>;
  requestConnection: (distributorId: string) => Promise<void>;
  
  updateProductQuantity: (productId: string, newQuantity: number) => void;
}

export const useCatalogStore = create<CatalogState>((set, get) => ({
  categories: [],
  products: [],
  activeTab: 'mapped',
  selectedCategory: null,
  isLoadingCategories: false,
  isLoadingProducts: false,
  connectionRequestStatus: 'idle',

  setActiveTab: (tab) => set({ activeTab: tab }),
  setSelectedCategory: (categoryId) => set({ selectedCategory: categoryId }),

  fetchCategories: async (distributorId) => {
    set({ isLoadingCategories: true });
    // Fetch all categories for now
    const { data, error } = await supabase
      .from('categories')
      .select('id, name');

    if (error || !data) {
      set({ categories: [], isLoadingCategories: false });
    } else {
      set({ categories: data, isLoadingCategories: false });
    }
  },

  fetchProducts: async (distributorId, categoryId, tab) => {
    set({ isLoadingProducts: true });
    
    const user = useAuthStore.getState().user;
    if (!user) {
      set({ products: [], isLoadingProducts: false });
      return;
    }

    let query = supabase
      .from('products')
      .select('id, name, pack_size, ptr, mrp, stock_status, discount_percent')
      .eq('distributor_id', distributorId);
      
    if (categoryId) {
      query = query.eq('category_id', categoryId);
    }

    const { data, error } = await query;

    if (error || !data) {
      set({ products: [], isLoadingProducts: false });
      return;
    }

    // Also fetch local cart to merge quantityInCart
    const { data: cartData } = await supabase
      .from('cart_items')
      .select('product_id, quantity')
      .eq('retailer_id', user.id)
      .eq('distributor_id', distributorId);

    const cartMap = new Map();
    if (cartData) {
      cartData.forEach(c => cartMap.set(c.product_id, c.quantity));
    }

    const mappedProducts: CatalogProduct[] = data.map(p => ({
      id: p.id,
      name: p.name,
      packSize: p.pack_size,
      ptr: p.ptr,
      mrp: p.mrp,
      stockStatus: p.stock_status as any,
      discountPercentage: p.discount_percent || 0,
      quantityInCart: cartMap.get(p.id) || 0
    }));

    set({ products: mappedProducts, isLoadingProducts: false });
  },

  requestConnection: async (distributorId) => {
    set({ connectionRequestStatus: 'pending' });
    const { data, error } = await supabase.functions.invoke('request-distributor-connect', {
      body: { distributor_id: distributorId }
    });

    if (error || !data.success) {
      set({ connectionRequestStatus: 'error' });
    } else {
      set({ connectionRequestStatus: 'success' });
    }
  },

  updateProductQuantity: (productId, newQuantity) => {
    if (newQuantity < 0) return;
    set((state) => ({
      products: state.products.map(p => 
        p.id === productId ? { ...p, quantityInCart: newQuantity } : p
      )
    }));
  }
}));
