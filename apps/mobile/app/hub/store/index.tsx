import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function StoreScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.wordmark}>Static Store</Text>
          <Text style={styles.tagline}>Official merchandise &middot; BDT</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Catalogue</Text>
          <View style={styles.emptyList}>
            <Text style={styles.emptyText}>No products yet.</Text>
            <Text style={styles.emptySub}>
              Merchandise drops appear here when published by administrators.
            </Text>
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
  sectionLabel: {
    fontSize: 11,
    fontFamily: "IBM Plex Mono",
    color: "#8b8b8b",
    textTransform: "uppercase",
    letterSpacing: 0.14,
    marginBottom: 10,
  },
  emptyList: {
    paddingVertical: 50,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#1a1a1a",
    borderRadius: 12,
    backgroundColor: "#0a0a0a",
  },
  emptyText: { fontSize: 15, color: "#ececec", fontWeight: "600", marginBottom: 6 },
  emptySub: { fontSize: 13, color: "#8b8b8b", textAlign: "center" },
});
