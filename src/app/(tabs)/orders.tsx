import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, ActivityIndicator, Linking, Platform, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Search, Filter, Phone, ChevronRight, CheckCircle, Clock, ArrowLeft } from 'lucide-react-native';
import { Order } from '@/store/ordersStore';
import { useOrders, useOrdersSummary } from '@/api/orders';

export default React.memo(function OrdersScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'mapped' | 'non-mapped'>('mapped');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Date filters: Default to last 7 days
  const [fromDate, setFromDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return d.toISOString().split('T')[0];
  });
  const [toDate, setToDate] = useState(() => new Date().toISOString().split('T')[0]);

  // React Query Hooks
  const { data: summary = { totalCount: 0, totalValue: 0 } } = useOrdersSummary();
  const { data: orders = [], isLoading } = useOrders(activeTab, fromDate, toDate);

  const filteredOrders = useMemo(() => {
    return orders.filter(o => 
      o.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) || 
      o.distributorName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [orders, searchQuery]);

  const handleCall = useCallback((phone: string) => {
    Linking.openURL(`tel:${phone}`);
  }, []);

  const getStatusIcon = useCallback((status: string) => {
    switch (status) {
      case 'processed':
      case 'shipped':
      case 'delivered':
        return <CheckCircle color="#1F5B4E" size={16} style={{ marginRight: 4 }} />;
      default:
        return <Clock color="#f29900" size={16} style={{ marginRight: 4 }} />;
    }
  }, []);

  const renderItem = useCallback(({ item }: { item: Order }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.orderNumber}>{item.orderNumber}</Text>
        <View style={[styles.statusBadge, item.status === 'pending' ? styles.statusPending : styles.statusProcessed]}>
          {getStatusIcon(item.status)}
          <Text style={[styles.statusText, item.status === 'pending' ? styles.statusTextPending : styles.statusTextProcessed]}>
            {item.status.toUpperCase()}
          </Text>
        </View>
      </View>
      
      <View style={styles.cardBody}>
        <View style={styles.infoRow}>
          <Text style={styles.distributorName}>{item.distributorName}</Text>
          <TouchableOpacity onPress={() => handleCall(item.distributorContact)} style={styles.callButton}>
            <Phone color="#1F5B4E" size={16} />
          </TouchableOpacity>
        </View>
        <Text style={styles.dateText}>{item.date}</Text>
        <Text style={styles.totalValue}>₹{item.totalValue.toFixed(2)}</Text>
      </View>
      
      <TouchableOpacity 
        style={styles.cardFooter}
        onPress={() => router.push(`/order/${item.id}`)}
      >
        <Text style={styles.viewDetailsText}>View Details</Text>
        <ChevronRight color="#1F5B4E" size={20} />
      </TouchableOpacity>
    </View>
  ), [getStatusIcon, handleCall, router]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        
        {/* Header Summary */}
        <View style={styles.header}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
            <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 12 }}>
              <ArrowLeft color="#1F2937" size={22} strokeWidth={1.6} />
            </TouchableOpacity>
            <Text style={[styles.headerTitle, { marginBottom: 0 }]}>Orders</Text>
          </View>
          <View style={styles.summaryContainer}>
            <View style={styles.summaryBox}>
              <Text style={styles.summaryLabel}>Total Orders</Text>
              <Text style={styles.summaryValue}>{summary.totalCount}</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryBox}>
              <Text style={styles.summaryLabel}>Total Value</Text>
              <Text style={styles.summaryValue}>₹{summary.totalValue.toLocaleString()}</Text>
            </View>
          </View>
        </View>

        {/* Inner Tabs */}
        <View style={styles.tabContainer}>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'mapped' && styles.tabActive]}
            onPress={() => setActiveTab('mapped')}
          >
            <Text style={[styles.tabText, activeTab === 'mapped' && styles.tabTextActive]}>Mapped</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'non-mapped' && styles.tabActive]}
            onPress={() => setActiveTab('non-mapped')}
          >
            <Text style={[styles.tabText, activeTab === 'non-mapped' && styles.tabTextActive]}>Non-Mapped</Text>
          </TouchableOpacity>
        </View>

        {/* Search & Filters */}
        <View style={styles.filtersRow}>
          <View style={styles.searchContainer}>
            <Search color="#999" size={20} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search ID or Distributor..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#999"
            />
          </View>
          <TouchableOpacity style={styles.filterButton}>
            <Filter color="#1F5B4E" size={20} />
          </TouchableOpacity>
        </View>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#1F5B4E" />
          </View>
        ) : (
          <FlatList
            data={filteredOrders}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={styles.listContainer}
            ListEmptyComponent={
              <Text style={styles.emptyText}>No orders found in the selected date range.</Text>
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
});

const styles = StyleSheet.create({
  safeArea: {
    
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 24, fontFamily: 'Inter_700Bold', fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  summaryContainer: {
    flexDirection: 'row',
    backgroundColor: '#E8F0EE',
    borderRadius: 8,
    padding: 16,
  },
  summaryBox: {
    flex: 1,
    alignItems: 'center',
  },
  summaryDivider: {
    width: 1,
    backgroundColor: '#b3d9ff',
    marginHorizontal: 16,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#1F5B4E',
    marginBottom: 4,
    textTransform: 'uppercase',
    fontFamily: 'Inter_600SemiBold', fontWeight: '600',
  },
  summaryValue: {
    fontSize: 20, fontFamily: 'Inter_700Bold', fontWeight: 'bold',
    color: '#004c99',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: '#1F5B4E',
  },
  tabText: {
    fontSize: 14, fontFamily: 'Inter_600SemiBold', fontWeight: '600',
    color: '#666',
  },
  tabTextActive: {
    color: '#1F5B4E',
  },
  filtersRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    paddingHorizontal: 12,
    height: 44,
    marginRight: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontSize: 15, fontFamily: 'Inter_400Regular',
  },
  filterButton: {
    width: 44,
    height: 44,
    backgroundColor: '#E8F0EE',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#eee',
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fafafa',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  orderNumber: {
    fontSize: 16, fontFamily: 'Inter_700Bold', fontWeight: 'bold',
    color: '#1F2937',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusPending: {
    backgroundColor: '#E8F0EE',
  },
  statusProcessed: {
    backgroundColor: '#E8F0EE',
  },
  statusText: {
    fontSize: 12, fontFamily: 'Inter_700Bold', fontWeight: 'bold',
  },
  statusTextPending: {
    color: '#1F5B4E',
  },
  statusTextProcessed: {
    color: '#1F5B4E',
  },
  cardBody: {
    padding: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  distributorName: {
    fontSize: 16, fontFamily: 'Inter_600SemiBold', fontWeight: '600',
    color: '#1F2937',
    flex: 1,
  },
  callButton: {
    padding: 8,
    backgroundColor: '#E8F0EE',
    borderRadius: 20,
    marginLeft: 8,
  },
  dateText: {
    fontSize: 13, fontFamily: 'Inter_400Regular',
    color: '#666',
    marginBottom: 8,
  },
  totalValue: {
    fontSize: 18, fontFamily: 'Inter_700Bold', fontWeight: 'bold',
    color: '#1F5B4E',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  viewDetailsText: {
    color: '#1F5B4E',
    fontSize: 14, fontFamily: 'Inter_600SemiBold', fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    marginTop: 40,
    fontSize: 15, fontFamily: 'Inter_400Regular',
  },
});
