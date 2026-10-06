import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { ArrowLeft, Wallet, Building, ChevronRight, Activity } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import C from '../constants/colors';

export default function WalletScreen({ navigation, wallet }) {
  const insets = useSafeAreaInsets();
  
  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Earnings & Wallet</Text>
        <View style={{width: 40}} />
      </View>

      <ScrollView style={{ flex: 1 }}>
        <View style={styles.balanceSection}>
          <Text style={styles.balanceLabel}>Available Balance</Text>
          <Text style={styles.balanceAmount}>2,450,000 GNF</Text>
          <TouchableOpacity style={styles.cashOutBtn}>
            <Text style={styles.cashOutBtnText}>Cash Out Now</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Weekly Summary</Text>
        <View style={styles.statsCard}>
          <View style={styles.statRow}>
            <View>
              <Text style={styles.statLabel}>Trips</Text>
              <Text style={styles.statVal}>34</Text>
            </View>
            <View>
              <Text style={styles.statLabel}>Online Time</Text>
              <Text style={styles.statVal}>28h 15m</Text>
            </View>
          </View>
          <View style={{ height: 1, backgroundColor: 'rgba(255,255,255,0.1)', marginVertical: 16 }} />
          <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <Activity size={20} color="#05A357" />
              <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>See Detailed Activity</Text>
            </View>
            <ChevronRight size={20} color="#A1A1AA" />
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Payout Methods</Text>
        <View style={styles.listGroup}>
          <TouchableOpacity style={styles.row}>
            <View style={styles.iconWrap}><Wallet size={20} color="#fff" /></View>
            <View style={{ flex: 1 }}>
              <Text style={styles.rowTitle}>Cinetpay Wallet</Text>
              <Text style={styles.rowSub}>+224 620 000 000</Text>
            </View>
            <ChevronRight size={20} color="#A1A1AA" />
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity style={styles.row}>
            <View style={styles.iconWrap}><Building size={20} color="#fff" /></View>
            <View style={{ flex: 1 }}>
              <Text style={styles.rowTitle}>Ecobank Guinea</Text>
              <Text style={styles.rowSub}>**** 4567</Text>
            </View>
            <ChevronRight size={20} color="#A1A1AA" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.1)' },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#fff' },
  balanceSection: { padding: 32, alignItems: 'center', backgroundColor: '#05A357', margin: 16, borderRadius: 24 },
  balanceLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 14, fontWeight: '600', marginBottom: 8 },
  balanceAmount: { color: '#fff', fontSize: 36, fontWeight: '900', marginBottom: 24 },
  cashOutBtn: { backgroundColor: '#000', paddingHorizontal: 32, paddingVertical: 14, borderRadius: 100 },
  cashOutBtnText: { color: '#05A357', fontSize: 16, fontWeight: '800' },
  sectionTitle: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12, fontSize: 13, fontWeight: '700', color: '#A1A1AA', textTransform: 'uppercase' },
  statsCard: { backgroundColor: 'rgba(255,255,255,0.05)', marginHorizontal: 16, borderRadius: 16, padding: 20, marginBottom: 24 },
  statRow: { flexDirection: 'row', justifyContent: 'space-between' },
  statLabel: { color: '#A1A1AA', fontSize: 13, fontWeight: '600', marginBottom: 4 },
  statVal: { color: '#fff', fontSize: 24, fontWeight: '800' },
  listGroup: { backgroundColor: 'rgba(255,255,255,0.02)', borderTopWidth: 1, borderBottomWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  row: { flexDirection: 'row', alignItems: 'center', padding: 16, paddingHorizontal: 20 },
  iconWrap: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center', marginRight: 16 },
  rowTitle: { fontSize: 16, fontWeight: '600', color: '#fff', marginBottom: 2 },
  rowSub: { fontSize: 13, color: '#A1A1AA' },
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.1)', marginLeft: 76 }
});
