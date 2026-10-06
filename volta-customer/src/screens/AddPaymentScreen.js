import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, ScrollView, Image } from 'react-native';
import { ArrowLeft, CreditCard, Smartphone, ShieldCheck } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import C from '../constants/colors';

export default function AddPaymentScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [method, setMethod] = useState('CARD'); // MOBILE or CARD

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft size={24} color={C.lux900} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Payment Method</Text>
        <View style={{width: 40}} />
      </View>

      <ScrollView style={{ flex: 1, backgroundColor: '#F9FAFB' }}>
        <View style={styles.tabs}>
          <TouchableOpacity style={[styles.tab, method === 'MOBILE' && styles.tabActive]} onPress={() => setMethod('MOBILE')}>
            <Smartphone size={20} color={method === 'MOBILE' ? '#fff' : C.gray500} />
            <Text style={[styles.tabText, method === 'MOBILE' && styles.tabTextActive]}>Mobile Money</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.tab, method === 'CARD' && styles.tabActive]} onPress={() => setMethod('CARD')}>
            <CreditCard size={20} color={method === 'CARD' ? '#fff' : C.gray500} />
            <Text style={[styles.tabText, method === 'CARD' && styles.tabTextActive]}>Credit Card</Text>
          </TouchableOpacity>
        </View>

        {method === 'MOBILE' ? (
          <View style={styles.formSection}>
            <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 24, backgroundColor: 'rgba(16,185,129,0.1)', padding: 16, borderRadius: 12}}>
               <ShieldCheck size={24} color="#10B981" />
               <Text style={{marginLeft: 12, flex: 1, color: '#047857', fontWeight: '600'}}>Secured by Cinetpay Mobile API</Text>
            </View>

            <Text style={styles.formLabel}>Select Provider</Text>
            <View style={{ flexDirection: 'row', gap: 12, marginBottom: 24 }}>
              <TouchableOpacity style={[styles.providerBtn, { borderColor: '#FF7900' }]}>
                <Text style={[styles.providerText, { color: '#FF7900' }]}>Orange</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.providerBtn, { borderColor: '#FFCC00' }]}>
                <Text style={[styles.providerText, { color: '#FFCC00' }]}>MTN MoMo</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.formLabel}>Mobile Number</Text>
            <TextInput style={styles.input} placeholder="+224 00 00 00 00" keyboardType="phone-pad" />
            
            <TouchableOpacity style={styles.saveBtn}>
              <Text style={styles.saveBtnText}>Link Mobile Account</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.formSection}>
            <Text style={styles.formLabel}>Card Number</Text>
            <TextInput style={styles.input} placeholder="0000 0000 0000 0000" keyboardType="number-pad" />
            
            <View style={{ flexDirection: 'row', gap: 16 }}>
              <View style={{ flex: 1 }}>
                <Text style={styles.formLabel}>Expiry Date</Text>
                <TextInput style={styles.input} placeholder="MM/YY" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.formLabel}>CVV</Text>
                <TextInput style={styles.input} placeholder="123" keyboardType="number-pad" secureTextEntry />
              </View>
            </View>

            <TouchableOpacity style={styles.saveBtn}>
              <Text style={styles.saveBtnText}>Save Card</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: C.lux900 },
  tabs: { flexDirection: 'row', margin: 20, backgroundColor: '#fff', borderRadius: 12, padding: 4, borderWidth: 1, borderColor: '#E5E7EB' },
  tab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, borderRadius: 8, gap: 8 },
  tabActive: { backgroundColor: C.lux900 },
  tabText: { fontSize: 14, fontWeight: '700', color: C.gray500 },
  tabTextActive: { color: '#fff' },
  formSection: { padding: 20 },
  formLabel: { fontSize: 13, fontWeight: '700', color: '#6B7280', marginBottom: 8 },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, paddingHorizontal: 16, height: 56, fontSize: 16, fontWeight: '600', color: C.lux900, marginBottom: 24 },
  providerBtn: { flex: 1, height: 56, backgroundColor: '#fff', borderWidth: 2, borderColor: '#FF7900', borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  providerText: { fontSize: 16, fontWeight: '800' },
  saveBtn: { backgroundColor: C.lux900, height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginTop: 12 },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' }
});
