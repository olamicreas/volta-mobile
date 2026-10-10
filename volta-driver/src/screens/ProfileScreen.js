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
  const [category, setCategory] = useState(null);
  const [onboardingStatus, setOnboardingStatus] = useState('INCOMPLETE');

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
      setCategory(prof.driver_category || null);
      setOnboardingStatus(prof.onboarding_status || 'INCOMPLETE');
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

  if (loading) return <View style={{flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0B101E'}}><ActivityIndicator size="large" color={C.gold}/></View>;

  const initial = (firstName ? firstName[0] : (phone ? phone[phone.length - 1] : 'D')).toUpperCase();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Driver Profile</Text>
        <TouchableOpacity onPress={handleSave} disabled={saving}>
          {saving ? <ActivityIndicator color={C.gold} /> : <CheckCircle2 size={24} color="#05A357" />}
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
          {/* Profile Avatar with Camera Button */}
          <View style={{ alignItems: 'center', marginBottom: 24 }}>
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

            <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
              <View style={[styles.badge, { backgroundColor: '#1E293B' }]}>
                <Text style={styles.badgeText}>
                  {category === 'COMPANY_CAR' ? 'Fleet Chauffeur' : 'Personal Vehicle Chauffeur'}
                </Text>
              </View>
              <View style={[
                styles.badge, 
                { backgroundColor: onboardingStatus === 'APPROVED' ? '#05A357' : onboardingStatus === 'REJECTED' ? '#EF4444' : '#B45309' }
              ]}>
                <Text style={styles.badgeText}>
                  {onboardingStatus === 'APPROVED' ? 'Verified' : onboardingStatus === 'REJECTED' ? 'Rejected' : 'Under Review'}
                </Text>
              </View>
            </View>
          </View>

          <Text style={styles.label}>FIRST NAME</Text>
          <View style={styles.inputWrap}>
            <User size={20} color="#9CA3AF" />
            <TextInput 
              style={styles.input} 
              value={firstName} 
              onChangeText={setFirstName} 
              placeholder="First Name" 
              placeholderTextColor="rgba(245,247,250,0.4)" 
              selectionColor="#D4AF37" 
            />
          </View>
          
          <Text style={styles.label}>LAST NAME</Text>
          <View style={styles.inputWrap}>
            <User size={20} color="#9CA3AF" />
            <TextInput 
              style={styles.input} 
              value={lastName} 
              onChangeText={setLastName} 
              placeholder="Last Name" 
              placeholderTextColor="rgba(245,247,250,0.4)" 
              selectionColor="#D4AF37" 
            />
          </View>

          <Text style={styles.label}>EMAIL ADDRESS</Text>
          <View style={styles.inputWrap}>
            <Mail size={20} color="#9CA3AF" />
            <TextInput 
              style={styles.input} 
              value={email} 
              onChangeText={setEmail} 
              keyboardType="email-address" 
              autoCapitalize="none" 
              placeholder="driver@example.com" 
              placeholderTextColor="rgba(245,247,250,0.4)" 
              selectionColor="#D4AF37" 
            />
          </View>

          <Text style={styles.label}>PHONE NUMBER</Text>
          <View style={[styles.inputWrap, styles.inputWrapDisabled]}>
            <Phone size={20} color="#6B7280" />
            <TextInput 
              style={[styles.input, styles.inputDisabled]} 
              value={phone} 
              editable={false} 
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B101E' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.08)' },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#fff' },
  avatar: { width: 104, height: 104, borderRadius: 52, backgroundColor: '#1E293B', borderWidth: 2, borderColor: '#D4AF37' },
  initialAvatar: { justifyContent: 'center', alignItems: 'center', backgroundColor: '#1E293B' },
  initialText: { fontSize: 36, fontWeight: '800', color: '#D4AF37' },
  cameraIconBtn: { position: 'absolute', bottom: 2, right: 2, backgroundColor: '#05A357', width: 34, height: 34, borderRadius: 17, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#0B101E' },
  badge: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 100 },
  badgeText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  label: { fontSize: 12, fontWeight: '700', color: '#9CA3AF', marginBottom: 8, letterSpacing: 1 },
  inputWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', borderRadius: 14, paddingHorizontal: 16, paddingVertical: 14, marginBottom: 20, gap: 12 },
  inputWrapDisabled: { backgroundColor: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.05)' },
  input: { flex: 1, fontSize: 16, fontWeight: '600', color: '#fff' },
  inputDisabled: { color: '#6B7280' }
});
