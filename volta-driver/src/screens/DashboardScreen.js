import React, { useEffect, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Image,
  Animated, Easing, Platform, Dimensions
} from 'react-native';
import { Menu, ShieldAlert, Settings, Zap } from 'lucide-react-native';
import C from '../constants/colors';




const { width, height } = Dimensions.get('window');

export default function DashboardScreen({ isOnline, toggleOnline, onMenuPress, onSafetyPress, onSettingsPress, onPromoPress, onProfilePress, wallet, profile }) {
  const pulse1 = useRef(new Animated.Value(0)).current;
  const pulse2 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isOnline) {
      const startPulse = (anim, delay) => {
        Animated.loop(
          Animated.sequence([
            Animated.delay(delay),
            Animated.timing(anim, { toValue: 1, duration: 2000, easing: Easing.out(Easing.ease), useNativeDriver: true }),
            Animated.timing(anim, { toValue: 0, duration: 100, useNativeDriver: true }),
          ])
        ).start();
      };
      startPulse(pulse1, 0);
      startPulse(pulse2, 1000);
    } else {
      pulse1.stopAnimation(); pulse1.setValue(0);
      pulse2.stopAnimation(); pulse2.setValue(0);
    }
  }, [isOnline]);

  const p1Scale = pulse1.interpolate({ inputRange: [0, 1], outputRange: [1, 1.9] });
  const p1Opacity = pulse1.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.5, 0.2, 0] });
  const p2Scale = pulse2.interpolate({ inputRange: [0, 1], outputRange: [1, 1.9] });
  const p2Opacity = pulse2.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.5, 0.2, 0] });

  return (
    // justify-between: top header at top, GO button area at bottom — matches driver HTML
    <View style={styles.container} pointerEvents="box-none">

      {/* ── TOP: Earnings Header ───────────────────────── */}
      <View style={styles.header} pointerEvents="auto">
        <TouchableOpacity onPress={onMenuPress} style={styles.menuBtn}>
          <Menu color="#fff" size={22} strokeWidth={2} />
        </TouchableOpacity>

        <View style={styles.earningsCenter}>
          <Text style={styles.earningsLabel}>Today's Earnings</Text>
          <Text style={styles.earningsAmount}>{(wallet?.balance ?? 0).toLocaleString()} GNF</Text>
        </View>

        <TouchableOpacity style={styles.avatarWrap}>
          <Image
            source={{ uri: `https://api.dicebear.com/7.x/avataaars/png?seed=${profile?.first_name || 'User'}` }}
            style={styles.avatar}
          />
          <View style={[styles.statusDot, { backgroundColor: isOnline ? C.brand : C.red }]} />
        </TouchableOpacity>
      </View>

      {/* ── STATUS PILL (shows only when online) ────────── */}
      {isOnline && (
        <View style={styles.statusPillWrap} pointerEvents="none">
          <View style={styles.statusPill}>
            <View style={styles.statusPillDot} />
            <Text style={styles.statusPillText}>Online · Finding Trips...</Text>
          </View>
        </View>
      )}

      {/* ── BOTTOM: GO Button ──────────── */}
      <View style={styles.bottomArea} pointerEvents="auto">
        {/* Offline message */}
        {!isOnline && (
          <View style={styles.offlineCard}>
            <Text style={styles.offlineTitle}>You're Offline</Text>
            <Text style={styles.offlineSub}>Tap GO to start receiving requests</Text>
          </View>
        )}

        {/* GO / STOP button with pulse rings */}
        <View style={styles.goBtnArea}>
          {isOnline && (
            <>
              <Animated.View style={[styles.pulseRing, { transform: [{ scale: p1Scale }], opacity: p1Opacity }]} />
              <Animated.View style={[styles.pulseRing, { transform: [{ scale: p2Scale }], opacity: p2Opacity }]} />
            </>
          )}
          <TouchableOpacity
            style={[styles.goBtn, isOnline ? styles.goBtnStop : styles.goBtnGo]}
            onPress={toggleOnline}
            activeOpacity={0.9}
          >
            <Text style={styles.goBtnText}>{isOnline ? 'STOP' : 'GO'}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ── PROPER BOTTOM NAV BAR ──────────── */}
      <View style={styles.navWrap} pointerEvents="auto">
        <View style={styles.nav}>
          <TouchableOpacity style={styles.navItem} onPress={onSafetyPress}>
            <ShieldAlert size={24} color={C.gray400} />
            <Text style={styles.navLabel}>Safety</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.navItem} onPress={onSettingsPress}>
            <Settings size={24} color={C.gray400} />
            <Text style={styles.navLabel}>Settings</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.navItem} onPress={onPromoPress}>
            <Zap size={24} color={C.gray400} />
            <Text style={styles.navLabel}>Promo</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: width,
    height: height,
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 56 : 44,
    paddingBottom: 0,
    zIndex: 10,
  },

  // Header
  header: {
    marginHorizontal: 16,
    backgroundColor: 'rgba(30,30,30,0.85)',
    borderRadius: 100,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: 8, paddingLeft: 12, paddingRight: 8,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
    shadowColor: 'rgba(0,0,0,0.5)', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 12, elevation: 8,
  },
  menuBtn: { padding: 10 },
  earningsCenter: { alignItems: 'center' },
  earningsLabel: { fontSize: 10, color: C.gray400, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },
  earningsAmount: { fontSize: 18, fontWeight: '800', color: '#fff' },
  avatarWrap: { position: 'relative' },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: C.gray800 },
  statusDot: {
    position: 'absolute', bottom: 0, right: 0,
    width: 12, height: 12, borderRadius: 6,
    borderWidth: 2, borderColor: C.surface,
  },

  // Status pill
  statusPillWrap: { alignItems: 'center' },
  statusPill: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: 'rgba(5,163,87,0.12)',
    borderWidth: 1, borderColor: 'rgba(5,163,87,0.3)',
    paddingHorizontal: 20, paddingVertical: 8, borderRadius: 20,
  },
  statusPillDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: C.brand },
  statusPillText: { color: C.brand, fontWeight: '700', fontSize: 13 },

  // Bottom area
  bottomArea: { alignItems: 'center', gap: 28, paddingBottom: Platform.OS === 'ios' ? 100 : 80 },

  offlineCard: {
    alignItems: 'center',
    backgroundColor: 'rgba(30,30,30,0.8)',
    paddingHorizontal: 28, paddingVertical: 14,
    borderRadius: 20,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
  },
  offlineTitle: { color: '#fff', fontSize: 17, fontWeight: '800', marginBottom: 2 },
  offlineSub: { color: C.gray400, fontSize: 13, fontWeight: '500' },

  goBtnArea: {
    width: 112, height: 112,
    alignItems: 'center', justifyContent: 'center',
  },
  pulseRing: {
    position: 'absolute',
    width: 112, height: 112, borderRadius: 56,
    backgroundColor: C.red,
  },
  goBtn: {
    width: 112, height: 112, borderRadius: 56,
    alignItems: 'center', justifyContent: 'center',
    shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.5, shadowRadius: 24,
    elevation: 16, zIndex: 2,
  },
  goBtnGo: { backgroundColor: C.brand, shadowColor: C.brand },
  goBtnStop: { backgroundColor: C.red, shadowColor: C.red },
  goBtnText: { color: '#fff', fontSize: 26, fontWeight: '900', letterSpacing: 2 },

  // Bottom Nav
  navWrap: { position: 'absolute', bottom: 0, left: 0, right: 0 },
  nav: {
    flexDirection: 'row',
    backgroundColor: 'rgba(18,18,18,0.97)',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255,255,255,0.09)',
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 30 : 14,
    shadowColor: 'rgba(0,0,0,0.5)', shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 12,
  },
  navItem: { flex: 1, alignItems: 'center', gap: 3 },
  navLabel: { fontSize: 10, fontWeight: '700', color: C.gray400 },
});