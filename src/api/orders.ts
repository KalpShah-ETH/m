import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/authStore';
import { Order } from '@/store/ordersStore';

export function useOrders(tab: 'mapped' | 'non-mapped', from: string, to: string, distributorId?: string) {
  return useQuery({
    queryKey: ['orders', tab, from, to, distributorId],
    queryFn: async () => {
      const user = useAuthStore.getState().user;
      if (!user) return [];

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
      if (error) throw error;
      if (!data) return [];

      return data.map((d: any) => ({
        id: d.id,
        orderNumber: d.order_number,
        distributorId: d.distributor_id,
        distributorName: d.distributors.name,
        distributorContact: d.distributors.phone,
        date: d.created_at.split('T')[0],
        totalValue: d.total_amount,
        status: d.status as any,
        mappedStatus: tab
      })) as Order[];
    }
  });
}

export function useOrderById(id: string | undefined) {
  return useQuery({
    queryKey: ['order', id],
    queryFn: async () => {
      if (!id) return null;
      
      const { data, error } = await supabase
        .from('orders')
        .select('*, distributors(name, phone), order_items(*, products(name))')
        .eq('id', id)
        .single();

      if (error) throw error;
      if (!data) return null;

      return {
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
      } as Order;
    },
    enabled: !!id,
  });
}

export function useOrdersSummary() {
  return useQuery({
    queryKey: ['ordersSummary'],
    queryFn: async () => {
      const user = useAuthStore.getState().user;
      if (!user) return { totalCount: 0, totalValue: 0 };

      const { data, error } = await supabase
        .from('orders')
        .select('total_amount')
        .eq('retailer_id', user.id);

      if (error) throw error;
      if (!data) return { totalCount: 0, totalValue: 0 };

      const totalCount = data.length;
      const totalValue = data.reduce((sum, order) => sum + Number(order.total_amount), 0);
      return { totalCount, totalValue };
    }
  });
}
