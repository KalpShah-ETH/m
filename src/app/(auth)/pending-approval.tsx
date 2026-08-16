import { useRouter } from 'expo-router';
import { Clock } from 'lucide-react-native';
import React from 'react';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAuthStore } from '@/store/authStore';

export default function PendingApprovalScreen() {
  const router = useRouter();
  const logout = useAuthStore((state) => state.logout);

  const handleBackToLogin = async () => {
    await logout();
    router.replace('/(auth)/login');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.centerContainer}>
          <Clock color="#1F5B4E" size={64} strokeWidth={1.5} />
          <Text style={styles.title}>Application Under Review</Text>
          <Text style={styles.subtext}>
            Thanks for registering! Your application is being reviewed by our team.
            You'll be notified once your account is approved.
          </Text>
        </View>

        <View style={styles.bottomContainer}>
          <TouchableOpacity style={styles.outlineButton} onPress={handleBackToLogin}>
            <Text style={styles.outlineButtonText}>Back to Login</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'space-between',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontFamily: 'Inter_700Bold',
    color: '#1F2937',
    marginTop: 24,
    marginBottom: 12,
    textAlign: 'center',
  },
  subtext: {
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 16,
  },
  bottomContainer: {
    paddingBottom: 24,
  },
  outlineButton: {
    height: 50,
    borderWidth: 1,
    borderColor: '#1F5B4E',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  outlineButtonText: {
    color: '#1F5B4E',
    fontSize: 16,
    fontFamily: 'Inter_700Bold',
  },
});
