import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { Session, User } from '@supabase/supabase-js';
import { Alert } from 'react-native';

interface AuthState {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setSession: (session: Session | null) => void;
  setLoading: (isLoading: boolean) => void;
  
  // API Endpoints mapped to store actions
  login: (email: string, password: string) => Promise<{ error: any; isPending?: boolean }>;
  sendEmailOtp: (email: string) => Promise<{ error: any }>;
  verifyEmailOtp: (email: string, otp: string) => Promise<{ error: any; valid?: boolean }>;
  forgotPassword: (email: string) => Promise<{ error: any }>;
  uploadLicense: (tempId: string, licenseKey: string, localUri: string) => Promise<{ path: string | null; error: any }>;
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
    
    if (error) return { error };

    if (data.session && data.user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('approval_status')
        .eq('id', data.user.id)
        .single();

      if (profile?.approval_status === 'pending') {
        await supabase.auth.signOut();
        return { error: null, isPending: true };
      }
      
      if (profile?.approval_status === 'rejected') {
        await supabase.auth.signOut();
        return { error: new Error('Your application was rejected.') };
      }

      set({ session: data.session, user: data.user });
      return { error: null, isPending: false };
    }
    
    return { error: new Error('Unknown error during login') };
  },

  sendEmailOtp: async (email) => {
    // DEBUG: First try direct fetch to test network connectivity
    try {
      Alert.alert('DEBUG', 'Starting direct fetch test...');
      const directRes = await fetch('https://srrzoywtgkpvodfbpjqz.supabase.co/functions/v1/send-email-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': 'sb_publishable_DsM75EGKRPrMP_76r8N7Zg_AmCTMSnu',
          'Authorization': 'Bearer sb_publishable_DsM75EGKRPrMP_76r8N7Zg_AmCTMSnu',
        },
        body: JSON.stringify({ email }),
      });
      const directBody = await directRes.text();
      Alert.alert('Direct Fetch Result', `Status: ${directRes.status}\nBody: ${directBody}`);
      if (directRes.ok) {
        return { error: null };
      }
      return { error: new Error(directBody) };
    } catch (fetchErr: any) {
      Alert.alert('Direct Fetch FAILED', `Error: ${fetchErr?.message}\n\nStack: ${fetchErr?.stack?.substring(0, 300)}`);
    }

    // Fallback: try supabase.functions.invoke
    try {
      const { data, error } = await supabase.functions.invoke('send-email-otp', {
        body: { email }
      });
      if (error) {
        Alert.alert('Invoke Error', `Name: ${error?.name}\nMsg: ${error?.message}\nContext: ${JSON.stringify(error?.context || 'none')}`);
      }
      return { error };
    } catch (e: any) {
      Alert.alert('Invoke Exception', e?.message);
      return { error: e };
    }
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
          license_20_20b_number: data.license20,
          license_20_20b_doc_url: data.license20Url, // Will hold the temp path initially
          license_20_20b_expiry: data.license20Expiry,
          license_21_21b_number: data.license21,
          license_21_21b_doc_url: data.license21Url, // Will hold the temp path initially
          license_21_21b_expiry: data.license21Expiry,
          gstin_number: data.gstin,
          pan_number: data.pan,
          referral_code: data.referral,
          whatsapp_opt_in: data.whatsappOptIn,
          approval_status: 'pending',
        },
      },
    });
    
    if (authData.user && authData.session) {
      try {
        const userId = authData.user.id;
        let finalLicense20Url = data.license20Url;
        let finalLicense21Url = data.license21Url;
        
        // Move files from pending/{tempId}/... to {userId}/...
        if (data.license20Url && data.license20Url.startsWith('pending/')) {
           const ext = data.license20Url.split('.').pop() || 'jpg';
           const newPath = `${userId}/license20.${ext}`;
           const { error } = await supabase.storage.from('licenses').move(data.license20Url, newPath);
           if (!error) finalLicense20Url = newPath; 
        }
        
        if (data.license21Url && data.license21Url.startsWith('pending/')) {
           const ext = data.license21Url.split('.').pop() || 'jpg';
           const newPath = `${userId}/license21.${ext}`;
           const { error } = await supabase.storage.from('licenses').move(data.license21Url, newPath);
           if (!error) finalLicense21Url = newPath; 
        }

        // Update profiles with actual uploaded paths
        await supabase.from('profiles').update({
          license_20_20b_doc_url: finalLicense20Url,
          license_21_21b_doc_url: finalLicense21Url
        }).eq('id', userId);
      } catch (e) {
        console.error("Document move error:", e);
      }
      
      // Sign out immediately so they cannot bypass the approval gate
      await supabase.auth.signOut();
    }
    
    return { error };
  },

  uploadLicense: async (tempId, licenseKey, localUri) => {
    try {
      if (!localUri || localUri.startsWith('pending/')) return { path: localUri, error: null };
      
      const ext = localUri.split('.').pop() || 'jpg';
      const path = `pending/${tempId}/${licenseKey}.${ext}`;
      
      const res = await fetch(localUri);
      const blob = await res.blob();
      const { data, error } = await supabase.storage.from('licenses').upload(path, blob, { upsert: true });
      
      if (error) return { path: null, error };
      return { path: data.path, error: null };
    } catch (e) {
      return { path: null, error: e };
    }
  },

  fetchUser: async () => {
    set({ isLoading: true });
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session && session.user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('approval_status')
        .eq('id', session.user.id)
        .single();
        
      if (profile?.approval_status === 'pending') {
        // They should not be able to bypass the login check
        await supabase.auth.signOut();
        set({ session: null, user: null, isLoading: false });
        return;
      }
    }
    
    set({ session, user: session?.user ?? null, isLoading: false });
  },

  logout: async () => {
    await supabase.auth.signOut();
    set({ user: null, session: null });
  },
}));
