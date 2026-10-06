import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, ScrollView } from 'react-native';
import { ArrowLeft, Tag } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import C from '../constants/colors';

export default function PromotionsScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  
  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft size={24} color={C.lux900} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Promotions</Text>
        <View style={{width: 40}} />
      </View>

      <ScrollView style={{ flex: 1, backgroundColor: '#F9FAFB' }}>
        <View style={styles.inputSection}>
          <Text style={styles.label}>Enter Promo Code</Text>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <TextInput style={styles.input} placeholder="e.g. VOLTA2026" autoCapitalize="characters" />
            <TouchableOpacity style={styles.applyBtn}>
              <Text style={styles.applyBtnText}>Apply</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Active Promotions</Text>
        <View style={styles.promoList}>
          <View style={styles.promoCard}>
            <View style={styles.iconWrap}><Tag size={24} color={C.gold} /></View>
            <View style={{ flex: 1 }}>
              <Text style={styles.promoTitle}>50% Off Next 3 Rides</Text>
              <Text style={styles.promoSub}>Valid until Sep 30, 2026</Text>
            </View>
          </View>
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
  inputSection: { padding: 20, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#F3F4F6', marginBottom: 24 },
  label: { fontSize: 13, fontWeight: '700', color: '#6B7280', marginBottom: 12 },
  input: { flex: 1, backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, paddingHorizontal: 16, height: 56, fontSize: 16, fontWeight: '600', color: C.lux900 },
  applyBtn: { backgroundColor: C.lux900, borderRadius: 12, paddingHorizontal: 24, justifyContent: 'center' },
  applyBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  sectionTitle: { paddingHorizontal: 20, paddingBottom: 12, fontSize: 13, fontWeight: '700', color: '#6B7280', textTransform: 'uppercase' },
  promoList: { backgroundColor: '#fff', borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#F3F4F6', padding: 20 },
  promoCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.lux900, borderRadius: 16, padding: 20 },
  iconWrap: { width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center', marginRight: 16 },
  promoTitle: { fontSize: 16, fontWeight: '800', color: '#fff', marginBottom: 4 },
  promoSub: { fontSize: 13, color: '#A1A1AA', fontWeight: '500' }
});
