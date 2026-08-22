import { create } from 'zustand';
import { supabase } from '@/lib/supabase';

export interface Product {
  id: string;
  name: string;
  strength: string;
  manufacturer: string;
  price: number;
}

export interface Distributor {
  id: string;
  name: string;
  rating: number;
}

interface SearchState {
  products: Product[];
  distributors: Distributor[];
  isLoading: boolean;
  error: string | null;
  searchProducts: (query: string) => Promise<void>;
  searchDistributors: (query: string) => Promise<void>;
  clearResults: () => void;
}

export const useSearchStore = create<SearchState>((set) => ({
  products: [],
  distributors: [],
  isLoading: false,
  error: null,

  searchProducts: async (query: string) => {
    if (query.length < 3) {
      set({ products: [] });
      return;
    }

    set({ isLoading: true, error: null });
    
    // Represents GET /products/search?q={query}
    // Using Supabase textSearch or ilike
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .ilike('name', `%${query}%`)
        .limit(20);
        
      if (error || !data) {
        throw new Error('Fallback to mock data');
      } else {
        set({ products: data, isLoading: false });
      }
    } catch (e) {
      // Mocking data for development
      set({ 
        products: [
          { id: '1', name: 'Paracetamol', strength: '500mg', manufacturer: 'Cipla', price: 15.00 },
          { id: '2', name: 'Azithromycin', strength: '250mg', manufacturer: 'Sun Pharma', price: 55.00 },
          { id: '3', name: `${query} Aspirin`, strength: '75mg', manufacturer: 'Abbott', price: 12.50 },
        ], 
        isLoading: false 
      });
    }
  },

  searchDistributors: async (query: string) => {
    if (query.length < 3) {
      set({ distributors: [] });
      return;
    }

    set({ isLoading: true, error: null });
    
    // Represents GET /distributors/search?q={query}
    try {
      const { data, error } = await supabase
        .from('distributors')
        .select('*')
        .ilike('name', `%${query}%`)
        .limit(20);
        
      if (error || !data) {
        throw new Error('Fallback to mock data');
      } else {
        set({ distributors: data, isLoading: false });
      }
    } catch (e) {
      // Mocking data for development
      set({ 
        distributors: [
          { id: '1', name: `${query} Pharma Logistics`, rating: 4.5 },
          { id: '2', name: 'Global Health Distributors', rating: 4.8 },
        ], 
        isLoading: false 
      });
    }
  },

  clearResults: () => set({ products: [], distributors: [], isLoading: false, error: null }),
}));
