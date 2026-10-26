import React, { useRef, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Dimensions, FlatList, KeyboardAvoidingView, Platform, ScrollView, Keyboard, Alert, DeviceEventEmitter, ActivityIndicator
} from 'react-native';
const { width, height } = Dimensions.get('window');
import { Search, MapPin, PlaneTakeoff, Briefcase, ArrowLeft, Home, Bookmark, Plane } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import api from '../services/api';
// Assuming you have your colors file
import C from '../constants/colors';
import { useTranslation } from '../constants/translations';

export default function SearchScreen({ onClose, onSelectDestination, onPickupChange, pickup, setPickup, places, initialMode = 'DEFAULT', userCoords }) {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { t, isFrench } = useTranslation();
  const [dropoff, setDropoff] = React.useState('');
  const [suggestions, setSuggestions] = React.useState([]);
  const [focusedField, setFocusedField] = React.useState('dropoff');
  const [loadingAirports, setLoadingAirports] = React.useState(false);
  const searchTimeout = React.useRef(null);

  useEffect(() => {
    return () => {
      if (searchTimeout.current) clearTimeout(searchTimeout.current);
    };
  }, []);

  const fetchNearbyAirports = async () => {
    setLoadingAirports(true);
    const lat = userCoords?.latitude || 9.5350;
    const lng = userCoords?.longitude || -13.6773;

    try {
      const googleUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=60000&type=airport&key=AIzaSyCnt02Uotcj2lXun70USSQ2hRsOcDXrZLY`;
      const res = await fetch(googleUrl);
      const json = await res.json();
      if (json.results && json.results.length > 0) {
        const list = json.results.map(r => ({
          id: r.place_id || String(Math.random()),
          name: r.name,
          full: r.vicinity || r.formatted_address || 'Airport',
          lat: r.geometry.location.lat,
          lon: r.geometry.location.lng,
          isAirport: true,
        }));
        setSuggestions(list);
        setLoadingAirports(false);
        return;
      }
    } catch (e) {
      console.log('Google Places airport search error:', e);
    }

    try {
      const res = await fetch(`https://photon.komoot.io/api/?q=airport&lat=${lat}&lon=${lng}&limit=8`);
      const data = await res.json();
      if (data.features && data.features.length > 0) {
        const list = data.features.map(f => {
          const p = f.properties;
          const full = [p.name, p.street, p.city, p.country].filter(Boolean).join(', ');
          return {
            id: String(p.osm_id || Math.random()),
            name: p.name || 'Airport',
            full: full,
            lat: f.geometry.coordinates[1],
            lon: f.geometry.coordinates[0],
            isAirport: true,
          };
        });
        setSuggestions(list);
      }
    } catch(e) {
      console.log('Photon airport error:', e);
    } finally {
      setLoadingAirports(false);
    }
  };

  useEffect(() => {
    if (initialMode === 'AIRPORT') {
      setFocusedField('dropoff');
      fetchNearbyAirports();
    }
  }, [initialMode]);

  const handleSearch = (text, field) => {
    if (field === 'pickup') setPickup(text);
    else setDropoff(text);
    
    if (text.length < 3) return setSuggestions([]);
    
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    
    searchTimeout.current = setTimeout(async () => {
      try {
        const res = await fetch(`https://photon.komoot.io/api/?q=${encodeURIComponent(text)}&limit=5`);
        const data = await res.json();
        if (data.features) {
          setSuggestions(data.features.map(f => {
            const p = f.properties;
            const full = [p.name, p.street, p.city, p.state, p.country].filter(Boolean).join(', ');
            return {
              id: String(p.osm_id),
              name: p.name || full.split(',')[0],
              full: full,
              lat: f.geometry.coordinates[1],
              lon: f.geometry.coordinates[0]
            };
          }));
        }
      } catch (e) {
        console.error("Search error:", e);
      }
    }, 400); // 400ms debounce
  };

  const handleSelect = (item) => {
    Keyboard.dismiss();
    setSuggestions([]);
    if (focusedField === 'pickup') {
      setPickup(item.name);
    } else {
      setDropoff(item.name);
      onSelectDestination(item.name, item.lat, item.lon);
    }
  };

  const [placesList, setPlacesList] = React.useState(places || []);

  const refreshPlaces = async () => {
    try {
      const res = await api.getPlaces();
      if (Array.isArray(res)) setPlacesList(res);
    } catch (e) {}
  };

  useEffect(() => {
    refreshPlaces();
    const sub = DeviceEventEmitter.addListener('PLACES_UPDATED', refreshPlaces);
    const selSub = DeviceEventEmitter.addListener('SELECT_SAVED_PLACE', (p) => {
      if (p && (p.address || p.name)) {
        Keyboard.dismiss();
        setDropoff(p.address || p.name);
        const lat = parseFloat(p.lat);
        const lng = parseFloat(p.lng || p.lon);
        onSelectDestination(p.name, !isNaN(lat) ? lat : 9.5350, !isNaN(lng) ? lng : -13.6773);
      }
    });
    return () => {
      if (sub && sub.remove) sub.remove();
      if (selSub && selSub.remove) selSub.remove();
      if (searchTimeout.current) clearTimeout(searchTimeout.current);
    };
  }, []);

  useEffect(() => {
    if (Array.isArray(places)) {
      setPlacesList(places);
    }
  }, [places]);

  const findPlace = (typeKey) => {
    if (!placesList || !placesList.length) return null;
    const k = typeKey.toLowerCase();
    return placesList.find(p => {
      const type = (p.place_type || '').toLowerCase();
      const name = (p.name || '').toLowerCase();
      if (k === 'home') return type === 'home' || name === 'home' || name.startsWith('home');
      if (k === 'work') return type === 'work' || name === 'work' || name.startsWith('work');
      if (k === 'mom') return type === 'mom' || name === 'mom' || name.includes('mom');
      return false;
    });
  };

  const handleSavedPlacePress = (typeKey, displayName) => {
    const saved = findPlace(typeKey);
    const hasAddress = saved && saved.address && saved.address.trim().length > 0;

    if (hasAddress) {
      Keyboard.dismiss();
      const lat = parseFloat(saved.lat);
      const lng = parseFloat(saved.lng || saved.lon);
      const targetLat = !isNaN(lat) ? lat : 9.5350;
      const targetLng = !isNaN(lng) ? lng : -13.6773;
      setDropoff(saved.address || saved.name || displayName);
      onSelectDestination(saved.name || displayName, targetLat, targetLng);
    } else {
      Alert.alert(
        t('search.set_address_title', { name: displayName }),
        t('search.set_address_msg', { name: displayName }),
        [
          { text: t('common.cancel'), style: "cancel" },
          {
            text: t('search.add_address_btn'),
            onPress: () => {
              handleClose();
              navigation.navigate('SavedPlaces', {
                defaultName: displayName,
                defaultType: typeKey
              });
            }
          }
        ]
      );
    }
  };

  const handleClose = () => {
    Keyboard.dismiss();
    onClose();
  };

  const handleRecent = (p) => {
    Keyboard.dismiss();
    const lat = parseFloat(p.lat);
    const lng = parseFloat(p.lng || p.lon);
    setDropoff(p.address || p.name);
    onSelectDestination(p.name, !isNaN(lat) ? lat : 9.5350, !isNaN(lng) ? lng : -13.6773);
  };

  return (
    <View style={styles.container}>
      {/* Header Card */}
      <View style={[styles.header, { paddingTop: Math.max(Platform.OS === 'ios' ? 52 : 36, insets.top + 8) }]}>
        <View style={styles.topRow}>
          <TouchableOpacity style={styles.backBtn} onPress={handleClose}>
            <ArrowLeft size={20} color={C.lux900} />
          </TouchableOpacity>
          <Text style={styles.title}>{initialMode === 'AIRPORT' ? t('search.select_airport') : t('search.plan_route')}</Text>
        </View>

        {/* Inputs with connecting line */}
        <View style={styles.inputsWrapper}>
          <View style={styles.dotsLine}>
            <View style={styles.dotTop} />
            <View style={styles.connector} />
            <View style={styles.dotBottom} />
          </View>

          <View style={styles.inputs}>
            <TextInput
              style={[styles.inputField, styles.inputFieldGray]}
              value={pickup}
              onChangeText={tText => handleSearch(tText, 'pickup')}
              onFocus={() => setFocusedField('pickup')}
              placeholder={t('search.pickup_placeholder')}
              placeholderTextColor={C.gray500}
            />
            <TextInput
              style={[styles.inputField, styles.inputFieldWhite, focusedField === 'dropoff' && styles.inputFocused]}
              value={dropoff}
              onChangeText={tText => handleSearch(tText, 'dropoff')}
              onFocus={() => setFocusedField('dropoff')}
              placeholder={initialMode === 'AIRPORT' ? t('search.search_airport_placeholder') : t('search.dropoff_placeholder')}
              placeholderTextColor={C.gray400}
              autoFocus
            />
          </View>
        </View>
      </View>

      {/* Suggestions or Recent Places */}
      <ScrollView 
        style={styles.body} 
        contentContainerStyle={{ padding: 24, paddingBottom: Math.max(120, insets.bottom + 60) }}
        keyboardShouldPersistTaps="handled"
      >
        {loadingAirports ? (
          <View style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: 48 }}>
            <ActivityIndicator size="large" color={C.gold || '#D97706'} />
            <Text style={{ marginTop: 14, fontSize: 15, fontWeight: '600', color: C.lux900 }}>
              {t('search.finding_airports')}
            </Text>
            <Text style={{ marginTop: 6, fontSize: 13, color: C.gray500 }}>
              {t('search.searching_terminals')}
            </Text>
          </View>
        ) : suggestions.length > 0 ? (
          <>
            {initialMode === 'AIRPORT' && (
              <View style={{ marginBottom: 12 }}>
                <Text style={styles.sectionLabel}>{t('search.nearby_airports')}</Text>
              </View>
            )}
            {suggestions.map(item => (
              <TouchableOpacity key={item.id} style={styles.placeCard} onPress={() => handleSelect(item)}>
                <View style={[styles.placeIconWrap, item.isAirport && { backgroundColor: '#FEF3C7' }]}>
                  {item.isAirport ? (
                    <Plane size={22} color={C.gold || '#D97706'} />
                  ) : (
                    <MapPin size={22} color={C.lux900} />
                  )}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.placeName}>{item.name}</Text>
                  <Text style={styles.placeSub} numberOfLines={1}>{item.full}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </>
        ) : initialMode === 'AIRPORT' ? (
          <View style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: 48 }}>
            <Plane size={36} color={C.gray400} />
            <Text style={{ marginTop: 12, fontSize: 15, fontWeight: '600', color: C.lux900 }}>
              {t('search.no_airports')}
            </Text>
            <Text style={{ marginTop: 6, fontSize: 13, color: C.gray500, textAlign: 'center', paddingHorizontal: 20 }}>
              {t('search.type_airport_hint')}
            </Text>
          </View>
        ) : (
          <>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <Text style={styles.sectionLabel}>{t('search.saved_places')}</Text>
              <TouchableOpacity onPress={() => { handleClose(); navigation.navigate('SavedPlaces'); }}>
                <Text style={{ fontSize: 12, fontWeight: '700', color: C.lux900 }}>{t('common.manage')}</Text>
              </TouchableOpacity>
            </View>

            <View style={{ flexDirection: 'row', gap: 12, marginBottom: 24 }}>
              <TouchableOpacity
                style={[styles.savedPill, findPlace('home')?.address ? styles.savedPillConfigured : null]}
                onPress={() => handleSavedPlacePress('home', t('search.home'))}
                activeOpacity={0.8}
              >
                <View style={[styles.pillIconWrap, findPlace('home')?.address ? styles.pillIconWrapConfigured : null]}>
                  <Home size={16} color={findPlace('home')?.address ? '#05A357' : C.lux900} />
                </View>
                <Text style={styles.pillText}>{t('search.home')}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.savedPill, findPlace('work')?.address ? styles.savedPillConfigured : null]}
                onPress={() => handleSavedPlacePress('work', t('search.work'))}
                activeOpacity={0.8}
              >
                <View style={[styles.pillIconWrap, findPlace('work')?.address ? styles.pillIconWrapConfigured : null]}>
                  <Briefcase size={16} color={findPlace('work')?.address ? '#05A357' : C.lux900} />
                </View>
                <Text style={styles.pillText}>{t('search.work')}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.savedPill, findPlace('mom')?.address ? styles.savedPillConfigured : null]}
                onPress={() => handleSavedPlacePress('mom', t('search.mom'))}
                activeOpacity={0.8}
              >
                <View style={[styles.pillIconWrap, findPlace('mom')?.address ? styles.pillIconWrapConfigured : null]}>
                  <Bookmark size={16} color={findPlace('mom')?.address ? '#05A357' : C.lux900} />
                </View>
                <Text style={styles.pillText}>{t('search.mom')}</Text>
              </TouchableOpacity>
            </View>

            {placesList.length > 0 && (
              <>
                <Text style={styles.sectionLabel}>{t('places.title')}</Text>
                {placesList.map((p, idx) => (
                  <TouchableOpacity key={p.id || idx} style={styles.placeCard} onPress={() => handleRecent(p)}>
                    <View style={styles.placeIconWrap}>
                      <MapPin size={22} color={C.lux900} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.placeName}>{p.name}</Text>
                      <Text style={styles.placeSub} numberOfLines={1}>{p.address || t('places.title')}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </>
            )}
          </>
        )}
      </ScrollView>
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
    backgroundColor: '#F8F9FA', // Enforces solid background over the map
    zIndex: 999, // Forces component to the absolute top layer
    elevation: 99, // Required for Android z-index
  },
  header: {
    backgroundColor: '#fff',
    paddingTop: 52,
    paddingBottom: 24,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 4,
    zIndex: 2
  },
  topRow: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 24 },
  backBtn: { width: 40, height: 40, backgroundColor: '#F3F4F6', borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 28, fontWeight: '800', color: '#111827' },
  inputsWrapper: { flexDirection: 'row', gap: 12 },
  dotsLine: { width: 20, alignItems: 'center', paddingTop: 18, paddingBottom: 18, justifyContent: 'space-between' },
  dotTop: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#111827', zIndex: 1 },
  connector: { width: 2, flex: 1, backgroundColor: '#E5E7EB', marginVertical: 4 },
  dotBottom: { width: 10, height: 10, backgroundColor: '#EAB308', zIndex: 1 },
  inputs: { flex: 1, gap: 12 },
  inputField: { padding: 16, borderRadius: 16, fontSize: 15, fontWeight: '600', color: '#111827' },
  inputFieldGray: { backgroundColor: '#F3F4F6' },
  inputFieldWhite: { backgroundColor: '#fff', borderWidth: 2, borderColor: '#F3F4F6' },
  inputFocused: { borderColor: '#EAB308' },
  body: {
    flex: 1,
    backgroundColor: '#F8F9FA', // Matches container to prevent black bleed-through
  },
  
  savedPill: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 100, padding: 8, paddingRight: 16, gap: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2, borderWidth: 1, borderColor: '#F3F4F6' },
  savedPillConfigured: { borderColor: 'rgba(5, 163, 87, 0.4)', backgroundColor: '#F0FDF4' },
  pillIconWrap: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center' },
  pillIconWrapConfigured: { backgroundColor: 'rgba(5, 163, 87, 0.15)' },
  pillText: { fontSize: 14, fontWeight: '700', color: C.lux900 },
  sectionLabel: { fontSize: 12, fontWeight: '700', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 8 },
  placeCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 24, padding: 16, gap: 16, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 },
  placeIconWrap: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center' },
  placeName: { fontSize: 17, fontWeight: '700', color: '#111827' },
  placeSub: { fontSize: 13, fontWeight: '500', color: '#6B7280', marginTop: 2 },
});