import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, ActivityIndicator, Platform, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Search, Pill, ChevronDown, Plus, Minus } from 'lucide-react-native';
import { useGenericStore } from '@/store/genericStore';
import { CatalogProduct } from '@/store/catalogStore';

export default function GenericProductsScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedProductId, setExpandedProductId] = useState<string | null>(null);

  const { 
    categories, 
    products, 
    isLoadingCategories, 
    isLoadingProducts, 
    selectedCategory, 
    fetchCategories, 
    fetchProductsByCategory, 
    searchProducts, 
    setSelectedCategory 
  } = useGenericStore();

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProductsByCategory(selectedCategory);
  }, [selectedCategory]);

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      searchProducts(searchQuery);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchQuery]);

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

    return (
      <View style={styles.productCard}>
        <View style={styles.productHeader}>
          <View style={styles.productInfo}>
            <View style={styles.productNameRow}>
              <Pill color="#1F5B4E" size={18} style={{ marginRight: 8 }} />
              <Text style={styles.productName}>{item.name}</Text>
            </View>
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
          </View>
        )}

        <View style={styles.actionContainer}>
          {item.stockStatus === 'out-of-stock' ? (
            <View style={styles.outOfStockButton}>
              <Text style={styles.outOfStockText}>Out of Stock</Text>
            </View>
          ) : (
            <TouchableOpacity style={styles.addButton}>
              <Text style={styles.addButtonText}>Add to Cart</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft color="#1F2937" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Generic Products</Text>
      </View>

      <View style={styles.container}>
        
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Search color="#999" size={20} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search generic medicines..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#999"
          />
        </View>

        {/* Categories */}
        <View style={styles.categoriesWrapper}>
          {isLoadingCategories ? (
            <ActivityIndicator size="small" color="#1F5B4E" />
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
                <Pill color="#ccc" size={48} style={{ marginBottom: 16 }} />
                <Text style={styles.emptyText}>No generic products found.</Text>
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
  container: {
    flex: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    margin: 16,
    marginBottom: 8,
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
  categoriesWrapper: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
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
  productNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  productName: {
    fontSize: 16, fontFamily: 'Inter_700Bold', fontWeight: 'bold',
    color: '#1F2937',
    flex: 1,
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
  emptyContainer: {
    padding: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    color: '#999',
    fontSize: 16, fontFamily: 'Inter_400Regular',
  },
});
