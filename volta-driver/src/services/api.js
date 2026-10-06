import AsyncStorage from '@react-native-async-storage/async-storage';

const HTTP_URL = process.env.EXPO_PUBLIC_BACKEND_URL || 'http://163.245.215.14:8000';

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

  
  async uploadDocuments(photoUri, licenseUri, carteGrisUri) {
    const token = await this.getToken();
    const formData = new FormData();
    
    if (photoUri) {
      formData.append('profile_photo', { uri: photoUri, name: 'profile.jpg', type: 'image/jpeg' });
    }
    if (licenseUri) {
      formData.append('driver_license', { uri: licenseUri, name: 'license.jpg', type: 'image/jpeg' });
    }
    if (carteGrisUri) {
      formData.append('carte_grise', { uri: carteGrisUri, name: 'carte_grise.jpg', type: 'image/jpeg' });
    }

    const res = await fetch(`${HTTP_URL}/api/v1/users/me/documents`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });
    
    if (!res.ok) throw new Error('Failed to upload documents');
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
}

export default new ApiService();
