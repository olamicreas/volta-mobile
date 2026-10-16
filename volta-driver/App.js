import React, { useState, useEffect, useRef } from 'react';
import {
  View, StyleSheet, Platform, TouchableOpacity, Text,
  Dimensions, Image, StatusBar, Alert, ActivityIndicator, DeviceEventEmitter, Linking
} from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { Star, Inbox, Settings, Wallet, X } from 'lucide-react-native';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';

import C from './src/constants/colors';
import mapStyle from './src/constants/mapStyle';
import socket from './src/services/socket';
import api from './src/services/api';
import { fetchRoute } from './src/services/routing';
import { sendLocalPush, requestPushPermissions } from './src/services/notifications';

import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import CancellationScreen from './src/screens/CancellationScreen';
import WalletScreen from './src/screens/WalletScreen';
import FeedbackScreen from './src/screens/FeedbackScreen';
import VehicleProfileScreen from './src/screens/VehicleProfileScreen';
import AccountScreen from './src/screens/AccountScreen';
import SupportScreen from './src/screens/SupportScreen';
import AuthScreen from './src/screens/AuthScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import RequestScreen from './src/screens/RequestScreen';
import ActiveTripScreen from './src/screens/ActiveTripScreen';
import ChatScreen from './src/screens/ChatScreen';
import EarningsScreen from './src/screens/EarningsScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import SafetyScreen from './src/screens/SafetyScreen';
import PreferencesScreen from './src/screens/PreferencesScreen';
import PromoScreen from './src/screens/PromoScreen';

const { width, height } = Dimensions.get('window');
const START_LAT = 9.5350;
const START_LNG = -13.6773;


const Stack = createStackNavigator();

let hasPromptedProfileGlobal = false;
let profileAlertTimerGlobal = null;
let isProfileAlertShowingGlobal = false;

