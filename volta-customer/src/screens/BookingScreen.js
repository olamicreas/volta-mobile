import React, { useState, useRef, useEffect } from 'react';
import { useStripe } from '@stripe/stripe-react-native';
import { Alert } from 'react-native';
import { ActivityIndicator,
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
  PanResponder, Animated, Dimensions, Platform
} from 'react-native';
import { BlurView } from 'expo-blur';
import { ArrowLeft, Users, ChevronRight } from 'lucide-react-native';
import C from '../constants/colors';
import api from '../services/api';
import { useTranslation } from '../constants/translations';

const { width, height } = Dimensions.get('window');

// ── Slide-to-book button ──────────────────────────────────
function SlideToBook({ vehicleName, onComplete }) {
  const { t } = useTranslation();
  const pan = useRef(new Animated.Value(0)).current;
  const panValue = useRef(0);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  const [trackW, setTrackW] = useState(0);
  const THUMB = 52;
  const MAX = Math.max(1, trackW - THUMB - 12); // 6px padding each side
  const maxRef = useRef(MAX);
  maxRef.current = MAX;

  useEffect(() => {
    pan.flattenOffset();
    pan.setValue(0);
    panValue.current = 0;
  }, [vehicleName]);

  useEffect(() => {
    const sub = pan.addListener(({ value }) => { panValue.current = value; });
    return () => pan.removeListener(sub);
  }, [pan]);

  const responder = useRef(PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 3,
    onPanResponderGrant: () => {
      pan.setOffset(panValue.current);
      pan.setValue(0);
    },
    onPanResponderMove: (_, g) => {
      const currentMax = maxRef.current || 200;
      if (g.dx >= 0 && g.dx <= currentMax) {
        pan.setValue(g.dx);
      }
    },
    onPanResponderRelease: (_, g) => {
      pan.flattenOffset();
      const currentMax = maxRef.current || 200;
      const threshold = currentMax * 0.35;
      if (g.dx >= threshold || panValue.current >= threshold) {
        Animated.timing(pan, { toValue: currentMax, duration: 150, useNativeDriver: false }).start(() => {
          if (onCompleteRef.current) {
            onCompleteRef.current();
          }
          setTimeout(() => {
            pan.setValue(0);
            panValue.current = 0;
          }, 800);
        });
      } else {
        Animated.spring(pan, { toValue: 0, useNativeDriver: false }).start(() => {
          panValue.current = 0;
        });
      }
    },
  })).current;

  // Declarative interpolations (The React Native Way)
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

  return (
    <View
      style={styles.slideTrack}
      onLayout={e => setTrackW(e.nativeEvent.layout.width)}
    >
      <Animated.Text style={[styles.slideLabel, { opacity: textOpac }]}>
        {t('booking.slide_to_book', { name: vehicleName })}
      </Animated.Text>
      <Animated.View
        style={[styles.slideThumb, { transform: [{ translateX }] }]}
        {...responder.panHandlers}
      >
        <ChevronRight color={C.lux900} size={24} strokeWidth={3} />
      </Animated.View>
    </View>
  );
}

// ── Vehicle card base ─────────────────────────────────────
const VEHICLES_BASE = [
  { id: 'PassengerBike', labelKey: 'booking.bike', seats: 1, base: 5000, perKm: 1500, perMin: 100, descKey: 'booking.bike_desc', dark: false, recommended: false },
  { id: 'Regular', labelKey: 'booking.regular', seats: 4, base: 10000, perKm: 2500, perMin: 200, descKey: 'booking.regular_desc', dark: true, recommended: true },
  { id: 'SUV', labelKey: 'booking.suv', seats: 6, base: 15000, perKm: 3500, perMin: 300, descKey: 'booking.suv_desc', dark: false, recommended: false },
  { id: 'DeliveryBike', labelKey: 'booking.delivery', seats: 0, base: 5000, perKm: 1500, perMin: 100, descKey: 'booking.delivery_desc', dark: false, recommended: false },
];

