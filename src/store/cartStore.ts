import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { createMMKV, type MMKV } from 'react-native-mmkv';
import { Platform } from 'react-native';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from './authStore';

const storage: MMKV | null = Platform.OS !== 'web' ? createMMKV({ id: 'cart-storage' }) : null;

const zustandStorage = {
  getItem: (name: string) => {
    if (!storage) return null;
    const value = storage.getString(name);
    return value ?? null;
  },
  setItem: (name: string, value: string) => {
    if (storage) storage.set(name, value);
  },
  removeItem: (name: string) => {
    if (storage) storage.remove(name);
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
  isPendingSync?: boolean; // Track if it needs to be uploaded to Supabase
}

export interface DistributorLimit {
  minOrderValue: number;
  maxDebtAmount: number;
  outstandingAmount: number;
}

interface CartState {
  items: CartItem[];
  isLoading: boolean;
  isSyncing: boolean;
  lastAddedItem: string | null;
  distributorLimits: Record<string, DistributorLimit>;
  
  getCartTotal: () => number;
  getItemCount: () => number;
  getGroupedByDistributor: () => Record<string, { distributorName: string; items: CartItem[] }>;
  
  fetchCart: () => Promise<void>;
  fetchLimits: () => Promise<void>;
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
      distributorLimits: {},

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
        const user = useAuthStore.getState().user;
        if (!user) {
          set({ items: [], isSyncing: false });
          return;
        }

        // Attempt to fetch from remote
        const { data, error } = await supabase
          .from('cart_items')
          .select('id, quantity, product_id, distributor_id, products(name, ptr, mrp), distributors(name)')
          .eq('retailer_id', user.id);
          
        if (!error && data) {
          const mappedItems: CartItem[] = data.map((d: any) => ({
            id: d.id,
            productId: d.product_id,
            name: d.products.name,
            quantity: d.quantity,
            ptr: d.products.ptr,
            mrp: d.products.mrp,
            distributorId: d.distributor_id,
            distributorName: d.distributors.name,
            isPendingSync: false
          }));
          
          // Merge local pending items that haven't synced yet
          const pendingLocalItems = get().items.filter(i => i.isPendingSync);
          
          // In a production app, we would push pendingLocalItems to Supabase here.
          // For now, we merge them into the UI state so they aren't lost.
          
          set({ items: [...mappedItems, ...pendingLocalItems] });
          get().fetchLimits();
        }
        // If error (e.g. offline), we do nothing and keep the locally persisted items!
        
        set({ isSyncing: false });
      },

      fetchLimits: async () => {
        const user = useAuthStore.getState().user;
        if (!user) return;

        const cartItems = get().items;
        if (cartItems.length === 0) {
          set({ distributorLimits: {} });
          return;
        }

        const uniqueDistributorIds = Array.from(new Set(cartItems.map(i => i.distributorId)));

        // 1. Fetch min order and max debt from distributors table
        const { data: distData } = await supabase
          .from('distributors')
          .select('id, minimum_order_value, max_debt_amount')
          .in('id', uniqueDistributorIds);

        // 2. Fetch outstanding amount from retailer_distributor_map
        const { data: mapData } = await supabase
          .from('retailer_distributor_map')
          .select('distributor_id, outstanding_amount')
          .eq('retailer_id', user.id)
          .in('distributor_id', uniqueDistributorIds);

        const newLimits: Record<string, DistributorLimit> = {};

        uniqueDistributorIds.forEach(dId => {
          const distInfo = distData?.find((d: any) => d.id === dId);
          const mapInfo = mapData?.find((m: any) => m.distributor_id === dId);
          
          newLimits[dId] = {
            minOrderValue: distInfo ? Number(distInfo.minimum_order_value) : 0,
            maxDebtAmount: distInfo ? Number(distInfo.max_debt_amount) : 0,
            outstandingAmount: mapInfo ? Number(mapInfo.outstanding_amount) : 0
          };
        });

        set({ distributorLimits: newLimits });
      },

      addToCart: async (item) => {
        const user = useAuthStore.getState().user;
        if (!user) return;

        // Check if item already exists locally to prevent duplicates
        const existingItem = get().items.find(i => i.productId === item.productId && i.distributorId === item.distributorId);
        
        if (existingItem) {
          await get().updateQuantity(existingItem.id, existingItem.quantity + item.quantity);
          set({ lastAddedItem: item.name });
          return;
        }

        // Optimistic UI insert with a temporary ID
        const tempId = `temp_${Date.now()}`;
        const newItem: CartItem = { ...item, id: tempId, isPendingSync: true };
        
        set((state) => ({
          items: [...state.items, newItem],
          lastAddedItem: item.name
        }));

        // Insert to Supabase (Fire and forget, resilient to offline via optimistic UI)
        const { data, error } = await supabase
          .from('cart_items')
          .insert({ 
            retailer_id: user.id,
            product_id: item.productId, 
            quantity: item.quantity,
            distributor_id: item.distributorId
          })
          .select('id')
          .single();

        if (!error && data) {
          // Replace temp ID with real DB ID and mark as synced
          set((state) => ({
            items: state.items.map(i => i.id === tempId ? { ...i, id: data.id, isPendingSync: false } : i)
          }));
        }
        
        get().fetchLimits();
      },

      updateQuantity: async (id, quantity) => {
        if (quantity <= 0) {
          await get().removeItem(id);
          return;
        }

        // Optimistic update
        set((state) => ({
          items: state.items.map(item => item.id === id ? { ...item, quantity, isPendingSync: item.id.startsWith('temp_') } : item)
        }));

        if (!id.startsWith('temp_')) {
          await supabase.from('cart_items').update({ quantity }).eq('id', id);
        }
      },

      removeItem: async (id) => {
        // Optimistic update
        set((state) => ({
          items: state.items.filter(item => item.id !== id)
        }));

        if (!id.startsWith('temp_')) {
          await supabase.from('cart_items').delete().eq('id', id);
        }
        
        get().fetchLimits();
      },

      placeOrder: async () => {
        set({ isLoading: true });
        
        // Push any pending cart items to server first before placing order
        const pendingItems = get().items.filter(i => i.isPendingSync);
        const user = useAuthStore.getState().user;
        
        if (pendingItems.length > 0 && user) {
          const insertPayload = pendingItems.map(item => ({
            retailer_id: user.id,
            product_id: item.productId,
            quantity: item.quantity,
            distributor_id: item.distributorId
          }));
          await supabase.from('cart_items').insert(insertPayload);
        }

        const { data, error } = await supabase.functions.invoke('place-order');

        if (error) {
          set({ isLoading: false });
          return { success: false, error };
        }

        // Clear local cart completely on success
        set({ items: [], lastAddedItem: null, isLoading: false });
        return { success: true };
      }
    }),
    {
      name: 'cart-storage',
      storage: createJSONStorage(() => zustandStorage),
      partialize: (state) => ({ items: state.items }), // Only persist items array to disk
    }
  )
);
