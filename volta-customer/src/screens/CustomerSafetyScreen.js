import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ArrowLeft, ShieldAlert, PhoneCall, Share2 } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import C from '../constants/colors';

export default function CustomerSafetyScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  
  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft size={24} color={C.lux900} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Safety Toolkit</Text>
        <View style={{width: 40}} />
      </View>

      <View style={{ flex: 1, padding: 20, backgroundColor: '#F9FAFB' }}>
        <TouchableOpacity style={styles.emergencyBtn}>
          <View style={styles.emergencyIconWrap}>
            <PhoneCall size={32} color="#fff" />
          </View>
          <Text style={styles.emergencyTitle}>Call Emergency Services</Text>
          <Text style={styles.emergencySub}>Share your live location and trip details with 911</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.featureBtn}>
          <View style={styles.featureIconWrap}><Share2 size={24} color={C.lux900} /></View>
          <View style={{ flex: 1 }}>
            <Text style={styles.featureTitle}>Share Trip Status</Text>
            <Text style={styles.featureSub}>Send a live tracking link to friends or family</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.featureBtn}>
          <View style={styles.featureIconWrap}><ShieldAlert size={24} color={C.lux900} /></View>
          <View style={{ flex: 1 }}>
            <Text style={styles.featureTitle}>Report Safety Issue</Text>
            <Text style={styles.featureSub}>Driver is driving unsafely or you feel uncomfortable</Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#F3F4F6', backgroundColor: '#fff' },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: C.lux900 },
  emergencyBtn: { backgroundColor: 'rgba(239,68,68,0.1)', borderWidth: 1, borderColor: 'rgba(239,68,68,0.3)', borderRadius: 24, padding: 32, alignItems: 'center', marginBottom: 24 },
  emergencyIconWrap: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#EF4444', alignItems: 'center', justifyContent: 'center', marginBottom: 16, shadowColor: '#EF4444', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.4, shadowRadius: 16, elevation: 8 },
  emergencyTitle: { color: '#EF4444', fontSize: 20, fontWeight: '800', marginBottom: 8 },
  emergencySub: { color: '#B91C1C', fontSize: 14, textAlign: 'center', fontWeight: '500' },
  featureBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 20, borderRadius: 16, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  featureIconWrap: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center', marginRight: 16 },
  featureTitle: { fontSize: 16, fontWeight: '700', color: C.lux900, marginBottom: 4 },
  featureSub: { fontSize: 13, color: '#6B7280' }
});
