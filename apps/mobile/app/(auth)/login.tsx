import { Link, useRouter } from "expo-router";
import { Linking } from "react-native";
import { useState } from "react";
import {
  ActivityIndicator,
  Button,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Alert } from "react-native";
import { useAuthStore } from "../../src/store/auth";
import { supabase, persistSession } from "../../src/lib/supabase";

export default function LoginScreen() {
  const router = useRouter();
  const { setSession, setLoading } = useAuthStore();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLocalLoading] = useState(false);

  const handleLogin = async () => {
    if (!identifier || !password) {
      Alert.alert("Static", "Enter your Static ID or username and password.");
      return;
    }
    setLocalLoading(true);
    setLoading(true);
    try {
      // Resolve identifier via protected Edge Function, then authenticate.
      const { data: resolved, error: resolveError } = await supabase.functions.invoke(
        "login-identifier",
        { body: { identifier, password } },
      );
      if (resolveError || !resolved?.access_token) {
        throw new Error(resolved?.error || "Invalid Static ID, username or password.");
      }
      await persistSession(resolved.access_token, resolved.refresh_token ?? "");
      setSession(
        {
          id: resolved.member.id,
          staticId: resolved.member.static_id,
          username: resolved.member.username,
          status: resolved.member.status,
          role: resolved.member.role,
        },
        resolved.access_token,
        resolved.refresh_token ?? "",
      );
      router.replace("/(tabs)");
    } catch (error) {
      Alert.alert("Login failed", (error as Error).message);
    } finally {
      setLocalLoading(false);
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.content}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.brand}>
            <Text style={styles.wordmark}>THE STATIC</Text>
            <Text style={styles.tagline}>
              There&apos;s more of us than you think.
            </Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.label}>Static ID / Username</Text>
            <TextInput
              style={styles.input}
              value={identifier}
              onChangeText={setIdentifier}
              autoCapitalize="none"
              autoComplete="username"
              placeholder="ST-00001 or username"
            />
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoComplete="password"
              placeholder="&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;"
            />
          </View>

          <Button
            title="LOG IN"
            onPress={handleLogin}
            disabled={loading}
            color="#ececec"
          />

          <View style={styles.row}>
            <TouchableOpacity style={styles.link} onPress={() => router.push("/(auth)/forgot-password")}>
              <Text style={styles.linkText}>Forgot password?</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.divider}>
            <Text style={styles.midText}>Not a member?</Text>
          </View>

          <TouchableOpacity
            style={styles.apply}
            onPress={() =>
              Linking.openURL("https://thestaticcollective.vercel.app/#join")
            }
          >
            <Text style={styles.applyText}>Apply to become a Static</Text>
          </TouchableOpacity>

          {loading ? (
            <ActivityIndicator style={styles.spinner} color="#ececec" size="large" />
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#070707" },
  content: { flex: 1, justifyContent: "center", paddingHorizontal: 24 },
  scrollContent: { flexGrow: 1, justifyContent: "center" },
  brand: { alignItems: "center", marginBottom: 40 },
  wordmark: {
    fontSize: 32,
    fontWeight: "700",
    color: "#ececec",
    letterSpacing: -0.045,
    textTransform: "uppercase",
    fontFamily: "Space Grotesk",
  },
  tagline: {
    fontSize: 14,
    color: "#8b8b8b",
    marginTop: 8,
    textAlign: "center",
    letterSpacing: 0.14,
  },
  card: { marginBottom: 24 },
  label: {
    fontSize: 11,
    fontFamily: "IBM Plex Mono",
    color: "#8b8b8b",
    textTransform: "uppercase",
    letterSpacing: 0.14,
    marginBottom: 8,
    marginLeft: 2,
  },
  input: {
    backgroundColor: "#000",
    borderWidth: 1,
    borderColor: "#3a3a3a",
    color: "#ececec",
    padding: 14,
    borderRadius: 10,
    fontSize: 16,
    marginBottom: 14,
    minHeight: 48,
  },
  row: { flexDirection: "row", justifyContent: "flex-end", marginBottom: 16 },
  link: { paddingVertical: 4 },
  linkText: { fontSize: 13, color: "#8b8b8b", fontFamily: "IBM Plex Mono" },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 16,
  },
  midText: { fontSize: 13, color: "#8b8b8b", fontFamily: "IBM Plex Mono", marginRight: 8 },
  apply: { alignItems: "center", paddingVertical: 10 },
  applyText: {
    fontSize: 13,
    color: "#ececec",
    fontFamily: "IBM Plex Mono",
    letterSpacing: 0.14,
    textDecorationLine: "underline",
  },
  spinner: { marginTop: 24 },
});
