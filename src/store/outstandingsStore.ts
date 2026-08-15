import { create } from 'zustand';
import { supabase } from '@/lib/supabase';

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

export const useOutstandingsStore = create<OutstandingsState>((set, get) => ({
  records: [],
  details: {},
  isLoading: false,
  isLoadingDetails: {},

  fetchOutstandings: async () => {
    set({ isLoading: true });
    // GET /outstandings
    const { data, error } = await supabase
      .from('outstandings')
      .select('*')
      .catch(() => ({ data: null, error: { message: 'Table not found' } }));

    if (error || !data) {
      // Mock data
      set({
        records: [
          { distributorId: '1', distributorName: 'PharmaCorp Distributors', amountOwed: 45000.00, dueDate: '2026-08-20', isOverdue: false },
          { distributorId: '2', distributorName: 'HealthPlus Logistics', amountOwed: 12500.50, dueDate: '2026-08-10', isOverdue: true },
          { distributorId: '3', distributorName: 'MediLife Suppliers', amountOwed: 0.00, dueDate: '', isOverdue: false },
        ],
        isLoading: false
      });
    } else {
      set({ records: data, isLoading: false });
    }
  },

  fetchOutstandingsDetail: async (distributorId) => {
    set((state) => ({ isLoadingDetails: { ...state.isLoadingDetails, [distributorId]: true } }));
    // GET /outstandings/{distributorId}
    const { data, error } = await supabase
      .from('outstanding_details')
      .select('*')
      .eq('distributor_id', distributorId)
      .catch(() => ({ data: null, error: { message: 'Table not found' } }));

    if (error || !data) {
      // Mock data
      set((state) => ({
        details: {
          ...state.details,
          [distributorId]: [
            { invoiceNumber: `INV-${Math.floor(Math.random() * 10000)}`, date: '2026-07-25', amount: 5000, status: 'pending' },
            { invoiceNumber: `INV-${Math.floor(Math.random() * 10000)}`, date: '2026-07-15', amount: 7500.50, status: 'overdue' },
          ]
        },
        isLoadingDetails: { ...state.isLoadingDetails, [distributorId]: false }
      }));
    } else {
      set((state) => ({
        details: { ...state.details, [distributorId]: data },
        isLoadingDetails: { ...state.isLoadingDetails, [distributorId]: false }
      }));
    }
  }
}));
