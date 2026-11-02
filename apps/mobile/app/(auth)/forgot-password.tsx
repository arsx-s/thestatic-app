import { useRouter } from "expo-router";
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
import { supabase } from "../../src/lib/supabase";

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async () => {
    if (!identifier) {
      Alert.alert("Static", "Enter your Static ID or username.");
      return;
    }
    setLoading(true);
    try {
      await supabase.functions.invoke("login-identifier", {
        body: { identifier, action: "recover" },
      });
      setSent(true);
    } catch (error) {
      Alert.alert("Recovery failed", (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.brand}>
            <Text style={styles.wordmark}>THE STATIC</Text>
            <Text style={styles.tagline}>Password recovery</Text>
          </View>
          <Text style={styles.body}>
            A recovery link has been sent to the verified contact on file for
            this account. Follow the link to set a new password.
          </Text>
          <Button title="Back to login" onPress={() => router.back()} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.content}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.brand}>
            <Text style={styles.wordmark}>THE STATIC</Text>
            <Text style={styles.tagline}>Forgot password</Text>
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
          </View>
          <Button
            title="Send recovery link"
            onPress={handleSubmit}
            disabled={loading}
            color="#ececec"
          />
          <TouchableOpacity
            style={styles.back}
            onPress={() => router.push("/(auth)/login")}
          >
            <Text style={styles.linkText}>Back to log in</Text>
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
    minHeight: 48,
  },
  back: { alignItems: "center", marginTop: 12 },
  linkText: { fontSize: 13, color: "#8b8b8b", fontFamily: "IBM Plex Mono" },
  body: { color: "#c9c9c9", marginBottom: 20, textAlign: "center", lineHeight: 22 },
  spinner: { marginTop: 24 },
});
