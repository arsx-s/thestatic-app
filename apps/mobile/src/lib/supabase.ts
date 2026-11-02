import { Platform } from "react-native";
import { createClient } from "@supabase/supabase-js";
import * as SecureStore from "expo-secure-store";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

// Standalone typed client without relying on @the-static/api-client build output.
export const supabaseBrowser = createClient(
  supabaseUrl ?? "",
  supabaseAnonKey ?? "",
);

export const supabase = supabaseBrowser;

export async function persistSession(
  accessToken: string,
  refreshToken: string,
): Promise<void> {
  await SecureStore.setItemAsync("thestatic:auth:access", accessToken);
  await SecureStore.setItemAsync("thestatic:auth:refresh", refreshToken);
}

export async function clearStoredSession(): Promise<void> {
  await SecureStore.deleteItemAsync("thestatic:auth:access");
  await SecureStore.deleteItemAsync("thestatic:auth:refresh");
}

export async function getStoredAccessToken(): Promise<string | null> {
  return SecureStore.getItemAsync("thestatic:auth:access");
}
