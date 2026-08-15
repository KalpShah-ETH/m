import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList, SafeAreaView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Plus, Minus, ChevronDown, Filter, Lock, AlertCircle, Search } from 'lucide-react-native';
import { useCatalogStore, CatalogProduct } from '@/store/catalogStore';
import { useOutstandingsStore } from '@/store/outstandingsStore';

export default function BrowseScreen() {
  const router = useRouter();
  const [distributorId, setDistributorId] = useState('d1'); // Default distributor
  const distributorName = "PharmaCorp"; // Mock name for now
  
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

  const outstandingRecord = records.find(r => r.distributorId === distributorId);

  useEffect(() => {
    if (distributorId) {
      fetchCategories(distributorId);
    }
  }, [distributorId]);

  useEffect(() => {
    if (distributorId) {
      fetchProducts(distributorId, selectedCategory, activeTab);
    }
  }, [distributorId, selectedCategory, activeTab]);

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
                  <Minus color="#0066cc" size={20} />
                </TouchableOpacity>
                <Text style={styles.stepperValue}>{item.quantityInCart}</Text>
                <TouchableOpacity style={styles.stepperButton} onPress={() => updateProductQuantity(item.id, item.quantityInCart + 1)}>
                  <Plus color="#0066cc" size={20} />
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
              onPress={() => requestConnection(distributorId)}
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
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.distributorSelector}>
          <Text style={styles.distributorNameText}>{distributorName}</Text>
          <ChevronDown color="#333" size={20} style={{ marginLeft: 4 }} />
        </TouchableOpacity>
        <TouchableOpacity>
          <Search color="#333" size={24} />
        </TouchableOpacity>
      </View>

      <View style={styles.container}>
        
        {/* Outstanding Banner */}
        {outstandingRecord && outstandingRecord.amountOwed > 0 && (
          <View style={[styles.outstandingBanner, outstandingRecord.isOverdue && styles.outstandingBannerOverdue]}>
            <AlertCircle color={outstandingRecord.isOverdue ? "#d93025" : "#b06000"} size={20} style={{ marginRight: 8 }} />
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
            <ActivityIndicator size="small" color="#0066cc" style={{ marginVertical: 16 }} />
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
            <ActivityIndicator size="large" color="#0066cc" />
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
    backgroundColor: '#f5f7fa',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  distributorSelector: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  distributorNameText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  container: {
    flex: 1,
  },
  outstandingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef7e0',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#fce8b2',
  },
  outstandingBannerOverdue: {
    backgroundColor: '#fce8e6',
    borderBottomColor: '#fad2cf',
  },
  outstandingBannerText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#b06000',
    flex: 1,
  },
  outstandingBannerTextOverdue: {
    color: '#d93025',
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
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
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
    backgroundColor: '#0066cc',
  },
  categoryText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
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
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  packSize: {
    fontSize: 13,
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
    backgroundColor: '#e6f4ea',
  },
  stockOut: {
    backgroundColor: '#fce8e6',
  },
  stockText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#1e8e3e',
  },
  stockTextOut: {
    color: '#d93025',
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
    fontSize: 12,
    color: '#999',
    marginBottom: 2,
  },
  priceValue: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#333',
  },
  discountValue: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#1e8e3e',
  },
  lockedPricing: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 8,
  },
  lockedText: {
    fontSize: 13,
    color: '#666',
    flex: 1,
  },
  actionContainer: {
    marginTop: 16,
  },
  addButton: {
    backgroundColor: '#0066cc',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
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
    fontSize: 15,
    fontWeight: 'bold',
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f0f8ff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#0066cc',
    height: 44,
  },
  stepperButton: {
    paddingHorizontal: 16,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepperValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0066cc',
  },
  requestButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#0066cc',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  requestButtonPending: {
    backgroundColor: '#f0f0f0',
    borderColor: '#ccc',
  },
  requestButtonText: {
    color: '#0066cc',
    fontSize: 15,
    fontWeight: 'bold',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: '#999',
    fontSize: 16,
  },
});
