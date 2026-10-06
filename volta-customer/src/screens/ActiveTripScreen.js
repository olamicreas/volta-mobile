import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { BlurView } from 'expo-blur';
import { MapPin, MessageSquare, Phone, Shield, Share2, ShieldAlert, XCircle } from 'lucide-react-native';
import C from '../constants/colors';




const { width, height } = Dimensions.get('window');

import { useNavigation } from '@react-navigation/native';

export default function ActiveTripScreen({ trip, onChat, onCall, routeInfo }) {
  const navigation = useNavigation();
  const status = trip?.status || 'ACCEPTED';

  const headerLabel = status === 'ARRIVED' ? 'Driver is here' : status === 'IN_PROGRESS' ? 'Heading to' : 'Arriving In';
  const headerTime = status === 'ARRIVED' ? 'Now' : status === 'IN_PROGRESS' ? 'Destination' : '4 Min';

  return (
    <View style={styles.container} pointerEvents="box-none">
      {/* Dynamic Island Top Banner */}
      <BlurView intensity={85} tint="dark" style={styles.dynamicIsland}>
        <View style={styles.islandLeft}>
          <View style={styles.islandIcon}>
            <MapPin size={20} color={C.gold} />
          </View>
          <View>
            <Text style={styles.islandLabel}>{headerLabel}</Text>
            <Text style={styles.islandTime}>{headerTime}</Text>
          </View>
        </View>
        <View style={styles.islandRight}>
          <Text style={styles.plateText}>LXY-992</Text>
          <Text style={styles.vehicleTypeText}>Black S-Class</Text>
        </View>
      </BlurView>

      {/* Driver Info Bottom Panel */}
      <BlurView intensity={90} tint="light" style={styles.driverPanel}>
        <View style={styles.driverTop}>
          <View style={styles.driverLeft}>
            {/* Avatar with gold border + rating badge */}
            <View style={styles.avatarWrap}>
              <View style={styles.avatar} />
              <View style={styles.ratingBadge}>
                <Text style={styles.ratingText}>5.0 ★</Text>
              </View>
            </View>
            <View>
              <Text style={styles.driverName}>Sarah</Text>
              <Text style={styles.driverTitle}>Professional Chauffeur</Text>
            </View>
          </View>
          <View style={styles.driverActions}>
            <TouchableOpacity style={styles.actionBtnLight} onPress={onChat}>
              <MessageSquare size={20} color={C.lux900} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionBtnDark} onPress={onCall}>
              <Phone size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Safety & Share row */}
        <View style={styles.safetyRow}>
          <TouchableOpacity style={styles.safetyBtn}>
            <Shield size={16} color="#16a34a" />
            <Text style={styles.safetyBtnText}>Safety</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.safetyBtn}>
            <Share2 size={16} color="#2563eb" />
            <Text style={styles.safetyBtnText}>Share ETA</Text>
          </TouchableOpacity>
        </View>
      </BlurView>
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
    paddingTop: 60,
    paddingBottom: 32,
    paddingHorizontal: 16,
    zIndex: 999,
    elevation: 99,
  },

  // Dynamic Island top bar
  dynamicIsland: { width: '90%', alignSelf: 'center', borderRadius: 32, paddingHorizontal: 20, paddingVertical: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  islandLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  islandIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(212,175,55,0.2)', alignItems: 'center', justifyContent: 'center' },
  islandLabel: { fontSize: 11, fontWeight: '700', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 1 },
  islandTime: { fontSize: 20, fontWeight: '800', color: '#fff' },
  islandRight: { alignItems: 'flex-end' },
  plateText: { fontSize: 14, fontWeight: '700', color: '#fff' },
  vehicleTypeText: { fontSize: 12, color: '#9ca3af', fontWeight: '500' },

  // Driver panel
  driverPanel: { borderRadius: 32, padding: 24, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.4)', shadowColor: '#000', shadowOffset: { width: 0, height: 20 }, shadowOpacity: 0.15, shadowRadius: 40, elevation: 10 },
  driverTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  driverLeft: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  avatarWrap: { position: 'relative' },
  avatar: { width: 64, height: 64, borderRadius: 32, backgroundColor: C.lux100, borderWidth: 2, borderColor: C.gold },
  ratingBadge: { position: 'absolute', bottom: -4, right: -4, backgroundColor: C.lux900, borderWidth: 1, borderColor: C.gold, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 20 },
  ratingText: { color: C.gold, fontSize: 10, fontWeight: '700' },
  driverName: { fontSize: 20, fontWeight: '800', color: C.lux900 },
  driverTitle: { fontSize: 13, color: C.gray500, fontWeight: '500' },
  driverActions: { flexDirection: 'row', gap: 8 },
  actionBtnLight: { width: 48, height: 48, borderRadius: 24, backgroundColor: C.lux100, alignItems: 'center', justifyContent: 'center' },
  actionBtnDark: { width: 48, height: 48, borderRadius: 24, backgroundColor: C.lux900, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 10, elevation: 5 },

  safetyRow: { flexDirection: 'row', gap: 12 },
  safetyBtn: { flex: 1, backgroundColor: C.gray50, borderWidth: 1, borderColor: C.gray200, borderRadius: 16, paddingVertical: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  safetyBtnText: { fontSize: 13, fontWeight: '700', color: C.lux900 },
});
