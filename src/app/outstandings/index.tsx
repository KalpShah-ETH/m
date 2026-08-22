import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  FlatList, 
  TouchableOpacity, 
  Platform, 
  Modal, 
  Animated,
  Easing
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { colors } from '@/constants/colors';

// --- MOCK DATA FROM HTML ---
const MOCK_DISTRIBUTORS = [
  { 
    id: '1', name: "ATLANCE PHARMA PRIVATE LIMITED", address: "0", amount: "₹7297477.00", 
    mixedCase: false, 
    totals: { amount: "₹7,313,369", received: "₹0", balance: "₹7,297,477" },
    invoices: [
      { id: "#26/SZ/38291", balance: "₹2,730", date: "21/08/26", total: "₹2,730", received: "₹0" },
      { id: "#26/SZ/38305", balance: "₹86,947", date: "21/08/26", total: "₹86,947", received: "₹0" },
      { id: "#26/SZ/37894", balance: "₹500,442", date: "20/08/26", total: "₹500,442", received: "₹0" },
      { id: "#26/SZ/37412", balance: "₹9,976", date: "19/08/26", total: "₹9,976", received: "₹0" },
      { id: "#26/SZ/37530", balance: "₹690,060", date: "19/08/26", total: "₹690,060", received: "₹0" },
      { id: "#26/SZ/37051", balance: "₹478,595", date: "19/08/26", total: "₹478,595", received: "₹0" }
    ]
  },
  { 
    id: '2', name: "VPD MEDI INDIA PRIVATE LIMITED", address: "2, GANDHIKUNJ SOCIETY,, NR.KOCH...", amount: "₹27878.00", 
    mixedCase: false,
    totals: { amount: "₹27,878", received: "₹0", balance: "₹27,878" },
    invoices: [
      { id: "#26/SZ/29401", balance: "₹15,487", date: "26/07/26", total: "₹15,487", received: "₹0" },
      { id: "#26/SZ/29402", balance: "₹12,391", date: "26/07/26", total: "₹12,391", received: "₹0" }
    ]
  },
  { id: '3', name: "AAJKRUPA PHARMA & SPECIALITY", address: "cellar floor 4,vaibhav complex under ...", amount: "₹1745139.00", mixedCase: false, invoices: [], totals: { amount: "₹1,745,139", received: "₹0", balance: "₹1,745,139" } },
  { id: '4', name: "ALPHA MEDICAL", address: "0", amount: "₹207319.00", mixedCase: false, invoices: [], totals: { amount: "₹207,319", received: "₹0", balance: "₹207,319" } },
  { id: '5', name: "Abhay pharma", address: "0", amount: "₹1147229.00", mixedCase: true, invoices: [], totals: { amount: "₹1,147,229", received: "₹0", balance: "₹1,147,229" } },
  { id: '6', name: "A TO Z PHARMA", address: "0", amount: "₹301632.00", mixedCase: false, invoices: [], totals: { amount: "₹301,632", received: "₹0", balance: "₹301,632" } },
  { id: '7', name: "CHIMANLAL SONS MEDICARE PRODUCTS PVT LTD", address: "Unit No 102, Tanvi Daimoda Industry, N...", amount: "₹32310.00", mixedCase: false, invoices: [], totals: { amount: "₹32,310", received: "₹0", balance: "₹32,310" } },
  { id: '8', name: "DESAI PHARMA", address: "21", amount: "₹3699970.00", mixedCase: false, invoices: [], totals: { amount: "₹3,699,970", received: "₹0", balance: "₹3,699,970" } }
];

