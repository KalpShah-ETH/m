import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, Keyboard } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, Easing, interpolate, interpolateColor } from 'react-native-reanimated';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react-native';
import { Link, useRouter } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import FloatingLabelInput from '@/components/FloatingLabelInput';
import { Image } from 'expo-image';

export default function LoginScreen() {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  // Keyboard animation state
  const isKeyboardOpen = useSharedValue(0);

  useEffect(() => {
    const showSubscription = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      () => {
        isKeyboardOpen.value = withTiming(1, { duration: 300, easing: Easing.out(Easing.ease) });
      }
    );
    const hideSubscription = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        isKeyboardOpen.value = withTiming(0, { duration: 300, easing: Easing.out(Easing.ease) });
      }
    );

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  const headerStyle = useAnimatedStyle(() => {
    return {
      height: interpolate(isKeyboardOpen.value, [0, 1], [300, 120]),
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: interpolateColor(isKeyboardOpen.value, [0, 1], ['#1E3E34', 'transparent']),
      borderBottomLeftRadius: interpolate(isKeyboardOpen.value, [0, 1], [40, 0]),
      borderBottomRightRadius: interpolate(isKeyboardOpen.value, [0, 1], [40, 0]),
      overflow: 'hidden',
      zIndex: 10,
    };
  });

  const bigImageStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(isKeyboardOpen.value, [0, 1], [1, 0]),
      height: interpolate(isKeyboardOpen.value, [0, 1], [300, 0]),
      width: '100%',
      position: 'absolute',
      bottom: interpolate(isKeyboardOpen.value, [0, 1], [-40, 0]), // Shift downwards to overlap the curve
      zIndex: 15,
    };
  });

  const smallLogoStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(isKeyboardOpen.value, [0, 1], [0, 1]),
      height: interpolate(isKeyboardOpen.value, [0, 1], [0, 80]),
      width: interpolate(isKeyboardOpen.value, [0, 1], [0, 200]),
      marginTop: interpolate(isKeyboardOpen.value, [0, 1], [0, 30]),
    };
  });

  const handleLogin = async () => {
    if (!email || !password) return;
    
    setIsLoading(true);
    setApiError('');
    
    const result = await login(email, password);
    
    setIsLoading(false);
    
    if (result.error) {
      setApiError(result.error.message);
    } else {
      router.replace('/'); 
    }
  };

  const isButtonEnabled = email.length > 0 && password.length > 0;

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <Animated.View style={headerStyle}>
          <Animated.View style={bigImageStyle}>
            <Image 
              source={require('@/assets/images/hero.png')} 
              style={{ width: '100%', height: '100%' }} 
              contentFit="cover" // Cover so it doesn't leave empty gaps on the sides
            />
          </Animated.View>
          <Animated.View style={[smallLogoStyle, { position: 'absolute' }]}>
            <Image 
              source={require('@/assets/images/logo-1-nodal-cross.png')} 
              style={{ width: '100%', height: '100%' }} 
              contentFit="contain" 
            />
          </Animated.View>
        </Animated.View>

        <View style={styles.formContainer}>
          <Text style={styles.title}>Login</Text>
          <Text style={styles.subtitle}>Enter your credentials to access account</Text>

          {apiError ? <Text style={styles.errorText}>{apiError}</Text> : null}

          <FloatingLabelInput
            label="Email"
            value={email}
            onChangeText={setEmail}
            leftIcon={<Mail color="#666" size={20} />}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <FloatingLabelInput
            label="Password"
            value={password}
            onChangeText={setPassword}
            leftIcon={<Lock color="#666" size={20} />}
            rightIcon={showPassword ? <EyeOff color="#666" size={20} /> : <Eye color="#666" size={20} />}
            onRightIconPress={() => setShowPassword(!showPassword)}
            isPassword={!showPassword}
          />

          <TouchableOpacity 
            style={[styles.primaryButton, !isButtonEnabled && styles.disabledButton]} 
            onPress={handleLogin}
            disabled={!isButtonEnabled || isLoading}
          >
            <Text style={[styles.primaryButtonText, !isButtonEnabled && styles.disabledButtonText]}>
              {isLoading ? 'Logging in...' : 'Login'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.forgotPassword}>
            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
          </TouchableOpacity>

          <View style={styles.dividerContainer}>
            <Text style={styles.dividerText}>Or</Text>
          </View>

          <View style={styles.signupContainer}>
            <Text style={styles.signupText}>Are you a new user? </Text>
            <Link href="/(auth)/signup" asChild>
              <TouchableOpacity>
                <Text style={styles.signupLink}>Register</Text>
              </TouchableOpacity>
            </Link>
          </View>

        </View>
      </KeyboardAvoidingView>
    </View>
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
    paddingTop: 50, // Added extra padding so the overlapping image doesn't block the text
  },
  title: {
    fontSize: 32,
    fontFamily: 'Inter_700Bold', fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16, 
    fontFamily: 'Inter_700Bold', 
    fontWeight: 'bold',
    color: '#999',
    marginBottom: 32,
    textAlign: 'center',
  },
  errorText: {
    color: '#e74c3c',
    marginBottom: 16,
    textAlign: 'center',
  },
  primaryButton: {
    backgroundColor: '#5076cf',
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  disabledButton: {
    backgroundColor: '#e0e0e0',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 18,
    fontFamily: 'Inter_700Bold', fontWeight: 'bold',
  },
  disabledButtonText: {
    color: '#999',
  },
  forgotPassword: {
    alignItems: 'center',
    marginTop: 24,
  },
  forgotPasswordText: {
    color: '#1F2937',
    fontSize: 15, 
    fontFamily: 'Inter_700Bold', 
    fontWeight: 'bold',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 24,
  },
  dividerText: {
    marginHorizontal: 16,
    color: '#999',
    fontSize: 14, fontFamily: 'Inter_400Regular',
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 8,
  },
  signupText: {
    color: '#666',
    fontSize: 15, 
    fontFamily: 'Inter_700Bold', 
    fontWeight: 'bold',
  },
  signupLink: {
    color: '#5076cf',
    fontSize: 15,
    fontFamily: 'Inter_700Bold', fontWeight: 'bold',
  },
});
