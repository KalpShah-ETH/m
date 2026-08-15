import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from './authStore';

export interface UserProfile {
  id: string;
  name: string;
  phone: string;
  email: string;
}

interface AccountState {
  profile: UserProfile | null;
  isLoading: boolean;
  staticContent: { terms?: string; privacy?: string };
  
  fetchProfile: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ success: boolean }>;
  changePassword: (oldPass: string, newPass: string) => Promise<{ success: boolean; error?: string }>;
  fetchStaticContent: (type: 'terms' | 'privacy') => Promise<void>;
}

export const useAccountStore = create<AccountState>((set, get) => ({
  profile: null,
  isLoading: false,
  staticContent: {},

  fetchProfile: async () => {
    set({ isLoading: true });
    
    const user = useAuthStore.getState().user;
    if (!user) {
      set({ profile: null, isLoading: false });
      return;
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error || !data) {
      set({ profile: null, isLoading: false });
    } else {
      set({ 
        profile: {
          id: data.id,
          name: `${data.first_name || ''} ${data.last_name || ''}`.trim(),
          phone: data.mobile_number,
          email: data.email
        }, 
        isLoading: false 
      });
    }
  },

  updateProfile: async (updates) => {
    const user = useAuthStore.getState().user;
    if (!user) return { success: false };

    // Map UserProfile fields back to profiles table columns
    const dbUpdates: any = {};
    if (updates.name) {
      const parts = updates.name.split(' ');
      dbUpdates.first_name = parts[0];
      dbUpdates.last_name = parts.slice(1).join(' ');
    }
    if (updates.phone) dbUpdates.mobile_number = updates.phone;
    if (updates.email) dbUpdates.email = updates.email;

    const { error } = await supabase
      .from('profiles')
      .update(dbUpdates)
      .eq('id', user.id);

    if (error) {
      return { success: false };
    }
    
    // Optimistic local update
    set((state) => ({
      profile: state.profile ? { ...state.profile, ...updates } : null
    }));
    return { success: true };
  },

  changePassword: async (oldPass, newPass) => {
    // Supabase auth.updateUser handles password changes
    const { error } = await supabase.auth.updateUser({ password: newPass });

    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true };
  },

  fetchStaticContent: async (type) => {
    // For static content, we'll just mock it as we don't have a table for it yet.
    const content = type === 'terms' 
      ? '1. Introduction\nWelcome to MedConnect. By using our platform, you agree to these terms.\n\n2. Service Usage\nThis service is provided to registered retailers only.' 
      : '1. Data Collection\nWe securely store your contact details and order history to provide this service.\n\n2. Data Sharing\nYour data is never sold to third parties.';
    
    set((state) => ({
      staticContent: { ...state.staticContent, [type]: content }
    }));
  }
}));