export default function OutstandingsScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeDistributor, setActiveDistributor] = useState<any>(null);
  
  // Modal states
  const [isLoadingModalVisible, setLoadingModalVisible] = useState(false);
  const [isOrderModalVisible, setOrderModalVisible] = useState(false);
  
  // Toolbar states
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [selectedInvoices, setSelectedInvoices] = useState<Record<string, boolean>>({});
  const [selectAll, setSelectAll] = useState(false);

  // Animation for spinner
  const spinValue = new Animated.Value(0);

  useEffect(() => {
    Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 1200,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });

  const filteredDistributors = MOCK_DISTRIBUTORS.filter(d => 
    d.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    d.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCardPress = (distributor: any) => {
    setActiveDistributor(distributor);
    setLoadingModalVisible(true);
    
    // Simulate network delay then open order details
    setTimeout(() => {
      setLoadingModalVisible(false);
      setOrderModalVisible(true);
    }, 1200);
  };

  const handleCloseAll = () => {
    setLoadingModalVisible(false);
    setOrderModalVisible(false);
    setSelectAll(false);
    setSelectedInvoices({});
  };

  const toggleSelectAll = () => {
    const newState = !selectAll;
    setSelectAll(newState);
    if (activeDistributor) {
      const newSelections: Record<string, boolean> = {};
      activeDistributor.invoices.forEach((inv: any) => {
        newSelections[inv.id] = newState;
      });
      setSelectedInvoices(newSelections);
    }
  };

  const toggleInvoiceSelect = (id: string) => {
    setSelectedInvoices(prev => {
      const newState = { ...prev, [id]: !prev[id] };
      // Check if all are now selected
      const allSelected = activeDistributor?.invoices.every((inv: any) => newState[inv.id]);
      setSelectAll(!!allSelected);
      return newState;
    });
  };

  const renderDistributorCard = ({ item }: { item: typeof MOCK_DISTRIBUTORS[0] }) => (
    <TouchableOpacity 
      style={styles.distributorCard} 
      activeOpacity={0.7}
      onPress={() => handleCardPress(item)}
    >
      <View style={styles.cardLeft}>
        <Text style={[styles.companyName, item.mixedCase && styles.companyNameMixed]}>
          {item.name}
        </Text>
        <View style={styles.addressLine}>
          <Feather name="map-pin" size={14} color={colors.textSlate} />
          <Text style={styles.addressText} numberOfLines={1}>{item.address}</Text>
        </View>
      </View>
      <View style={styles.cardRight}>
        <Text style={styles.amount}>{item.amount}</Text>
        <View style={styles.chevronWrap}>
          <Feather name="chevron-right" size={16} color={colors.secondaryTerracotta} />
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderInvoiceItem = ({ item }: { item: any }) => (
    <View style={styles.invoiceCard}>
      <View style={styles.invoiceHead}>
        <View style={styles.invoiceHeadLeft}>
          <TouchableOpacity 
            style={[styles.checkbox, selectedInvoices[item.id] && styles.checkboxChecked]}
            onPress={() => toggleInvoiceSelect(item.id)}
            activeOpacity={0.8}
          >
            {selectedInvoices[item.id] && <Feather name="check" size={12} color={colors.white} />}
          </TouchableOpacity>
          <Text style={styles.invoiceId}>{item.id}</Text>
        </View>
        <Text style={styles.invoiceAmount}>{item.balance}</Text>
      </View>

      <View style={styles.invoiceGrid}>
        <View style={styles.gridColumn}>
          <View style={styles.gridLabelRow}>
            <Feather name="calendar" size={12} color={colors.textSlate} />
            <Text style={styles.gridLabelText}>Inv Date</Text>
          </View>
          <Text style={styles.gridValue}>{item.date}</Text>
        </View>
        <View style={styles.gridColumnCenter}>
          <Text style={styles.gridLabelText}>Total Amt</Text>
          <Text style={styles.gridValue}>{item.total}</Text>
        </View>
        <View style={styles.gridColumnRight}>
          <Text style={styles.gridLabelText}>Received</Text>
          <Text style={styles.gridValueRight}>{item.received}</Text>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* HEADER */}
      <View style={styles.appHeader}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Feather name="chevron-left" size={18} color={colors.forestDark} style={{ marginLeft: -2 }} />
        </TouchableOpacity>
        <Text style={styles.appTitle}>Outstandings</Text>
      </View>

      {/* SEARCH BAR */}
      <View style={styles.searchBarContainer}>
        <View style={styles.searchInputWrap}>
          <Feather name="search" size={18} color={colors.primaryForest} />
          <TextInput 
            style={styles.searchInput}
            placeholder="Search distributor here"
            placeholderTextColor={colors.textSlate}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* DISTRIBUTOR LIST */}
      <View style={styles.mainContent}>
        <FlatList
          data={filteredDistributors}
          keyExtractor={item => item.id}
          renderItem={renderDistributorCard}
          contentContainerStyle={styles.listPadding}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={{ fontFamily: 'Inter_400Regular', color: colors.textSlate }}>No distributor found</Text>
            </View>
          }
        />
      </View>

      {/* 1. LOADING MODAL */}
      <Modal visible={isLoadingModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          {/* Header replica to blend with overlay */}
          <SafeAreaView style={{ flex: 1 }}>
            <View style={styles.modalHeaderReplica}>
              <View style={[styles.backBtn, { borderColor: colors.white }]}>
                <Feather name="chevron-left" size={18} color={colors.white} style={{ marginLeft: -2 }} />
              </View>
              <Text style={[styles.appTitle, { color: colors.white }]}>Outstandings</Text>
            </View>
            <View style={styles.searchBarContainerReplica}>
              <View style={styles.searchInputWrapReplica}>
                <Feather name="search" size={18} color={colors.white} />
                <Text style={styles.searchInputReplica}>Search distributor here</Text>
              </View>
            </View>

            {/* White Sheet */}
            <View style={styles.modalSheet}>
              <View style={styles.sheetHeader}>
                <Text style={styles.sheetDistributorName}>{activeDistributor?.name}</Text>
                <TouchableOpacity style={styles.sheetCloseBtn} onPress={handleCloseAll}>
                  <Feather name="x" size={16} color={colors.secondaryTerracotta} />
                </TouchableOpacity>
              </View>
              
              <View style={styles.spinnerArea}>
                <Animated.View style={{ transform: [{ rotate: spin }] }}>
                  <View style={styles.customSpinner}>
                    {[...Array(12)].map((_, i) => (
                      <View 
                        key={i} 
                        style={[
                          styles.spinnerDot, 
                          { transform: [{ rotate: `${i * 30}deg` }, { translateY: -16 }] }
                        ]} 
                      />
                    ))}
                  </View>
                </Animated.View>
              </View>
            </View>
          </SafeAreaView>
        </View>
      </Modal>

      {/* 2. ORDER DETAILS MODAL */}
      <Modal visible={isOrderModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <SafeAreaView style={{ flex: 1 }}>
            {/* Header replica */}
            <View style={styles.modalHeaderReplica}>
              <TouchableOpacity style={[styles.backBtn, { borderColor: colors.white }]} onPress={handleCloseAll}>
                <Feather name="chevron-left" size={18} color={colors.white} style={{ marginLeft: -2 }} />
              </TouchableOpacity>
              <Text style={[styles.appTitle, { color: colors.white }]}>Outstandings</Text>
            </View>
            <View style={styles.searchBarContainerReplica}>
              <View style={styles.searchInputWrapReplica}>
                <Feather name="search" size={18} color={colors.white} />
                <Text style={styles.searchInputReplica}>Search distributor here</Text>
              </View>
            </View>

            {/* White Sheet */}
            <View style={styles.orderSheet}>
              <View style={styles.orderSheetHeader}>
                <Text style={styles.sheetDistributorName}>{activeDistributor?.name}</Text>
                <TouchableOpacity style={styles.sheetCloseBtn} onPress={handleCloseAll}>
                  <Feather name="x" size={16} color={colors.secondaryTerracotta} />
                </TouchableOpacity>
              </View>

              {/* Toolbar */}
              <View style={styles.orderToolbar}>
                <View style={styles.toolbarLeft}>
                  <TouchableOpacity 
                    style={[styles.checkbox, selectAll && styles.checkboxChecked]}
                    onPress={toggleSelectAll}
                    activeOpacity={0.8}
                  >
                    {selectAll && <Feather name="check" size={12} color={colors.white} />}
                  </TouchableOpacity>
                  <Text style={styles.toolbarSelectText}>Select</Text>
                </View>
                
                <View style={styles.toolbarDivider} />
                
                <View style={styles.toolbarRight}>
                  <Text style={styles.sortByLabel}>Sort by:</Text>
                  
                  <TouchableOpacity style={styles.sortOption} onPress={() => setSortOrder('newest')} activeOpacity={0.8}>
                    <View style={[styles.radio, sortOrder === 'newest' && styles.radioActive]}>
                      {sortOrder === 'newest' && <View style={styles.radioInner} />}
                    </View>
                    <Text style={[styles.sortLabel, sortOrder === 'newest' && styles.sortLabelActive]}>Newest</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity style={styles.sortOption} onPress={() => setSortOrder('oldest')} activeOpacity={0.8}>
                    <View style={[styles.radio, sortOrder === 'oldest' && styles.radioActive]}>
                      {sortOrder === 'oldest' && <View style={styles.radioInner} />}
                    </View>
                    <Text style={[styles.sortLabel, sortOrder === 'oldest' && styles.sortLabelActive]}>Oldest</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Invoice List */}
              <View style={styles.invoiceListContainer}>
                {activeDistributor?.invoices?.length === 0 ? (
                  <View style={[styles.emptyState, { paddingTop: 40 }]}>
                    <Text style={{ fontFamily: 'Inter_400Regular', color: colors.textSlate }}>
                      No invoices found for this distributor.
                    </Text>
                  </View>
                ) : (
                  <FlatList
                    data={activeDistributor?.invoices || []}
                    keyExtractor={(item) => item.id}
                    renderItem={renderInvoiceItem}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ padding: 12, paddingBottom: 24 }}
                    ListFooterComponent={
                      <View style={styles.invoiceSummary}>
                        <View style={styles.summaryCol}>
                          <Text style={styles.summaryLabel}>Total Amount</Text>
                          <Text style={styles.summaryValue}>{activeDistributor?.totals.amount}</Text>
                        </View>
                        <View style={styles.summaryCol}>
                          <Text style={styles.summaryLabel}>Total Received</Text>
                          <Text style={styles.summaryValue}>{activeDistributor?.totals.received}</Text>
                        </View>
                        <View style={styles.summaryCol}>
                          <Text style={styles.summaryLabel}>Total Balance</Text>
                          <Text style={styles.summaryValue}>{activeDistributor?.totals.balance}</Text>
                        </View>
                      </View>
                    }
                  />
                )}
              </View>
            </View>
          </SafeAreaView>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.backgroundOffWhite,
  },
  // --- Header ---
  appHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 8,
    backgroundColor: colors.white,
    gap: 14,
  },
  backBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: colors.forestDark,
    justifyContent: 'center',
    alignItems: 'center',
  },
  appTitle: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 22,
    color: colors.textDark, // Re-using as textPrimary
    letterSpacing: -0.3,
  },
  
  // --- Search Bar ---
  searchBarContainer: {
    backgroundColor: colors.white,
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 12,
  },
  searchInputWrap: {
    backgroundColor: colors.white,
    borderRadius: 10,
    paddingVertical: 11,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: colors.borderLight, // Optional subtle border for light mode
  },
  searchInput: {
    flex: 1,
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    color: colors.textDark,
  },

  // --- List ---
  mainContent: {
    flex: 1,
    backgroundColor: colors.backgroundOffWhite,
  },
  listPadding: {
    paddingTop: 4,
    paddingHorizontal: 12,
    paddingBottom: 100,
  },
  distributorCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  cardLeft: {
    flex: 1,
    paddingRight: 12,
  },
  companyName: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 15,
    color: colors.textDark,
    lineHeight: 20,
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  companyNameMixed: {
    textTransform: 'none',
  },
  addressLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  addressText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: colors.textSlate,
    lineHeight: 18,
    flex: 1,
  },
  cardRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingTop: 2,
  },
  amount: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 15,
    color: colors.secondaryTerracotta,
  },
  chevronWrap: {
    width: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 60,
  },

  // --- Modals ---
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(20, 47, 35, 0.55)', // forestDark 55%
  },
  modalHeaderReplica: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 8,
    gap: 14,
  },
  searchBarContainerReplica: {
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 12,
  },
  searchInputWrapReplica: {
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: colors.neutralForestTint,
  },
  searchInputReplica: {
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.7)',
  },

  // Base Modal Sheet
  modalSheet: {
    flex: 1,
    backgroundColor: colors.white,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    marginTop: 4,
    paddingTop: 20,
    paddingHorizontal: 18,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 8,
  },
  sheetDistributorName: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 17,
    color: colors.forestDark, // from colors.ts, same as textPrimary essentially
    lineHeight: 22,
    textTransform: 'uppercase',
    flex: 1,
    paddingTop: 2,
  },
  sheetCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: colors.secondaryTerracotta,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Loading Spinner specific
  spinnerArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 80,
  },
  customSpinner: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  spinnerDot: {
    position: 'absolute',
    width: 8,
    height: 8,
    backgroundColor: colors.primaryForest,
    borderRadius: 4,
  },

  // Order Details Modal specific
  orderSheet: {
    flex: 1,
    backgroundColor: colors.white,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    marginTop: 4,
  },
  orderSheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
    paddingTop: 18,
    paddingHorizontal: 18,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutralForestTint,
  },
  orderToolbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutralForestTint,
    backgroundColor: colors.white,
  },
  toolbarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: colors.neutralForestTint,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: colors.primaryForest,
    borderColor: colors.primaryForest,
  },
  toolbarSelectText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: colors.forestDark,
  },
  toolbarDivider: {
    width: 1,
    height: 16,
    backgroundColor: colors.neutralForestTint,
    marginHorizontal: 8,
  },
  toolbarRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  sortByLabel: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: colors.textSlate,
  },
  sortOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  radio: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: colors.neutralForestTint,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioActive: {
    borderColor: colors.primaryForest,
    backgroundColor: colors.primaryForest,
  },
  radioInner: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.white,
  },
  sortLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    color: colors.textSlate,
  },
  sortLabelActive: {
    fontFamily: 'Inter_600SemiBold',
    color: colors.forestDark,
  },
  
  // Invoices List
  invoiceListContainer: {
    flex: 1,
    backgroundColor: colors.backgroundOffWhite,
  },
  invoiceCard: {
    backgroundColor: colors.white,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  invoiceHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  invoiceHeadLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  invoiceId: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 15,
    color: colors.forestDark,
  },
  invoiceAmount: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 15,
    color: colors.secondaryTerracotta,
  },
  invoiceGrid: {
    flexDirection: 'row',
    paddingLeft: 28, // Align past the checkbox
  },
  gridColumn: {
    flex: 1,
  },
  gridColumnCenter: {
    flex: 1,
  },
  gridColumnRight: {
    flex: 1,
    alignItems: 'flex-end',
  },
  gridLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  gridLabelText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: colors.textSlate,
    marginBottom: 2,
  },
  gridValue: {
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    color: colors.forestDark,
  },
  gridValueRight: {
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    color: colors.forestDark,
    textAlign: 'right',
  },

  // Summary Footer
  invoiceSummary: {
    backgroundColor: colors.white,
    borderRadius: 10,
    padding: 14,
    marginTop: 4,
    flexDirection: 'row',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  summaryCol: {
    alignItems: 'center',
  },
  summaryLabel: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: colors.textSlate,
    marginBottom: 4,
  },
  summaryValue: {
    fontFamily: 'Inter_700Bold',
    fontSize: 15,
    color: colors.forestDark,
  },
});
