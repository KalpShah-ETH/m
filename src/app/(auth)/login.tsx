import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, Keyboard, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, Easing, interpolate, interpolateColor, Extrapolation } from 'react-native-reanimated';
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
    const showEvt = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvt = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSub = Keyboard.addListener(showEvt, () => {
      isKeyboardOpen.value = withTiming(1, { duration: 300, easing: Easing.out(Easing.ease) });
    });
    const hideSub = Keyboard.addListener(hideEvt, () => {
      isKeyboardOpen.value = withTiming(0, { duration: 300, easing: Easing.out(Easing.ease) });
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  // Hero: collapses away completely
  const heroStyle = useAnimatedStyle(() => ({
    height: interpolate(isKeyboardOpen.value, [0, 1], [300, 0], Extrapolation.CLAMP),
    opacity: interpolate(isKeyboardOpen.value, [0, 1], [1, 0], Extrapolation.CLAMP),
  }));

  // Small logo header: separate element, grows in as hero disappears
  const logoHeaderStyle = useAnimatedStyle(() => ({
    height: interpolate(isKeyboardOpen.value, [0, 1], [0, 120], Extrapolation.CLAMP),
    opacity: interpolate(isKeyboardOpen.value, [0, 1], [0, 1], Extrapolation.CLAMP),
  }));

  const handleLogin = async () => {
    if (!email || !password) return;
    
    setIsLoading(true);
    setApiError('');
    
    const result = await login(email, password);
    
    setIsLoading(false);
    
    if (result.error) {
      setApiError(result.error.message);
    } else {
      Toast.show({ type: 'success', text1: 'Welcome back!', text2: 'Successfully logged in.' });
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
        {/* Small logo header — sibling, NOT nested inside hero */}
        <Animated.View style={[styles.logoHeader, logoHeaderStyle]}>
          <Image
            source={require('@/assets/images/logo-1-nodal-cross.png')}
            style={styles.logoImg}
            contentFit="contain"
          />
        </Animated.View>

        {/* Hero — collapses on its own, no absolute children inside it */}
        <Animated.View style={[styles.heroWrap, heroStyle]}>
          <Image
            source={require('@/assets/images/hero.png')}
            style={styles.heroImg}
            contentFit="cover"
          />
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
  logoHeader: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  logoImg: {
    height: 88,
    width: 260,
  },
  heroWrap: {
    width: '100%',
    overflow: 'hidden',
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    backgroundColor: '#1E3E34', // Fills any transparent gaps with the brand color
  },
  heroImg: {
    width: '100%',
    height: 300, 
    transform: [{ scale: 1.02 }], // Slight stretch to hide baked-in PNG transparent borders
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
