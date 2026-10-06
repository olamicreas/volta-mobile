import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Switch } from 'react-native';
import { ArrowLeft, Bell, Lock, Globe, Map } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import C from '../constants/colors';

export default function SettingsScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [notif, setNotif] = useState(true);
  const [loc, setLoc] = useState(true);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft size={24} color={C.lux900} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={{width: 40}} />
      </View>

      <ScrollView style={{ flex: 1, backgroundColor: '#F9FAFB' }}>
        <Text style={styles.sectionHeader}>Preferences</Text>
        
        <View style={styles.settingGroup}>
          <View style={styles.settingRow}>
            <Bell size={20} color={C.gray500} style={styles.icon} />
            <Text style={styles.settingLabel}>Push Notifications</Text>
            <Switch value={notif} onValueChange={setNotif} trackColor={{ true: C.lux900 }} />
          </View>
          <View style={styles.divider} />
          <View style={styles.settingRow}>
            <Map size={20} color={C.gray500} style={styles.icon} />
            <Text style={styles.settingLabel}>Location Services</Text>
            <Switch value={loc} onValueChange={setLoc} trackColor={{ true: C.lux900 }} />
          </View>
          <View style={styles.divider} />
          <TouchableOpacity style={styles.settingRow}>
            <Globe size={20} color={C.gray500} style={styles.icon} />
            <Text style={styles.settingLabel}>Language</Text>
            <Text style={styles.settingValue}>English (US)</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionHeader}>Account Security</Text>
        <View style={styles.settingGroup}>
          <TouchableOpacity style={styles.settingRow}>
            <Lock size={20} color={C.gray500} style={styles.icon} />
            <Text style={styles.settingLabel}>Change Password</Text>
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity style={styles.settingRow}>
            <Text style={[styles.settingLabel, { color: '#EF4444' }]}>Delete Account</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: C.lux900 },
  sectionHeader: { paddingHorizontal: 20, paddingTop: 32, paddingBottom: 12, fontSize: 13, fontWeight: '700', color: '#6B7280', textTransform: 'uppercase' },
  settingGroup: { backgroundColor: '#fff', borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#F3F4F6' },
  settingRow: { flexDirection: 'row', alignItems: 'center', padding: 16, paddingHorizontal: 20 },
  icon: { marginRight: 16 },
  settingLabel: { flex: 1, fontSize: 16, fontWeight: '600', color: C.lux900 },
  settingValue: { fontSize: 16, color: '#6B7280' },
  divider: { height: 1, backgroundColor: '#F3F4F6', marginLeft: 56 }
});
