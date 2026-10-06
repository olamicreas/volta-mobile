import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { ArrowLeft, MessageSquare, Phone, ChevronRight } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import C from '../constants/colors';

export default function SupportScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  
  const topics = [
    'Fare adjustments',
    'Account disabled',
    'Vehicle inspection',
    'Reporting a rider',
    'App crashing'
  ];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Driver Support</Text>
        <View style={{width: 40}} />
      </View>

      <ScrollView style={{ flex: 1 }}>
        <View style={styles.contactGroup}>
          <TouchableOpacity style={styles.contactBtn}>
            <MessageSquare size={24} color="#fff" />
            <Text style={styles.contactLabel}>Chat with Support</Text>
          </TouchableOpacity>
          <View style={{ width: 1, backgroundColor: 'rgba(255,255,255,0.1)' }} />
          <TouchableOpacity style={styles.contactBtn}>
            <Phone size={24} color="#fff" />
            <Text style={styles.contactLabel}>Call Priority Line</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Help Topics</Text>
        <View style={styles.topicList}>
          {topics.map((t, i) => (
            <TouchableOpacity key={i} style={styles.topicRow}>
              <Text style={styles.topicText}>{t}</Text>
              <ChevronRight size={20} color={C.gray400} />
            </TouchableOpacity>
          ))}
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
  contactGroup: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.05)', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.1)', marginBottom: 24 },
  contactBtn: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 },
  contactLabel: { fontSize: 14, fontWeight: '700', color: '#fff' },
  sectionTitle: { paddingHorizontal: 20, paddingBottom: 12, fontSize: 16, fontWeight: '800', color: '#fff' },
  topicList: { backgroundColor: 'rgba(255,255,255,0.02)', borderTopWidth: 1, borderBottomWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  topicRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
  topicText: { fontSize: 16, color: '#fff', fontWeight: '500' }
});
