import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Image, Alert } from 'react-native';
import { BlurView } from 'expo-blur';
import { MapPin, MessageSquare, Phone, Shield, Share2, ShieldAlert, XCircle } from 'lucide-react-native';
import C from '../constants/colors';
import { PayWithFlutterwave } from 'flutterwave-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useStripe } from '@stripe/stripe-react-native';




const { width, height } = Dimensions.get('window');

import { useNavigation } from '@react-navigation/native';

export default function ActiveTripScreen({ trip, onChat, onCall, routeInfo, paymentRequest, setPaymentRequest }) {
  const navigation = useNavigation();
  const { initPaymentSheet, presentPaymentSheet } = useStripe();


  const handleFlutterwaveRedirect = async (data) => {
    if (data.status === 'successful') {
      try {
        const token = await AsyncStorage.getItem('userToken');
        const verifyRes = await fetch(`${C.API_BASE_URL}/api/v1/payments/flutterwave/verify`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ 
            transaction_id: data.transaction_id.toString(),
            trip_id: paymentRequest.trip_id,
            driver_id: paymentRequest.driver_id,
            amount: paymentRequest.amount
          })
        });
        if (verifyRes.ok) {
          Alert.alert('Success', 'Payment successful! The driver can now complete the trip.');
          setPaymentRequest(null);
        } else {
          Alert.alert('Verification Failed', 'Could not verify Flutterwave payment with the server.');
        }
      } catch(e) {
        Alert.alert('Error', 'An unexpected error occurred verifying the payment.');
      }
    } else {
      Alert.alert('Payment Cancelled', 'Payment was not successful.');
    }
  };

    const handlePayment = async () => {
      // Stripe flow for USD
      try {
        const token = await AsyncStorage.getItem('userToken');
        const res = await fetch(`${C.API_BASE_URL}/api/v1/payments/stripe/create-intent`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ amount: Math.ceil((paymentRequest.amount || 25000) / 9000) }) // Convert GNF to approx USD dollars
        });
        const data = await res.json();
        
        if (!res.ok) {
           Alert.alert('Payment Error', data.detail || 'Could not initiate Stripe payment');
           return;
        }

        const { error } = await initPaymentSheet({
          merchantDisplayName: "Volta App",
          paymentIntentClientSecret: data.clientSecret,
          defaultBillingDetails: {
            name: 'Customer',
          }
        });
        if (!error) {
          const { error: presentError } = await presentPaymentSheet();
          if (presentError) {
             Alert.alert('Stripe Error', `Payment failed: ${presentError.message}`);
          } else {
             // Verify on backend
             const verifyRes = await fetch(`${C.API_BASE_URL}/api/v1/payments/stripe/verify`, {
               method: 'POST',
               headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
               body: JSON.stringify({ 
                 intent_id: data.intentId,
                 trip_id: paymentRequest.trip_id,
                 driver_id: paymentRequest.driver_id,
                 amount: paymentRequest.amount
               })
             });
             if (verifyRes.ok) {
               Alert.alert('Success', 'Payment successful! The driver can now complete the trip.');
               setPaymentRequest(null);
             } else {
               Alert.alert('Verification Failed', 'Could not verify payment with the server.');
             }
          }
        } else {
          Alert.alert('Stripe Error', `Initialization failed: ${error.message}`);
        }
      } catch (e) {
        console.error(e);
        Alert.alert('Error', 'An unexpected error occurred during payment.');
      }
    }
  };

  const status = trip?.status || 'ACCEPTED';

  const headerLabel = status === 'ARRIVED' ? 'Driver is here' : status === 'IN_PROGRESS' ? 'Heading to' : 'Arriving In';
  const headerTime = status === 'ARRIVED' ? 'Now' : status === 'IN_PROGRESS' ? 'Destination' : (routeInfo?.duration ? routeInfo.duration : '-- Min');

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
          <Text style={styles.plateText}>{trip?.driver?.plate || 'LXY-992'}</Text>
          <Text style={styles.vehicleTypeText}>{trip?.driver?.vehicle || 'Black S-Class'}</Text>
        </View>
      </BlurView>

      {/* Driver Info Bottom Panel */}
      <BlurView intensity={90} tint="light" style={styles.driverPanel}>
        <View style={styles.driverTop}>
          <View style={styles.driverLeft}>
            {/* Avatar with gold border + rating badge */}
            <View style={styles.avatarWrap}>
              {trip?.driver?.photo ? (
                <Image source={{ uri: trip.driver.photo }} style={styles.avatar} />
              ) : (
                <View style={styles.avatar} />
              )}
              <View style={styles.ratingBadge}>
                <Text style={styles.ratingText}>5.0 ★</Text>
              </View>
            </View>
            <View>
              <Text style={styles.driverName}>{trip?.driver?.name || 'Driver'}</Text>
              <Text style={styles.driverTitle}>{trip?.driver?.vehicle || 'Professional Chauffeur'}</Text>
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

      {/* PAYMENT REQUIRED MODAL */}
      {paymentRequest && (
        <View style={styles.paymentModalContainer}>
          <View style={styles.paymentModal}>
            <Text style={styles.paymentTitle}>Payment Required</Text>
            <Text style={styles.paymentSubtitle}>Your driver has arrived at the destination. Please settle the remaining balance to complete the trip.</Text>
            
            <View style={styles.amountBox}>
              <Text style={styles.amountCurrency}>{paymentRequest.currency || 'GNF'}</Text>
              <Text style={styles.amountValue}>{(paymentRequest.amount_due || 0).toLocaleString()}</Text>
            </View>

            
            {/* Let the user choose their payment method for testing purposes */}
            <View style={{ flexDirection: 'column', gap: 10, width: '100%' }}>
              <TouchableOpacity style={[styles.payBtn, { backgroundColor: '#6366f1' }]} onPress={handlePayment}>
                <Text style={styles.payBtnText}>Pay with Stripe (Test Card)</Text>
              </TouchableOpacity>
              
              <PayWithFlutterwave
                onRedirect={handleFlutterwaveRedirect}
                options={{
                  tx_ref: "volta_" + Date.now(),
                  authorization: "FLWPUBK_TEST-7aa0e7a287b2c3a13861d7891ee645a2-X",
                  customer: { email: 'customer@volta.com' },
                  amount: paymentRequest?.amount || 25000,
                  currency: 'GNF',
                  payment_options: 'card,mobilemoneygn,ussd'
                }}
                customButton={(props) => (
                  <TouchableOpacity style={[styles.payBtn, { backgroundColor: '#f59e0b' }]} onPress={props.onPress} disabled={props.isInitializing}>
                    <Text style={styles.payBtnText}>Pay with Flutterwave</Text>
                  </TouchableOpacity>
                )}
              />
            </View>
          </View>
        </View>
      )}
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

  paymentModalContainer: { position: 'absolute', top: 0, left: 0, width: width, height: height, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', zIndex: 1000, elevation: 1000 },
  paymentModal: { width: '85%', backgroundColor: '#fff', borderRadius: 24, padding: 24, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.25, shadowRadius: 20, elevation: 10 },
  paymentTitle: { fontSize: 22, fontWeight: '800', color: C.lux900, marginBottom: 8 },
  paymentSubtitle: { fontSize: 14, color: C.gray500, textAlign: 'center', marginBottom: 24, lineHeight: 20 },
  amountBox: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 32, backgroundColor: '#F9FAFB', paddingHorizontal: 24, paddingVertical: 16, borderRadius: 16, borderWidth: 1, borderColor: '#F3F4F6' },
  amountCurrency: { fontSize: 18, fontWeight: '700', color: C.lux900, marginTop: 4, marginRight: 4 },
  amountValue: { fontSize: 40, fontWeight: '900', color: C.lux900 },
  payBtn: { width: '100%', backgroundColor: '#10B981', paddingVertical: 16, borderRadius: 16, alignItems: 'center' },
  payBtnText: { color: '#fff', fontSize: 18, fontWeight: '700' }
});
