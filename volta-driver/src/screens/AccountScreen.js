import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image } from 'react-native';
import { User, CreditCard, Settings, HelpCircle, ChevronRight, ArrowLeft, LogOut, Shield, Zap , FileText } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import C from '../constants/colors';

export default function AccountScreen({ navigation, route }) {
  const onLogout = route?.params?.onLogout || (() => {});
  const [prof, setProf] = useState(null);
  useEffect(() => {
    api.getProfile().then(setProf).catch(()=>console.log('err'));
  }, []);

  const insets = useSafeAreaInsets();
  
  const menuItems = [
    { icon: User, label: 'Profile Details', route: 'ProfileDetail' },
    { icon: FileText, label: 'Vehicle & Documents', route: 'VehicleProfile' },
    { icon: CreditCard, label: 'Earnings & Wallet', route: 'Wallet' },
    { icon: Zap, label: 'Opportunities', route: 'Promo' },
    { icon: Shield, label: 'Safety', route: 'Safety' },
    { icon: Settings, label: 'Preferences', route: 'Preferences' },
    { icon: HelpCircle, label: 'Support', route: 'Support' },
  ];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Driver Account</Text>
        <View style={{width: 40}} />
      </View>

      <ScrollView style={{ flex: 1 }}>
        <TouchableOpacity style={styles.profileCard} onPress={() => navigation.navigate('ProfileDetail')}>
          <Image source={{ uri: `https://api.dicebear.com/7.x/avataaars/png?seed=${prof?.first_name || 'User'}` }} style={styles.avatar} />
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{prof ? `${prof.first_name || ""} ${prof.last_name || ""}` : "..."}</Text>
            <Text style={styles.tier}>Volta Driver Pro</Text>
          </View>
          <ChevronRight size={24} color={C.gray400} />
        </TouchableOpacity>

        <View style={styles.menuGroup}>
          {menuItems.map((item, i) => (
            <TouchableOpacity key={i} style={styles.menuItem} onPress={() => navigation.navigate(item.route)}>
              <View style={styles.iconWrap}><item.icon size={20} color="#fff" /></View>
              <Text style={styles.menuLabel}>{item.label}</Text>
              <ChevronRight size={20} color={C.gray400} />
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={onLogout}>
          <LogOut size={20} color="#EF4444" />
          <Text style={styles.logoutText}>Go Offline & Log Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.1)' },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#fff' },
  profileCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.05)', padding: 20, marginBottom: 24 },
  avatar: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#F3F4F6', marginRight: 16, borderWidth: 2, borderColor: '#05A357' },
  name: { fontSize: 20, fontWeight: '800', color: '#fff', marginBottom: 4 },
  tier: { fontSize: 14, color: '#A1A1AA', fontWeight: '600' },
  menuGroup: { backgroundColor: 'rgba(255,255,255,0.02)', marginBottom: 24 },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
  iconWrap: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.05)', alignItems: 'center', justifyContent: 'center', marginRight: 16 },
  menuLabel: { flex: 1, fontSize: 16, fontWeight: '600', color: '#fff' },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(239,68,68,0.1)', paddingVertical: 16, gap: 8, marginHorizontal: 20, borderRadius: 16 },
  logoutText: { color: '#EF4444', fontSize: 16, fontWeight: '700' }
});
