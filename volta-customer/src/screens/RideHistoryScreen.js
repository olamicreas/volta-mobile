import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { ArrowLeft, MapPin, Star, ChevronRight } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import C from '../constants/colors';

export default function RideHistoryScreen({ navigation, trips = [] }) {
  const insets = useSafeAreaInsets();
  

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft size={24} color={C.lux900} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ride History</Text>
        <View style={{width: 40}} />
      </View>

      <ScrollView style={{ flex: 1, backgroundColor: '#F9FAFB' }}>
        {trips.map(r => (
          <TouchableOpacity key={r.id} style={styles.rideCard} onPress={() => navigation.navigate('RideDetail', { ride: r })}>
            <View style={styles.rideCardTop}>
              <View style={styles.iconWrap}><MapPin size={20} color={C.lux900} /></View>
              <View style={{ flex: 1 }}>
                <Text style={styles.destText}>{r.dest_name}</Text>
                <Text style={styles.dateText}>{new Date(r.created_at).toLocaleString()}</Text>
              </View>
              <Text style={styles.priceText}>{`${(r.fare_amount ?? 0).toLocaleString()} GNF`}</Text>
            </View>
            <View style={styles.rideCardBottom}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Text style={styles.vehicleText}>{r.vehicle_type}</Text>
                <Text style={{color: '#9CA3AF'}}>•</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Star size={12} color={C.gold} fill={C.gold} />
                  <Text style={styles.ratingText}>{'N/A'}</Text>
                </View>
              </View>
              <ChevronRight size={16} color={C.gray400} />
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: C.lux900 },
  rideCard: { backgroundColor: '#fff', marginHorizontal: 16, marginTop: 16, borderRadius: 16, padding: 16, shadowColor: '#000', shadowOffset: {width:0, height:2}, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  rideCardTop: { flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#F3F4F6', paddingBottom: 16, marginBottom: 12 },
  iconWrap: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#F9FAFB', alignItems: 'center', justifyContent: 'center', marginRight: 16 },
  destText: { fontSize: 16, fontWeight: '700', color: C.lux900, marginBottom: 4 },
  dateText: { fontSize: 13, color: '#6B7280' },
  priceText: { fontSize: 16, fontWeight: '800', color: C.lux900 },
  rideCardBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  vehicleText: { fontSize: 13, fontWeight: '600', color: C.gray500 },
  ratingText: { fontSize: 13, fontWeight: '700', color: C.lux900, marginLeft: 4 }
});