function MainApp({ navigation }) {

  const [view, setView] = useState('AUTH');
  const [profile, setProfile] = useState(null);
  const [wallet, setWallet] = useState(null);
  const [chatReturnView, setChatReturnView] = useState('EN_ROUTE_PICKUP');
  const [chatMessages, setChatMessages] = useState([]);
  const [unreadChatCount, setUnreadChatCount] = useState(0);
  const [location, setLocation] = useState({ latitude: START_LAT, longitude: START_LNG });
  const [tripState, setTripState] = useState(null);

  const [routeCoords, setRouteCoords] = useState([]);
  const [routeInfo, setRouteInfo] = useState(null);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [modal, setModal] = useState(null);
  
  const [isInitializing, setIsInitializing] = useState(true);

  const promptProfileCompletion = (p) => {
    if (hasPromptedProfileGlobal || isProfileAlertShowingGlobal) return;
    hasPromptedProfileGlobal = true;

    if (profileAlertTimerGlobal) {
      clearTimeout(profileAlertTimerGlobal);
      profileAlertTimerGlobal = null;
    }

    if (!p || !p.first_name || !p.first_name.trim()) {
      profileAlertTimerGlobal = setTimeout(() => {
        profileAlertTimerGlobal = null;
        if (isProfileAlertShowingGlobal) return;
        isProfileAlertShowingGlobal = true;

        Alert.alert(
          "Complete Driver Profile",
          "Welcome to Volta Driver! Your profile details are incomplete. Please complete your profile to finish setting up your account.",
          [
            {
              text: "Complete Profile",
              onPress: () => {
                isProfileAlertShowingGlobal = false;
                if (profileAlertTimerGlobal) {
                  clearTimeout(profileAlertTimerGlobal);
                  profileAlertTimerGlobal = null;
                }
                navigation.navigate('ProfileDetail');
              }
            },
            {
              text: "Later",
              style: "cancel",
              onPress: () => {
                isProfileAlertShowingGlobal = false;
                if (profileAlertTimerGlobal) {
                  clearTimeout(profileAlertTimerGlobal);
                  profileAlertTimerGlobal = null;
                }
              }
            }
          ],
          {
            cancelable: true,
            onDismiss: () => {
              isProfileAlertShowingGlobal = false;
            }
          }
        );
      }, 700);
    } else if (!p.vehicle_type && p.driver_category !== 'COMPANY_CAR') {
      profileAlertTimerGlobal = setTimeout(() => {
        profileAlertTimerGlobal = null;
        if (isProfileAlertShowingGlobal) return;
        isProfileAlertShowingGlobal = true;

        Alert.alert(
          "Complete Vehicle Setup",
          "Your vehicle details are incomplete. Please complete your vehicle profile and document uploads.",
          [
            {
              text: "Setup Vehicle",
              onPress: () => {
                isProfileAlertShowingGlobal = false;
                if (profileAlertTimerGlobal) {
                  clearTimeout(profileAlertTimerGlobal);
                  profileAlertTimerGlobal = null;
                }
                navigation.navigate('VehicleProfile');
              }
            },
            {
              text: "Later",
              style: "cancel",
              onPress: () => {
                isProfileAlertShowingGlobal = false;
                if (profileAlertTimerGlobal) {
                  clearTimeout(profileAlertTimerGlobal);
                  profileAlertTimerGlobal = null;
                }
              }
            }
          ],
          {
            cancelable: true,
            onDismiss: () => {
              isProfileAlertShowingGlobal = false;
            }
          }
        );
      }, 700);
    }
  };

  useEffect(() => {
    const cancelSub = DeviceEventEmitter.addListener('CANCEL_PROFILE_PROMPT', () => {
      if (profileAlertTimerGlobal) {
        clearTimeout(profileAlertTimerGlobal);
        profileAlertTimerGlobal = null;
      }
      hasPromptedProfileGlobal = true;
      isProfileAlertShowingGlobal = false;
    });
    return () => { if (cancelSub && cancelSub.remove) cancelSub.remove(); };
  }, []);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        if (token) {
          const p = await api.getProfile();
          setProfile(p);
          socket.connect();
          
          // Request and send push token to backend
          const pushToken = await requestPushPermissions();
          if (pushToken) {
            await api.updateProfile({ push_token: pushToken });
          }

          // Restore active trip if one exists
          try {
            const activeRes = await api.getActiveTrip();
            if (activeRes && activeRes.active && activeRes.trip) {
              console.log('[Driver] Restored active trip:', activeRes.trip.id, activeRes.trip.status);
              setTripState(activeRes.trip);
              if (activeRes.trip.status === 'ACCEPTED') {
                setView('EN_ROUTE_PICKUP');
              } else if (activeRes.trip.status === 'IN_PROGRESS') {
                setView('EN_ROUTE_DROPOFF');
              } else {
                setView('OFFLINE');
              }
            } else {
              setView('OFFLINE');
            }
          } catch (e) {
            setView('OFFLINE');
          }

          // Alert if driver missed profile completion or vehicle onboarding (guarded & debounced)
          promptProfileCompletion(p);
        }
      } catch(e) {
        console.log('Auto-login failed:', e);
      } finally {
        setIsInitializing(false);
      }
    };
    initAuth();
    return () => {
      if (profileAlertTimerGlobal) {
        clearTimeout(profileAlertTimerGlobal);
        profileAlertTimerGlobal = null;
      }
    };
  }, []);
  
  useEffect(() => {
    const sub = Notifications.addNotificationResponseReceivedListener(response => {
      const data = response.notification.request.content.data;
      if (data && data.trip) {
        console.log('Opened via Push Notification!', data.trip);
        setTripState(data.trip);
        setView('REQUEST');
      }
    });
    return () => sub.remove();
  }, []);

  const mapRef = useRef(null);
  const viewRef = useRef(view);
  useEffect(() => { viewRef.current = view; }, [view]);
  const locationRef = useRef(location);
  useEffect(() => { locationRef.current = location; }, [location]);
  const locSub = useRef(null);

  // ── Location tracking ───────────────────────────────
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;

      locSub.current = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.High, timeInterval: 4000, distanceInterval: 8 },
        (loc) => {
          const coords = { latitude: loc.coords.latitude, longitude: loc.coords.longitude };
          setLocation(coords);
          socket.emit('update_location', { lat: coords.latitude, lng: coords.longitude });
          // Auto-pan on offline/online
          if ((viewRef.current === 'OFFLINE' || viewRef.current === 'ONLINE') && mapRef.current) {
            mapRef.current.animateToRegion({ ...coords, latitudeDelta: 0.04, longitudeDelta: 0.04 });
          }
        }
      );
      
      // Explicit interval to guarantee Redis always gets the location every 5 seconds
      locSub.interval = setInterval(() => {
        if (socket && viewRef.current !== 'OFFLINE' && locationRef.current?.latitude) {
          socket.emit('update_location', { lat: locationRef.current.latitude, lng: locationRef.current.longitude });
        }
      }, 5000);
      
    })();
    return () => { 
      if (locSub.current) locSub.current.remove(); 
      if (locSub.interval) clearInterval(locSub.interval);
    };
  }, []);

  // ── Socket ──────────────────────────────────────────
  useEffect(() => {
    socket.on('trip_requested', (trip) => {
      console.log('GOT TRIP REQUEST!', trip.id, 'CURRENT VIEW:', viewRef.current);
      sendLocalPush('New Trip Request!', `Pick up at ${trip.pickup.name}`);
      if (viewRef.current === 'ONLINE') {
        setTripState(trip);
        setView('REQUEST');
        if (mapRef.current) {
          mapRef.current.fitToCoordinates(
            [{ latitude: trip.pickup.lat, longitude: trip.pickup.lng }],
            { edgePadding: { top: 100, right: 60, bottom: 500, left: 60 }, animated: true }
          );
        }
      }
    });

    socket.on('trip_cleared', () => {
      if (viewRef.current !== 'ONLINE' && viewRef.current !== 'REQUEST') {
         sendLocalPush('Trip Cancelled', 'The customer has cancelled the trip.');
      }
      setTripState(null);
      setChatMessages([]);
      setUnreadChatCount(0);
      setView(v => v !== 'AUTH' ? 'OFFLINE' : v);
    });

    socket.on('trip_completed_success', (data) => {
      setTripState(null);
      setChatMessages([]);
      setUnreadChatCount(0);
      setView('OFFLINE');
      api.getWallet().then(w => setWallet(w)).catch(() => {});
      navigation.navigate('Earnings', data || {});
    });

    socket.on('awaiting_payment', (data) => {
      console.log('[Driver] awaiting_payment received:', data);
      if (data) {
        setTripState(prev => ({ ...prev, ...data }));
      }
      setView('AWAITING_PAYMENT');
    });

    socket.on('trip_restored', (trip) => {
      console.log('[Driver] Trip restored via socket:', trip.id, trip.status);
      setTripState(trip);
      if (trip.status === 'ACCEPTED') {
        setView('EN_ROUTE_PICKUP');
      } else if (trip.status === 'IN_PROGRESS') {
        setView('EN_ROUTE_DROPOFF');
      }
      api.getTripMessages(trip.id || trip.trip_id).then(msgs => {
        if (Array.isArray(msgs) && msgs.length > 0) {
          setChatMessages(msgs);
        }
      }).catch(() => {});
    });

    socket.on('new_message', (msg) => {
      console.log('[Driver] new_message received:', msg);
      setChatMessages(prev => {
        if (prev.some(m => (m.id && m.id === msg.id) || (m.client_id && m.client_id === msg.client_id))) {
          return prev;
        }
        return [...prev, msg];
      });
      if (viewRef.current !== 'CHAT') {
        setUnreadChatCount(c => c + 1);
        sendLocalPush(msg.sender_name || 'Rider', msg.text);
      }
    });

    socket.on('message_sent_ack', (ack) => {
      setChatMessages(prev => prev.map(m => {
        if ((m.client_id && m.client_id === ack.client_id) || m.id === ack.client_id) {
          return { ...m, id: ack.id, status: 'delivered' };
        }
        return m;
      }));
    });

    socket.on('error', (data) => {
      Alert.alert('Action Failed', data.message || 'An error occurred.');
    });

    return () => {
      socket.off('trip_requested');
      socket.off('trip_cleared');
      socket.off('trip_completed_success');
      socket.off('awaiting_payment');
      socket.off('trip_restored');
      socket.off('new_message');
      socket.off('message_sent_ack');
      socket.off('error');
    };
  }, []);

  useEffect(() => {
    
    const sub = DeviceEventEmitter.addListener('DO_LOGOUT', async () => {
      if (profileAlertTimerGlobal) {
        clearTimeout(profileAlertTimerGlobal);
        profileAlertTimerGlobal = null;
      }
      hasPromptedProfileGlobal = false;
      isProfileAlertShowingGlobal = false;
      await AsyncStorage.removeItem('userToken');
      setProfile(null);
      socket.disconnect();
      setView('AUTH');
      navigation.navigate('Main');
    });
    return () => { if (sub && sub.remove) sub.remove(); else DeviceEventEmitter.removeAllListeners('DO_LOGOUT'); };
  }, [navigation]);


  useEffect(() => {
    async function updateRoute() {
      if (!tripState) {
        setRouteCoords([]);
        setRouteInfo(null);
        return;
      }
      if (view === 'EN_ROUTE_PICKUP') {
        const route = await fetchRoute(location.latitude, location.longitude, tripState.pickup.lat, tripState.pickup.lng);
        if (route) {
          setRouteCoords(route.coordinates);
          setRouteInfo({ distance: route.distance, duration: route.duration });
        }
      } else if (view === 'EN_ROUTE_DROPOFF') {
        const route = await fetchRoute(tripState.pickup.lat, tripState.pickup.lng, tripState.destination.lat, tripState.destination.lng);
        if (route) {
          setRouteCoords(route.coordinates);
          setRouteInfo({ distance: route.distance, duration: route.duration });
        }
      } else {
        setRouteCoords([]);
        setRouteInfo(null);
      }
    }
    updateRoute();
  }, [view, tripState]);

  // ── Handlers ────────────────────────────────────────
  const toggleOnline = () => {
    const currentView = viewRef.current;
    const next = currentView === 'OFFLINE' ? 'ONLINE' : 'OFFLINE';
    socket.emit('driver_status', next === 'ONLINE' ? 'online' : 'offline');
    setView(next);
  };

  const handleAccept = () => {
    setChatMessages([]);
    setUnreadChatCount(0);
    socket.emit('accept_trip', { trip_id: tripState.trip_id, customer_id: tripState.customer_id });
    setView('EN_ROUTE_PICKUP');
  };
  const handleDecline = () => {
    setChatMessages([]);
    setUnreadChatCount(0);
    socket.emit('clear_trip');
    setTripState(null);
    setView('ONLINE');
  };

  const handleStatusUpdate = (status) => {
    console.log('[Driver] handleStatusUpdate called with status:', status);
    
    if (status === 'COMPLETED') {
      setView('AWAITING_PAYMENT');
      socket.emit('complete_trip', { 
        trip_id: tripState?.trip_id || tripState?.id, 
        customer_id: tripState?.customer_id, 
        price: tripState?.price || 30000 
      });
      return;
    }

    socket.emit('update_trip_status', {
      trip_id: tripState?.trip_id || tripState?.id,
      status: status,
      customer_id: tripState?.customer_id
    });
    
    if (status === 'ARRIVED') {
      setTimeout(() => {
        socket.emit('update_trip_status', {
          trip_id: tripState?.trip_id || tripState?.id,
          status: 'IN_PROGRESS',
          customer_id: tripState?.customer_id
        });
        setView('EN_ROUTE_DROPOFF');
        if (mapRef.current && tripState) {
          mapRef.current.fitToCoordinates(
            [{ latitude: tripState.destination.lat, longitude: tripState.destination.lng }, location],
            { edgePadding: { top: 120, right: 60, bottom: 420, left: 60 }, animated: true }
          );
        }
      }, 400);
    }
  };

  const isAuth = view === 'AUTH';
  const isDash = ['OFFLINE', 'ONLINE', 'REQUEST'].includes(view);
  const isOnline = view === 'ONLINE' || view === 'REQUEST';
  const isActiveTrip = view === 'EN_ROUTE_PICKUP' || view === 'EN_ROUTE_DROPOFF';
  if (isInitializing) return <View style={{flex:1, backgroundColor:'#121212', justifyContent:'center', alignItems:'center'}}><ActivityIndicator size="large" color="#05A357" /></View>;

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* ── MAP ─────────────────────────────────────── */}
      {!isAuth && (
        <MapView
          ref={mapRef}
          style={StyleSheet.absoluteFill}
          customMapStyle={Platform.OS === 'ios' ? mapStyle : undefined}
          initialRegion={{ latitude: location.latitude, longitude: location.longitude, latitudeDelta: 0.05, longitudeDelta: 0.05 }}
          showsUserLocation={false}
          scrollEnabled={isDash}
          zoomEnabled={isDash}
          toolbarEnabled={false}
        >
          {/* Driver dot */}
          <Marker coordinate={location}>
            <View style={styles.driverDot} />
          </Marker>

          {/* Route */}
          {tripState && (view === 'REQUEST' || isActiveTrip) && <>
            <Marker coordinate={{ latitude: tripState.pickup.lat, longitude: tripState.pickup.lng }}>
              <View style={styles.pickupDot} />
            </Marker>
            <Marker coordinate={{ latitude: tripState.destination.lat, longitude: tripState.destination.lng }}>
              <View style={styles.dropoffDot} />
            </Marker>
            <Polyline
              coordinates={routeCoords.length > 0 ? routeCoords : [{ latitude: tripState.pickup.lat, longitude: tripState.pickup.lng }, { latitude: tripState.destination.lat, longitude: tripState.destination.lng }]}
              strokeColor={C.brand}
              strokeWidth={4}
            />
          </>}
        </MapView>
      )}

      {/* ── UI OVERLAY ──────────────────────────────── */}
      <View style={StyleSheet.absoluteFill} pointerEvents="box-none">

        {isAuth && (
          <View style={StyleSheet.absoluteFill}>
            <AuthScreen onLogin={async (token) => {
              socket.connect();
              try {
                const p = await api.getProfile();
                setProfile(p);
                promptProfileCompletion(p);
              } catch(e) {}
              setView('OFFLINE');
            }} />
          </View>
        )}

        {isDash && (
                    <DashboardScreen profile={profile} wallet={wallet}
            isOnline={isOnline}
            toggleOnline={toggleOnline}
            onMenuPress={() => navigation.navigate('Account')}
            onSafetyPress={() => navigation.navigate('Safety')}
            onSettingsPress={() => navigation.navigate('Preferences')}
            onLogoutPress={() => DeviceEventEmitter.emit('DO_LOGOUT')}
            onPromoPress={() => navigation.navigate('Promo')}
            onProfilePress={() => navigation.navigate('ProfileDetail')}
          />
        )}

        {view === 'REQUEST' && (
          <View style={StyleSheet.absoluteFill} pointerEvents="auto">
            <RequestScreen trip={tripState} onAccept={handleAccept} onDecline={handleDecline} />
          </View>
        )}

        {isActiveTrip && (
          <ActiveTripScreen routeInfo={routeInfo}
            trip={{ ...tripState, status: view === 'EN_ROUTE_PICKUP' ? 'ACCEPTED' : 'IN_PROGRESS' }}
            unreadCount={unreadChatCount}
            onStatusUpdate={handleStatusUpdate}
            onChat={() => { setChatReturnView(view); setUnreadChatCount(0); setView('CHAT'); }}
            onCall={async () => {
              const phone = tripState?.customer?.phone;
              if (!phone) {
                Alert.alert('Phone Unavailable', 'The customer has not provided a phone number.');
                return;
              }
              const clean = phone.replace(/[^\d+]/g, '');
              const url = `tel:${clean}`;
              try {
                const supported = await Linking.canOpenURL(url);
                if (supported) {
                  await Linking.openURL(url);
                } else {
                  Alert.alert('Call Not Supported', `Phone calls cannot be placed directly from this device or simulator.\n\nCustomer phone: ${phone}`);
                }
              } catch (err) {
                console.warn('[Call Error]', err);
                Alert.alert('Call Failed', `Could not open dialer for ${phone}`);
              }
            }}
          />
        )}

        




        {view === 'AWAITING_PAYMENT' && (
          <View style={StyleSheet.absoluteFill} pointerEvents="auto">
            <View style={styles.awaitingOverlay}>
              <View style={styles.awaitingCard}>
                <View style={styles.awaitingSpinnerBox}>
                  <ActivityIndicator size="large" color="#05A357" />
                </View>
                <Text style={styles.awaitingTitle}>Ride Ended</Text>
                <Text style={styles.awaitingSub}>
                  {(tripState?.payment_method || 'CASH').toUpperCase() === 'CASH'
                    ? 'Passenger Paying Cash'
                    : (tripState?.payment_method || 'CASH').toUpperCase() === 'STRIPE'
                    ? 'Card Payment (Stripe)'
                    : 'Mobile Payment (Flutterwave)'}
                </Text>

                <View style={styles.awaitingPriceBox}>
                  <Text style={styles.awaitingPriceText}>
                    {tripState?.currency === 'USD'
                      ? `$${Number(tripState?.amount || tripState?.fare || tripState?.price || 3).toFixed(2)}`
                      : `${Number(tripState?.amount || tripState?.fare || tripState?.price || 25000).toLocaleString()} GNF`}
                  </Text>
                </View>

                <Text style={styles.awaitingNote}>
                  {(tripState?.payment_method || 'CASH').toUpperCase() === 'CASH'
                    ? 'Please collect the cash directly from the passenger, then tap below to confirm.'
                    : 'The passenger is completing payment on their phone. This screen will automatically update once confirmed.'}
                </Text>

                <TouchableOpacity 
                  style={styles.cashConfirmBtn}
                  activeOpacity={0.8}
                  onPress={() => {
                    Alert.alert(
                      "Cash Received",
                      "Confirm that the passenger paid you in cash?",
                      [
                        { text: "Cancel", style: "cancel" },
                        { 
                          text: "Yes, Confirm Cash", 
                          onPress: () => {
                            socket.emit('confirm_cash_payment', {
                              trip_id: tripState?.trip_id || tripState?.id,
                              customer_id: tripState?.customer_id
                            });
                          }
                        }
                      ]
                    );
                  }}
                >
                  <Text style={styles.cashConfirmBtnText}>
                    {(tripState?.payment_method || 'CASH').toUpperCase() === 'CASH'
                      ? 'Confirm Cash Received'
                      : 'Passenger Paid Cash Instead'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        {/* CHAT OVERLAY */}
        {view === 'CHAT' && tripState && (
          <View style={[StyleSheet.absoluteFill, { zIndex: 9999, elevation: 99 }]} pointerEvents="auto">
            <ChatScreen 
              role="DRIVER" 
              trip={tripState} 
              messages={chatMessages}
              setMessages={setChatMessages}
              onClose={() => setView(chatReturnView)} 
            />
          </View>
        )}

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#121212' },

  driverDot: { width: 16, height: 16, borderRadius: 8, backgroundColor: '#05A357', borderWidth: 3, borderColor: '#fff', shadowColor: '#05A357', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.8, shadowRadius: 6, elevation: 6 },
  pickupDot: { width: 14, height: 14, borderRadius: 7, backgroundColor: '#05A357', borderWidth: 2, borderColor: '#fff' },
  dropoffDot: { width: 14, height: 14, borderRadius: 2, backgroundColor: '#EF4444', borderWidth: 2, borderColor: '#fff' },

  // Drawer
  dimmer: { backgroundColor: 'rgba(0,0,0,0.6)' },
  drawer: {
    position: 'absolute', top: 0, left: 0, bottom: 0, width: '78%',
    backgroundColor: '#1E1E1E', paddingTop: 70, paddingHorizontal: 28, paddingBottom: 40,
    justifyContent: 'space-between',
    shadowColor: '#000', shadowOffset: { width: 4, height: 0 }, shadowOpacity: 0.5, shadowRadius: 20, elevation: 20,
  },
  drawerHead: { marginBottom: 32 },
  drawerAvatar: { width: 72, height: 72, borderRadius: 36, borderWidth: 3, borderColor: '#05A357', marginBottom: 16 },
  drawerName: { fontSize: 22, fontWeight: '800', color: '#fff' },
  ratingRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, gap: 4, marginTop: 8 },
  ratingText: { fontSize: 12, fontWeight: '700', color: '#000' },
  drawerItems: { flex: 1, gap: 4 },
  drawerRow: { flexDirection: 'row', alignItems: 'center', gap: 16, paddingVertical: 18, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: 'rgba(255,255,255,0.08)' },
  drawerRowText: { flex: 1, fontSize: 17, fontWeight: '600', color: '#fff' },
  badge: { backgroundColor: '#05A357', width: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  badgeText: { color: '#fff', fontSize: 11, fontWeight: '800' },
  drawerSignOut: { paddingVertical: 16 },
  drawerSignOutText: { fontSize: 15, fontWeight: '700', color: '#EF4444' },

  // Modal
  modalCentered: { justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.7)', padding: 24 },
  modalCard: { width: '100%', backgroundColor: '#1E1E1E', borderRadius: 24, overflow: 'hidden' },
  modalCardHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 24, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: 'rgba(255,255,255,0.1)' },
  modalCardTitle: { fontSize: 20, fontWeight: '800', color: '#fff' },
  modalClose: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' },
  earningsAmount: { fontSize: 42, fontWeight: '900', color: '#05A357', marginBottom: 8 },
  earningsSub: { fontSize: 14, color: '#9CA3AF', textAlign: 'center' },

  // Awaiting Payment Overlay
  awaitingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    zIndex: 1000,
    elevation: 1000,
  },
  awaitingCard: {
    width: '100%',
    backgroundColor: '#1E1E1E',
    borderRadius: 24,
    padding: 28,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  awaitingSpinnerBox: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(5,163,87,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  awaitingTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 4,
  },
  awaitingSub: {
    fontSize: 15,
    color: '#9CA3AF',
    marginBottom: 20,
  },
  awaitingPriceBox: {
    backgroundColor: '#121212',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  awaitingPriceText: {
    fontSize: 28,
    fontWeight: '900',
    color: '#05A357',
  },
  awaitingNote: {
    fontSize: 13,
    color: '#9CA3AF',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 18,
  },
  cashConfirmBtn: {
    backgroundColor: '#05A357',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    width: '100%',
    alignItems: 'center',
  },
  cashConfirmBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false, cardStyle: { backgroundColor: '#121212' } }}>
          <Stack.Screen name="Main" component={MainApp} />
          <Stack.Screen name="Account" component={AccountScreen} />
          <Stack.Screen name="Wallet" component={WalletScreen} />
          <Stack.Screen name="VehicleProfile" component={VehicleProfileScreen} />
          <Stack.Screen name="Feedback" component={FeedbackScreen} />


          <Stack.Screen name="Earnings" component={EarningsScreen} />
          <Stack.Screen name="ProfileDetail" component={ProfileScreen} />
          <Stack.Screen name="Profile" component={ProfileScreen} />
          <Stack.Screen name="Safety" component={SafetyScreen} />
          <Stack.Screen name="Preferences" component={PreferencesScreen} />
          <Stack.Screen name="Promo" component={PromoScreen} />
          <Stack.Screen name="Support" component={SupportScreen} />
          <Stack.Screen name="Cancellation" component={CancellationScreen} />

        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