export default function BookingScreen({ destination, onBack, onConfirm, onPaymentPress, routeInfo }) {
  const { t, isFrench } = useTranslation();
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const [paymentMethod, setPaymentMethod] = useState('FLUTTERWAVE'); // 'FLUTTERWAVE' | 'STRIPE' | 'CASH'
  const [selected, setSelected] = useState('Regular');
  const swipeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(swipeAnim, { toValue: 10, duration: 800, useNativeDriver: true }),
        Animated.timing(swipeAnim, { toValue: 0, duration: 800, useNativeDriver: true }),
      ])
    ).start();
  }, [swipeAnim]);

  let routeMeta = t('booking.calculating');
  if (routeInfo && routeInfo.duration) {
    const mins = Math.max(1, Math.round(routeInfo.duration / 60));
    const km = (routeInfo.distance / 1000).toFixed(1);
    routeMeta = `~${mins} ${t('booking.min')} · ${km} ${t('booking.km')}`;
  }

  const currency = paymentMethod === 'STRIPE' ? 'USD' : 'GNF';
  const exchangeRate = 1 / 8500;

  const vehicles = VEHICLES_BASE.map(v => {
    let price = v.base + (v.perKm * 5); // default fallback price
    if (routeInfo && routeInfo.distance && routeInfo.duration) {
      const km = routeInfo.distance / 1000;
      const mins = routeInfo.duration / 60;
      price = v.base + (km * v.perKm) + (mins * v.perMin);
    }
    
    // Always convert based on the currently active currency
    if (currency === 'GNF') {
      price = Math.max(v.base, Math.round(price / 500) * 500);
    } else {
      price = Math.max(v.base * exchangeRate, parseFloat((price * exchangeRate).toFixed(2)));
    }
    return {
      ...v,
      label: t(v.labelKey),
      desc: t(v.descKey),
      price
    };
  });

  const current = vehicles.find(v => v.id === selected) || vehicles[1];

  const handleConfirm = () => {
    // Payment method is locked in at booking; payment is processed upon trip completion
    onConfirm(current.label, current.price, paymentMethod, currency);
  };

  return (
    // Full screen dark overlay — map is NOT visible here
    <View style={styles.root}>
      {/* ── Back button ─────────────────────────────── */}
      <TouchableOpacity style={styles.backBtn} onPress={onBack} activeOpacity={0.85}>
        <ArrowLeft size={20} color={C.lux900} strokeWidth={2.5} />
      </TouchableOpacity>

      {/* ── Glass panel anchored at bottom ──────────── */}
      <View style={styles.panel}>
        {/* Gold glow decoration */}
        <View style={styles.goldGlow} pointerEvents="none" />

        {/* Route info */}
        <View style={styles.routeSection}>
          <Text style={styles.routeFrom}>{t('booking.route_from')}</Text>
          <Text style={styles.routeDest} numberOfLines={1} ellipsizeMode="tail">
            {destination || 'Destination'}
          </Text>
          <Text style={styles.routeMeta}>{routeMeta}</Text>
        </View>

        {/* Vehicle cards — horizontal scroll */}
        <View style={{flexDirection: 'row', justifyContent: 'flex-end', paddingRight: 8, marginBottom: 8, alignItems: 'center'}}>
          <Text style={{fontSize: 12, color: C.gray500, fontWeight: '600'}}>{t('booking.swipe_more')}</Text>
          <Animated.View style={{transform: [{translateX: swipeAnim}]}}>
            <ChevronRight size={14} color={C.gray500} />
          </Animated.View>
        </View>

        {!routeInfo ? (
          <View style={{ width: '100%', alignItems: 'center', justifyContent: 'center', paddingVertical: 60 }}>
            <ActivityIndicator size="large" color={C.lux900} style={{ marginBottom: 20, transform: [{ scale: 1.2 }] }} />
            <Text style={{ color: C.lux900, fontSize: 18, fontWeight: '700', letterSpacing: -0.3, marginBottom: 6 }}>{t('booking.calculating')}</Text>
            <Text style={{ color: C.gray500, fontSize: 14, fontWeight: '500' }}>{t('booking.fetching_pricing')}</Text>
          </View>
        ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.cardScroll}
          contentContainerStyle={styles.cardScrollContent}
          decelerationRate="fast"
          snapToInterval={width * 0.62 + 12}
          snapToAlignment="start"
        >
            {vehicles.map(v => (
            <TouchableOpacity
              key={v.id}
              style={[
                styles.vCard,
                v.dark ? styles.vCardDark : styles.vCardLight,
                selected === v.id && (v.dark ? styles.vCardDarkSelected : styles.vCardLightSelected),
              ]}
              onPress={() => setSelected(v.id)}
              activeOpacity={0.88}
            >
              {v.recommended && (
                <View style={styles.recBadge}>
                  <Text style={styles.recText}>{isFrench ? 'RECOMMANDÉ' : 'RECOMMENDED'}</Text>
                </View>
              )}
              <View style={styles.vTop}>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Text style={[styles.vName, v.dark ? styles.vNameDark : styles.vNameLight]}>
                    {v.label}
                  </Text>
                  <View style={styles.seatsRow}>
                    <Users size={12} color={v.dark ? '#9CA3AF' : C.gray500} />
                    <Text style={[styles.seatsText, { color: v.dark ? '#9CA3AF' : C.gray500 }]}>
                      {' '}{v.seats} {isFrench ? 'Places' : 'Seats'}
                    </Text>
                  </View>
                </View>
                {/* Price — shrink to fit, never overflow */}
                <Text
                  style={[styles.vPrice, v.dark ? styles.vPriceDark : styles.vPriceLight]}
                  numberOfLines={1}
                  adjustsFontSizeToFit
                >
                  {currency === 'USD' ? `$${v.price.toFixed(2)}` : `${v.price.toLocaleString()} GNF`}
                </Text>
              </View>
              <Text style={[styles.vDesc, { color: v.dark ? '#9CA3AF' : C.gray500 }]}>
                {v.desc}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        )}

        {/* Payment Method selector row */}
        <View style={{ flexDirection: 'row', gap: 10, marginBottom: 12 }}>
          <TouchableOpacity style={[styles.payRow, { flex: 1, marginBottom: 0 }]} onPress={() => {
            Alert.alert(
              t('booking.payment_method_title'),
              t('booking.payment_method_msg'),
              [
                { 
                  text: t('booking.pay_flutterwave'), 
                  onPress: () => setPaymentMethod('FLUTTERWAVE')
                },
                { 
                  text: t('booking.pay_stripe'), 
                  onPress: () => setPaymentMethod('STRIPE')
                },
                { 
                  text: t('booking.pay_cash'), 
                  onPress: () => setPaymentMethod('CASH')
                },
                { text: t('common.cancel'), style: 'cancel' }
              ]
            );
          }}>
          <View style={{ 
            backgroundColor: paymentMethod === 'STRIPE' ? '#6366f1' : paymentMethod === 'FLUTTERWAVE' ? '#f59e0b' : C.gold, 
            paddingHorizontal: 8, 
            paddingVertical: 4, 
            borderRadius: 6, 
            marginRight: 10 
          }}>
            <Text style={{ color: '#fff', fontSize: 10, fontWeight: '800' }}>
              {paymentMethod === 'STRIPE' ? 'STRIPE (USD)' : paymentMethod === 'FLUTTERWAVE' ? 'FLUTTERWAVE (GNF)' : 'CASH (GNF)'}
            </Text>
          </View>
          <Text style={styles.payLabel}>{t('booking.payment')}</Text>
          <ChevronRight size={18} color={C.gray400} />
        </TouchableOpacity>

          <View style={[styles.payRow, { paddingHorizontal: 12, marginBottom: 0 }]}>
            <Text style={{ color: C.lux900, fontWeight: '800', fontSize: 13 }}>{currency}</Text>
          </View>
        </View>

        {/* Slide to book */}
        {routeInfo && <SlideToBook
          vehicleName={current.label}
          onComplete={handleConfirm}
        />}
      </View>
    </View>
  );
}

const CARD_W = Math.min(width * 0.62, 240);

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: 'rgba(11,16,30,0.55)',
    justifyContent: 'center',
  },

  backBtn: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 58 : 44,
    left: 16,
    width: 46, height: 46,
    borderRadius: 23,
    backgroundColor: '#fff',
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12, shadowRadius: 12, elevation: 6,
    zIndex: 10,
  },

  // Glass panel at the bottom
  panel: {
    marginHorizontal: 12,
    marginBottom: 0,
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: 32,
    padding: 20,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.5)',
    shadowColor: '#000', shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.18, shadowRadius: 40, elevation: 20,
    overflow: 'hidden',
  },
  goldGlow: {
    position: 'absolute', top: -60, right: -60,
    width: 160, height: 160, borderRadius: 80,
    backgroundColor: 'rgba(212,175,55,0.18)',
  },

  // Route
  routeSection: { marginBottom: 16 },
  routeFrom: { fontSize: 11, fontWeight: '700', color: C.gold, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 2 },
  routeDest: { fontSize: 20, fontWeight: '800', color: C.lux900, marginBottom: 3 },
  routeMeta: { fontSize: 13, color: C.gray500, fontWeight: '500' },

  // Vehicle cards
  cardScroll: { marginHorizontal: -20 },
  cardScrollContent: { paddingHorizontal: 20, gap: 12, paddingBottom: 4 },
  vCard: {
    width: CARD_W,
    borderRadius: 22,
    padding: 16,
    borderWidth: 2,
  },
  vCardDark: { backgroundColor: C.lux900, borderColor: C.gold },
  vCardLight: { backgroundColor: '#fff', borderColor: 'transparent', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 },
  vCardDarkSelected: { borderColor: C.gold },
  vCardLightSelected: { borderColor: C.gray400 },

  recBadge: {
    alignSelf: 'flex-end',
    backgroundColor: C.gold,
    paddingHorizontal: 10, paddingVertical: 3,
    borderRadius: 8,
    marginTop: -16, marginRight: -16, marginBottom: 8,
  },
  recText: { color: C.lux900, fontSize: 8, fontWeight: '800', letterSpacing: 1.5 },

  vTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  vName: { fontSize: 18, fontWeight: '700' },
  vNameDark: { color: '#fff' },
  vNameLight: { color: C.lux900 },
  seatsRow: { flexDirection: 'row', alignItems: 'center', marginTop: 3 },
  seatsText: { fontSize: 12, fontWeight: '500' },
  vPrice: { fontSize: 16, fontWeight: '800', flexShrink: 1 },
  vPriceDark: { color: C.gold },
  vPriceLight: { color: C.lux900 },
  vDesc: { fontSize: 12, fontWeight: '500' },

  // Payment row
  payRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: C.gray50,
    borderRadius: 14, padding: 14,
    marginTop: 14, marginBottom: 14,
    borderWidth: 1, borderColor: C.gray100,
  },
  cinetTag: { backgroundColor: '#10B981', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, marginRight: 10 },
  cinetTagText: { color: '#fff', fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
  payLabel: { flex: 1, fontSize: 15, fontWeight: '700', color: C.lux900 },

  // Slide button
  slideTrack: {
    height: 64,
    backgroundColor: C.lux800,
    borderRadius: 100,
    overflow: 'hidden',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  slideLabel: {
    position: 'absolute',
    left: 0, right: 0,
    textAlign: 'center',
    color: '#fff', fontWeight: '700', fontSize: 15, letterSpacing: 0.3,
  },
  slideThumb: {
    position: 'absolute',
    left: 6,
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: C.gold,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: C.gold, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5, shadowRadius: 12, elevation: 8,
  },
});
