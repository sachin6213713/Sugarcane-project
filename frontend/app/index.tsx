import React, { useState, useEffect, useRef } from "react";
import {
  Text,
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { Stack, useRouter } from "expo-router";
import { Ionicons, Feather } from "@expo/vector-icons";
import { Image } from "expo-image";
import { getChatHistory, sendChatMessage, getUser, ChatMessage, clearChatHistory } from "../utils/api";
import { supabase } from "../utils/supabase";
import { isProMember } from "../utils/revenuecat";

export default function Index() {
  const router = useRouter();
  const [inputText, setInputText] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>("U");
  const [isPro, setIsPro] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.id) {
        setUserId(session.user.id);

        // Fetch user profile from database
        try {
          const profile = await getUser(session.user.id);
          if (profile && profile.name) {
            setUserName(profile.name);
          } else {
            setUserName(session.user.user_metadata?.full_name || "User");
          }
        } catch (error) {
          console.error("Failed to fetch user from DB:", error);
          setUserName(session.user.user_metadata?.full_name || "User");
        }

        // Load chat history
        loadChatHistory(session.user.id);

        // Fetch Pro status in the background
        try {
          const proStatus = await isProMember();
          setIsPro(proStatus);
        } catch (err) {
          console.error("Failed to fetch Pro status:", err);
          setIsPro(false);
        }
      }
    };
    init();
  }, []);

  const loadChatHistory = async (uid: string) => {
    try {
      setIsLoading(true);
      const history = await getChatHistory(uid);
      setMessages(history);
    } catch (error) {
      console.error("Failed to load history:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = async () => {
    if (!inputText.trim() || isSending || !userId) return;

    const userMsg = inputText.trim();
    setInputText("");
    setIsSending(true);

    const tempUserMsg: ChatMessage = {
      id: `temp-${Date.now()}`,
      user_id: userId,
      role: "user",
      message: userMsg,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempUserMsg]);

    try {
      const aiReply = await sendChatMessage(userId, "user", userMsg);
      setMessages((prev) => [...prev, aiReply]);
    } catch (error) {
      console.error("Failed to send message:", error);
      alert("Failed to get response from AI assistant. Please try again.");
      setMessages((prev) => prev.filter(m => m.id !== tempUserMsg.id));
    } finally {
      setIsSending(false);
    }
  };

  const handleNewChat = async () => {
    if (!userId) return;
    try {
      await clearChatHistory(userId);
      setMessages([]);
    } catch (error) {
      console.error("Failed to clear chat history:", error);
      alert("Failed to start a new chat.");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.flex1}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <TouchableOpacity
              style={styles.menuButton}
              onPress={() => router.push("/profile")}
            >
              <View style={styles.userAvatarHeader}>
                <Text style={styles.userAvatarText}>{userName.charAt(0).toUpperCase()}</Text>
              </View>
            </TouchableOpacity>
          </View>

          <View style={styles.titleWrapper}>
            <Text style={styles.headerTitle}>Helper Cane</Text>
            {isPro && (
              <View style={styles.proBadge}>
                <Ionicons name="star" size={10} color="#B8860B" />
                <Text style={styles.proBadgeText}>PRO</Text>
              </View>
            )}
          </View>

          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.headerIcon} onPress={handleNewChat}>
              <Ionicons name="refresh" size={20} color="#444" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Chat Area */}
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={styles.scrollContent}
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
        >
          {isLoading ? (
            <ActivityIndicator size="large" color="#2E7D32" style={{ marginTop: 20 }} />
          ) : messages.length === 0 ? (
            <View style={styles.messageRow}>
              <Image
                source={require("../assets/images/ai_avatar.png")}
                style={styles.avatar}
              />
              <View style={styles.messageBubble}>
                <Text style={styles.messageText}>
                  {"Hi there! I'm your digital Food & Skin Assistant. I'm here to provide personalized advice on your skincare routine and help you choose safe, skin-friendly foods based on your profile.\n\nPlease note that I'm a helpful robot, not a doctor. Consult a specialist before following my tips."}
                </Text>
              </View>
            </View>
          ) : (
            messages.map((msg) => (
              <View
                key={msg.id}
                style={[
                  styles.messageRow,
                  msg.role === "user" && { flexDirection: "row-reverse" },
                ]}
              >
                {msg.role === "assistant" ? (
                  <Image
                    source={require("../assets/images/ai_avatar.png")}
                    style={styles.avatar}
                  />
                ) : (
                  <View style={[styles.avatar, styles.userAvatar]}>
                    <Text style={styles.userAvatarText}>{userName.charAt(0).toUpperCase()}</Text>
                  </View>
                )}
                <View
                  style={[
                    styles.messageBubble,
                    msg.role === "user" ? styles.userBubble : styles.assistantBubble,
                  ]}
                >
                  <Text
                    style={[
                      styles.messageText,
                      msg.role === "user" && { color: "#FFF" },
                    ]}
                  >
                    {msg.message}
                  </Text>
                </View>
              </View>
            ))
          )}
        </ScrollView>

        {/* Suggestions */}
        <View style={styles.suggestionsContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {["Which foods cause acne?", "Safe snacks?", "Oily skin tips?"].map((s) => (
              <TouchableOpacity
                key={s}
                style={styles.suggestionChip}
                onPress={() => setInputText(s)}
              >
                <Text style={styles.suggestionText}>{s}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Input Area */}
        <View style={styles.inputContainer}>
          <View style={styles.darkPill}>
            <TouchableOpacity style={styles.pillIcon}>
              <Ionicons name="add" size={24} color="#BBB" />
            </TouchableOpacity>
            <TextInput
              style={styles.pillTextInput}
              placeholder="Ask your question"
              value={inputText}
              onChangeText={setInputText}
              placeholderTextColor="#888"
              onSubmitEditing={handleSend}
            />
            <TouchableOpacity
              onPress={handleSend}
              disabled={!inputText.trim() || isSending}
              style={[
                styles.pillSendButton,
                { backgroundColor: inputText.trim() ? "#2E7D32" : "#2E7D32", opacity: inputText.trim() ? 1 : 0.6 },
              ]}
            >
              {isSending ? (
                <ActivityIndicator size="small" color="#FFF" />
              ) : (
                <Ionicons name="arrow-up" size={24} color="#FFF" />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFBF0",
  },
  flex1: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 12,
    backgroundColor: "#FFF",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.05)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  headerLeft: {
    width: 44,
    alignItems: "flex-start",
  },
  headerRight: {
    width: 44,
    alignItems: "flex-end",
  },
  titleWrapper: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111",
    letterSpacing: -0.5,
  },
  proBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFD70030",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginLeft: 8,
    borderWidth: 1,
    borderColor: "#FFD70050",
  },
  proBadgeText: {
    color: "#856404",
    fontSize: 10,
    fontWeight: "900",
    marginLeft: 4,
  },
  menuButton: {
    width: 32,
    height: 32,
  },
  headerIcon: {
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  userAvatarHeader: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#2E7D32",
    justifyContent: "center",
    alignItems: "center",
  },
  userAvatarText: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "600",
  },
  scrollContent: {
    padding: 20,
  },
  messageRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 10,
    marginTop: 4,
  },
  userAvatar: {
    backgroundColor: "#2E7D32",
    justifyContent: "center",
    alignItems: "center",
  },
  messageBubble: {
    flex: 1,
    backgroundColor: "#FFF",
    padding: 16,
    borderRadius: 20,
    borderTopLeftRadius: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  userBubble: {
    backgroundColor: "#2E7D32",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 4,
    borderColor: "#1B5E20",
  },
  assistantBubble: {
    backgroundColor: "#FFF",
    borderTopLeftRadius: 4,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
    color: "#333",
  },
  suggestionsContainer: {
    paddingVertical: 8,
    paddingLeft: 20,
  },
  suggestionChip: {
    backgroundColor: "#E8F5E9",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 15,
    marginRight: 10,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#C8E6C9",
  },
  suggestionText: {
    fontSize: 14,
    color: "#2E7D32",
    fontWeight: "500",
  },
  inputContainer: {
    paddingHorizontal: 15,
    paddingTop: 5,
    paddingBottom: 20,
    backgroundColor: "#FFFBF0",
  },
  darkPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#222",
    borderRadius: 30,
    height: 60,
    paddingHorizontal: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  pillIcon: {
    padding: 5,
  },
  pillTextInput: {
    flex: 1,
    color: "#FFF",
    fontSize: 16,
    marginHorizontal: 10,
    paddingVertical: 10,
  },
  pillSendButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 5,
  },
});
