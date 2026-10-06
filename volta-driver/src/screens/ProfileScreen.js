import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, TextInput, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { ArrowLeft, CheckCircle2, User, Mail, Phone } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import C from '../constants/colors';
import api from '../services/api';

export default function ProfileDetailScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const prof = await api.getProfile();
      setFirstName(prof.first_name || '');
      setLastName(prof.last_name || '');
      setPhone(prof.phone_number || '');
      setEmail(prof.email || '');
    } catch(e) {
      Alert.alert('Error', 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.updateProfile({ first_name: firstName, last_name: lastName, email });
      Alert.alert('Success', 'Profile updated successfully!');
      navigation.goBack();
    } catch(e) {
      Alert.alert('Error', 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}><ActivityIndicator size="large" color={C.gold}/></View>;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft size={24} color={C.lux900} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
        <TouchableOpacity onPress={handleSave} disabled={saving}>
          {saving ? <ActivityIndicator color={C.gold} /> : <CheckCircle2 size={24} color={C.gold} />}
        </TouchableOpacity>
      </View>

      <ScrollView style={{ flex: 1, padding: 24 }}>
        <View style={{ alignItems: 'center', marginBottom: 32 }}>
          <Image source={{ uri: `https://api.dicebear.com/7.x/avataaars/png?seed=${firstName}` }} style={styles.avatar} />
        </View>

        <Text style={styles.label}>FIRST NAME</Text>
        <View style={styles.inputWrap}>
          <User size={20} color={C.gray400} />
          <TextInput style={styles.input} value={firstName} onChangeText={setFirstName} />
        </View>
        
        <Text style={styles.label}>LAST NAME</Text>
        <View style={styles.inputWrap}>
          <User size={20} color={C.gray400} />
          <TextInput style={styles.input} value={lastName} onChangeText={setLastName} />
        </View>

        <Text style={styles.label}>EMAIL ADDRESS</Text>
        <View style={styles.inputWrap}>
          <Mail size={20} color={C.gray400} />
          <TextInput style={styles.input} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
        </View>

        <Text style={styles.label}>PHONE NUMBER</Text>
        <View style={[styles.inputWrap, { backgroundColor: '#F3F4F6' }]}>
          <Phone size={20} color={C.gray400} />
          <TextInput style={[styles.input, { color: C.gray400 }]} value={phone} editable={false} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: C.lux900 },
  avatar: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#F9FAFB' },
  label: { fontSize: 12, fontWeight: '700', color: C.gray400, marginBottom: 8, letterSpacing: 1 },
  inputWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, marginBottom: 24, gap: 12 },
  input: { flex: 1, fontSize: 16, fontWeight: '600', color: C.lux900 }
});
