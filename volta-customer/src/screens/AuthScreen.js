import React, { useRef, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Dimensions, Animated, KeyboardAvoidingView, Platform, ActivityIndicator
} from 'react-native';
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
  const opacity = useRef(new Animated.Value(1)).current;
  
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
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.inner}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 0}
      >
        <View style={styles.card}>
          <View style={[styles.iconBox, { backgroundColor: '#000', overflow: 'hidden', padding: 0 }]}>
            <RNImage source={require('../../assets/icon.png')} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
          </View>

          <Text style={styles.logo}>Volta</Text>
          <Text style={styles.tagline}>The luxury ride experience.</Text>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          {step === 'PHONE' ? (
            <>
              <View style={styles.inputCard}>
                <Text style={styles.inputLabel}>PHONE NUMBER</Text>
                <TextInput
                  style={styles.input}
                  value={phone}
                  onChangeText={setPhone}
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
                  autoFocus
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
                  onChangeText={setOtp}
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
      </KeyboardAvoidingView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { position: 'absolute', top: 0, left: 0, width: width, height: height, backgroundColor: C.lux900, justifyContent: 'center', alignItems: 'center', zIndex: 999, elevation: 99 },
  inner: { width: '100%', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24 },
  card: { width: '100%', maxWidth: 400, alignItems: 'center' },
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
