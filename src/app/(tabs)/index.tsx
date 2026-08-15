import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { Truck, Wallet, Tag, Pill, Gift, RotateCcw, Search } from 'lucide-react-native';
import { useHomeStore } from '@/store/homeStore';

export default function HomeScreen() {
  const fetchSummary = useHomeStore((state) => state.fetchSummary);
  const fetchDistributors = useHomeStore((state) => state.fetchDistributors);
  const summary = useHomeStore((state) => state.summary);
  const distributors = useHomeStore((state) => state.distributors);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState<'medicines' | 'distributor'>('medicines');

  useEffect(() => {
    fetchSummary();
    fetchDistributors();
  }, []);

  const gridItems = [
    { id: '1', title: 'Distributors', icon: <Truck color="#0066cc" size={32} /> },
    { id: '2', title: 'Outstandings', icon: <Wallet color="#0066cc" size={32} /> },
    { id: '3', title: 'Company Schemes', icon: <Tag color="#0066cc" size={32} /> },
    { id: '4', title: 'Generic', icon: <Pill color="#0066cc" size={32} /> },
    { id: '5', title: 'Company Cashback', icon: <Gift color="#0066cc" size={32} /> },
    { id: '6', title: 'Returns', icon: <RotateCcw color="#0066cc" size={32} /> },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        
        {/* Welcome Banner */}
        <View style={styles.banner}>
          <Text style={styles.bannerTitle}>Welcome to MedConnect</Text>
          <Text style={styles.bannerSubtitle}>Your dedicated B2B Pharma Ordering Platform</Text>
        </View>

        {/* Search Bar with Toggle */}
        <View style={styles.searchSection}>
          <View style={styles.searchToggleContainer}>
            <TouchableOpacity 
              style={[styles.toggleButton, searchType === 'medicines' && styles.toggleActive]}
              onPress={() => setSearchType('medicines')}
            >
              <Text style={[styles.toggleText, searchType === 'medicines' && styles.toggleTextActive]}>
                Medicines
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.toggleButton, searchType === 'distributor' && styles.toggleActive]}
              onPress={() => setSearchType('distributor')}
            >
              <Text style={[styles.toggleText, searchType === 'distributor' && styles.toggleTextActive]}>
                Distributor
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.searchInputContainer}>
            <Search color="#999" size={20} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder={`Search for ${searchType}...`}
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#999"
            />
          </View>
        </View>

        {/* Explore Grid */}
        <Text style={styles.sectionTitle}>Explore</Text>
        <View style={styles.gridContainer}>
          {gridItems.map((item) => (
            <TouchableOpacity key={item.id} style={styles.gridItem}>
              <View style={styles.iconContainer}>
                {item.icon}
              </View>
              <Text style={styles.gridItemText}>{item.title}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Summary Info (from API) */}
        {summary && (
          <View style={styles.summaryContainer}>
            <Text style={styles.sectionTitle}>Dashboard Summary</Text>
            <View style={styles.summaryCard}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Outstanding Total:</Text>
                <Text style={styles.summaryValue}>₹{summary.outstandingTotal ?? 0}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Items in Cart:</Text>
                <Text style={styles.summaryValue}>{summary.cartCount ?? 0}</Text>
              </View>
            </View>
          </View>
        )}

        {/* Quick Access Distributors (from API) */}
        {distributors && distributors.length > 0 && (
          <View style={styles.distributorsContainer}>
            <Text style={styles.sectionTitle}>Mapped Distributors</Text>
            {distributors.map((d) => (
              <View key={d.id} style={styles.distributorCard}>
                <Building2Icon />
                <Text style={styles.distributorName}>{d.name}</Text>
              </View>
            ))}
          </View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

// Quick inline component since Building2 is not imported at the top to save imports
import { Building2 } from 'lucide-react-native';
const Building2Icon = () => <Building2 color="#666" size={24} style={{ marginRight: 12 }} />;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    padding: 16,
    paddingBottom: 32,
  },
  banner: {
    backgroundColor: '#e6f2ff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 24,
  },
  bannerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0066cc',
    marginBottom: 4,
  },
  bannerSubtitle: {
    fontSize: 14,
    color: '#333',
  },
  searchSection: {
    marginBottom: 24,
  },
  searchToggleContainer: {
    flexDirection: 'row',
    marginBottom: 12,
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  gridItem: {
    width: '31%',
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#eee',
  },
  iconContainer: {
    width: 48,
    height: 48,
    backgroundColor: '#e6f2ff',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  gridItemText: {
    fontSize: 12,
    color: '#333',
    textAlign: 'center',
    fontWeight: '500',
  },
  summaryContainer: {
    marginBottom: 24,
  },
  summaryCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#eee',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  distributorsContainer: {
    marginBottom: 24,
  },
  distributorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 8,
    padding: 16,
    marginBottom: 8,
  },
  distributorName: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
});
