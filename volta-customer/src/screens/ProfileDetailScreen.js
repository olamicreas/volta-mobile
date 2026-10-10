import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, TextInput, Alert, ScrollView, ActivityIndicator, KeyboardAvoidingView, Platform, DeviceEventEmitter } from 'react-native';
import { ArrowLeft, CheckCircle2, User, Mail, Phone, Camera } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import C from '../constants/colors';
import api from '../services/api';

export default function ProfileDetailScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [profilePhoto, setProfilePhoto] = useState(null);

  useEffect(() => {
    DeviceEventEmitter.emit('CANCEL_PROFILE_PROMPT');
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const prof = await api.getProfile();
      setFirstName(prof.first_name || '');
      setLastName(prof.last_name || '');
      setPhone(prof.phone_number || '');
      setEmail(prof.email || '');
      setProfilePhoto(prof.profile_picture_url || null);
    } catch(e) {
      Alert.alert('Error', 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const pickAndUploadPhoto = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Permission Denied', 'Please allow photo gallery access to set your profile picture.');
      return;
    }
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images',
      allowsEditing: true,
      quality: 0.7,
      aspect: [1, 1],
      base64: true,
    });
    if (!res.canceled && res.assets && res.assets[0]?.uri) {
      const asset = res.assets[0];
      setProfilePhoto(asset.uri);
      setUploadingPhoto(true);
      try {
        const uploadRes = await api.uploadProfilePhoto({
          uri: asset.uri,
          base64: asset.base64,
          name: asset.fileName || 'profile.jpg',
          type: asset.mimeType || 'image/jpeg',
        });
        if (uploadRes?.profile_picture_url) {
          setProfilePhoto(uploadRes.profile_picture_url);
        }
        Alert.alert('Success', 'Profile photo updated!');
      } catch (err) {
        Alert.alert('Error', err.message || 'Failed to upload photo to server');
      } finally {
        setUploadingPhoto(false);
      }
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

  const initial = (firstName ? firstName[0] : (phone ? phone[phone.length - 1] : 'U')).toUpperCase();

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

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined} 
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 20 : 0}
      >
        <ScrollView 
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: 24, paddingBottom: Math.max(40, insets.bottom + 24) }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={{ alignItems: 'center', marginBottom: 32 }}>
            <View style={{ position: 'relative' }}>
              {profilePhoto ? (
                <Image source={{ uri: profilePhoto }} style={styles.avatar} />
              ) : (
                <View style={[styles.avatar, styles.initialAvatar]}>
                  <Text style={styles.initialText}>{initial}</Text>
                </View>
              )}
              <TouchableOpacity style={styles.cameraIconBtn} onPress={pickAndUploadPhoto} disabled={uploadingPhoto}>
                {uploadingPhoto ? <ActivityIndicator size="small" color="#fff" /> : <Camera size={18} color="#fff" />}
              </TouchableOpacity>
            </View>
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
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: C.lux900 },
  avatar: { width: 104, height: 104, borderRadius: 52, backgroundColor: '#F3F4F6', borderWidth: 2, borderColor: C.gold },
  initialAvatar: { justifyContent: 'center', alignItems: 'center', backgroundColor: C.lux900 },
  initialText: { fontSize: 36, fontWeight: '800', color: C.gold },
  cameraIconBtn: { position: 'absolute', bottom: 2, right: 2, backgroundColor: C.lux900, width: 34, height: 34, borderRadius: 17, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#fff' },
  label: { fontSize: 12, fontWeight: '700', color: C.gray400, marginBottom: 8, letterSpacing: 1 },
  inputWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, marginBottom: 24, gap: 12 },
  input: { flex: 1, fontSize: 16, fontWeight: '600', color: C.lux900 }
});
