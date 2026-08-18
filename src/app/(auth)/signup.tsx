import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'expo-router';
import { CheckCircle, ChevronDown, Eye, EyeOff, Lock, Mail, MapPin, Phone, Store, User, X, Upload, Calendar, Info, Image as ImageIcon, Camera } from 'lucide-react-native';
import { useEffect, useState, useRef } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Modal, Platform, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function SignupScreen() {
  const router = useRouter();
  const signup = useAuthStore((state) => state.signup);
  const sendEmailOtp = useAuthStore((state) => state.sendEmailOtp);
  const verifyEmailOtp = useAuthStore((state) => state.verifyEmailOtp);
  const uploadLicense = useAuthStore((state) => state.uploadLicense);

  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [tempId] = useState(() => Date.now().toString() + Math.random().toString(36).substring(7));

  // Step 1 State
  const [businessType, setBusinessType] = useState('');
  const [shopFirmName, setShopFirmName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [shopAddress, setShopAddress] = useState('');
  const [pincode, setPincode] = useState('');
  const [area, setArea] = useState('');
  const [city, setCity] = useState('');
  const [stateName, setStateName] = useState('');

  // Step 1 UI State
  const [showBusinessModal, setShowBusinessModal] = useState(false);
  const [showAreaModal, setShowAreaModal] = useState(false);
  const [areaOptions, setAreaOptions] = useState<any[]>([]);
  const [isFetchingPincode, setIsFetchingPincode] = useState(false);

  // Step 2 State
  const [shopEmail, setShopEmail] = useState('');
  const [emailVerified, setEmailVerified] = useState(false);
  const [pharmacistName, setPharmacistName] = useState('');
  const [pharmacistNumber, setPharmacistNumber] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Step 2 UI State
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [otpCountdown, setOtpCountdown] = useState(30);
  const [emailError, setEmailError] = useState('');

  // OTP Refs
  const otpRefs = useRef<Array<TextInput | null>>([]);

  // Password Validation
  const pwdLength = password.length >= 8;
  const pwdMix = /[0-9]/.test(password) && /[A-Z]/.test(password) && /[a-z]/.test(password);
  const pwdSpecial = /[@\-._,]/.test(password); 
  const pwdNoSpaces = password.length > 0 && !password.startsWith(' ') && !password.endsWith(' ');
  const isPasswordValid = pwdLength && pwdMix && pwdSpecial && pwdNoSpaces;

  // Step 3 State
  const [license20, setLicense20] = useState('');
  const [license20Url, setLicense20Url] = useState('');
  const [license20Expiry, setLicense20Expiry] = useState<Date | null>(null);

  const [license21, setLicense21] = useState('');
  const [license21Url, setLicense21Url] = useState('');
  const [license21Expiry, setLicense21Expiry] = useState<Date | null>(null);

  const [gstin, setGstin] = useState('');
  const [pan, setPan] = useState('');
  const [referral, setReferral] = useState('');

  const [consentTerms, setConsentTerms] = useState(false);
  const [whatsappOptIn, setWhatsappOptIn] = useState(false);

  // Step 3 UI State
  const [showUploadSheet, setShowUploadSheet] = useState<'license20' | 'license21' | null>(null);
  const [showDatePicker, setShowDatePicker] = useState<'license20' | 'license21' | null>(null);
  const [license20UploadError, setLicense20UploadError] = useState(false);
  const [license21UploadError, setLicense21UploadError] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (showOtpModal && otpCountdown > 0) {
      timer = setTimeout(() => setOtpCountdown(otpCountdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [showOtpModal, otpCountdown]);

  const fetchPincodeDetails = async (code: string) => {
    if (code.length !== 6) return;
    setIsFetchingPincode(true);
    try {
      const response = await fetch(`https://api.postalpincode.in/pincode/${code}`);
      const data = await response.json();
      if (data && data[0]?.Status === 'Success') {
        setAreaOptions(data[0].PostOffice);
        setCity(data[0].PostOffice[0].District);
        setStateName(data[0].PostOffice[0].State);
      } else {
        setAreaOptions([]);
      }
    } catch (e) {
      console.log(e);
    } finally {
      setIsFetchingPincode(false);
    }
  };

  const handlePincodeChange = (text: string) => {
    const numericText = text.replace(/[^0-9]/g, '');
    setPincode(numericText);
    
    if (numericText.length === 6) {
      fetchPincodeDetails(numericText);
    } else {
      // Clear data if pincode is invalid or deleted
      setAreaOptions([]);
      setCity('');
      setStateName('');
    }
  };

  const handlePincodeBlur = () => {
    if (pincode.length === 6 && !city) {
      fetchPincodeDetails(pincode);
    }
  };

  const handleSendOtp = async () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(shopEmail)) {
      setEmailError('Please Enter Valid Email Address');
      return;
    }
    setEmailError('');
    setIsLoading(true);
    const { error } = await sendEmailOtp(shopEmail);
    setIsLoading(false);
    if (!error) {
      setShowOtpModal(true);
      setOtpCountdown(30);
    } else {
      setEmailError(error.message || 'Failed to send verification code.');
    }
  };

  const handleVerifyOtp = async () => {
    const enteredOtp = otp.join('');
    if (enteredOtp.length !== 6) return;
    setIsLoading(true);
    const { error, valid } = await verifyEmailOtp(shopEmail, enteredOtp);
    setIsLoading(false);
    if (!error && valid !== false) {
      setEmailVerified(true);
      setShowOtpModal(false);
    } else {
      setEmailError('Invalid verification code.');
      setShowOtpModal(false); 
    }
  };

  const pickImage = async (source: 'camera' | 'gallery') => {
    let result;
    if (source === 'camera') {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Camera permission is required.');
        return;
      }
      result = await ImagePicker.launchCameraAsync({ allowsEditing: true, quality: 0.8 });
    } else {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Gallery permission is required.');
        return;
      }
      result = await ImagePicker.launchImageLibraryAsync({ allowsEditing: false, quality: 0.8 });
    }

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const uri = result.assets[0].uri;
      if (showUploadSheet === 'license20') {
        setLicense20Url(uri);
        setLicense20UploadError(false);
      }
      if (showUploadSheet === 'license21') {
        setLicense21Url(uri);
        setLicense21UploadError(false);
      }
    }
    setShowUploadSheet(null);
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    const currentTarget = showDatePicker;
    setShowDatePicker(Platform.OS === 'ios' ? currentTarget : null);
    if (selectedDate && currentTarget) {
      if (currentTarget === 'license20') setLicense20Expiry(selectedDate);
      if (currentTarget === 'license21') setLicense21Expiry(selectedDate);
    }
  };

  const handleRegister = async () => {
    setIsLoading(true);
    setLicense20UploadError(false);
    setLicense21UploadError(false);

    let finalLicense20Url = license20Url;
    let finalLicense21Url = license21Url;

    const { path: p20, error: err20 } = await uploadLicense(tempId, 'license20', license20Url);
    if (err20) setLicense20UploadError(true);
    else finalLicense20Url = p20 || '';

    const { path: p21, error: err21 } = await uploadLicense(tempId, 'license21', license21Url);
    if (err21) setLicense21UploadError(true);
    else finalLicense21Url = p21 || '';

    if (err20 || err21) {
      setIsLoading(false);
      Alert.alert('Upload Failed', 'Document upload failed. Please tap the red fields to retry.');
      return;
    }

    const data = {
      businessType, shopFirmName, ownerName, shopAddress, pincode, area, city, state: stateName,
      shopEmail, emailVerified, pharmacistName, pharmacistNumber, password,
      license20, license20Url: finalLicense20Url, license20Expiry: license20Expiry?.toISOString(),
      license21, license21Url: finalLicense21Url, license21Expiry: license21Expiry?.toISOString(),
      gstin, pan, referral, whatsappOptIn
    };

    const { error } = await signup(data);
    setIsLoading(false);
    
    if (error) {
      Alert.alert('Registration Failed', error.message);
    } else {
      Alert.alert('Registration successful', 'You can log in once your application is approved.', [
        { text: 'OK', onPress: () => router.replace('/(auth)/login') }
      ]);
    }
  };

  const isStep1Valid = businessType && shopFirmName && ownerName && shopAddress && pincode.length === 6 && area && city && stateName;
  const isStep2Valid = emailVerified && isPasswordValid;
  const isStep3Valid = license20 && license20Url && license20Expiry && license21 && license21Url && license21Expiry && consentTerms;

  const renderStepper = () => (
    <View style={styles.stepperContainer}>
      <View style={styles.stepIndicator}>
        {currentStep > 1 ? (
          <CheckCircle color="#1F5B4E" size={20} fill="#1F5B4E" stroke="#fff" />
        ) : (
          <View style={[styles.stepCircle, currentStep === 1 && styles.stepCircleActive]}>
            <Text style={[styles.stepText, currentStep === 1 && styles.stepTextActive]}>1</Text>
          </View>
        )}
        <Text style={[styles.stepLabel, currentStep === 1 && styles.stepLabelActive]}>General</Text>
      </View>
      <View style={styles.stepLine} />
      <View style={styles.stepIndicator}>
        {currentStep > 2 ? (
          <CheckCircle color="#1F5B4E" size={20} fill="#1F5B4E" stroke="#fff" />
        ) : (
          <View style={[styles.stepCircle, currentStep === 2 && styles.stepCircleActive]}>
            <Text style={[styles.stepText, currentStep === 2 && styles.stepTextActive]}>2</Text>
          </View>
        )}
        <Text style={[styles.stepLabel, currentStep === 2 && styles.stepLabelActive]}>Security</Text>
      </View>
      <View style={styles.stepLine} />
      <View style={styles.stepIndicator}>
        <View style={[styles.stepCircle, currentStep === 3 && styles.stepCircleActive]}>
          <Text style={[styles.stepText, currentStep === 3 && styles.stepTextActive]}>3</Text>
        </View>
        <Text style={[styles.stepLabel, currentStep === 3 && styles.stepLabelActive]}>License</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardView}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={styles.headerRow}>
            {currentStep > 1 && (
              <TouchableOpacity onPress={() => setCurrentStep(currentStep - 1)} style={styles.backArrow}>
                <Text style={styles.backArrowText}>←</Text>
              </TouchableOpacity>
            )}
            <Text style={styles.title}>Create your account</Text>
          </View>

          {renderStepper()}

          {currentStep === 1 && (
            <View style={styles.formSection}>
              {/* Step 1 Fields */}
              <TouchableOpacity style={styles.inputContainer} onPress={() => setShowBusinessModal(true)}>
                <Store color="#666" size={20} style={styles.icon} />
                <Text style={[styles.inputText, !businessType && styles.placeholderText]}>
                  {businessType || 'Type of business *'}
                </Text>
                <ChevronDown color="#666" size={20} />
              </TouchableOpacity>

              <View style={styles.inputContainer}>
                <Store color="#666" size={20} style={styles.icon} />
                <TextInput style={styles.input} placeholder="Name of the Shop/Firm *" value={shopFirmName} onChangeText={setShopFirmName} placeholderTextColor="#999" />
              </View>

              <View style={styles.inputContainer}>
                <User color="#666" size={20} style={styles.icon} />
                <TextInput style={styles.input} placeholder="Name of the Owner *" value={ownerName} onChangeText={setOwnerName} placeholderTextColor="#999" />
              </View>

              <View style={styles.inputContainer}>
                <MapPin color="#666" size={20} style={styles.icon} />
                <TextInput style={styles.input} placeholder="Shop Address *" value={shopAddress} onChangeText={setShopAddress} placeholderTextColor="#999" />
              </View>

              <View style={styles.inputContainer}>
                <MapPin color="#666" size={20} style={styles.icon} />
                <TextInput
                  style={styles.input}
                  placeholder="Pincode *"
                  value={pincode}
                  onChangeText={handlePincodeChange}
                  onBlur={handlePincodeBlur}
                  keyboardType="number-pad"
                  maxLength={6}
                  placeholderTextColor="#999"
                />
                {isFetchingPincode && <ActivityIndicator color="#1F5B4E" size="small" />}
              </View>

              <TouchableOpacity style={styles.inputContainer} onPress={() => setShowAreaModal(true)} disabled={areaOptions.length === 0}>
                <MapPin color="#666" size={20} style={styles.icon} />
                <Text style={[styles.inputText, !area && styles.placeholderText]}>
                  {area || 'Area *'}
                </Text>
                <ChevronDown color="#666" size={20} />
              </TouchableOpacity>

              <View style={styles.row}>
                <View style={[styles.inputContainer, styles.flex1, { marginRight: 8, backgroundColor: '#f0f0f0' }]}>
                  <TextInput style={styles.input} placeholder="City" value={city} editable={false} placeholderTextColor="#999" />
                </View>
                <View style={[styles.inputContainer, styles.flex1, { marginLeft: 8, backgroundColor: '#f0f0f0' }]}>
                  <TextInput style={styles.input} placeholder="State" value={stateName} editable={false} placeholderTextColor="#999" />
                </View>
              </View>
            </View>
          )}

          {currentStep === 2 && (
            <View style={styles.formSection}>
              {/* Step 2 Fields */}
              <View style={styles.inputContainer}>
                <Mail color="#666" size={20} style={styles.icon} />
                <TextInput
                  style={[styles.input, emailVerified && { color: '#666' }]}
                  placeholder="Shop Email ID *"
                  value={shopEmail}
                  onChangeText={(text) => { setShopEmail(text); setEmailVerified(false); }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  editable={!emailVerified}
                  placeholderTextColor="#999"
                />
                {emailVerified ? (
                  <CheckCircle color="#1F5B4E" size={20} />
                ) : (
                  <TouchableOpacity onPress={handleSendOtp} disabled={isLoading}>
                    <Text style={styles.verifyText}>Verify</Text>
                  </TouchableOpacity>
                )}
              </View>
              {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}

              <View style={styles.inputContainer}>
                <User color="#666" size={20} style={styles.icon} />
                <TextInput style={styles.input} placeholder="Pharmacist name (Optional)" value={pharmacistName} onChangeText={setPharmacistName} placeholderTextColor="#999" />
              </View>

              <View style={styles.inputContainer}>
                <Phone color="#666" size={20} style={styles.icon} />
                <TextInput style={styles.input} placeholder="Pharmacist number (Optional)" value={pharmacistNumber} onChangeText={setPharmacistNumber} keyboardType="phone-pad" placeholderTextColor="#999" />
              </View>

              <View style={styles.inputContainer}>
                <Lock color="#666" size={20} style={styles.icon} />
                <TextInput
                  style={styles.input}
                  placeholder="Password *"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  placeholderTextColor="#999"
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                  {showPassword ? <EyeOff color="#666" size={20} /> : <Eye color="#666" size={20} />}
                </TouchableOpacity>
              </View>

              <View style={styles.validationBox}>
                <View style={styles.validationRow}>
                  <CheckCircle size={16} color={pwdLength ? "#1F5B4E" : "#ccc"} />
                  <Text style={[styles.validationText, pwdLength && styles.validationTextValid]}>At least 8 letters</Text>
                </View>
                <View style={styles.validationRow}>
                  <CheckCircle size={16} color={pwdMix ? "#1F5B4E" : "#ccc"} />
                  <Text style={[styles.validationText, pwdMix && styles.validationTextValid]}>At least a number, an uppercase & a lowercase letter</Text>
                </View>
                <View style={styles.validationRow}>
                  <CheckCircle size={16} color={pwdSpecial ? "#1F5B4E" : "#ccc"} />
                  <Text style={[styles.validationText, pwdSpecial && styles.validationTextValid]}>At least one special character</Text>
                </View>
                <View style={styles.validationRow}>
                  <CheckCircle size={16} color={pwdNoSpaces ? "#1F5B4E" : "#ccc"} />
                  <Text style={[styles.validationText, pwdNoSpaces && styles.validationTextValid]}>No space at the start or end</Text>
                </View>
              </View>
            </View>
          )}

          {currentStep === 3 && (
            <View style={styles.formSection}>
              <Text style={styles.step3Header}>Upload your Drug license as per below</Text>

              {/* License 20/20B */}
              <View style={styles.licenseGroup}>
                <View style={styles.licenseLabelRow}>
                  <Text style={styles.licenseLabel}>20/20B <Text style={styles.asterisk}>*</Text></Text>
                  <TouchableOpacity style={styles.infoIcon} onPress={() => Alert.alert('Info', 'This is required to activate your account')}>
                    <Info size={16} color="#6B7280" />
                  </TouchableOpacity>
                </View>
                <View style={styles.inputContainer}>
                  <TextInput style={styles.input} placeholder="Drug license number" value={license20} onChangeText={setLicense20} placeholderTextColor="#999" />
                </View>
                <View style={styles.row}>
                  <TouchableOpacity style={[styles.uploadBox, styles.flex1, { marginRight: 8 }, license20UploadError && { borderColor: '#DC2626' }]} onPress={() => setShowUploadSheet('license20')}>
                    <Upload size={20} color={license20UploadError ? "#DC2626" : "#1F5B4E"} style={styles.icon} />
                    <Text style={[styles.uploadText, license20UploadError && { color: '#DC2626' }]} numberOfLines={1}>
                      {license20UploadError ? 'Retry Upload' : license20Url ? 'Uploaded' : 'Upload'}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.inputContainer, styles.flex1, { marginLeft: 8, marginBottom: 0 }]} onPress={() => setShowDatePicker('license20')}>
                    <Calendar size={20} color="#666" style={styles.icon} />
                    <Text style={[styles.inputText, !license20Expiry && styles.placeholderText]}>
                      {license20Expiry ? license20Expiry.toLocaleDateString() : 'Expiry Date'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* License 21/21B */}
              <View style={styles.licenseGroup}>
                <View style={styles.licenseLabelRow}>
                  <Text style={styles.licenseLabel}>21/21B <Text style={styles.asterisk}>*</Text></Text>
                  <TouchableOpacity style={styles.infoIcon} onPress={() => Alert.alert('Info', 'This is required to activate your account')}>
                    <Info size={16} color="#6B7280" />
                  </TouchableOpacity>
                </View>
                <View style={styles.inputContainer}>
                  <TextInput style={styles.input} placeholder="Drug license number" value={license21} onChangeText={setLicense21} placeholderTextColor="#999" />
                </View>
                <View style={styles.row}>
                  <TouchableOpacity style={[styles.uploadBox, styles.flex1, { marginRight: 8 }, license21UploadError && { borderColor: '#DC2626' }]} onPress={() => setShowUploadSheet('license21')}>
                    <Upload size={20} color={license21UploadError ? "#DC2626" : "#1F5B4E"} style={styles.icon} />
                    <Text style={[styles.uploadText, license21UploadError && { color: '#DC2626' }]} numberOfLines={1}>
                      {license21UploadError ? 'Retry Upload' : license21Url ? 'Uploaded' : 'Upload'}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.inputContainer, styles.flex1, { marginLeft: 8, marginBottom: 0 }]} onPress={() => setShowDatePicker('license21')}>
                    <Calendar size={20} color="#666" style={styles.icon} />
                    <Text style={[styles.inputText, !license21Expiry && styles.placeholderText]}>
                      {license21Expiry ? license21Expiry.toLocaleDateString() : 'Expiry Date'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Other Section */}
              <Text style={styles.otherHeader}>Other (Optional)</Text>
              <View style={styles.inputContainer}>
                <TextInput style={styles.input} placeholder="GSTIN Number" value={gstin} onChangeText={setGstin} placeholderTextColor="#999" />
              </View>
              <View style={styles.inputContainer}>
                <TextInput style={styles.input} placeholder="PAN Number" value={pan} onChangeText={setPan} placeholderTextColor="#999" />
              </View>
              <View style={styles.inputContainer}>
                <TextInput style={styles.input} placeholder="Referral Code" value={referral} onChangeText={setReferral} placeholderTextColor="#999" />
              </View>

              {/* Consent Checkboxes */}
              <View style={styles.checkboxContainer}>
                <TouchableOpacity style={styles.checkbox} onPress={() => setConsentTerms(!consentTerms)}>
                  {consentTerms && <CheckCircle size={16} color="#fff" fill="#1F5B4E" strokeWidth={0} />}
                  {!consentTerms && <View style={styles.checkboxUnchecked} />}
                </TouchableOpacity>
                <Text style={styles.checkboxText}>
                  By clicking on Register, you have read and agreed to our <Text style={styles.linkText}>Terms and Conditions</Text> and <Text style={styles.linkText}>Privacy Policy</Text> of MedConnect
                </Text>
              </View>

              <View style={styles.checkboxContainer}>
                <TouchableOpacity style={styles.checkbox} onPress={() => setWhatsappOptIn(!whatsappOptIn)}>
                  {whatsappOptIn && <CheckCircle size={16} color="#fff" fill="#1F5B4E" strokeWidth={0} />}
                  {!whatsappOptIn && <View style={styles.checkboxUnchecked} />}
                </TouchableOpacity>
                <Text style={styles.checkboxText}>Yes, I would like to receive transactional and promotional updates on WhatsApp</Text>
              </View>

            </View>
          )}

          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => currentStep > 1 ? setCurrentStep(currentStep - 1) : router.back()}
              disabled={isLoading}
            >
              <Text style={styles.backButtonText}>Back</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.submitButton, ((currentStep === 1 && !isStep1Valid) || (currentStep === 2 && !isStep2Valid) || (currentStep === 3 && !isStep3Valid) || isLoading) && styles.disabledButton]}
              onPress={() => {
                if (currentStep === 1 && isStep1Valid) setCurrentStep(2);
                else if (currentStep === 2 && isStep2Valid) setCurrentStep(3);
                else if (currentStep === 3 && isStep3Valid) handleRegister();
              }}
              disabled={(currentStep === 1 && !isStep1Valid) || (currentStep === 2 && !isStep2Valid) || (currentStep === 3 && !isStep3Valid) || isLoading}
            >
              <Text style={styles.submitButtonText}>
                {isLoading ? 'Loading...' : currentStep === 3 ? 'Register' : 'Next'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Date Picker Modal/Overlay for Android/iOS */}
      {showDatePicker && (
        <DateTimePicker
          value={(showDatePicker === 'license20' ? license20Expiry : license21Expiry) || new Date()}
          mode="date"
          display="default"
          onChange={handleDateChange}
        />
      )}

      {/* Upload Bottom Sheet */}
      <Modal visible={!!showUploadSheet} transparent animationType="slide">
        <View style={styles.bottomSheetOverlay}>
          <View style={styles.bottomSheetContent}>
            <TouchableOpacity style={styles.sheetOption} onPress={() => pickImage('gallery')}>
              <ImageIcon color="#1F2937" size={24} style={styles.sheetIcon} />
              <Text style={styles.sheetOptionText}>Photo Gallery</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.sheetOption} onPress={() => setShowUploadSheet(null)}>
              <X color="#DC2626" size={24} style={styles.sheetIcon} />
              <Text style={[styles.sheetOptionText, { color: '#DC2626', fontFamily: 'Inter_700Bold' }]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Business Type Modal */}
      <Modal visible={showBusinessModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Business Type</Text>
              <TouchableOpacity onPress={() => setShowBusinessModal(false)}><X color="#666" size={24} /></TouchableOpacity>
            </View>
            {['Chemist', 'Hospital', 'Doctor'].map(type => (
              <TouchableOpacity key={type} style={styles.modalOption} onPress={() => { setBusinessType(type); setShowBusinessModal(false); }}>
                <Text style={styles.modalOptionText}>{type}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>

      {/* Area Selection Modal */}
      <Modal visible={showAreaModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Area</Text>
              <TouchableOpacity onPress={() => setShowAreaModal(false)}><X color="#666" size={24} /></TouchableOpacity>
            </View>
            <ScrollView>
              {areaOptions.map((opt, i) => (
                <TouchableOpacity key={i} style={styles.modalOption} onPress={() => { setArea(opt.Name); setShowAreaModal(false); }}>
                  <Text style={styles.modalOptionText}>{opt.Name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* OTP Verification Modal */}
      <Modal visible={showOtpModal} transparent animationType="fade">
        <View style={styles.modalOverlayCenter}>
          <View style={styles.modalContentCenter}>
            <TouchableOpacity style={styles.modalCloseIcon} onPress={() => setShowOtpModal(false)}><X color="#666" size={24} /></TouchableOpacity>
            <Text style={styles.modalTitleCentered}>Email verification</Text>
            <Text style={styles.modalSubtext}>We have sent a verification code to your email {shopEmail}</Text>

            <View style={styles.otpRow}>
              {otp.map((digit, index) => (
                <TextInput
                  key={index}
                  ref={(el) => { otpRefs.current[index] = el; }}
                  style={styles.otpInput}
                  value={digit}
                  maxLength={1}
                  keyboardType="number-pad"
                  onKeyPress={({ nativeEvent }) => {
                    if (nativeEvent.key === 'Backspace' && !digit && index > 0) {
                      otpRefs.current[index - 1]?.focus();
                    }
                  }}
                  onChangeText={(val) => {
                    const newOtp = [...otp];
                    newOtp[index] = val;
                    setOtp(newOtp);
                    if (val && index < 5) {
                      otpRefs.current[index + 1]?.focus();
                    }
                  }}
                />
              ))}
            </View>

            <Text style={styles.resendText}>
              Didn't get the code?{' '}
              {otpCountdown > 0 ? (
                <Text style={styles.countdownText}>Resend Code in 0:{otpCountdown < 10 ? `0${otpCountdown}` : otpCountdown} Sec</Text>
              ) : (
                <Text style={styles.resendLink} onPress={handleSendOtp}>Resend Code</Text>
              )}
            </Text>

            <TouchableOpacity
              style={[styles.primaryButton, otp.join('').length < 6 && styles.disabledButton]}
              onPress={handleVerifyOtp}
              disabled={otp.join('').length < 6 || isLoading}
            >
              <Text style={styles.primaryButtonText}>{isLoading ? 'Verifying...' : 'Verify'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  keyboardView: { flex: 1 },
  scrollContent: { padding: 24, flexGrow: 1 },
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 24, marginTop: 16 },
  backArrow: { marginRight: 16 },
  backArrowText: { fontSize: 24, color: '#1F2937' },
  title: { fontSize: 24, fontFamily: 'Inter_700Bold', color: '#1F2937' },
  stepperContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 32 },
  stepIndicator: { alignItems: 'center', width: 60 },
  stepCircle: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#DDDDDD', justifyContent: 'center', alignItems: 'center', marginBottom: 4 },
  stepCircleActive: { backgroundColor: '#1F5B4E' },
  stepText: { fontSize: 12, color: '#6B7280', fontFamily: 'Inter_700Bold' },
  stepTextActive: { color: '#fff' },
  stepLabel: { fontSize: 12, color: '#6B7280', fontFamily: 'Inter_400Regular' },
  stepLabelActive: { color: '#1F5B4E', fontFamily: 'Inter_700Bold' },
  stepLine: { flex: 1, height: 2, backgroundColor: '#DDDDDD', marginHorizontal: 8, marginTop: -16 },
  formSection: { flex: 1 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#DDDDDD', borderRadius: 8, marginBottom: 16, paddingHorizontal: 12, height: 50, backgroundColor: '#fff' },
  icon: { marginRight: 10 },
  input: { flex: 1, height: '100%', color: '#1F2937', fontSize: 16, fontFamily: 'Inter_400Regular' },
  inputText: { flex: 1, color: '#1F2937', fontSize: 16, fontFamily: 'Inter_400Regular' },
  placeholderText: { color: '#6B7280' },
  eyeIcon: { padding: 4 },
  row: { flexDirection: 'row' },
  flex1: { flex: 1 },
  verifyText: { color: '#1F5B4E', fontFamily: 'Inter_700Bold', fontSize: 14 },
  errorText: { color: '#DC2626', fontSize: 12, marginTop: -12, marginBottom: 16, fontFamily: 'Inter_400Regular' },
  validationBox: { marginTop: 8, marginBottom: 24 },
  validationRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  validationText: { fontSize: 12, color: '#6B7280', marginLeft: 8, fontFamily: 'Inter_400Regular' },
  validationTextValid: { color: '#1F5B4E' },
  
  // Step 3 Styles
  step3Header: { fontSize: 16, fontFamily: 'Inter_700Bold', color: '#1F2937', marginBottom: 24 },
  licenseGroup: { marginBottom: 24 },
  licenseLabelRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  licenseLabel: { fontSize: 14, fontFamily: 'Inter_700Bold', color: '#1F2937' },
  asterisk: { color: '#DC2626' },
  infoIcon: { marginLeft: 6 },
  uploadBox: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', height: 50, borderWidth: 1, borderColor: '#1F5B4E', borderStyle: 'dashed', borderRadius: 8, backgroundColor: '#fff', paddingHorizontal: 12 },
  uploadText: { color: '#1F5B4E', fontSize: 14, fontFamily: 'Inter_700Bold', flex: 1 },
  otherHeader: { fontSize: 16, fontFamily: 'Inter_700Bold', color: '#1F2937', marginBottom: 16, marginTop: 8 },
  checkboxContainer: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 16 },
  checkbox: { width: 20, height: 20, justifyContent: 'center', alignItems: 'center', marginRight: 10, marginTop: 2 },
  checkboxUnchecked: { width: 18, height: 18, borderWidth: 1, borderColor: '#DDDDDD', borderRadius: 4, backgroundColor: '#fff' },
  checkboxText: { flex: 1, fontSize: 14, color: '#6B7280', fontFamily: 'Inter_400Regular', lineHeight: 20 },
  linkText: { color: '#1F5B4E', fontFamily: 'Inter_700Bold' },

  actionButtons: { flexDirection: 'row', gap: 16, marginTop: 32 },
  backButton: { flex: 1, height: 50, borderRadius: 8, borderWidth: 1, borderColor: '#DDDDDD', justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  backButtonText: { color: '#1F2937', fontSize: 16, fontFamily: 'Inter_700Bold' },
  submitButton: { flex: 2, height: 50, borderRadius: 8, backgroundColor: '#1F5B4E', justifyContent: 'center', alignItems: 'center' },
  disabledButton: { backgroundColor: '#A8C4BC' },
  submitButtonText: { color: '#fff', fontSize: 16, fontFamily: 'Inter_700Bold' },

  // Bottom Sheet
  bottomSheetOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  bottomSheetContent: { backgroundColor: '#fff', borderTopLeftRadius: 16, borderTopRightRadius: 16, paddingBottom: Platform.OS === 'ios' ? 34 : 20 },
  sheetOption: { flexDirection: 'row', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  sheetIcon: { marginRight: 16 },
  sheetOptionText: { fontSize: 16, fontFamily: 'Inter_400Regular', color: '#1F2937' },
  sheetOptionCancel: { padding: 20, alignItems: 'center' },
  sheetOptionTextCancel: { fontSize: 16, fontFamily: 'Inter_700Bold', color: '#DC2626' },

  // Modals
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 16, borderTopRightRadius: 16, padding: 24, maxHeight: '80%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 18, fontFamily: 'Inter_700Bold', color: '#1F2937' },
  modalOption: { paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  modalOptionText: { fontSize: 16, color: '#1F2937', fontFamily: 'Inter_400Regular' },
  
  modalOverlayCenter: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContentCenter: { backgroundColor: '#fff', borderRadius: 16, padding: 24, width: '90%', maxWidth: 400 },
  modalCloseIcon: { alignSelf: 'flex-start', marginBottom: 16 },
  modalTitleCentered: { fontSize: 20, fontFamily: 'Inter_700Bold', color: '#1F2937', textAlign: 'center', marginBottom: 8 },
  modalSubtext: { fontSize: 14, color: '#6B7280', textAlign: 'center', marginBottom: 24, fontFamily: 'Inter_400Regular' },
  otpRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 },
  otpInput: { width: 45, height: 55, borderWidth: 1, borderColor: '#DDDDDD', borderRadius: 8, textAlign: 'center', fontSize: 24, fontFamily: 'Inter_700Bold', color: '#1F2937', backgroundColor: '#fff' },
  resendText: { textAlign: 'center', fontSize: 14, color: '#6B7280', marginBottom: 24, fontFamily: 'Inter_400Regular' },
  countdownText: { color: '#1F2937' },
  resendLink: { color: '#1F5B4E', fontFamily: 'Inter_700Bold' },
  primaryButton: { backgroundColor: '#1F5B4E', height: 50, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  primaryButtonText: { color: '#fff', fontSize: 16, fontFamily: 'Inter_700Bold' },
});
