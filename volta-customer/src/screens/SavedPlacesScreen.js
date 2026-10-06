import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Alert, TextInput } from 'react-native';
import { ArrowLeft, Home, Briefcase, Plus, MapPin, Check } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import C from '../constants/colors';
import api from '../services/api';

export default function SavedPlacesScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newAddress, setNewAddress] = useState('');

  useEffect(() => {
    loadPlaces();
  }, []);

  const loadPlaces = async () => {
    try {
      const p = await api.getPlaces();
      setPlaces(p);
    } catch(e) {
      console.log('Error fetching places:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!newName || !newAddress) return Alert.alert('Error', 'Please fill in both fields');
    try {
      setLoading(true);
      await api.addPlace({
        name: newName,
        address: newAddress,
        lat: "9.5092",
        lng: "-13.7122",
        place_type: newName.toLowerCase() === 'home' ? 'home' : newName.toLowerCase() === 'work' ? 'work' : 'other'
      });
      setIsAdding(false);
      setNewName('');
      setNewAddress('');
      await loadPlaces();
    } catch(e) {
      Alert.alert('Error', 'Failed to add place');
      setLoading(false);
    }
  };

  const renderIcon = (type) => {
    if (type === 'home') return <Home size={20} color={C.lux900} />;
    if (type === 'work') return <Briefcase size={20} color={C.lux900} />;
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

      <ScrollView style={{ flex: 1, backgroundColor: '#F9FAFB' }}>
        {isAdding ? (
          <View style={{ padding: 20, backgroundColor: '#fff', borderBottomWidth: 1, borderColor: '#eee' }}>
            <Text style={{ fontWeight: '700', marginBottom: 10 }}>Add New Place</Text>
            <TextInput style={styles.input} placeholder="Name (e.g. Home, Gym)" value={newName} onChangeText={setNewName} />
            <TextInput style={styles.input} placeholder="Address" value={newAddress} onChangeText={setNewAddress} />
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
              <TouchableOpacity style={styles.btn} onPress={handleAdd}><Text style={{ color: '#fff', fontWeight: 'bold' }}>Save</Text></TouchableOpacity>
              <TouchableOpacity style={[styles.btn, { backgroundColor: '#eee' }]} onPress={() => setIsAdding(false)}><Text style={{ color: '#333', fontWeight: 'bold' }}>Cancel</Text></TouchableOpacity>
            </View>
          </View>
        ) : null}

        {loading && !isAdding ? <ActivityIndicator size="large" color={C.lux900} style={{ marginTop: 40 }} /> : (
          <View style={styles.listGroup}>
            {places.map((p, i) => (
              <View key={i}>
                <TouchableOpacity style={styles.row}>
                  <View style={styles.iconWrap}>{renderIcon(p.place_type)}</View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.rowTitle}>{p.name}</Text>
                    <Text style={styles.rowSub}>{p.address}</Text>
                  </View>
                </TouchableOpacity>
                {i < places.length - 1 && <View style={styles.divider} />}
              </View>
            ))}
            
            {places.length > 0 && <View style={styles.divider} />}
            <TouchableOpacity style={styles.row} onPress={() => setIsAdding(true)}>
              <View style={styles.iconWrap}><Plus size={20} color={C.lux900} /></View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.rowTitle, { color: C.lux900 }]}>Add a new place</Text>
              </View>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#F3F4F6', backgroundColor: '#fff' },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: C.lux900 },
  listGroup: { backgroundColor: '#fff', borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#F3F4F6' },
  row: { flexDirection: 'row', alignItems: 'center', padding: 16, paddingHorizontal: 20 },
  iconWrap: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#F9FAFB', alignItems: 'center', justifyContent: 'center', marginRight: 16 },
  rowTitle: { fontSize: 16, fontWeight: '600', color: C.lux900, marginBottom: 2 },
  rowSub: { fontSize: 13, color: '#6B7280' },
  divider: { height: 1, backgroundColor: '#F3F4F6', marginLeft: 76 },
  input: { borderWidth: 1, borderColor: '#eee', borderRadius: 8, padding: 12, marginBottom: 10 },
  btn: { flex: 1, padding: 14, backgroundColor: C.lux900, borderRadius: 8, alignItems: 'center' }
});
