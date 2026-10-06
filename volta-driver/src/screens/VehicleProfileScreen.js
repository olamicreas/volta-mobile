import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image } from 'react-native';
import { ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import C from '../constants/colors';

export default function VehicleProfileScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  
  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Vehicle & Documents</Text>
        <View style={{width: 40}} />
      </View>

      <ScrollView style={{ flex: 1 }}>
        <View style={styles.vehicleCard}>
          <View style={styles.imagePlaceholder}>
            <Text style={{color: '#fff', fontSize: 40}}>🚗</Text>
          </View>
          <Text style={styles.carMake}>Toyota Prius 2018</Text>
          <Text style={styles.carPlate}>RC-1234-A</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>Volta Economy & Premium</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Required Documents</Text>
        
        <View style={styles.docList}>
          <TouchableOpacity style={styles.docRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.docTitle}>Driver's License</Text>
              <Text style={styles.docSub}>Expires: Sep 2028</Text>
            </View>
            <CheckCircle2 size={24} color="#05A357" />
          </TouchableOpacity>
          <View style={styles.divider} />
          
          <TouchableOpacity style={styles.docRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.docTitle}>Vehicle Registration (Carte Grise)</Text>
              <Text style={styles.docSub}>Expires: Jan 2027</Text>
            </View>
            <CheckCircle2 size={24} color="#05A357" />
          </TouchableOpacity>
          <View style={styles.divider} />
          
          <TouchableOpacity style={styles.docRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.docTitle}>Vehicle Insurance</Text>
              <Text style={[styles.docSub, { color: '#EF4444' }]}>Expires in 14 days</Text>
            </View>
            <AlertCircle size={24} color="#EF4444" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.1)' },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#fff' },
  vehicleCard: { alignItems: 'center', paddingVertical: 32, backgroundColor: 'rgba(255,255,255,0.02)', borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.1)', marginBottom: 16 },
  imagePlaceholder: { width: 120, height: 80, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  carMake: { fontSize: 24, fontWeight: '800', color: '#fff', marginBottom: 4 },
  carPlate: { fontSize: 16, color: '#A1A1AA', fontWeight: '600', marginBottom: 12 },
  badge: { backgroundColor: '#05A357', paddingHorizontal: 16, paddingVertical: 6, borderRadius: 100 },
  badgeText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  sectionTitle: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12, fontSize: 13, fontWeight: '700', color: '#A1A1AA', textTransform: 'uppercase' },
  docList: { backgroundColor: 'rgba(255,255,255,0.05)', borderTopWidth: 1, borderBottomWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  docRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20 },
  docTitle: { fontSize: 16, fontWeight: '600', color: '#fff', marginBottom: 4 },
  docSub: { fontSize: 13, color: '#A1A1AA' },
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.1)', marginLeft: 20 }
});
