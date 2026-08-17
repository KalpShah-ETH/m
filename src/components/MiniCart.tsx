import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ShoppingCart, ChevronRight } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useCartStore } from '@/store/cartStore';

export function MiniCart() {
  const router = useRouter();
  const itemCount = useCartStore((state) => state.getItemCount());
  const cartTotal = useCartStore((state) => state.getCartTotal());
  const lastAddedItem = useCartStore((state) => state.lastAddedItem);

  if (itemCount === 0) return null;

  return (
    <View style={styles.container}>
      <View style={styles.infoContainer}>
        <View style={styles.summaryRow}>
          <ShoppingCart color="#fff" size={20} style={styles.icon} />
          <Text style={styles.itemCountText}>{itemCount} Item{itemCount > 1 ? 's' : ''}</Text>
          <Text style={styles.separator}>|</Text>
          <Text style={styles.totalText}>₹{cartTotal.toFixed(2)}</Text>
        </View>
        {lastAddedItem && (
          <Text style={styles.lastAddedText} numberOfLines={1}>
            Added: {lastAddedItem}
          </Text>
        )}
      </View>
      <TouchableOpacity 
        style={styles.viewCartButton} 
        onPress={() => router.push('/(tabs)/cart')}
      >
        <Text style={styles.viewCartText}>View Cart</Text>
        <ChevronRight color="#fff" size={20} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0, // Should be positioned above bottom tabs if inside Tab layout
    left: 0,
    right: 0,
    backgroundColor: '#1F5B4E',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    zIndex: 1000,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  infoContainer: {
    flex: 1,
    marginRight: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  icon: {
    marginRight: 8,
  },
  itemCountText: {
    color: '#fff',
    fontSize: 15, fontFamily: 'Inter_700Bold', fontWeight: 'bold',
  },
  separator: {
    color: '#fff',
    marginHorizontal: 8,
    opacity: 0.5,
  },
  totalText: {
    color: '#fff',
    fontSize: 15, fontFamily: 'Inter_700Bold', fontWeight: 'bold',
  },
  lastAddedText: {
    color: '#fff',
    fontSize: 12, fontFamily: 'Inter_400Regular',
    opacity: 0.8,
  },
  viewCartButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  viewCartText: {
    color: '#fff',
    fontSize: 14, fontFamily: 'Inter_700Bold', fontWeight: 'bold',
    marginRight: 4,
  },
});
