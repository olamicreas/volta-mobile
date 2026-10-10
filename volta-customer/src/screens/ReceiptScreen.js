import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { CheckCircle2, ChevronRight } from 'lucide-react-native';
import C from '../constants/colors';



const { width, height } = Dimensions.get('window');

export default function ReceiptScreen({ trip, onDone }) {
  const price = trip?.price || 85000;
  const taxes = 12500;
  const total = price + taxes;

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.goldStripe} />
        
        <View style={styles.content}>
          <View style={styles.iconCircle}>
            <CheckCircle2 size={32} color="#16a34a" />
          </View>
          
          <Text style={styles.title}>Ride Complete</Text>
          <Text style={styles.sub}>Payment processed securely.</Text>

          <View style={styles.breakdown}>
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Volta Black</Text>
              <Text style={styles.rowValue}>{price.toLocaleString()} GNF</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Taxes & Fees</Text>
              <Text style={styles.rowValue}>{taxes.toLocaleString()} GNF</Text>
            </View>
            
            <View style={styles.divider} />
            
            <View style={styles.row}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>{total.toLocaleString()} GNF</Text>
            </View>
          </View>

          <View style={styles.paymentBadge}>
            <View style={styles.cinetBox}><Text style={styles.cinetText}>{trip?.currency === 'GNF' ? 'FLUTTERWAVE' : 'STRIPE'}</Text></View>
            <Text style={styles.paidText}>Paid via {trip?.currency === 'GNF' ? 'Flutterwave' : 'Stripe'}</Text>
            <ChevronRight size={16} color={C.gray400} />
          </View>

          <TouchableOpacity style={styles.btnDone} onPress={onDone} activeOpacity={0.9}>
            <Text style={styles.btnText}>Done</Text>
          </TouchableOpacity>
        </View>
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
    backgroundColor: C.lux900,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    zIndex: 999,
    elevation: 99,
  },
  card: { width: '100%', backgroundColor: '#fff', borderRadius: 40, overflow: 'hidden' },
  goldStripe: { height: 8, backgroundColor: C.gold, width: '100%' },
  content: { padding: 32, alignItems: 'center' },
  iconCircle: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#dcfce7', alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  title: { fontSize: 28, fontWeight: '800', color: C.lux900, marginBottom: 8 },
  sub: { fontSize: 15, color: C.gray500, fontWeight: '500', marginBottom: 32 },
  
  breakdown: { width: '100%', borderWidth: 1, borderColor: C.gray200, borderRadius: 24, padding: 24, borderStyle: 'dashed', marginBottom: 24 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  rowLabel: { fontSize: 15, color: C.gray500, fontWeight: '600' },
  rowValue: { fontSize: 15, color: C.lux900, fontWeight: '700' },
  divider: { height: 1, backgroundColor: C.gray200, marginVertical: 12, borderStyle: 'dashed' },
  totalLabel: { fontSize: 18, color: C.lux900, fontWeight: '800' },
  totalValue: { fontSize: 24, color: C.gold, fontWeight: '800' },

  paymentBadge: { width: '100%', flexDirection: 'row', alignItems: 'center', backgroundColor: C.gray50, padding: 16, borderRadius: 16, marginBottom: 32 },
  cinetBox: { backgroundColor: '#10B981', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, marginRight: 12 },
  cinetText: { color: '#fff', fontSize: 9, fontWeight: '800', letterSpacing: 0.5 },
  paidText: { flex: 1, fontSize: 14, fontWeight: '600', color: C.lux900 },

  btnDone: { width: '100%', backgroundColor: C.lux900, paddingVertical: 18, borderRadius: 20, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 10, elevation: 5 },
  btnText: { color: '#fff', fontSize: 18, fontWeight: '700' },
});
