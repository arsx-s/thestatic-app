import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useAuthStore } from "../../src/store/auth";

export default function ProfileScreen() {
  const { member } = useAuthStore();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerCard}>
          <View style={styles.avatarWrap}>
            <View style={styles.avatarPlaceholder} />
          </View>
          <Text style={styles.username}>
            {member?.username ?? "static.username"}
          </Text>
          <Text style={styles.staticId}>
            STATIC ID / {member?.staticId ?? "ST-00001"}
          </Text>
          <Text style={styles.status}>{member?.status ?? "MEMBER"}</Text>
          <Text style={styles.bio}>
            Just existing somewhere between music and everything else.
          </Text>
          <View style={styles.metaRow}>
            <View style={styles.stat}>
              <Text style={styles.statValue}>24</Text>
              <Text style={styles.statLabel}>Posts</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statValue}>95</Text>
              <Text style={styles.statLabel}>Following</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statValue}>0</Text>
              <Text style={styles.statLabel}>In Sync</Text>
            </View>
          </View>
          <View style={styles.interests}>
            <Text style={styles.chip}>Music</Text>
            <Text style={styles.chip}>Gaming</Text>
            <Text style={styles.chip}>Fashion</Text>
            <Text style={styles.chip}>Photography</Text>
          </View>
          <TouchableOpacity style={styles.editBtn} onPress={() => {}}>
            <Text style={styles.editBtnText}>Edit profile</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Posts</Text>
          <View style={styles.emptyList}>
            <Text style={styles.emptyText}>No posts yet.</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#070707" },
  scrollContent: { paddingHorizontal: 16, paddingVertical: 16 },
  headerCard: {
    backgroundColor: "#0a0a0a",
    borderWidth: 1,
    borderColor: "#2b2b2b",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    marginBottom: 20,
  },
  avatarWrap: { width: 96, height: 96, borderRadius: 48, marginBottom: 14 },
  avatarPlaceholder: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: "#1a1a1a",
    borderWidth: 1,
    borderColor: "#2b2b2b",
  },
  username: {
    fontSize: 20,
    fontWeight: "700",
    color: "#ececec",
    letterSpacing: -0.045,
    fontFamily: "Space Grotesk",
    marginBottom: 4,
  },
  staticId: {
    fontSize: 12,
    fontFamily: "IBM Plex Mono",
    color: "#8b8b8b",
    letterSpacing: 0.14,
    textTransform: "uppercase",
    marginBottom: 2,
  },
  status: {
    fontSize: 11,
    color: "#8b8b8b",
    fontFamily: "IBM Plex Mono",
    textTransform: "uppercase",
    marginBottom: 12,
  },
  bio: { fontSize: 14, color: "#c9c9c9", lineHeight: 22, textAlign: "center", marginBottom: 16 },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginBottom: 14,
  },
  stat: { alignItems: "center" },
  statValue: { fontSize: 16, fontWeight: "700", color: "#ececec", fontFamily: "Space Grotesk" },
  statLabel: { fontSize: 10, color: "#8b8b8b", fontFamily: "IBM Plex Mono", letterSpacing: 0.14 },
  interests: { flexDirection: "row", gap: 8, marginBottom: 16 },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: "#3a3a3a",
    borderRadius: 99,
    backgroundColor: "#000",
  },
  editBtn: {
    backgroundColor: "#ececec",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  editBtnText: {
    color: "#000",
    fontWeight: "700",
    fontFamily: "Space Grotesk",
    textTransform: "uppercase",
    letterSpacing: 0.06,
  },
  section: { marginBottom: 20 },
  sectionLabel: {
    fontSize: 11,
    fontFamily: "IBM Plex Mono",
    color: "#8b8b8b",
    textTransform: "uppercase",
    letterSpacing: 0.14,
    marginBottom: 10,
  },
  emptyList: { paddingVertical: 40, alignItems: "center" },
  emptyText: { color: "#8b8b8b", fontFamily: "IBM Plex Mono", fontSize: 13 },
});
