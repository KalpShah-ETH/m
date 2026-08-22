import { Tabs } from 'expo-router';
import { View, Platform } from 'react-native';
import { House, Compass, MagnifyingGlass, Package, ShoppingCart } from 'phosphor-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TabsLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs screenOptions={{ 
      headerShown: false,
      tabBarActiveTintColor: '#1E4D3A', // primaryForest
      tabBarInactiveTintColor: '#5B6B7C', // textSlate
      tabBarStyle: {
        height: 60 + insets.bottom,
        paddingBottom: insets.bottom > 0 ? insets.bottom : 12,
        paddingTop: 10,
        backgroundColor: '#FFFFFF',
        borderTopWidth: 1,
        borderTopColor: '#E4E9EE',
      },
      tabBarLabelStyle: {
        fontFamily: 'Inter_500Medium',
        fontSize: 10,
        marginTop: 4,
      }
    }}>
      <Tabs.Screen 
        name="index" 
        options={{ 
          title: 'Home',
          tabBarIcon: ({ color, focused }) => <House color={color as string} size={22} weight={focused ? 'fill' : 'regular'} /> 
        }} 
      />
      <Tabs.Screen 
        name="browse" 
        options={{ 
          title: 'Browse',
          tabBarIcon: ({ color }) => <Compass color={color as string} size={22} weight="regular" /> 
        }} 
      />
      <Tabs.Screen 
        name="search" 
        options={{ 
          title: '',
          tabBarIcon: () => (
            <View style={{
              width: 56,
              height: 56,
              borderRadius: 28,
              backgroundColor: '#1E4D3A', // primaryForest
              justifyContent: 'center',
              alignItems: 'center',
              marginTop: -32,
              borderWidth: 4,
              borderColor: '#F6F8FA', // backgroundOffWhite
              shadowColor: '#1E4D3A',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.4,
              shadowRadius: 16,
              elevation: 8,
            }}>
              <MagnifyingGlass color="#FFFFFF" size={24} weight="bold" />
            </View>
          )
        }} 
      />
      <Tabs.Screen 
        name="orders" 
        options={{ 
          title: 'Orders',
          tabBarIcon: ({ color }) => <Package color={color as string} size={22} weight="regular" /> 
        }} 
      />
      <Tabs.Screen 
        name="cart" 
        options={{ 
          title: 'Cart',
          tabBarIcon: ({ color }) => <ShoppingCart color={color as string} size={22} weight="regular" /> 
        }} 
      />
    </Tabs>
  );
}
