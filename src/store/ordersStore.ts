import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from './authStore';

export interface OrderLineItem {
  id: string;
  productName: string;
  quantity: number;
  ptr: number;
  total: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  distributorId: string;
  distributorName: string;
  distributorContact: string;
  date: string;
  totalValue: number;
  status: 'pending' | 'processed' | 'shipped' | 'delivered' | 'cancelled';
  mappedStatus: 'mapped' | 'non-mapped';
  items?: OrderLineItem[];
  timeline?: { status: string; date: string }[];
}

interface OrdersSummary {
  totalCount: number;
  totalValue: number;
}

interface OrdersState {
  orders: Order[];
  currentOrder: Order | null;
  summary: OrdersSummary;
  isLoading: boolean;
  isLoadingDetail: boolean;
  
  fetchOrders: (filters: { tab: 'mapped' | 'non-mapped', from: string, to: string, distributorId?: string }) => Promise<void>;
  fetchOrderById: (id: string) => Promise<void>;
  fetchSummary: () => Promise<void>;
}

export const useOrdersStore = create<OrdersState>((set) => ({
  orders: [],
  currentOrder: null,
  summary: { totalCount: 0, totalValue: 0 },
  isLoading: false,
  isLoadingDetail: false,

  fetchOrders: async ({ tab, from, to, distributorId }) => {
    set({ isLoading: true });
    
    const user = useAuthStore.getState().user;
    if (!user) {
      set({ orders: [], isLoading: false });
      return;
    }

    let query = supabase
      .from('orders')
      .select('*, distributors(name, phone), retailer_distributor_map!inner(status)')
      .eq('retailer_id', user.id)
      .eq('retailer_distributor_map.retailer_id', user.id)
      .eq('retailer_distributor_map.status', tab === 'mapped' ? 'approved' : 'pending')
      .gte('created_at', from)
      .lte('created_at', to);
      
    if (distributorId) {
      query = query.eq('distributor_id', distributorId);
    }

    const { data, error } = await query;

    if (error || !data) {
      set({ orders: [], isLoading: false });
    } else {
      const orders: Order[] = data.map((d: any) => ({
        id: d.id,
        orderNumber: d.order_number,
        distributorId: d.distributor_id,
        distributorName: d.distributors.name,
        distributorContact: d.distributors.phone,
        date: d.created_at.split('T')[0],
        totalValue: d.total_amount,
        status: d.status as any,
        mappedStatus: tab
      }));
      set({ orders, isLoading: false });
    }
  },

  fetchOrderById: async (id) => {
    set({ isLoadingDetail: true, currentOrder: null });
    
    const { data, error } = await supabase
      .from('orders')
      .select('*, distributors(name, phone), order_items(*, products(name))')
      .eq('id', id)
      .single();

    if (error || !data) {
      set({ currentOrder: null, isLoadingDetail: false });
    } else {
      const currentOrder: Order = {
        id: data.id,
        orderNumber: data.order_number,
        distributorId: data.distributor_id,
        distributorName: data.distributors.name,
        distributorContact: data.distributors.phone,
        date: data.created_at.split('T')[0],
        totalValue: data.total_amount,
        status: data.status as any,
        mappedStatus: 'mapped', // Simplified
        items: data.order_items.map((item: any) => ({
          id: item.id,
          productName: item.products.name,
          quantity: item.quantity,
          ptr: item.ptr_at_order,
          total: item.quantity * item.ptr_at_order
        })),
        timeline: [
          { status: 'Order Placed', date: data.created_at }
        ]
      };
      set({ currentOrder, isLoadingDetail: false });
    }
  },

  fetchSummary: async () => {
    const user = useAuthStore.getState().user;
    if (!user) return;

    const { data, error } = await supabase
      .from('orders')
      .select('total_amount')
      .eq('retailer_id', user.id);

    if (!error && data) {
      const totalCount = data.length;
      const totalValue = data.reduce((sum, order) => sum + Number(order.total_amount), 0);
      set({ summary: { totalCount, totalValue } });
    }
  }
}));
