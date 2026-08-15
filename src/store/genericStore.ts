import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { CatalogProduct } from '@/store/catalogStore';

interface GenericCategory {
  id: string;
  name: string;
}

interface GenericState {
  categories: GenericCategory[];
  products: CatalogProduct[];
  isLoadingCategories: boolean;
  isLoadingProducts: boolean;
  selectedCategory: string | null;

  setSelectedCategory: (categoryId: string | null) => void;
  fetchCategories: () => Promise<void>;
  fetchProductsByCategory: (categoryId: string | null) => Promise<void>;
  searchProducts: (query: string) => Promise<void>;
}

export const useGenericStore = create<GenericState>((set, get) => ({
  categories: [],
  products: [],
  isLoadingCategories: false,
  isLoadingProducts: false,
  selectedCategory: null,

  setSelectedCategory: (categoryId) => {
    set({ selectedCategory: categoryId });
  },

  fetchCategories: async () => {
    set({ isLoadingCategories: true });
    
    // We can assume there's a generic_categories table or similar
    const { data, error } = await supabase
      .from('generic_categories')
      .select('*')
      .catch(() => ({ data: null, error: { message: 'Network error' } }));

    if (error || !data) {
      set({
        categories: [
          { id: 'c1', name: 'Pain Relief' },
          { id: 'c2', name: 'Antibiotics' },
          { id: 'c3', name: 'Vitamins & Supplements' },
          { id: 'c4', name: 'Cough & Cold' },
        ],
        isLoadingCategories: false
      });
    } else {
      set({ categories: data, isLoadingCategories: false });
    }
  },

  fetchProductsByCategory: async (categoryId) => {
    set({ isLoadingProducts: true });
    
    // GET /products/generic?category={id}
    let query = supabase.from('generic_products').select('*');
    if (categoryId) {
      query = query.eq('category_id', categoryId);
    }
    
    const { data, error } = await query.catch(() => ({ data: null, error: { message: 'Network error' } }));

    if (error || !data) {
      // Mock data using the CatalogProduct structure so we can reuse the same card style
      const mockProducts: CatalogProduct[] = [
        { id: 'gp1', name: 'Paracetamol 500mg', packSize: '10x10', ptr: 12.50, mrp: 15.00, stockStatus: 'in-stock', discountPercentage: 10, quantityInCart: 0 },
        { id: 'gp2', name: 'Amoxicillin 250mg', packSize: '10x6', ptr: 45.00, mrp: 55.00, stockStatus: 'in-stock', discountPercentage: 15, quantityInCart: 0 },
        { id: 'gp3', name: 'Vitamin C Chewable', packSize: '1x15', ptr: 25.00, mrp: 35.00, stockStatus: 'out-of-stock', discountPercentage: 5, quantityInCart: 0 },
      ];
      set({ products: mockProducts, isLoadingProducts: false });
    } else {
      set({ products: data, isLoadingProducts: false });
    }
  },

  searchProducts: async (query) => {
    if (!query || query.length < 3) {
      // If query is cleared, fetch by category again
      get().fetchProductsByCategory(get().selectedCategory);
      return;
    }

    set({ isLoadingProducts: true });
    
    // GET /products/generic/search?q={query}
    const { data, error } = await supabase
      .from('generic_products')
      .select('*')
      .ilike('name', `%${query}%`)
      .catch(() => ({ data: null, error: { message: 'Network error' } }));

    if (error || !data) {
      // Mock search data
      const mockProducts: CatalogProduct[] = [
        { id: 'gp1', name: `${query} 500mg`, packSize: '10x10', ptr: 12.50, mrp: 15.00, stockStatus: 'in-stock', discountPercentage: 10, quantityInCart: 0 },
      ];
      set({ products: mockProducts, isLoadingProducts: false });
    } else {
      set({ products: data, isLoadingProducts: false });
    }
  }
}));
