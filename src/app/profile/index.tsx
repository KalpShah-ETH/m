import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, ActivityIndicator, Alert, Modal, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { User, Edit2, Clock, Truck, Wallet, Lock, Phone, FileText, ChevronRight, X } from 'lucide-react-native';
import { useAccountStore } from '@/store/accountStore';

export default function ProfileScreen() {
  const router = useRouter();
  const { profile, isLoading, fetchProfile, updateProfile } = useAccountStore();
  
  const [isEditModalVisible, setEditModalVisible] = useState(false);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleEditOpen = () => {
    if (profile) {
      setEditName(profile.name);
      setEditPhone(profile.phone);
      setEditModalVisible(true);
    }
  };

  const handleEditSave = async () => {
    if (!editName || !editPhone) {
      Alert.alert('Error', 'Name and phone cannot be empty');
      return;
    }
    const { success } = await updateProfile({ name: editName, phone: editPhone });
    if (success) {
      setEditModalVisible(false);
    }
  };

  const menuItems = [
    { id: 'orders', title: 'Order History', icon: <Clock color="#1F5B4E" size={24} />, route: '/orders' },
    { id: 'distributors', title: 'My Distributors', icon: <Truck color="#1F5B4E" size={24} />, route: '/distributors' },
    { id: 'outstandings', title: 'Outstandings', icon: <Wallet color="#1F5B4E" size={24} />, route: '/outstandings' },
  ];

  const supportItems = [
    { id: 'password', title: 'Change Password', icon: <Lock color="#666" size={24} />, action: () => Alert.alert('Change Password', 'Password change flow would open here') },
    { id: 'contact', title: 'Contact Us', icon: <Phone color="#666" size={24} />, action: () => Alert.alert('Contact Us', 'Support: support@medconnect.local\nPhone: +91 1800-123-4567') },
    { id: 'terms', title: 'Terms & Conditions', icon: <FileText color="#666" size={24} />, action: () => router.push('/static/terms') },
    { id: 'privacy', title: 'Privacy Policy', icon: <FileText color="#666" size={24} />, action: () => router.push('/static/privacy') },
  ];

  if (isLoading && !profile) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1F5B4E" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Account</Text>
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.profileAvatar}>
            <User color="#1F5B4E" size={40} />
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{profile?.name}</Text>
            <Text style={styles.profileDetail}>{profile?.phone}</Text>
            <Text style={styles.profileDetail}>{profile?.email}</Text>
          </View>
          <TouchableOpacity style={styles.editButton} onPress={handleEditOpen}>
            <Edit2 color="#1F5B4E" size={20} />
          </TouchableOpacity>
        </View>

        {/* App Shortcuts */}
        <View style={styles.section}>
          {menuItems.map((item, index) => (
            <TouchableOpacity 
              key={item.id} 
              style={[styles.menuItem, index === menuItems.length - 1 && styles.menuItemLast]}
              onPress={() => router.push(item.route as any)}
            >
              <View style={styles.menuIconContainer}>
                {item.icon}
              </View>
              <Text style={styles.menuItemTitle}>{item.title}</Text>
              <ChevronRight color="#ccc" size={20} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Support & Settings */}
        <Text style={styles.sectionTitle}>Settings & Support</Text>
        <View style={styles.section}>
          {supportItems.map((item, index) => (
            <TouchableOpacity 
              key={item.id} 
              style={[styles.menuItem, index === supportItems.length - 1 && styles.menuItemLast]}
              onPress={item.action}
            >
              <View style={[styles.menuIconContainer, { backgroundColor: '#f0f0f0' }]}>
                {item.icon}
              </View>
              <Text style={styles.menuItemTitle}>{item.title}</Text>
              <ChevronRight color="#ccc" size={20} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={() => router.replace('/login')}>
          <Text style={styles.logoutButtonText}>Log Out</Text>
        </TouchableOpacity>

      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal visible={isEditModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Profile</Text>
              <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                <X color="#1F2937" size={24} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Name</Text>
              <TextInput 
                style={styles.input}
                value={editName}
                onChangeText={setEditName}
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Phone Number</Text>
              <TextInput 
                style={styles.input}
                value={editPhone}
                onChangeText={setEditPhone}
                keyboardType="phone-pad"
              />
            </View>

            <TouchableOpacity style={styles.primaryButton} onPress={handleEditSave}>
              <Text style={styles.primaryButtonText}>Save Changes</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 24, fontFamily: 'Inter_700Bold', fontWeight: 'bold',
    color: '#1F2937',
  },
  container: {
    padding: 16,
    paddingBottom: 40,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  profileAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#E8F0EE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 20, fontFamily: 'Inter_700Bold', fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  profileDetail: {
    fontSize: 14, fontFamily: 'Inter_400Regular',
    color: '#666',
    marginBottom: 2,
  },
  editButton: {
    padding: 8,
    backgroundColor: '#E8F0EE',
    borderRadius: 20,
  },
  sectionTitle: {
    fontSize: 16, fontFamily: 'Inter_700Bold', fontWeight: 'bold',
    color: '#666',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#eee',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f9f9f9',
  },
  menuItemLast: {
    borderBottomWidth: 0,
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#E8F0EE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  menuItemTitle: {
    flex: 1,
    fontSize: 16, fontFamily: 'Inter_500Medium', fontWeight: '500',
    color: '#1F2937',
  },
  logoutButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#DC2626',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: '#DC2626',
    fontSize: 16, fontFamily: 'Inter_700Bold', fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    minHeight: 300,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20, fontFamily: 'Inter_700Bold', fontWeight: 'bold',
    color: '#1F2937',
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14, fontFamily: 'Inter_400Regular',
    color: '#666',
    marginBottom: 8,
    fontFamily: 'Inter_500Medium', fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 14,
    fontSize: 16, fontFamily: 'Inter_400Regular',
    backgroundColor: '#f9f9f9',
  },
  primaryButton: {
    backgroundColor: '#1F5B4E',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16, fontFamily: 'Inter_700Bold', fontWeight: 'bold',
  },
});
