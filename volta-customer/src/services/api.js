import AsyncStorage from '@react-native-async-storage/async-storage';

const HTTP_URL = process.env.EXPO_PUBLIC_BACKEND_URL || 'http://163.245.215.14:8000';

function base64ToUint8Array(base64) {
  const clean = base64.includes(',') ? base64.split(',')[1] : base64;
  if (typeof atob === 'function') {
    const bin = atob(clean);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return bytes;
  }
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  const lookup = new Uint8Array(256);
  for (let i = 0; i < chars.length; i++) lookup[chars.charCodeAt(i)] = i;
  let len = clean.length;
  let bufLen = len * 0.75;
  if (clean[len - 1] === '=') {
    bufLen--;
    if (clean[len - 2] === '=') bufLen--;
  }
  const bytes = new Uint8Array(bufLen);
  let p = 0;
  for (let i = 0; i < len; i += 4) {
    const enc1 = lookup[clean.charCodeAt(i)];
    const enc2 = lookup[clean.charCodeAt(i + 1)];
    const enc3 = lookup[clean.charCodeAt(i + 2)];
    const enc4 = lookup[clean.charCodeAt(i + 3)];
    bytes[p++] = (enc1 << 2) | (enc2 >> 4);
    if (clean[i + 2] !== '=') bytes[p++] = ((enc2 & 15) << 4) | (enc3 >> 2);
    if (clean[i + 3] !== '=') bytes[p++] = ((enc3 & 3) << 6) | (enc4 & 63);
  }
  return bytes;
}

async function readUriToBytes(uri) {
  try {
    const res = await fetch(uri);
    const buf = await res.arrayBuffer();
    return new Uint8Array(buf);
  } catch (e) {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.responseType = 'arraybuffer';
      xhr.onload = () => {
        if (xhr.response) resolve(new Uint8Array(xhr.response));
        else reject(new Error('Empty response reading uri'));
      };
      xhr.onerror = (err) => reject(new Error('XHR failed to read uri: ' + uri));
      xhr.open('GET', uri, true);
      xhr.send(null);
    });
  }
}

async function appendFilePart(formData, fieldName, fileInput, defaultName, defaultMime = 'image/jpeg') {
  if (!fileInput) return;

  const uri = typeof fileInput === 'string' ? fileInput : fileInput.uri;
  const base64 = typeof fileInput === 'object' ? fileInput.base64 : null;
  const name = (typeof fileInput === 'object' && fileInput.name) ? fileInput.name : defaultName;
  const type = (typeof fileInput === 'object' && fileInput.type) ? fileInput.type : defaultMime;

  if (base64) {
    try {
      const bytes = base64ToUint8Array(base64);
      formData.append(fieldName, {
        uri,
        name,
        type,
        bytes: () => bytes,
      });
      return;
    } catch (err) {
      console.warn('[API] Base64 conversion warning:', err);
    }
  }

  if (uri) {
    try {
      const bytes = await readUriToBytes(uri);
      formData.append(fieldName, {
        uri,
        name,
        type,
        bytes: () => bytes,
      });
      return;
    } catch (readErr) {
      console.warn('[API] readUriToBytes warning:', readErr);
    }

    try {
      const res = await fetch(uri);
      const blob = await res.blob();
      formData.append(fieldName, blob, name);
      return;
    } catch (blobErr) {
      console.warn('[API] Blob fallback warning:', blobErr);
    }

    formData.append(fieldName, { uri, name, type });
  }
}

class ApiService {
  async getToken() {
    return await AsyncStorage.getItem('userToken');
  }

  async getHeaders() {
    const token = await this.getToken();
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  }

  
  async updateProfile(data) {
    const res = await fetch(`${HTTP_URL}/api/v1/users/me`, {
      method: 'PUT',
      headers: await this.getHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to update profile');
    return res.json();
  }

  async uploadProfilePhoto(photoInput) {
    const token = await this.getToken();
    const formData = new FormData();
    await appendFilePart(formData, 'photo', photoInput, 'profile.jpg', 'image/jpeg');
    const res = await fetch(`${HTTP_URL}/api/v1/users/me/profile-photo`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });
    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Profile photo upload failed: ${res.status} ${errText}`);
    }
    return res.json();
  }

  async getProfile() {
    const res = await fetch(`${HTTP_URL}/api/v1/users/me`, { headers: await this.getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch profile');
    return await res.json();
  }

  
  async addPlace(data) {
    const res = await fetch(`${HTTP_URL}/api/v1/users/me/places`, {
      method: 'POST',
      headers: await this.getHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to add place');
    return await res.json();
  }

  async getPlaces() {
    const res = await fetch(`${HTTP_URL}/api/v1/users/me/places`, { headers: await this.getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch places');
    return await res.json();
  }

  async getTrips() {
    const res = await fetch(`${HTTP_URL}/api/v1/users/me/trips`, { headers: await this.getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch trips');
    return await res.json();
  }

  async getWallet() {
    const res = await fetch(`${HTTP_URL}/api/v1/users/me/wallet`, { headers: await this.getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch wallet');
    return await res.json();
  }

  async getActiveTrip() {
    try {
      const res = await fetch(`${HTTP_URL}/api/v1/users/me/active-trip`, { headers: await this.getHeaders() });
      if (!res.ok) return { active: false, trip: null };
      return await res.json();
    } catch (e) {
      return { active: false, trip: null };
    }
  }

  async createPaymentIntent(amount, currency) {
    const res = await fetch(`${HTTP_URL}/api/v1/payments/create-intent`, {
      method: 'POST',
      headers: await this.getHeaders(),
      body: JSON.stringify({ amount, currency })
    });
    if (!res.ok) throw new Error('Payment Intent failed');
    return await res.json();
  }

  async getTripMessages(tripId) {
    if (!tripId) return [];
    try {
      const res = await fetch(`${HTTP_URL}/api/v1/trips/${tripId}/messages`, {
        headers: await this.getHeaders()
      });
      if (!res.ok) return [];
      return await res.json();
    } catch (e) {
      console.warn('[API] getTripMessages error:', e);
      return [];
    }
  }
}

export default new ApiService();
