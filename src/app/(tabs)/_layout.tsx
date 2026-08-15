import { Tabs } from 'expo-router';
import { Home, Search, ShoppingCart, User } from 'lucide-react-native';

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
    </Tabs>
  );
}
