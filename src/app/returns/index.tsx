import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, SafeAreaView, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { RotateCcw, Plus, Check, X, ArrowLeft } from 'lucide-react-native';
import { useReturnsStore, ReturnRecord } from '@/store/returnsStore';

export default function ReturnsScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'draft' | 'submitted'>('draft');
  const [activeType, setActiveType] = useState<'saleable' | 'expiry'>('saleable');

  const { returns, isLoading, fetchReturns, submitReturn, cancelDraft } = useReturnsStore();

  useEffect(() => {
    fetchReturns({ status: activeTab, type: activeType });
  }, [activeTab, activeType]);

  const handleSubmit = async (id: string) => {
    Alert.alert('Submit Return', 'Are you sure you want to submit this return to the distributor?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Submit', onPress: async () => {
          const { success } = await submitReturn(id);
          if (success) {
            Alert.alert('Success', 'Return submitted successfully');
            fetchReturns({ status: activeTab, type: activeType });
          }
        }
      }
    ]);
  };

  const handleCancelDraft = async (id: string) => {
    Alert.alert('Discard Draft', 'Are you sure you want to discard this return draft?', [
      { text: 'Keep', style: 'cancel' },
      { text: 'Discard', style: 'destructive', onPress: async () => {
          await cancelDraft(id);
        }
      }
    ]);
  };

  const renderItem = ({ item }: { item: ReturnRecord }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.returnNumber}>{item.returnNumber}</Text>
        <Text style={styles.dateText}>{item.date}</Text>
      </View>
      
      <View style={styles.cardBody}>
        <Text style={styles.distributorName}>{item.distributorName}</Text>
        <Text style={styles.orderRef}>Ref: Order #{item.orderId}</Text>
        
        <View style={styles.itemsPreview}>
          <Text style={styles.itemsLabel}>{item.items.length} item(s) to return</Text>
        </View>
      </View>
      
      {item.status === 'draft' && (
        <View style={styles.cardFooter}>
          <TouchableOpacity style={styles.discardButton} onPress={() => handleCancelDraft(item.id)}>
            <X color="#d93025" size={16} style={{ marginRight: 4 }} />
            <Text style={styles.discardButtonText}>Discard</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.submitButton} onPress={() => handleSubmit(item.id)}>
            <Check color="#fff" size={16} style={{ marginRight: 4 }} />
            <Text style={styles.submitButtonText}>Submit</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft color="#333" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Returns</Text>
      </View>

      <View style={styles.container}>
        
        {/* Main Tabs */}
        <View style={styles.tabContainer}>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'draft' && styles.tabActive]}
            onPress={() => setActiveTab('draft')}
          >
            <Text style={[styles.tabText, activeTab === 'draft' && styles.tabTextActive]}>Drafts</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'submitted' && styles.tabActive]}
            onPress={() => setActiveTab('submitted')}
          >
            <Text style={[styles.tabText, activeTab === 'submitted' && styles.tabTextActive]}>Submitted</Text>
          </TouchableOpacity>
        </View>

        {/* Sub Filters */}
        <View style={styles.subFilterContainer}>
          <TouchableOpacity 
            style={[styles.subFilter, activeType === 'saleable' && styles.subFilterActive]}
            onPress={() => setActiveType('saleable')}
          >
            <Text style={[styles.subFilterText, activeType === 'saleable' && styles.subFilterTextActive]}>Saleable</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.subFilter, activeType === 'expiry' && styles.subFilterActive]}
            onPress={() => setActiveType('expiry')}
          >
            <Text style={[styles.subFilterText, activeType === 'expiry' && styles.subFilterTextActive]}>Expiry</Text>
          </TouchableOpacity>
        </View>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#0066cc" />
          </View>
        ) : (
          <FlatList
            data={returns}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={styles.listContainer}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <RotateCcw color="#ccc" size={48} style={{ marginBottom: 16 }} />
                <Text style={styles.emptyText}>No Returns found.</Text>
              </View>
            }
          />
        )}
      </View>

      {/* Full-width Action Button for New Return */}
      <View style={styles.footerContainer}>
        <TouchableOpacity 
          style={styles.fullWidthButton}
          onPress={() => router.push('/returns/initiate')}
        >
          <Plus color="#fff" size={24} style={{ marginRight: 8 }} />
          <Text style={styles.fullWidthButtonText}>Initiate Return</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f7fa',
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
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  container: {
    flex: 1,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  tab: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: '#0066cc',
  },
  tabText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#666',
  },
  tabTextActive: {
    color: '#0066cc',
  },
  subFilterContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 8,
  },
  subFilter: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#e6e6e6',
  },
  subFilterActive: {
    backgroundColor: '#0066cc',
  },
  subFilterText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  subFilterTextActive: {
    color: '#fff',
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
    borderBottomWidth: 1,
    borderBottomColor: '#f9f9f9',
  },
  returnNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  dateText: {
    fontSize: 13,
    color: '#999',
  },
  cardBody: {
    padding: 16,
  },
  distributorName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  orderRef: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  itemsPreview: {
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 8,
  },
  itemsLabel: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  cardFooter: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    justifyContent: 'flex-end',
    gap: 12,
  },
  discardButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#fad2cf',
    backgroundColor: '#fff',
  },
  discardButtonText: {
    color: '#d93025',
    fontWeight: '600',
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#0066cc',
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
  },
  emptyText: {
    color: '#999',
    fontSize: 16,
  },
  footerContainer: {
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  fullWidthButton: {
    backgroundColor: '#0066cc',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: 8,
  },
  fullWidthButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
