import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { View, Text, DeviceEventEmitter, TouchableOpacity, StyleSheet, ScrollView, Image, Alert } from 'react-native';
import { User, CreditCard, Settings, HelpCircle, ChevronRight, ArrowLeft, LogOut, Shield, Zap , FileText, Globe } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import C from '../constants/colors';
import { useTranslation, promptLanguageSelection } from '../constants/translations';
import LanguageModal from '../components/modals/LanguageModal';

export default function AccountScreen({ navigation, route }) {
  const { t, isFrench } = useTranslation();
  const [langModalVisible, setLangModalVisible] = useState(false);

  const onLogout = () => {
    Alert.alert(
      t('driver.menu_logout'),
      t('driver.logout_confirm'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('driver.menu_logout'),
          style: 'destructive',
          onPress: () => DeviceEventEmitter.emit('DO_LOGOUT')
        }
      ]
    );
  };
  
  const [prof, setProf] = useState(null);
  useEffect(() => {
    api.getProfile().then(setProf).catch(()=>console.log('err'));
  }, []);

  const insets = useSafeAreaInsets();
  
  const menuItems = [
    { icon: User, label: t('driver.menu_account'), route: 'ProfileDetail' },
    { icon: FileText, label: t('driver.menu_vehicle'), route: 'VehicleProfile' },
    { icon: CreditCard, label: t('driver.menu_earnings'), route: 'Wallet' },
    { icon: Zap, label: isFrench ? 'Opportunités' : 'Opportunities', route: 'Promo' },
    { icon: Shield, label: t('driver.menu_safety'), route: 'Safety' },
    { icon: Settings, label: t('driver.menu_preferences'), route: 'Preferences' },
    { icon: HelpCircle, label: t('driver.menu_support'), route: 'Support' },
  ];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{isFrench ? 'Compte Chauffeur' : 'Driver Account'}</Text>
        <View style={{width: 40}} />
      </View>

      <ScrollView style={{ flex: 1 }}>
        <TouchableOpacity style={styles.profileCard} onPress={() => navigation.navigate('ProfileDetail')}>
          {prof?.profile_picture_url ? (
            <Image source={{ uri: prof.profile_picture_url }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, { justifyContent: 'center', alignItems: 'center', backgroundColor: '#1E293B' }]}>
              <Text style={{ fontSize: 24, fontWeight: '800', color: '#05A357' }}>
                {((prof?.first_name ? prof.first_name[0] : 'D') || 'D').toUpperCase()}
              </Text>
            </View>
          )}
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{prof ? `${prof.first_name || ""} ${prof.last_name || ""}` : "..."}</Text>
            <Text style={styles.tier}>{prof?.driver_category === 'COMPANY_CAR' ? (isFrench ? 'Chauffeur Flotte' : 'Fleet Chauffeur') : 'Volta Chauffeur'}</Text>
          </View>
          <ChevronRight size={24} color={C.gray400} />
        </TouchableOpacity>

        <View style={styles.menuGroup}>
          {/* Language Selector Row */}
          <TouchableOpacity style={styles.menuItem} onPress={() => setLangModalVisible(true)}>
            <View style={[styles.iconWrap, { backgroundColor: '#1E293B' }]}>
              <Globe size={20} color={C.brand || '#05A357'} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.menuLabel}>{t('driver.menu_language')}</Text>
              <Text style={{ fontSize: 13, color: C.brand || '#05A357', fontWeight: '700', marginTop: 2 }}>
                {isFrench ? '🇫🇷 Français (French)' : '🇬🇧 English (Anglais)'}
              </Text>
            </View>
            <ChevronRight size={20} color={C.gray400} />
          </TouchableOpacity>

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
          <Text style={styles.logoutText}>{t('driver.menu_logout')}</Text>
        </TouchableOpacity>
      </ScrollView>

      <LanguageModal
        visible={langModalVisible}
        onClose={() => setLangModalVisible(false)}
      />
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
