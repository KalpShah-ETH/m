import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, SafeAreaView, ActivityIndicator } from 'react-native';
import { Search, X, Pill, Truck } from 'lucide-react-native';
import { useSearchStore } from '@/store/searchStore';

export default function SearchScreen() {
  const [query, setQuery] = useState('');
  const [searchType, setSearchType] = useState<'medicines' | 'distributor'>('medicines');
  
  const { 
    products, 
    distributors, 
    isLoading, 
    searchProducts, 
    searchDistributors, 
    clearResults 
  } = useSearchStore();

  // Simple debounce implementation
  useEffect(() => {
    const handler = setTimeout(() => {
      if (query.length >= 3) {
        if (searchType === 'medicines') {
          searchProducts(query);
        } else {
          searchDistributors(query);
        }
      } else {
        clearResults();
      }
    }, 500); // 500ms debounce

    return () => {
      clearTimeout(handler);
    };
  }, [query, searchType]);

  const handleClear = () => {
    setQuery('');
    clearResults();
  };

  const renderProductItem = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.resultItem}>
      <View style={styles.resultIcon}>
        <Pill color="#0066cc" size={24} />
      </View>
      <View style={styles.resultDetails}>
        <Text style={styles.resultTitle}>{item.name}</Text>
        <Text style={styles.resultSubtitle}>{item.strength} • {item.manufacturer}</Text>
      </View>
      <Text style={styles.resultPrice}>₹{item.price.toFixed(2)}</Text>
    </TouchableOpacity>
  );

  const renderDistributorItem = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.resultItem}>
      <View style={styles.resultIcon}>
        <Truck color="#0066cc" size={24} />
      </View>
      <View style={styles.resultDetails}>
        <Text style={styles.resultTitle}>{item.name}</Text>
        <Text style={styles.resultSubtitle}>Rating: {item.rating} ★</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        
        {/* Toggle */}
        <View style={styles.searchToggleContainer}>
          <TouchableOpacity 
            style={[styles.toggleButton, searchType === 'medicines' && styles.toggleActive]}
            onPress={() => {
              setSearchType('medicines');
              if (query.length >= 3) searchProducts(query);
            }}
          >
            <Text style={[styles.toggleText, searchType === 'medicines' && styles.toggleTextActive]}>
              Medicines
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.toggleButton, searchType === 'distributor' && styles.toggleActive]}
            onPress={() => {
              setSearchType('distributor');
              if (query.length >= 3) searchDistributors(query);
            }}
          >
            <Text style={[styles.toggleText, searchType === 'distributor' && styles.toggleTextActive]}>
              Distributor
            </Text>
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchInputContainer}>
          <Search color="#999" size={20} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder={searchType === 'medicines' ? "Search for medicines (e.g. Paracetamol)" : "Search distributors..."}
            value={query}
            onChangeText={setQuery}
            autoFocus
            placeholderTextColor="#999"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={handleClear} style={styles.clearIcon}>
              <X color="#999" size={20} />
            </TouchableOpacity>
          )}
        </View>

        {/* Results Info */}
        <View style={styles.resultsInfo}>
          {isLoading && <ActivityIndicator size="small" color="#0066cc" />}
          {!isLoading && query.length > 0 && query.length < 3 && (
            <Text style={styles.helperText}>Please enter at least 3 characters to search.</Text>
          )}
        </View>

        {/* Results List */}
        {!isLoading && query.length >= 3 && (
          <FlatList
            data={searchType === 'medicines' ? products : distributors}
            keyExtractor={(item) => item.id}
            renderItem={searchType === 'medicines' ? renderProductItem : renderDistributorItem}
            contentContainerStyle={styles.listContainer}
            ListEmptyComponent={() => (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No results found for "{query}"</Text>
              </View>
            )}
            keyboardShouldPersistTaps="handled"
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    padding: 16,
  },
  searchToggleContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    padding: 4,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 6,
  },
  toggleActive: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  toggleText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  toggleTextActive: {
    color: '#0066cc',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 50,
    marginBottom: 8,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontSize: 16,
    color: '#333',
  },
  clearIcon: {
    padding: 4,
  },
  resultsInfo: {
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  helperText: {
    fontSize: 14,
    color: '#999',
  },
  listContainer: {
    paddingBottom: 24,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  resultIcon: {
    width: 48,
    height: 48,
    backgroundColor: '#f0f8ff',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  resultDetails: {
    flex: 1,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  resultSubtitle: {
    fontSize: 13,
    color: '#666',
  },
  resultPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0066cc',
  },
  emptyContainer: {
    paddingTop: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
  },
});
