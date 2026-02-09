import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

try {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldPlaySound: false,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
} catch (_) {
  // Expo Go: notification handler not available
}

async function ensureAndroidChannel() {
  if (Platform.OS === 'android') {
    try {
      await Notifications.setNotificationChannelAsync('training-reminders', {
        name: 'Rappels entraînement',
        importance: Notifications.AndroidImportance.HIGH,
      });
    } catch (_) {
      // Expo Go: channels not available
    }
  }
}

export async function requestNotificationPermissions(): Promise<boolean> {
  try {
    await ensureAndroidChannel();
    const { status: existing } = await Notifications.getPermissionsAsync();
    if (existing === 'granted') return true;

    const { status } = await Notifications.requestPermissionsAsync();
    return status === 'granted';
  } catch (_) {
    return false;
  }
}

export async function getNotificationPermissionStatus(): Promise<'granted' | 'denied' | 'undetermined'> {
  try {
    const { status } = await Notifications.getPermissionsAsync();
    return status;
  } catch (_) {
    return 'undetermined';
  }
}

// Map our 0=Monday..6=Sunday to expo's 1=Sunday..7=Saturday
function toExpoWeekday(day: number): number {
  // 0=Mon→2, 1=Tue→3, 2=Wed→4, 3=Thu→5, 4=Fri→6, 5=Sat→7, 6=Sun→1
  return day === 6 ? 1 : day + 2;
}

export async function scheduleWeeklyReminders(
  activeDays: number[],
  hour: number,
  minute: number,
): Promise<void> {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch (_) {
    // Expo Go: cancel not available
  }

  if (activeDays.length === 0) return;

  const granted = await requestNotificationPermissions();
  if (!granted) return;

  for (const day of activeDays) {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'SYSTÈME',
          body: 'Entraînement programmé aujourd\'hui.',
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
          weekday: toExpoWeekday(day),
          hour,
          minute,
          channelId: Platform.OS === 'android' ? 'training-reminders' : undefined,
        },
      });
    } catch (_) {
      // Expo Go: scheduling not available
    }
  }
}
