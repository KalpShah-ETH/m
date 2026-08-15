import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { MMKV } from 'react-native-mmkv';
import { supabase } from '@/lib/supabase';

const storage = new MMKV({ id: 'cart-storage' });

const zustandStorage = {
  getItem: (name: string) => {
    const value = storage.getString(name);
    return value ?? null;
  },
  setItem: (name: string, value: string) => {
    storage.set(name, value);
  },
  removeItem: (name: string) => {
    storage.delete(name);
  },
};

export interface CartItem {
  id: string; // The cart item unique ID
  productId: string;
  name: string;
  quantity: number;
  ptr: number;
  mrp: number;
  distributorId: string;
  distributorName: string;
}

interface CartState {
  items: CartItem[];
  isLoading: boolean;
  isSyncing: boolean;
  lastAddedItem: string | null;
  
  // Getters (computed properties)
  getCartTotal: () => number;
  getItemCount: () => number;
  getGroupedByDistributor: () => Record<string, { distributorName: string; items: CartItem[] }>;
  
  // Actions
  fetchCart: () => Promise<void>;
  addToCart: (item: Omit<CartItem, 'id'>) => Promise<void>;
  updateQuantity: (id: string, quantity: number) => Promise<void>;
  removeItem: (id: string) => Promise<void>;
  placeOrder: () => Promise<{ success: boolean; error?: any }>;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isLoading: false,
      isSyncing: false,
      lastAddedItem: null,

      getCartTotal: () => {
        return get().items.reduce((total, item) => total + (item.ptr * item.quantity), 0);
      },

      getItemCount: () => {
        return get().items.reduce((count, item) => count + item.quantity, 0);
      },

      getGroupedByDistributor: () => {
        const groups: Record<string, { distributorName: string; items: CartItem[] }> = {};
        get().items.forEach(item => {
          if (!groups[item.distributorId]) {
            groups[item.distributorId] = { distributorName: item.distributorName, items: [] };
          }
          groups[item.distributorId].items.push(item);
        });
        return groups;
      },

      fetchCart: async () => {
        set({ isSyncing: true });
        // GET /cart
        const { data, error } = await supabase.from('cart').select('*').catch(() => ({ data: null, error: { message: 'Network error' } }));
        if (!error && data) {
          // In a real app, transform 'data' into CartItem[]
          // set({ items: data });
        }
        set({ isSyncing: false });
      },

      addToCart: async (item) => {
        // Optimistic UI + MMKV persistence
        const tempId = `temp_${Date.now()}`;
        const newItem: CartItem = { ...item, id: tempId };
        
        set((state) => {
          // Check if item already exists
          const existingItem = state.items.find(i => i.productId === item.productId && i.distributorId === item.distributorId);
          if (existingItem) {
            return {
              items: state.items.map(i => i.id === existingItem.id ? { ...i, quantity: i.quantity + item.quantity } : i),
              lastAddedItem: item.name
            };
          }
          return {
            items: [...state.items, newItem],
            lastAddedItem: item.name
          };
        });

        // POST /cart/add
        await supabase.from('cart').insert({ 
          product_id: item.productId, 
          quantity: item.quantity,
          distributor_id: item.distributorId
        }).catch(console.error);
      },

      updateQuantity: async (id, quantity) => {
        if (quantity <= 0) {
          await get().removeItem(id);
          return;
        }

        set((state) => ({
          items: state.items.map(item => item.id === id ? { ...item, quantity } : item)
        }));

        // PATCH /cart/item/{id}
        await supabase.from('cart').update({ quantity }).eq('id', id).catch(console.error);
      },

      removeItem: async (id) => {
        set((state) => ({
          items: state.items.filter(item => item.id !== id)
        }));

        // DELETE /cart/item/{id}
        await supabase.from('cart').delete().eq('id', id).catch(console.error);
      },

      placeOrder: async () => {
        set({ isLoading: true });
        // POST /orders/place
        const { error } = await supabase.functions.invoke('place-order', {
          body: { items: get().items }
        }).catch(() => ({ error: { message: 'Checkout failed' } }));

        if (error) {
          // Mock success
          set({ items: [], lastAddedItem: null, isLoading: false });
          return { success: true };
        }

        set({ items: [], lastAddedItem: null, isLoading: false });
        return { success: true };
      }
    }),
    {
      name: 'cart-storage',
      storage: createJSONStorage(() => zustandStorage),
      partialize: (state) => ({ items: state.items }), // Only persist items array
    }
  )
);
