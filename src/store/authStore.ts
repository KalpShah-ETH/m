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
  login: (email: string, password: string) => Promise<{ error: any }>;
  sendEmailOtp: (email: string) => Promise<{ error: any }>;
  verifyEmailOtp: (email: string, otp: string) => Promise<{ error: any; valid?: boolean }>;
  forgotPassword: (email: string) => Promise<{ error: any }>;
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

  login: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (data.session) set({ session: data.session, user: data.user });
    return { error };
  },

  sendEmailOtp: async (email) => {
    // Calling the custom edge function to send OTP via external provider
    const { error } = await supabase.functions.invoke('send-email-otp', {
      body: { email }
    });
    return { error };
  },

  verifyEmailOtp: async (email, otp) => {
    // Calling the custom edge function to verify OTP
    const { data, error } = await supabase.functions.invoke('verify-email-otp', {
      body: { email, otp }
    });
    return { error, valid: data?.valid };
  },

  forgotPassword: async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    return { error };
  },

  signup: async (data) => {
    // We expect data to contain all fields from Step 1, 2, and 3
    const { data: authData, error } = await supabase.auth.signUp({
      email: data.shopEmail,
      password: data.password,
      options: {
        data: {
          business_type: data.businessType,
          shop_firm_name: data.shopFirmName,
          owner_name: data.ownerName,
          shop_address: data.shopAddress,
          pincode: data.pincode,
          area: data.area,
          city: data.city,
          state: data.state,
          email_verified: data.emailVerified, // should be true since we verified it
          pharmacist_name: data.pharmacistName,
          pharmacist_number: data.pharmacistNumber,
          // License fields will be added here later
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
