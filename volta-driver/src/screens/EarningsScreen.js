import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { X } from 'lucide-react-native';
import C from '../constants/colors';

const { width, height } = Dimensions.get('window');

export default function EarningsScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const onClose = () => navigation.goBack();
  return (
    <View style={[styles.container, { paddingTop: insets.top }]} pointerEvents="auto">
      <ScrollView style={{flex: 1}} contentContainerStyle={styles.sheet}>
        <View style={styles.sheetHeader}>
          <Text style={styles.sheetTitle}>Today's Earnings</Text>
          <TouchableOpacity onPress={onClose} style={styles.sheetClose}>
            <X size={24} color="#fff" />
          </TouchableOpacity>
        </View>
        <View style={{ alignItems: 'center', paddingVertical: 32 }}>
          <Text style={styles.earningsAmount}>170,500 GNF</Text>
          <Text style={styles.earningsSub}>4 trips completed · Great work, Sarah! 🎉</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
  sheet: { padding: 24, paddingBottom: 40 },
  sheetBar: { width: 40, height: 4, borderRadius: 2, backgroundColor: '#E5E7EB', alignSelf: 'center', marginBottom: 24 },
  sheetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sheetTitle: { fontSize: 24, fontWeight: '800', color: '#fff' },
  sheetClose: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' },
  earningsAmount: { fontSize: 48, fontWeight: '800', color: '#fff', marginBottom: 8 },
  earningsSub: { fontSize: 16, color: '#A1A1AA' },
});
