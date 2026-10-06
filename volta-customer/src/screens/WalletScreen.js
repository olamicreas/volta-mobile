import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { ArrowLeft, CreditCard, Plus, ChevronRight, Smartphone, Banknote } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import C from '../constants/colors';

export default function WalletScreen({ navigation, wallet }) {
  const insets = useSafeAreaInsets();
  
  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft size={24} color={C.lux900} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Wallet</Text>
        <View style={{width: 40}} />
      </View>

            <ScrollView style={{ flex: 1, backgroundColor: '#F9FAFB', paddingTop: 24 }}>
        
      <View style={styles.balanceSection}>
        <View style={styles.walletCard}>
            <Text style={styles.walletLabel}>Volta Balance</Text>
            <Text style={styles.walletAmount}>{wallet ? wallet.balance.toLocaleString() : '0'} GNF</Text>
            <View style={styles.cinetBadge}><Text style={styles.cinetText}>Powered by CinetPay</Text></View>
        </View>
      </View>

        <Text style={styles.sectionTitle}>Payment Methods</Text>
        <View style={styles.paymentList}>
          <TouchableOpacity style={styles.paymentRow}>
            <View style={styles.iconWrap}><Banknote size={20} color={C.lux900} /></View>
            <Text style={styles.paymentText}>Cash</Text>
            <ChevronRight size={20} color={C.gray400} />
          </TouchableOpacity>
          <View style={{ height: 1, backgroundColor: '#F3F4F6', marginLeft: 64 }} />
          <TouchableOpacity style={styles.paymentRow}>
            <View style={styles.iconWrap}><Smartphone size={20} color={C.lux900} /></View>
            <Text style={styles.paymentText}>Orange Money (...1234)</Text>
            <ChevronRight size={20} color={C.gray400} />
          </TouchableOpacity>
          <View style={{ height: 1, backgroundColor: '#F3F4F6', marginLeft: 64 }} />
          <TouchableOpacity style={styles.paymentRow} onPress={() => navigation.navigate('AddPayment')}>
            <View style={styles.iconWrap}><Plus size={20} color={C.lux900} /></View>
            <Text style={styles.paymentText}>Add Payment Method</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#F3F4F6', backgroundColor: '#fff' },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: C.lux900 },
  balanceSection: { padding: 20, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#F3F4F6', marginBottom: 24 },
  walletCard: { width: '100%', backgroundColor: '#FF7900', borderRadius: 24, padding: 24, alignItems: 'flex-start', shadowColor: '#FF7900', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 16, elevation: 8 },
  walletLabel: { color: 'rgba(255,255,255,0.9)', fontSize: 14, fontWeight: '500', marginBottom: 8 },
  walletAmount: { color: '#fff', fontSize: 32, fontWeight: '800', marginBottom: 24 },
  cinetBadge: { backgroundColor: '#fff', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  cinetText: { color: '#10B981', fontWeight: '800', fontSize: 12 },
  sectionTitle: { paddingHorizontal: 20, paddingBottom: 12, fontSize: 13, fontWeight: '700', color: '#6B7280', textTransform: 'uppercase' },
  paymentList: { backgroundColor: '#fff', borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#F3F4F6' },
  paymentRow: { flexDirection: 'row', alignItems: 'center', padding: 16, paddingHorizontal: 20 },
  iconWrap: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#F9FAFB', alignItems: 'center', justifyContent: 'center', marginRight: 16 },
  paymentText: { flex: 1, fontSize: 16, fontWeight: '600', color: C.lux900 }
});
