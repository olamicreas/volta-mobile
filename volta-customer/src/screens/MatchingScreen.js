import React, { useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Easing, Dimensions } from 'react-native';
import { Loader2 } from 'lucide-react-native';
import C from '../constants/colors';

const { width, height } = Dimensions.get('window');

export default function MatchingScreen({ vehicle, onCancel }) {
  const ring1 = useRef(new Animated.Value(0)).current;
  const ring2 = useRef(new Animated.Value(0)).current;
  const spin = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Pulse rings — matching HTML pulse-ring animation (2.5s infinite)
    const pulseRing = (anim, delay) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(anim, { toValue: 1, duration: 1750, easing: Easing.out(Easing.ease), useNativeDriver: true }),
          Animated.timing(anim, { toValue: 0, duration: 750, useNativeDriver: true }),
        ])
      ).start();

    pulseRing(ring1, 0);
    pulseRing(ring2, 500);

    // Spinner
    Animated.loop(
      Animated.timing(spin, { toValue: 1, duration: 1000, easing: Easing.linear, useNativeDriver: true })
    ).start();
  }, []);

  const ring1Scale = ring1.interpolate({ inputRange: [0, 1], outputRange: [0.8, 1.1] });
  const ring1Opacity = ring1.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.8, 0.4, 0] });
  const ring2Scale = ring2.interpolate({ inputRange: [0, 1], outputRange: [0.8, 1.1] });
  const ring2Opacity = ring2.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.8, 0.4, 0] });
  const rotate = spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  return (
    <View style={styles.container}>
      {/* Radar Rings */}
      <View style={styles.radarWrap}>
        <Animated.View style={[styles.ring, { transform: [{ scale: ring1Scale }], opacity: ring1Opacity }]} />
        <Animated.View style={[styles.ring, styles.ring2, { transform: [{ scale: ring2Scale }], opacity: ring2Opacity }]} />

        {/* Center spinner circle */}
        <View style={styles.spinnerCircle}>
          <Animated.View style={{ transform: [{ rotate }] }}>
            <Loader2 color={C.gold} size={32} />
          </Animated.View>
        </View>
      </View>

      <Text style={styles.title}>Locating Chauffeur</Text>
      <Text style={styles.sub}>Connecting to {vehicle || 'Volta Black'}...</Text>

      <TouchableOpacity style={styles.cancelBtn} onPress={onCancel} activeOpacity={0.8}>
        <Text style={styles.cancelText}>Cancel Request</Text>
      </TouchableOpacity>
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
    // Increased opacity slightly to compensate for the removed blur filter
    backgroundColor: 'rgba(11,16,30,0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
    elevation: 99,
  },
  radarWrap: { width: 128, height: 128, alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  ring: { position: 'absolute', width: 128, height: 128, borderRadius: 64, backgroundColor: 'rgba(212,175,55,0.2)' },
  ring2: { backgroundColor: 'rgba(212,175,55,0.1)' },
  spinnerCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: C.lux900, borderWidth: 4, borderColor: C.gold, alignItems: 'center', justifyContent: 'center', shadowColor: C.gold, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.5, shadowRadius: 30, elevation: 10 },
  title: { fontSize: 30, fontWeight: '800', color: '#fff', textAlign: 'center', marginBottom: 8 },
  sub: { fontSize: 16, color: C.gold, fontWeight: '500', textAlign: 'center', marginBottom: 24 },
  cancelBtn: { backgroundColor: 'rgba(255,255,255,0.1)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', paddingHorizontal: 32, paddingVertical: 12, borderRadius: 100 },
  cancelText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});