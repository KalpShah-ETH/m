import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, KeyboardAvoidingView, Platform, ScrollView, Modal, ActivityIndicator } from 'react-native';
import { Store, MapPin, Mail, CheckCircle, X, Eye, EyeOff, Lock, User, Phone, ChevronDown } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/store/authStore';

export default function SignupScreen() {
  const router = useRouter();
  const signup = useAuthStore((state) => state.signup);
  const sendEmailOtp = useAuthStore((state) => state.sendEmailOtp);
  const verifyEmailOtp = useAuthStore((state) => state.verifyEmailOtp);
  
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  
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
  
  // Password Validation
  const pwdLength = password.length >= 8;
  const pwdMix = /[0-9]/.test(password) && /[A-Z]/.test(password) && /[a-z]/.test(password);
  const pwdSpecial = /[@\-._,]/.test(password); // Adjusted regex to include these specifically or generic special char
  const pwdNoSpaces = password.length > 0 && !password.startsWith(' ') && !password.endsWith(' ');
  const isPasswordValid = pwdLength && pwdMix && pwdSpecial && pwdNoSpaces;

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

  const handlePincodeBlur = () => {
    if (pincode.length === 6) {
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
      setEmailError('Failed to send verification code.');
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
      setShowOtpModal(false); // or keep it open and show error inside modal
    }
  };

  const isStep1Valid = businessType && shopFirmName && ownerName && shopAddress && pincode.length === 6 && area && city && stateName;
  const isStep2Valid = emailVerified && isPasswordValid;

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
                  onChangeText={setPincode} 
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
                  <Text style={[styles.validationText, pwdSpecial && styles.validationTextValid]}>At least one special character (For ex: @, -, _, ., ,)</Text>
                </View>
                <View style={styles.validationRow}>
                  <CheckCircle size={16} color={pwdNoSpaces ? "#1F5B4E" : "#ccc"} />
                  <Text style={[styles.validationText, pwdNoSpaces && styles.validationTextValid]}>No space at the start or end</Text>
                </View>
                <Text style={styles.validationHelper}>Password example: MedConnect@123, Abhi_1234</Text>
              </View>
            </View>
          )}

          {currentStep === 3 && (
            <View style={styles.formSection}>
              <Text style={styles.subtitle}>License step pending implementation.</Text>
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
              style={[styles.submitButton, ((currentStep === 1 && !isStep1Valid) || (currentStep === 2 && !isStep2Valid) || isLoading) && styles.disabledButton]} 
              onPress={() => {
                if (currentStep === 1 && isStep1Valid) setCurrentStep(2);
                if (currentStep === 2 && isStep2Valid) setCurrentStep(3);
                // Step 3 logic to follow
              }}
              disabled={(currentStep === 1 && !isStep1Valid) || (currentStep === 2 && !isStep2Valid) || isLoading}
            >
              <Text style={styles.submitButtonText}>{isLoading ? 'Loading...' : 'Next'}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

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
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity style={styles.modalCloseIcon} onPress={() => setShowOtpModal(false)}><X color="#666" size={24} /></TouchableOpacity>
            <Text style={styles.modalTitleCentered}>Email verification</Text>
            <Text style={styles.modalSubtext}>We have sent a verification code to your email {shopEmail}</Text>
            
            <View style={styles.otpRow}>
              {otp.map((digit, index) => (
                <TextInput
                  key={index}
                  style={styles.otpInput}
                  value={digit}
                  maxLength={1}
                  keyboardType="number-pad"
                  onChangeText={(val) => {
                    const newOtp = [...otp];
                    newOtp[index] = val;
                    setOtp(newOtp);
                    // Focusing next input omitted for brevity, would need refs in full prod app
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
  container: { flex: 1, backgroundColor: '#fff' },
  keyboardView: { flex: 1 },
  scrollContent: { padding: 24, flexGrow: 1 },
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 24, marginTop: 16 },
  backArrow: { marginRight: 16 },
  backArrowText: { fontSize: 24, color: '#333' },
  title: { fontSize: 24, fontFamily: 'Inter_700Bold', color: '#1F2937' },
  subtitle: { fontSize: 16, fontFamily: 'Inter_400Regular', color: '#666', marginTop: 8 },
  stepperContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 32 },
  stepIndicator: { alignItems: 'center', width: 60 },
  stepCircle: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#f0f0f0', justifyContent: 'center', alignItems: 'center', marginBottom: 4 },
  stepCircleActive: { backgroundColor: '#1F5B4E' },
  stepText: { fontSize: 12, color: '#999', fontFamily: 'Inter_700Bold' },
  stepTextActive: { color: '#fff' },
  stepLabel: { fontSize: 12, color: '#999', fontFamily: 'Inter_400Regular' },
  stepLabelActive: { color: '#1F5B4E', fontFamily: 'Inter_700Bold' },
  stepLine: { flex: 1, height: 2, backgroundColor: '#f0f0f0', marginHorizontal: 8, marginTop: -16 },
  formSection: { flex: 1 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#ddd', borderRadius: 8, marginBottom: 16, paddingHorizontal: 12, height: 50, backgroundColor: '#fafafa' },
  icon: { marginRight: 10 },
  input: { flex: 1, height: '100%', color: '#1F2937', fontSize: 16, fontFamily: 'Inter_400Regular' },
  inputText: { flex: 1, color: '#1F2937', fontSize: 16, fontFamily: 'Inter_400Regular' },
  placeholderText: { color: '#999' },
  eyeIcon: { padding: 4 },
  row: { flexDirection: 'row' },
  flex1: { flex: 1 },
  verifyText: { color: '#1F5B4E', fontFamily: 'Inter_700Bold', fontSize: 14 },
  errorText: { color: '#DC2626', fontSize: 12, marginTop: -12, marginBottom: 16, fontFamily: 'Inter_400Regular' },
  validationBox: { marginTop: 8, marginBottom: 24 },
  validationRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  validationText: { fontSize: 12, color: '#666', marginLeft: 8, fontFamily: 'Inter_400Regular' },
  validationTextValid: { color: '#1F5B4E' },
  validationHelper: { fontSize: 11, color: '#999', marginTop: 4, fontFamily: 'Inter_400Regular' },
  actionButtons: { flexDirection: 'row', gap: 16, marginTop: 32 },
  backButton: { flex: 1, height: 50, borderRadius: 8, borderWidth: 1, borderColor: '#ccc', justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  backButtonText: { color: '#666', fontSize: 16, fontFamily: 'Inter_700Bold' },
  submitButton: { flex: 2, height: 50, borderRadius: 8, backgroundColor: '#1F5B4E', justifyContent: 'center', alignItems: 'center' },
  disabledButton: { backgroundColor: '#cccccc' },
  submitButtonText: { color: '#fff', fontSize: 16, fontFamily: 'Inter_700Bold' },
  
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 16, borderTopRightRadius: 16, padding: 24, maxHeight: '80%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 18, fontFamily: 'Inter_700Bold', color: '#1F2937' },
  modalOption: { paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  modalOptionText: { fontSize: 16, color: '#1F2937', fontFamily: 'Inter_400Regular' },
  
  modalCloseIcon: { alignSelf: 'flex-start', marginBottom: 16 },
  modalTitleCentered: { fontSize: 20, fontFamily: 'Inter_700Bold', color: '#1F2937', textAlign: 'center', marginBottom: 8 },
  modalSubtext: { fontSize: 14, color: '#666', textAlign: 'center', marginBottom: 24, fontFamily: 'Inter_400Regular' },
  otpRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 },
  otpInput: { width: 45, height: 55, borderWidth: 1, borderColor: '#ddd', borderRadius: 8, textAlign: 'center', fontSize: 24, fontFamily: 'Inter_700Bold', color: '#1F2937', backgroundColor: '#fafafa' },
  resendText: { textAlign: 'center', fontSize: 14, color: '#666', marginBottom: 24, fontFamily: 'Inter_400Regular' },
  countdownText: { color: '#1F2937' },
  resendLink: { color: '#1F5B4E', fontFamily: 'Inter_700Bold' },
  primaryButton: { backgroundColor: '#1F5B4E', height: 50, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  primaryButtonText: { color: '#fff', fontSize: 16, fontFamily: 'Inter_700Bold' },
});
