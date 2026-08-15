import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, TextInput, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, CheckCircle, Circle, ShoppingCart } from 'lucide-react-native';
import { useReturnsStore, ReturnItem } from '@/store/returnsStore';

export default function InitiateReturnScreen() {
  const router = useRouter();
  const { initiateReturn } = useReturnsStore();

  const [step, setStep] = useState(1);
  const [orderId, setOrderId] = useState('');
  const [selectedType, setSelectedType] = useState<'saleable' | 'expiry'>('saleable');
  
  // Mock items for the selected order
  const mockOrderItems = [
    { id: 'i1', name: 'Paracetamol 500mg', qty: 10 },
    { id: 'i2', name: 'Azithromycin 250mg', qty: 5 },
  ];
  
  const [selectedItems, setSelectedItems] = useState<ReturnItem[]>([]);

  const toggleItem = (item: any) => {
    const existing = selectedItems.find(i => i.id === item.id);
    if (existing) {
      setSelectedItems(selectedItems.filter(i => i.id !== item.id));
    } else {
      setSelectedItems([...selectedItems, { id: item.id, productName: item.name, quantity: 1, reason: selectedType }]);
    }
  };

  const updateItemQty = (id: string, qty: string) => {
    const numQty = parseInt(qty) || 0;
    setSelectedItems(selectedItems.map(i => i.id === id ? { ...i, quantity: numQty } : i));
  };

  const handleNext = () => {
    if (step === 1) {
      if (!orderId) {
        Alert.alert('Error', 'Please enter an Order ID to fetch items.');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (selectedItems.length === 0) {
        Alert.alert('Error', 'Please select at least one item to return.');
        return;
      }
      setStep(3);
    }
  };

  const handleSubmit = async () => {
    const { success } = await initiateReturn({
      orderId,
      items: selectedItems,
      type: selectedType
    });
    if (success) {
      Alert.alert('Success', 'Return draft created successfully', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => step > 1 ? setStep(step - 1) : router.back()} style={styles.backButton}>
          <ArrowLeft color="#333" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Initiate Return</Text>
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        
        {/* Step Indicator */}
        <View style={styles.stepContainer}>
          <Text style={styles.stepText}>Step {step} of 3</Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${(step / 3) * 100}%` }]} />
          </View>
        </View>

        {step === 1 && (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Select Order</Text>
            <Text style={styles.stepSubtitle}>Enter the Order ID or Invoice Number to fetch products.</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Order ID / Invoice No.</Text>
              <TextInput 
                style={styles.input}
                placeholder="e.g. ORD-1001"
                value={orderId}
                onChangeText={setOrderId}
              />
            </View>

            <TouchableOpacity style={styles.primaryButton} onPress={handleNext}>
              <Text style={styles.primaryButtonText}>Fetch Items</Text>
            </TouchableOpacity>
          </View>
        )}

        {step === 2 && (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Select Items</Text>
            <Text style={styles.stepSubtitle}>Choose the items from this order you wish to return.</Text>
            
            {mockOrderItems.map(item => {
              const isSelected = selectedItems.find(i => i.id === item.id);
              return (
                <View key={item.id} style={[styles.itemCard, isSelected && styles.itemCardSelected]}>
                  <TouchableOpacity style={styles.itemHeader} onPress={() => toggleItem(item)}>
                    {isSelected ? <CheckCircle color="#0066cc" size={24} /> : <Circle color="#ccc" size={24} />}
                    <View style={styles.itemInfo}>
                      <Text style={styles.itemName}>{item.name}</Text>
                      <Text style={styles.itemMeta}>Max Qty: {item.qty}</Text>
                    </View>
                  </TouchableOpacity>
                  
                  {isSelected && (
                    <View style={styles.qtyContainer}>
                      <Text style={styles.qtyLabel}>Return Qty:</Text>
                      <TextInput 
                        style={styles.qtyInput}
                        keyboardType="numeric"
                        value={isSelected.quantity.toString()}
                        onChangeText={(val) => updateItemQty(item.id, val)}
                      />
                    </View>
                  )}
                </View>
              );
            })}

            <TouchableOpacity style={styles.primaryButton} onPress={handleNext}>
              <Text style={styles.primaryButtonText}>Continue</Text>
            </TouchableOpacity>
          </View>
        )}

        {step === 3 && (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Select Reason</Text>
            <Text style={styles.stepSubtitle}>Is this return for saleable goods or expired goods?</Text>
            
            <View style={styles.typeSelector}>
              <TouchableOpacity 
                style={[styles.typeCard, selectedType === 'saleable' && styles.typeCardSelected]}
                onPress={() => setSelectedType('saleable')}
              >
                <ShoppingCart color={selectedType === 'saleable' ? '#0066cc' : '#666'} size={32} style={styles.typeIcon} />
                <Text style={[styles.typeText, selectedType === 'saleable' && styles.typeTextSelected]}>Saleable</Text>
                <Text style={styles.typeDesc}>Products are in good condition and resalable.</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.typeCard, selectedType === 'expiry' && styles.typeCardSelected]}
                onPress={() => setSelectedType('expiry')}
              >
                <ShoppingCart color={selectedType === 'expiry' ? '#d93025' : '#666'} size={32} style={styles.typeIcon} />
                <Text style={[styles.typeText, selectedType === 'expiry' && {color: '#d93025'}]}>Expiry</Text>
                <Text style={styles.typeDesc}>Products are nearing expiry or expired.</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.primaryButton} onPress={handleSubmit}>
              <Text style={styles.primaryButtonText}>Create Return Draft</Text>
            </TouchableOpacity>
          </View>
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
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  container: {
    padding: 24,
  },
  stepContainer: {
    marginBottom: 32,
  },
  stepText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#f0f0f0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#0066cc',
    borderRadius: 3,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  stepSubtitle: {
    fontSize: 15,
    color: '#666',
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  primaryButton: {
    backgroundColor: '#0066cc',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  itemCard: {
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  itemCardSelected: {
    borderColor: '#0066cc',
    backgroundColor: '#f0f8ff',
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemInfo: {
    marginLeft: 12,
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  itemMeta: {
    fontSize: 13,
    color: '#666',
  },
  qtyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e6f2ff',
    marginLeft: 36,
  },
  qtyLabel: {
    fontSize: 14,
    color: '#333',
    marginRight: 12,
  },
  qtyInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    width: 80,
    backgroundColor: '#fff',
    textAlign: 'center',
  },
  typeSelector: {
    gap: 16,
    marginBottom: 24,
  },
  typeCard: {
    borderWidth: 2,
    borderColor: '#eee',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
  },
  typeCardSelected: {
    borderColor: '#0066cc',
    backgroundColor: '#f0f8ff',
  },
  typeIcon: {
    marginBottom: 12,
  },
  typeText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  typeTextSelected: {
    color: '#0066cc',
  },
  typeDesc: {
    fontSize: 13,
    color: '#666',
    textAlign: 'center',
  },
});
