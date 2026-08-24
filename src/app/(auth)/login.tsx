import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, Keyboard, StatusBar, TextInput, ScrollView, BackHandler } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, Easing, interpolate, interpolateColor, Extrapolation } from 'react-native-reanimated';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react-native';
import { Link, useRouter } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import WebStyleInput from '@/components/WebStyleInput';
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

    const showSub = Keyboard.addListener(showEvt, () => {
      isKeyboardOpen.value = withTiming(1, { duration: 300, easing: Easing.out(Easing.ease) });
    });

    const backAction = () => {
      if (isKeyboardOpen.value > 0) {
        isKeyboardOpen.value = withTiming(0, { duration: 300, easing: Easing.out(Easing.ease) });
        return true; // prevent default back action
      }
      return false; // allow default back action (exit app if at root)
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);

    return () => {
      showSub.remove();
      backHandler.remove();
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

        <ScrollView style={styles.formScroll} contentContainerStyle={styles.formContainer} showsVerticalScrollIndicator={false}>
          <Text style={styles.title}>Login</Text>
          <Text style={styles.subtitle}>Enter your credentials to access account</Text>

          {apiError ? <Text style={styles.errorText}>{apiError}</Text> : null}

          <View style={styles.field}>
            <Text style={styles.label}>Email</Text>
            <WebStyleInput
              leftIcon={<Mail color="#7e938e" size={17} />}
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Password</Text>
            <WebStyleInput
              leftIcon={<Lock color="#7e938e" size={17} />}
              rightIcon={showPassword ? <EyeOff color="#7e938e" size={17} /> : <Eye color="#7e938e" size={17} />}
              onRightIconPress={() => setShowPassword(!showPassword)}
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
          </View>

          <TouchableOpacity 
            style={[styles.primaryButton, !isButtonEnabled && styles.disabledButton]} 
            onPress={handleLogin}
            disabled={!isButtonEnabled || isLoading}
          >
            <Text style={[styles.primaryButtonText, !isButtonEnabled && styles.disabledButtonText]}>
              {isLoading ? 'Logging in...' : 'Login'}
            </Text>
          </TouchableOpacity>

          <View style={styles.forgotPassword}>
            <TouchableOpacity>
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.dividerContainer}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>Or</Text>
            <View style={styles.dividerLine} />
          </View>

          <View style={styles.signupContainer}>
            <Text style={styles.signupText}>Are you a new user? </Text>
            <Link href="/(auth)/signup" asChild>
              <TouchableOpacity>
                <Text style={styles.signupLink}>Register</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#faf6df',
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
    backgroundColor: '#1E3E34',
  },
  heroImg: {
    width: '100%',
    height: 300, 
    transform: [{ scale: 1.02 }],
  },
  formScroll: {
    flex: 1,
    backgroundColor: '#faf6df',
    borderTopWidth: 1,
    borderTopColor: '#e9e8e2',
  },
  formContainer: {
    flexGrow: 1,
    padding: 24,
    paddingTop: 50,
    paddingBottom: 40,
  },
  title: {
    fontSize: 34,
    fontFamily: 'Inter_700Bold', fontWeight: 'bold',
    color: '#14211d',
    marginBottom: 17,
    textAlign: 'center',
    letterSpacing: 0,
  },
  subtitle: {
    fontSize: 13, 
    fontFamily: 'Inter_400Regular', 
    color: '#999999',
    marginBottom: 20,
    textAlign: 'center',
  },
  errorText: {
    color: '#e74c3c',
    marginBottom: 16,
    textAlign: 'center',
  },
  field: {
    marginBottom: 25,
  },
  label: {
    fontSize: 13,
    fontFamily: 'Inter_600SemiBold', fontWeight: '600',
    color: '#223330',
    marginBottom: 10,
  },
  primaryButton: {
    backgroundColor: '#00865e',
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 5,
    marginBottom: 27,
  },
  disabledButton: {
    backgroundColor: '#e0e0e0',
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontFamily: 'Inter_600SemiBold', fontWeight: '600',
  },
  disabledButtonText: {
    color: '#999',
  },
  forgotPassword: {
    alignItems: 'center',
    marginBottom: 27,
  },
  forgotPasswordText: {
    color: '#223330',
    fontSize: 14, 
    fontFamily: 'Inter_500Medium', 
    fontWeight: '500',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 29,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e9e8e2',
  },
  dividerText: {
    marginHorizontal: 12,
    color: '#9a9a9a',
    fontSize: 12, 
    fontFamily: 'Inter_400Regular',
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  signupText: {
    color: '#223330',
    fontSize: 14, 
    fontFamily: 'Inter_400Regular', 
  },
  signupLink: {
    color: '#00865e',
    fontSize: 14,
    fontFamily: 'Inter_700Bold', fontWeight: 'bold',
  },
});
