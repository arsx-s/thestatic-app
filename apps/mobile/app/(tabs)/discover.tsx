import { useState } from "react";
import {
  FlatList,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { supabase } from "../../src/lib/supabase";

type Member = {
  id: string;
  username: string;
  static_id: string;
  profile_photo_url: string | null;
  display_name: string | null;
  status: string;
};

const INTERESTS = [
  "Music",
  "Fashion",
  "Sneakers",
  "Football",
  "Gaming",
  "Photography",
  "Art",
  "Film",
  "Business",
  "Technology",
];

export default function DiscoverScreen() {
  const [query, setQuery] = useState("");
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedInterest, setSelectedInterest] = useState<string | null>(null);

  const searchMembers = async () => {
    if (!query) {
      setMembers([]);
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("members")
        .select("id, username, static_id, status")
        .ilike("username", `%${query}%`)
        .eq("status", "active")
        .limit(20);
      if (!error && data) setMembers(data as Member[]);
    } catch {
      setMembers([]);
    } finally {
      setLoading(false);
    }
  };

  const searchByStaticId = async () => {
    if (!/^ST-\d{5}$/.test(query)) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("members")
        .select("id, username, static_id, status")
        .eq("static_id", query)
        .single();
      if (!error && data) setMembers([data as Member]);
      else setMembers([]);
    } catch {
      setMembers([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.wordmark}>Discover</Text>
          <Text style={styles.tagline}>Members and interests</Text>
        </View>

        <View style={styles.searchCard}>
          <TextInput
            style={styles.input}
            value={query}
            onChangeText={setQuery}
            placeholder="Search by username or Static ID"
            autoCapitalize="none"
          />
          <TouchableOpacity style={styles.searchBtn} onPress={searchMembers}>
            <Text style={styles.searchBtnText}>Search</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.staticIdBtn} onPress={searchByStaticId}>
            <Text style={styles.staticIdBtnText}>Static ID</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Interests</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chips}
          >
            {INTERESTS.map((interest) => (
              <TouchableOpacity
                key={interest}
                style={[
                  styles.chip,
                  selectedInterest === interest && styles.chipActive,
                ]}
                onPress={() => setSelectedInterest(selectedInterest === interest ? null : interest)}
              >
                <Text style={[styles.chipText, selectedInterest === interest && { color: "#000" }]}>{interest}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Suggested members</Text>
          {loading ? (
            <View style={styles.skeletonRow} />
          ) : members.length === 0 ? (
            <Text style={styles.emptyText}>
              No members found. Try searching by username or Static ID.
            </Text>
          ) : (
            <FlatList
              data={members}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.memberRow}
                  onPress={() =>
                    // eslint-disable-next-line no-console
                    console.log("open profile", item.username)
                  }
                >
                  <View style={styles.avatarWrap}>
                    <View style={styles.avatarPlaceholder} />
                  </View>
                  <View style={styles.memberInfo}>
                    <Text style={styles.memberName}>{item.username}</Text>
                    <Text style={styles.memberId}>{item.static_id}</Text>
                  </View>
                  <Text style={styles.memberStatus}>{item.status}</Text>
                </TouchableOpacity>
              )}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
            />
          )}
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
  searchCard: {
    backgroundColor: "#0a0a0a",
    borderWidth: 1,
    borderColor: "#2b2b2b",
    borderRadius: 10,
    flexDirection: "row",
    overflow: "hidden",
    marginBottom: 20,
  },
  input: {
    flex: 1,
    backgroundColor: "#000",
    color: "#ececec",
    padding: 14,
    fontSize: 15,
  },
  searchBtn: {
    backgroundColor: "#1a1a1a",
    borderRightWidth: 1,
    borderColor: "#2b2b2b",
    paddingHorizontal: 16,
    justifyContent: "center",
  },
  searchBtnText: { color: "#ececec", fontFamily: "IBM Plex Mono", fontSize: 13 },
  staticIdBtn: {
    backgroundColor: "#1a1a1a",
    paddingHorizontal: 16,
    justifyContent: "center",
  },
  staticIdBtnText: { color: "#8b8b8b", fontFamily: "IBM Plex Mono", fontSize: 13 },
  section: { marginBottom: 20 },
  sectionLabel: {
    fontSize: 11,
    fontFamily: "IBM Plex Mono",
    color: "#8b8b8b",
    textTransform: "uppercase",
    letterSpacing: 0.14,
    marginBottom: 10,
  },
  chips: { gap: 10, paddingRight: 4 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#3a3a3a",
    borderRadius: 99,
    backgroundColor: "#0a0a0a",
  },
  chipActive: {
    backgroundColor: "#ececec",
    borderColor: "#ececec",
  },
  chipText: {
    color: "#c9c9c9",
    fontSize: 12,
    fontFamily: "IBM Plex Mono",
  },
  memberRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: "#1a1a1a",
  },
  avatarWrap: { width: 44, height: 44, borderRadius: 22 },
  avatarPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#1a1a1a",
    borderWidth: 1,
    borderColor: "#2b2b2b",
  },
  memberInfo: { flex: 1 },
  memberName: { fontSize: 14, color: "#ececec", fontWeight: "600" },
  memberId: { fontSize: 11, color: "#8b8b8b", fontFamily: "IBM Plex Mono" },
  memberStatus: { fontSize: 11, color: "#8b8b8b", fontFamily: "IBM Plex Mono" },
  emptyText: { color: "#8b8b8b", fontFamily: "IBM Plex Mono", fontSize: 13, textAlign: "center", marginTop: 30 },
  skeletonRow: {
    height: 60,
    backgroundColor: "#0a0a0a",
    borderWidth: 1,
    borderColor: "#2b2b2b",
    borderRadius: 10,
    marginBottom: 10,
  },
});
