import React, { useRef, useState } from 'react';
import { Image, Alert,
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Dimensions, Animated, KeyboardAvoidingView, Platform, ActivityIndicator
} from 'react-native';
import { ArrowLeft, CheckCircle2, ArrowRight, Camera, FileText, Car, Briefcase } from 'lucide-react-native';
import C from '../constants/colors';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';

const { width, height } = Dimensions.get('window');
const API_URL = process.env.EXPO_PUBLIC_BACKEND_URL || 'http://163.245.215.14:8000';

export default function AuthScreen({ onLogin }) {
  const opacity = useRef(new Animated.Value(1)).current;
  
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState('CHOICE');
  const [isApplying, setIsApplying] = useState(false);
  const [needsCompanyVehicle, setNeedsCompanyVehicle] = useState(false);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const pickImage = async (setter) => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      Alert.alert("Permission Denied", "We need camera roll permissions to upload documents.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images',
      allowsEditing: true,
      quality: 0.5,
    });
    if (!result.canceled) {
      setter(result.assets[0].uri);
    }
  };

  const requestOTP = async () => {
    if (!phone || phone.length < 8) {
      setError('Enter a valid phone number');
      return;
    }
    setLoading(true); setError('');
    try {
      const res = await fetch(`${API_URL}/api/v1/auth/request-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone_number: phone, role: 'DRIVER' })
      });
      if (res.ok) setStep('OTP');
      else {
        const data = await res.json();
        setError(data.detail || 'Failed to send OTP');
      }
    } catch (e) {
      setError('Network error. Check connection.');
    } finally {
      setLoading(false);
    }
  };


  const submitProfile = async () => {
    if (!firstName) {
      setError('First name is required');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/v1/users/me`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${await AsyncStorage.getItem('userToken')}` },
        body: JSON.stringify({ first_name: firstName, last_name: lastName, email: email || null })
      });
      if (res.ok) {
        setStep('OWNERSHIP');
      } else {
        setError('Failed to update profile');
      }
    } catch(e) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  const verifyOTP = async () => {
    if (!otp || otp.length < 4) {
      setError('Enter the 4-digit OTP');
      return;
    }
    setLoading(true); setError('');
    try {
      const res = await fetch(`${API_URL}/api/v1/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone_number: phone, code: otp })
      });
      const data = await res.json();
      
      if (res.ok && data.access_token) {
        await AsyncStorage.setItem('userToken', data.access_token);
        
        try {
            const prof = await api.getProfile();
            if (!prof.first_name || isApplying) {
                if (!prof.first_name && !isApplying) {
                    require('react-native').Alert.alert("Account Not Found", "This phone number isn't registered. Let's get you set up to drive!");
                }
                setStep('PROFILE');
                return;
            }
            Animated.timing(opacity, { toValue: 0, duration: 400, useNativeDriver: true }).start(async () => {
              onLogin(data.access_token);
            });
        } catch(e) {
            setError('Failed to fetch profile. Is the server online?');
            setLoading(false);
            return;
        }
      } else {
        setError(data.detail || 'Invalid OTP');
      }
    } catch (e) {
      setError('Network error. Check connection.');
    } finally {
      setLoading(false);
    }
  };

  
  const [carMake, setCarMake] = useState('');
  const [carPlate, setCarPlate] = useState('');
  const [photoUri, setPhotoUri] = useState(null);
  const [licenseUri, setLicenseUri] = useState(null);
  const [carteGrisUri, setCarteGrisUri] = useState(null);

  const submitVehicle = async () => {
    if (!needsCompanyVehicle && (!carMake || !carPlate)) {
      setError('Car make and plate are required');
      return;
    }
    if (!licenseUri) {
      setError('Driver license is required to proceed');
      return;
    }
    setLoading(true); setError('');
    try {
        const vType = needsCompanyVehicle ? 'COMPANY_PROVIDED' : carMake;
        const vPlate = needsCompanyVehicle ? 'PENDING' : carPlate;
        
        await api.updateProfile({ vehicle_type: vType, license_plate: vPlate });
        await api.uploadDocuments(photoUri, licenseUri, needsCompanyVehicle ? null : carteGrisUri);
        
        Animated.timing(opacity, { toValue: 0, duration: 400, useNativeDriver: true }).start(async () => {
          onLogin(await AsyncStorage.getItem('userToken'));
        });
    } catch(e) {
        setError(e.message || 'Failed to upload documents');
    } finally {
        setLoading(false);
    }
  };

  return (
    <Animated.View style={[StyleSheet.absoluteFill, styles.container, { opacity }]}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.inner}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 0}>
        <View style={styles.card}>
          {step !== 'CHOICE' && (
            <TouchableOpacity style={{ marginBottom: 16 }} onPress={() => {
                if (step === 'PHONE') setStep('CHOICE');
                else if (step === 'OTP') setStep('PHONE');
                else if (step === 'PROFILE') setStep('PHONE');
                else if (step === 'OWNERSHIP') setStep('PROFILE');
                else if (step === 'VEHICLE') setStep('OWNERSHIP');
            }}>
              <ArrowLeft color="#fff" size={24} />
            </TouchableOpacity>
          )}
          <View style={{ alignItems: 'center', marginTop: step === 'CHOICE' ? 16 : 0, marginBottom: 12 }}>
             <Image source={require('../../assets/icon.png')} style={{ width: 80, height: 80, borderRadius: 20 }} resizeMode="contain" />
          </View>
          <Text style={styles.titleLeft}>{step === 'CHOICE' ? 'Welcome to Volta' : step === 'OWNERSHIP' ? 'Vehicle Setup' : step === 'VEHICLE' ? 'Final Details' : isApplying ? 'Apply to Drive' : 'Driver Login'}</Text>
          <Text style={styles.subLeft}>{step === 'CHOICE' ? 'Become a driver or login' : step === 'OWNERSHIP' ? 'How will you drive with us?' : step === 'VEHICLE' ? 'Upload required documents' : isApplying ? 'Join the Volta network.' : 'Enter your phone number to go online.'}</Text>
          
          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          {step === 'CHOICE' ? (
            <>
              <TouchableOpacity style={styles.btnPrimary} onPress={() => { setIsApplying(false); setStep('PHONE'); }}>
                <Text style={styles.btnPrimaryText}>Login</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.btnPrimary, { backgroundColor: '#374151', marginTop: 16 }]} onPress={() => { setIsApplying(true); setStep('PHONE'); }}>
                <Text style={[styles.btnPrimaryText, { color: '#fff' }]}>Apply to Drive</Text>
              </TouchableOpacity>
            </>
          ) : step === 'PHONE' ? (
            <>
              <TextInput 
                style={styles.input} 
                value={phone}
                onChangeText={setPhone}
                placeholder="Phone Number (+224 620 ...)" 
                placeholderTextColor="#9CA3AF" 
                keyboardType="phone-pad" 
              />
              <TouchableOpacity style={styles.btnPrimary} onPress={requestOTP} disabled={loading}>
                {loading ? <ActivityIndicator color="#000" /> : <Text style={styles.btnPrimaryText}>Continue</Text>}
              </TouchableOpacity>
            </>
          
          ) : step === 'PROFILE' ? (
            <>
              <TouchableOpacity style={styles.uploadBtn} onPress={() => pickImage(setPhotoUri)}>
                {photoUri ? (
                    <Image source={{ uri: photoUri }} style={{ width: 100, height: 100, borderRadius: 50, marginBottom: 8 }} />
                ) : <Camera color="#fff" size={32} style={{ marginBottom: 8 }} />}
                <Text style={styles.uploadBtnText}>{photoUri ? 'Change Profile Photo' : 'Upload Profile Photo'}</Text>
                {photoUri && <CheckCircle2 color="#05A357" size={20} style={{ position: 'absolute', top: 12, right: 12 }} />}
              </TouchableOpacity>
              <View style={styles.inputCard}>
                <Text style={styles.inputLabel}>FIRST NAME</Text>
                <TextInput
                  style={styles.input}
                  value={firstName}
                  onChangeText={setFirstName}
                  autoFocus
                  keyboardType="default"
                  placeholder="Sarah"
                  placeholderTextColor="rgba(245,247,250,0.4)"
                  selectionColor={'#D4AF37'}
                />
              </View>
              <View style={styles.inputCard}>
                <Text style={styles.inputLabel}>LAST NAME</Text>
                <TextInput
                  style={styles.input}
                  value={lastName}
                  onChangeText={setLastName}
                  keyboardType="default"
                  placeholder="O."
                  placeholderTextColor="rgba(245,247,250,0.4)"
                  selectionColor={'#D4AF37'}
                />
              </View>

              
              <View style={styles.inputCard}>
                <Text style={styles.inputLabel}>EMAIL ADDRESS</Text>
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="name@example.com"
                  placeholderTextColor="rgba(245,247,250,0.4)"
                  selectionColor={'#D4AF37'}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <TouchableOpacity style={styles.btn} onPress={submitProfile} disabled={loading} activeOpacity={0.88}>
                {loading ? <ActivityIndicator color={'#1A2133'} /> : (
                  <>
                    <Text style={styles.btnText}>Complete Profile</Text>
                    <ArrowRight color={'#1A2133'} size={20} strokeWidth={2.5} />
                  </>
                )}
              </TouchableOpacity>
            </>
                    ) : step === 'OWNERSHIP' ? (
            <>
              <TouchableOpacity style={styles.btnPrimary} onPress={() => { setNeedsCompanyVehicle(false); setStep('VEHICLE'); }}>
                <Car color="#000" size={24} style={{ marginRight: 8 }} />
                <Text style={styles.btnPrimaryText}>I have my own vehicle</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.btnPrimary, { backgroundColor: '#374151', marginTop: 16 }]} onPress={() => { setNeedsCompanyVehicle(true); setStep('VEHICLE'); }}>
                <Briefcase color="#fff" size={24} style={{ marginRight: 8 }} />
                <Text style={[styles.btnPrimaryText, { color: '#fff' }]}>I need a company vehicle</Text>
              </TouchableOpacity>
            </>
          ) : step === 'VEHICLE' ? (
            <>
              {!needsCompanyVehicle && (
                <>
                  <View style={styles.inputCard}>
                    <Text style={styles.inputLabel}>CAR MAKE & MODEL</Text>
                    <TextInput
                      style={styles.input}
                      value={carMake}
                      onChangeText={setCarMake}
                      placeholder="e.g. Toyota Prius 2018"
                      placeholderTextColor="rgba(245,247,250,0.4)"
                      selectionColor={'#D4AF37'}
                    />
                  </View>
                  <View style={styles.inputCard}>
                    <Text style={styles.inputLabel}>LICENSE PLATE</Text>
                    <TextInput
                      style={styles.input}
                      value={carPlate}
                      onChangeText={setCarPlate}
                      placeholder="e.g. RC-1234-A"
                      placeholderTextColor="rgba(245,247,250,0.4)"
                      selectionColor={'#D4AF37'}
                    />
                  </View>
                </>
              )}
              
              <Text style={styles.sectionTitle}>Required Documents</Text>
              
              <TouchableOpacity style={[styles.uploadBtn, { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20 }]} onPress={() => pickImage(setLicenseUri)}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <FileText color="#9CA3AF" size={20} />
                  <Text style={styles.uploadBtnText}>{licenseUri ? 'Driver License Uploaded' : 'Upload Driver License'}</Text>
                </View>
                {licenseUri ? <Image source={{uri: licenseUri}} style={{width: 40, height: 30, borderRadius: 4}} /> : null}
              </TouchableOpacity>
              
              {!needsCompanyVehicle && (
                  <TouchableOpacity style={[styles.uploadBtn, { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20 }]} onPress={() => pickImage(setCarteGrisUri)}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                      <FileText color="#9CA3AF" size={20} />
                      <Text style={styles.uploadBtnText}>{carteGrisUri ? 'Vehicle Registration Uploaded' : 'Upload Vehicle Registration'}</Text>
                    </View>
                    {carteGrisUri ? <Image source={{uri: carteGrisUri}} style={{width: 40, height: 30, borderRadius: 4}} /> : null}
                  </TouchableOpacity>
              )}

              <TouchableOpacity style={[styles.btnPrimary, {marginTop: 24}]} onPress={submitVehicle} disabled={loading}>
                {loading ? <ActivityIndicator color="#000" /> : <Text style={styles.btnPrimaryText}>Finish Setup</Text>}
              </TouchableOpacity>
            </>
          ) : (

            <>
              <TextInput 
                style={styles.input} 
                value={otp}
                onChangeText={setOtp}
                placeholder="Enter 4-digit OTP" 
                placeholderTextColor="#9CA3AF" 
                keyboardType="number-pad"
                maxLength={4} 
                autoFocus
              />
              <TouchableOpacity style={styles.btnPrimary} onPress={verifyOTP} disabled={loading}>
                {loading ? <ActivityIndicator color="#000" /> : <Text style={styles.btnPrimaryText}>Verify & Login</Text>}
              </TouchableOpacity>
            </>
          )}
        </View>
      </KeyboardAvoidingView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { position: 'absolute', top: 0, left: 0, width: width, height: height, backgroundColor: '#0B101E', justifyContent: 'center', alignItems: 'center', zIndex: 999, elevation: 99 },
  inner: { width: '100%', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 },
  card: { width: '100%', maxWidth: 400, backgroundColor: '#1A2133', borderRadius: 24, padding: 32, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  titleLeft: { fontSize: 26, fontWeight: '800', color: '#fff', marginBottom: 8, marginTop: 12 },
  subLeft: { fontSize: 15, color: '#9CA3AF', marginBottom: 32 },
  errorText: { color: '#ef4444', marginBottom: 12, fontWeight: '600', fontSize: 14 },
  input: { width: '100%', backgroundColor: '#0B101E', borderRadius: 12, paddingHorizontal: 16, height: 56, fontSize: 16, color: '#fff', marginBottom: 16, borderWidth: 1, borderColor: '#374151' },
  btnPrimary: { width: '100%', backgroundColor: '#fff', borderRadius: 16, paddingVertical: 18, alignItems: 'center', marginTop: 8 },
  btnPrimaryText: { fontSize: 16, fontWeight: '800', color: '#000' },
  uploadBtn: { width: '100%', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 12, paddingVertical: 16, alignItems: 'center', marginBottom: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', borderStyle: 'dashed' },
  uploadBtnText: { color: '#fff', fontWeight: '600', fontSize: 14 },
  sectionTitle: { color: '#9CA3AF', fontSize: 12, fontWeight: '700', marginBottom: 12, width: '100%', textTransform: 'uppercase' },
  inputCard: { width: '100%', marginBottom: 16 },
  inputLabel: { color: '#9CA3AF', fontSize: 12, fontWeight: '600', marginBottom: 8 },
  btn: { width: '100%', backgroundColor: '#fff', borderRadius: 16, paddingVertical: 18, alignItems: 'center', marginTop: 8, flexDirection: 'row', justifyContent: 'center', gap: 8 },
  btnText: { fontSize: 16, fontWeight: '800', color: '#000' },
});
