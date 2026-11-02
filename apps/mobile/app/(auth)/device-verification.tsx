import { useRouter } from "expo-router";
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function DeviceVerificationScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.brand}>
          <Text style={styles.wordmark}>THE STATIC</Text>
          <Text style={styles.tagline}>Verify this device</Text>
        </View>
        <Text style={styles.body}>
          Confirm your identity to register this device&apos;s cryptographic
          keys and restore access to your encrypted conversations.
        </Text>
        <TouchableOpacity style={styles.button} onPress={() => router.push("/(tabs)")}>
          <Text style={styles.buttonText}>Continue</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.back}
          onPress={() => router.push("/(auth)/login")}
        >
          <Text style={styles.linkText}>Back to log in</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#070707" },
  scrollContent: { flexGrow: 1, paddingHorizontal: 24, paddingVertical: 24 },
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
  body: { color: "#c9c9c9", marginBottom: 24, textAlign: "center", lineHeight: 22 },
  button: {
    backgroundColor: "#ececec",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    marginBottom: 16,
  },
  buttonText: {
    color: "#000",
    fontWeight: "700",
    fontFamily: "Space Grotesk",
    textTransform: "uppercase",
    letterSpacing: 0.06,
  },
  back: { alignItems: "center" },
  linkText: { fontSize: 13, color: "#8b8b8b", fontFamily: "IBM Plex Mono" },
});
