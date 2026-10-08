import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export const requestPushPermissions = async () => {
  if (!Device.isDevice) {
    console.log('[Push] Must use physical device for Push Notifications');
    return false;
  }
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  
  if (finalStatus !== 'granted') {
    console.log('[Push] Failed to get push token for push notification!');
    return null;
  }
  
  console.log('[Push] Permissions granted!');
  
  try {
    const projectId = Constants.expoConfig?.extra?.eas?.projectId || '48bd79da-8bca-4ccf-a2e9-4e007d4b067f';
    const pushTokenData = await Notifications.getExpoPushTokenAsync({ projectId });
    return pushTokenData.data;
  } catch (e) {
    console.log('[Push] Error getting token:', e);
    return null;
  }
};

export const sendLocalPush = (title, body) => {
  console.log(`[Push Due] ${title}: ${body}`);
  Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      sound: 'default',
    },
    trigger: null, // send immediately
  });
};
