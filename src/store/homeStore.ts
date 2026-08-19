import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from './authStore';

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
    const user = useAuthStore.getState().user;
    if (!user) {
      set({ summary: { cartCount: 0, outstandingTotal: 0 }, isLoading: false });
      return;
    }

    try {
      // Fetch cart items count
      const { data: cartData } = await supabase
        .from('cart_items')
        .select('quantity')
        .eq('retailer_id', user.id);
      
      const cartCount = cartData ? cartData.reduce((sum, item) => sum + item.quantity, 0) : 0;

      // Fetch outstanding total
      const { data: mapData } = await supabase
        .from('retailer_distributor_map')
        .select('outstanding_amount')
        .eq('retailer_id', user.id);
      
      const outstandingTotal = mapData ? mapData.reduce((sum, item) => sum + Number(item.outstanding_amount), 0) : 0;

      set({ summary: { cartCount, outstandingTotal }, isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  fetchDistributors: async () => {
    set({ isLoading: true, error: null });
    const user = useAuthStore.getState().user;
    if (!user) {
      set({ distributors: [], isLoading: false });
      return;
    }

    const { data, error } = await supabase
      .from('retailer_distributor_map')
      .select('distributor_id, distributors ( id, name )')
      .eq('retailer_id', user.id)
      .eq('status', 'approved')
      .order('priority', { ascending: true })
      .limit(5);
      
    if (error || !data) {
      set({ distributors: [], error: error?.message, isLoading: false });
    } else {
      const mapped = data.map((item: any) => ({
        id: item.distributors.id,
        name: item.distributors.name
      }));
      set({ distributors: mapped, isLoading: false });
    }
  },
}));
