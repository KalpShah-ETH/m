import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { useAccountStore } from '@/store/accountStore';

export default function TermsScreen() {
  const router = useRouter();
  const { staticContent, fetchStaticContent } = useAccountStore();

  useEffect(() => {
    if (!staticContent.terms) {
      fetchStaticContent('terms');
    }
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft color="#1F2937" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Terms & Conditions</Text>
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        {!staticContent.terms ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#0F9B8E" />
          </View>
        ) : (
          <Text style={styles.contentText}>{staticContent.terms}</Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 20, fontFamily: 'Inter_400Regular',
    fontFamily: 'Inter_700Bold', fontWeight: 'bold',
    color: '#1F2937',
  },
  container: {
    padding: 24,
  },
  loadingContainer: {
    paddingTop: 40,
    alignItems: 'center',
  },
  contentText: {
    fontSize: 16, fontFamily: 'Inter_400Regular',
    lineHeight: 24,
    color: '#1F2937',
  },
});
