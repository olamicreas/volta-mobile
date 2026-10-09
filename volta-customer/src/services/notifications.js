import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';

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
    const projectId = '326de05a-0a24-4834-a2d3-0c430c9dc1e8';
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
