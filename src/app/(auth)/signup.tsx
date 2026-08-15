import React, { useState, useMemo } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { User, Lock, Eye, EyeOff, Phone, Mail, Building2, UserCircle } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/store/authStore';

export default function SignupScreen() {
  const router = useRouter();
  const signup = useAuthStore((state) => state.signup);
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [distributorCode, setDistributorCode] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [email, setEmail] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const isFormValid = useMemo(() => {
    return (
      username.trim() !== '' &&
      password.trim() !== '' &&
      distributorCode.trim() !== '' &&
      firstName.trim() !== '' &&
      lastName.trim() !== '' &&
      mobileNumber.trim() !== '' &&
      email.trim() !== '' &&
      termsAccepted
    );
  }, [username, password, distributorCode, firstName, lastName, mobileNumber, email, termsAccepted]);

  const handleSignup = async () => {
    if (!isFormValid) return;
    
    setIsLoading(true);
    setError('');
    
    const { error: signupError } = await signup({
      username,
      password,
      distributorCode,
      firstName,
      lastName,
      mobileNumber,
      email,
      termsAccepted
    });
    
    setIsLoading(false);
    
    if (signupError) {
      setError(signupError.message);
    } else {
      router.replace('/');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <Text style={styles.title}>Create your account</Text>
            <Text style={styles.subtitle}>Join MedConnect today</Text>
          </View>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <View style={styles.row}>
            <View style={[styles.inputContainer, styles.flex1, { marginRight: 8 }]}>
              <UserCircle color="#666" size={20} style={styles.icon} />
              <TextInput
                style={styles.input}
                placeholder="First name *"
                value={firstName}
                onChangeText={setFirstName}
                placeholderTextColor="#999"
              />
            </View>
            <View style={[styles.inputContainer, styles.flex1, { marginLeft: 8 }]}>
              <UserCircle color="#666" size={20} style={styles.icon} />
              <TextInput
                style={styles.input}
                placeholder="Last name *"
                value={lastName}
                onChangeText={setLastName}
                placeholderTextColor="#999"
              />
            </View>
          </View>

          <View style={styles.inputContainer}>
            <User color="#666" size={20} style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="Username *"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.inputContainer}>
            <Mail color="#666" size={20} style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="Email address *"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.inputContainer}>
            <Phone color="#666" size={20} style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="Mobile number *"
              value={mobileNumber}
              onChangeText={setMobileNumber}
              keyboardType="phone-pad"
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.inputContainer}>
            <Building2 color="#666" size={20} style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="Distributor code *"
              value={distributorCode}
              onChangeText={setDistributorCode}
              autoCapitalize="characters"
              placeholderTextColor="#999"
            />
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

          <TouchableOpacity 
            style={styles.checkboxContainer} 
            onPress={() => setTermsAccepted(!termsAccepted)}
            activeOpacity={0.7}
          >
            <View style={[styles.checkbox, termsAccepted && styles.checkboxChecked]}>
              {termsAccepted && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text style={styles.checkboxText}>
              By clicking Register, you agree to Terms and Conditions and Privacy Policy
            </Text>
          </TouchableOpacity>

          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={styles.backButton} 
              onPress={() => router.back()}
              disabled={isLoading}
            >
              <Text style={styles.backButtonText}>Back</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.submitButton, (!isFormValid || isLoading) && styles.disabledButton]} 
              onPress={handleSignup}
              disabled={!isFormValid || isLoading}
            >
              <Text style={styles.submitButtonText}>{isLoading ? 'Loading...' : 'Submit'}</Text>
            </TouchableOpacity>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    flexGrow: 1,
  },
  header: {
    marginBottom: 32,
    marginTop: 16,
  },
  title: {
    fontSize: 28, fontFamily: 'Inter_400Regular',
    fontFamily: 'Inter_700Bold', fontWeight: 'bold',
    color: '#0F9B8E',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16, fontFamily: 'Inter_400Regular',
    color: '#666',
  },
  errorText: {
    color: '#e74c3c',
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
  },
  flex1: {
    flex: 1,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 16,
    paddingHorizontal: 12,
    height: 50,
    backgroundColor: '#fafafa',
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: '100%',
    color: '#1F2937',
    fontSize: 16, fontFamily: 'Inter_400Regular',
  },
  eyeIcon: {
    padding: 4,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 32,
    marginTop: 8,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#0F9B8E',
    borderRadius: 4,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: '#0F9B8E',
  },
  checkmark: {
    color: '#fff',
    fontSize: 12, fontFamily: 'Inter_400Regular',
    fontFamily: 'Inter_700Bold', fontWeight: 'bold',
  },
  checkboxText: {
    flex: 1,
    color: '#666',
    fontSize: 14, fontFamily: 'Inter_400Regular',
    lineHeight: 20,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 'auto',
  },
  backButton: {
    flex: 1,
    height: 50,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  backButtonText: {
    color: '#666',
    fontSize: 16, fontFamily: 'Inter_400Regular',
    fontFamily: 'Inter_700Bold', fontWeight: 'bold',
  },
  submitButton: {
    flex: 2,
    height: 50,
    borderRadius: 8,
    backgroundColor: '#0F9B8E',
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#cccccc',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16, fontFamily: 'Inter_400Regular',
    fontFamily: 'Inter_700Bold', fontWeight: 'bold',
  },
});
