import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, KeyboardAvoidingView, Platform } from 'react-native';
import { User, Lock, Eye, EyeOff, Phone } from 'lucide-react-native';
import { Link, useRouter } from 'expo-router';
import { useAuthStore } from '@/store/authStore';

export default function LoginScreen() {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!username || !password) {
      setError('Please enter both username and password.');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    const { error: loginError } = await login(username, password);
    
    setIsLoading(false);
    
    if (loginError) {
      setError(loginError.message);
    } else {
      router.replace('/'); // Adjust depending on your tab layout route
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.formContainer}>
          <Text style={styles.title}>MedConnect</Text>
          <Text style={styles.subtitle}>Welcome back</Text>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <View style={styles.inputContainer}>
            <User color="#666" size={20} style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="Username"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.inputContainer}>
            <Lock color="#666" size={20} style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="Password"
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
            style={[styles.primaryButton, isLoading && styles.disabledButton]} 
            onPress={handleLogin}
            disabled={isLoading}
          >
            <Text style={styles.primaryButtonText}>{isLoading ? 'Logging in...' : 'Login'}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.forgotPassword}>
            <Text style={styles.forgotPasswordText}>Forgot Username/Password?</Text>
          </TouchableOpacity>

          <View style={styles.dividerContainer}>
            <View style={styles.divider} />
            <Text style={styles.dividerText}>Or</Text>
            <View style={styles.divider} />
          </View>

          <TouchableOpacity style={styles.outlineButton}>
            <Phone color="#0F9B8E" size={20} style={styles.buttonIcon} />
            <Text style={styles.outlineButtonText}>Login with mobile OTP</Text>
          </TouchableOpacity>

          <View style={styles.dividerContainer}>
            <View style={styles.divider} />
            <Text style={styles.dividerText}>Or</Text>
            <View style={styles.divider} />
          </View>

          <View style={styles.signupContainer}>
            <Text style={styles.signupText}>Are you a new user? </Text>
            <Link href="/(auth)/signup" asChild>
              <TouchableOpacity>
                <Text style={styles.signupLink}>Sign Up</Text>
              </TouchableOpacity>
            </Link>
          </View>

        </View>
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
  formContainer: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  title: {
    fontSize: 32, fontFamily: 'Inter_400Regular',
    fontFamily: 'Inter_700Bold', fontWeight: 'bold',
    color: '#0F9B8E',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18, fontFamily: 'Inter_400Regular',
    color: '#666',
    marginBottom: 32,
    textAlign: 'center',
  },
  errorText: {
    color: '#e74c3c',
    marginBottom: 16,
    textAlign: 'center',
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
  primaryButton: {
    backgroundColor: '#0F9B8E',
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  disabledButton: {
    backgroundColor: '#99c2ff',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16, fontFamily: 'Inter_400Regular',
    fontFamily: 'Inter_700Bold', fontWeight: 'bold',
  },
  forgotPassword: {
    alignItems: 'flex-end',
    marginTop: 16,
  },
  forgotPasswordText: {
    color: '#0F9B8E',
    fontSize: 14, fontFamily: 'Inter_400Regular',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#eee',
  },
  dividerText: {
    marginHorizontal: 16,
    color: '#999',
    fontSize: 14, fontFamily: 'Inter_400Regular',
  },
  outlineButton: {
    flexDirection: 'row',
    height: 50,
    borderWidth: 1,
    borderColor: '#0F9B8E',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonIcon: {
    marginRight: 8,
  },
  outlineButtonText: {
    color: '#0F9B8E',
    fontSize: 16, fontFamily: 'Inter_400Regular',
    fontFamily: 'Inter_700Bold', fontWeight: 'bold',
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 8,
  },
  signupText: {
    color: '#666',
    fontSize: 15, fontFamily: 'Inter_400Regular',
  },
  signupLink: {
    color: '#0F9B8E',
    fontSize: 15, fontFamily: 'Inter_400Regular',
    fontFamily: 'Inter_700Bold', fontWeight: 'bold',
  },
});
