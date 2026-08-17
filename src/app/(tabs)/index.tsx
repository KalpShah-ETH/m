import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { Truck, Wallet, Tag, Pill, Gift, RotateCcw, Search, Bell, User } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useHomeStore } from '@/store/homeStore';
import { useAccountStore } from '@/store/accountStore';

export default function HomeScreen() {
  const router = useRouter();
  const { profile, fetchProfile } = useAccountStore();
  const fetchSummary = useHomeStore((state) => state.fetchSummary);
  const fetchDistributors = useHomeStore((state) => state.fetchDistributors);
  const summary = useHomeStore((state) => state.summary);
  const distributors = useHomeStore((state) => state.distributors);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState<'medicines' | 'distributor'>('medicines');

  useEffect(() => {
    fetchSummary();
    fetchDistributors();
    fetchProfile();
  }, []);

  const gridItems = [
    { id: '1', title: 'Distributors', icon: <Truck color="#1F5B4E" size={32} />, route: '/distributors' },
    { id: '2', title: 'Outstandings', icon: <Wallet color="#1F5B4E" size={32} />, route: '/outstandings' },
    { id: '3', title: 'Company Schemes', icon: <Tag color="#1F5B4E" size={32} /> },
    { id: '4', title: 'Generic', icon: <Pill color="#1F5B4E" size={32} />, route: '/generic' },
    { id: '5', title: 'Company Cashback', icon: <Gift color="#1F5B4E" size={32} /> },
    { id: '6', title: 'Returns', icon: <RotateCcw color="#1F5B4E" size={32} />, route: '/returns' },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.topBar}>
        <View>
          <Text style={styles.greetingText}>Hello, {profile?.name ? profile.name.split(' ')[0] : 'User'}</Text>
          <Text style={styles.subGreetingText}>Welcome back</Text>
        </View>
        <View style={styles.topBarIcons}>
          <TouchableOpacity style={styles.iconButton}>
            <Bell color="#1F2937" size={24} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} onPress={() => router.push('/profile')}>
            <User color="#1F5B4E" size={24} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        
        {/* Banner */}
        <View style={styles.banner}>
          <Text style={styles.bannerTitle}>MedConnect</Text>
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
            <TouchableOpacity 
              key={item.id} 
              style={styles.gridItem}
              onPress={() => item.route && router.push(item.route as any)}
            >
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
  greetingText: {
    fontSize: 18, fontFamily: 'Inter_700Bold', fontWeight: 'bold',
    color: '#1F2937',
  },
  subGreetingText: {
    fontSize: 14, fontFamily: 'Inter_400Regular',
    color: '#666',
  },
  topBarIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    marginLeft: 16,
    padding: 8,
    backgroundColor: '#FAFAFA',
    borderRadius: 20,
  },
  container: {
    padding: 16,
    paddingBottom: 32,
  },
  banner: {
    backgroundColor: '#E8F0EE',
    padding: 20,
    borderRadius: 12,
    marginBottom: 24,
  },
  bannerTitle: {
    fontSize: 20, fontFamily: 'Inter_700Bold', fontWeight: 'bold',
    color: '#1F5B4E',
    marginBottom: 4,
  },
  bannerSubtitle: {
    fontSize: 14, fontFamily: 'Inter_400Regular',
    color: '#1F2937',
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
    fontSize: 14, fontFamily: 'Inter_400Regular',
    color: '#666',
    fontFamily: 'Inter_600SemiBold', fontWeight: '600',
  },
  toggleTextActive: {
    color: '#1F5B4E',
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
    fontSize: 16, fontFamily: 'Inter_400Regular',
    color: '#1F2937',
  },
  sectionTitle: {
    fontSize: 18, fontFamily: 'Inter_700Bold', fontWeight: 'bold',
    color: '#1F2937',
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
    backgroundColor: '#E8F0EE',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  gridItemText: {
    fontSize: 12, fontFamily: 'Inter_400Regular',
    color: '#1F2937',
    textAlign: 'center',
    fontFamily: 'Inter_500Medium', fontWeight: '500',
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
    fontSize: 14, fontFamily: 'Inter_400Regular',
    color: '#666',
  },
  summaryValue: {
    fontSize: 16, fontFamily: 'Inter_700Bold', fontWeight: 'bold',
    color: '#1F2937',
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
    fontSize: 16, fontFamily: 'Inter_400Regular',
    color: '#1F2937',
    fontFamily: 'Inter_500Medium', fontWeight: '500',
  },
});
