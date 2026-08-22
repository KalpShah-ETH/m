import { useAccountStore } from '@/store/accountStore';
import { useHomeStore } from '@/store/homeStore';
import { useRouter } from 'expo-router';
import { useEffect, useState, useRef } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, Dimensions, FlatList, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { User, Bell, Heart, Graph, Receipt, Tag, Pill, Wallet, Package } from 'phosphor-react-native';
import { colors } from '@/constants/colors';

const { width } = Dimensions.get('window');
const SLIDE_WIDTH = width * 0.88;
const GAP = 12;
const SNAP_INTERVAL = SLIDE_WIDTH + GAP;

const originalSlides = [
  { title: 'Extra 5% Margins\nThis Week', sub: 'On select respiratory ranges', gradient: [colors.primaryForest, '#142F23'] },
  { title: 'Bulk Order Discounts\nActive Now', sub: 'Save up to 15% on generic medicines', gradient: [colors.secondaryTerracotta, '#662c24'] },
  { title: 'New Distributor\nPartnership', sub: 'Connect for exclusive offers', gradient: [colors.accentGold, '#85611e'] },
];

const bannerSlides = Array.from({ length: 22 }).map((_, index) => ({
  id: String(index + 1),
  ...originalSlides[index % originalSlides.length]
}));

const ExploreTile = ({ icon, label, bgClass, onPress }: any) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => Animated.spring(scaleAnim, { toValue: 0.96, useNativeDriver: true }).start();
  const handlePressOut = () => Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true }).start();

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }], width: '31%', alignItems: 'center' }}>
      <TouchableOpacity 
        activeOpacity={1} 
        onPressIn={handlePressIn} 
        onPressOut={handlePressOut}
        onPress={onPress}
        style={{ width: '100%', alignItems: 'center' }}
      >
        <View style={[styles.tileIconContainer, { backgroundColor: bgClass }]}>
          {icon}
        </View>
        <Text style={styles.tileLabel} numberOfLines={2} ellipsizeMode="tail">{label}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

