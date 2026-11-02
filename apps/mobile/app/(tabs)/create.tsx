import { useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
} from "react-native";
import { supabase } from "../src/lib/supabase";

const AUDIENCES = [
  { value: "followers", label: "Followers" },
  { value: "in_sync", label: "In Sync" },
  { value: "all_members", label: "All Statics" },
  { value: "custom", label: "Custom audience" },
];

export default function CreateScreen() {
  const [caption, setCaption] = useState("");
  const [audience, setAudience] = useState("followers");
  const [allowComments, setAllowComments] = useState(true);
  const [mediaCount, setMediaCount] = useState(0);
  const [publishing, setPublishing] = useState(false);

  const handlePublish = async () => {
    if (!caption.trim()) {
      Alert.alert("Static", "Please enter a caption before publishing.");
      return;
    }
    setPublishing(true);
    try {
      const { error } = await supabase.functions.invoke("publish-post", {
        body: {
          audience,
          encrypted_content: caption,
          encrypted_media_reference: null,
          audience_reference: null,
        },
      });
      if (error) {
        Alert.alert("Publish failed", error.message || "Unknown error");
        return;
      }
      // Reset form
      setCaption("");
      setAudience("followers");
      setAllowComments(true);
      setMediaCount(0);
      Alert.alert("Static", "Post published.");
    } catch (err: any) {
      Alert.alert("Publish failed", err.message || "Unknown error");
    } finally {
      setPublishing(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.wordmark}>Create</Text>
          <Text style={styles.tagline}>Posts and stories</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Caption</Text>
          <TextInput
            style={styles.input}
            multiline
            numberOfLines={5}
            value={caption}
            onChangeText={setCaption}
            placeholder="What&apos;s on your frequency?"
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Media</Text>
          <View style={styles.mediaRow}>
            <TouchableOpacity style={styles.mediaOption} onPress={() => setMediaCount(1)}>
              <Text style={styles.mediaOptionText}>1 photo</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.mediaOption} onPress={() => setMediaCount(3)}>
              <Text style={styles.mediaOptionText}>Multiple photos</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.mediaOption} onPress={() => setMediaCount(-1)}>
              <Text style={styles.mediaOptionText}>Video</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.mediaOption} onPress={() => setMediaCount(-2)}>
              <Text style={styles.mediaOptionText}>Music attachment</Text>
            </TouchableOpacity>
          </View>
          {mediaCount > 0 && (
            <Text style={styles.mediaHint}>{mediaCount} media item(s) selected</Text>
          )}
          {mediaCount === -1 && <Text style={styles.mediaHint}>Video selected</Text>}
          {mediaCount === -2 && (
            <Text style={styles.mediaHint}>Music attachment (external link)</Text>
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Audience</Text>
          {AUDIENCES.map((a) => (
            <TouchableOpacity
              key={a.value}
              style={[
                styles.audienceOption,
                audience === a.value && styles.audienceActive,
              ]}
              onPress={() => setAudience(a.value)}
            >
              <Text style={[styles.audienceText, audience === a.value && { color: "#000" }]}>
                {a.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.card}>
          <TouchableOpacity
            style={styles.toggleRow}
            onPress={() => setAllowComments(!allowComments)}
          >
            <Text style={styles.toggleLabel}>Allow comments</Text>
            <Text style={styles.toggleValue}>{allowComments ? "On" : "Off"}</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.publish} onPress={handlePublish}>
          <Text style={styles.publishText}>Publish</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.cancel} onPress={() => {}}>
          <Text style={styles.cancelText}>Draft</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#070707" },
  scrollContent: { paddingHorizontal: 16, paddingVertical: 16, gap: 16 },
  header: { marginBottom: 16 },
  wordmark: {
    fontSize: 22,
    fontWeight: "700",
    color: "#ececec",
    letterSpacing: -0.045,
    textTransform: "uppercase",
    fontFamily: "Space Grotesk",
  },
  tagline: { fontSize: 13, color: "#8b8b8b", fontFamily: "IBM Plex Mono", letterSpacing: 0.14 },
  card: {
    backgroundColor: "#0a0a0a",
    borderWidth: 1,
    borderColor: "#2b2b2b",
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
  },
  label: {
    fontSize: 11,
    fontFamily: "IBM Plex Mono",
    color: "#8b8b8b",
    textTransform: "uppercase",
    letterSpacing: 0.14,
    marginBottom: 10,
  },
  input: {
    backgroundColor: "#000",
    borderWidth: 1,
    borderColor: "#3a3a3a",
    color: "#ececec",
    padding: 14,
    borderRadius: 10,
    fontSize: 15,
  },
  mediaRow: { flexDirection: "row", gap: 10, flexWrap: "wrap" },
  mediaOption: {
    flex: 1,
    minWidth: 120,
    backgroundColor: "#000",
    borderWidth: 1,
    borderColor: "#3a3a3a",
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
  },
  mediaOptionText: { fontSize: 12, color: "#c9c9c9", fontFamily: "IBM Plex Mono" },
  mediaHint: { fontSize: 12, color: "#8b8b8b", fontFamily: "IBM Plex Mono", marginTop: 8 },
  audienceOption: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: "#000",
    borderWidth: 1,
    borderColor: "#3a3a3a",
    borderRadius: 10,
    marginBottom: 8,
  },
  audienceActive: {
    backgroundColor: "#ececec",
    borderColor: "#ececec",
  },
  audienceText: { fontSize: 13, color: "#c9c9c9", fontFamily: "IBM Plex Mono" },
  toggleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: "#1a1a1a",
  },
  toggleLabel: { fontSize: 13, color: "#c9c9c9", fontFamily: "IBM Plex Mono" },
  toggleValue: { fontSize: 13, color: "#8b8b8b", fontFamily: "IBM Plex Mono" },
  publish: {
    backgroundColor: "#ececec",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 8,
  },
  publishText: {
    color: "#000",
    fontWeight: "700",
    fontFamily: "Space Grotesk",
    textTransform: "uppercase",
    letterSpacing: 0.06,
  },
  cancel: { alignItems: "center", marginTop: 8 },
  cancelText: { fontSize: 13, color: "#8b8b8b", fontFamily: "IBM Plex Mono" },
});
