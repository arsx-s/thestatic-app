import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function InboxScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.wordmark}>Inbox</Text>
          <Text style={styles.tagline}>Private messaging</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.tabLabel}>Chats</Text>
          <View style={styles.emptyList}>
            <Text style={styles.emptyText}>No direct chats yet.</Text>
            <Text style={styles.emptySub}>
              Mutual following opens a direct conversation.
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.tabLabel}>Message requests</Text>
          <View style={styles.emptyList}>
            <Text style={styles.emptyText}>No pending requests.</Text>
            <Text style={styles.emptySub}>
              Requests appear when someone outside your circle messages you.
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.tabLabel}>Archived chats</Text>
          <View style={styles.emptyList}>
            <Text style={styles.emptyText}>No archived chats.</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#070707" },
  scrollContent: { paddingHorizontal: 16, paddingVertical: 16, gap: 20 },
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
  section: { marginBottom: 20 },
  tabLabel: {
    fontSize: 11,
    fontFamily: "IBM Plex Mono",
    color: "#8b8b8b",
    textTransform: "uppercase",
    letterSpacing: 0.14,
    marginBottom: 10,
  },
  emptyList: { paddingVertical: 40, alignItems: "center" },
  emptyText: { fontSize: 15, color: "#ececec", fontWeight: "600", marginBottom: 6 },
  emptySub: { fontSize: 13, color: "#8b8b8b", textAlign: "center" },
});
