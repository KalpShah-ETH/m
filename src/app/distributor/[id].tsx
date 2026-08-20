import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList, ActivityIndicator, Platform, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Plus, Minus, ChevronDown, Filter, Lock, AlertCircle } from 'lucide-react-native';
import { useCatalogStore, CatalogProduct } from '@/store/catalogStore';
import { useOutstandingsStore } from '@/store/outstandingsStore';

export default function DistributorCatalogScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  
  const { 
    categories, 
    products, 
    activeTab, 
    selectedCategory, 
    isLoadingCategories, 
    isLoadingProducts,
    connectionRequestStatus,
    setActiveTab, 
    setSelectedCategory, 
    fetchCategories, 
    fetchProducts,
    requestConnection,
    updateProductQuantity
  } = useCatalogStore();

  const [expandedProductId, setExpandedProductId] = useState<string | null>(null);

  const { records, fetchOutstandings } = useOutstandingsStore();

  useEffect(() => {
    if (records.length === 0) {
      fetchOutstandings();
    }
  }, []);

  const outstandingRecord = records.find(r => r.distributorId === id);

  useEffect(() => {
    if (id) {
      fetchCategories(id as string);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchProducts(id as string, selectedCategory, activeTab);
    }
  }, [id, selectedCategory, activeTab]);

  const renderCategoryTile = ({ item }: { item: any }) => {
    const isSelected = selectedCategory === item.id;
    return (
      <TouchableOpacity 
        style={[styles.categoryTile, isSelected && styles.categoryTileSelected]}
        onPress={() => setSelectedCategory(isSelected ? null : item.id)}
      >
        <Text style={[styles.categoryText, isSelected && styles.categoryTextSelected]}>
          {item.name}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderProductCard = ({ item }: { item: CatalogProduct }) => {
    const isExpanded = expandedProductId === item.id;
    const isMapped = activeTab === 'mapped';

    return (
      <View style={styles.productCard}>
        <View style={styles.productHeader}>
          <View style={styles.productInfo}>
            <Text style={styles.productName}>{item.name}</Text>
            <Text style={styles.packSize}>Pack: {item.packSize}</Text>
            <View style={[styles.stockBadge, item.stockStatus === 'out-of-stock' ? styles.stockOut : styles.stockIn]}>
              <Text style={[styles.stockText, item.stockStatus === 'out-of-stock' && styles.stockTextOut]}>
                {item.stockStatus.replace('-', ' ').toUpperCase()}
              </Text>
            </View>
          </View>
          <TouchableOpacity onPress={() => setExpandedProductId(isExpanded ? null : item.id)}>
            <ChevronDown color="#666" size={24} style={{ transform: [{ rotate: isExpanded ? '180deg' : '0deg' }] }} />
          </TouchableOpacity>
        </View>

        {isExpanded && (
          <View style={styles.productDetails}>
            {isMapped ? (
              <View style={styles.pricingRow}>
                <View>
                  <Text style={styles.priceLabel}>PTR</Text>
                  <Text style={styles.priceValue}>₹{item.ptr.toFixed(2)}</Text>
                </View>
                <View>
                  <Text style={styles.priceLabel}>MRP</Text>
                  <Text style={styles.priceValue}>₹{item.mrp.toFixed(2)}</Text>
                </View>
                <View>
                  <Text style={styles.priceLabel}>Discount</Text>
                  <Text style={styles.discountValue}>{item.discountPercentage}% OFF</Text>
                </View>
              </View>
            ) : (
              <View style={styles.lockedPricing}>
                <Lock color="#999" size={16} style={{ marginRight: 8 }} />
                <Text style={styles.lockedText}>Pricing locked. Request connection to view.</Text>
              </View>
            )}
          </View>
        )}

        <View style={styles.actionContainer}>
          {isMapped ? (
            item.stockStatus === 'out-of-stock' ? (
              <View style={styles.outOfStockButton}>
                <Text style={styles.outOfStockText}>Out of Stock</Text>
              </View>
            ) : item.quantityInCart > 0 ? (
              <View style={styles.stepperContainer}>
                <TouchableOpacity style={styles.stepperButton} onPress={() => updateProductQuantity(item.id, item.quantityInCart - 1)}>
                  <Minus color="#1F5B4E" size={20} />
                </TouchableOpacity>
                <Text style={styles.stepperValue}>{item.quantityInCart}</Text>
                <TouchableOpacity style={styles.stepperButton} onPress={() => updateProductQuantity(item.id, item.quantityInCart + 1)}>
                  <Plus color="#1F5B4E" size={20} />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity style={styles.addButton} onPress={() => updateProductQuantity(item.id, 1)}>
                <Text style={styles.addButtonText}>Add to Cart</Text>
              </TouchableOpacity>
            )
          ) : (
            <TouchableOpacity 
              style={[styles.requestButton, connectionRequestStatus === 'pending' && styles.requestButtonPending]}
              onPress={() => requestConnection(id as string)}
              disabled={connectionRequestStatus !== 'idle'}
            >
              <Text style={styles.requestButtonText}>
                {connectionRequestStatus === 'pending' ? 'Requesting...' : 
                 connectionRequestStatus === 'success' ? 'Requested' : 'Request to Connect'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        
        {/* Outstanding Banner */}
        {outstandingRecord && outstandingRecord.amountOwed > 0 && (
          <View style={[styles.outstandingBanner, outstandingRecord.isOverdue && styles.outstandingBannerOverdue]}>
            <AlertCircle color={outstandingRecord.isOverdue ? "#DC2626" : "#1F5B4E"} size={20} style={{ marginRight: 8 }} />
            <Text style={[styles.outstandingBannerText, outstandingRecord.isOverdue && styles.outstandingBannerTextOverdue]}>
              Outstanding: ₹{outstandingRecord.amountOwed.toFixed(2)} 
              {outstandingRecord.isOverdue ? ' (Overdue)' : ` (Due: ${outstandingRecord.dueDate})`}
            </Text>
          </View>
        )}

        {/* Header Tabs (Mapped / Non-Mapped) */}
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

        {/* Categories (Company Therapy) */}
        <View style={styles.categoriesWrapper}>
          <View style={styles.categoriesHeader}>
            <Text style={styles.categoriesTitle}>Therapy Categories</Text>
            <TouchableOpacity>
              <Filter color="#666" size={20} />
            </TouchableOpacity>
          </View>
          {isLoadingCategories ? (
            <ActivityIndicator size="small" color="#1F5B4E" style={{ marginVertical: 16 }} />
          ) : (
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              data={categories}
              keyExtractor={(item) => item.id}
              renderItem={renderCategoryTile}
              contentContainerStyle={styles.categoriesList}
            />
          )}
        </View>

        {/* Product List */}
        {isLoadingProducts ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#1F5B4E" />
          </View>
        ) : (
          <FlatList
            data={products}
            keyExtractor={(item) => item.id}
            renderItem={renderProductCard}
            contentContainerStyle={styles.productList}
            ListEmptyComponent={() => (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No products found.</Text>
              </View>
            )}
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
  container: {
    flex: 1,
  },
  outstandingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F0EE',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1F5B4E',
  },
  outstandingBannerOverdue: {
    backgroundColor: '#FEE2E2',
    borderBottomColor: '#FECACA',
  },
  outstandingBannerText: {
    fontSize: 14, fontFamily: 'Inter_700Bold', fontWeight: 'bold',
    color: '#1F5B4E',
    flex: 1,
  },
  outstandingBannerTextOverdue: {
    color: '#DC2626',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: '#1F5B4E',
  },
  tabText: {
    fontSize: 15, fontFamily: 'Inter_600SemiBold', fontWeight: '600',
    color: '#666',
  },
  tabTextActive: {
    color: '#1F5B4E',
  },
  categoriesWrapper: {
    backgroundColor: '#fff',
    paddingVertical: 16,
    marginBottom: 8,
  },
  categoriesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  categoriesTitle: {
    fontSize: 16, fontFamily: 'Inter_700Bold', fontWeight: 'bold',
    color: '#1F2937',
  },
  categoriesList: {
    paddingHorizontal: 16,
    gap: 8,
  },
  categoryTile: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    marginRight: 8,
  },
  categoryTileSelected: {
    backgroundColor: '#1F5B4E',
  },
  categoryText: {
    fontSize: 14, fontFamily: 'Inter_400Regular',
    color: '#1F2937',
    fontFamily: 'Inter_500Medium', fontWeight: '500',
  },
  categoryTextSelected: {
    color: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  productList: {
    padding: 16,
    paddingBottom: 32,
    gap: 12,
  },
  productCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#eee',
  },
  productHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  productInfo: {
    flex: 1,
    marginRight: 16,
  },
  productName: {
    fontSize: 16, fontFamily: 'Inter_700Bold', fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  packSize: {
    fontSize: 13, fontFamily: 'Inter_400Regular',
    color: '#666',
    marginBottom: 8,
  },
  stockBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  stockIn: {
    backgroundColor: '#E8F0EE',
  },
  stockOut: {
    backgroundColor: '#FEE2E2',
  },
  stockText: {
    fontSize: 10, fontFamily: 'Inter_700Bold', fontWeight: 'bold',
    color: '#1F5B4E',
  },
  stockTextOut: {
    color: '#DC2626',
  },
  productDetails: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  pricingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  priceLabel: {
    fontSize: 12, fontFamily: 'Inter_400Regular',
    color: '#999',
    marginBottom: 2,
  },
  priceValue: {
    fontSize: 15, fontFamily: 'Inter_700Bold', fontWeight: 'bold',
    color: '#1F2937',
  },
  discountValue: {
    fontSize: 15, fontFamily: 'Inter_700Bold', fontWeight: 'bold',
    color: '#1F5B4E',
  },
  lockedPricing: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 8,
  },
  lockedText: {
    fontSize: 13, fontFamily: 'Inter_400Regular',
    color: '#666',
    flex: 1,
  },
  actionContainer: {
    marginTop: 16,
  },
  addButton: {
    backgroundColor: '#1F5B4E',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 15, fontFamily: 'Inter_700Bold', fontWeight: 'bold',
  },
  outOfStockButton: {
    backgroundColor: '#f5f5f5',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  outOfStockText: {
    color: '#999',
    fontSize: 15, fontFamily: 'Inter_700Bold', fontWeight: 'bold',
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#E8F0EE',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#1F5B4E',
    height: 44,
  },
  stepperButton: {
    paddingHorizontal: 16,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepperValue: {
    fontSize: 16, fontFamily: 'Inter_700Bold', fontWeight: 'bold',
    color: '#1F5B4E',
  },
  requestButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#1F5B4E',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  requestButtonPending: {
    backgroundColor: '#f0f0f0',
    borderColor: '#ccc',
  },
  requestButtonText: {
    color: '#1F5B4E',
    fontSize: 15, fontFamily: 'Inter_700Bold', fontWeight: 'bold',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: '#999',
    fontSize: 16, fontFamily: 'Inter_400Regular',
  },
});
