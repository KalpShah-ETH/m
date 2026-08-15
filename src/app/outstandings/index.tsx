import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TextInput, FlatList, SafeAreaView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Search, AlertCircle, ChevronRight, Receipt, ArrowLeft } from 'lucide-react-native';
import { useOutstandingsStore, OutstandingRecord } from '@/store/outstandingsStore';

export default function OutstandingsScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  
  const { records, isLoading, fetchOutstandings } = useOutstandingsStore();

  useEffect(() => {
    fetchOutstandings();
  }, []);

  const filteredRecords = records.filter(r => 
    r.distributorName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalOutstanding = records.reduce((sum, record) => sum + record.amountOwed, 0);

  const renderItem = ({ item }: { item: OutstandingRecord }) => (
    <TouchableOpacity style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.distributorInfo}>
          <View style={styles.iconContainer}>
            <Receipt color="#1F5B4E" size={24} />
          </View>
          <Text style={styles.distributorName}>{item.distributorName}</Text>
        </View>
        <ChevronRight color="#ccc" size={24} />
      </View>
      
      <View style={styles.cardBody}>
        <View style={styles.amountContainer}>
          <Text style={styles.amountLabel}>Amount Owed</Text>
          <Text style={[styles.amountValue, item.isOverdue && styles.amountValueOverdue]}>
            ₹{item.amountOwed.toFixed(2)}
          </Text>
        </View>
        
        {item.amountOwed > 0 && (
          <View style={styles.statusContainer}>
            {item.isOverdue ? (
              <View style={styles.overdueBadge}>
                <AlertCircle color="#DC2626" size={14} style={{ marginRight: 4 }} />
                <Text style={styles.overdueText}>Overdue</Text>
              </View>
            ) : (
              <Text style={styles.dueDateText}>Due: {item.dueDate}</Text>
            )}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft color="#1F2937" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Outstandings</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.container}>
        <View style={styles.summaryContainer}>
          <Text style={styles.summaryLabel}>Total Outstanding Amount</Text>
          <Text style={styles.summaryValue}>₹{totalOutstanding.toFixed(2)}</Text>
        </View>

        <View style={styles.searchContainer}>
          <Search color="#999" size={20} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search distributor..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#999"
          />
        </View>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#1F5B4E" />
          </View>
        ) : (
          <FlatList
            data={filteredRecords}
            keyExtractor={(item) => item.distributorId}
            renderItem={renderItem}
            contentContainerStyle={styles.listContainer}
            ListEmptyComponent={
              <Text style={styles.emptyText}>No outstandings found.</Text>
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20, fontFamily: 'Inter_400Regular',
    fontFamily: 'Inter_700Bold', fontWeight: 'bold',
    color: '#1F2937',
  },
  container: {
    flex: 1,
    paddingTop: 16,
  },
    marginBottom: 16,
  },
  summaryContainer: {
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: '#1F5B4E',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#1F5B4E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  summaryLabel: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14, fontFamily: 'Inter_400Regular',
    marginBottom: 8,
  },
  summaryValue: {
    color: '#fff',
    fontSize: 28, fontFamily: 'Inter_400Regular',
    fontFamily: 'Inter_700Bold', fontWeight: 'bold',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    paddingHorizontal: 12,
    height: 48,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontSize: 15, fontFamily: 'Inter_400Regular',
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#eee',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f9f9f9',
    paddingBottom: 12,
  },
  distributorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E8F0EE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  distributorName: {
    fontSize: 16, fontFamily: 'Inter_400Regular',
    fontFamily: 'Inter_600SemiBold', fontWeight: '600',
    color: '#1F2937',
    flex: 1,
  },
  cardBody: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  amountContainer: {
    flex: 1,
  },
  amountLabel: {
    fontSize: 13, fontFamily: 'Inter_400Regular',
    color: '#666',
    marginBottom: 4,
  },
  amountValue: {
    fontSize: 18, fontFamily: 'Inter_400Regular',
    fontFamily: 'Inter_700Bold', fontWeight: 'bold',
    color: '#1F2937',
  },
  amountValueOverdue: {
    color: '#DC2626',
  },
  statusContainer: {
    alignItems: 'flex-end',
  },
  dueDateText: {
    fontSize: 13, fontFamily: 'Inter_400Regular',
    color: '#666',
  },
  overdueBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  overdueText: {
    color: '#DC2626',
    fontSize: 12, fontFamily: 'Inter_400Regular',
    fontFamily: 'Inter_700Bold', fontWeight: 'bold',
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
