import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import C from '../constants/colors';

export default function CancellationScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [selected, setSelected] = useState(null);
  
  const reasons = [
    'Rider isn\'t here',
    'Rider has too many people',
    'Rider doesn\'t have child seat',
    'Too much luggage',
    'I don\'t feel safe',
    'Vehicle issue',
    'Other'
  ];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Cancel Trip</Text>
        <View style={{width: 40}} />
      </View>

      <ScrollView style={{ flex: 1 }}>
        <View style={styles.warningBox}>
          <Text style={styles.warningTitle}>Cancel Trip?</Text>
          <Text style={styles.warningSub}>Canceling trips can affect your cancellation rate and eligibility for Volta Pro status.</Text>
        </View>

        <Text style={styles.sectionTitle}>Reason for cancellation</Text>
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
          <Text style={styles.cancelBtnText}>Confirm Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.keepBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.keepBtnText}>Don't Cancel</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.1)' },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#fff' },
  warningBox: { backgroundColor: 'rgba(239,68,68,0.1)', padding: 20, margin: 20, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(239,68,68,0.3)' },
  warningTitle: { color: '#EF4444', fontSize: 18, fontWeight: '800', marginBottom: 8 },
  warningSub: { color: 'rgba(239,68,68,0.8)', fontSize: 14, lineHeight: 20, fontWeight: '500' },
  sectionTitle: { paddingHorizontal: 20, paddingBottom: 12, fontSize: 13, fontWeight: '700', color: '#A1A1AA', textTransform: 'uppercase' },
  reasonList: { backgroundColor: 'rgba(255,255,255,0.02)', borderTopWidth: 1, borderBottomWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  reasonRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
  reasonText: { fontSize: 16, color: '#fff', fontWeight: '500' },
  radio: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: '#52525B', alignItems: 'center', justifyContent: 'center' },
  radioActive: { borderColor: '#EF4444' },
  radioInner: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#EF4444' },
  footer: { backgroundColor: '#1E1E1E', padding: 20, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)' },
  cancelBtn: { backgroundColor: '#EF4444', paddingVertical: 16, borderRadius: 16, alignItems: 'center', marginBottom: 12 },
  cancelBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  keepBtn: { backgroundColor: 'rgba(255,255,255,0.1)', paddingVertical: 16, borderRadius: 16, alignItems: 'center' },
  keepBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' }
});
