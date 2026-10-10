import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator,
  Alert, TextInput, KeyboardAvoidingView, Platform, DeviceEventEmitter
} from 'react-native';
import { ArrowLeft, Home, Briefcase, Plus, MapPin, Check, Bookmark } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import C from '../constants/colors';
import api from '../services/api';

export default function SavedPlacesScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [addressSuggestions, setAddressSuggestions] = useState([]);
  const [selectedCoords, setSelectedCoords] = useState(null);
  const searchTimeout = useRef(null);

  useEffect(() => {
    loadPlaces();
  }, []);

  useEffect(() => {
    if (route?.params?.defaultName) {
      setIsAdding(true);
      setNewName(route.params.defaultName);
    }
  }, [route?.params]);

  useEffect(() => {
    return () => {
      if (searchTimeout.current) clearTimeout(searchTimeout.current);
    };
  }, []);

  const loadPlaces = async () => {
    try {
      const p = await api.getPlaces();
      if (Array.isArray(p)) setPlaces(p);
    } catch(e) {
      console.log('Error fetching places:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleAddressChange = (text) => {
    setNewAddress(text);
    setSelectedCoords(null);
    if (text.length < 3) {
      setAddressSuggestions([]);
      return;
    }
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(async () => {
      try {
        const res = await fetch(`https://photon.komoot.io/api/?q=${encodeURIComponent(text)}&limit=5`);
        const data = await res.json();
        if (data.features) {
          setAddressSuggestions(data.features.map(f => {
            const p = f.properties;
            const full = [p.name, p.street, p.city, p.state, p.country].filter(Boolean).join(', ');
            return {
              id: String(p.osm_id),
              name: p.name || full.split(',')[0],
              full: full,
              lat: String(f.geometry.coordinates[1]),
              lng: String(f.geometry.coordinates[0]),
            };
          }));
        }
      } catch (err) {}
    }, 350);
  };

  const selectSuggestion = (s) => {
    setNewAddress(s.full || s.name);
    setSelectedCoords({ lat: s.lat, lng: s.lng });
    setAddressSuggestions([]);
  };

  const handleAdd = async () => {
    if (!newName || !newName.trim()) return Alert.alert('Error', 'Please enter a name for the place');
    if (!newAddress || !newAddress.trim()) return Alert.alert('Error', 'Please enter an actual address');

    try {
      setLoading(true);
      let lat = selectedCoords?.lat;
      let lng = selectedCoords?.lng;

      if (!lat || !lng) {
        try {
          const geoRes = await fetch(`https://photon.komoot.io/api/?q=${encodeURIComponent(newAddress.trim())}&limit=1`);
          const geoData = await geoRes.json();
          if (geoData?.features?.[0]?.geometry?.coordinates) {
            const c = geoData.features[0].geometry.coordinates;
            lng = String(c[0]);
            lat = String(c[1]);
          }
        } catch (e) {}
      }

      const lower = newName.toLowerCase().trim();
      const placeType = lower === 'home' ? 'home' : (lower === 'work' ? 'work' : (lower.includes('mom') ? 'mom' : 'other'));

      await api.addPlace({
        name: newName.trim(),
        address: newAddress.trim(),
        lat: lat || "9.5350",
        lng: lng || "-13.6773",
        place_type: placeType
      });

      DeviceEventEmitter.emit('PLACES_UPDATED');
      setIsAdding(false);
      setNewName('');
      setNewAddress('');
      setSelectedCoords(null);
      setAddressSuggestions([]);
      await loadPlaces();
      Alert.alert('Address Saved', `${newName.trim()} address saved successfully!`, [
        { text: 'Done', onPress: () => navigation.goBack() }
      ]);
    } catch(e) {
      Alert.alert('Error', 'Failed to add place');
    } finally {
      setLoading(false);
    }
  };

  const renderIcon = (type, name) => {
    const t = (type || '').toLowerCase();
    const n = (name || '').toLowerCase();
    if (t === 'home' || n === 'home') return <Home size={20} color={C.lux900} />;
    if (t === 'work' || n === 'work') return <Briefcase size={20} color={C.lux900} />;
    if (t === 'mom' || n.includes('mom')) return <Bookmark size={20} color={C.lux900} />;
    return <MapPin size={20} color={C.lux900} />;
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft size={24} color={C.lux900} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Saved Places</Text>
        <View style={{width: 40}} />
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined} 
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 20 : 0}
      >
        <ScrollView 
          style={{ flex: 1, backgroundColor: '#F9FAFB' }}
          contentContainerStyle={{ paddingBottom: Math.max(32, insets.bottom + 20) }}
          keyboardShouldPersistTaps="handled"
        >
        {isAdding ? (
          <View style={styles.addCard}>
            <Text style={styles.addTitle}>Add or Update Place</Text>
            <TextInput
              style={styles.input}
              placeholder="Name (e.g. Home, Work, Mom's House)"
              placeholderTextColor="#9CA3AF"
              value={newName}
              onChangeText={setNewName}
            />
            <TextInput
              style={styles.input}
              placeholder="Address (search or enter location)"
              placeholderTextColor="#9CA3AF"
              value={newAddress}
              onChangeText={handleAddressChange}
            />

            {addressSuggestions.length > 0 && (
              <View style={styles.suggestionsContainer}>
                {addressSuggestions.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    style={styles.suggestionRow}
                    onPress={() => selectSuggestion(item)}
                  >
                    <MapPin size={16} color={C.lux900} style={{ marginRight: 8, marginTop: 2 }} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.suggestionName}>{item.name}</Text>
                      <Text style={styles.suggestionFull} numberOfLines={1}>{item.full}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            <View style={{ flexDirection: 'row', gap: 10, marginTop: 12 }}>
              <TouchableOpacity style={styles.btn} onPress={handleAdd}>
                <Text style={{ color: '#fff', fontWeight: 'bold' }}>Save Address</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.btn, { backgroundColor: '#E5E7EB' }]} onPress={() => {
                setIsAdding(false);
                setAddressSuggestions([]);
              }}>
                <Text style={{ color: '#374151', fontWeight: 'bold' }}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : null}

        {loading && !isAdding ? <ActivityIndicator size="large" color={C.lux900} style={{ marginTop: 40 }} /> : (
          <View style={styles.listGroup}>
            {places.map((p, i) => (
              <View key={p.id || i}>
                <TouchableOpacity
                  style={styles.row}
                  onPress={() => {
                    Alert.alert(
                      p.name,
                      p.address,
                      [
                        { text: "Cancel", style: "cancel" },
                        {
                          text: "Set as Destination",
                          onPress: () => {
                            DeviceEventEmitter.emit('SELECT_SAVED_PLACE', p);
                            navigation.goBack();
                          }
                        }
                      ]
                    );
                  }}
                >
                  <View style={styles.iconWrap}>{renderIcon(p.place_type, p.name)}</View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.rowTitle}>{p.name}</Text>
                    <Text style={styles.rowSub} numberOfLines={1}>{p.address}</Text>
                  </View>
                </TouchableOpacity>
                {i < places.length - 1 && <View style={styles.divider} />}
              </View>
            ))}
            
            {places.length > 0 && <View style={styles.divider} />}
            <TouchableOpacity style={styles.row} onPress={() => {
              setIsAdding(true);
              setNewName('');
              setNewAddress('');
              setSelectedCoords(null);
              setAddressSuggestions([]);
            }}>
              <View style={styles.iconWrap}><Plus size={20} color={C.lux900} /></View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.rowTitle, { color: C.lux900 }]}>Add a new place</Text>
              </View>
            </TouchableOpacity>
          </View>
        )}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#F3F4F6', backgroundColor: '#fff' },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: C.lux900 },
  addCard: { padding: 20, backgroundColor: '#fff', borderBottomWidth: 1, borderColor: '#eee' },
  addTitle: { fontWeight: '700', fontSize: 16, marginBottom: 12, color: C.lux900 },
  listGroup: { backgroundColor: '#fff', borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#F3F4F6' },
  row: { flexDirection: 'row', alignItems: 'center', padding: 16, paddingHorizontal: 20 },
  iconWrap: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#F9FAFB', alignItems: 'center', justifyContent: 'center', marginRight: 16 },
  rowTitle: { fontSize: 16, fontWeight: '600', color: C.lux900, marginBottom: 2 },
  rowSub: { fontSize: 13, color: '#6B7280' },
  divider: { height: 1, backgroundColor: '#F3F4F6', marginLeft: 76 },
  input: { borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, padding: 14, marginBottom: 10, fontSize: 15, color: '#111827', backgroundColor: '#F9FAFB' },
  btn: { flex: 1, padding: 14, backgroundColor: C.lux900, borderRadius: 12, alignItems: 'center' },
  suggestionsContainer: { backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB', marginBottom: 10, overflow: 'hidden' },
  suggestionRow: { flexDirection: 'row', alignItems: 'flex-start', padding: 12, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  suggestionName: { fontSize: 14, fontWeight: '700', color: '#111827' },
  suggestionFull: { fontSize: 12, color: '#6B7280', marginTop: 2 }
});
