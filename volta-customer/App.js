import React, { useState, useEffect, useRef } from 'react';
import {
  View, StyleSheet, Platform, TouchableOpacity, Text,
  Dimensions, Image, StatusBar, ScrollView, Alert, ActivityIndicator, DeviceEventEmitter, Keyboard, Linking
} from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { Home, Clock, CreditCard, User, X, MapPin, Star } from 'lucide-react-native';
import { BlurView } from 'expo-blur';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';

import C from './src/constants/colors';
import mapStyle from './src/constants/mapStyle';
import socket from './src/services/socket';
import api from './src/services/api';
import { fetchRoute } from './src/services/routing';
import { sendLocalPush, requestPushPermissions } from './src/services/notifications';

import { StripeProvider } from '@stripe/stripe-react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useSafeAreaInsets, SafeAreaProvider } from 'react-native-safe-area-context';
import { useTranslation } from './src/constants/translations';
import SavedPlacesScreen from './src/screens/SavedPlacesScreen';
import AddPaymentScreen from './src/screens/AddPaymentScreen';
import PromotionsScreen from './src/screens/PromotionsScreen';
import CancellationScreen from './src/screens/CancellationScreen';
import CustomerSafetyScreen from './src/screens/CustomerSafetyScreen';
import AccountScreen from './src/screens/AccountScreen';
import ProfileDetailScreen from './src/screens/ProfileDetailScreen';
import RideDetailScreen from './src/screens/RideDetailScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import SupportScreen from './src/screens/SupportScreen';

import RideHistoryScreen from './src/screens/RideHistoryScreen';
import AuthScreen from './src/screens/AuthScreen';
import HomeScreen from './src/screens/HomeScreen';
import SearchScreen from './src/screens/SearchScreen';
import BookingScreen from './src/screens/BookingScreen';
import MatchingScreen from './src/screens/MatchingScreen';
import ActiveTripScreen from './src/screens/ActiveTripScreen';
import ChatScreen from './src/screens/ChatScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import WalletScreen from './src/screens/WalletScreen';
import ReceiptScreen from './src/screens/ReceiptScreen';

const { width, height } = Dimensions.get('window');
const START_LAT = 9.5350;
const START_LNG = -13.6773;

// Map is ONLY visible on HOME and ACTIVE views — hidden everywhere else
const MAP_VIEWS = ['HOME', 'ACTIVE'];


const Stack = createStackNavigator();

let hasPromptedProfileGlobal = false;
let profileAlertTimerGlobal = null;
let isProfileAlertShowingGlobal = false;

