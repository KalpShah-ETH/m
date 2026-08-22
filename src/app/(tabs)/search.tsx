import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, Modal, ScrollView, Dimensions, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { colors } from '@/constants/colors';
import { useSearchProducts } from '@/api/search';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// --- Mock Data ---
const PROMO_SLIDES = [
  { id: '1', title: 'Welcome to VPD Medi 2.0!', subtitle: 'Discover top products, exclusive deals, and updates from your favourite pharma companies: all in one place!', colors: [colors.primaryForest, colors.forestDark] },
  { id: '2', title: 'Season Offer — Extra 5% Margins', subtitle: 'On select respiratory & monsoon-care ranges this week only.', colors: [colors.secondaryTerracotta, '#9c3f33'] },
  { id: '3', title: 'New: Company Cashback', subtitle: 'Earn cashback automatically on every mapped-distributor order.', colors: [colors.forestDark, colors.primaryForest] },
];

const MOCK_TOP_PRODUCTS = [
  { id: 'p1', name: 'Ctd T 80/12.5 Mg Tablet 10', strength: '10TAB', manufacturer: 'IPCA', price: 181.68, mrp: 238.45, pack: '10TAB', stock: 'zero', company: 'Atlance Pharma Private Limited' },
  { id: 'p2', name: 'Lipirose F 5 Tab 10', strength: '10TAB', manufacturer: 'CIPLA', price: 112.59, mrp: 147.77, pack: '10TAB', stock: 'zero', company: 'Atlance Pharma Private Limited' },
];

const MOCK_DISTRIBUTORS = [
  { id: 'd1', name: 'PharmaCorp Distributors' },
  { id: 'd2', name: 'MediLife Supplies' },
  { id: 'd3', name: 'Apex Health Partners' },
];

// --- Components ---

