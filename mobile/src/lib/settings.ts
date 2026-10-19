import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import { Platform } from "react-native";

const API_URL_KEY = "temiz-seri:api-url";
const REMINDER_KEY = "temiz-seri:reminder";

export type Reminder = { enabled: boolean; hour: number; minute: number };
export const DEFAULT_REMINDER: Reminder = { enabled: false, hour: 21, minute: 30 };

/**
 * Varsayılan sunucu: Expo geliştirme sunucusunun çalıştığı bilgisayarın IP'si, port 8080.
 * Telefon ve bilgisayar aynı Wi-Fi'deyse elle ayar gerekmez.
 */
export function defaultApiUrl(): string {
  if (Platform.OS === "web") return "http://localhost:8080";
  const host = Constants.expoConfig?.hostUri?.split(":")[0];
  return host ? `http://${host}:8080` : "http://localhost:8080";
}

let cachedApiUrl: string | null = null;

export async function getApiUrl(): Promise<string> {
  if (cachedApiUrl) return cachedApiUrl;
  try {
    cachedApiUrl = (await AsyncStorage.getItem(API_URL_KEY)) || defaultApiUrl();
  } catch {
    cachedApiUrl = defaultApiUrl();
  }
  return cachedApiUrl;
}

/** Boş değer varsayılana döner. */
export async function setApiUrl(url: string): Promise<string> {
  const clean = url.trim().replace(/\/+$/, "");
  if (clean) await AsyncStorage.setItem(API_URL_KEY, clean);
  else await AsyncStorage.removeItem(API_URL_KEY);
  cachedApiUrl = clean || defaultApiUrl();
  return cachedApiUrl;
}

export async function getReminder(): Promise<Reminder> {
  try {
    const raw = await AsyncStorage.getItem(REMINDER_KEY);
    return raw ? { ...DEFAULT_REMINDER, ...JSON.parse(raw) } : DEFAULT_REMINDER;
  } catch {
    return DEFAULT_REMINDER;
  }
}

export async function saveReminder(r: Reminder): Promise<void> {
  await AsyncStorage.setItem(REMINDER_KEY, JSON.stringify(r));
}