function MainApp({ navigation }) {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();

  const [view, setView] = useState('AUTH');
  const [location, setLocation] = useState({ latitude: START_LAT, longitude: START_LNG });
  const [destLat, setDestLat] = useState(null);

  const [routeCoords, setRouteCoords] = useState([]);
  const [routeInfo, setRouteInfo] = useState(null);

  const [destLng, setDestLng] = useState(null);
  const [destName, setDestName] = useState('');
  const [pickup, setPickup] = useState('Current Location');

  const [profile, setProfile] = useState(null);
  const [places, setPlaces] = useState([]);
  const [trips, setTrips] = useState([]);
  const [wallet, setWallet] = useState(null);
  const [currentAddress, setCurrentAddress] = useState('Current Location');
  const [searchMode, setSearchMode] = useState('DEFAULT');

  const [tripState, setTripState] = useState(null);
  const [paymentRequest, setPaymentRequest] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [unreadChatCount, setUnreadChatCount] = useState(0);

  const viewRef = useRef(view);
  useEffect(() => { viewRef.current = view; }, [view]);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [modal, setModal] = useState(null);
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    const showSub = Keyboard.addListener('keyboardDidShow', () => setKeyboardVisible(true));
    const hideSub = Keyboard.addListener('keyboardDidHide', () => setKeyboardVisible(false));
    return () => { showSub.remove(); hideSub.remove(); };
  }, []);
  // 'PROFILE' | 'RIDES' | 'WALLET' | null
  
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
          t('auth.profile_title'),
          t('auth.profile_sub'),
          [
            {
              text: t('auth.profile_title'),
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
              text: t('common.later'),
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
          try {
            const userPlaces = await api.getPlaces();
            if (Array.isArray(userPlaces)) setPlaces(userPlaces);
          } catch(e) {}
          
          try {
            const activeRes = await api.getActiveTrip();
            if (activeRes && activeRes.active && (activeRes.trip.status === 'ACCEPTED' || activeRes.trip.status === 'IN_PROGRESS')) {
              setTripState(activeRes.trip);
              setView('ACTIVE');
              api.getTripMessages(activeRes.trip.id || activeRes.trip.trip_id).then(msgs => {
                if (Array.isArray(msgs) && msgs.length > 0) setChatMessages(msgs);
              }).catch(() => {});
            } else {
              setView('HOME');
            }
          } catch(e) {
            setView('HOME');
          }
          
          const pushToken = await requestPushPermissions();
          if (pushToken) {
            await api.updateProfile({ push_token: pushToken });
          }

          // Alert if customer missed profile submission (guarded & debounced)
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
    const sub = DeviceEventEmitter.addListener('PLACES_UPDATED', async () => {
      try {
        const userPlaces = await api.getPlaces();
        if (Array.isArray(userPlaces)) setPlaces(userPlaces);
      } catch(e) {}
    });
    return () => { if (sub && sub.remove) sub.remove(); };
  }, []);

  const mapRef = useRef(null);

  // ── Location ────────────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') return;
        const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        const coords = { latitude: loc.coords.latitude, longitude: loc.coords.longitude };
        setLocation(coords);
        if (mapRef.current) {
          mapRef.current.animateToRegion({
            latitude: coords.latitude,
            longitude: coords.longitude,
            latitudeDelta: 0.02,
            longitudeDelta: 0.02,
          }, 800);
        }
        
        try {
          const addr = await Location.reverseGeocodeAsync(coords);
          if (addr && addr.length > 0) {
              const street = addr[0].street || addr[0].name || addr[0].city || 'Current Location';
              setCurrentAddress(street);
              setPickup(street);
          }
        } catch(e) {}
      } catch(error) {
        console.warn('Location initialization failed:', error);
      }
    })();
  }, []);


  // ── Routing ─────────────────────────────────────────
  useEffect(() => {
    if (destLat && destLng && location) {
      (async () => {
        const route = await fetchRoute(location.latitude, location.longitude, destLat, destLng);
        if (route) {
          setRouteCoords(route.coordinates);
          setRouteInfo({ distance: route.distance, duration: route.duration });
        }
      })();
    } else {
      setRouteCoords([]);
      setRouteInfo(null);
    }
  }, [destLat, destLng, location]);

  // ── Socket ──────────────────────────────────────────
  useEffect(() => {
    socket.on('trip_accepted', (data) => {
      setTripState({ ...data, status: 'ACCEPTED' });
      setChatMessages([]);
      setUnreadChatCount(0);
      setView('ACTIVE');
    });
    socket.on('trip_finished_receipt', (data) => {
      setTripState(data);
      setChatMessages([]);
      setUnreadChatCount(0);
      setView('RECEIPT');
    });
    socket.on('dispatch_failed', (data) => {
      Alert.alert("No Drivers Found", data.reason || "Try again later");
      setChatMessages([]);
      setUnreadChatCount(0);
      setView('HOME');
    });
    socket.on('driver_location', (data) => {
      setTripState(prev => prev ? { ...prev, driverLocation: { latitude: data.lat, longitude: data.lng } } : prev);
    });

    socket.on('trip_status_updated', (data) => {
      setTripState(prev => {
        if (!prev) return prev;
        return { ...prev, status: data.status };
      });
    });
    socket.on('payment_required', (data) => {
      console.log('[Customer] Received payment_required:', data);
      setPaymentRequest(data);
      setView('ACTIVE');
    });

    socket.on('new_message', (msg) => {
      console.log('[Customer] new_message received:', msg);
      setChatMessages(prev => {
        if (prev.some(m => (m.id && m.id === msg.id) || (m.client_id && m.client_id === msg.client_id))) {
          return prev;
        }
        return [...prev, msg];
      });
      if (viewRef.current !== 'CHAT') {
        setUnreadChatCount(c => c + 1);
        sendLocalPush(msg.sender_name || 'Driver', msg.text);
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

    return () => { 
      socket.off('trip_accepted'); 
      socket.off('trip_finished_receipt'); 
      socket.off('dispatch_failed'); 
      socket.off('driver_location');
      socket.off('trip_status_updated');
      socket.off('payment_required');
      socket.off('new_message');
      socket.off('message_sent_ack');
    };
  }, []);

  // ── Active Trip Polling Fallback while on MATCHING ───────────────────
  useEffect(() => {
    let interval = null;
    if (view === 'MATCHING') {
      interval = setInterval(async () => {
        try {
          const res = await api.getActiveTrip();
          if (res && res.active && (res.trip.status === 'ACCEPTED' || res.trip.status === 'IN_PROGRESS')) {
            console.log('[Polling] Detected accepted trip:', res.trip.id);
            setTripState(res.trip);
            setView('ACTIVE');
          }
        } catch (e) {
          // Ignore transient error
        }
      }, 2000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [view]);

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

  // ── Route drawing ───────────────────────────────────
  const drawRoute = (name, lat, lng) => {
    setDestName(name); setDestLat(lat); setDestLng(lng);
    setView('BOOKING');
  };

  const handleBook = (vehicleName, price, paymentMethod = 'FLUTTERWAVE', currency = 'GNF') => {
    setView('MATCHING');
    const customerName = ((profile?.first_name || '') + ' ' + (profile?.last_name || '')).trim() || 'Passenger';
    setTripState(prev => ({
      ...prev,
      vehicleType: vehicleName,
      price: price,
      fare: price,
      payment_method: paymentMethod,
      currency: currency
    }));
    socket.emit('request_trip', {
      customer: { 
        id: profile?.id, 
        name: customerName, 
        phone: profile?.phone_number || '', 
        rating: profile?.rating || 5.0 
      },
      pickup: { name: pickup, lat: location.latitude, lng: location.longitude },
      destination: { name: destName, lat: destLat, lng: destLng },
      vehicleType: vehicleName,
      price: price,
      payment_method: paymentMethod,
      currency: currency
    });
  };

  const handleCancelMatch = () => { socket.emit('cancel_trip'); setView('HOME'); };

  const showMap = true;
  const showNav = !isKeyboardVisible && ['HOME', 'RIDES', 'WALLET', 'ACCOUNT'].includes(view);

  if (isInitializing) return <View style={{flex:1, backgroundColor:'#fff', justifyContent:'center', alignItems:'center'}}><ActivityIndicator size="large" color="#000" /></View>;
  return (
    <View style={styles.root}>
      <StatusBar
        barStyle={view === 'AUTH' ? 'light-content' : 'dark-content'}
        translucent
        backgroundColor="transparent"
      />

      {/* ══ MAP — only on HOME + ACTIVE ════════════════ */}
      {showMap && (
        <MapView
          ref={mapRef}
          style={StyleSheet.absoluteFill}
          customMapStyle={Platform.OS === 'ios' ? mapStyle : undefined}
          initialRegion={{
            latitude: location.latitude,
            longitude: location.longitude,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          }}
          showsUserLocation
          scrollEnabled={view === 'HOME'}
          zoomEnabled={view === 'HOME'}
          showsMyLocationButton={false}
          toolbarEnabled={false}
        >
          {/* Custom User Location Marker */}
          {location && (
            <Marker
              coordinate={{ latitude: location.latitude, longitude: location.longitude }}
              title="Current Location"
              anchor={{ x: 0.5, y: 0.5 }}
            >
              <View style={styles.userMarkerPulse}>
                <View style={styles.userMarkerDot} />
              </View>
            </Marker>
          )}

          {(view === 'ACTIVE' || view === 'BOOKING') && destLat && (
            <>
              <Marker coordinate={{ latitude: destLat, longitude: destLng }}>
                <View style={styles.destPin} />
              </Marker>
              <Polyline
                coordinates={routeCoords.length > 0 ? routeCoords : [
                  { latitude: location.latitude, longitude: location.longitude },
                  { latitude: destLat, longitude: destLng },
                ]}
                strokeColor={C.lux900} strokeWidth={5}
              />
            </>
          )}
        </MapView>
      )}

      {/* ══ UI OVERLAY ═════════════════════════════════ */}
      <View style={StyleSheet.absoluteFill} pointerEvents="box-none">

        {/* AUTH — full screen, no map */}
        {view === 'AUTH' && (
          <View style={StyleSheet.absoluteFill} pointerEvents="auto">
            <AuthScreen onLogin={async () => {
              socket.connect();
              try {
                const p = await api.getProfile();
                setProfile(p);
                promptProfileCompletion(p);
                const userPlaces = await api.getPlaces();
                if (Array.isArray(userPlaces)) setPlaces(userPlaces);
              } catch(e) {}
              setView('HOME');
            }} />
          </View>
        )}

        {/* HOME — floating UI over map */}
        {view === 'HOME' && (
          <HomeScreen profile={profile} places={places} currentAddress={currentAddress}
            onMenuPress={() => navigation.navigate('Account')}
            onSearchPress={(q) => { if (typeof q === 'string' && q) setDestName(q); setSearchMode('DEFAULT'); setView('SEARCH'); }}
            onAirportPress={() => { setDestName(''); setSearchMode('AIRPORT'); setView('SEARCH'); }}
            onSelectDestination={drawRoute}
            navigation={navigation}
            onProfilePress={() => navigation.navigate('ProfileDetail')}
          />
        )}

        {/* SEARCH — full screen white, no map */}
        {view === 'SEARCH' && (
          <View style={StyleSheet.absoluteFill} pointerEvents="auto">
            <SearchScreen places={places} currentAddress={currentAddress}
              pickup={pickup}
              setPickup={setPickup}
              initialMode={searchMode}
              userCoords={location}
              onClose={() => { setSearchMode('DEFAULT'); setView('HOME'); }}
              onSelectDestination={(name, lat, lon) => {
                setSearchMode('DEFAULT');
                drawRoute(name, lat, lon);
              }}
            />
          </View>
        )}

        {/* BOOKING — full screen glass panel, no map */}
        {view === 'BOOKING' && (
          <View style={StyleSheet.absoluteFill} pointerEvents="auto">
            <BookingScreen routeInfo={routeInfo}
              destination={destName}
              onBack={() => { setView('HOME'); setDestLat(null); }}
              onConfirm={handleBook}
            />
          </View>
        )}

        {/* MATCHING */}
        {view === 'MATCHING' && (
          <View style={StyleSheet.absoluteFill} pointerEvents="auto">
            <MatchingScreen vehicle={tripState?.vehicleType} onCancel={handleCancelMatch} />
          </View>
        )}

        {/* ACTIVE */}
        {view === 'ACTIVE' && (
          <ActiveTripScreen routeInfo={routeInfo} trip={tripState}
            unreadCount={unreadChatCount}
            onChat={() => { setUnreadChatCount(0); setView('CHAT'); }}
            paymentRequest={paymentRequest} setPaymentRequest={setPaymentRequest}
            onCall={async () => {
              const phone = tripState?.driver?.phone;
              if (!phone) {
                Alert.alert('Phone Unavailable', 'The driver has not provided a phone number.');
                return;
              }
              const clean = phone.replace(/[^\d+]/g, '');
              const url = `tel:${clean}`;
              try {
                const supported = await Linking.canOpenURL(url);
                if (supported) {
                  await Linking.openURL(url);
                } else {
                  Alert.alert('Call Not Supported', `Phone calls cannot be placed directly from this device or simulator.\n\nDriver phone: ${phone}`);
                }
              } catch (err) {
                console.warn('[Call Error]', err);
                Alert.alert('Call Failed', `Could not open dialer for ${phone}`);
              }
            }} />
        )}

        
        {/* CHAT */}
        {view === 'CHAT' && (
          <View style={[StyleSheet.absoluteFill, { zIndex: 9999, elevation: 99 }]} pointerEvents="auto">
            <ChatScreen 
              role="CUSTOMER" 
              trip={tripState} 
              messages={chatMessages}
              setMessages={setChatMessages}
              onClose={() => setView('ACTIVE')} 
            />
          </View>
        )}

        {/* RECEIPT */}
        {view === 'RECEIPT' && (
          <View style={StyleSheet.absoluteFill} pointerEvents="auto">
            <ReceiptScreen
              trip={tripState}
              onDone={() => { setView('HOME'); setDestLat(null); setTripState(null); }}
            />
          </View>
        )}

        
        {view === 'RIDES' && (
          <View style={[StyleSheet.absoluteFill, { backgroundColor: '#F5F7FA', zIndex: 50, paddingBottom: Platform.OS === 'ios' ? 80 : 70 + Math.max(insets.bottom, 24) }]} pointerEvents="auto">
            <RideHistoryScreen trips={trips} navigation={{...navigation, goBack: () => setView('HOME')}} />
          </View>
        )}

        {view === 'WALLET' && (
          <View style={[StyleSheet.absoluteFill, { backgroundColor: '#F5F7FA', zIndex: 50, paddingBottom: Platform.OS === 'ios' ? 80 : 70 + Math.max(insets.bottom, 24) }]} pointerEvents="auto">
            <WalletScreen wallet={wallet} navigation={{...navigation, goBack: () => setView('HOME')}} />
          </View>
        )}

        {view === 'ACCOUNT' && (
          <View style={[StyleSheet.absoluteFill, { backgroundColor: '#F5F7FA', zIndex: 50, paddingBottom: Platform.OS === 'ios' ? 80 : 70 + Math.max(insets.bottom, 24) }]} pointerEvents="auto">
            <AccountScreen profile={profile} navigation={{...navigation, goBack: () => setView('HOME')}} />
          </View>
        )}

        {/* ══ BOTTOM NAV ════════════════════════════════ */}
        {showNav && (
          <View style={styles.navWrap} pointerEvents="auto">
            <View style={[
              styles.nav,
              {
                paddingBottom: Platform.OS === 'ios' ? 30 : Math.max(insets.bottom, 24) + 12
              }
            ]}>
              <TouchableOpacity style={styles.navItem} onPress={() => setView('HOME')}>
                <Home
                  size={24}
                  color={view === 'HOME' ? C.gold : C.gray400}
                  fill={view === 'HOME' ? C.gold : 'none'}
                />
                <Text style={[styles.navLabel, view === 'HOME' && styles.navActive]}>{t('nav.home')}</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.navItem} onPress={() => setView('RIDES')}>
                <Clock size={24} color={view === 'RIDES' ? C.gold : C.gray400} />
                <Text style={[styles.navLabel, view === 'RIDES' && styles.navActive]}>{t('nav.rides')}</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.navItem} onPress={() => setView('WALLET')}>
                <CreditCard size={24} color={view === 'WALLET' ? C.gold : C.gray400} />
                <Text style={[styles.navLabel, view === 'WALLET' && styles.navActive]}>{t('nav.wallet')}</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.navItem} onPress={() => setView('ACCOUNT')}>
                <User size={24} color={view === 'ACCOUNT' ? C.gold : C.gray400} />
                <Text style={[styles.navLabel, view === 'ACCOUNT' && styles.navActive]}>{t('nav.account')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F5F7FA' },
  destPin: { width: 16, height: 16, borderRadius: 8, backgroundColor: C.lux900, borderWidth: 4, borderColor: '#fff' },
  userMarkerPulse: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(217, 119, 6, 0.22)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(217, 119, 6, 0.5)',
  },
  userMarkerDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#0F172A',
    borderWidth: 2.5,
    borderColor: '#D97706',
  },

  // ── Bottom nav ─────────────────────────────────────
  navWrap: { position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 100 },
  nav: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.97)',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(0,0,0,0.09)',
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 30 : 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 12,
  },
  navItem: { flex: 1, alignItems: 'center', gap: 3 },
  navLabel: { fontSize: 10, fontWeight: '700', color: C.gray400 },
  navActive: { color: C.gold },

  // ── Drawer ─────────────────────────────────────────
  dimmer: { backgroundColor: 'rgba(0,0,0,0.45)' },
  drawer: {
    position: 'absolute', top: 0, left: 0, bottom: 0, width: '78%',
    backgroundColor: '#fff',
    paddingTop: Platform.OS === 'ios' ? 60 : 50,
    paddingHorizontal: 28, paddingBottom: 40,
    justifyContent: 'space-between',
    shadowColor: '#000', shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.15, shadowRadius: 20, elevation: 20,
  },
  drawerAvatar: { width: 72, height: 72, borderRadius: 36, borderWidth: 3, borderColor: C.gold, marginBottom: 14 },
  drawerName: { fontSize: 22, fontWeight: '800', color: C.lux900 },
  drawerTier: { fontSize: 11, fontWeight: '700', color: C.gold, textTransform: 'uppercase', letterSpacing: 1.5, marginTop: 4 },
  drawerItems: { flex: 1, marginTop: 32, gap: 4 },
  drawerRow: { flexDirection: 'row', alignItems: 'center', gap: 16, paddingVertical: 16, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.gray100 },
  drawerRowText: { fontSize: 17, fontWeight: '600', color: C.lux900 },
  drawerSignOut: { paddingVertical: 16 },
  drawerSignOutText: { fontSize: 15, fontWeight: '700', color: '#EF4444' },

  // ── Modals / sheets ────────────────────────────────
  modalBg: { justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 36, borderTopRightRadius: 36,
    paddingHorizontal: 24,
    paddingBottom: Platform.OS === 'ios' ? 44 : 32,
  },
  sheetBar: { width: 40, height: 5, borderRadius: 3, backgroundColor: C.gray200, alignSelf: 'center', marginTop: 12, marginBottom: 8 },
  sheetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 16, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.gray100 },
  sheetTitle: { fontSize: 22, fontWeight: '800', color: C.lux900 },
  sheetClose: { width: 36, height: 36, borderRadius: 18, backgroundColor: C.gray100, alignItems: 'center', justifyContent: 'center' },
  sheetBtn: { backgroundColor: C.lux900, borderRadius: 18, paddingVertical: 16, alignItems: 'center', marginTop: 8 },
  sheetBtnText: { color: '#fff', fontWeight: '800', fontSize: 16 },

  // Profile modal
  profileAvatar: { width: 88, height: 88, borderRadius: 44, borderWidth: 3, borderColor: C.gold, marginBottom: 14 },
  profileName: { fontSize: 22, fontWeight: '800', color: C.lux900, marginBottom: 4 },
  profilePhone: { fontSize: 14, color: C.gray500, fontWeight: '500', marginBottom: 14 },
  profileBadge: { backgroundColor: C.gold, paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20 },
  profileBadgeText: { color: C.lux900, fontWeight: '800', fontSize: 12, letterSpacing: 0.5 },

  // Rides modal
  rideRow: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 14, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.gray100 },
  rideIconWrap: { width: 40, height: 40, borderRadius: 20, backgroundColor: C.gray100, alignItems: 'center', justifyContent: 'center' },
  rideDest: { fontSize: 15, fontWeight: '700', color: C.lux900 },
  rideDate: { fontSize: 12, color: C.gray500, fontWeight: '500', marginTop: 2 },
  ridePrice: { fontSize: 14, fontWeight: '800', color: C.lux900 },

  // Wallet modal
  walletCard: {
    width: '100%', backgroundColor: C.lux900,
    borderRadius: 24, padding: 28, alignItems: 'center', gap: 12,
  },
  walletLabel: { fontSize: 13, fontWeight: '600', color: 'rgba(255,255,255,0.6)' },
  walletAmount: { fontSize: 32, fontWeight: '900', color: C.gold },
  orangeBadge: { backgroundColor: '#f97316', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  orangeText: { color: '#fff', fontSize: 11, fontWeight: '700', fontStyle: 'italic' },
});

