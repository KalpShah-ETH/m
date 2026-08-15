import { create } from 'zustand';
import { supabase } from '@/lib/supabase';

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
    
    // Build query for GET /orders
    let query = supabase
      .from('orders')
      .select('*')
      .eq('mapped_status', tab)
      .gte('date', from)
      .lte('date', to);
      
    if (distributorId) {
      query = query.eq('distributor_id', distributorId);
    }

    const { data, error } = await query.catch(() => ({ data: null, error: { message: 'Network error' } }));

    if (error || !data) {
      // Mock data
      set({
        orders: [
          { id: '1', orderNumber: 'ORD-1001', distributorId: 'd1', distributorName: 'PharmaCorp Distributors', distributorContact: '+91 9876543210', date: new Date().toISOString().split('T')[0], totalValue: 12500, status: 'pending', mappedStatus: 'mapped' },
          { id: '2', orderNumber: 'ORD-1002', distributorId: 'd2', distributorName: 'HealthPlus Logistics', distributorContact: '+91 8765432109', date: new Date(Date.now() - 86400000).toISOString().split('T')[0], totalValue: 4500, status: 'processed', mappedStatus: tab },
        ],
        isLoading: false
      });
    } else {
      set({ orders: data, isLoading: false });
    }
  },

  fetchOrderById: async (id) => {
    set({ isLoadingDetail: true, currentOrder: null });
    
    // GET /orders/{id}
    const { data, error } = await supabase
      .from('orders')
      .select('*, items:order_items(*), timeline:order_timeline(*)')
      .eq('id', id)
      .single()
      .catch(() => ({ data: null, error: { message: 'Network error' } }));

    if (error || !data) {
      // Mock detail data
      set({
        currentOrder: {
          id,
          orderNumber: `ORD-100${id}`,
          distributorId: 'd1',
          distributorName: 'PharmaCorp Distributors',
          distributorContact: '+91 9876543210',
          date: new Date().toISOString().split('T')[0],
          totalValue: 12500,
          status: 'pending',
          mappedStatus: 'mapped',
          items: [
            { id: 'i1', productName: 'Paracetamol 500mg', quantity: 10, ptr: 15, total: 150 },
            { id: 'i2', productName: 'Azithromycin 250mg', quantity: 5, ptr: 55, total: 275 },
          ],
          timeline: [
            { status: 'Order Placed', date: new Date().toISOString() },
            { status: 'Pending Confirmation', date: new Date().toISOString() }
          ]
        },
        isLoadingDetail: false
      });
    } else {
      set({ currentOrder: data, isLoadingDetail: false });
    }
  },

  fetchSummary: async () => {
    // GET /orders/summary
    const { data, error } = await supabase
      .rpc('get_orders_summary')
      .catch(() => ({ data: null, error: { message: 'Network error' } }));

    if (error || !data) {
      // Mock summary
      set({ summary: { totalCount: 24, totalValue: 145000 } });
    } else {
      set({ summary: data });
    }
  }
}));
