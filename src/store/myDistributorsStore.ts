import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from './authStore';

export interface MyDistributor {
  id: string;
  name: string;
  priority?: number;
  contact?: string;
  address?: string;
}

interface MyDistributorsState {
  mappedDistributors: MyDistributor[];
  nonMappedDistributors: MyDistributor[];
  pendingIds: string[];
  isLoading: boolean;
  
  fetchMapped: () => Promise<void>;
  fetchNonMapped: () => Promise<void>;
  reorderMapped: (newOrder: string[]) => Promise<void>;
  requestConnection: (distributorId: string) => Promise<{ success: boolean; error?: string }>;
  referDistributor: (data: any) => Promise<{ success: boolean }>;
  
  setMappedLocally: (distributors: MyDistributor[]) => void;
}

export const useMyDistributorsStore = create<MyDistributorsState>((set, get) => ({
  mappedDistributors: [],
  nonMappedDistributors: [],
  pendingIds: [],
  isLoading: false,

  setMappedLocally: (distributors) => set({ mappedDistributors: distributors }),

  fetchMapped: async () => {
    set({ isLoading: true });
    const user = useAuthStore.getState().user;
    if (!user) {
      set({ mappedDistributors: [], isLoading: false });
      return;
    }

    const { data, error } = await supabase
      .from('retailer_distributor_map')
      .select('priority, distributors(id, name, phone, address)')
      .eq('retailer_id', user.id)
      .eq('status', 'approved')
      .order('priority', { ascending: true });

    if (error || !data) {
      set({ mappedDistributors: [], isLoading: false });
    } else {
      const mapped = data.map((item: any) => ({
        id: item.distributors.id,
        name: item.distributors.name,
        priority: item.priority,
        contact: item.distributors.phone,
        address: item.distributors.address
      }));
      set({ mappedDistributors: mapped, isLoading: false });
    }
  },

  fetchNonMapped: async () => {
    set({ isLoading: true });
    const user = useAuthStore.getState().user;
    if (!user) {
      set({ nonMappedDistributors: [], isLoading: false });
      return;
    }

    // Get all distributors that are NOT mapped for this retailer
    // Get all distributors that are mapped or pending for this retailer
    const { data: mappedMaps } = await supabase
      .from('retailer_distributor_map')
      .select('distributor_id, status')
      .eq('retailer_id', user.id);
      
    const mappedIds = mappedMaps?.filter(m => m.status === 'approved').map(m => m.distributor_id) || [];
    const pendingIds = mappedMaps?.filter(m => m.status === 'pending').map(m => m.distributor_id) || [];

    let query = supabase.from('distributors').select('id, name, phone, address');
    
    const { data, error } = await query;

    if (error || !data) {
      set({ nonMappedDistributors: [], isLoading: false });
    } else {
      // Filter out approved locally if postgrest doesn't support 'not in' easily in JS client
      // Note: We DO NOT filter out pendingIds, so they stay in the non-mapped list UI!
      const nonMapped = data.filter(d => !mappedIds.includes(d.id)).map(item => ({
        id: item.id,
        name: item.name,
        contact: item.phone,
        address: item.address
      }));
      set({ nonMappedDistributors: nonMapped, pendingIds, isLoading: false });
    }
  },

  reorderMapped: async (newOrder) => {
    const items = newOrder.map((id, index) => ({ distributor_id: id, priority: index }));
    const { error } = await supabase.functions.invoke('reorder-distributors', {
      body: { items }
    });
    if (error) console.error('Reorder failed', error);
  },

  requestConnection: async (distributorId) => {
    const { data, error } = await supabase.functions.invoke('request-distributor-connect', {
      body: { distributor_id: distributorId }
    });

    if (error) {
      console.error('Edge Function Error:', error);
      return { success: false, error: error.message || 'Function failed' };
    }

    if (data?.success) {
      set((state) => ({
        pendingIds: [...state.pendingIds, distributorId]
      }));
      return { success: true };
    }
    
    return { success: false, error: data?.error || 'Unknown error occurred' };
  },

  referDistributor: async (data) => {
    // Left as mock since referral isn't in DB yet
    console.log('Referral submitted', data);
    return { success: true };
  }
}));
