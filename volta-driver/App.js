import React, { useState, useEffect, useRef } from 'react';
import {
  View, StyleSheet, Platform, TouchableOpacity, Text,
  Dimensions, Image, StatusBar, Alert, ActivityIndicator
} from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { Star, Inbox, Settings, Wallet, X } from 'lucide-react-native';
import * as Location from 'expo-location';

import C from './src/constants/colors';
import mapStyle from './src/constants/mapStyle';
import socket from './src/services/socket';
import api from './src/services/api';
import { fetchRoute } from './src/services/routing';
import { sendLocalPush, requestPushPermissions } from './src/services/notifications';

import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
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

function MainApp({ navigation }) {

  const [view, setView] = useState('AUTH');
  const [profile, setProfile] = useState(null);
  const [wallet, setWallet] = useState(null);
  const [chatReturnView, setChatReturnView] = useState('EN_ROUTE_PICKUP');
  const [location, setLocation] = useState({ latitude: START_LAT, longitude: START_LNG });
  const [tripState, setTripState] = useState(null);

  const [routeCoords, setRouteCoords] = useState([]);
  const [routeInfo, setRouteInfo] = useState(null);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [modal, setModal] = useState(null);
  
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = await require('@react-native-async-storage/async-storage').default.getItem('userToken');
        if (token) {
          const p = await api.getProfile();
          setProfile(p);
          socket.connect();
          setView('OFFLINE');
        }
      } catch(e) {
        console.log('Auto-login failed:', e);
      } finally {
        setIsInitializing(false);
      }
    };
    initAuth();
  }, []);

  const mapRef = useRef(null);
  const viewRef = useRef(view);
  useEffect(() => { viewRef.current = view; }, [view]);
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
    })();
    if (isInitializing) return <View style={{flex:1, backgroundColor:'#121212', justifyContent:'center', alignItems:'center'}}><ActivityIndicator size="large" color="#05A357" /></View>;
  return () => { if (locSub.current) locSub.current.remove(); };
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
      setView(v => v !== 'AUTH' ? 'OFFLINE' : v);
    });

    return () => {
      socket.off('trip_requested');
      socket.off('trip_cleared');
    };
  }, []);

  // ── Handlers ────────────────────────────────────────
  const toggleOnline = () => {
    const currentView = viewRef.current;
    const next = currentView === 'OFFLINE' ? 'ONLINE' : 'OFFLINE';
    socket.emit('driver_status', next === 'ONLINE' ? 'online' : 'offline');
    setView(next);
  };

  const handleAccept = () => { socket.emit('accept_trip', { trip_id: tripState.trip_id, customer_id: tripState.customer_id }); setView('EN_ROUTE_PICKUP'); };
  const handleDecline = () => { socket.emit('clear_trip'); setTripState(null); setView('ONLINE'); };

  const handleStatusUpdate = (status) => {
    console.log('[Driver] handleStatusUpdate called with status:', status);
    socket.emit('update_trip_status', status);
    if (status === 'ARRIVED') {
      setTimeout(() => {
        socket.emit('update_trip_status', 'IN_PROGRESS');
        setView('EN_ROUTE_DROPOFF');
        if (mapRef.current && tripState) {
          mapRef.current.fitToCoordinates(
            [{ latitude: tripState.destination.lat, longitude: tripState.destination.lng }, location],
            { edgePadding: { top: 120, right: 60, bottom: 420, left: 60 }, animated: true }
          );
        }
      }, 400);
    } else if (status === 'COMPLETED') {
      socket.emit('complete_trip', { trip_id: tripState.trip_id, customer_id: tripState.customer_id, price: tripState.price || 30000 });
      setTripState(null);
      setView('OFFLINE');
      navigation.navigate('Earnings');
    }
  };

  const isAuth = view === 'AUTH';
  const isDash = ['OFFLINE', 'ONLINE', 'REQUEST'].includes(view);
  const isOnline = view === 'ONLINE' || view === 'REQUEST';
  const isActiveTrip = view === 'EN_ROUTE_PICKUP' || view === 'EN_ROUTE_DROPOFF';

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* ── MAP ─────────────────────────────────────── */}
      {!isAuth && (
        <MapView
          ref={mapRef}
          style={StyleSheet.absoluteFill}
          customMapStyle={mapStyle}
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
            <AuthScreen onLogin={async (token) => { socket.connect(); try { const p = await api.getProfile(); setProfile(p); } catch(e) {} setView('OFFLINE'); }} />
          </View>
        )}

        {isDash && (
                    <DashboardScreen profile={profile} wallet={wallet}
            isOnline={isOnline}
            toggleOnline={toggleOnline}
            onMenuPress={() => navigation.navigate('Account', { onLogout: async () => { await require('@react-native-async-storage/async-storage').default.removeItem('userToken'); setProfile(null); socket.disconnect(); setView('AUTH'); navigation.navigate('Main'); }})}
            onSafetyPress={() => navigation.navigate('Safety')}
            onSettingsPress={() => navigation.navigate('Preferences')}
            onLogoutPress={async () => { await require('@react-native-async-storage/async-storage').default.removeItem('userToken'); setProfile(null); socket.disconnect(); setView('AUTH'); }}
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
            onStatusUpdate={handleStatusUpdate}
            onChat={() => { setChatReturnView(view); setView('CHAT'); }}
            onCall={() => Alert.alert('Calling Customer...', 'Ringing +224 620 00 00 01')}
          />
        )}

        




        {/* CHAT OVERLAY */}
        {view === 'CHAT' && tripState && (
          <View style={[StyleSheet.absoluteFill, { zIndex: 9999, elevation: 99 }]} pointerEvents="auto">
            <ChatScreen role="DRIVER" trip={tripState} onClose={() => setView(chatReturnView)} />
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
});

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false, cardStyle: { backgroundColor: '#121212' } }}>
        <Stack.Screen name="Main" component={MainApp} />
        <Stack.Screen name="Account" component={AccountScreen} />
        <Stack.Screen name="Wallet" component={WalletScreen} />
        <Stack.Screen name="VehicleProfile" component={VehicleProfileScreen} />
        <Stack.Screen name="Feedback" component={FeedbackScreen} />


        <Stack.Screen name="Earnings" component={EarningsScreen} />
        <Stack.Screen name="ProfileDetail" component={ProfileScreen} />
        <Stack.Screen name="Safety" component={SafetyScreen} />
        <Stack.Screen name="Preferences" component={PreferencesScreen} />
        <Stack.Screen name="Promo" component={PromoScreen} />
        <Stack.Screen name="Support" component={SupportScreen} />
        <Stack.Screen name="Cancellation" component={CancellationScreen} />

      </Stack.Navigator>
    </NavigationContainer>
  );
}
