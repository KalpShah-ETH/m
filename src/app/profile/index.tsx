import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Animated, Modal, TextInput, Platform, StatusBar, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Toast from 'react-native-toast-message';
import { Feather } from '@expo/vector-icons';
import { useAccountStore } from '@/store/accountStore';
import { useAuthStore } from '@/store/authStore';
import * as ImagePicker from 'expo-image-picker';
import { colors } from '@/constants/colors';

// SKELETON COMPONENT
const Skeleton = ({ style }: { style: any }) => {
  const animatedValue = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.timing(animatedValue, { toValue: 0.5, duration: 600, useNativeDriver: true })
      ])
    ).start();
  }, []);

  return <Animated.View style={[style, { opacity: animatedValue, backgroundColor: colors.borderLight }]} />;
};

export default function ProfileScreen() {
  const router = useRouter();
  const { profile, isLoading, fetchProfile, updateProfile } = useAccountStore();
  const uploadLicense = useAuthStore((state) => state.uploadLicense);
  
  const [isEditModalVisible, setEditModalVisible] = useState(false);
  const [isLogoutModalVisible, setLogoutModalVisible] = useState(false);
  
  // Edit Profile States
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editLicense20, setEditLicense20] = useState('');
  const [editLicense21, setEditLicense21] = useState('');
  const [editLicense20Url, setEditLicense20Url] = useState('');
  const [editLicense21Url, setEditLicense21Url] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [tempId] = useState(() => Date.now().toString());

  // Password Modal State
  const [isPasswordModalVisible, setPasswordModalVisible] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const has8Chars = newPassword.length >= 8;
  const hasNumUpperLower = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z])/.test(newPassword);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>\-_\.]/.test(newPassword);
  const hasNoSpaces = newPassword.length > 0 && newPassword.trim() === newPassword && !newPassword.includes(' ');

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

  const yourItems = [
    { id: 'orders', title: 'Order history', icon: 'file-text', category: 'General', route: '/orders' },
    { id: 'distributors', title: 'Distributors', icon: 'share-2', category: 'General', route: '/distributors' },
    { id: 'outstandings', title: 'Outstandings', icon: 'credit-card', category: 'Financial', route: '/outstandings' },
  ];

  const moreItems = [
    { id: 'feedback', title: 'Send feedback', icon: 'message-square', category: 'General', action: () => Toast.show({ type: 'info', text1: 'Feedback opened' }) },
    { id: 'password', title: 'Change password', icon: 'lock', category: 'General', action: () => setPasswordModalVisible(true) },
    { id: 'contact', title: 'Contact us', icon: 'phone', category: 'General', action: () => Toast.show({ type: 'info', text1: 'Contact support' }) },
    { id: 'terms', title: 'Terms & Conditions', icon: 'file', category: 'General', action: () => router.push('/static/terms') },
    { id: 'logout', title: 'Logout', icon: 'power', category: 'Status', action: () => setLogoutModalVisible(true) },
  ];

  const getIconColors = (category: string) => {
    if (category === 'Financial') return { fill: colors.terracottaLight, stroke: colors.secondaryTerracotta };
    if (category === 'Status') return { fill: colors.goldLight, stroke: colors.accentGold };
    return { fill: colors.neutralForestTint, stroke: colors.primaryForest }; // General
  };

  const renderRow = (item: any, isLast: boolean) => {
    const iconColors = getIconColors(item.category);
    return (
      <View key={item.id}>
        <TouchableOpacity 
          style={styles.listRow}
          activeOpacity={0.7}
          onPress={item.route ? () => router.push(item.route) : item.action}
        >
          <View style={[styles.iconCircle, { backgroundColor: iconColors.fill }]}>
            <Feather name={item.icon as any} size={22} color={iconColors.stroke} strokeWidth={1.6} />
          </View>
          <Text style={styles.rowTitle}>{item.title}</Text>
          <Feather name="chevron-right" size={18} color={colors.textSlate} />
        </TouchableOpacity>
        {!isLast && <View style={styles.divider} />}
      </View>
    );
  };

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  // Mock Data
  const mockOutstanding = '₹ 12,450';
  const mockActiveOrders = '3';

  if (isLoading && !profile) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>My Account</Text>
        </View>
        <View style={{ paddingHorizontal: 16, marginTop: 16 }}>
          <Skeleton style={[styles.heroCard, { height: 160 }]} />
          <Skeleton style={{ height: 200, borderRadius: 12, marginTop: 32 }} />
          <Skeleton style={{ height: 260, borderRadius: 12, marginTop: 32 }} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.replace('/')} style={{ marginRight: 12 }}>
          <Feather name="arrow-left" color={colors.textDark} size={22} strokeWidth={1.6} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Account</Text>
        <View style={{ flex: 1 }} />
        <TouchableOpacity>
          <Feather name="bell" color={colors.textDark} size={22} strokeWidth={1.6} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        
        {/* HERO CARD */}
        <View style={styles.heroCard}>
          <TouchableOpacity style={styles.editIconBtn} onPress={handleEditOpen}>
            <Feather name="edit-2" color={colors.white} size={20} strokeWidth={1.6} />
          </TouchableOpacity>
          
          <View style={styles.heroTopRow}>
            <View>
              <View style={styles.avatarCircle}>
                <Text style={styles.avatarText}>{getInitials(profile?.name)}</Text>
              </View>
              <View style={styles.cameraOverlay}>
                <Feather name="camera" color={colors.primaryForest} size={12} strokeWidth={1.6} />
              </View>
            </View>
            <View style={styles.heroInfo}>
              <Text style={styles.heroName}>{profile?.name}</Text>
              <Text style={styles.heroContact}>{profile?.phone} · {profile?.email}</Text>
            </View>
          </View>

          <View style={styles.heroBottomRow}>
            <View style={styles.planBadge}>
              <Feather name="star" color={colors.forestDark} size={12} style={{ marginRight: 4 }} />
              <Text style={styles.badgeText}>Silver Plan</Text>
            </View>
            
            <View style={styles.statChipsRow}>
              <View style={styles.statChip}>
                <Text style={styles.statNumber}>{mockOutstanding}</Text>
                <Text style={styles.statLabel}>OUTSTANDING</Text>
              </View>
              <View style={styles.statChip}>
                <Text style={styles.statNumber}>{mockActiveOrders}</Text>
                <Text style={styles.statLabel}>ACTIVE ORDERS</Text>
              </View>
            </View>
          </View>
        </View>

        {/* YOUR SECTION */}
        <Text style={styles.sectionLabel}>YOUR</Text>
        <View style={styles.listContainer}>
          {yourItems.map((item, idx) => renderRow(item, idx === yourItems.length - 1))}
        </View>

        {/* MORE SECTION */}
        <Text style={styles.sectionLabel}>MORE</Text>
        <View style={styles.listContainer}>
          {moreItems.map((item, idx) => renderRow(item, idx === moreItems.length - 1))}
        </View>

      </ScrollView>

      {/* LOGOUT MODAL */}
      <Modal visible={isLogoutModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <Text style={styles.modalTitle}>Logout</Text>
            <Text style={styles.modalBody}>Are you sure you want to log out of your account?</Text>
            
            <View style={styles.modalButtonsRow}>
              <TouchableOpacity style={styles.btnSecondary} onPress={() => setLogoutModalVisible(false)}>
                <Text style={styles.btnSecondaryText}>No</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.btnPrimary} onPress={() => {
                setLogoutModalVisible(false);
                Toast.show({ type: 'success', text1: 'Logged Out', text2: 'You have successfully logged out.' });
                router.replace('/login');
              }}>
                <Text style={styles.btnPrimaryText}>Yes</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* CHANGE PASSWORD MODAL */}
      <Modal visible={isPasswordModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <Text style={styles.modalTitle}>Change Password</Text>
            
            <View style={[styles.inputWrapper, { marginTop: 16 }]}>
              <Feather name="lock" color={colors.textSlate} size={16} style={{ marginRight: 8 }} />
              <TextInput 
                style={styles.passwordInput}
                placeholder="Current Password *"
                placeholderTextColor={colors.textSlate}
                secureTextEntry={!showCurrentPassword}
                value={currentPassword}
                onChangeText={setCurrentPassword}
              />
              <TouchableOpacity onPress={() => setShowCurrentPassword(!showCurrentPassword)}>
                <Feather name={showCurrentPassword ? "eye" : "eye-off"} color={colors.textSlate} size={16} />
              </TouchableOpacity>
            </View>

            <View style={styles.inputWrapper}>
              <Feather name="lock" color={colors.textSlate} size={16} style={{ marginRight: 8 }} />
              <TextInput 
                style={styles.passwordInput}
                placeholder="New Password *"
                placeholderTextColor={colors.textSlate}
                secureTextEntry={!showNewPassword}
                value={newPassword}
                onChangeText={setNewPassword}
              />
              <TouchableOpacity onPress={() => setShowNewPassword(!showNewPassword)}>
                <Feather name={showNewPassword ? "eye" : "eye-off"} color={colors.textSlate} size={16} />
              </TouchableOpacity>
            </View>

            <View style={styles.inputWrapper}>
              <Feather name="lock" color={colors.textSlate} size={16} style={{ marginRight: 8 }} />
              <TextInput 
                style={styles.passwordInput}
                placeholder="Confirm New Password *"
                placeholderTextColor={colors.textSlate}
                secureTextEntry={!showConfirmPassword}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />
              <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                <Feather name={showConfirmPassword ? "eye" : "eye-off"} color={colors.textSlate} size={16} />
              </TouchableOpacity>
            </View>

            <Text style={styles.validationHeader}>Your password must contain</Text>
            
            <View style={styles.validationRow}>
              <Feather name="check" size={14} color={has8Chars ? colors.secondaryTerracotta : 'transparent'} style={[styles.valCheck, !has8Chars && { borderColor: colors.textSlate, borderWidth: 1 }]} />
              <Text style={styles.validationText}>At least 8 letters</Text>
            </View>
            <View style={styles.validationRow}>
              <Feather name="check" size={14} color={hasNumUpperLower ? colors.secondaryTerracotta : 'transparent'} style={[styles.valCheck, !hasNumUpperLower && { borderColor: colors.textSlate, borderWidth: 1 }]} />
              <Text style={styles.validationText}>At least a number, an uppercase & a lowercase letter</Text>
            </View>
            <View style={styles.validationRow}>
              <Feather name="check" size={14} color={hasSpecialChar ? colors.secondaryTerracotta : 'transparent'} style={[styles.valCheck, !hasSpecialChar && { borderColor: colors.textSlate, borderWidth: 1 }]} />
              <Text style={styles.validationText}>At least one special character (For ex: @, -, _, . )</Text>
            </View>
            <View style={styles.validationRow}>
              <Feather name="check" size={14} color={hasNoSpaces ? colors.secondaryTerracotta : 'transparent'} style={[styles.valCheck, !hasNoSpaces && { borderColor: colors.textSlate, borderWidth: 1 }]} />
              <Text style={styles.validationText}>No space at the start or end</Text>
            </View>

            <Text style={styles.valExample}>Password example: Abhi@1234, Pharmarack@123, Abhi_1234</Text>

            <View style={styles.modalButtonsRow}>
              <TouchableOpacity style={styles.btnSecondary} onPress={() => setPasswordModalVisible(false)}>
                <Text style={styles.btnSecondaryText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.btnPrimary, { opacity: (has8Chars && hasNumUpperLower && hasSpecialChar && hasNoSpaces && newPassword === confirmPassword && currentPassword) ? 1 : 0.5 }]} 
                disabled={!(has8Chars && hasNumUpperLower && hasSpecialChar && hasNoSpaces && newPassword === confirmPassword && currentPassword)}
                onPress={() => {
                  Toast.show({ type: 'success', text1: 'Password Updated' });
                  setPasswordModalVisible(false);
                  setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
                }}>
                <Text style={styles.btnPrimaryText}>Save Changes</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* EDIT PROFILE MODAL */}
      <Modal visible={isEditModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalSheet, { maxHeight: '90%' }]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <Text style={styles.modalTitle}>Edit Profile</Text>
              <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                <Feather name="x" color={colors.textDark} size={24} />
              </TouchableOpacity>
            </View>
            
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.editInputGroup}>
                <Text style={styles.editLabel}>Shop Firm Name</Text>
                <TextInput style={[styles.editInput, { backgroundColor: colors.backgroundOffWhite, color: colors.textSlate }]} value={profile?.shopFirmName} editable={false} />
              </View>

              <View style={styles.editInputGroup}>
                <Text style={styles.editLabel}>Shop Address</Text>
                <TextInput style={[styles.editInput, { backgroundColor: colors.backgroundOffWhite, color: colors.textSlate }]} value={profile?.shopAddress} editable={false} />
              </View>

              <View style={styles.editInputGroup}>
                <Text style={styles.editLabel}>Email</Text>
                <TextInput style={[styles.editInput, { backgroundColor: colors.backgroundOffWhite, color: colors.textSlate }]} value={profile?.email} editable={false} />
              </View>

              <View style={styles.editInputGroup}>
                <Text style={styles.editLabel}>Phone Number</Text>
                <TextInput style={[styles.editInput, { backgroundColor: colors.backgroundOffWhite, color: colors.textSlate }]} value={profile?.phone} editable={false} />
              </View>

              <View style={styles.editInputGroup}>
                <Text style={styles.editLabel}>Owner Name <Text style={{color: colors.errorRed}}>*</Text></Text>
                <TextInput style={styles.editInput} value={editName} onChangeText={setEditName} />
              </View>

              <View style={styles.editInputGroup}>
                <Text style={styles.editLabel}>Drug License 20/20B Number</Text>
                <TextInput style={styles.editInput} value={editLicense20} onChangeText={setEditLicense20} />
              </View>

              <TouchableOpacity style={[styles.editInput, { flexDirection: 'row', alignItems: 'center', marginBottom: 16 }]} onPress={() => pickImage('20')}>
                {editLicense20Url ? <Feather name="check-circle" color={colors.primaryForest} size={20} style={{ marginRight: 8 }} /> : <Feather name="upload" color={colors.textSlate} size={20} style={{ marginRight: 8 }} />}
                <Text style={{ color: editLicense20Url ? colors.primaryForest : colors.textSlate, fontFamily: 'Inter_400Regular' }}>{editLicense20Url ? 'Photo Selected (Tap to change)' : 'Upload 20/20B Photo'}</Text>
              </TouchableOpacity>

              <View style={styles.editInputGroup}>
                <Text style={styles.editLabel}>Drug License 21/21B Number</Text>
                <TextInput style={styles.editInput} value={editLicense21} onChangeText={setEditLicense21} />
              </View>

              <TouchableOpacity style={[styles.editInput, { flexDirection: 'row', alignItems: 'center', marginBottom: 24 }]} onPress={() => pickImage('21')}>
                {editLicense21Url ? <Feather name="check-circle" color={colors.primaryForest} size={20} style={{ marginRight: 8 }} /> : <Feather name="upload" color={colors.textSlate} size={20} style={{ marginRight: 8 }} />}
                <Text style={{ color: editLicense21Url ? colors.primaryForest : colors.textSlate, fontFamily: 'Inter_400Regular' }}>{editLicense21Url ? 'Photo Selected (Tap to change)' : 'Upload 21/21B Photo'}</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.btnPrimary} onPress={handleEditSave} disabled={isSaving}>
                <Text style={styles.btnPrimaryText}>{isSaving ? 'Saving...' : 'Save Changes'}</Text>
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
    backgroundColor: colors.backgroundOffWhite,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 20,
    color: colors.textDark,
  },
  container: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  heroCard: {
    backgroundColor: colors.primaryForest,
    borderRadius: 18,
    padding: 16,
    marginTop: 16,
    marginBottom: 24,
    // Shadow
    shadowColor: '#16232F',
    shadowOpacity: 0.15,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarCircle: {
    width: 56,
    height: 56,
    borderRadius: 999,
    backgroundColor: colors.secondaryTerracotta,
    borderWidth: 1.5,
    borderColor: colors.accentGold,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 18,
    color: colors.white,
  },
  cameraOverlay: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroInfo: {
    marginLeft: 16,
    flex: 1,
  },
  heroName: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 18,
    color: colors.white,
  },
  heroContact: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  editIconBtn: {
    position: 'absolute',
    top: 16,
    right: 16,
    padding: 16,
    margin: -16,
    zIndex: 10,
  },
  heroBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  planBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.accentGold,
    borderRadius: 999,
    height: 32,
    paddingHorizontal: 14,
  },
  badgeText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
    color: colors.forestDark,
  },
  statChipsRow: {
    flexDirection: 'row',
    marginLeft: 8,
    flex: 1,
  },
  statChip: {
    backgroundColor: '#1B3B2C',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 8,
    marginLeft: 8,
    minWidth: 84,
  },
  statNumber: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 16,
    color: colors.white,
  },
  statLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 9,
    color: colors.terracottaLight,
    letterSpacing: 0.4,
  },
  sectionLabel: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
    color: colors.textSlate,
    letterSpacing: 1.2,
    paddingLeft: 16,
    marginBottom: 8,
  },
  listContainer: {
    backgroundColor: colors.white,
    borderRadius: 12,
    marginBottom: 32,
    shadowColor: '#16232F',
    shadowOpacity: 0.15,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 64,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 8, // radius.sm
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  rowTitle: {
    flex: 1,
    fontFamily: 'Inter_600SemiBold',
    fontSize: 15,
    color: colors.textDark,
  },
  divider: {
    height: 1,
    backgroundColor: colors.borderLight,
    marginLeft: 72, // 16 + 44 + 12
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(20, 47, 35, 0.55)', // forestDark 55%
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  modalSheet: {
    width: '100%',
    backgroundColor: colors.white,
    borderRadius: 18,
    padding: 24,
  },
  modalTitle: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 17,
    color: colors.textDark,
  },
  modalBody: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: colors.textSlate,
    marginTop: 8,
    marginBottom: 24,
  },
  modalButtonsRow: {
    flexDirection: 'row',
    marginTop: 24,
  },
  btnPrimary: {
    flex: 1,
    height: 48,
    backgroundColor: colors.primaryForest,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  btnPrimaryText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: colors.white,
    letterSpacing: 0.2,
  },
  btnSecondary: {
    flex: 1,
    height: 48,
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: colors.primaryForest,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  btnSecondaryText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: colors.primaryForest,
    letterSpacing: 0.2,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  passwordInput: {
    flex: 1,
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: colors.textDark,
  },
  validationHeader: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    color: colors.textSlate,
    marginTop: 8,
    marginBottom: 12,
  },
  validationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  valCheck: {
    width: 14,
    height: 14,
    borderRadius: 7,
    marginRight: 8,
  },
  validationText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: colors.textSlate,
  },
  valExample: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: colors.textSlate,
    marginLeft: 22,
    marginTop: 4,
    marginBottom: 8,
  },
  editInputGroup: {
    marginBottom: 16,
  },
  editLabel: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    color: colors.textDark,
    marginBottom: 8,
  },
  editInput: {
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 48,
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: colors.textDark,
  }
});
