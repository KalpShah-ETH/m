import { create } from 'zustand';
import { supabase } from '@/lib/supabase';

interface HomeState {
  summary: any | null;
  distributors: any[];
  isLoading: boolean;
  error: string | null;
  fetchSummary: () => Promise<void>;
  fetchDistributors: () => Promise<void>;
}

export const useHomeStore = create<HomeState>((set) => ({
  summary: null,
  distributors: [],
  isLoading: false,
  error: null,

  fetchSummary: async () => {
    set({ isLoading: true, error: null });
    // Assuming you have an edge function or a direct RPC call for /home/summary
    // Here we use supabase.rpc if it's a database function, or supabase.functions.invoke if it's an edge function
    // For now, we will mock the structure to prevent crashes until backend is connected
    const { data, error } = await supabase.functions.invoke('home-summary').catch(() => ({ data: null, error: { message: 'Edge function not deployed' } }));
    
    if (error) {
      // Mocking data for development
      set({ 
        summary: { cartCount: 0, outstandingTotal: 0 }, 
        isLoading: false 
      });
      console.log('Mocked summary data:', error.message);
    } else {
      set({ summary: data, isLoading: false });
    }
  },

  fetchDistributors: async () => {
    set({ isLoading: true, error: null });
    // Represents GET /distributors/mapped?limit=5
    // Here we query a hypothetical distributors table mapping
    const { data, error } = await supabase
      .from('mapped_distributors')
      .select('*')
      .limit(5)
      .catch(() => ({ data: null, error: { message: 'Table not found' } }));
      
    if (error || !data) {
      // Mocking data for development
      set({ 
        distributors: [
          { id: '1', name: 'PharmaCorp Distributors' },
          { id: '2', name: 'HealthPlus Logistics' },
        ], 
        isLoading: false 
      });
    } else {
      set({ distributors: data, isLoading: false });
    }
  },
}));
