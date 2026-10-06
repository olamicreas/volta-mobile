import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { X, Zap, ChevronRight } from 'lucide-react-native';
import C from '../constants/colors';

const { width, height } = Dimensions.get('window');

export default function PromoScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const onClose = () => navigation.goBack();
  return (
    <View style={[styles.container, { paddingTop: insets.top }]} pointerEvents="auto">
      <ScrollView style={{flex: 1}} contentContainerStyle={styles.sheet}>
        <View style={styles.sheetHeader}>
          <Text style={styles.sheetTitle}>Opportunities</Text>
          <TouchableOpacity onPress={onClose} style={styles.sheetClose}>
            <X size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        <View>
          <View style={styles.promoCard}>
            <View style={styles.promoIconWrap}>
              <Zap size={24} color="#000" />
            </View>
            <View style={{ flex: 1, paddingRight: 16 }}>
              <Text style={styles.promoTitle}>Morning Rush Hour</Text>
              <Text style={styles.promoSub}>Earn +25% on all trips originating from Kaloum between 7 AM and 9 AM.</Text>
            </View>
            <ChevronRight size={20} color="#000" />
          </View>
          
          <View style={[styles.promoCard, { backgroundColor: 'rgba(255,255,255,0.05)' }]}>
            <View style={[styles.promoIconWrap, { backgroundColor: 'rgba(255,255,255,0.1)' }]}>
              <Zap size={24} color="#fff" />
            </View>
            <View style={{ flex: 1, paddingRight: 16 }}>
              <Text style={[styles.promoTitle, { color: '#fff' }]}>Weekend Bonus</Text>
              <Text style={[styles.promoSub, { color: 'rgba(255,255,255,0.7)' }]}>Complete 20 trips this weekend to unlock a 500,000 GNF bonus.</Text>
            </View>
            <ChevronRight size={20} color="#fff" />
          </View>
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
  promoCard: { backgroundColor: C.brand, borderRadius: 24, padding: 20, flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  promoIconWrap: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', marginRight: 16 },
  promoTitle: { color: '#000', fontSize: 18, fontWeight: '800', marginBottom: 4 },
  promoSub: { color: 'rgba(0,0,0,0.7)', fontSize: 13, lineHeight: 18 },
});
