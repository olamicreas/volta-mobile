import AsyncStorage from '@react-native-async-storage/async-storage';

const HTTP_URL = process.env.EXPO_PUBLIC_BACKEND_URL || 'http://163.245.215.14:8000';
const WS_URL = HTTP_URL.replace('http', 'ws');

class SocketService {
  constructor() {
    this.socket = null;
    this.listeners = {};
  }

  async connect() {
    const token = await AsyncStorage.getItem('userToken');
    if (!token) return;

    this.socket = new WebSocket(`${WS_URL}/ws?token=${token}`);

    this.socket.onopen = () => {
      console.log('[WebSocket] Connected');
    };

    this.socket.onmessage = (e) => {
      try {
        const msg = JSON.parse(e.data);
        const { event, data } = msg;
        if (this.listeners[event]) {
          this.listeners[event].forEach(cb => cb(data));
        }
      } catch (err) {
        console.error('[WebSocket] Parse error:', err);
      }
    };

    this.socket.onclose = (e) => {
      console.log('[WebSocket] Disconnected:', e.reason);
      // Auto reconnect
      setTimeout(() => this.connect(), 3000);
    };
  }

  disconnect() { if (this.socket) { this.socket.close(); this.socket = null; } }

  on(event, callback) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(callback);
  }

  off(event) {
    delete this.listeners[event];
  }

  emit(event, data) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({ event, data }));
    }
  }
}

const socketService = new SocketService();
export default socketService;
