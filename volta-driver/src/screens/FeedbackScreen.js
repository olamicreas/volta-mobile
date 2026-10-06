import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { ArrowLeft, Star, ThumbsUp, MessageCircle } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import C from '../constants/colors';

export default function FeedbackScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  
  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Rider Feedback</Text>
        <View style={{width: 40}} />
      </View>

      <ScrollView style={{ flex: 1 }}>
        <View style={styles.ratingOverview}>
          <Text style={styles.hugeRating}>4.98</Text>
          <View style={styles.stars}>
            {[1,2,3,4,5].map(i => <Star key={i} size={20} color="#FACC15" fill="#FACC15" />)}
          </View>
          <Text style={styles.totalRatings}>Based on 3,429 lifetime trips</Text>
        </View>

        <Text style={styles.sectionTitle}>Top Compliments</Text>
        <View style={styles.complimentsGrid}>
          <View style={styles.complimentBadge}>
            <ThumbsUp size={20} color="#05A357" />
            <Text style={styles.complimentCount}>142</Text>
            <Text style={styles.complimentLabel}>Excellent Service</Text>
          </View>
          <View style={styles.complimentBadge}>
            <Star size={20} color="#FACC15" />
            <Text style={styles.complimentCount}>89</Text>
            <Text style={styles.complimentLabel}>Clean Car</Text>
          </View>
          <View style={styles.complimentBadge}>
            <MessageCircle size={20} color="#3B82F6" />
            <Text style={styles.complimentCount}>56</Text>
            <Text style={styles.complimentLabel}>Great Conversation</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Recent Comments</Text>
        <View style={styles.commentsList}>
          <View style={styles.commentCard}>
            <View style={styles.commentHeader}>
              <View style={styles.stars}><Star size={12} color="#FACC15" fill="#FACC15" /><Star size={12} color="#FACC15" fill="#FACC15" /><Star size={12} color="#FACC15" fill="#FACC15" /><Star size={12} color="#FACC15" fill="#FACC15" /><Star size={12} color="#FACC15" fill="#FACC15" /></View>
              <Text style={styles.commentDate}>Sep 21, 2026</Text>
            </View>
            <Text style={styles.commentText}>"Sarah was incredibly polite and the car smelled amazing. Safest driver I've had in Conakry!"</Text>
          </View>
          
          <View style={styles.commentCard}>
            <View style={styles.commentHeader}>
              <View style={styles.stars}><Star size={12} color="#FACC15" fill="#FACC15" /><Star size={12} color="#FACC15" fill="#FACC15" /><Star size={12} color="#FACC15" fill="#FACC15" /><Star size={12} color="#FACC15" fill="#FACC15" /><Star size={12} color="#FACC15" fill="#FACC15" /></View>
              <Text style={styles.commentDate}>Sep 19, 2026</Text>
            </View>
            <Text style={styles.commentText}>"Very smooth ride, navigated through the traffic brilliantly."</Text>
          </View>
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
  ratingOverview: { alignItems: 'center', paddingVertical: 40, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.1)' },
  hugeRating: { fontSize: 64, fontWeight: '900', color: '#fff', marginBottom: 8 },
  stars: { flexDirection: 'row', gap: 4, marginBottom: 8 },
  totalRatings: { fontSize: 14, color: '#A1A1AA' },
  sectionTitle: { paddingHorizontal: 20, paddingTop: 24, paddingBottom: 16, fontSize: 13, fontWeight: '700', color: '#A1A1AA', textTransform: 'uppercase' },
  complimentsGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, gap: 12 },
  complimentBadge: { flex: 1, minWidth: '45%', backgroundColor: 'rgba(255,255,255,0.05)', padding: 16, borderRadius: 16, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  complimentCount: { fontSize: 24, fontWeight: '800', color: '#fff', marginTop: 8, marginBottom: 4 },
  complimentLabel: { fontSize: 12, color: '#A1A1AA', fontWeight: '600', textAlign: 'center' },
  commentsList: { paddingHorizontal: 16, paddingBottom: 40 },
  commentCard: { backgroundColor: 'rgba(255,255,255,0.05)', padding: 20, borderRadius: 16, marginBottom: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  commentHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  commentDate: { fontSize: 12, color: '#A1A1AA' },
  commentText: { fontSize: 15, color: '#fff', lineHeight: 22, fontStyle: 'italic' }
});
