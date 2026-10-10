import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Image, Alert, ActivityIndicator } from 'react-native';
import { BlurView } from 'expo-blur';
import { MapPin, MessageSquare, Phone, Shield, Share2, CreditCard, Banknote, Smartphone, CheckCircle } from 'lucide-react-native';
import C from '../constants/colors';
import { PayWithFlutterwave } from 'flutterwave-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useStripe } from '@stripe/stripe-react-native';
import { useNavigation } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');

export default function ActiveTripScreen({ trip, onChat, onCall, routeInfo, paymentRequest, setPaymentRequest, unreadCount = 0 }) {
  const navigation = useNavigation();
  const { initPaymentSheet, presentPaymentSheet } = useStripe();

  const [overrideMethod, setOverrideMethod] = useState(null);
  const [showMethodSelector, setShowMethodSelector] = useState(false);
  const [stripeLoading, setStripeLoading] = useState(false);
  const autoTriggeredRef = useRef(false);

  const currentMethod = (
    overrideMethod ||
    paymentRequest?.payment_method ||
    trip?.payment_method ||
    'CASH'
  ).toUpperCase();

  const currency = paymentRequest?.currency || trip?.currency || (currentMethod === 'STRIPE' ? 'USD' : 'GNF');
  const amountToPay = paymentRequest?.amount_due || paymentRequest?.amount || trip?.fare || trip?.price || (currency === 'USD' ? 3.0 : 25000);
  const formattedAmount = currency === 'USD' ? `$${Number(amountToPay).toFixed(2)}` : `${Number(amountToPay).toLocaleString()} GNF`;

  // Automatically trigger Stripe sheet if Stripe was selected at booking
  useEffect(() => {
    if (paymentRequest && !autoTriggeredRef.current) {
      if (currentMethod === 'STRIPE') {
        autoTriggeredRef.current = true;
        const timer = setTimeout(() => {
          handlePayment();
        }, 400);
        return () => clearTimeout(timer);
      }
    }
  }, [paymentRequest, currentMethod]);

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
            amount: amountToPay
          })
        });
        if (verifyRes.ok) {
          Alert.alert('Success', 'Payment successful! The trip is now complete.');
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
      setStripeLoading(true);
      const token = await AsyncStorage.getItem('userToken');
      const dollarAmount = currency === 'USD' ? Number(amountToPay) : Math.max(1, Math.ceil(Number(amountToPay) / 8500));
      const res = await fetch(`${C.API_BASE_URL}/api/v1/payments/stripe/create-intent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ amount: dollarAmount, currency: 'usd' })
      });
      const data = await res.json();
      
      if (!res.ok) {
         Alert.alert('Payment Error', data.detail || 'Could not initiate Stripe payment');
         setStripeLoading(false);
         return;
      }

      const { error } = await initPaymentSheet({
        merchantDisplayName: "Volta App",
        paymentIntentClientSecret: data.clientSecret,
        defaultBillingDetails: {
          name: 'Passenger',
        }
      });
      if (!error) {
        const { error: presentError } = await presentPaymentSheet();
        if (presentError) {
           if (presentError.code !== 'Canceled') {
             Alert.alert('Stripe Error', `Payment failed: ${presentError.message}`);
           }
        } else {
           // Verify on backend
           const verifyRes = await fetch(`${C.API_BASE_URL}/api/v1/payments/stripe/verify`, {
             method: 'POST',
             headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
             body: JSON.stringify({ 
               intent_id: data.intentId,
               trip_id: paymentRequest.trip_id,
               driver_id: paymentRequest.driver_id,
               amount: amountToPay
             })
           });
           if (verifyRes.ok) {
             Alert.alert('Success', 'Payment successful! The trip is now complete.');
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
    } finally {
      setStripeLoading(false);
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
          <Text style={styles.plateText}>{trip?.driver?.plate || 'Volta Chauffeur'}</Text>
          <Text style={styles.vehicleTypeText}>{trip?.driver?.vehicle || trip?.vehicle_type || 'Volta Ride'}</Text>
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
              <View style={{ position: 'relative' }}>
                <MessageSquare size={20} color={C.lux900} />
                {unreadCount > 0 && (
                  <View style={styles.chatBadge}>
                    <Text style={styles.chatBadgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
                  </View>
                )}
              </View>
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
            <View style={styles.paymentIconCircle}>
              <CheckCircle size={32} color="#16a34a" />
            </View>
            <Text style={styles.paymentTitle}>Trip Completed</Text>
            <Text style={styles.paymentSubtitle}>
              {currentMethod === 'STRIPE'
                ? 'Your chauffeur has arrived. Settle fare via Stripe Card.'
                : currentMethod === 'FLUTTERWAVE'
                ? 'Your chauffeur has arrived. Settle fare via Flutterwave.'
                : 'Your chauffeur has arrived. Please settle fare in cash.'}
            </Text>
            
            <View style={styles.amountBox}>
              <Text style={styles.amountValue}>{formattedAmount}</Text>
              <Text style={styles.amountSubtext}>
                {currentMethod === 'STRIPE' ? 'USD · Charged to Card' : 'GNF · Total Trip Fare'}
              </Text>
            </View>

            {/* AUTOMATIC PRIMARY PAYMENT ACTION */}
            <View style={{ width: '100%', marginBottom: 12 }}>
              {currentMethod === 'STRIPE' && (
                <TouchableOpacity 
                  style={[styles.payBtn, { backgroundColor: '#6366f1' }]} 
                  onPress={handlePayment}
                  disabled={stripeLoading}
                >
                  {stripeLoading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.payBtnText}>Pay {formattedAmount} with Card</Text>
                  )}
                </TouchableOpacity>
              )}

              {currentMethod === 'FLUTTERWAVE' && (
                <PayWithFlutterwave
                  onRedirect={handleFlutterwaveRedirect}
                  options={{
                    tx_ref: "volta_" + Date.now(),
                    authorization: "FLWPUBK_TEST-7aa0e7a287b2c3a13861d7891ee645a2-X",
                    customer: { email: 'customer@volta.com' },
                    amount: Number(amountToPay),
                    currency: 'GNF',
                    payment_options: 'card,mobilemoneygn,ussd'
                  }}
                  customButton={(props) => (
                    <TouchableOpacity 
                      style={[styles.payBtn, { backgroundColor: '#f59e0b' }]} 
                      onPress={props.onPress} 
                      disabled={props.isInitializing}
                    >
                      {props.isInitializing ? (
                        <ActivityIndicator color="#fff" />
                      ) : (
                        <Text style={styles.payBtnText}>Pay {formattedAmount} via Flutterwave</Text>
                      )}
                    </TouchableOpacity>
                  )}
                />
              )}

              {currentMethod === 'CASH' && (
                <View style={styles.cashWaitCard}>
                  <ActivityIndicator size="small" color="#05A357" style={{ marginBottom: 8 }} />
                  <Text style={styles.cashWaitTitle}>Pay Cash to Driver</Text>
                  <Text style={styles.cashWaitSub}>
                    Please hand {formattedAmount} to your chauffeur. Waiting for chauffeur confirmation...
                  </Text>
                </View>
              )}
            </View>

            {/* OPTIONAL CHANGE METHOD ACCORDION */}
            {!showMethodSelector ? (
              <TouchableOpacity onPress={() => setShowMethodSelector(true)} style={styles.switchMethodBtn}>
                <Text style={styles.switchMethodText}>Change payment method</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.selectorCard}>
                <Text style={styles.selectorTitle}>Select Payment Method:</Text>
                <TouchableOpacity 
                  style={[styles.selectorOption, currentMethod === 'STRIPE' && styles.selectorOptionActive]}
                  onPress={() => { setOverrideMethod('STRIPE'); setShowMethodSelector(false); }}
                >
                  <CreditCard size={18} color={currentMethod === 'STRIPE' ? '#6366f1' : C.gray500} />
                  <Text style={[styles.selectorOptionText, currentMethod === 'STRIPE' && styles.selectorOptionTextActive]}>
                    Stripe (USD Card)
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.selectorOption, currentMethod === 'FLUTTERWAVE' && styles.selectorOptionActive]}
                  onPress={() => { setOverrideMethod('FLUTTERWAVE'); setShowMethodSelector(false); }}
                >
                  <Smartphone size={18} color={currentMethod === 'FLUTTERWAVE' ? '#f59e0b' : C.gray500} />
                  <Text style={[styles.selectorOptionText, currentMethod === 'FLUTTERWAVE' && styles.selectorOptionTextActive]}>
                    Flutterwave (Mobile Money / GNF)
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.selectorOption, currentMethod === 'CASH' && styles.selectorOptionActive]}
                  onPress={() => { setOverrideMethod('CASH'); setShowMethodSelector(false); }}
                >
                  <Banknote size={18} color={currentMethod === 'CASH' ? '#05A357' : C.gray500} />
                  <Text style={[styles.selectorOptionText, currentMethod === 'CASH' && styles.selectorOptionTextActive]}>
                    Cash to Driver (GNF)
                  </Text>
                </TouchableOpacity>
              </View>
            )}
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

  paymentModalContainer: { position: 'absolute', top: 0, left: 0, width: width, height: height, backgroundColor: 'rgba(0,0,0,0.65)', justifyContent: 'center', alignItems: 'center', zIndex: 1000, elevation: 1000 },
  paymentModal: { width: '88%', backgroundColor: '#fff', borderRadius: 28, padding: 24, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.25, shadowRadius: 20, elevation: 10 },
  paymentIconCircle: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#dcfce7', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  paymentTitle: { fontSize: 22, fontWeight: '800', color: C.lux900, marginBottom: 4 },
  paymentSubtitle: { fontSize: 13, color: C.gray500, textAlign: 'center', marginBottom: 20, lineHeight: 18, paddingHorizontal: 8 },
  amountBox: { alignItems: 'center', marginBottom: 24, backgroundColor: '#F9FAFB', paddingHorizontal: 24, paddingVertical: 14, borderRadius: 20, borderWidth: 1, borderColor: '#F3F4F6', width: '100%' },
  amountValue: { fontSize: 34, fontWeight: '900', color: C.lux900 },
  amountSubtext: { fontSize: 12, color: C.gray500, fontWeight: '600', marginTop: 4, textTransform: 'uppercase', letterSpacing: 0.5 },
  payBtn: { width: '100%', backgroundColor: '#10B981', paddingVertical: 16, borderRadius: 18, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 8, elevation: 4 },
  payBtnText: { color: '#fff', fontSize: 17, fontWeight: '700' },

  cashWaitCard: { backgroundColor: '#F0FDF4', borderWidth: 1, borderColor: '#BBF7D0', borderRadius: 18, padding: 18, alignItems: 'center', width: '100%' },
  cashWaitTitle: { fontSize: 16, fontWeight: '700', color: '#166534', marginBottom: 4 },
  cashWaitSub: { fontSize: 13, color: '#15803D', textAlign: 'center', lineHeight: 18 },

  switchMethodBtn: { paddingVertical: 8, paddingHorizontal: 12, marginTop: 4 },
  switchMethodText: { fontSize: 13, color: C.gray500, textDecorationLine: 'underline', fontWeight: '600' },
  
  selectorCard: { width: '100%', backgroundColor: '#F9FAFB', borderRadius: 18, padding: 12, borderWidth: 1, borderColor: '#E5E7EB', marginTop: 8 },
  selectorTitle: { fontSize: 11, fontWeight: '700', color: C.gray500, textTransform: 'uppercase', marginBottom: 8, marginLeft: 4, letterSpacing: 0.5 },
  selectorOption: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 12, paddingHorizontal: 14, borderRadius: 12, marginBottom: 6 },
  selectorOptionActive: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#D1D5DB' },
  selectorOptionText: { fontSize: 14, fontWeight: '600', color: C.gray500 },
  selectorOptionTextActive: { color: C.lux900, fontWeight: '700' },

  chatBadge: { position: 'absolute', top: -6, right: -10, backgroundColor: '#EF4444', borderRadius: 9, minWidth: 18, height: 18, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4, borderWidth: 1.5, borderColor: '#fff' },
  chatBadgeText: { color: '#fff', fontSize: 10, fontWeight: '800' }
});
