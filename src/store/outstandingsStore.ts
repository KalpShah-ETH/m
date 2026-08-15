import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from './authStore';

export interface OutstandingRecord {
  distributorId: string;
  distributorName: string;
  amountOwed: number;
  dueDate: string;
  isOverdue: boolean;
}

export interface OutstandingDetail {
  invoiceNumber: string;
  date: string;
  amount: number;
  status: 'pending' | 'overdue';
}

interface OutstandingsState {
  records: OutstandingRecord[];
  details: Record<string, OutstandingDetail[]>; // Keyed by distributorId
  isLoading: boolean;
  isLoadingDetails: Record<string, boolean>;

  fetchOutstandings: () => Promise<void>;
  fetchOutstandingsDetail: (distributorId: string) => Promise<void>;
}

export const useOutstandingsStore = create<OutstandingsState>((set) => ({
  records: [],
  details: {},
  isLoading: false,
  isLoadingDetails: {},

  fetchOutstandings: async () => {
    set({ isLoading: true });
    
    const user = useAuthStore.getState().user;
    if (!user) {
      set({ records: [], isLoading: false });
      return;
    }

    const { data, error } = await supabase
      .from('retailer_distributor_map')
      .select('distributor_id, outstanding_amount, distributors(name)')
      .eq('retailer_id', user.id)
      .gt('outstanding_amount', 0); // only show those with balance

    if (error || !data) {
      set({ records: [], isLoading: false });
    } else {
      const records = data.map((d: any) => ({
        distributorId: d.distributor_id,
        distributorName: d.distributors.name,
        amountOwed: d.outstanding_amount,
        dueDate: new Date(Date.now() + 864000000).toISOString().split('T')[0], // Mocking due date since it's not in db yet
        isOverdue: false // Mocking overdue
      }));
      set({ records, isLoading: false });
    }
  },

  fetchOutstandingsDetail: async (distributorId) => {
    set((state) => ({ isLoadingDetails: { ...state.isLoadingDetails, [distributorId]: true } }));
    
    // We don't have an invoices/outstanding_details table yet, so mock it for now
    setTimeout(() => {
      set((state) => ({
        details: {
          ...state.details,
          [distributorId]: [
            { invoiceNumber: `INV-${Math.floor(Math.random() * 10000)}`, date: '2026-07-25', amount: 5000, status: 'pending' },
          ]
        },
        isLoadingDetails: { ...state.isLoadingDetails, [distributorId]: false }
      }));
    }, 500);
  }
}));
