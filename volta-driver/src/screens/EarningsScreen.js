import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, ScrollView, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { X, CheckCircle, Award, Clock } from 'lucide-react-native';
import C from '../constants/colors';
import api from '../services/api';

const { width } = Dimensions.get('window');

export default function EarningsScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const onClose = () => navigation.goBack();

  const [loading, setLoading] = useState(true);
  const [wallet, setWallet] = useState(null);
  const [profile, setProfile] = useState(null);
  const [tripsCount, setTripsCount] = useState(route?.params?.total_trips || 0);

  const fareEarned = route?.params?.fare_earned || route?.params?.fare || null;

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
          if (w) setWallet(w);
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

  const driverName = profile?.first_name ? profile.first_name : 'Driver';
  const totalBalance = wallet?.balance ?? (route?.params?.wallet_balance || 0);
  const walletCurrency = wallet?.currency || 'GNF';
  const tripCurrency = route?.params?.currency || 'GNF';

  const formattedFareEarned = tripCurrency === 'USD' 
    ? `+$${Number(fareEarned).toFixed(2)} USD` 
    : `+${Number(fareEarned).toLocaleString()} GNF`;

  const formattedTotalBalance = walletCurrency === 'USD'
    ? `$${Number(totalBalance).toFixed(2)} USD`
    : `${Number(totalBalance).toLocaleString()} GNF`;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]} pointerEvents="auto">
      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.sheet}>
        <View style={styles.sheetHeader}>
          <Text style={styles.sheetTitle}>Driver Earnings</Text>
          <TouchableOpacity onPress={onClose} style={styles.sheetClose}>
            <X size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={{ paddingVertical: 60, alignItems: 'center' }}>
            <ActivityIndicator size="large" color="#05A357" />
          </View>
        ) : (
          <>
            {/* If just finished a trip, show real trip earnings */}
            {fareEarned && (
              <View style={styles.congratsCard}>
                <View style={styles.congratsHeader}>
                  <CheckCircle size={22} color="#05A357" />
                  <Text style={styles.congratsTitle}>Trip Completed!</Text>
                </View>
                <Text style={styles.congratsAmount}>{formattedFareEarned}</Text>
                <Text style={styles.congratsSub}>Added to your driver earnings wallet</Text>
              </View>
            )}

            {/* Total Balance Card */}
            <View style={styles.balanceCard}>
              <Text style={styles.earningsLabel}>Total Wallet Balance</Text>
              <Text style={styles.earningsAmount}>{formattedTotalBalance}</Text>
              <Text style={styles.earningsSub}>
                {tripsCount} {tripsCount === 1 ? 'trip' : 'trips'} completed · Great work, {driverName}! 🎉
              </Text>
            </View>

            {/* Quick Stats Grid */}
            <View style={styles.statsGrid}>
              <View style={styles.statBox}>
                <Award size={20} color="#05A357" />
                <Text style={styles.statVal}>{(profile?.rating || 5.0).toFixed(1)} ★</Text>
                <Text style={styles.statLbl}>Rating</Text>
              </View>
              <View style={styles.statBox}>
                <Clock size={20} color="#05A357" />
                <Text style={styles.statVal}>{tripsCount}</Text>
                <Text style={styles.statLbl}>Completed Rides</Text>
              </View>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
  sheet: { padding: 24, paddingBottom: 40 },
  sheetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  sheetTitle: { fontSize: 24, fontWeight: '800', color: '#fff' },
  sheetClose: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' },

  congratsCard: { backgroundColor: 'rgba(5,163,87,0.12)', borderWidth: 1, borderColor: '#05A357', borderRadius: 20, padding: 20, marginBottom: 20 },
  congratsHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  congratsTitle: { fontSize: 16, fontWeight: '700', color: '#05A357' },
  congratsAmount: { fontSize: 32, fontWeight: '900', color: '#fff', marginBottom: 4 },
  congratsSub: { fontSize: 13, color: '#9CA3AF' },

  balanceCard: { backgroundColor: '#1E1E1E', borderRadius: 24, padding: 24, alignItems: 'center', marginBottom: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
  earningsLabel: { fontSize: 13, fontWeight: '600', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 },
  earningsAmount: { fontSize: 40, fontWeight: '900', color: '#05A357', marginBottom: 8 },
  earningsSub: { fontSize: 14, color: '#A1A1AA', textAlign: 'center' },

  statsGrid: { flexDirection: 'row', gap: 12 },
  statBox: { flex: 1, backgroundColor: '#1E1E1E', borderRadius: 18, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
  statVal: { fontSize: 18, fontWeight: '800', color: '#fff', marginTop: 8, marginBottom: 2 },
  statLbl: { fontSize: 12, color: '#9CA3AF' }
});
