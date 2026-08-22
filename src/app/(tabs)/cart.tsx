import React, { useMemo, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Platform, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Trash, Plus, Minus, ArrowLeft } from 'lucide-react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import Toast from 'react-native-toast-message';
import { useCartStore, CartItem } from '@/store/cartStore';

export default React.memo(function CartScreen() {
  const router = useRouter();
  
  const items = useCartStore(state => state.items);
  const updateQuantity = useCartStore(state => state.updateQuantity);
  const removeItem = useCartStore(state => state.removeItem);
  const getGroupedByDistributor = useCartStore(state => state.getGroupedByDistributor);
  const getCartTotal = useCartStore(state => state.getCartTotal);
  const placeOrder = useCartStore(state => state.placeOrder);
  const isLoading = useCartStore(state => state.isLoading);
  const distributorLimits = useCartStore(state => state.distributorLimits);
  const fetchLimits = useCartStore(state => state.fetchLimits);

  useFocusEffect(
    useCallback(() => {
      fetchLimits();
    }, [fetchLimits])
  );

  const [orderStatus, setOrderStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const groupedItems = useMemo(() => getGroupedByDistributor(), [items]);
  const cartTotal = useMemo(() => getCartTotal(), [items]);

  const validation = useMemo(() => {
    const errors: Record<string, string[]> = {};
    let hasAnyError = false;

    Object.entries(groupedItems).forEach(([distributorId, group]) => {
      const limits = distributorLimits[distributorId];
      if (!limits) return;

      const groupTotal = group.items.reduce((total, item) => total + (item.ptr * item.quantity), 0);
      const groupErrors = [];

      if (limits.minOrderValue > 0 && groupTotal < limits.minOrderValue) {
        groupErrors.push(`Minimum order is ₹${limits.minOrderValue.toFixed(2)}`);
      }
      
      if (limits.maxDebtAmount > 0 && (limits.outstandingAmount + groupTotal) > limits.maxDebtAmount) {
        groupErrors.push(`Exceeds max debt of ₹${limits.maxDebtAmount.toFixed(2)} (Current debt: ₹${limits.outstandingAmount.toFixed(2)})`);
      }

      if (groupErrors.length > 0) {
        errors[distributorId] = groupErrors;
        hasAnyError = true;
      }
    });

    return { errors, hasAnyError };
  }, [groupedItems, distributorLimits]);

  const handlePlaceOrder = async () => {
    setOrderStatus('idle');
    const { success, error } = await placeOrder();
    if (success) {
      Toast.show({ type: 'success', text1: 'Order Placed', text2: 'Your order was placed successfully!' });
      setOrderStatus('success');
    } else {
      setOrderStatus('error');
    }
  };

  if (orderStatus === 'success') {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 12 }}>
              <ArrowLeft color="#1F2937" size={22} strokeWidth={1.6} />
            </TouchableOpacity>
            <Text style={styles.screenTitle}>My Cart</Text>
          </View>
        </View>
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
        <View style={styles.header}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 12 }}>
              <ArrowLeft color="#1F2937" size={22} strokeWidth={1.6} />
            </TouchableOpacity>
            <Text style={styles.screenTitle}>My Cart</Text>
          </View>
        </View>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Your cart is empty.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 12 }}>
            <ArrowLeft color="#1F2937" size={22} strokeWidth={1.6} />
          </TouchableOpacity>
          <Text style={styles.screenTitle}>My Cart</Text>
        </View>
      </View>
      <ScrollView contentContainerStyle={styles.container}>

        {Object.entries(groupedItems).map(([distributorId, group]) => {
          const groupErrors = validation.errors[distributorId];
          return (
          <View key={distributorId} style={[styles.groupContainer, groupErrors && styles.groupContainerError]}>
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
                      <Minus color="#1F5B4E" size={18} />
                    </TouchableOpacity>
                    <Text style={styles.stepperValue}>{item.quantity}</Text>
                    <TouchableOpacity style={styles.stepperButton} onPress={() => updateQuantity(item.id, item.quantity + 1)}>
                      <Plus color="#1F5B4E" size={18} />
                    </TouchableOpacity>
                  </View>
                  <TouchableOpacity style={styles.removeButton} onPress={() => removeItem(item.id)}>
                    <Trash color="#e74c3c" size={20} />
                  </TouchableOpacity>
                </View>
              </View>
            ))}

            {groupErrors && groupErrors.length > 0 && (
              <View style={styles.errorContainer}>
                {groupErrors.map((err, idx) => (
                  <Text key={idx} style={styles.errorText}>• {err}</Text>
                ))}
              </View>
            )}
          </View>
        )})}

        <View style={styles.summaryContainer}>
          <Text style={styles.summaryTitle}>Order Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Amount:</Text>
            <Text style={styles.summaryTotal}>₹{cartTotal.toFixed(2)}</Text>
          </View>
        </View>

        <TouchableOpacity 
          style={[styles.checkoutButton, (isLoading || validation.hasAnyError) && styles.disabledButton]} 
          onPress={handlePlaceOrder}
          disabled={isLoading || validation.hasAnyError}
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
});

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  header: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  container: {
    padding: 16,
    paddingBottom: 100, // Extra padding for the mini cart at the bottom
  },
  screenTitle: {
    fontSize: 24, fontFamily: 'Inter_700Bold', fontWeight: 'bold',
    color: '#1F2937',
  },
  groupContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#eee',
  },
  groupContainerError: {
    borderColor: '#ef4444',
    backgroundColor: '#fef2f2',
  },
  distributorName: {
    fontSize: 16, fontFamily: 'Inter_700Bold', fontWeight: 'bold',
    color: '#1F5B4E',
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
    fontSize: 15, fontFamily: 'Inter_600SemiBold', fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 13, fontFamily: 'Inter_400Regular',
    color: '#666',
  },
  itemActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  errorContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#fecaca',
  },
  errorText: {
    fontSize: 13, fontFamily: 'Inter_600SemiBold', fontWeight: '600',
    color: '#ef4444',
    marginBottom: 4,
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F0EE',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#1F5B4E',
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
    fontSize: 14, fontFamily: 'Inter_700Bold', fontWeight: 'bold',
    color: '#1F5B4E',
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
    fontSize: 16, fontFamily: 'Inter_700Bold', fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 15, fontFamily: 'Inter_400Regular',
    color: '#666',
  },
  summaryTotal: {
    fontSize: 20, fontFamily: 'Inter_700Bold', fontWeight: 'bold',
    color: '#1F5B4E',
  },
  checkoutButton: {
    backgroundColor: '#1F5B4E',
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
    fontSize: 18, fontFamily: 'Inter_700Bold', fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyText: {
    fontSize: 16, fontFamily: 'Inter_400Regular',
    color: '#666',
    textAlign: 'center',
  },
  successTitle: {
    fontSize: 24, fontFamily: 'Inter_700Bold', fontWeight: 'bold',
    color: '#1F5B4E',
    marginBottom: 8,
  },
});
