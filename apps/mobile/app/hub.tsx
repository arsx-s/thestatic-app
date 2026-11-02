import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function HubScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.wordmark}>Static Hub</Text>
          <Text style={styles.tagline}>Market, Store, Events</Text>
        </View>

        <TouchableOpacity style={styles.module} onPress={() => {}}>
          <View style={styles.moduleIcon}>M</View>
          <View>
            <Text style={styles.moduleTitle}>Static Marketplace</Text>
            <Text style={styles.moduleSub}>Member-to-member buying and selling</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.module} onPress={() => {}}>
          <View style={styles.moduleIcon}>S</View>
          <View>
            <Text style={styles.moduleTitle}>Static Store</Text>
            <Text style={styles.moduleSub}>Official merchandise and limited drops</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.module} onPress={() => {}}>
          <View style={styles.moduleIcon}>E</View>
          <View>
            <Text style={styles.moduleTitle}>Static Events</Text>
            <Text style={styles.moduleSub}>Events, registrations and tickets</Text>
          </View>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#070707" },
  scrollContent: { paddingHorizontal: 16, paddingVertical: 16, gap: 14 },
  header: { marginBottom: 10 },
  wordmark: {
    fontSize: 22,
    fontWeight: "700",
    color: "#ececec",
    letterSpacing: -0.045,
    textTransform: "uppercase",
    fontFamily: "Space Grotesk",
  },
  tagline: { fontSize: 13, color: "#8b8b8b", fontFamily: "IBM Plex Mono", letterSpacing: 0.14 },
  module: {
    backgroundColor: "#0a0a0a",
    borderWidth: 1,
    borderColor: "#2b2b2b",
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    marginBottom: 12,
  },
  moduleIcon: {
    width: 52,
    height: 52,
    borderRadius: 12,
    backgroundColor: "#1a1a1a",
    borderWidth: 1,
    borderColor: "#2b2b2b",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  moduleTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#ececec",
    fontFamily: "Space Grotesk",
    marginBottom: 4,
  },
  moduleSub: { fontSize: 12, color: "#8b8b8b", fontFamily: "IBM Plex Mono" },
});
