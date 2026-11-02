import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Alert } from "react-native";
import { useAuthStore } from "../../src/store/auth";
import { supabase } from "../../src/lib/supabase";

type PostAuthor = {
  id: string;
  username: string;
  static_id: string;
  profile_photo_url: string | null;
  display_name: string | null;
};

type Post = {
  id: string;
  author_id: string;
  audience: string;
  encrypted_content: string;
  encrypted_media_reference: string | null;
  created_at: string;
  author?: PostAuthor;
};

type Story = {
  id: string;
  author_id: string;
  audience: string;
  expires_at: string;
  created_at: string;
  author?: PostAuthor;
};

export default function HomeScreen() {
  const router = useRouter();
  const [stories, setStories] = useState<Story[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [cursor, setCursor] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    void loadStories();
    void loadFeed();
  }, []);

  const loadStories = async () => {
    try {
      const { data, error } = await supabase
        .from("stories")
        .select(
          `id, author_id, audience, expires_at, created_at,
           author:author_id (id, username, static_id, profile_photo_url, display_name)`,
        )
        .order("created_at", { ascending: false })
        .limit(12);
      if (!error && data) setStories(data as unknown as Story[]);
    } catch {
      // stories load failure is non-fatal
    }
  };

  const loadFeed = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("posts")
        .select(
          `id, author_id, audience, encrypted_content, encrypted_media_reference, created_at,
           author:author_id (id, username, static_id, profile_photo_url, display_name)`,
        )
        .order("created_at", { ascending: false })
        .limit(12);
      if (!error && data) {
        setPosts(data as unknown as Post[]);
        setCursor(data[data.length - 1]?.created_at ?? null);
      }
    } catch {
      // feed load failure handled by empty state
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const loadMore = async () => {
    if (!cursor) return;
    try {
      const { data, error } = await supabase
        .from("posts")
        .select(
          `id, author_id, audience, encrypted_content, encrypted_media_reference, created_at,
           author:author_id (id, username, static_id, profile_photo_url, display_name)`,
        )
        .order("created_at", { ascending: false })
        .lt("created_at", cursor)
        .limit(12);
      if (!error && data) {
        setPosts((prev) => [...prev, ...(data as unknown as Post[])]);
        setCursor(data[data.length - 1]?.created_at ?? null);
      }
    } catch {
      // ignore
    }
  };

  const handleLike = () => {
    Alert.alert("Static", "Like action requires a logged-in member session.");
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadFeed();
    setRefreshing(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        refreshControl={
          refreshing ? (
            <ActivityIndicator style={styles.spinner} color="#ececec" size="small" />
          ) : undefined
        }
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.wordmark}>THE STATIC</Text>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => router.push("/hub")}
          >
            <Text style={styles.hubText}>Hub</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.storiesSection}>
          <Text style={styles.sectionLabel}>Stories</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.storiesList}
          >
            {stories.map((story) => (
              <TouchableOpacity
                key={story.id}
                style={styles.storyCircle}
                onPress={() => router.push(`/story/${story.id}`)}
              >
                <View style={styles.avatarWrap}>
                  {story.author?.profile_photo_url ? (
                    <Image
                      source={{ uri: story.author.profile_photo_url }}
                      style={styles.avatar}
                    />
                  ) : (
                    <View style={styles.avatarPlaceholder} />
                  )}
                  <View style={styles.ring} />
                </View>
                <Text style={styles.storyName} numberOfLines={1}>
                  {story.author?.username ?? "Static"}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.feedSection}>
          <View style={styles.feedHeader}>
            <Text style={styles.sectionLabel}>Following feed</Text>
            <Text style={styles.feedSubtitle}>Chronological · ISSUE/001</Text>
          </View>

          {loading ? (
            <View style={styles.skeletonList}>
              {Array.from({ length: 4 }).map((_, i) => (
                <View key={i} style={styles.postSkeleton} />
              ))}
            </View>
          ) : posts.length === 0 ? (
            <View style={styles.empty}>
              <Text style={styles.emptyText}>No posts yet.</Text>
              <Text style={styles.emptySub}>
                Follow Statics in Discover to see posts here.
              </Text>
            </View>
          ) : (
            <FlatList
              data={posts}
              renderItem={({ item }) => <PostCard post={item} onLike={handleLike} />}
              keyExtractor={(item) => item.id}
              onEndReached={loadMore}
              onEndReachedThreshold={0.5}
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

type PostCardProps = { post: Post; onLike: () => void };

function PostCard({ post, onLike }: PostCardProps) {
  const [liked, setLiked] = useState(false);
  const staticId = post.author?.static_id ?? "ST-00000";

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.authorRow}>
          <View style={styles.avatarWrap}>
            <View style={styles.avatarPlaceholder} />
          </View>
          <View>
            <Text style={styles.authorName}>{post.author?.username ?? "Static"}</Text>
            <Text style={styles.meta}>{staticId} · just now</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.menu}>
          <Text style={styles.menuIcon}>···</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.cardBody}>
        <Text style={styles.caption}>Encrypted post content — decrypted on device.</Text>
      </View>

      {post.encrypted_media_reference && <View style={styles.mediaPlaceholder} />}

      <View style={styles.actions}>
        <TouchableOpacity style={styles.action} onPress={() => { setLiked(!liked); onLike(); }}>
          <Text style={styles.actionIcon}>{liked ? "♥" : "♡"}</Text>
          <Text style={styles.actionLabel}>Like</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.action}>
          <Text style={styles.actionIcon}>·</Text>
          <Text style={styles.actionLabel}>Comment</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.action}>
          <Text style={styles.actionIcon}>›</Text>
          <Text style={styles.actionLabel}>Repost</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.action}>
          <Text style={styles.actionIcon}>›</Text>
          <Text style={styles.actionLabel}>Save</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.action}>
          <Text style={styles.actionIcon}>□</Text>
          <Text style={styles.actionLabel}>Share</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#070707" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  wordmark: {
    fontSize: 20,
    fontWeight: "700",
    color: "#ececec",
    letterSpacing: -0.045,
    textTransform: "uppercase",
    fontFamily: "Space Grotesk",
  },
  iconButton: { padding: 6 },
  hubText: { fontSize: 13, fontFamily: "IBM Plex Mono", color: "#8b8b8b", letterSpacing: 0.14 },
  storiesSection: { marginBottom: 20 },
  sectionLabel: {
    fontSize: 11,
    fontFamily: "IBM Plex Mono",
    color: "#8b8b8b",
    textTransform: "uppercase",
    letterSpacing: 0.14,
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  storiesList: { paddingHorizontal: 16, gap: 14 },
  storyCircle: { alignItems: "center", width: 72 },
  avatarWrap: { position: "relative", width: 56, height: 56 },
  avatar: { width: 56, height: 56, borderRadius: 28 },
  avatarPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#1a1a1a",
    borderWidth: 1,
    borderColor: "#2b2b2b",
  },
  ring: {
    position: "absolute",
    top: -3,
    left: -3,
    right: -3,
    bottom: -3,
    borderWidth: 2,
    borderColor: "#ececec",
    borderRadius: 32,
  },
  storyName: {
    fontSize: 12,
    color: "#c9c9c9",
    marginTop: 6,
    maxWidth: 72,
    textAlign: "center",
  },
  feedSection: { marginBottom: 40 },
  feedHeader: {
    paddingHorizontal: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  feedSubtitle: {
    fontSize: 12,
    color: "#8b8b8b",
    fontFamily: "IBM Plex Mono",
    letterSpacing: 0.14,
  },
  card: {
    backgroundColor: "#0a0a0a",
    borderWidth: 1,
    borderColor: "#2b2b2b",
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 16,
    overflow: "hidden",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 14,
  },
  authorRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  authorName: {
    fontSize: 15,
    color: "#ececec",
    fontWeight: "600",
    fontFamily: "Space Grotesk",
  },
  meta: { fontSize: 12, color: "#8b8b8b", fontFamily: "IBM Plex Mono" },
  menu: { padding: 6 },
  menuIcon: { fontSize: 18, color: "#8b8b8b" },
  cardBody: { paddingHorizontal: 14 },
  caption: {
    fontSize: 15,
    color: "#c9c9c9",
    lineHeight: 22,
    marginBottom: 12,
    fontFamily: "Inter",
  },
  mediaPlaceholder: {
    height: 300,
    backgroundColor: "#111",
    borderWidth: 1,
    borderColor: "#2b2b2b",
    borderRadius: 10,
    marginBottom: 10,
  },
  actions: {
    flexDirection: "row",
    paddingHorizontal: 14,
    paddingBottom: 14,
    gap: 20,
  },
  action: { alignItems: "center", gap: 6 },
  actionIcon: { fontSize: 18, color: "#8b8b8b", marginBottom: 2 },
  actionLabel: { fontSize: 11, color: "#8b8b8b", fontFamily: "IBM Plex Mono", letterSpacing: 0.14 },
  empty: { alignItems: "center", paddingVertical: 60, paddingHorizontal: 24 },
  emptyText: { fontSize: 16, color: "#ececec", fontWeight: "600", marginBottom: 6 },
  emptySub: { fontSize: 13, color: "#8b8b8b", textAlign: "center" },
  skeletonList: { paddingHorizontal: 16, gap: 16 },
  postSkeleton: {
    height: 260,
    backgroundColor: "#0a0a0a",
    borderWidth: 1,
    borderColor: "#2b2b2b",
    borderRadius: 12,
  },
  spinner: { marginTop: 24 },
});
