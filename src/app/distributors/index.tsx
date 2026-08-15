import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, SafeAreaView, ActivityIndicator, Alert, Share as RNShare } from 'react-native';
import { useRouter } from 'expo-router';
import { Search, GripVertical, Plus, Share, ChevronUp, ChevronDown, ArrowLeft } from 'lucide-react-native';
import { useMyDistributorsStore, MyDistributor } from '@/store/myDistributorsStore';

export default function MyDistributorsScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'mapped' | 'non-mapped' | 'refer'>('mapped');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [referralName, setReferralName] = useState('');
  const [referralPhone, setReferralPhone] = useState('');

  const {
    mappedDistributors,
    nonMappedDistributors,
    isLoading,
    fetchMapped,
    fetchNonMapped,
    reorderMapped,
    requestConnection,
    referDistributor,
    setMappedLocally
  } = useMyDistributorsStore();

  useEffect(() => {
    fetchMapped();
    fetchNonMapped();
  }, []);

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const newList = [...mappedDistributors];
    const temp = newList[index - 1];
    newList[index - 1] = newList[index];
    newList[index] = temp;
    setMappedLocally(newList);
    reorderMapped(newList.map(d => d.id));
  };

  const handleMoveDown = (index: number) => {
    if (index === mappedDistributors.length - 1) return;
    const newList = [...mappedDistributors];
    const temp = newList[index + 1];
    newList[index + 1] = newList[index];
    newList[index] = temp;
    setMappedLocally(newList);
    reorderMapped(newList.map(d => d.id));
  };

  const handleConnect = async (distributorId: string) => {
    const { success } = await requestConnection(distributorId);
    if (success) {
      Alert.alert('Success', 'Connection request sent successfully!');
    }
  };

  const handleRefer = async () => {
    if (!referralName || !referralPhone) {
      Alert.alert('Error', 'Please fill in both fields');
      return;
    }
    const { success } = await referDistributor({ name: referralName, phone: referralPhone });
    if (success) {
      Alert.alert('Success', 'Referral submitted!');
      setReferralName('');
      setReferralPhone('');
    }
  };

  const handleShareApp = async () => {
    try {
      await RNShare.share({
        message: 'Join MedConnect to streamline your pharma distribution network! Download the app here: https://medconnect.app',
      });
    } catch (error: any) {
      console.log(error.message);
    }
  };

  const renderMappedItem = ({ item, index }: { item: MyDistributor, index: number }) => (
    <View style={styles.listItem}>
      <View style={styles.numberContainer}>
        <Text style={styles.numberText}>{index + 1}</Text>
      </View>
      <View style={styles.itemDetails}>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemSubtitle}>{item.contact}</Text>
      </View>
      <View style={styles.reorderControls}>
        <TouchableOpacity onPress={() => handleMoveUp(index)} disabled={index === 0}>
          <ChevronUp color={index === 0 ? '#ccc' : '#0F9B8E'} size={24} />
        </TouchableOpacity>
        <GripVertical color="#999" size={20} style={{ marginVertical: 4 }} />
        <TouchableOpacity onPress={() => handleMoveDown(index)} disabled={index === mappedDistributors.length - 1}>
          <ChevronDown color={index === mappedDistributors.length - 1 ? '#ccc' : '#0F9B8E'} size={24} />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderNonMappedItem = ({ item }: { item: MyDistributor }) => (
    <View style={styles.listItem}>
      <View style={styles.itemDetails}>
        <Text style={styles.itemName}>{item.name}</Text>
      </View>
      <TouchableOpacity style={styles.connectButton} onPress={() => handleConnect(item.id)}>
        <Plus color="#0F9B8E" size={16} style={{ marginRight: 4 }} />
        <Text style={styles.connectButtonText}>Connect</Text>
      </TouchableOpacity>
    </View>
  );

  const filteredMapped = mappedDistributors.filter(d => d.name.toLowerCase().includes(searchQuery.toLowerCase()));
  const filteredNonMapped = nonMappedDistributors.filter(d => d.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft color="#1F2937" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Distributors</Text>
        <TouchableOpacity>
          <Text style={styles.resetLink}>Reset</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.container}>
        {/* Inner Tabs */}
        <View style={styles.tabContainer}>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'mapped' && styles.tabActive]}
            onPress={() => setActiveTab('mapped')}
          >
            <Text style={[styles.tabText, activeTab === 'mapped' && styles.tabTextActive]}>Mapped</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'non-mapped' && styles.tabActive]}
            onPress={() => setActiveTab('non-mapped')}
          >
            <Text style={[styles.tabText, activeTab === 'non-mapped' && styles.tabTextActive]}>Non-Mapped</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'refer' && styles.tabActive]}
            onPress={() => setActiveTab('refer')}
          >
            <Text style={[styles.tabText, activeTab === 'refer' && styles.tabTextActive]}>Refer</Text>
          </TouchableOpacity>
        </View>

        {/* Search Bar (Hide on Refer Tab) */}
        {activeTab !== 'refer' && (
          <View style={styles.searchContainer}>
            <Search color="#999" size={20} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search distributor name..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#999"
            />
          </View>
        )}

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#0F9B8E" />
          </View>
        ) : (
          <>
            {activeTab === 'mapped' && (
              <FlatList
                data={filteredMapped}
                keyExtractor={(item) => item.id}
                renderItem={renderMappedItem}
                contentContainerStyle={styles.listContainer}
                ListEmptyComponent={<Text style={styles.emptyText}>No mapped distributors found.</Text>}
              />
            )}

            {activeTab === 'non-mapped' && (
              <FlatList
                data={filteredNonMapped}
                keyExtractor={(item) => item.id}
                renderItem={renderNonMappedItem}
                contentContainerStyle={styles.listContainer}
                ListEmptyComponent={<Text style={styles.emptyText}>No non-mapped distributors found.</Text>}
              />
            )}

            {activeTab === 'refer' && (
              <View style={styles.referContainer}>
                <Text style={styles.referTitle}>Refer a Distributor</Text>
                <Text style={styles.referSubtitle}>Can't find your distributor? Invite them to MedConnect.</Text>
                
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Distributor / Contact Name *</Text>
                  <TextInput
                    style={styles.input}
                    value={referralName}
                    onChangeText={setReferralName}
                    placeholder="Enter name"
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>Mobile Number *</Text>
                  <TextInput
                    style={styles.input}
                    value={referralPhone}
                    onChangeText={setReferralPhone}
                    keyboardType="phone-pad"
                    placeholder="Enter 10-digit number"
                  />
                </View>

                <TouchableOpacity style={styles.submitButton} onPress={handleRefer}>
                  <Text style={styles.submitButtonText}>Submit Referral</Text>
                </TouchableOpacity>

                <View style={styles.dividerContainer}>
                  <View style={styles.divider} />
                  <Text style={styles.dividerText}>OR</Text>
                  <View style={styles.divider} />
                </View>

                <TouchableOpacity style={styles.shareButton} onPress={handleShareApp}>
                  <Share color="#fff" size={20} style={{ marginRight: 8 }} />
                  <Text style={styles.shareButtonText}>Share Invite Link</Text>
                </TouchableOpacity>
              </View>
            )}
          </>
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
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20, fontFamily: 'Inter_400Regular',
    fontFamily: 'Inter_700Bold', fontWeight: 'bold',
    color: '#1F2937',
  },
  resetLink: {
    fontSize: 16, fontFamily: 'Inter_400Regular',
    color: '#0F9B8E',
    fontFamily: 'Inter_500Medium', fontWeight: '500',
  },
  container: {
    flex: 1,
    paddingTop: 16,
  },
    marginBottom: 16,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: '#0F9B8E',
  },
  tabText: {
    fontSize: 14, fontFamily: 'Inter_400Regular',
    fontFamily: 'Inter_600SemiBold', fontWeight: '600',
    color: '#666',
  },
  tabTextActive: {
    color: '#0F9B8E',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 16,
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
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#eee',
  },
  numberContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#E0F2F1',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  numberText: {
    color: '#0F9B8E',
    fontFamily: 'Inter_700Bold', fontWeight: 'bold',
    fontSize: 14, fontFamily: 'Inter_400Regular',
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 16, fontFamily: 'Inter_400Regular',
    fontFamily: 'Inter_600SemiBold', fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  itemSubtitle: {
    fontSize: 13, fontFamily: 'Inter_400Regular',
    color: '#666',
  },
  reorderControls: {
    alignItems: 'center',
    paddingLeft: 12,
    borderLeftWidth: 1,
    borderLeftColor: '#f0f0f0',
  },
  connectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#0F9B8E',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  connectButtonText: {
    color: '#0F9B8E',
    fontFamily: 'Inter_600SemiBold', fontWeight: '600',
    fontSize: 14, fontFamily: 'Inter_400Regular',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    marginTop: 40,
    fontSize: 15, fontFamily: 'Inter_400Regular',
  },
  referContainer: {
    padding: 16,
  },
  referTitle: {
    fontSize: 20, fontFamily: 'Inter_400Regular',
    fontFamily: 'Inter_700Bold', fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  referSubtitle: {
    fontSize: 14, fontFamily: 'Inter_400Regular',
    color: '#666',
    marginBottom: 24,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14, fontFamily: 'Inter_400Regular',
    color: '#1F2937',
    marginBottom: 8,
    fontFamily: 'Inter_500Medium', fontWeight: '500',
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    height: 50,
    paddingHorizontal: 16,
    fontSize: 15, fontFamily: 'Inter_400Regular',
  },
  submitButton: {
    backgroundColor: '#0F9B8E',
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16, fontFamily: 'Inter_400Regular',
    fontFamily: 'Inter_700Bold', fontWeight: 'bold',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#ddd',
  },
  dividerText: {
    marginHorizontal: 16,
    color: '#999',
    fontFamily: 'Inter_700Bold', fontWeight: 'bold',
  },
  shareButton: {
    flexDirection: 'row',
    backgroundColor: '#16A34A',
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  shareButtonText: {
    color: '#fff',
    fontSize: 16, fontFamily: 'Inter_400Regular',
    fontFamily: 'Inter_700Bold', fontWeight: 'bold',
  },
});
