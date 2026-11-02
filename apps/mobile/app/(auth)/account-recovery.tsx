import { useRouter } from "expo-router";
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function AccountRecoveryScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.brand}>
          <Text style={styles.wordmark}>THE STATIC</Text>
          <Text style={styles.tagline}>Account recovery</Text>
        </View>
        <Text style={styles.body}>
          Recovery uses the recovery key generated on your device during login.
          Enter your recovery key to restore access to your account and
          re-register your device.
        </Text>
        <View style={styles.card}>
          <Text style={styles.label}>Recovery key</Text>
          <View style={styles.inputWrap}>
            <View style={styles.input} />
            <View style={styles.input} />
            <View style={styles.input} />
            <View style={styles.input} />
            <View style={styles.input} />
            <View style={styles.input} />
          </View>
        </View>
        <TouchableOpacity style={styles.back} onPress={() => router.push("/(auth)/login")}>
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
  card: { marginBottom: 20 },
  label: {
    fontSize: 11,
    fontFamily: "IBM Plex Mono",
    color: "#8b8b8b",
    textTransform: "uppercase",
    letterSpacing: 0.14,
    marginBottom: 10,
    marginLeft: 2,
  },
  inputWrap: { flexDirection: "row", gap: 8 },
  input: { width: 44, height: 48, backgroundColor: "#000", borderWidth: 1, borderColor: "#3a3a3a", borderRadius: 10 },
  back: { alignItems: "center" },
  linkText: { fontSize: 13, color: "#8b8b8b", fontFamily: "IBM Plex Mono" },
});
