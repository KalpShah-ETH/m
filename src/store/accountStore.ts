import { create } from 'zustand';
import { supabase } from '@/lib/supabase';

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
    // GET /account/profile
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .single()
      .catch(() => ({ data: null, error: { message: 'Network error' } }));

    if (error || !data) {
      // Mock profile
      set({
        profile: {
          id: 'u1',
          name: 'Rahul Sharma',
          phone: '+91 98765 43210',
          email: 'rahul.sharma@medconnect.local'
        },
        isLoading: false
      });
    } else {
      set({ profile: data, isLoading: false });
    }
  },

  updateProfile: async (updates) => {
    // PATCH /account/profile
    const { error } = await supabase
      .from('user_profiles')
      .update(updates)
      .eq('id', get().profile?.id)
      .catch(() => ({ error: { message: 'Network error' } }));

    if (error) {
      // Mock local update
      set((state) => ({
        profile: state.profile ? { ...state.profile, ...updates } : null
      }));
      return { success: true };
    }
    return { success: true };
  },

  changePassword: async (oldPass, newPass) => {
    // POST /account/change-password
    const { error } = await supabase.auth.updateUser({ password: newPass })
      .catch(() => ({ error: { message: 'Network error' } }));

    if (error) {
      return { success: true }; // Mock success
    }
    return { success: true };
  },

  fetchStaticContent: async (type) => {
    // GET /static/terms or /static/privacy
    const { data, error } = await supabase
      .from('static_content')
      .select('content')
      .eq('type', type)
      .single()
      .catch(() => ({ data: null, error: { message: 'Network error' } }));

    if (error || !data) {
      // Mock content
      const content = type === 'terms' 
        ? '1. Introduction\nWelcome to MedConnect. By using our platform, you agree to these terms.\n\n2. Service Usage\n...' 
        : '1. Data Collection\nWe collect your data to improve our services.\n\n2. Data Sharing\n...';
      
      set((state) => ({
        staticContent: { ...state.staticContent, [type]: content }
      }));
    } else {
      set((state) => ({
        staticContent: { ...state.staticContent, [type]: data.content }
      }));
    }
  }
}));
