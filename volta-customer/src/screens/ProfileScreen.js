import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Dimensions } from 'react-native';
import { X } from 'lucide-react-native';
import C from '../constants/colors';

const { width, height } = Dimensions.get('window');

export default function ProfileScreen({ onClose, profile }) {
  return (
    <View style={styles.container} pointerEvents="auto">
      <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={onClose} />
      <View style={styles.sheet}>
        <View style={styles.sheetBar} />
        <View style={styles.sheetHeader}>
          <Text style={styles.sheetTitle}>My Profile</Text>
          <TouchableOpacity onPress={onClose} style={styles.sheetClose}>
            <X size={18} color={C.lux900} />
          </TouchableOpacity>
        </View>
        <View style={{ alignItems: 'center', paddingVertical: 28 }}>
          <Image
            source={{ uri: 'https://api.dicebear.com/7.x/avataaars/png?seed=James' }}
            style={styles.profileAvatar}
          />
          <Text style={styles.profileName}>{profile ? `${profile.first_name || 'James'} ${profile.last_name || ''}` : 'James Carter'}</Text>
          <Text style={styles.profilePhone}>{profile ? profile.phone_number : '+224 555 019 8273'}</Text>
          <View style={styles.profileBadge}>
            <Text style={styles.profileBadgeText}>Volta Black Member</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.sheetBtn} onPress={onClose}>
          <Text style={styles.sheetBtnText}>Close</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    width,
    height,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.4)',
    zIndex: 1000,
    elevation: 100,
  },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
    paddingBottom: 40,
  },
  sheetBar: { width: 40, height: 4, borderRadius: 2, backgroundColor: '#E5E7EB', alignSelf: 'center', marginBottom: 24 },
  sheetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sheetTitle: { fontSize: 24, fontWeight: '800', color: C.lux900 },
  sheetClose: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center' },
  profileAvatar: { width: 96, height: 96, borderRadius: 48, backgroundColor: '#F3F4F6', marginBottom: 16 },
  profileName: { fontSize: 24, fontWeight: '800', color: C.lux900, marginBottom: 4 },
  profilePhone: { fontSize: 16, color: C.gray500, marginBottom: 16 },
  profileBadge: { backgroundColor: C.lux900, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 100 },
  profileBadgeText: { color: C.gold, fontWeight: '700', fontSize: 13, textTransform: 'uppercase', letterSpacing: 1 },
  sheetBtn: { height: 56, backgroundColor: C.lux900, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginTop: 12 },
  sheetBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
