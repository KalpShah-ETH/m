import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { Session, User } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setSession: (session: Session | null) => void;
  setLoading: (isLoading: boolean) => void;
  
  // API Endpoints mapped to store actions
  login: (username: string, password: string) => Promise<{ error: any }>;
  sendOtp: (mobileNumber: string) => Promise<{ error: any }>;
  verifyOtp: (mobileNumber: string, otp: string) => Promise<{ error: any }>;
  forgotPassword: (identifier: string) => Promise<{ error: any }>;
  signup: (data: any) => Promise<{ error: any }>;
  fetchUser: () => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  session: null,
  isLoading: true,
  setUser: (user) => set({ user }),
  setSession: (session) => set({ session }),
  setLoading: (isLoading) => set({ isLoading }),

  login: async (username, password) => {
    // Note: Assuming username is mapped to email in Supabase, 
    // or using a custom Supabase setup that accepts username.
    // For now, we will treat 'username' as the identifier.
    // If username is not an email, you might append a domain e.g., `${username}@medconnect.local`
    const identifier = username.includes('@') ? username : `${username}@medconnect.local`;
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email: identifier,
      password,
    });
    if (data.session) set({ session: data.session, user: data.user });
    return { error };
  },

  sendOtp: async (mobileNumber) => {
    const { error } = await supabase.auth.signInWithOtp({
      phone: mobileNumber,
    });
    return { error };
  },

  verifyOtp: async (mobileNumber, otp) => {
    const { data, error } = await supabase.auth.verifyOtp({
      phone: mobileNumber,
      token: otp,
      type: 'sms',
    });
    if (data.session) set({ session: data.session, user: data.user });
    return { error };
  },

  forgotPassword: async (identifier) => {
    const isEmail = identifier.includes('@');
    const { error } = await supabase.auth.resetPasswordForEmail(
      isEmail ? identifier : `${identifier}@medconnect.local`
    );
    return { error };
  },

  signup: async (data) => {
    const identifier = data.username.includes('@') ? data.username : `${data.username}@medconnect.local`;
    const { data: authData, error } = await supabase.auth.signUp({
      email: identifier,
      password: data.password,
      options: {
        data: {
          first_name: data.firstName,
          last_name: data.lastName,
          mobile_number: data.mobileNumber,
          email_address: data.email, // Store the real email in user metadata
          distributor_code: data.distributorCode,
        },
      },
    });
    if (authData.session) set({ session: authData.session, user: authData.user });
    return { error };
  },

  fetchUser: async () => {
    set({ isLoading: true });
    const { data: { session } } = await supabase.auth.getSession();
    set({ session, user: session?.user ?? null, isLoading: false });
  },

  logout: async () => {
    await supabase.auth.signOut();
    set({ user: null, session: null });
  },
}));
