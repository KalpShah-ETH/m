import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from './authStore';

export interface ReturnItem {
  id: string;
  productName: string;
  quantity: number;
  reason: 'saleable' | 'expiry';
}

export interface ReturnRecord {
  id: string;
  returnNumber: string;
  orderId: string;
  distributorName: string;
  date: string;
  status: 'draft' | 'submitted';
  type: 'saleable' | 'expiry';
  items: ReturnItem[];
}

interface ReturnsState {
  returns: ReturnRecord[];
  isLoading: boolean;
  
  fetchReturns: (filters: { status: 'draft' | 'submitted', type: 'saleable' | 'expiry' }) => Promise<void>;
  initiateReturn: (data: { orderId: string; items: ReturnItem[]; type: 'saleable' | 'expiry' }) => Promise<{ success: boolean; id?: string }>;
  editDraft: (id: string, updates: Partial<ReturnRecord>) => Promise<{ success: boolean }>;
  submitReturn: (id: string) => Promise<{ success: boolean }>;
  cancelDraft: (id: string) => Promise<{ success: boolean }>;
}

export const useReturnsStore = create<ReturnsState>((set, get) => ({
  returns: [],
  isLoading: false,

  fetchReturns: async ({ status, type }) => {
    set({ isLoading: true });
    
    const user = useAuthStore.getState().user;
    if (!user) {
      set({ returns: [], isLoading: false });
      return;
    }

    const { data, error } = await supabase
      .from('returns')
      .select('*, products(name), orders(order_number, distributors(name))')
      .eq('retailer_id', user.id)
      .eq('status', status)
      .eq('return_type', type);

    if (error || !data) {
      set({ returns: [], isLoading: false });
    } else {
      const records: ReturnRecord[] = data.map((d: any) => ({
        id: d.id,
        returnNumber: `RET-${d.id.substring(0, 8).toUpperCase()}`,
        orderId: d.orders?.order_number || 'N/A',
        distributorName: d.orders?.distributors?.name || 'Unknown',
        date: d.created_at.split('T')[0],
        status: d.status as any,
        type: d.return_type as any,
        items: [{
          id: d.id,
          productName: d.products.name,
          quantity: d.quantity,
          reason: d.return_type as any
        }]
      }));
      set({ returns: records, isLoading: false });
    }
  },

  initiateReturn: async (data) => {
    // In our edge function we handle a single product, but the UI expects items array
    // To simplify, we iterate or just take the first. For a robust app we'd map this over.
    const item = data.items[0];
    if (!item) return { success: false };

    const { data: res, error } = await supabase.functions.invoke('initiate-return', {
      body: {
        order_id: data.orderId || null,
        product_id: item.id, // Assuming the UI passes productId as the item id
        quantity: item.quantity,
        return_type: data.type
      }
    });

    if (error || !res.success) {
      return { success: false };
    }
    return { success: true, id: res.data.id };
  },

  editDraft: async (id, updates) => {
    const { error } = await supabase
      .from('returns')
      .update({ quantity: updates.items?.[0]?.quantity }) // simplified mapping
      .eq('id', id);

    if (error) {
      return { success: false };
    }
    return { success: true };
  },

  submitReturn: async (id) => {
    const { error } = await supabase.functions.invoke('submit-return', {
      body: { return_id: id }
    });

    if (error) {
      return { success: false };
    }
    
    set((state) => ({
      returns: state.returns.filter(r => r.id !== id)
    }));
    return { success: true };
  },

  cancelDraft: async (id) => {
    const { error } = await supabase
      .from('returns')
      .delete()
      .eq('id', id);

    if (error) {
      return { success: false };
    }
    set((state) => ({
      returns: state.returns.filter(r => r.id !== id)
    }));
    return { success: true };
  }
}));
