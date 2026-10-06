import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { ArrowLeft, MessageSquare, Phone, HelpCircle, ChevronRight } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import C from '../constants/colors';

export default function SupportScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  
  const topics = [
    'I was involved in an accident',
    'Review my fare or fees',
    'I lost an item',
    'Report a safety issue',
    'My driver was unprofessional'
  ];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft size={24} color={C.lux900} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Help & Support</Text>
        <View style={{width: 40}} />
      </View>

      <ScrollView style={{ flex: 1, backgroundColor: '#F9FAFB' }}>
        <View style={styles.contactGroup}>
          <TouchableOpacity style={styles.contactBtn}>
            <MessageSquare size={24} color={C.lux900} />
            <Text style={styles.contactLabel}>Live Chat</Text>
          </TouchableOpacity>
          <View style={{ width: 1, backgroundColor: '#F3F4F6' }} />
          <TouchableOpacity style={styles.contactBtn}>
            <Phone size={24} color={C.lux900} />
            <Text style={styles.contactLabel}>Call Us</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Common Issues</Text>
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
  container: { flex: 1, backgroundColor: '#fff' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: C.lux900 },
  contactGroup: { flexDirection: 'row', backgroundColor: '#fff', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#F3F4F6', marginBottom: 24 },
  contactBtn: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 },
  contactLabel: { fontSize: 14, fontWeight: '700', color: C.lux900 },
  sectionTitle: { paddingHorizontal: 20, paddingBottom: 12, fontSize: 16, fontWeight: '800', color: C.lux900 },
  topicList: { backgroundColor: '#fff', borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#F3F4F6' },
  topicRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  topicText: { fontSize: 16, color: C.lux900, fontWeight: '500' }
});