const ProductCard = React.memo(({ item, variant }: { item: any; variant: 'idle' | 'results' }) => {
  const isZeroStock = item.stock === 'zero' || item.stock_status === 'out-of-stock';
  
  return (
    <View style={styles.cardContainer}>
      {/* Top Row */}
      <View style={styles.cardTopRow}>
        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
          <Text style={styles.cardProductName} numberOfLines={1}>{item.name}</Text>
          <Feather name="chevron-down" size={12} color={colors.textSlate} style={{ marginLeft: 4, marginTop: 2 }} />
        </View>
        <Feather name="heart" size={18} color={colors.textSlate} />
      </View>
      
      {/* Company Row */}
      <View style={styles.cardCompanyRow}>
        <View style={styles.companyPill}>
          <Text style={styles.companyText}>{item.company || 'Unknown'}</Text>
        </View>
        <Feather name="external-link" size={11} color={colors.primaryForest} style={{ marginLeft: 6 }} />
      </View>
      
      {/* Price Row */}
      <View style={styles.cardPriceRow}>
        <Text style={styles.priceText}>PTR: <Text style={styles.priceValue}>₹{(item.price || item.ptr || 0).toFixed(2)}</Text></Text>
        <Text style={styles.priceText}>MRP: <Text style={styles.priceValue}>₹{(item.mrp || 0).toFixed(2)}</Text></Text>
        <Text style={styles.priceText}>Pack: <Text style={styles.priceValue}>{item.pack || item.pack_size || 'N/A'}</Text></Text>
        
        <View style={styles.stockContainer}>
          <Feather name="box" size={12} color={isZeroStock ? colors.secondaryTerracotta : colors.primaryForest} />
          <Text style={[styles.stockText, { color: isZeroStock ? colors.secondaryTerracotta : colors.primaryForest }]}>
            {isZeroStock ? '0' : '45'}
          </Text>
        </View>
      </View>
      
      {/* Footer */}
      <View style={styles.cardFooter}>
        <Text style={styles.brandTag}>{item.manufacturer || 'GENERIC'}</Text>
        
        {variant === 'idle' ? (
          <View style={styles.idleFooterRight}>
            <View style={styles.qtyBox}>
              <Text style={styles.qtyText}>Qty</Text>
            </View>
            <TouchableOpacity style={styles.plusBtn}>
              <Feather name="plus" size={16} color={colors.white} />
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity style={styles.addBtn}>
            <Text style={styles.addBtnText}>Add</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
});

const PromoCarousel = React.memo(() => {
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const slideWidth = 314;
  const gap = 10;
  const snapInterval = slideWidth + gap;

  const onScroll = useCallback((event: any) => {
    const scrollPosition = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollPosition / snapInterval);
    if (index !== activeIndex && index >= 0 && index < PROMO_SLIDES.length) {
      setActiveIndex(index);
    }
  }, [activeIndex, snapInterval]);

  const scrollToSlide = useCallback((index: number) => {
    flatListRef.current?.scrollToOffset({ offset: index * snapInterval, animated: true });
  }, [snapInterval]);

  const renderSlide = useCallback(({ item }: { item: any }) => (
    <View style={[styles.slide, { backgroundColor: item.colors[0], marginRight: gap }]}>
      <View style={[styles.slideHighlight, { backgroundColor: item.colors[1] }]} />
      <Text style={styles.slideTitle}>{item.title}</Text>
      <Text style={styles.slideSubtitle}>{item.subtitle}</Text>
    </View>
  ), []);

  return (
    <View style={styles.carouselWrapper}>
      <FlatList
        ref={flatListRef}
        data={PROMO_SLIDES}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={snapInterval}
        decelerationRate="fast"
        contentContainerStyle={{ paddingLeft: 16, paddingRight: 32 }}
        onScroll={onScroll}
        scrollEventThrottle={16}
        keyExtractor={item => item.id}
        renderItem={renderSlide}
      />
      <View style={styles.dotsContainer}>
        {PROMO_SLIDES.map((_, i) => (
          <TouchableOpacity key={i} onPress={() => scrollToSlide(i)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <View style={[styles.dot, i === activeIndex && styles.activeDot]} />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
});

export default React.memo(function SearchScreen() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'mapped' | 'non-mapped'>('mapped');
  
  const [isDistributorModalVisible, setDistributorModalVisible] = useState(false);
  const [isFilterModalVisible, setFilterModalVisible] = useState(false);
  
  const [distCheckboxStates, setDistCheckboxStates] = useState<Record<string, boolean>>({});
  const [saveDistributorChecked, setSaveDistributorChecked] = useState(true);

  // Debounce the query for React Query
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query.trim());
    }, 300);
    return () => clearTimeout(handler);
  }, [query]);

  // Use React Query instead of Zustand store
  const { data: products = [] } = useSearchProducts(debouncedQuery);

  const isResultsState = debouncedQuery.length >= 3;

  const handleClear = useCallback(() => {
    setQuery('');
    setDebouncedQuery('');
  }, []);

  const toggleDistCheckbox = useCallback((id: string) => {
    setDistCheckboxStates(prev => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const renderResultItem = useCallback(({ item }: { item: any }) => (
    <ProductCard item={item} variant="results" />
  ), []);

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* 4.1 Search Bar */}
      <View style={styles.headerRow}>
        <View style={styles.searchBarContainer}>
          <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Feather name="arrow-left" size={16} color={colors.primaryForest} />
          </TouchableOpacity>
          
          <TextInput
            style={styles.searchInput}
            placeholder="Search min 3 character"
            placeholderTextColor={colors.textSlate}
            value={query}
            onChangeText={setQuery}
          />
          
          {query.length > 0 && (
            <TouchableOpacity onPress={handleClear} style={styles.clearBtn}>
              <Feather name="x" size={15} color={colors.textSlate} />
            </TouchableOpacity>
          )}
          
          <View style={styles.verticalDivider} />
          
          <TouchableOpacity style={styles.distributorSelector} onPress={() => setDistributorModalVisible(true)}>
            <Text style={styles.distributorLabel} numberOfLines={1}>ATLANCE PHAR</Text>
            <Feather name="chevron-down" size={13} color={colors.primaryForest} />
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity style={styles.filterBtn} onPress={() => setFilterModalVisible(true)}>
          <Feather name="sliders" size={20} color={colors.textDark} />
          <View style={styles.filterDot} />
        </TouchableOpacity>
      </View>

      <View style={styles.mainContent}>
        {!isResultsState ? (
          /* 4.2 Idle State */
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
            {/* Greeting Row */}
            <View style={styles.greetingRow}>
              <View style={styles.greetingLeft}>
                <Text style={styles.greetingTitle}>Welcome to ATLANCE PHARMA PRIVATE LIMITED</Text>
                <View style={styles.locationRow}>
                  <Feather name="map-pin" size={11} color={colors.textSlate} />
                  <Text style={styles.locationText}> </Text>
                </View>
              </View>
              <TouchableOpacity style={styles.phoneBtn}>
                <Feather name="phone" size={16} color={colors.primaryForest} />
              </TouchableOpacity>
            </View>

            {/* Outstanding Banner */}
            <TouchableOpacity style={styles.outstandingBanner} onPress={() => router.push('/outstandings')}>
              <Text style={styles.outstandingText}>₹ Outstanding balance : Rs.7,207,800</Text>
              <Feather name="chevron-down" size={16} color={colors.secondaryTerracotta} style={{ transform: [{ rotate: '-90deg' }] }} />
            </TouchableOpacity>

            {/* Promo Carousel */}
            <PromoCarousel />

            {/* Top Purchased Products */}
            <View style={styles.topProductsSection}>
              <Text style={styles.sectionHeading}>Top Purchased Products</Text>
              {MOCK_TOP_PRODUCTS.map(item => (
                <ProductCard key={item.id} item={item} variant="idle" />
              ))}
            </View>
          </ScrollView>
        ) : (
          /* 4.3 Results State */
          <View style={styles.resultsContainer}>
            {/* Tabs */}
            <View style={styles.tabsContainer}>
              <TouchableOpacity style={styles.tab} activeOpacity={0.8} onPress={() => setActiveTab('mapped')}>
                <Text style={[styles.tabLabel, activeTab === 'mapped' && styles.tabLabelActive]}>Mapped</Text>
                {activeTab === 'mapped' && <View style={styles.tabUnderline} />}
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.tab} activeOpacity={0.8} onPress={() => setActiveTab('non-mapped')}>
                <Text style={[styles.tabLabel, activeTab === 'non-mapped' && styles.tabLabelActive]}>Non-Mapped</Text>
                {activeTab === 'non-mapped' && <View style={styles.tabUnderline} />}
              </TouchableOpacity>
            </View>

            {/* Results List */}
            <FlatList
              data={products}
              keyExtractor={item => item.id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.listPadding}
              renderItem={renderResultItem}
              ListEmptyComponent={
                <View style={{ alignItems: 'center', paddingTop: 40 }}>
                  <Text style={{ fontFamily: 'Inter_400Regular', color: colors.textSlate }}>No products found.</Text>
                </View>
              }
            />
          </View>
        )}
      </View>


      {/* 6. Select Distributor Modal */}
      <Modal visible={isDistributorModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Distributor</Text>
              <TouchableOpacity style={styles.modalCloseBtn} onPress={() => setDistributorModalVisible(false)}>
                <Feather name="x" size={14} color={colors.textSlate} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalSearchRow}>
              <Feather name="search" size={15} color={colors.textSlate} />
              <TextInput style={styles.modalSearchInput} placeholder="Search distributor here" placeholderTextColor={colors.textSlate} />
            </View>
            
            <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
              {MOCK_DISTRIBUTORS.map(d => (
                <TouchableOpacity key={d.id} style={styles.checkboxRow} onPress={() => toggleDistCheckbox(d.id)} activeOpacity={0.7}>
                  <View style={[styles.checkbox, distCheckboxStates[d.id] && styles.checkboxChecked]}>
                    {distCheckboxStates[d.id] && <Feather name="check" size={12} color={colors.white} />}
                  </View>
                  <Text style={styles.checkboxLabel}>{d.name}</Text>
                </TouchableOpacity>
              ))}
              
              <View style={{ height: 20 }} />
              <TouchableOpacity style={styles.checkboxRow} onPress={() => setSaveDistributorChecked(!saveDistributorChecked)} activeOpacity={0.7}>
                <View style={[styles.checkbox, saveDistributorChecked && styles.checkboxChecked]}>
                  {saveDistributorChecked && <Feather name="check" size={12} color={colors.white} />}
                </View>
                <Text style={styles.checkboxLabel}>Save for future reference</Text>
              </TouchableOpacity>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity style={styles.pillBtnOutline}>
                <Text style={styles.pillBtnOutlineText}>Reset</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.pillBtnSolid}>
                <Text style={styles.pillBtnSolidText}>Apply</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* 7. Filter Modal */}
      <Modal visible={isFilterModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filter</Text>
              <TouchableOpacity style={styles.modalCloseBtn} onPress={() => setFilterModalVisible(false)}>
                <Feather name="x" size={14} color={colors.textSlate} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
              {['Sort By', 'Hide Zero (0) Stock Products', 'Search Configuration', 'Add To Cart Mode', 'Cart Item Selection'].map(filterLabel => (
                <TouchableOpacity key={filterLabel} style={styles.filterField}>
                  <Text style={styles.filterFieldLabel}>{filterLabel}</Text>
                  <Feather name="chevron-down" size={16} color={colors.primaryForest} />
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity style={styles.pillBtnOutline}>
                <Text style={styles.pillBtnOutlineText}>Reset</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.pillBtnSolid}>
                <Text style={styles.pillBtnSolidText}>Apply</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
});

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.white,
  },
  // 4.1 Search Bar
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    gap: 10,
    backgroundColor: colors.white,
  },
  searchBarContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutralForestTint,
    borderRadius: 10,
    height: 42,
    paddingHorizontal: 12,
  },
  searchInput: {
    flex: 1,
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: colors.textDark,
    paddingHorizontal: 8,
  },
  clearBtn: {
    padding: 2,
    marginRight: 6,
  },
  verticalDivider: {
    width: 1,
    height: 20,
    backgroundColor: colors.borderLight,
    marginHorizontal: 8,
  },
  distributorSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    maxWidth: 100,
  },
  distributorLabel: {
    fontFamily: 'Inter_700Bold',
    fontSize: 12,
    color: colors.textDark,
    marginRight: 4,
  },
  filterBtn: {
    padding: 4,
    position: 'relative',
  },
  filterDot: {
    position: 'absolute',
    top: -3,
    right: -3,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.accentGold,
  },
  mainContent: {
    flex: 1,
    backgroundColor: colors.backgroundOffWhite,
  },
  // 4.2 Idle State
  greetingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  greetingLeft: {
    maxWidth: 280,
  },
  greetingTitle: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 16,
    color: colors.textDark,
    marginBottom: 4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: colors.textSlate,
    marginLeft: 4,
  },
  phoneBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.neutralForestTint,
    justifyContent: 'center',
    alignItems: 'center',
  },
  outstandingBanner: {
    marginHorizontal: 16,
    backgroundColor: colors.terracottaLight,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  outstandingText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 13,
    color: colors.secondaryTerracotta,
  },
  // 5. Promo Carousel
  carouselWrapper: {
    marginBottom: 24,
  },
  slide: {
    width: 314,
    height: 150,
    borderRadius: 14,
    padding: 18,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  slideHighlight: {
    position: 'absolute',
    top: -40,
    right: -40,
    width: 130,
    height: 130,
    borderRadius: 65,
    opacity: 0.15,
  },
  slideTitle: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 15,
    color: colors.white,
    marginBottom: 4,
  },
  slideSubtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: colors.neutralForestTint,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 12,
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.borderLight,
  },
  activeDot: {
    backgroundColor: colors.primaryForest,
    width: 16,
  },
  // Top Products
  topProductsSection: {
    paddingHorizontal: 16,
  },
  sectionHeading: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 15,
    color: colors.textDark,
    marginBottom: 12,
  },
  // 4.3 Results State
  resultsContainer: {
    flex: 1,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  tabLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    color: colors.textSlate,
  },
  tabLabelActive: {
    fontFamily: 'Inter_700Bold',
    color: colors.primaryForest,
  },
  tabUnderline: {
    position: 'absolute',
    bottom: 0,
    width: '44%', 
    height: 2.5,
    backgroundColor: colors.primaryForest,
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
  },
  listPadding: {
    padding: 16,
    paddingBottom: 100,
  },
  // 8. Product Card
  cardContainer: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  cardProductName: {
    fontFamily: 'Inter_700Bold',
    fontSize: 14,
    color: colors.textDark,
  },
  cardCompanyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  companyPill: {
    backgroundColor: colors.neutralForestTint,
    borderRadius: 999,
    paddingVertical: 2,
    paddingHorizontal: 8,
  },
  companyText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 11.5,
    color: colors.primaryForest,
  },
  cardPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  priceText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11.5,
    color: colors.textSlate,
  },
  priceValue: {
    fontFamily: 'Inter_700Bold',
    color: colors.textDark,
  },
  stockContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 'auto',
    gap: 4,
  },
  stockText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 11.5,
  },
  cardFooter: {
    backgroundColor: colors.backgroundOffWhite,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  brandTag: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
    color: colors.textSlate,
    letterSpacing: 0.5,
  },
  idleFooterRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  qtyBox: {
    width: 64,
    height: 32,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.white,
  },
  qtyText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: colors.textSlate,
  },
  plusBtn: {
    width: 32,
    height: 32,
    backgroundColor: colors.primaryForest,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addBtn: {
    backgroundColor: colors.primaryForest,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 22,
  },
  addBtnText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 13,
    color: colors.white,
  },
  // 9. Bottom Nav
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 70,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingBottom: Platform.OS === 'ios' ? 15 : 0, 
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  navLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 10,
    color: colors.textSlate,
    marginTop: 4,
  },
  fabContainer: {
    top: -20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primaryForest,
    borderWidth: 4,
    borderColor: colors.backgroundOffWhite,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Modals
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(20, 47, 35, 0.55)', // forestDark 55%
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    maxHeight: '82%',
    padding: 16,
    paddingBottom: Platform.OS === 'ios' ? 34 : 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 18,
    color: colors.textDark,
  },
  modalCloseBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: colors.borderLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalSearchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundOffWhite,
    borderRadius: 8,
    height: 42,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  modalSearchInput: {
    flex: 1,
    marginLeft: 8,
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: colors.textDark,
  },
  modalScroll: {
    marginBottom: 16,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: colors.borderLight,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.white,
  },
  checkboxChecked: {
    backgroundColor: colors.primaryForest,
    borderColor: colors.primaryForest,
  },
  checkboxLabel: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13.5,
    color: colors.textDark,
  },
  filterField: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: 8,
    padding: 14,
    marginBottom: 12,
  },
  filterFieldLabel: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11.5,
    color: colors.textSlate,
    textTransform: 'uppercase',
  },
  modalFooter: {
    flexDirection: 'row',
    gap: 12,
  },
  pillBtnOutline: {
    flex: 1,
    height: 46,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: colors.primaryForest,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pillBtnOutlineText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 14,
    color: colors.primaryForest,
  },
  pillBtnSolid: {
    flex: 1,
    height: 46,
    borderRadius: 999,
    backgroundColor: colors.primaryForest,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pillBtnSolidText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 14,
    color: colors.white,
  },
});
