import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, Dimensions, ScrollView, Linking, Alert, Keyboard
} from 'react-native';
import { ArrowLeft, Send, Phone, User as UserIcon, Check } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import C from '../constants/colors';
import socket from '../services/socket';
import api from '../services/api';

const { width } = Dimensions.get('window');

const QUICK_REPLIES = [
  "I'm outside waiting",
  "Be right there in 2 mins",
  "Where are you?",
  "Traffic is heavy here",
  "Thanks, see you soon!"
];

export default function ChatScreen({ onClose, role = 'CUSTOMER', trip, messages = [], setMessages }) {
  const tripId = trip?.trip_id || trip?.id;
  const driverName = trip?.driver?.name || 'Chauffeur';
  const driverVehicle = trip?.driver?.vehicle ? `${trip.driver.vehicle} · ${trip?.driver?.plate || ''}` : 'Volta Driver';
  const [text, setText] = useState('');
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const insets = useSafeAreaInsets();
  const scrollViewRef = useRef(null);

  useEffect(() => {
    const showSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      () => {
        setKeyboardVisible(true);
        setTimeout(() => {
          scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 100);
      }
    );
    const hideSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        setKeyboardVisible(false);
      }
    );
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  // Fetch persisted history on mount and merge
  useEffect(() => {
    let isMounted = true;
    async function loadHistory() {
      if (!tripId) return;
      setIsLoadingHistory(true);
      try {
        const history = await api.getTripMessages(tripId);
        if (isMounted && Array.isArray(history) && history.length > 0) {
          setMessages(prev => {
            const merged = [...prev];
            for (const h of history) {
              if (!merged.some(m => m.id === h.id || (m.client_id && m.client_id === h.id))) {
                merged.push(h);
              }
            }
            return merged.sort((a, b) => new Date(a.created_at || 0) - new Date(b.created_at || 0));
          });
        }
      } catch (e) {
        console.warn('[Chat] History load failed:', e);
      } finally {
        if (isMounted) setIsLoadingHistory(false);
      }
    }
    loadHistory();
    return () => { isMounted = false; };
  }, [tripId]);

  // Auto-scroll when messages change
  useEffect(() => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages.length]);

  const handleSend = (contentToSend) => {
    const msgText = (contentToSend || text).trim();
    if (!msgText) return;

    const clientId = 'c_' + Date.now();
    const recipientId = trip?.driver?.id || trip?.driver_id;

    const newMsg = {
      id: clientId,
      client_id: clientId,
      trip_id: tripId,
      sender_role: 'CUSTOMER',
      sender_name: 'Passenger',
      recipient_id: recipientId,
      text: msgText,
      created_at: new Date().toISOString()
    };

    setMessages(prev => [...prev, newMsg]);
    socket.emit('send_message', newMsg);
    setText('');
  };

  const formatTime = (isoString) => {
    if (!isoString) return '';
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return '';
    }
  };

  return (
    <View style={styles.container}>
      {/* ── HEADER ──────────────────────────────────── */}
      <View style={[styles.header, { paddingTop: Math.max(Platform.OS === 'ios' ? 54 : 36, insets.top) }]}>
        <TouchableOpacity onPress={onClose} style={styles.backBtn} activeOpacity={0.7}>
          <ArrowLeft size={22} color={C.lux900} />
        </TouchableOpacity>

        <View style={styles.headerInfo}>
          <View style={styles.avatarCircle}>
            {trip?.driver?.photo ? (
              <Image source={{ uri: trip.driver.photo }} style={{ width: 38, height: 38, borderRadius: 19 }} />
            ) : (
              <UserIcon size={18} color={C.lux900} />
            )}
          </View>
          <View>
            <Text style={styles.headerTitle} numberOfLines={1}>{driverName}</Text>
            <Text style={styles.headerSub} numberOfLines={1}>{driverVehicle}</Text>
          </View>
        </View>

        <TouchableOpacity 
          style={styles.callBtn} 
          activeOpacity={0.8}
          onPress={async () => {
            const phone = trip?.driver?.phone;
            if (!phone) {
              Alert.alert('Phone Unavailable', 'The driver has not provided a contact number.');
              return;
            }
            const clean = phone.replace(/[^\d+]/g, '');
            const url = `tel:${clean}`;
            try {
              const supported = await Linking.canOpenURL(url);
              if (supported) {
                await Linking.openURL(url);
              } else {
                Alert.alert('Call Not Supported', `Phone calls cannot be placed directly from this device or simulator.\n\nDriver phone: ${phone}`);
              }
            } catch (err) {
              console.warn('[Call Error]', err);
              Alert.alert('Call Failed', `Could not open dialer for ${phone}`);
            }
          }}
        >
          <Phone size={18} color={C.lux900} />
        </TouchableOpacity>
      </View>

      {/* ── CHAT MESSAGES ────────────────────────────── */}
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
        style={{ flex: 1 }}
      >
        <ScrollView 
          ref={scrollViewRef}
          style={styles.chatArea} 
          contentContainerStyle={styles.chatContent}
          keyboardShouldPersistTaps="handled"
        >
          {messages.length === 0 && !isLoadingHistory && (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyTitle}>Chat with your driver</Text>
              <Text style={styles.emptySub}>Coordinate pickup details or ask any trip-related questions.</Text>
            </View>
          )}

          {messages.map((m, idx) => {
            const isMe = m.sender_role === 'CUSTOMER' || m.sender === 'CUSTOMER';
            const timeStr = formatTime(m.created_at);

            return (
              <View 
                key={m.id || m.client_id || idx} 
                style={[styles.bubbleWrapper, isMe ? styles.myWrapper : styles.theirWrapper]}
              >
                {!isMe && m.sender_name && (
                  <Text style={styles.senderLabel}>{m.sender_name}</Text>
                )}
                <View style={[styles.bubble, isMe ? styles.myBubble : styles.theirBubble]}>
                  <Text style={[styles.msgText, isMe ? styles.myMsgText : styles.theirMsgText]}>
                    {m.text}
                  </Text>
                  <View style={styles.metaRow}>
                    {timeStr ? (
                      <Text style={[styles.timeText, isMe ? styles.myTimeText : styles.theirTimeText]}>
                        {timeStr}
                      </Text>
                    ) : null}
                    {isMe && <Check size={12} color="#9CA3AF" style={{ marginLeft: 4 }} />}
                  </View>
                </View>
              </View>
            );
          })}
        </ScrollView>

        {/* ── QUICK REPLIES ─────────────────────────────── */}
        <View style={styles.quickRepliesArea}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.quickRepliesScroll}>
            {QUICK_REPLIES.map((reply, i) => (
              <TouchableOpacity
                key={i}
                style={styles.chip}
                activeOpacity={0.75}
                onPress={() => handleSend(reply)}
              >
                <Text style={styles.chipText}>{reply}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* ── INPUT BAR ─────────────────────────────────── */}
        <View 
          style={[
            styles.inputArea, 
            { 
              paddingBottom: keyboardVisible 
                ? (Platform.OS === 'ios' ? 10 : 10) 
                : Math.max(16, insets.bottom) 
            }
          ]}
        >
          <TextInput
            style={styles.input}
            placeholder="Type a message to your driver..."
            placeholderTextColor="#9CA3AF"
            value={text}
            onChangeText={setText}
            multiline={false}
            returnKeyType="send"
            onSubmitEditing={() => handleSend()}
          />
          <TouchableOpacity 
            style={[styles.sendBtn, !text.trim() && styles.sendBtnDisabled]} 
            onPress={() => handleSend()}
            disabled={!text.trim()}
            activeOpacity={0.8}
          >
            <Send size={18} color="#fff" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF', zIndex: 1000, elevation: 100 },

  // Header
  header: {
    paddingBottom: 14,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#F9FAFB', alignItems: 'center', justifyContent: 'center' },
  headerInfo: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12, marginHorizontal: 12 },
  avatarCircle: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#E5E7EB' },
  headerTitle: { fontSize: 16, fontWeight: '800', color: C.lux900 },
  headerSub: { fontSize: 12, color: C.gray500, fontWeight: '500', marginTop: 1 },
  callBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#F9FAFB', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#E5E7EB' },

  // Chat Area
  chatArea: { flex: 1, backgroundColor: '#F9FAFB' },
  chatContent: { padding: 16, paddingBottom: 24 },

  emptyContainer: { alignItems: 'center', justifyContent: 'center', marginTop: 80, paddingHorizontal: 32 },
  emptyTitle: { fontSize: 18, fontWeight: '800', color: C.lux900, marginBottom: 8 },
  emptySub: { fontSize: 14, color: C.gray500, textAlign: 'center', lineHeight: 20 },

  bubbleWrapper: { marginBottom: 14, maxWidth: '82%' },
  myWrapper: { alignSelf: 'flex-end', alignItems: 'flex-end' },
  theirWrapper: { alignSelf: 'flex-start', alignItems: 'flex-start' },

  senderLabel: { fontSize: 11, fontWeight: '600', color: '#6B7280', marginBottom: 4, marginLeft: 8 },
  bubble: { paddingHorizontal: 16, paddingVertical: 12, borderRadius: 20 },
  myBubble: { backgroundColor: C.lux900, borderBottomRightRadius: 4 },
  theirBubble: { backgroundColor: '#FFFFFF', borderBottomLeftRadius: 4, borderWidth: 1, borderColor: '#E5E7EB' },

  msgText: { fontSize: 15, lineHeight: 21 },
  myMsgText: { color: '#FFFFFF' },
  theirMsgText: { color: '#111827' },

  metaRow: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-end', marginTop: 4 },
  timeText: { fontSize: 10, fontWeight: '500' },
  myTimeText: { color: 'rgba(255,255,255,0.6)' },
  theirTimeText: { color: '#9CA3AF' },

  // Quick Replies
  quickRepliesArea: { backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: '#F3F4F6', paddingVertical: 8 },
  quickRepliesScroll: { paddingHorizontal: 12, gap: 8 },
  chip: { backgroundColor: '#F3F4F6', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 16, borderWidth: 1, borderColor: '#E5E7EB' },
  chipText: { fontSize: 13, fontWeight: '600', color: C.lux900 },

  // Input Area
  inputArea: {
    paddingHorizontal: 16,
    paddingTop: 10,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  input: {
    flex: 1,
    height: 48,
    backgroundColor: '#F9FAFB',
    borderRadius: 24,
    paddingHorizontal: 18,
    fontSize: 15,
    color: '#111827',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  sendBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: C.gold || '#D4AF37',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: {
    backgroundColor: '#E5E7EB',
  },
});
