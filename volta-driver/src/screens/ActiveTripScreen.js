import React, { useRef, useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Animated, PanResponder } from 'react-native';
import { CornerUpRight, MessageSquare, Phone, ChevronRight } from 'lucide-react-native';
import C from '../constants/colors';




// Custom green Slide-to-Action button matching HTML exactly
function SlideToAction({ actionText, onComplete }) {
  const pan = useRef(new Animated.Value(0)).current;
  const panValue = useRef(0);

  useEffect(() => {
    pan.flattenOffset();
    pan.setValue(0);
    panValue.current = 0;
  }, [actionText]);

  useEffect(() => {
    const sub = pan.addListener(({ value }) => { panValue.current = value; });
    return () => pan.removeListener(sub);
  }, [pan]);

  const [trackW, setTrackW] = useState(0);
  const THUMB = 56;
  const PADDING = 6;
  const MAX = Math.max(1, trackW - THUMB - (PADDING * 2));

  const panResponder = useRef(PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: () => {
      pan.setOffset(panValue.current);
      pan.setValue(0);
    },
    onPanResponderMove: Animated.event([null, { dx: pan }], { useNativeDriver: false }),
    onPanResponderRelease: (_, g) => {
      pan.flattenOffset();
      if (g.dx >= MAX * 0.5 || panValue.current >= MAX * 0.5) {
        onComplete();
        Animated.spring(pan, { toValue: MAX, useNativeDriver: false }).start();
      } else {
        Animated.spring(pan, { toValue: 0, useNativeDriver: false }).start();
      }
    },
  })).current;

  const translateX = pan.interpolate({
    inputRange: [0, MAX],
    outputRange: [0, MAX],
    extrapolate: 'clamp'
  });

  const textOpac = pan.interpolate({
    inputRange: [0, MAX * 0.5],
    outputRange: [1, 0],
    extrapolate: 'clamp'
  });

  const fillWidth = pan.interpolate({
    inputRange: [0, MAX],
    outputRange: [THUMB + (PADDING * 2), MAX + THUMB + (PADDING * 2)],
    extrapolate: 'clamp'
  });

  return (
    <View style={styles.slideTrack} onLayout={e => setTrackW(e.nativeEvent.layout.width)}>
      <Animated.View style={[styles.slideFill, { width: fillWidth }]} />
      <Animated.Text style={[styles.slideText, { opacity: textOpac }]}>{actionText}</Animated.Text>
      
      <Animated.View style={[styles.slideThumb, { transform: [{ translateX }] }]} {...panResponder.panHandlers}>
        <ChevronRight color="#fff" size={28} />
      </Animated.View>
    </View>
  );
}


const { width, height } = Dimensions.get('window');

import { useNavigation } from '@react-navigation/native';

export default function ActiveTripScreen({ trip, onStatusUpdate, onChat, onCall }) {
  const navigation = useNavigation();
  const status = trip?.status || 'ACCEPTED';
  const customerName = trip?.customer?.name || 'Rider';

  const isPickup = status === 'ACCEPTED' || status === 'ARRIVING';
  
  const navText = isPickup ? "In 500 feet, turn right on 5th Ave" : "In 2 miles, take exit 4A";
  const titleText = isPickup ? `Picking up ${customerName}` : `Driving ${customerName}`;
  const actionText = isPickup ? "Slide to Arrive" : "Slide to Complete";
  const etaString = isPickup ? '3 min away' : '12 min to destination';

  const handleComplete = () => {
    if (isPickup) {
      onStatusUpdate('ARRIVED');
    } else {
      onStatusUpdate('COMPLETED');
    }
  };

  return (
    <View style={styles.container} pointerEvents="box-none">
      
      {/* Top Navigation Banner */}
      <View style={styles.navHeader}>
        <View style={styles.navIconBox}>
          <CornerUpRight size={24} color="#fff" />
        </View>
        <Text style={styles.navText}>{navText}</Text>
      </View>

      {/* Bottom Sheet */}
      <View style={styles.bottomSheet}>
        <View style={styles.dragHandle} />
        
        <View style={styles.sheetTop}>
          <Text style={styles.title}>{titleText}</Text>
          <Text style={styles.etaText}>{etaString}</Text>
        </View>

        <View style={styles.actionsRow}>
          <TouchableOpacity style={styles.actionBtn} onPress={onChat} activeOpacity={0.8}>
            <MessageSquare size={20} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} activeOpacity={0.8} onPress={onCall}>
            <Phone size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        <SlideToAction actionText={actionText} onComplete={handleComplete} />
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
    zIndex: 999,
    elevation: 99,
  },
  
  navHeader: { backgroundColor: C.brand, marginHorizontal: 16, marginTop: 60, borderRadius: 24, padding: 16, flexDirection: 'row', alignItems: 'center', shadowColor: C.brand, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 5 },
  navIconBox: { width: 48, height: 48, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center', marginRight: 16 },
  navText: { flex: 1, color: '#fff', fontSize: 18, fontWeight: '700' },

  bottomSheet: { backgroundColor: C.surface, borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 24, paddingBottom: 40, shadowColor: '#000', shadowOffset: { width: 0, height: -10 }, shadowOpacity: 0.2, shadowRadius: 20, elevation: 20 },
  dragHandle: { width: 40, height: 5, borderRadius: 3, backgroundColor: C.surfaceRaised, alignSelf: 'center', marginBottom: 24 },
  
  sheetTop: { alignItems: 'center', marginBottom: 24 },
  title: { fontSize: 24, fontWeight: '800', color: '#fff', marginBottom: 4 },
  etaText: { fontSize: 16, fontWeight: '700', color: C.brand },

  actionsRow: { flexDirection: 'row', gap: 16, marginBottom: 24 },
  actionBtn: { flex: 1, height: 56, borderRadius: 16, backgroundColor: C.surfaceRaised, alignItems: 'center', justifyContent: 'center' },

  // Slide to Action
  slideTrack: { height: 68, backgroundColor: '#2A2A2A', borderRadius: 34, overflow: 'hidden', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6 },
  slideFill: { position: 'absolute', left: 0, top: 0, bottom: 0, backgroundColor: C.brand, borderRadius: 34 },
  slideText: { position: 'absolute', width: '100%', textAlign: 'center', color: '#fff', fontWeight: '700', fontSize: 18, zIndex: 1 },
  slideThumb: { width: 56, height: 56, borderRadius: 28, backgroundColor: C.brand, alignItems: 'center', justifyContent: 'center', position: 'absolute', left: 6, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 4, zIndex: 2 },
});
