import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image } from 'react-native';
import { User, Clock, CreditCard, Settings, HelpCircle, ChevronRight, ArrowLeft, LogOut, Tag } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import C from '../constants/colors';

export default function AccountScreen({ navigation, profile }) {
  const onLogout = () => {
    require('react-native').DeviceEventEmitter.emit('DO_LOGOUT');
  };

  const [prof, setProf] = useState(null);
  useEffect(() => {
    api.getProfile().then(setProf).catch(()=>console.log('err'));
  }, []);

  const insets = useSafeAreaInsets();
  
  const menuItems = [
    { icon: User, label: 'Profile Details', route: 'ProfileDetail' },
    { icon: Clock, label: 'Ride History', route: 'RideHistory' },
    { icon: CreditCard, label: 'Wallet & Payments', route: 'Wallet' },
    { icon: Tag, label: 'Promotions', route: 'Promotions' },
    { icon: Settings, label: 'Settings', route: 'Settings' },
    { icon: HelpCircle, label: 'Support', route: 'Support' },
  ];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft size={24} color={C.lux900} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Account</Text>
        <View style={{width: 40}} />
      </View>

      <ScrollView style={{ flex: 1 }}>
        <TouchableOpacity style={styles.profileCard} onPress={() => navigation.navigate('ProfileDetail')}>
          <Image source={{ uri: `https://api.dicebear.com/7.x/avataaars/png?seed=${prof?.first_name || 'User'}` }} style={styles.avatar} />
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{prof ? `${prof.first_name || ""} ${prof.last_name || ""}` : "..."}</Text>
            <Text style={styles.tier}>Volta Black Member</Text>
          </View>
          <ChevronRight size={24} color={C.gray400} />
        </TouchableOpacity>

        <View style={styles.menuGroup}>
          {menuItems.map((item, i) => (
            <TouchableOpacity key={i} style={styles.menuItem} onPress={() => navigation.navigate(item.route)}>
              <View style={styles.iconWrap}><item.icon size={20} color={C.lux900} /></View>
              <Text style={styles.menuLabel}>{item.label}</Text>
              <ChevronRight size={20} color={C.gray400} />
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={onLogout}>
          <LogOut size={20} color="#EF4444" />
          <Text style={styles.logoutText}>Log Out</Text>
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
  profileCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 20, marginBottom: 24, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  avatar: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#F3F4F6', marginRight: 16 },
  name: { fontSize: 20, fontWeight: '800', color: C.lux900, marginBottom: 4 },
  tier: { fontSize: 14, color: C.gold, fontWeight: '600' },
  menuGroup: { backgroundColor: '#fff', borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#F3F4F6', marginBottom: 24 },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  iconWrap: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#F9FAFB', alignItems: 'center', justifyContent: 'center', marginRight: 16 },
  menuLabel: { flex: 1, fontSize: 16, fontWeight: '600', color: C.lux900 },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff', paddingVertical: 16, borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#F3F4F6', gap: 8 },
  logoutText: { color: '#EF4444', fontSize: 16, fontWeight: '700' }
});
