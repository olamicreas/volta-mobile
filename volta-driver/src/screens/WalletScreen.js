import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { ArrowLeft, Wallet, Building, ChevronRight, Activity } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import C from '../constants/colors';
import api from '../services/api';

export default function WalletScreen({ navigation, wallet }) {
  const insets = useSafeAreaInsets();
  const [walletData, setWalletData] = useState(wallet || null);
  const [profile, setProfile] = useState(null);
  const [tripsCount, setTripsCount] = useState(0);
  const [loading, setLoading] = useState(!wallet);

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        const [w, p, trips] = await Promise.all([
          api.getWallet().catch(() => null),
          api.getProfile().catch(() => null),
          api.getTrips().catch(() => [])
        ]);
        if (isMounted) {
          if (w) setWalletData(w);
          if (p) setProfile(p);
          if (Array.isArray(trips)) setTripsCount(trips.length);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadData();
    return () => { isMounted = false; };
  }, []);

  const balance = walletData?.balance ?? 0;
  const currency = walletData?.currency || 'GNF';
  
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
          <Text style={styles.balanceAmount}>{balance.toLocaleString()} {currency}</Text>
          <TouchableOpacity style={styles.cashOutBtn}>
            <Text style={styles.cashOutBtnText}>Cash Out Now</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Summary</Text>
        <View style={styles.statsCard}>
          <View style={styles.statRow}>
            <View>
              <Text style={styles.statLabel}>Completed Trips</Text>
              <Text style={styles.statVal}>{tripsCount}</Text>
            </View>
            <View>
              <Text style={styles.statLabel}>Rating</Text>
              <Text style={styles.statVal}>{(profile?.rating || 5.0).toFixed(1)} ★</Text>
            </View>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Payout Account</Text>
        <View style={styles.listGroup}>
          <View style={styles.row}>
            <View style={styles.iconWrap}><Wallet size={20} color="#fff" /></View>
            <View style={{ flex: 1 }}>
              <Text style={styles.rowTitle}>Registered Payout Phone</Text>
              <Text style={styles.rowSub}>{profile?.phone_number || 'No phone registered'}</Text>
            </View>
          </View>
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
