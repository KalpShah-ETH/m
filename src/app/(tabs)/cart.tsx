import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, ActivityIndicator } from 'react-native';
import { Trash, Plus, Minus } from 'lucide-react-native';
import { useCartStore, CartItem } from '@/store/cartStore';

export default function CartScreen() {
  const { 
    items, 
    updateQuantity, 
    removeItem, 
    getGroupedByDistributor, 
    getCartTotal, 
    placeOrder, 
    isLoading 
  } = useCartStore();

  const [orderStatus, setOrderStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const groupedItems = useMemo(() => getGroupedByDistributor(), [items]);
  const cartTotal = useMemo(() => getCartTotal(), [items]);

  const handlePlaceOrder = async () => {
    setOrderStatus('idle');
    const { success, error } = await placeOrder();
    if (success) {
      setOrderStatus('success');
    } else {
      setOrderStatus('error');
    }
  };

  if (orderStatus === 'success') {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.emptyContainer}>
          <Text style={styles.successTitle}>Order Placed Successfully!</Text>
          <Text style={styles.emptyText}>Your items will be dispatched soon.</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (items.length === 0) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Your cart is empty.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.screenTitle}>Your Cart</Text>

        {Object.entries(groupedItems).map(([distributorId, group]) => (
          <View key={distributorId} style={styles.groupContainer}>
            <Text style={styles.distributorName}>{group.distributorName}</Text>
            
            {group.items.map((item: CartItem) => (
              <View key={item.id} style={styles.cartItem}>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemPrice}>PTR: ₹{item.ptr.toFixed(2)}</Text>
                </View>
                
                <View style={styles.itemActions}>
                  <View style={styles.stepperContainer}>
                    <TouchableOpacity style={styles.stepperButton} onPress={() => updateQuantity(item.id, item.quantity - 1)}>
                      <Minus color="#0066cc" size={18} />
                    </TouchableOpacity>
                    <Text style={styles.stepperValue}>{item.quantity}</Text>
                    <TouchableOpacity style={styles.stepperButton} onPress={() => updateQuantity(item.id, item.quantity + 1)}>
                      <Plus color="#0066cc" size={18} />
                    </TouchableOpacity>
                  </View>
                  <TouchableOpacity style={styles.removeButton} onPress={() => removeItem(item.id)}>
                    <Trash color="#e74c3c" size={20} />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        ))}

        <View style={styles.summaryContainer}>
          <Text style={styles.summaryTitle}>Order Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Amount:</Text>
            <Text style={styles.summaryTotal}>₹{cartTotal.toFixed(2)}</Text>
          </View>
        </View>

        <TouchableOpacity 
          style={[styles.checkoutButton, isLoading && styles.disabledButton]} 
          onPress={handlePlaceOrder}
          disabled={isLoading}
        >
          {isLoading ? (
             <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.checkoutButtonText}>Place Order</Text>
          )}
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  container: {
    padding: 16,
    paddingBottom: 100, // Extra padding for the mini cart at the bottom
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 24,
  },
  groupContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#eee',
  },
  distributorName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0066cc',
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    paddingBottom: 8,
  },
  cartItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f9f9f9',
  },
  itemInfo: {
    flex: 1,
    marginRight: 16,
  },
  itemName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 13,
    color: '#666',
  },
  itemActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f8ff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#0066cc',
    height: 36,
    marginRight: 12,
  },
  stepperButton: {
    paddingHorizontal: 12,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepperValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0066cc',
    minWidth: 20,
    textAlign: 'center',
  },
  removeButton: {
    padding: 8,
    backgroundColor: '#fff0f0',
    borderRadius: 8,
  },
  summaryContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#eee',
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 15,
    color: '#666',
  },
  summaryTotal: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0066cc',
  },
  checkoutButton: {
    backgroundColor: '#0066cc',
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40, // Adjust to leave room for mini cart if visible
  },
  disabledButton: {
    backgroundColor: '#99c2ff',
  },
  checkoutButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e8e3e',
    marginBottom: 8,
  },
});
