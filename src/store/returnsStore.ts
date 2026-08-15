import { create } from 'zustand';
import { supabase } from '@/lib/supabase';

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
    
    // GET /returns?status={status}&type={type}
    const { data, error } = await supabase
      .from('returns')
      .select('*')
      .eq('status', status)
      .eq('type', type)
      .catch(() => ({ data: null, error: { message: 'Network error' } }));

    if (error || !data) {
      // Mock data
      set({
        returns: status === 'draft' ? [
          { id: 'r1', returnNumber: 'RET-DRAFT-01', orderId: 'ORD-1001', distributorName: 'PharmaCorp', date: new Date().toISOString().split('T')[0], status: 'draft', type: type, items: [{ id: 'i1', productName: 'Aspirin 75mg', quantity: 2, reason: type }] }
        ] : [
          { id: 'r2', returnNumber: 'RET-SUB-01', orderId: 'ORD-1000', distributorName: 'HealthPlus', date: '2026-08-01', status: 'submitted', type: type, items: [{ id: 'i2', productName: 'Paracetamol', quantity: 5, reason: type }] }
        ],
        isLoading: false
      });
    } else {
      set({ returns: data, isLoading: false });
    }
  },

  initiateReturn: async (data) => {
    // POST /returns/initiate
    const { data: result, error } = await supabase
      .from('returns')
      .insert({ ...data, status: 'draft' })
      .select()
      .single()
      .catch(() => ({ data: null, error: { message: 'Network error' } }));

    if (error) {
      console.log('Mock initiate return success:', data);
      return { success: true, id: `mock-${Date.now()}` };
    }
    return { success: true, id: result.id };
  },

  editDraft: async (id, updates) => {
    // PATCH /returns/{id}
    const { error } = await supabase
      .from('returns')
      .update(updates)
      .eq('id', id)
      .catch(() => ({ error: { message: 'Network error' } }));

    if (error) {
      console.log('Mock edit draft success:', id, updates);
      return { success: true };
    }
    return { success: true };
  },

  submitReturn: async (id) => {
    // POST /returns/{id}/submit
    const { error } = await supabase
      .from('returns')
      .update({ status: 'submitted' })
      .eq('id', id)
      .catch(() => ({ error: { message: 'Network error' } }));

    if (error) {
      set((state) => ({
        returns: state.returns.filter(r => r.id !== id)
      }));
      return { success: true };
    }
    return { success: true };
  },

  cancelDraft: async (id) => {
    // Used specifically to delete a draft entirely
    const { error } = await supabase
      .from('returns')
      .delete()
      .eq('id', id)
      .catch(() => ({ error: { message: 'Network error' } }));

    if (error) {
      set((state) => ({
        returns: state.returns.filter(r => r.id !== id)
      }));
      return { success: true };
    }
    return { success: true };
  }
}));
