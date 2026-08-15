import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import { MMKV } from 'react-native-mmkv';

// Initialize MMKV instance for Supabase Auth
const supabaseStorage = new MMKV({ id: 'supabase-auth' });

const customStorageAdapter = {
  getItem: (key: string) => {
    const value = supabaseStorage.getString(key);
    return value ?? null;
  },
  setItem: (key: string, value: string) => {
    supabaseStorage.set(key, value);
  },
  removeItem: (key: string) => {
    supabaseStorage.delete(key);
  },
};

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://placeholder-url.supabase.co';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: customStorageAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
