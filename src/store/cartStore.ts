import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from './authStore';

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
  
  getCartTotal: () => number;
  getItemCount: () => number;
  getGroupedByDistributor: () => Record<string, { distributorName: string; items: CartItem[] }>;
  
  fetchCart: () => Promise<void>;
  addToCart: (item: Omit<CartItem, 'id'>) => Promise<void>;
  updateQuantity: (id: string, quantity: number) => Promise<void>;
  removeItem: (id: string) => Promise<void>;
  placeOrder: () => Promise<{ success: boolean; error?: any }>;
}

export const useCartStore = create<CartState>((set, get) => ({
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
    const user = useAuthStore.getState().user;
    if (!user) {
      set({ items: [], isSyncing: false });
      return;
    }

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
      }));
      set({ items: mappedItems });
    }
    set({ isSyncing: false });
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

    // Insert to Supabase
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
      const newItem: CartItem = { ...item, id: data.id };
      set((state) => ({
        items: [...state.items, newItem],
        lastAddedItem: item.name
      }));
    }
  },

  updateQuantity: async (id, quantity) => {
    if (quantity <= 0) {
      await get().removeItem(id);
      return;
    }

    // Optimistic update
    set((state) => ({
      items: state.items.map(item => item.id === id ? { ...item, quantity } : item)
    }));

    await supabase.from('cart_items').update({ quantity }).eq('id', id);
  },

  removeItem: async (id) => {
    // Optimistic update
    set((state) => ({
      items: state.items.filter(item => item.id !== id)
    }));

    await supabase.from('cart_items').delete().eq('id', id);
  },

  placeOrder: async () => {
    set({ isLoading: true });
    
    const { data, error } = await supabase.functions.invoke('place-order');

    if (error) {
      set({ isLoading: false });
      return { success: false, error };
    }

    // Clear local cart
    set({ items: [], lastAddedItem: null, isLoading: false });
    return { success: true };
  }
}));
