import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const colors = {
  forest: '#1E4D3A',
  forestTint: '#DCE8E1',
  terracotta: '#B85042',
  gold: '#D9A441',
  pageBg: '#F6F8FA',
  border: '#E4E9EE',
  text: '#16232F',
  text2: '#5B6B7C',
  white: '#FFFFFF',
};

const Checkbox = () => (
  <View style={styles.checkbox}>
    <Svg width="12" height="12" viewBox="0 0 24 24" fill="none">
      <Path 
        d="M4 12.5L9.5 18L20 6" 
        stroke="#fff" 
        strokeWidth="3" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
      />
    </Svg>
  </View>
);

export default function CartScreen() {
  const insets = useSafeAreaInsets();
  
  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: 0 }]}>
      
      {/* 3.2 Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity style={styles.backBtn} activeOpacity={0.7}>
            <Svg width="15" height="15" viewBox="0 0 24 24" fill="none">
              <Path 
                d="M19 12H5M5 12L12 19M5 12L12 5" 
                stroke="#333" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
              />
            </Svg>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Cart</Text>
        </View>
        <TouchableOpacity activeOpacity={0.7}>
          <Text style={styles.clearCartText}>Clear Cart</Text>
        </TouchableOpacity>
      </View>

      {/* 3.3 Grey band */}
      <View style={styles.greyBand}>
        <ScrollView 
          contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
        >
          {/* 3.3.1 "Select All" row */}
          <View style={styles.selectAllRow}>
            <View style={styles.rowLeft}>
              <Checkbox />
              <Text style={styles.selectAllText}>Select All</Text>
            </View>
            <View style={styles.rowRight}>
              <Text style={styles.collapseText}>Collapse All</Text>
              <Svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                <Path 
                  d="M5 15L12 8L19 15" 
                  stroke={colors.terracotta} 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                />
              </Svg>
            </View>
          </View>

          {/* 3.3.2 Distributor card */}
          <View style={styles.card}>
            {/* Card header row */}
            <View style={styles.cardHeader}>
              <View style={styles.rowLeft}>
                <Checkbox />
                <Text style={styles.distributorName}>Abhay pharma</Text>
                <Svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                  <Path 
                    d="M5 15L12 8L19 15" 
                    stroke={colors.terracotta} 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                  />
                </Svg>
              </View>
              <TouchableOpacity activeOpacity={0.7}>
                <Svg width="19" height="19" viewBox="0 0 24 24" fill="none">
                  <Path 
                    d="M10 3.5 Q10 2.5 11 2.5 L13 2.5 Q14 2.5 14 3.5 M7.5 6.5 L8.3 19 Q8.4 20 9.4 20 L14.6 20 Q15.6 20 15.7 19 L16.5 6.5 M6.5 6.5 H17.5" 
                    stroke={colors.text2} 
                    strokeWidth="1.6" 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                  />
                </Svg>
              </TouchableOpacity>
            </View>

            {/* Card sub row */}
            <View style={styles.cardSubRow}>
              <View style={styles.subRowLeft}>
                <Text style={styles.itemCountText}>1 Item</Text>
                <TouchableOpacity style={styles.addMoreBtn} activeOpacity={0.8}>
                  <Text style={styles.addMoreText}>+ Add more items</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.cardTotal}>₹576.27</Text>
            </View>

            {/* Divider */}
            <View style={styles.divider} />

            {/* Remarks box */}
            <View style={styles.remarksWrapper}>
              <View style={styles.remarksBox}>
                <Text style={styles.remarksText}>Remarks</Text>
              </View>
            </View>

            {/* Item row */}
            <View style={styles.itemRow}>
              {/* Top line */}
              <View style={styles.itemTopLine}>
                <View style={styles.rowLeft}>
                  <Checkbox />
                  <Text style={styles.itemName}>Anablast hair serum(small)</Text>
                </View>
                <TouchableOpacity activeOpacity={0.7}>
                  <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <Circle cx="12" cy="12" r="9.5" stroke={colors.terracotta} strokeWidth="1.5" />
                    <Path d="M9 9L15 15M15 9L9 15" stroke={colors.terracotta} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </Svg>
                </TouchableOpacity>
              </View>
              
              {/* Price line */}
              <View style={styles.priceLine}>
                <Text style={styles.priceLabel}>PTR: <Text style={styles.priceValue}>576.27</Text></Text>
                <Text style={styles.priceLabel}>MRP: <Text style={styles.priceValue}>₹850.00</Text></Text>
                
                <View style={styles.stockWrapper}>
                  <Svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <Path d="M12 3 L20 7.5 V16.5 L12 21 L4 16.5 V7.5 Z M4 7.5 L12 12 L20 7.5 M12 12 V21" stroke={colors.forest} strokeWidth="1.6" strokeLinejoin="round" />
                  </Svg>
                  <Text style={styles.stockCount}>2</Text>
                </View>
              </View>

              {/* Bottom line */}
              <View style={styles.bottomLine}>
                <View style={styles.qtyBox}>
                  <Text style={styles.qtyText}>1</Text>
                </View>
                <Text style={styles.lineTotal}>₹ 576.27</Text>
              </View>
            </View>
          </View>
          
          <View style={{ flex: 1 }} />
        </ScrollView>
        
        {/* 3.4 Footer card */}
        <View style={styles.footerCard}>
          <Text style={styles.footerInfo}>1 item • 1 Distributor</Text>
          
          <View style={styles.totalBar}>
            <View style={styles.totalBox}>
              <Text style={styles.totalLabel}>Total:</Text>
              <View style={styles.amountRow}>
                <View style={styles.rupeeBadge}>
                  <Text style={styles.rupeeText}>₹</Text>
                </View>
                <Text style={styles.totalValue}>576.27</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.placeOrderBtn} activeOpacity={0.8}>
              <Text style={styles.placeOrderText}>Place Order</Text>
            </TouchableOpacity>
          </View>
        </View>

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white, // Behind the header
  },
  
  // --- Checkbox Spec ---
  checkbox: {
    width: 20,
    height: 20,
    backgroundColor: colors.forest,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // --- 3.2 Header ---
  header: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.white,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  backBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1.5,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 21,
    color: colors.text,
    letterSpacing: -0.3,
  },
  clearCartText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 14.5,
    color: colors.text2,
  },

  // --- 3.3 Grey band ---
  greyBand: {
    flex: 1,
    backgroundColor: colors.pageBg,
    paddingTop: 14,
    paddingHorizontal: 14,
    // paddingBottom: 22, (Applied generally, but footer sits inside here)
  },

  // --- 3.3.1 Select All Row ---
  selectAllRow: {
    paddingTop: 2,
    paddingHorizontal: 4,
    paddingBottom: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },
  selectAllText: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 15,
    color: colors.text,
  },
  rowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  collapseText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 14,
    color: colors.text2,
  },

  // --- 3.3.2 Distributor card ---
  card: {
    backgroundColor: colors.white,
    borderRadius: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 3,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  cardHeader: {
    paddingTop: 14,
    paddingHorizontal: 14,
    paddingBottom: 4,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  distributorName: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 16,
    color: colors.text,
  },
  
  cardSubRow: {
    paddingTop: 10,
    paddingHorizontal: 14,
    paddingBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  subRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12, // Implicit gap from the layout
  },
  itemCountText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 14.5,
    color: colors.text2,
    marginRight: 10,
  },
  addMoreBtn: {
    borderWidth: 1.3,
    borderColor: colors.gold,
    backgroundColor: '#FBF1DF',
    borderRadius: 20,
    paddingVertical: 7,
    paddingHorizontal: 14,
  },
  addMoreText: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 13.5,
    color: '#A67527',
  },
  cardTotal: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 15,
    color: colors.text,
  },

  divider: {
    height: 1,
    backgroundColor: colors.border,
    width: '100%',
  },

  remarksWrapper: {
    padding: 14,
  },
  remarksBox: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingVertical: 13,
    paddingHorizontal: 14,
  },
  remarksText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 14.5,
    color: colors.text2,
  },

  itemRow: {
    paddingTop: 2,
    paddingHorizontal: 14,
    paddingBottom: 16,
  },
  itemTopLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  itemName: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 15,
    color: colors.text,
  },
  priceLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 12,
  },
  priceLabel: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 13.5,
    color: colors.text2,
  },
  priceValue: {
    fontFamily: 'Poppins_600SemiBold',
    color: colors.text,
  },
  stockWrapper: {
    marginLeft: 'auto',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  stockCount: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 14,
    color: colors.forest,
  },
  bottomLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  qtyBox: {
    backgroundColor: colors.forestTint,
    borderWidth: 1.3,
    borderColor: colors.forest,
    borderRadius: 8,
    paddingVertical: 9,
    paddingHorizontal: 22,
  },
  qtyText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 14.5,
    color: colors.text,
  },
  lineTotal: {
    marginLeft: 'auto',
    fontFamily: 'Poppins_500Medium',
    fontSize: 14.5,
    color: colors.text,
  },

  // --- 3.4 Footer Card ---
  footerCard: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
    marginTop: 8,
    // Negative margin to bleed to the edges of the grey band
    marginHorizontal: -14, 
    marginBottom: 0, // removed negative margin so it doesn't bleed under the tab bar
  },
  footerInfo: {
    paddingTop: 14,
    paddingHorizontal: 16,
    paddingBottom: 12,
    fontFamily: 'Poppins_400Regular',
    fontSize: 14,
    color: colors.text2,
  },
  totalBar: {
    flexDirection: 'row',
    alignItems: 'stretch',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 8,
    overflow: 'hidden',
  },
  totalBox: {
    flex: 1,
    backgroundColor: colors.forestTint,
    paddingVertical: 8,
    paddingHorizontal: 12,
    justifyContent: 'center',
  },
  totalLabel: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 9.5,
    color: colors.text2,
    marginBottom: 2,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  rupeeBadge: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.text,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rupeeText: {
    fontFamily: 'Poppins_700Bold', // bold needed for the badge
    fontSize: 7,
    color: colors.white,
    marginTop: Platform.OS === 'ios' ? 1 : 0, // tiny vertical align fix for native fonts
  },
  totalValue: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 11.5,
    color: colors.text,
  },
  placeOrderBtn: {
    flex: 1.3,
    backgroundColor: colors.forest,
    paddingVertical: 8,
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeOrderText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 10.5,
    color: colors.white,
  },
});