export default function HomeScreen() {
  const router = useRouter();
  const { profile, fetchProfile } = useAccountStore();
  const fetchSummary = useHomeStore((state) => state.fetchSummary);
  const fetchDistributors = useHomeStore((state) => state.fetchDistributors);
  
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    fetchSummary();
    fetchDistributors();
    fetchProfile();
  }, []);

  const gridItems = [
    { id: '1', title: 'Distributors', icon: <Graph color={colors.primaryForest} size={22} weight="regular" />, bg: colors.neutralForestTint, route: '/distributors' },
    { id: '2', title: 'Outstanding', icon: <Receipt color={colors.secondaryTerracotta} size={22} weight="regular" />, bg: colors.terracottaLight, route: '/outstandings' },
    { id: '3', title: 'Company Schemes', icon: <Tag color={colors.accentGold} size={22} weight="regular" />, bg: colors.goldLight },
    { id: '4', title: 'Generic', icon: <Pill color={colors.primaryForest} size={22} weight="regular" />, bg: colors.neutralForestTint, route: '/generic' },
    { id: '5', title: 'Company Cashback', icon: <Wallet color={colors.secondaryTerracotta} size={22} weight="regular" />, bg: colors.terracottaLight },
    { id: '6', title: 'Returns', icon: <Package color={colors.accentGold} size={22} weight="regular" />, bg: colors.goldLight, route: '/returns' },
  ];

  const renderBanner = ({ item }: { item: typeof bannerSlides[0] }) => (
    <View style={[styles.bannerSlide, { backgroundColor: item.gradient[0] }]}>
      <Text style={styles.bannerTitle}>{item.title}</Text>
      <Text style={styles.bannerSub}>{item.sub}</Text>
    </View>
  );

  const handleScroll = (e: any) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / SNAP_INTERVAL);
    if (index !== activeSlide) setActiveSlide(index);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.avatar} onPress={() => router.push('/profile')}>
          <User color={colors.primaryForest} size={20} weight="regular" />
        </TouchableOpacity>
        <View style={styles.greetingStack}>
          <Text style={styles.greetingSmall}>Welcome to,</Text>
          <Text style={styles.greetingName} numberOfLines={1}>MedConnect</Text>
        </View>
        <View style={{ flex: 1 }} />
        <TouchableOpacity style={[styles.headerIconBtn, { marginLeft: 16 }]}>
          <Bell color={colors.textDark} size={22} weight="regular" />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.headerIconBtn, { marginLeft: 16 }]}>
          <Heart color={colors.textDark} size={22} weight="regular" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Promotional Banner */}
        <View style={styles.bannerContainer}>
          <FlatList
            data={bannerSlides}
            keyExtractor={item => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            snapToInterval={SNAP_INTERVAL}
            decelerationRate="fast"
            contentContainerStyle={{ paddingLeft: width * 0.06, paddingRight: width * 0.06, gap: GAP }}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            renderItem={renderBanner}
          />
          <View style={styles.pagination}>
            {bannerSlides.map((_, i) => (
              <View key={i} style={[styles.dot, activeSlide === i && styles.dotActive]} />
            ))}
          </View>
        </View>

        {/* Explore Grid */}
        <View style={styles.exploreSection}>
          <Text style={styles.sectionHeading}>Explore</Text>
          <View style={styles.exploreGridCard}>
            <View style={styles.grid}>
              {gridItems.map((item) => (
                <ExploreTile 
                  key={item.id}
                  icon={item.icon}
                  label={item.title}
                  bgClass={item.bg}
                  onPress={() => item.route && router.push(item.route as any)}
                />
              ))}
            </View>
          </View>
        </View>

        {/* Trending Products Placeholder */}
        <View style={styles.trendingSection}>
          <Text style={styles.sectionHeading}>Trending Products</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.trendingScroll}>
            {[1, 2, 3].map(i => (
              <View key={i} style={styles.productCardPlaceholder}>
                <Text style={styles.placeholderText}>Product card{'\n'}pending spec</Text>
              </View>
            ))}
          </ScrollView>
        </View>

        <View style={{ height: 28 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.backgroundOffWhite,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
    backgroundColor: colors.white,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.neutralForestTint,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  greetingStack: {
    flexDirection: 'column',
    justifyContent: 'center',
  },
  greetingSmall: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: colors.textSlate,
  },
  greetingName: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 18,
    color: colors.textDark,
    marginTop: -2,
  },
  headerIconBtn: {
    padding: 0,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  bannerContainer: {
    paddingTop: 16,
    paddingBottom: 10,
  },
  bannerSlide: {
    width: SLIDE_WIDTH,
    height: 140,
    borderRadius: 16,
    padding: 20,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  bannerTitle: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 18,
    color: colors.white,
    lineHeight: 24,
  },
  bannerSub: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: colors.neutralForestTint,
    marginTop: 6,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.borderLight,
  },
  dotActive: {
    width: 12,
    backgroundColor: colors.primaryForest,
  },
  exploreSection: {
    marginTop: 8,
  },
  sectionHeading: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 17,
    color: colors.textDark,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  exploreGridCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    marginHorizontal: 16,
    padding: 16,
    shadowColor: '#16232F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 16,
  },
  tile: {
    width: '31%',
    alignItems: 'center',
  },
  tileIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  tileLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    color: colors.textDark,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 15,
  },
  trendingSection: {
    marginTop: 24,
  },
  trendingScroll: {
    paddingLeft: 16,
    paddingRight: 16,
    gap: 12,
  },
  productCardPlaceholder: {
    width: 140,
    height: 180,
    backgroundColor: '#F6F8FA',
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.borderLight,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
  },
  placeholderText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 10,
    color: colors.textSlate,
    textAlign: 'center',
  },
});