export default function App() {
  return (
    <SafeAreaProvider>
      <StripeProvider publishableKey="pk_test_51Ser79BkXz3IrSREgfolHBSyAuugOH8NtlC7rLkaEB8OALbIiTd54G6IgMym6FRwH8Oc25Wcq7x7cUpHDFs01diz00sPYiWTOH">
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Main" component={MainApp} />
          <Stack.Screen name="SavedPlaces" component={SavedPlacesScreen} />
          <Stack.Screen name="Account" component={AccountScreen} />
          <Stack.Screen name="ProfileDetail" component={ProfileDetailScreen} />
          <Stack.Screen name="RideHistory" component={RideHistoryScreen} />
          <Stack.Screen name="RideDetail" component={RideDetailScreen} />
          <Stack.Screen name="Wallet" component={WalletScreen} />
          <Stack.Screen name="AddPayment" component={AddPaymentScreen} />

          <Stack.Screen name="Settings" component={SettingsScreen} />
          <Stack.Screen name="Support" component={SupportScreen} />
          <Stack.Screen name="Promotions" component={PromotionsScreen} />
          <Stack.Screen name="CustomerSafety" component={CustomerSafetyScreen} />
          <Stack.Screen name="Cancellation" component={CancellationScreen} />
        </Stack.Navigator>
      </NavigationContainer>
      </StripeProvider>
    </SafeAreaProvider>
  );
}
