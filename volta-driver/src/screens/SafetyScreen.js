import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PhoneCall, MapPin, X } from 'lucide-react-native';
import C from '../constants/colors';

const { width, height } = Dimensions.get('window');

export default function SafetyScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const onClose = () => navigation.goBack();
  return (
    <View style={[styles.container, { paddingTop: insets.top }]} pointerEvents="auto">
      <ScrollView style={{flex: 1}} contentContainerStyle={styles.sheet}>
        <View style={styles.sheetHeader}>
          <Text style={styles.sheetTitle}>Safety Toolkit</Text>
          <TouchableOpacity onPress={onClose} style={styles.sheetClose}>
            <X size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.emergencyBtn} activeOpacity={0.8}>
          <View style={styles.emergencyIconWrap}>
            <PhoneCall size={32} color="#fff" />
          </View>
          <Text style={styles.emergencyTitle}>Emergency Assistance</Text>
          <Text style={styles.emergencySub}>Dial 911 and share live location with authorities</Text>
        </TouchableOpacity>

        <View style={styles.featureBox}>
          <View style={{ flex: 1, paddingRight: 16 }}>
            <Text style={styles.featureTitle}>Share My Trip</Text>
            <Text style={styles.featureSub}>Let loved ones track your location</Text>
          </View>
          <TouchableOpacity style={styles.featureBtn}>
            <Text style={styles.featureBtnText}>Setup</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.featureBox}>
          <View style={{ flex: 1, paddingRight: 16 }}>
            <Text style={styles.featureTitle}>Audio Recording</Text>
            <Text style={styles.featureSub}>Record audio during trips for safety</Text>
          </View>
          <TouchableOpacity style={styles.featureBtn}>
            <Text style={styles.featureBtnText}>Enable</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
  sheet: { padding: 24, paddingBottom: 40 },
  sheetBar: { width: 40, height: 4, borderRadius: 2, backgroundColor: '#E5E7EB', alignSelf: 'center', marginBottom: 24 },
  sheetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  sheetTitle: { fontSize: 24, fontWeight: '800', color: '#fff' },
  sheetClose: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' },
  emergencyBtn: { backgroundColor: 'rgba(239,68,68,0.2)', borderWidth: 1, borderColor: 'rgba(239,68,68,0.5)', borderRadius: 24, padding: 24, alignItems: 'center', marginBottom: 16 },
  emergencyIconWrap: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#ef4444', alignItems: 'center', justifyContent: 'center', shadowColor: '#ef4444', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.4, shadowRadius: 15, elevation: 5, marginBottom: 16 },
  emergencyTitle: { color: '#ef4444', fontSize: 20, fontWeight: '700', marginBottom: 8 },
  emergencySub: { color: 'rgba(239,68,68,0.8)', fontSize: 14, textAlign: 'center' },
  featureBox: { backgroundColor: 'rgba(255,255,255,0.05)', padding: 16, borderRadius: 16, flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  featureTitle: { color: '#fff', fontSize: 16, fontWeight: '700', marginBottom: 4 },
  featureSub: { color: '#A1A1AA', fontSize: 13 },
  featureBtn: { backgroundColor: 'rgba(255,255,255,0.1)', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 100 },
  featureBtnText: { color: '#fff', fontSize: 13, fontWeight: '600' },
});
