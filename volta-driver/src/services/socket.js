import AsyncStorage from '@react-native-async-storage/async-storage';

const HTTP_URL = process.env.EXPO_PUBLIC_BACKEND_URL || 'http://163.245.215.14:8000';
const WS_URL = HTTP_URL.replace('http', 'ws');

class SocketService {
  constructor() {
    this.socket = null;
    this.listeners = {};
    this._intentionalClose = false;
  }

  async connect() {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) return;

      if (this.socket && (this.socket.readyState === WebSocket.OPEN || this.socket.readyState === WebSocket.CONNECTING)) {
        return;
      }

      this._intentionalClose = false;
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

      this.socket.onerror = (e) => {
        console.error('[WebSocket] Error:', e.message || e);
      };

      this.socket.onclose = (e) => {
        console.log('[WebSocket] Disconnected:', e.reason);
        // Only auto-reconnect if not intentionally closed
        if (!this._intentionalClose) {
          setTimeout(() => this.connect(), 3000);
        }
      };
    } catch (err) {
      console.error('[WebSocket] Connect error:', err);
    }
  }

  disconnect() {
    this._intentionalClose = true;
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }

  on(event, callback) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(callback);
  }

  off(event) {
    delete this.listeners[event];
  }

  emit(event, data) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      console.log('[WebSocket] Emitting:', event, data);
      this.socket.send(JSON.stringify({ event, data }));
    } else {
      console.warn('[WebSocket] Cannot emit, socket not open. State:', this.socket ? this.socket.readyState : 'null', 'Event:', event);
      // Attempt reconnect if socket is null or closed
      if (!this.socket || this.socket.readyState === WebSocket.CLOSED) {
        this.connect().then(() => {
          setTimeout(() => {
            if (this.socket && this.socket.readyState === WebSocket.OPEN) {
              console.log('[WebSocket] Re-emitting after reconnect:', event);
              this.socket.send(JSON.stringify({ event, data }));
            }
          }, 500);
        });
      }
    }
  }
}

const socketService = new SocketService();
export default socketService;
