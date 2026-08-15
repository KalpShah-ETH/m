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
    
    const { data, error } = await supabase
      .from('categories')
      .select('*');

    if (error || !data) {
      set({ categories: [], isLoadingCategories: false });
    } else {
      set({ categories: data, isLoadingCategories: false });
    }
  },

  fetchProductsByCategory: async (categoryId) => {
    set({ isLoadingProducts: true });
    
    let query = supabase.from('products').select('*').eq('is_generic', true);
    if (categoryId) {
      query = query.eq('category_id', categoryId);
    }
    
    const { data, error } = await query;

    if (error || !data) {
      set({ products: [], isLoadingProducts: false });
    } else {
      const mappedProducts: CatalogProduct[] = data.map((p: any) => ({
        id: p.id,
        name: p.name,
        packSize: p.pack_size,
        ptr: p.ptr,
        mrp: p.mrp,
        stockStatus: p.stock_status,
        discountPercentage: p.discount_percent || 0,
        quantityInCart: 0
      }));
      set({ products: mappedProducts, isLoadingProducts: false });
    }
  },

  searchProducts: async (query) => {
    if (!query || query.length < 3) {
      get().fetchProductsByCategory(get().selectedCategory);
      return;
    }

    set({ isLoadingProducts: true });
    
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('is_generic', true)
      .ilike('name', `%${query}%`);

    if (error || !data) {
      set({ products: [], isLoadingProducts: false });
    } else {
      const mappedProducts: CatalogProduct[] = data.map((p: any) => ({
        id: p.id,
        name: p.name,
        packSize: p.pack_size,
        ptr: p.ptr,
        mrp: p.mrp,
        stockStatus: p.stock_status,
        discountPercentage: p.discount_percent || 0,
        quantityInCart: 0
      }));
      set({ products: mappedProducts, isLoadingProducts: false });
    }
  }
}));
