import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Animated, Dimensions } from 'react-native';
import { Star, X } from 'lucide-react-native';
import C from '../constants/colors';



const { width, height } = Dimensions.get('window');

export default function RequestScreen({ trip, onAccept, onDecline }) {
  const slideAnim = useRef(new Animated.Value(Dimensions.get('window').height)).current;
  const progressAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Slide up
    Animated.spring(slideAnim, { toValue: 0, tension: 50, friction: 8, useNativeDriver: true }).start();
    
    // Progress bar shrink (15s timeout)
    Animated.timing(progressAnim, { toValue: 0, duration: 15000, useNativeDriver: false }).start();
  }, []);

  const handleAction = (action) => {
    Animated.timing(slideAnim, { toValue: Dimensions.get('window').height, duration: 300, useNativeDriver: true }).start(() => {
      if(action === 'accept') onAccept();
      else onDecline();
    });
  };

  const progressWidth = progressAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });

  return (
    <View style={styles.container}>
      <View style={styles.overlay} />
      
      <Animated.View style={[styles.card, { transform: [{ translateY: slideAnim }] }]}>
        
        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.headerTopRow}>
            <View style={styles.badgeRow}>
              <Star size={16} color="#000" fill="#000" />
              <Text style={styles.badgeText}>Premium Trip</Text>
            </View>
            <Text style={styles.timer}>15s</Text>
          </View>
          <View style={styles.progressBarBg}>
            <Animated.View style={[styles.progressBarFill, { width: progressWidth }]} />
          </View>
        </View>

        <View style={styles.content}>
          {/* Price */}
          <Text style={styles.price}>{(trip?.price || 85000).toLocaleString()} GNF</Text>
          <Text style={styles.tipText}>Includes expected tip</Text>
          
          <View style={styles.divider} />

          {/* Route Info */}
          <View style={styles.routeRow}>
            <View style={styles.routeDots}>
              <View style={styles.dotGreen} />
              <View style={styles.dotLine} />
              <View style={styles.dotRed} />
            </View>
            <View style={styles.routeTexts}>
              <View style={styles.routeLeg}>
                <Text style={styles.routeTime}>4 min away</Text>
                <Text style={styles.routeDist}>1.2 miles</Text>
              </View>
              <View style={styles.routeLeg}>
                <Text style={styles.routeTime}>18 min trip</Text>
                <Text style={styles.routeDist}>5.4 miles</Text>
              </View>
            </View>
          </View>

          {/* Customer Info */}
          <View style={styles.customerRow}>
            {trip?.customer?.photo ? (
              <Image source={{ uri: trip.customer.photo }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, { alignItems: 'center', justifyContent: 'center' }]}>
                <Text style={{color: '#fff', fontWeight: 'bold'}}>{(trip?.customer?.name || 'C')[0]}</Text>
              </View>
            )}
            <View>
              <Text style={styles.customerName}>{trip?.customer?.name || 'Customer'}</Text>
              <Text style={styles.customerStats}>4.92 Rating • 150+ Trips</Text>
            </View>
          </View>

          {/* Actions */}
          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.btnDecline} onPress={() => handleAction('decline')} activeOpacity={0.8}>
              <X size={24} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.btnAccept} onPress={() => handleAction('accept')} activeOpacity={0.9}>
              <Text style={styles.btnAcceptText}>Tap to Accept</Text>
            </TouchableOpacity>
          </View>
        </View>

      </Animated.View>
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
    justifyContent: 'flex-end',
    zIndex: 999,
    elevation: 99,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: width,
    height: height,
    backgroundColor: 'rgba(11,16,30,0.95)',
  },
  card: { backgroundColor: C.surface, borderTopLeftRadius: 32, borderTopRightRadius: 32, overflow: 'hidden' },
  
  header: { backgroundColor: C.brand, padding: 24, paddingBottom: 16 },
  headerTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  badgeRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 100, gap: 4 },
  badgeText: { color: '#000', fontWeight: '800', fontSize: 13 },
  timer: { color: '#fff', fontSize: 18, fontWeight: '700' },
  progressBarBg: { height: 4, backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 2 },
  progressBarFill: { height: 4, backgroundColor: '#fff', borderRadius: 2 },

  content: { padding: 24 },
  price: { fontSize: 48, fontWeight: '900', color: '#fff', textAlign: 'center', marginBottom: 4 },
  tipText: { color: C.brand, fontSize: 14, fontWeight: '600', textAlign: 'center' },
  
  divider: { height: 1, backgroundColor: C.surfaceRaised, marginVertical: 24 },

  routeRow: { flexDirection: 'row', gap: 16, marginBottom: 24 },
  routeDots: { alignItems: 'center', paddingVertical: 6 },
  dotGreen: { width: 12, height: 12, borderRadius: 6, backgroundColor: C.brand },
  dotLine: { width: 2, height: 24, backgroundColor: C.surfaceRaised, marginVertical: 4 },
  dotRed: { width: 12, height: 12, backgroundColor: C.red },
  routeTexts: { flex: 1, gap: 16 },
  routeLeg: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  routeTime: { color: '#fff', fontSize: 18, fontWeight: '700' },
  routeDist: { color: C.gray400, fontSize: 15, fontWeight: '500' },

  customerRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.surfaceRaised, padding: 16, borderRadius: 16, marginBottom: 24 },
  avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#000', marginRight: 16 },
  customerName: { color: '#fff', fontSize: 16, fontWeight: '700', marginBottom: 4 },
  customerStats: { color: C.gray400, fontSize: 13, fontWeight: '500' },

  actionRow: { flexDirection: 'row', gap: 16 },
  btnDecline: { width: 64, height: 64, borderRadius: 32, backgroundColor: C.surfaceRaised, alignItems: 'center', justifyContent: 'center' },
  btnAccept: { flex: 1, height: 64, borderRadius: 32, backgroundColor: C.brand, alignItems: 'center', justifyContent: 'center', shadowColor: C.brand, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 5 },
  btnAcceptText: { color: '#fff', fontSize: 20, fontWeight: '800' },
});
