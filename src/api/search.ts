import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Product, Distributor } from '@/store/searchStore';

export function useSearchProducts(query: string) {
  return useQuery({
    queryKey: ['searchProducts', query],
    queryFn: async () => {
      if (query.length < 3) return [];
      
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .ilike('name', `%${query}%`)
          .limit(20);
          
        if (error || !data) {
          throw new Error('Fallback to mock');
        }
        return data as Product[];
      } catch (e) {
        // Mocking data for development as in original store
        return [
          { id: '1', name: 'Paracetamol', strength: '500mg', manufacturer: 'Cipla', price: 15.00 },
          { id: '2', name: 'Azithromycin', strength: '250mg', manufacturer: 'Sun Pharma', price: 55.00 },
          { id: '3', name: `${query} Aspirin`, strength: '75mg', manufacturer: 'Abbott', price: 12.50 },
        ] as Product[];
      }
    },
    enabled: query.length >= 3,
    staleTime: 1000 * 60, // Cache searches for 1 minute
  });
}

export function useSearchDistributors(query: string) {
  return useQuery({
    queryKey: ['searchDistributors', query],
    queryFn: async () => {
      if (query.length < 3) return [];
      
      try {
        const { data, error } = await supabase
          .from('distributors')
          .select('*')
          .ilike('name', `%${query}%`)
          .limit(20);
          
        if (error || !data) {
          throw new Error('Fallback to mock');
        }
        return data as Distributor[];
      } catch (e) {
        return [
          { id: '1', name: `${query} Pharma Logistics`, rating: 4.5 },
          { id: '2', name: 'Global Health Distributors', rating: 4.8 },
        ] as Distributor[];
      }
    },
    enabled: query.length >= 3,
    staleTime: 1000 * 60,
  });
}
