import React, { useRef, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Dimensions, Animated, KeyboardAvoidingView, Platform, ActivityIndicator, ScrollView, Keyboard
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Crown, ArrowRight, CheckCircle2 } from 'lucide-react-native';
import { Image as RNImage } from 'react-native';
import api from '../services/api';
import C from '../constants/colors';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

// Automatically point to the FastAPI backend
const API_URL = process.env.EXPO_PUBLIC_BACKEND_URL || 'http://163.245.215.14:8000';

export default function AuthScreen({ onLogin }) {
  const insets = useSafeAreaInsets();
  const opacity = useRef(new Animated.Value(1)).current;
  const scrollViewRef = useRef(null);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  React.useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSub = Keyboard.addListener(showEvent, (e) => {
      setKeyboardVisible(true);
      const kh = e?.endCoordinates?.height || 280;
      setKeyboardHeight(kh);
    });
    const hideSub = Keyboard.addListener(hideEvent, () => {
      setKeyboardVisible(false);
      setKeyboardHeight(0);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);
  
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState('PHONE');

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const requestOTP = async () => {
    if (!phone || phone.length < 8) {
      setError('Enter a valid phone number');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/api/v1/auth/request-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone_number: phone, role: 'CUSTOMER' })
      });
      if (res.ok) {
        setStep('OTP');
      } else {
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
        Animated.timing(opacity, { toValue: 0, duration: 400, useNativeDriver: true }).start(async () => {
          onLogin(await AsyncStorage.getItem('userToken'));
        });
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
    Keyboard.dismiss();
    if (!otp || otp.length < 4) {
      setError('Enter the 4-digit OTP');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/api/v1/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone_number: phone, code: otp })
      });
      const data = await res.json();
      
      if (res.ok && data.access_token) {
        await AsyncStorage.setItem('userToken', data.access_token);
        
        // Fetch profile to see if new user
        try {
            const prof = await api.getProfile();
            if (!prof.first_name) {
                Keyboard.dismiss();
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

  return (
    <Animated.View style={[StyleSheet.absoluteFill, styles.container, { opacity }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.inner}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 20 : 0}
      >
        <ScrollView
          ref={scrollViewRef}
          style={{ width: '100%' }}
          contentContainerStyle={[
            styles.scrollContent,
            {
              paddingTop: keyboardVisible
                ? Math.max(16, insets.top + 8)
                : Math.max(30, insets.top + 16),
              paddingBottom: Math.max(24, insets.bottom + 20) + (keyboardVisible ? (Platform.OS === 'android' ? (keyboardHeight || 280) + 40 : 40) : 0),
              justifyContent: keyboardVisible ? 'flex-start' : 'center',
            }
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          <View style={styles.card}>
            <View style={[
              styles.iconBox,
              {
                backgroundColor: '#000',
                overflow: 'hidden',
                padding: 0,
                width: keyboardVisible ? 54 : 80,
                height: keyboardVisible ? 54 : 80,
                borderRadius: keyboardVisible ? 16 : 24,
                marginBottom: keyboardVisible ? 10 : 28,
              }
            ]}>
              <RNImage source={require('../../assets/icon.png')} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
            </View>

            <Text style={[styles.logo, keyboardVisible && { fontSize: 28, marginBottom: 4 }]}>Volta</Text>
            {!keyboardVisible && (
              <Text style={styles.tagline}>The luxury ride experience.</Text>
            )}

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            {step === 'PHONE' ? (
              <>
                <View style={styles.inputCard}>
                  <Text style={styles.inputLabel}>PHONE NUMBER</Text>
                  <TextInput
                    style={styles.input}
                    value={phone}
                    onChangeText={setPhone}
                    onFocus={() => setKeyboardVisible(true)}
                    keyboardType="phone-pad"
                    placeholder="e.g. +224 620 000 000"
                    placeholderTextColor="rgba(245,247,250,0.4)"
                    selectionColor={C.gold}
                  />
                </View>

                <TouchableOpacity style={styles.btn} onPress={requestOTP} disabled={loading} activeOpacity={0.88}>
                  {loading ? <ActivityIndicator color={C.lux900} /> : (
                    <>
                      <Text style={styles.btnText}>Continue</Text>
                      <ArrowRight color={C.lux900} size={20} strokeWidth={2.5} />
                    </>
                  )}
                </TouchableOpacity>
              </>
            
            ) : step === 'PROFILE' ? (
              <>
                <View style={styles.inputCard}>
                  <Text style={styles.inputLabel}>FIRST NAME</Text>
                  <TextInput
                    style={styles.input}
                    value={firstName}
                    onChangeText={setFirstName}
                    onFocus={() => setKeyboardVisible(true)}
                    keyboardType="default"
                    placeholder="James"
                    placeholderTextColor="rgba(245,247,250,0.4)"
                    selectionColor={C.gold}
                  />
                </View>
                <View style={styles.inputCard}>
                  <Text style={styles.inputLabel}>LAST NAME</Text>
                  <TextInput
                    style={styles.input}
                    value={lastName}
                    onChangeText={setLastName}
                    onFocus={() => setKeyboardVisible(true)}
                    keyboardType="default"
                    placeholder="Carter"
                    placeholderTextColor="rgba(245,247,250,0.4)"
                    selectionColor={C.gold}
                  />
                </View>

                
                <View style={styles.inputCard}>
                  <Text style={styles.inputLabel}>EMAIL ADDRESS</Text>
                  <TextInput
                    style={styles.input}
                    value={email}
                    onChangeText={setEmail}
                    onFocus={() => setKeyboardVisible(true)}
                    placeholder="name@example.com"
                    placeholderTextColor="rgba(245,247,250,0.4)"
                    selectionColor={'#D4AF37'}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>

                <TouchableOpacity style={styles.btn} onPress={submitProfile} disabled={loading} activeOpacity={0.88}>
                  {loading ? <ActivityIndicator color={C.lux900} /> : (
                    <>
                      <Text style={styles.btnText}>Complete Profile</Text>
                      <ArrowRight color={C.lux900} size={20} strokeWidth={2.5} />
                    </>
                  )}
                </TouchableOpacity>
              </>
            ) : (

              <>
                <View style={styles.inputCard}>
                  <Text style={styles.inputLabel}>ENTER OTP CODE</Text>
                  <TextInput
                    style={styles.input}
                    value={otp}
                    onChangeText={(val) => {
                      setOtp(val);
                      if (val.length === 4) {
                        Keyboard.dismiss();
                      }
                    }}
                    onFocus={() => setKeyboardVisible(true)}
                    keyboardType="number-pad"
                    placeholder="0000"
                    maxLength={4}
                    placeholderTextColor="rgba(245,247,250,0.4)"
                    selectionColor={C.gold}
                    autoFocus
                  />
                </View>

                <TouchableOpacity style={styles.btn} onPress={verifyOTP} disabled={loading} activeOpacity={0.88}>
                  {loading ? <ActivityIndicator color={C.lux900} /> : (
                    <>
                      <Text style={styles.btnText}>Verify & Login</Text>
                      <CheckCircle2 color={C.lux900} size={20} strokeWidth={2.5} />
                    </>
                  )}
                </TouchableOpacity>
              </>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
    backgroundColor: C.lux900,
    zIndex: 999,
    elevation: 99
  },
  inner: { flex: 1, width: '100%' },
  scrollContent: { flexGrow: 1, alignItems: 'center', paddingHorizontal: 24 },
  card: { width: '100%', maxWidth: 420, alignItems: 'center' },
  iconBox: { width: 80, height: 80, borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginBottom: 28, shadowColor: C.gold, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.6, shadowRadius: 20, elevation: 12 },
  logo: { fontSize: 40, fontWeight: '800', color: '#fff', letterSpacing: 2, marginBottom: 8 },
  tagline: { fontSize: 17, color: 'rgba(245,247,250,0.65)', fontWeight: '500', marginBottom: 30, textAlign: 'center' },
  errorText: { color: '#ef4444', marginBottom: 12, fontWeight: '600', fontSize: 14, textAlign: 'center' },
  inputCard: { width: '100%', backgroundColor: C.lux800, borderRadius: 18, paddingHorizontal: 16, paddingTop: 12, paddingBottom: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)', marginBottom: 16 },
  inputLabel: { fontSize: 10, fontWeight: '700', color: 'rgba(245,247,250,0.45)', letterSpacing: 1.5, marginBottom: 6 },
  input: { fontSize: 19, fontWeight: '600', color: '#fff', padding: 0 },
  btn: { width: '100%', backgroundColor: '#fff', borderRadius: 18, paddingVertical: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, marginTop: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.25, shadowRadius: 20, elevation: 10 },
  btnText: { fontSize: 18, fontWeight: '800', color: C.lux900 },
});
