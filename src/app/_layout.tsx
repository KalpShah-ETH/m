import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useColorScheme } from 'react-native';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { Stack } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import { useEffect } from 'react';
import { MiniCart } from '@/components/MiniCart';
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const fetchUser = useAuthStore((state) => state.fetchUser);
  const isLoading = useAuthStore((state) => state.isLoading);

  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    fetchUser().finally(() => {
      if (fontsLoaded) {
        SplashScreen.hideAsync();
      }
    });
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null; // Keep native splash screen visible until fonts loaded
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      {/* <AnimatedSplashOverlay /> */}
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
      <MiniCart />
    </ThemeProvider>
  );
}
