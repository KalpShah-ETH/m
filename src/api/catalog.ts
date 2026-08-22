import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/authStore';
import { CatalogProduct, Category } from '@/store/catalogStore';

export function useCategories(distributorId: string | undefined) {
  return useQuery({
    queryKey: ['categories', distributorId],
    queryFn: async () => {
      const { data, error } = await supabase.from('categories').select('id, name');
      if (error) throw error;
      return (data as Category[]) || [];
    },
    enabled: !!distributorId,
  });
}

export function useCatalogProducts(distributorId: string | undefined, categoryId: string | null, tab: 'mapped' | 'non-mapped') {
  return useQuery({
    queryKey: ['catalogProducts', distributorId, categoryId, tab],
    queryFn: async () => {
      if (!distributorId) return [];
      
      const user = useAuthStore.getState().user;
      if (!user) return [];

      let query = supabase
        .from('products')
        .select('id, name, pack_size, ptr, mrp, stock_status, discount_percent')
        .eq('distributor_id', distributorId);
        
      if (categoryId) {
        query = query.eq('category_id', categoryId);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Fetch cart items
      const { data: cartData } = await supabase
        .from('cart_items')
        .select('product_id, quantity')
        .eq('retailer_id', user.id)
        .eq('distributor_id', distributorId);

      const cartMap = new Map();
      if (cartData) {
        cartData.forEach(c => cartMap.set(c.product_id, c.quantity));
      }

      return data.map(p => ({
        id: p.id,
        name: p.name,
        packSize: p.pack_size,
        ptr: p.ptr,
        mrp: p.mrp,
        stockStatus: p.stock_status as any,
        discountPercentage: p.discount_percent || 0,
        quantityInCart: cartMap.get(p.id) || 0
      })) as CatalogProduct[];
    },
    enabled: !!distributorId,
  });
}

export function useRequestConnection() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (distributorId: string) => {
      const { data, error } = await supabase.functions.invoke('request-distributor-connect', {
        body: { distributor_id: distributorId }
      });
      if (error) throw error;
      if (!data.success) throw new Error('Failed to request connection');
      return data;
    },
    onSuccess: () => {
      // Invalidate relevant queries if needed
    },
  });
}
