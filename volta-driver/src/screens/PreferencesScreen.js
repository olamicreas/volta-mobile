import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Switch, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { X, Volume2, Navigation, Car } from 'lucide-react-native';
import C from '../constants/colors';

const { width, height } = Dimensions.get('window');

export default function PreferencesScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const onClose = () => navigation.goBack();
  const [vol, setVol] = useState(true);
  const [nav, setNav] = useState(false);
  const [lux, setLux] = useState(true);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]} pointerEvents="auto">
      <ScrollView style={{flex: 1}} contentContainerStyle={styles.sheet}>
        <View style={styles.sheetHeader}>
          <Text style={styles.sheetTitle}>Driving Preferences</Text>
          <TouchableOpacity onPress={onClose} style={styles.sheetClose}>
            <X size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={styles.row}>
          <View style={styles.iconWrap}><Volume2 size={20} color="#fff" /></View>
          <View style={{ flex: 1, paddingHorizontal: 16 }}>
            <Text style={styles.rowTitle}>Voice Navigation</Text>
            <Text style={styles.rowSub}>Spoken turn-by-turn directions</Text>
          </View>
          <Switch value={vol} onValueChange={setVol} trackColor={{ true: C.brand }} />
        </View>

        <View style={styles.row}>
          <View style={styles.iconWrap}><Navigation size={20} color="#fff" /></View>
          <View style={{ flex: 1, paddingHorizontal: 16 }}>
            <Text style={styles.rowTitle}>Auto-Navigate</Text>
            <Text style={styles.rowSub}>Start directions automatically</Text>
          </View>
          <Switch value={nav} onValueChange={setNav} trackColor={{ true: C.brand }} />
        </View>

        <View style={styles.row}>
          <View style={styles.iconWrap}><Car size={20} color="#fff" /></View>
          <View style={{ flex: 1, paddingHorizontal: 16 }}>
            <Text style={styles.rowTitle}>Receive Volta Black</Text>
            <Text style={styles.rowSub}>Accept premium luxury requests</Text>
          </View>
          <Switch value={lux} onValueChange={setLux} trackColor={{ true: C.brand }} />
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
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
  iconWrap: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' },
  rowTitle: { color: '#fff', fontSize: 16, fontWeight: '700', marginBottom: 4 },
  rowSub: { color: '#A1A1AA', fontSize: 13 },
});
