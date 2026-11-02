import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function SettingsScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.wordmark}>Settings</Text>
          <Text style={styles.tagline}>Privacy, security, devices</Text>
        </View>

        <View style={styles.section}>
          <TouchableOpacity style={styles.row} onPress={() => {}}>
            <Text style={styles.rowTitle}>Privacy</Text>
            <Text style={styles.rowSub}>Profile visibility and discoverability</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.row} onPress={() => {}}>
            <Text style={styles.rowTitle}>Security</Text>
            <Text style={styles.rowSub}>Password, session and MFA</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.row} onPress={() => {}}>
            <Text style={styles.rowTitle}>Encryption keys</Text>
            <Text style={styles.rowSub}>Device identity and recovery key</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.row} onPress={() => {}}>
            <Text style={styles.rowTitle}>Active devices</Text>
            <Text style={styles.rowSub}>Registered and revoked devices</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.row} onPress={() => {}}>
            <Text style={styles.rowTitle}>Blocked members</Text>
            <Text style={styles.rowSub}>Manage blocked accounts</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.row} onPress={() => {}}>
            <Text style={styles.rowTitle}>Notifications</Text>
            <Text style={styles.rowSub}>Push notification preferences</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <TouchableOpacity style={styles.row} onPress={() => {}}>
            <Text style={styles.rowTitle}>Account recovery</Text>
            <Text style={styles.rowSub}>Recovery key and device transfer</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.rowDanger} onPress={() => {}}>
            <Text style={styles.rowTitleDanger}>Delete account</Text>
            <Text style={styles.rowSubDanger}>Remove your account and data</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.about} onPress={() => {}}>
          <Text style={styles.aboutText}>About The Static</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#070707" },
  scrollContent: { paddingHorizontal: 16, paddingVertical: 16, gap: 16 },
  header: { marginBottom: 4 },
  wordmark: {
    fontSize: 22,
    fontWeight: "700",
    color: "#ececec",
    letterSpacing: -0.045,
    textTransform: "uppercase",
    fontFamily: "Space Grotesk",
  },
  tagline: { fontSize: 13, color: "#8b8b8b", fontFamily: "IBM Plex Mono", letterSpacing: 0.14 },
  section: { marginBottom: 16 },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderColor: "#1a1a1a",
  },
  rowTitle: { fontSize: 14, color: "#ececec", fontWeight: "600" },
  rowSub: { fontSize: 12, color: "#8b8b8b", fontFamily: "IBM Plex Mono" },
  rowDanger: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderColor: "#1a1a1a",
  },
  rowTitleDanger: { fontSize: 14, color: "#ffffff" },
  rowSubDanger: { fontSize: 12, color: "#8b8b8b", fontFamily: "IBM Plex Mono" },
  about: { alignItems: "center", paddingVertical: 16 },
  aboutText: { fontSize: 12, color: "#8b8b8b", fontFamily: "IBM Plex Mono", letterSpacing: 0.14 },
});
