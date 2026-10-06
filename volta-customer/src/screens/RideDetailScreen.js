import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { ArrowLeft, MapPin, Navigation, Receipt, HelpCircle } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import C from '../constants/colors';

export default function RideDetailScreen({ route, navigation }) {
  const insets = useSafeAreaInsets();
  const { ride } = route.params;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft size={24} color={C.lux900} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ride Details</Text>
        <View style={{width: 40}} />
      </View>

      <ScrollView style={{ flex: 1 }}>
        <View style={styles.mapPlaceholder}>
          <Text style={{color: '#9CA3AF'}}>Route Map Thumbnail</Text>
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Trip Information</Text>
          <View style={styles.row}>
            <MapPin size={20} color={C.lux900} style={styles.icon} />
            <View>
              <Text style={styles.label}>Drop-off</Text>
              <Text style={styles.value}>{ride.dest}</Text>
            </View>
          </View>
          <View style={styles.row}>
            <Navigation size={20} color={C.lux900} style={styles.icon} />
            <View>
              <Text style={styles.label}>Date & Time</Text>
              <Text style={styles.value}>{ride.date}</Text>
            </View>
          </View>
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Payment</Text>
          <View style={[styles.row, { justifyContent: 'space-between' }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Receipt size={20} color={C.lux900} style={styles.icon} />
              <Text style={styles.value}>Total ({ride.vehicle})</Text>
            </View>
            <Text style={[styles.value, { fontWeight: '800' }]}>{ride.price}</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.supportBtn}>
          <HelpCircle size={20} color="#fff" />
          <Text style={styles.supportBtnText}>Report an Issue</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#F3F4F6', backgroundColor: '#fff' },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: C.lux900 },
  mapPlaceholder: { height: 200, backgroundColor: '#E5E7EB', alignItems: 'center', justifyContent: 'center' },
  infoSection: { backgroundColor: '#fff', padding: 20, borderBottomWidth: 1, borderBottomColor: '#F3F4F6', marginBottom: 8 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: C.lux900, marginBottom: 16 },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  icon: { marginRight: 16 },
  label: { fontSize: 13, color: '#6B7280', marginBottom: 2 },
  value: { fontSize: 16, fontWeight: '600', color: C.lux900 },
  supportBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: C.lux900, margin: 20, padding: 16, borderRadius: 16, gap: 8 },
  supportBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' }
});
