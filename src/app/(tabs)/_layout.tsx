import { Tabs } from 'expo-router';
import { Home, Search, ShoppingCart, User, Truck, Receipt, ClipboardList } from 'lucide-react-native';

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ 
      headerShown: false,
      tabBarActiveTintColor: '#0066cc',
      tabBarInactiveTintColor: '#999',
    }}>
      <Tabs.Screen 
        name="index" 
        options={{ 
          title: 'Home',
          tabBarIcon: ({ color, size }) => <Home color={color} size={size} /> 
        }} 
      />
      <Tabs.Screen 
        name="search" 
        options={{ 
          title: 'Search',
          tabBarIcon: ({ color, size }) => <Search color={color} size={size} /> 
        }} 
      />
      <Tabs.Screen 
        name="cart" 
        options={{ 
          title: 'Cart',
          tabBarIcon: ({ color, size }) => <ShoppingCart color={color} size={size} /> 
        }} 
      />
      <Tabs.Screen 
        name="distributors" 
        options={{ 
          title: 'Distributors',
          tabBarIcon: ({ color, size }) => <Truck color={color} size={size} /> 
        }} 
      />
      <Tabs.Screen 
        name="outstandings" 
        options={{ 
          title: 'Outstandings',
          tabBarIcon: ({ color, size }) => <Receipt color={color} size={size} /> 
        }} 
      />
      <Tabs.Screen 
        name="orders" 
        options={{ 
          title: 'Orders',
          tabBarIcon: ({ color, size }) => <ClipboardList color={color} size={size} /> 
        }} 
      />
      <Tabs.Screen 
        name="profile" 
        options={{ 
          title: 'Profile',
          tabBarIcon: ({ color, size }) => <User color={color} size={size} /> 
        }} 
      />
    </Tabs>
  );
}
