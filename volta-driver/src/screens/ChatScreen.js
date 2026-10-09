import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, Dimensions, ScrollView, Keyboard } from 'react-native';
import { ArrowLeft, Send } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import C from '../constants/colors';
import socket from '../services/socket';

const { width, height } = Dimensions.get('window');

export default function ChatScreen({ onClose, role = 'DRIVER', trip }) {
  const customerName = trip?.customer?.name || 'Customer';
  const driverName = 'Driver';
  const [msgs, setMsgs] = useState(trip?.messages || []);
  const [text, setText] = useState('');
  const insets = useSafeAreaInsets();
  const scrollViewRef = useRef(null);

  useEffect(() => {
    const handleNewMsg = (m) => {
      setMsgs(prev => [...prev, { id: m.id || Date.now(), text: m.text, sender: m.sender_id || 'OTHER' }]);
    };
    socket.on('new_message', handleNewMsg);
    return () => socket.off('new_message', handleNewMsg);
  }, []);

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [msgs]);

  const handleSend = () => {
    if(!text.trim()) return;
    const m = { 
      id: Date.now(), 
      text, 
      sender: role,
      trip_id: trip?.trip_id,
      recipient_id: trip?.customer_id
    };
    setMsgs(prev => [...prev, m]);
    socket.emit('send_message', m);
    setText('');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose} style={styles.backBtn}>
          <ArrowLeft size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{role === 'CUSTOMER' ? driverName : customerName}</Text>
        <View style={{ width: 24 }} />
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
        style={{ flex: 1 }}
      >
        <ScrollView 
          ref={scrollViewRef}
          style={styles.chatArea} 
          contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
        >
          {msgs.map(m => {
            const isMe = m.sender === role;
            return (
              <View key={m.id} style={[styles.bubble, isMe ? styles.myBubble : styles.theirBubble]}>
                <Text style={[styles.msgText, isMe ? styles.myMsgText : styles.theirMsgText]}>{m.text}</Text>
              </View>
            );
          })}
        </ScrollView>

        <View style={[styles.inputArea, { paddingBottom: Math.max(16, insets.bottom) }]}>
          <TextInput
            style={styles.input}
            placeholder="Type a message..."
            placeholderTextColor="#999"
            value={text}
            onChangeText={setText}
          />
          <TouchableOpacity style={styles.sendBtn} onPress={handleSend}>
            <Send size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', zIndex: 1000, elevation: 100 },
  header: { paddingTop: Platform.OS === 'ios' ? 60 : 40, paddingBottom: 16, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: '#eee', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#000' },
  chatArea: { flex: 1, backgroundColor: '#f9f9f9' },
  bubble: { maxWidth: '80%', padding: 12, borderRadius: 16, marginBottom: 12 },
  myBubble: { alignSelf: 'flex-end', backgroundColor: C.brand || '#05A357', borderBottomRightRadius: 4 },
  theirBubble: { alignSelf: 'flex-start', backgroundColor: '#e5e7eb', borderBottomLeftRadius: 4 },
  msgText: { fontSize: 16 },
  myMsgText: { color: '#fff' },
  theirMsgText: { color: '#000' },
  inputArea: { padding: 16,  backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#eee', flexDirection: 'row', alignItems: 'center' },
  input: { flex: 1, height: 48, backgroundColor: '#f1f1f1', borderRadius: 24, paddingHorizontal: 16, fontSize: 16, marginRight: 12 },
  sendBtn: { width: 48, height: 48, borderRadius: 24, backgroundColor: C.brand || '#05A357', alignItems: 'center', justifyContent: 'center' },
});
