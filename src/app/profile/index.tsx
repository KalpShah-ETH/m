import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Alert, Modal, TextInput, Platform, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Toast from 'react-native-toast-message';
import { ArrowLeft, User, Edit2, Clock, Truck, Wallet, Lock, Phone, FileText, ChevronRight, X, LogOut, Upload, CheckCircle } from 'lucide-react-native';
import { useAccountStore } from '@/store/accountStore';
import { useAuthStore } from '@/store/authStore';
import * as ImagePicker from 'expo-image-picker';

export default function ProfileScreen() {
  const router = useRouter();
  const { profile, isLoading, fetchProfile, updateProfile } = useAccountStore();
  const uploadLicense = useAuthStore((state) => state.uploadLicense);
  
  const [isEditModalVisible, setEditModalVisible] = useState(false);
  const [isLogoutModalVisible, setLogoutModalVisible] = useState(false);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editLicense20, setEditLicense20] = useState('');
  const [editLicense21, setEditLicense21] = useState('');
  const [editLicense20Url, setEditLicense20Url] = useState('');
  const [editLicense21Url, setEditLicense21Url] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [tempId] = useState(() => Date.now().toString());

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleEditOpen = () => {
    if (profile) {
      setEditName(profile.name || '');
      setEditPhone(profile.phone || '');
      setEditLicense20(profile.license20 || '');
      setEditLicense21(profile.license21 || '');
      setEditLicense20Url(profile.license20Url || '');
      setEditLicense21Url(profile.license21Url || '');
      setEditModalVisible(true);
    }
  };

  const handleEditSave = async () => {
    if (!editName) {
      Alert.alert('Error', 'Name cannot be empty');
      return;
    }
    setIsSaving(true);

    let l20 = editLicense20Url;
    let l21 = editLicense21Url;

    if (editLicense20Url && !editLicense20Url.includes('license20')) {
        const res = await uploadLicense(tempId, 'license20', editLicense20Url);
        if (res.path) l20 = res.path;
    }
    if (editLicense21Url && !editLicense21Url.includes('license21')) {
        const res = await uploadLicense(tempId, 'license21', editLicense21Url);
        if (res.path) l21 = res.path;
    }

    const { success } = await updateProfile({ 
      name: editName, 
      license20: editLicense20, 
      license21: editLicense21,
      license20Url: l20,
      license21Url: l21
    });

    setIsSaving(false);
    if (success) {
      Toast.show({ type: 'success', text1: 'Profile Updated' });
      setEditModalVisible(false);
    }
  };

  const pickImage = async (type: '20' | '21') => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0].uri) {
      if (type === '20') setEditLicense20Url(result.assets[0].uri);
      else setEditLicense21Url(result.assets[0].uri);
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
      <View style={[styles.header, { flexDirection: 'row', alignItems: 'center' }]}>
        <TouchableOpacity onPress={() => router.replace('/')} style={{ marginRight: 12 }}>
          <ArrowLeft color="#1F2937" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Account</Text>
      </View>

      {/* Fixed Profile Card */}
      <View style={[styles.profileCard, { marginHorizontal: 16, marginTop: 16 }]}>
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

      <ScrollView contentContainerStyle={styles.container}>
        
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
        <TouchableOpacity style={styles.logoutButton} onPress={() => setLogoutModalVisible(true)}>
          <Text style={styles.logoutButtonText}>Log Out</Text>
        </TouchableOpacity>

      </ScrollView>

      {/* Logout Confirmation Modal */}
      <Modal visible={isLogoutModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { minHeight: 200, paddingBottom: 32, alignItems: 'center' }]}>
            <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: '#FEE2E2', justifyContent: 'center', alignItems: 'center', marginBottom: 16 }}>
              <LogOut color="#DC2626" size={32} />
            </View>
            <Text style={{ fontSize: 20, fontFamily: 'Inter_700Bold', color: '#1F2937', marginBottom: 8 }}>Log Out</Text>
            <Text style={{ fontSize: 15, fontFamily: 'Inter_400Regular', color: '#666', textAlign: 'center', marginBottom: 24 }}>Are you sure you want to log out of your account?</Text>
            <View style={{ flexDirection: 'row', width: '100%' }}>
              <TouchableOpacity style={{ flex: 1, paddingVertical: 14, backgroundColor: '#f0f0f0', borderRadius: 8, marginRight: 8, alignItems: 'center' }} onPress={() => setLogoutModalVisible(false)}>
                <Text style={{ fontSize: 16, fontFamily: 'Inter_600SemiBold', color: '#4B5563' }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={{ flex: 1, paddingVertical: 14, backgroundColor: '#DC2626', borderRadius: 8, marginLeft: 8, alignItems: 'center' }} onPress={() => {
                setLogoutModalVisible(false);
                Toast.show({ type: 'success', text1: 'Logged Out', text2: 'You have successfully logged out.' });
                router.replace('/login');
              }}>
                <Text style={{ fontSize: 16, fontFamily: 'Inter_600SemiBold', color: '#fff' }}>Yes, Log Out</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Edit Profile Modal */}
      <Modal visible={isEditModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { maxHeight: '90%' }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Profile</Text>
              <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                <X color="#1F2937" size={24} />
              </TouchableOpacity>
            </View>
            
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Shop Firm Name</Text>
                <TextInput style={[styles.input, { backgroundColor: '#f5f5f5', color: '#666' }]} value={profile?.shopFirmName} editable={false} />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Shop Address</Text>
                <TextInput style={[styles.input, { backgroundColor: '#f5f5f5', color: '#666' }]} value={profile?.shopAddress} editable={false} />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Email</Text>
                <TextInput style={[styles.input, { backgroundColor: '#f5f5f5', color: '#666' }]} value={profile?.email} editable={false} />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Phone Number</Text>
                <TextInput style={[styles.input, { backgroundColor: '#f5f5f5', color: '#666' }]} value={profile?.phone} editable={false} />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Owner Name <Text style={{color: '#DC2626'}}>*</Text></Text>
                <TextInput style={styles.input} value={editName} onChangeText={setEditName} />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Drug License 20/20B Number</Text>
                <TextInput style={styles.input} value={editLicense20} onChangeText={setEditLicense20} />
              </View>

              <TouchableOpacity style={[styles.input, { flexDirection: 'row', alignItems: 'center', marginBottom: 16 }]} onPress={() => pickImage('20')}>
                {editLicense20Url ? <CheckCircle color="#1F5B4E" size={20} style={{ marginRight: 8 }} /> : <Upload color="#666" size={20} style={{ marginRight: 8 }} />}
                <Text style={{ color: editLicense20Url ? '#1F5B4E' : '#666' }}>{editLicense20Url ? 'Photo Selected (Tap to change)' : 'Upload 20/20B Photo'}</Text>
              </TouchableOpacity>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Drug License 21/21B Number</Text>
                <TextInput style={styles.input} value={editLicense21} onChangeText={setEditLicense21} />
              </View>

              <TouchableOpacity style={[styles.input, { flexDirection: 'row', alignItems: 'center', marginBottom: 24 }]} onPress={() => pickImage('21')}>
                {editLicense21Url ? <CheckCircle color="#1F5B4E" size={20} style={{ marginRight: 8 }} /> : <Upload color="#666" size={20} style={{ marginRight: 8 }} />}
                <Text style={{ color: editLicense21Url ? '#1F5B4E' : '#666' }}>{editLicense21Url ? 'Photo Selected (Tap to change)' : 'Upload 21/21B Photo'}</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.primaryButton} onPress={handleEditSave} disabled={isSaving}>
                {isSaving ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryButtonText}>Save Changes</Text>}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
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
    fontSize: 14,
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
