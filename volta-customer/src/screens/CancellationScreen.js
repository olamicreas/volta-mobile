import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { ArrowLeft, CheckCircle2 } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import C from '../constants/colors';

export default function CancellationScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [selected, setSelected] = useState(null);
  
  const reasons = [
    'Driver is taking too long',
    'Driver isn\'t moving',
    'Wrong pickup address',
    'My plans changed',
    'Driver asked me to cancel',
    'Other'
  ];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft size={24} color={C.lux900} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Cancel Trip</Text>
        <View style={{width: 40}} />
      </View>

      <ScrollView style={{ flex: 1, backgroundColor: '#F9FAFB' }}>
        <View style={styles.warningBox}>
          <Text style={styles.warningTitle}>Are you sure?</Text>
          <Text style={styles.warningSub}>If you cancel now, you may be charged a 10,000 GNF cancellation fee to compensate the driver for their time.</Text>
        </View>

        <Text style={styles.sectionTitle}>Please tell us why</Text>
        <View style={styles.reasonList}>
          {reasons.map((r, i) => (
            <TouchableOpacity key={i} style={styles.reasonRow} onPress={() => setSelected(i)}>
              <Text style={styles.reasonText}>{r}</Text>
              <View style={[styles.radio, selected === i && styles.radioActive]}>
                {selected === i && <View style={styles.radioInner} />}
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 20) }]}>
        <TouchableOpacity style={styles.cancelBtn} disabled={selected === null} onPress={() => {
          // Typically emit 'cancel_trip' to backend here
          navigation.navigate('Main'); // go back to home
        }}>
          <Text style={styles.cancelBtnText}>Confirm Cancellation</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.keepBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.keepBtnText}>No, Keep My Ride</Text>
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
  warningBox: { backgroundColor: 'rgba(239,68,68,0.1)', padding: 20, margin: 20, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(239,68,68,0.3)' },
  warningTitle: { color: '#EF4444', fontSize: 18, fontWeight: '800', marginBottom: 8 },
  warningSub: { color: '#B91C1C', fontSize: 14, lineHeight: 20, fontWeight: '500' },
  sectionTitle: { paddingHorizontal: 20, paddingBottom: 12, fontSize: 13, fontWeight: '700', color: '#6B7280', textTransform: 'uppercase' },
  reasonList: { backgroundColor: '#fff', borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#F3F4F6' },
  reasonRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  reasonText: { fontSize: 16, color: C.lux900, fontWeight: '500' },
  radio: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: '#D1D5DB', alignItems: 'center', justifyContent: 'center' },
  radioActive: { borderColor: C.lux900 },
  radioInner: { width: 12, height: 12, borderRadius: 6, backgroundColor: C.lux900 },
  footer: { backgroundColor: '#fff', padding: 20, borderTopWidth: 1, borderTopColor: '#F3F4F6' },
  cancelBtn: { backgroundColor: '#EF4444', paddingVertical: 16, borderRadius: 16, alignItems: 'center', marginBottom: 12 },
  cancelBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  keepBtn: { backgroundColor: '#F3F4F6', paddingVertical: 16, borderRadius: 16, alignItems: 'center' },
  keepBtnText: { color: C.lux900, fontSize: 16, fontWeight: '700' }
});
