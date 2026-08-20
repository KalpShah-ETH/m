import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, Linking, Platform, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Phone, ArrowLeft, CheckCircle, Clock, MapPin, Building2 } from 'lucide-react-native';
import { useOrdersStore } from '@/store/ordersStore';

export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { currentOrder, isLoadingDetail, fetchOrderById } = useOrdersStore();

  useEffect(() => {
    if (id) {
      fetchOrderById(id as string);
    }
  }, [id]);

  if (isLoadingDetail || !currentOrder) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft color="#1F2937" size={24} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Order Details</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1F5B4E" />
        </View>
      </SafeAreaView>
    );
  }

  const handleCall = () => {
    if (currentOrder.distributorContact) {
      Linking.openURL(`tel:${currentOrder.distributorContact}`);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft color="#1F2937" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order #{currentOrder.orderNumber}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        
        {/* Distributor Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Distributor</Text>
          <View style={styles.distributorCard}>
            <Building2 color="#1F5B4E" size={24} style={{ marginRight: 12 }} />
            <View style={styles.distributorInfo}>
              <Text style={styles.distributorName}>{currentOrder.distributorName}</Text>
              <Text style={styles.distributorContact}>{currentOrder.distributorContact}</Text>
            </View>
            <TouchableOpacity onPress={handleCall} style={styles.callButton}>
              <Phone color="#1F5B4E" size={20} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Order Status Timeline */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Status</Text>
          <View style={styles.timelineCard}>
            {currentOrder.timeline && currentOrder.timeline.map((event, index) => (
              <View key={index} style={styles.timelineItem}>
                <View style={styles.timelineIconContainer}>
                  {index === currentOrder.timeline!.length - 1 && currentOrder.status === 'delivered' ? (
                    <CheckCircle color="#1F5B4E" size={20} />
                  ) : index === 0 ? (
                    <CheckCircle color="#1F5B4E" size={20} />
                  ) : (
                    <Clock color="#f29900" size={20} />
                  )}
                  {index < currentOrder.timeline!.length - 1 && (
                    <View style={styles.timelineLine} />
                  )}
                </View>
                <View style={styles.timelineContent}>
                  <Text style={styles.timelineStatus}>{event.status}</Text>
                  <Text style={styles.timelineDate}>{new Date(event.date).toLocaleString()}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Line Items */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Line Items</Text>
          <View style={styles.itemsCard}>
            {currentOrder.items && currentOrder.items.map((item, index) => (
              <View key={item.id} style={[styles.itemRow, index < currentOrder.items!.length - 1 && styles.itemBorder]}>
                <View style={styles.itemMain}>
                  <Text style={styles.itemName}>{item.productName}</Text>
                  <Text style={styles.itemMeta}>Qty: {item.quantity} × ₹{item.ptr.toFixed(2)}</Text>
                </View>
                <Text style={styles.itemTotal}>₹{item.total.toFixed(2)}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Summary */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>₹{currentOrder.totalValue.toFixed(2)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Taxes & Fees</Text>
            <Text style={styles.summaryValue}>₹0.00</Text>
          </View>
          <View style={[styles.summaryRow, styles.summaryTotalRow]}>
            <Text style={styles.summaryTotalLabel}>Total Amount</Text>
            <Text style={styles.summaryTotalValue}>₹{currentOrder.totalValue.toFixed(2)}</Text>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 20, fontFamily: 'Inter_700Bold', fontWeight: 'bold',
    color: '#1F2937',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    padding: 16,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18, fontFamily: 'Inter_700Bold', fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 12,
  },
  distributorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#eee',
  },
  distributorInfo: {
    flex: 1,
  },
  distributorName: {
    fontSize: 16, fontFamily: 'Inter_700Bold', fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  distributorContact: {
    fontSize: 14, fontFamily: 'Inter_400Regular',
    color: '#666',
  },
  callButton: {
    padding: 12,
    backgroundColor: '#E8F0EE',
    borderRadius: 8,
  },
  timelineCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#eee',
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 0,
  },
  timelineIconContainer: {
    alignItems: 'center',
    marginRight: 12,
    width: 24,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: '#eee',
    marginVertical: 4,
    minHeight: 24,
  },
  timelineContent: {
    flex: 1,
    paddingBottom: 24,
  },
  timelineStatus: {
    fontSize: 16, fontFamily: 'Inter_600SemiBold', fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  timelineDate: {
    fontSize: 13, fontFamily: 'Inter_400Regular',
    color: '#999',
  },
  itemsCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#eee',
    overflow: 'hidden',
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  itemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#f9f9f9',
  },
  itemMain: {
    flex: 1,
    marginRight: 16,
  },
  itemName: {
    fontSize: 15, fontFamily: 'Inter_600SemiBold', fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  itemMeta: {
    fontSize: 13, fontFamily: 'Inter_400Regular',
    color: '#666',
  },
  itemTotal: {
    fontSize: 16, fontFamily: 'Inter_700Bold', fontWeight: 'bold',
    color: '#1F2937',
  },
  summaryCard: {
    backgroundColor: '#1F5B4E',
    borderRadius: 12,
    padding: 20,
    marginTop: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14, fontFamily: 'Inter_400Regular',
  },
  summaryValue: {
    color: '#fff',
    fontSize: 14, fontFamily: 'Inter_500Medium', fontWeight: '500',
  },
  summaryTotalRow: {
    marginTop: 8,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
    marginBottom: 0,
  },
  summaryTotalLabel: {
    color: '#fff',
    fontSize: 16, fontFamily: 'Inter_700Bold', fontWeight: 'bold',
  },
  summaryTotalValue: {
    color: '#fff',
    fontSize: 24, fontFamily: 'Inter_700Bold', fontWeight: 'bold',
  },
});
