import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, RefreshControl, DeviceEventEmitter } from 'react-native';
import { ArrowLeft, CheckCircle2, AlertCircle, Clock, Car, Briefcase, XCircle } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import api from '../services/api';

export default function VehicleProfileScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    try {
      const p = await api.getProfile();
      setProfile(p);
    } catch (e) {
      console.log('Error loading profile:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    DeviceEventEmitter.emit('CANCEL_PROFILE_PROMPT');
    loadData();
  }, []);

  const isCompany = profile?.driver_category === 'COMPANY_CAR' || profile?.vehicle_type === 'COMPANY_PROVIDED';
  const assigned = profile?.assigned_vehicle;
  
  let displayMake = 'Vehicle Make';
  let displayPlate = 'Pending';
  
  if (isCompany) {
    if (assigned) {
      displayMake = `${assigned.make} ${assigned.model} (${assigned.year})`;
      displayPlate = assigned.license_plate;
    } else {
      displayMake = 'Volta Fleet Vehicle';
      displayPlate = 'AWAITING ASSIGNMENT';
    }
  } else {
    displayMake = profile?.vehicle_make || profile?.vehicle_type || 'Personal Vehicle';
    displayPlate = profile?.license_plate || 'RC-PENDING';
  }

  const onboardingStatus = profile?.onboarding_status || 'INCOMPLETE';
  const vehicleStatus = profile?.vehicle_assignment_status || (isCompany ? 'AWAITING_ASSIGNMENT' : 'SUBMITTED');

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#D4AF37" />
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Vehicle & Documents</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView 
        style={{ flex: 1 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadData(); }} tintColor="#D4AF37" />}
      >
        {/* Onboarding & Rejection Banner */}
        {onboardingStatus === 'REJECTED' && (
          <View style={styles.rejectionCard}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <XCircle size={20} color="#EF4444" />
              <Text style={styles.rejectionTitle}>Application Rejected</Text>
            </View>
            <Text style={styles.rejectionReason}>
              Reason: {profile?.rejection_reason || 'Please re-upload clear photos of your required documents.'}
            </Text>
          </View>
        )}

        {/* Vehicle Header Card */}
        <View style={styles.vehicleCard}>
          <View style={styles.imagePlaceholder}>
            {isCompany ? <Briefcase size={36} color="#D4AF37" /> : <Car size={36} color="#D4AF37" />}
          </View>
          <Text style={styles.carMake}>{displayMake}</Text>
          <Text style={styles.carPlate}>{displayPlate}</Text>
          
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 4 }}>
            <View style={[styles.badge, { backgroundColor: isCompany ? '#374151' : '#1E293B' }]}>
              <Text style={styles.badgeText}>{isCompany ? 'Company Fleet Car' : 'Own Vehicle'}</Text>
            </View>
            <View style={[
              styles.badge, 
              { backgroundColor: onboardingStatus === 'APPROVED' ? '#05A357' : onboardingStatus === 'REJECTED' ? '#EF4444' : '#B45309' }
            ]}>
              <Text style={styles.badgeText}>
                {onboardingStatus === 'APPROVED' ? 'Verified Driver' : onboardingStatus === 'REJECTED' ? 'Rejected' : 'Under Review'}
              </Text>
            </View>
          </View>
        </View>

        {/* Fleet Assignment Details for Company Drivers */}
        {isCompany && (
          <View style={styles.fleetCard}>
            <Text style={styles.fleetCardTitle}>Company Fleet Status</Text>
            {assigned ? (
              <View>
                <View style={styles.fleetRow}>
                  <Text style={styles.fleetLabel}>Assigned Car:</Text>
                  <Text style={styles.fleetVal}>{assigned.make} {assigned.model} ({assigned.year})</Text>
                </View>
                <View style={styles.fleetRow}>
                  <Text style={styles.fleetLabel}>License Plate:</Text>
                  <Text style={styles.fleetVal}>{assigned.license_plate}</Text>
                </View>
                <View style={styles.fleetRow}>
                  <Text style={styles.fleetLabel}>Color:</Text>
                  <Text style={styles.fleetVal}>{assigned.color}</Text>
                </View>
              </View>
            ) : (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <Clock size={20} color="#D4AF37" />
                <Text style={{ color: '#E5E7EB', fontSize: 13, flex: 1 }}>
                  Your request is queued. An administrator will assign an official vehicle once review is complete.
                </Text>
              </View>
            )}
          </View>
        )}

        <Text style={styles.sectionTitle}>Document Verification</Text>
        
        <View style={styles.docList}>
          <View style={styles.docRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.docTitle}>Driver's License</Text>
              <Text style={styles.docSub}>
                {onboardingStatus === 'APPROVED' ? 'Approved & Encrypted' : 'Submitted (Encrypted)'}
              </Text>
            </View>
            <CheckCircle2 size={24} color={onboardingStatus === 'APPROVED' ? '#05A357' : '#D4AF37'} />
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.docRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.docTitle}>Vehicle Registration (Carte Grise)</Text>
              <Text style={styles.docSub}>
                {isCompany ? 'Company Fleet Provided (Not Required)' : (onboardingStatus === 'APPROVED' ? 'Approved' : 'Submitted')}
              </Text>
            </View>
            {isCompany ? (
              <CheckCircle2 size={24} color="#6B7280" />
            ) : (
              <CheckCircle2 size={24} color={onboardingStatus === 'APPROVED' ? '#05A357' : '#D4AF37'} />
            )}
          </View>
        </View>

        <View style={{ padding: 20 }}>
          <Text style={{ color: '#6B7280', fontSize: 12, textAlign: 'center', lineHeight: 18 }}>
            Note: You are eligible to receive and accept trips. Onboarding review does not block your ability to drive.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B101E' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.08)' },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#fff' },
  rejectionCard: { margin: 16, backgroundColor: 'rgba(239, 68, 68, 0.1)', borderColor: 'rgba(239, 68, 68, 0.4)', borderWidth: 1, borderRadius: 16, padding: 16 },
  rejectionTitle: { color: '#EF4444', fontWeight: '700', fontSize: 15 },
  rejectionReason: { color: '#FCA5A5', fontSize: 13, lineHeight: 18 },
  vehicleCard: { alignItems: 'center', paddingVertical: 28, backgroundColor: 'rgba(255,255,255,0.03)', borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.08)', marginBottom: 16 },
  imagePlaceholder: { width: 80, height: 80, backgroundColor: 'rgba(212, 175, 55, 0.12)', borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginBottom: 12, borderWidth: 1, borderColor: 'rgba(212, 175, 55, 0.3)' },
  carMake: { fontSize: 22, fontWeight: '800', color: '#fff', marginBottom: 4 },
  carPlate: { fontSize: 15, color: '#9CA3AF', fontWeight: '600', marginBottom: 12 },
  badge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 100 },
  badgeText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  fleetCard: { marginHorizontal: 16, marginBottom: 16, backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  fleetCardTitle: { color: '#D4AF37', fontWeight: '700', fontSize: 14, marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5 },
  fleetRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.04)' },
  fleetLabel: { color: '#9CA3AF', fontSize: 13 },
  fleetVal: { color: '#fff', fontWeight: '600', fontSize: 13 },
  sectionTitle: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12, fontSize: 13, fontWeight: '700', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 0.5 },
  docList: { backgroundColor: 'rgba(255,255,255,0.03)', borderTopWidth: 1, borderBottomWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  docRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20 },
  docTitle: { fontSize: 15, fontWeight: '600', color: '#fff', marginBottom: 4 },
  docSub: { fontSize: 13, color: '#9CA3AF' },
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.08)', marginLeft: 20 }
});
