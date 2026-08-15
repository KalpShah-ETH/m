import { create } from 'zustand';
import { supabase } from '@/lib/supabase';

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
  isLoading: boolean;
  
  fetchMapped: () => Promise<void>;
  fetchNonMapped: () => Promise<void>;
  reorderMapped: (newOrder: string[]) => Promise<void>;
  requestConnection: (distributorId: string) => Promise<{ success: boolean }>;
  referDistributor: (data: any) => Promise<{ success: boolean }>;
  
  // Local state update helper for immediate UI feedback on reorder
  setMappedLocally: (distributors: MyDistributor[]) => void;
}

export const useMyDistributorsStore = create<MyDistributorsState>((set, get) => ({
  mappedDistributors: [],
  nonMappedDistributors: [],
  isLoading: false,

  setMappedLocally: (distributors) => set({ mappedDistributors: distributors }),

  fetchMapped: async () => {
    set({ isLoading: true });
    // GET /distributors/mapped
    const { data, error } = await supabase
      .from('mapped_distributors')
      .select('*')
      .order('priority', { ascending: true })
      .catch(() => ({ data: null, error: { message: 'Network error' } }));

    if (error || !data) {
      // Mock data
      set({
        mappedDistributors: [
          { id: '1', name: 'PharmaCorp Distributors', priority: 1, contact: '+91 9876543210' },
          { id: '2', name: 'HealthPlus Logistics', priority: 2, contact: '+91 8765432109' },
          { id: '3', name: 'MediLife Suppliers', priority: 3, contact: '+91 7654321098' },
        ],
        isLoading: false
      });
    } else {
      set({ mappedDistributors: data, isLoading: false });
    }
  },

  fetchNonMapped: async () => {
    set({ isLoading: true });
    // GET /distributors/non-mapped
    const { data, error } = await supabase
      .from('non_mapped_distributors')
      .select('*')
      .catch(() => ({ data: null, error: { message: 'Network error' } }));

    if (error || !data) {
      // Mock data
      set({
        nonMappedDistributors: [
          { id: '101', name: 'Sunrise Medicals' },
          { id: '102', name: 'Apex Pharma Distributors' },
          { id: '103', name: 'Global Health Distributors' },
        ],
        isLoading: false
      });
    } else {
      set({ nonMappedDistributors: data, isLoading: false });
    }
  },

  reorderMapped: async (newOrder) => {
    // PATCH /distributors/reorder
    // We expect an array of distributor IDs in the new priority order
    const { error } = await supabase.functions.invoke('distributors-reorder', {
      body: { order: newOrder }
    }).catch(() => ({ error: { message: 'Network error' } }));

    if (error) {
      console.log('Mocked reorder success for ids:', newOrder);
    }
  },

  requestConnection: async (distributorId) => {
    // POST /distributors/{id}/connect-request
    const { error } = await supabase
      .from('connection_requests')
      .insert({ distributor_id: distributorId })
      .catch(() => ({ error: { message: 'Network error' } }));

    if (error) {
      // Mock success and remove from non-mapped locally
      set((state) => ({
        nonMappedDistributors: state.nonMappedDistributors.filter(d => d.id !== distributorId)
      }));
      return { success: true };
    }
    return { success: true };
  },

  referDistributor: async (data) => {
    // POST /distributors/refer
    const { error } = await supabase
      .from('distributor_referrals')
      .insert(data)
      .catch(() => ({ error: { message: 'Network error' } }));

    if (error) {
      console.log('Mocked referral success for:', data);
      return { success: true };
    }
    return { success: true };
  }
}));
