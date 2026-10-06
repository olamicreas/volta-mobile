import React from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Image,
  Platform, Dimensions
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Grid2x2, Search, Plane, Briefcase } from 'lucide-react-native';
import C from '../constants/colors';

const { width } = Dimensions.get('window');

const NAV_BAR_HEIGHT = Platform.OS === 'ios' ? 79 : 63;
const STATUS_BAR_OFFSET = Platform.OS === 'ios' ? 54 : 42;

export default function HomeScreen({ onMenuPress, onSearchPress, onProfilePress, profile, places, currentAddress }) {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">

      <View style={[styles.topRow, { top: STATUS_BAR_OFFSET }]} pointerEvents="auto">
        {/* Menu Button Fixed */}
        <TouchableOpacity style={styles.shadowWrapper} onPress={onMenuPress} activeOpacity={0.85}>
          <View style={styles.menuInner}>
            <BlurView intensity={80} tint="light" style={styles.blurFill}>
              <Grid2x2 size={20} color={C.lux900} strokeWidth={2} />
            </BlurView>
          </View>
        </TouchableOpacity>

        {/* Profile Pill Fixed */}
        <TouchableOpacity style={styles.shadowWrapper} onPress={onProfilePress} activeOpacity={0.85}>
          <View style={styles.profileInner}>
            <BlurView intensity={80} tint="light" style={styles.profileBlur}>
              <Image
                source={{ uri: `https://api.dicebear.com/7.x/avataaars/png?seed=${profile?.first_name || 'User'}` }}
                style={styles.avatar}
              />
              <Text style={styles.profileName}>{profile ? profile.first_name || 'User' : 'User'}</Text>
            </BlurView>
          </View>
        </TouchableOpacity>
      </View>

      <View style={[styles.searchWrapper, { bottom: NAV_BAR_HEIGHT + 24 }]} pointerEvents="auto">
        {/* Glass Panel Fixed */}
        <View style={styles.shadowWrapperLarge}>
          <View style={styles.glassInner}>
            <BlurView intensity={90} tint="light" style={styles.glassPanel}>

              <TouchableOpacity style={styles.searchRow} onPress={() => onSearchPress()} activeOpacity={0.9}>
                <View style={styles.searchIconWrap}>
                  <Search size={20} color={C.lux900} strokeWidth={2.5} />
                </View>
                <Text style={styles.searchText}>Where to, {profile ? profile.first_name || 'User' : 'User'}?</Text>
                <View style={styles.nowBadge}>
                  <Text style={styles.nowText}>Now</Text>
                </View>
              </TouchableOpacity>

              <View style={styles.quickRow}>
                <TouchableOpacity style={styles.quickBtn} activeOpacity={0.85} onPress={() => onSearchPress('Aéroport Sékou Touré')}>
                  <Plane size={18} color={C.gold} strokeWidth={2} />
                  <Text style={styles.quickText}>Airport</Text>
                </TouchableOpacity>

                <View style={styles.quickDivider} />

                <TouchableOpacity style={styles.quickBtn} activeOpacity={0.85} onPress={() => onSearchPress('Hôtel Kaloum')}>
                  <Briefcase size={18} color={C.gold} strokeWidth={2} />
                  <Text style={styles.quickText}>Office</Text>
                </TouchableOpacity>
              </View>

            </BlurView>
          </View>
        </View>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  topRow: {
    position: 'absolute',
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  // Outer wrapper for shadows
  shadowWrapper: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.14,
    shadowRadius: 12,
    elevation: 6,
  },
  shadowWrapperLarge: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 10,
  },

  // Inner views for masking the BlurView
  menuInner: {
    width: 48, height: 48,
    borderRadius: 24,
    overflow: 'hidden',
  },
  profileInner: {
    borderRadius: 40,
    overflow: 'hidden',
  },
  glassInner: {
    borderRadius: 28,
    overflow: 'hidden',
  },

  blurFill: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.8)',
  },
  profileBlur: {
    flexDirection: 'row', alignItems: 'center',
    paddingLeft: 6, paddingRight: 18, paddingVertical: 6, gap: 10,
    backgroundColor: 'rgba(255,255,255,0.8)',
  },
  avatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: C.lux100 },
  profileName: { fontSize: 15, fontWeight: '700', color: C.lux900 },

  searchWrapper: {
    position: 'absolute',
    left: 16,
    right: 16,
  },
  glassPanel: {
    paddingHorizontal: 8, paddingTop: 8, paddingBottom: 8,
    backgroundColor: 'rgba(255,255,255,0.88)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.5)',
    gap: 6,
  },
  searchRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: C.lux100,
    borderRadius: 22, padding: 8,
  },
  searchIconWrap: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: '#fff',
    alignItems: 'center', justifyContent: 'center',
    marginRight: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06, shadowRadius: 4, elevation: 2,
  },
  searchText: { flex: 1, fontSize: 17, fontWeight: '700', color: C.lux900 },
  nowBadge: {
    backgroundColor: C.lux900,
    paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: 16,
  },
  nowText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  quickRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 4,
  },
  quickBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', gap: 8,
    backgroundColor: '#fff',
    paddingVertical: 12, borderRadius: 18,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
  },
  quickDivider: { width: 8 },
  quickText: { fontSize: 14, fontWeight: '700', color: C.lux900 },
});