import { create } from 'zustand';
import { supabase } from '@/lib/supabase';

export interface Category {
  id: string;
  name: string;
  // e.g., 'Neurology', 'Cardiology'
}

export interface CatalogProduct {
  id: string;
  name: string;
  packSize: string;
  ptr: number;
  mrp: number;
  stockStatus: 'in-stock' | 'out-of-stock' | 'low-stock';
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
  
  // Cart actions locally managed for the stepper
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
    // Represents GET /distributors/{id}/categories
    const { data, error } = await supabase
      .from('distributor_categories')
      .select('*')
      .eq('distributor_id', distributorId)
      .catch(() => ({ data: null, error: { message: 'Table not found' } }));

    if (error || !data) {
      // Mocking data for development
      set({
        categories: [
          { id: 'cat-1', name: 'Neurology' },
          { id: 'cat-2', name: 'Cardiology' },
          { id: 'cat-3', name: 'Orthopedics' },
          { id: 'cat-4', name: 'Dermatology' },
        ],
        isLoadingCategories: false,
      });
    } else {
      set({ categories: data, isLoadingCategories: false });
    }
  },

  fetchProducts: async (distributorId, categoryId, tab) => {
    set({ isLoadingProducts: true });
    // Represents GET /distributors/{id}/products?category={categoryId}&tab={tab}
    let query = supabase
      .from('distributor_products')
      .select('*')
      .eq('distributor_id', distributorId)
      .eq('mapped_status', tab === 'mapped');
      
    if (categoryId) {
      query = query.eq('category_id', categoryId);
    }

    const { data, error } = await query.catch(() => ({ data: null, error: { message: 'Table not found' } }));

    if (error || !data) {
      // Mocking data for development
      set({
        products: [
          { id: 'p1', name: 'Neurovit Plus', packSize: '10x10 Tablets', ptr: 45.00, mrp: 60.00, stockStatus: 'in-stock', discountPercentage: 10, quantityInCart: 0 },
          { id: 'p2', name: 'CardioAspirin', packSize: '15 Tablets', ptr: 20.00, mrp: 25.00, stockStatus: 'low-stock', discountPercentage: 5, quantityInCart: 2 },
          { id: 'p3', name: 'DermaGlow Cream', packSize: '50g Tube', ptr: 110.00, mrp: 150.00, stockStatus: 'out-of-stock', discountPercentage: 15, quantityInCart: 0 },
        ],
        isLoadingProducts: false,
      });
    } else {
      set({ products: data, isLoadingProducts: false });
    }
  },

  requestConnection: async (distributorId) => {
    set({ connectionRequestStatus: 'pending' });
    // Represents POST /distributors/{id}/connect-request
    const { error } = await supabase
      .from('connection_requests')
      .insert({ distributor_id: distributorId })
      .catch(() => ({ error: { message: 'Table not found' } }));

    if (error) {
      // Mock success for development
      setTimeout(() => {
        set({ connectionRequestStatus: 'success' });
      }, 1000);
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
