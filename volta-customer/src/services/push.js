import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

export async function registerForPushNotificationsAsync() {
  let token;
  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      console.log('Failed to get push token for push notification!');
      return;
    }
    
    // Get the project ID from app.json
    const projectId = Constants.expoConfig?.eas?.projectId;
    if (!projectId) {
      console.log('Project ID not found');
      return;
    }
    
    try {
      token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
      console.log('Push Token:', token);
    } catch (e) {
      console.log('Error getting push token', e);
    }
  }

  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#05A357',
    });
  }

  return token;
}
