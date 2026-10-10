import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { CheckCircle2, MapPin, User, CreditCard } from 'lucide-react-native';
import C from '../constants/colors';

const { width } = Dimensions.get('window');

export default function ReceiptScreen({ trip, onDone }) {
  const fare = trip?.fare || trip?.price || 0;
  const currency = trip?.currency || 'GNF';
  const vehicle = trip?.vehicle_type || trip?.vehicleType || 'Volta Ride';
  const pickup = trip?.pickup_name || trip?.pickup?.name || 'Pickup Location';
  const dest = trip?.dest_name || trip?.destination?.name || 'Destination';
  const driverName = trip?.driver_name || trip?.driver?.name || 'Chauffeur';

  const method = (trip?.payment_method || 'CASH').toUpperCase();
  const methodLabel = method === 'STRIPE' ? 'Stripe Card' : method === 'FLUTTERWAVE' ? 'Flutterwave' : 'Cash';
  const methodColor = method === 'STRIPE' ? '#6366f1' : method === 'FLUTTERWAVE' ? '#f59e0b' : '#05A357';

  const formattedAmount = currency === 'USD' ? `$${Number(fare).toFixed(2)}` : `${Number(fare).toLocaleString()} GNF`;

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.goldStripe} />
        
        <View style={styles.content}>
          <View style={styles.iconCircle}>
            <CheckCircle2 size={32} color="#16a34a" />
          </View>
          
          <Text style={styles.title}>Ride Complete</Text>
          <Text style={styles.sub}>Payment settled securely</Text>

          {/* Real Ride Breakdown */}
          <View style={styles.breakdown}>
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Vehicle</Text>
              <Text style={styles.rowValue}>{vehicle}</Text>
            </View>

            <View style={styles.row}>
              <Text style={styles.rowLabel}>Chauffeur</Text>
              <Text style={styles.rowValue}>{driverName}</Text>
            </View>

            <View style={styles.routeRow}>
              <View style={styles.routeIconBox}>
                <MapPin size={14} color={C.gold} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.routeText} numberOfLines={1}>{pickup}</Text>
                <Text style={styles.routeDestText} numberOfLines={1}>→ {dest}</Text>
              </View>
            </View>
            
            <View style={styles.divider} />
            
            <View style={styles.row}>
              <Text style={styles.totalLabel}>Total Fare</Text>
              <Text style={styles.totalValue}>{formattedAmount}</Text>
            </View>
          </View>

          {/* Payment Method Badge */}
          <View style={styles.paymentBadge}>
            <View style={[styles.methodBox, { backgroundColor: methodColor }]}>
              <Text style={styles.methodBoxText}>{method}</Text>
            </View>
            <Text style={styles.paidText}>Paid via {methodLabel}</Text>
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
    height: '100%',
    backgroundColor: C.lux900,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    zIndex: 999,
    elevation: 99,
  },
  card: { width: '100%', backgroundColor: '#fff', borderRadius: 36, overflow: 'hidden' },
  goldStripe: { height: 8, backgroundColor: C.gold, width: '100%' },
  content: { padding: 28, alignItems: 'center' },
  iconCircle: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#dcfce7', alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  title: { fontSize: 26, fontWeight: '800', color: C.lux900, marginBottom: 6 },
  sub: { fontSize: 14, color: C.gray500, fontWeight: '500', marginBottom: 24 },
  
  breakdown: { width: '100%', borderWidth: 1, borderColor: C.gray200, borderRadius: 20, padding: 20, marginBottom: 20 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  rowLabel: { fontSize: 14, color: C.gray500, fontWeight: '600' },
  rowValue: { fontSize: 15, color: C.lux900, fontWeight: '700' },

  routeRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8, borderTopWidth: 1, borderTopColor: C.gray100, borderBottomWidth: 1, borderBottomColor: C.gray100, marginBottom: 12 },
  routeIconBox: { width: 28, height: 28, borderRadius: 14, backgroundColor: 'rgba(212,175,55,0.15)', alignItems: 'center', justifyContent: 'center' },
  routeText: { fontSize: 13, color: C.gray500, fontWeight: '500' },
  routeDestText: { fontSize: 13, color: C.lux900, fontWeight: '700', marginTop: 2 },

  divider: { height: 1, backgroundColor: C.gray200, marginVertical: 8 },
  totalLabel: { fontSize: 16, color: C.lux900, fontWeight: '800' },
  totalValue: { fontSize: 24, color: C.gold, fontWeight: '900' },

  paymentBadge: { width: '100%', flexDirection: 'row', alignItems: 'center', backgroundColor: C.gray50, padding: 14, borderRadius: 16, marginBottom: 24 },
  methodBox: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, marginRight: 12 },
  methodBoxText: { color: '#fff', fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
  paidText: { flex: 1, fontSize: 14, fontWeight: '600', color: C.lux900 },

  btnDone: { width: '100%', backgroundColor: C.lux900, paddingVertical: 16, borderRadius: 18, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 10, elevation: 5 },
  btnText: { color: '#fff', fontSize: 17, fontWeight: '700' },
});
