import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import { createMMKV, type MMKV } from 'react-native-mmkv';
import { Platform } from 'react-native';

// Initialize MMKV instance for Supabase Auth (Native only)
const supabaseStorage: MMKV | null = Platform.OS !== 'web' ? createMMKV({ id: 'supabase-auth' }) : null;

const customStorageAdapter = {
  getItem: (key: string) => {
    if (!supabaseStorage) return null;
    const value = supabaseStorage.getString(key);
    return value ?? null;
  },
  setItem: (key: string, value: string) => {
    if (supabaseStorage) supabaseStorage.set(key, value);
  },
  removeItem: (key: string) => {
    if (supabaseStorage) supabaseStorage.delete(key);
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
