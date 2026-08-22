import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, ActivityIndicator, Alert, Platform, StatusBar } from 'react-native';
import Toast from 'react-native-toast-message';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { colors } from '@/constants/colors';
import { useMyDistributorsStore, MyDistributor } from '@/store/myDistributorsStore';

// Row Components
const MappedRow = ({ item, index }: { item: MyDistributor, index: number }) => {
  const isIncomplete = !item.area || !item.city; // Using area and city to determine if complete

  return (
    <View style={[styles.rowContainer, isIncomplete && { opacity: 0.55 }]}>
      <View style={styles.leadingCircle}>
        <Text style={styles.leadingNumber}>{index + 1}</Text>
      </View>
      
      <View style={styles.rowMiddle}>
        <Text style={styles.bizName} numberOfLines={1}>{item.name}</Text>
        {!isIncomplete && (
          <View style={styles.locationLine}>
            <Feather name="map-pin" size={11} color={colors.textSlate} />
            <Text style={styles.locationText} numberOfLines={1}>
              {item.area && item.city ? `${item.area}, ${item.city}` : "Area, City"}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.trailingCircle}>
        <Feather name="move" size={18} color={colors.primaryForest} />
      </View>
    </View>
  );
};

const NonMappedRow = ({ item, isToggled, onToggle }: { item: MyDistributor, isToggled: boolean, onToggle: () => void }) => {
  return (
    <View style={styles.rowContainer}>
      <View style={styles.leadingCircle}>
        <Feather name="briefcase" size={16} color={colors.primaryForest} />
      </View>
      
      <View style={styles.rowMiddle}>
        <Text style={styles.bizName} numberOfLines={1}>{item.name}</Text>
        <View style={styles.locationLine}>
          <Feather name="map-pin" size={11} color={colors.textSlate} />
          <Text style={styles.locationText} numberOfLines={1}>
            {item.area && item.city ? `${item.area}, ${item.city}` : "Area, City"}
          </Text>
        </View>
      </View>

      <TouchableOpacity style={styles.trailingBtn} onPress={onToggle} activeOpacity={0.8}>
        {isToggled ? (
          <Feather name="clock" size={16} color={colors.white} />
        ) : (
          <Feather name="plus" size={16} color={colors.white} />
        )}
      </TouchableOpacity>
    </View>
  );
};

export default function MyDistributorsScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'mapped' | 'non-mapped'>('mapped');
  const [searchQuery, setSearchQuery] = useState('');
  const [toggledIds, setToggledIds] = useState<Set<string>>(new Set());

  const {
    mappedDistributors,
    nonMappedDistributors,
    isLoading,
    fetchMapped,
    fetchNonMapped,
    requestConnection
  } = useMyDistributorsStore();

  useEffect(() => {
    fetchMapped();
    fetchNonMapped();
  }, []);

  const handleToggle = async (id: string) => {
    // Optimistic UI update
    setToggledIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });

    // If we are toggling to "Pending" (clock), trigger the API
    if (!toggledIds.has(id)) {
      const { success, error } = await requestConnection(id);
      if (success) {
        Toast.show({ type: 'success', text1: 'Request Sent', text2: 'Connection request sent successfully!' });
      } else {
        Alert.alert('Error', error || 'Failed to send request');
        // Revert toggle on failure
        setToggledIds(prev => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
      }
    }
  };

  const filteredMapped = mappedDistributors.filter(d => d.name.toLowerCase().includes(searchQuery.toLowerCase()));
  const filteredNonMapped = nonMappedDistributors.filter(d => d.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* 4.1 Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Feather name="arrow-left" size={16} color={colors.textDark} />
          </TouchableOpacity>
          <Text style={styles.screenTitle}>My Distributors</Text>
        </View>
        <TouchableOpacity>
          <Text style={styles.resetLink}>Reset</Text>
        </TouchableOpacity>
      </View>

      {/* 4.2 Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity 
          style={styles.tab} 
          activeOpacity={0.8}
          onPress={() => setActiveTab('mapped')}
        >
          <Text style={[styles.tabLabel, activeTab === 'mapped' && styles.tabLabelActive]}>Mapped</Text>
          {activeTab === 'mapped' && <View style={styles.tabUnderline} />}
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.tab} 
          activeOpacity={0.8}
          onPress={() => setActiveTab('non-mapped')}
        >
          <Text style={[styles.tabLabel, activeTab === 'non-mapped' && styles.tabLabelActive]}>Non-Mapped</Text>
          {activeTab === 'non-mapped' && <View style={styles.tabUnderline} />}
        </TouchableOpacity>
      </View>

      {/* 4.3 Search Bar */}
      <View style={styles.searchWrapper}>
        <View style={styles.searchBar}>
          <Feather name="search" size={16} color={colors.textSlate} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name, area or city..."
            placeholderTextColor={colors.textSlate}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* 4.4 Row List Container */}
      <View style={styles.listContainer}>
        {isLoading ? (
          <ActivityIndicator size="large" color={colors.primaryForest} style={{ marginTop: 40 }} />
        ) : (
          <>
            {activeTab === 'mapped' && (
              <FlatList
                data={filteredMapped}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 100 }}
                ListHeaderComponent={
                  <Text style={styles.helperText}>Select and drag to reorder your priority list</Text>
                }
                ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
                renderItem={({ item, index }) => (
                  <MappedRow item={item} index={index} />
                )}
              />
            )}

            {activeTab === 'non-mapped' && (
              <FlatList
                data={filteredNonMapped}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 100 }}
                ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
                renderItem={({ item }) => (
                  <NonMappedRow 
                    item={item} 
                    isToggled={toggledIds.has(item.id)}
                    onToggle={() => handleToggle(item.id)}
                  />
                )}
              />
            )}
          </>
        )}
      </View>

      {/* 7. Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/(tabs)')}>
          <Feather name="home" size={22} color={colors.primaryForest} />
          <Text style={[styles.navLabel, styles.navLabelActive]}>Home</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/(tabs)/browse')}>
          <Feather name="compass" size={22} color={colors.textSlate} />
          <Text style={styles.navLabel}>Browse</Text>
        </TouchableOpacity>
        
        <View style={styles.fabContainer}>
          <TouchableOpacity style={styles.fab} onPress={() => router.push('/(tabs)/search')}>
            <Feather name="search" size={24} color={colors.white} />
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/(tabs)/orders')}>
          <Feather name="package" size={22} color={colors.textSlate} />
          <Text style={styles.navLabel}>Orders</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/(tabs)/cart')}>
          <Feather name="shopping-cart" size={22} color={colors.textSlate} />
          <Text style={styles.navLabel}>Cart</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.backgroundOffWhite,
  },
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.white,
    paddingTop: 14,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: colors.borderLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  screenTitle: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 19,
    color: colors.textDark,
  },
  resetLink: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: colors.primaryForest,
  },
  // Tabs
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
    width: '44%', // 72% - 28% = 44% width centered
    height: 2.5,
    backgroundColor: colors.primaryForest,
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
  },
  // Search
  searchWrapper: {
    paddingTop: 14,
    paddingHorizontal: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: 10,
    height: 44,
    paddingHorizontal: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: colors.textDark,
  },
  // List
  listContainer: {
    flex: 1,
    paddingTop: 14,
    paddingHorizontal: 16,
  },
  helperText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11.5,
    color: colors.textSlate,
    marginBottom: 4,
  },
  // Rows
  rowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: 12,
    padding: 12,
  },
  leadingCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.neutralForestTint,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  leadingNumber: {
    fontFamily: 'Inter_700Bold',
    fontSize: 13,
    color: colors.textDark,
  },
  rowMiddle: {
    flex: 1,
    justifyContent: 'center',
  },
  bizName: {
    fontFamily: 'Inter_700Bold',
    fontSize: 13.5,
    color: colors.textDark,
    marginBottom: 4,
  },
  locationLine: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: colors.textSlate,
    marginLeft: 4,
    flex: 1,
  },
  trailingCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.neutralForestTint,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  trailingBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primaryForest,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  // Bottom Nav
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
    paddingBottom: Platform.OS === 'ios' ? 15 : 0, // safe area padding
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
  navLabelActive: {
    fontFamily: 'Inter_600SemiBold',
    color: colors.primaryForest,
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
});
