import { Stack } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, SafeAreaView, StyleSheet, View } from "react-native";
import { Providers } from "../src/providers";
import { useAuthStore } from "../src/store/auth";

export default function RootLayout() {
  const { isAuthenticated, isLoading } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || isLoading) {
    return (
      <Providers>
        <SafeAreaView style={styles.container}>
          <ActivityIndicator style={styles.spinner} color="#ececec" />
        </SafeAreaView>
      </Providers>
    );
  }

  return (
    <Providers>
      <Stack>
        {!isAuthenticated ? (
          <>
            <Stack.Screen name="(auth)/login" options={{ title: "Log in" }} />
            <Stack.Screen
              name="(auth)/forgot-password"
              options={{ title: "Forgot password" }}
            />
            <Stack.Screen
              name="(auth)/account-recovery"
              options={{ title: "Account recovery" }}
            />
            <Stack.Screen
              name="(auth)/device-verification"
              options={{ title: "Device verification" }}
            />
          </>
        ) : (
          <>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen
              name="create"
              options={{ title: "Create", presentation: "modal" }}
            />
            <Stack.Screen name="hub" />
            <Stack.Screen
              name="hub/marketplace"
              options={{ title: "Marketplace" }}
            />
            <Stack.Screen name="hub/marketplace/create" />
            <Stack.Screen name="hub/store" />
            <Stack.Screen name="hub/store/checkout" />
            <Stack.Screen name="hub/events" />
            <Stack.Screen name="settings" options={{ title: "Settings" }} />
            <Stack.Screen name="post/[id]" />
            <Stack.Screen name="story/[id]" />
            <Stack.Screen name="conversation/[id]" />
            <Stack.Screen
              name="profile/[username]"
              options={{ title: "Profile" }}
            />
          </>
        )}
      </Stack>
    </Providers>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#070707", justifyContent: "center", alignItems: "center" },
  spinner: { marginTop: -24 },
});
