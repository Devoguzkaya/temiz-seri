import * as Notifications from "expo-notifications";
import { AndroidImportance } from "expo-notifications";
import { Platform } from "react-native";
import type { Reminder } from "./settings";

const CHANNEL = "gunluk-hatirlatma";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

/** Tek bir günlük hatırlatma kurar; kapalıysa hepsini siler. Hata mesajı ya da null döner. */
export async function applyReminder(r: Reminder): Promise<string | null> {
  if (Platform.OS === "web") return "Hatırlatma bildirimleri sadece telefonda çalışır.";
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    if (!r.enabled) return null;

    const current = await Notifications.getPermissionsAsync();
    const granted = current.granted || (await Notifications.requestPermissionsAsync()).granted;
    if (!granted) return "Bildirim izni verilmedi. Telefon ayarlarından Temiz Seri için bildirimleri aç.";

    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync(CHANNEL, {
        name: "Günlük hatırlatma",
        importance: AndroidImportance.DEFAULT,
      });
    }
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Bugünü işaretledin mi?",
        body: "Şekerli içecek, kızartma, esmer tercih, gece atıştırması. Seriyi koru.",
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: r.hour,
        minute: r.minute,
        channelId: CHANNEL,
      },
    });
    return null;
  } catch {
    return "Hatırlatma kurulamadı. Bu cihazda bildirimler desteklenmiyor olabilir.";
  }
}
