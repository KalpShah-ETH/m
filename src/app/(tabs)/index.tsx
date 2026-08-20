import { useAccountStore } from '@/store/accountStore';
import { useHomeStore } from '@/store/homeStore';
import { useRouter } from 'expo-router';
import { Bell, Gift, Pill, RotateCcw, Tag, Truck, User, Wallet } from 'lucide-react-native';
import { useEffect } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, Platform, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const router = useRouter();
  const { profile, fetchProfile } = useAccountStore();
  const fetchSummary = useHomeStore((state) => state.fetchSummary);
  const fetchDistributors = useHomeStore((state) => state.fetchDistributors);
  const summary = useHomeStore((state) => state.summary);
  const distributors = useHomeStore((state) => state.distributors);

  useEffect(() => {
    fetchSummary();
    fetchDistributors();
    fetchProfile();
  }, []);

  const gridItems = [
    { id: '1', title: 'Distributors', icon: <Truck color="#1F5B4E" size={20} />, route: '/distributors' },
    { id: '2', title: 'Outstandings', icon: <Wallet color="#1F5B4E" size={20} />, route: '/outstandings' },
    { id: '3', title: 'Company Schemes', icon: <Tag color="#1F5B4E" size={20} /> },
    { id: '4', title: 'Generic', icon: <Pill color="#1F5B4E" size={20} />, route: '/generic' },
    { id: '5', title: 'Company Cashback', icon: <Gift color="#1F5B4E" size={20} /> },
    { id: '6', title: 'Returns', icon: <RotateCcw color="#1F5B4E" size={20} />, route: '/returns' },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.topBar}>
        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
          <TouchableOpacity style={[styles.iconButton, { marginLeft: 0, marginRight: 12 }]} onPress={() => router.push('/profile')}>
            <User color="#1F5B4E" size={24} />
          </TouchableOpacity>
          <View style={styles.greetingContainer}>
            <Text style={styles.subGreetingText}>Welcome to</Text>
            <Text style={styles.greetingText} numberOfLines={1} ellipsizeMode="tail">
              MedConnect
            </Text>
          </View>
        </View>
        <View style={styles.topBarIcons}>
          <TouchableOpacity style={styles.iconButton}>
            <Bell color="#1F2937" size={24} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.container}>

        {/* Banner */}
        <View style={styles.banner}>
          <Text style={styles.bannerTitle}>MedConnect</Text>
          <Text style={styles.bannerSubtitle}>Your dedicated B2B Pharma Ordering Platform</Text>
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
                <Text style={styles.summaryLabel} numberOfLines={1} ellipsizeMode="tail">Outstanding Total:</Text>
                <Text style={styles.summaryValue} numberOfLines={1} ellipsizeMode="tail">₹{summary.outstandingTotal ?? 0}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel} numberOfLines={1} ellipsizeMode="tail">Items in Cart:</Text>
                <Text style={styles.summaryValue} numberOfLines={1} ellipsizeMode="tail">{summary.cartCount ?? 0}</Text>
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
  greetingContainer: {
    flex: 1,
    marginRight: 16,
    maxWidth: '70%',
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
    paddingHorizontal: 20,
    paddingVertical: 32, // increased vertical padding to make it bigger
    borderRadius: 12,
    marginBottom: 24,
    minHeight: 140, // Ensure it has a good size for future ads
    justifyContent: 'center',
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
    width: '30%',
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#eee',
  },
  iconContainer: {
    width: 36,
    height: 36,
    backgroundColor: '#E8F0EE',
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  gridItemText: {
    fontSize: 12,
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
    flexDirection: 'column',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 14, fontFamily: 'Inter_400Regular',
    color: '#666',
    marginBottom: 4,
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
    fontSize: 16,
    color: '#1F2937',
    fontFamily: 'Inter_500Medium', fontWeight: '500',
  },
});
