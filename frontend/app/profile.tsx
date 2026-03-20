import React, { useRef, useState, useCallback } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    SafeAreaView,
    Platform,
    Animated,
    ActivityIndicator,
} from "react-native";
import { Stack, useRouter, useFocusEffect } from "expo-router";
import { Ionicons, Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { getUser, User } from "../utils/api";
import { supabase } from "../utils/supabase";
import RevenueCatUI from "react-native-purchases-ui";

export default function ProfileScreen() {
    const router = useRouter();
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(20)).current;
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [showPaywall, setShowPaywall] = useState(false);

    useFocusEffect(
        useCallback(() => {
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 600,
                    useNativeDriver: true,
                }),
                Animated.timing(slideAnim, {
                    toValue: 0,
                    duration: 600,
                    useNativeDriver: true,
                }),
            ]).start();

            const fetchUser = async () => {
                try {
                    const { data: { session } } = await supabase.auth.getSession();
                    if (!session?.user) return;

                    setUser({
                        id: session.user.id,
                        name: session.user.user_metadata?.full_name || "User",
                        email: session.user.email || "",
                        created_at: ""
                    });

                    // Attempt background sync if they have more profile data
                    getUser(session.user.id).then(data => setUser(data)).catch(() => { });
                } catch (error) {
                    console.error("Failed to load user:", error);
                } finally {
                    setIsLoading(false);
                }
            };
            fetchUser();
        }, [])
    );

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        // Layout handles redirecting to sign-in
    };

    const handleClose = () => {
        router.back();
    };

    return (
        <SafeAreaView style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Profile</Text>
                <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
                    <Ionicons name="close" size={20} color="#333" />
                </TouchableOpacity>
            </View>

            <Animated.ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}
            >
                {/* User Info Section */}
                <View style={styles.userInfoSection}>
                    <View style={styles.avatarOuterRing}>
                        <LinearGradient
                            colors={["#52B788", "#2D6A4F"]}
                            style={styles.avatarGradientRing}
                        >
                            <View style={styles.avatarContainer}>
                                <Image
                                    source={require("../assets/images/ai_avatar.png")}
                                    style={styles.avatar}
                                />
                            </View>
                        </LinearGradient>
                    </View>
                    {isLoading ? (
                        <ActivityIndicator color="#2D6A4F" />
                    ) : (
                        <>
                            <Text style={styles.userName}>{user?.name || "Guest User"}</Text>
                            <Text style={styles.userEmail}>{user?.email || "No email available"}</Text>
                        </>
                    )}
                </View>

                {/* Premium Banner */}
                <TouchableOpacity
                    style={styles.premiumBannerContainer}
                    activeOpacity={0.9}
                    onPress={async () => {
                        console.log('Premium banner pressed. RevenueCatUI keys:', Object.keys(RevenueCatUI || {}));
                        try {
                            if (RevenueCatUI && typeof RevenueCatUI.presentPaywall === 'function') {
                                console.log('Attempting to present native paywall...');
                                await RevenueCatUI.presentPaywall();
                            } else {
                                console.log('presentPaywall not found, showing fallback UI.');
                                setShowPaywall(true);
                            }
                        } catch (err) {
                            console.error('Error in presentPaywall:', err);
                            setShowPaywall(true);
                        }
                    }}
                >
                    <LinearGradient
                        colors={["#2D6A4F", "#1B4332", "#081C15"]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.premiumBanner}
                    >
                        <View style={styles.premiumContent}>
                            <View style={styles.premiumBadge}>
                                <Ionicons name="sparkles" size={14} color="#FFD700" />
                                <Text style={styles.premiumBadgeText}>PRO MEMBER</Text>
                            </View>
                            <Text style={styles.premiumTitle}>Sugarcane Gold</Text>
                            <Text style={styles.premiumSubtitle}>Exclusive access to all AI features</Text>
                        </View>
                        <View style={styles.premiumArrow}>
                            <Ionicons name="chevron-forward" size={24} color="#FFF" />
                        </View>
                    </LinearGradient>
                </TouchableOpacity>

                {/* Settings Group 1 */}
                <View style={styles.settingsGroup}>
                    <TouchableOpacity style={styles.settingsItem}>
                        <View style={styles.settingsItemLeft}>
                            <View style={[styles.iconContainer, { backgroundColor: "#E8F5E9" }]}>
                                <Ionicons name="leaf-outline" size={20} color="#2E7D32" />
                            </View>
                            <Text style={styles.settingsItemText}>Skin & Hair Profile</Text>
                        </View>
                        <View style={styles.settingsItemRight}>
                            <Ionicons name="chevron-forward" size={18} color="#BBB" />
                        </View>
                    </TouchableOpacity>

                    <View style={styles.separator} />

                    <TouchableOpacity style={styles.settingsItem}>
                        <View style={styles.settingsItemLeft}>
                            <View style={[styles.iconContainer, { backgroundColor: "#FFF3E0" }]}>
                                <Ionicons name="heart-outline" size={20} color="#EF6C00" />
                            </View>
                            <Text style={styles.settingsItemText}>Skincare Routine</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={18} color="#BBB" />
                    </TouchableOpacity>

                    <View style={styles.separator} />

                    <TouchableOpacity style={styles.settingsItem}>
                        <View style={styles.settingsItemLeft}>
                            <View style={[styles.iconContainer, { backgroundColor: "#E3F2FD" }]}>
                                <Ionicons name="star-outline" size={20} color="#1565C0" />
                            </View>
                            <Text style={styles.settingsItemText}>My Reviews</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={18} color="#BBB" />
                    </TouchableOpacity>
                </View>

                {/* Settings Group 2 */}
                <View style={styles.settingsGroup}>
                    <TouchableOpacity style={styles.settingsItem}>
                        <View style={styles.settingsItemLeft}>
                            <View style={[styles.iconContainer, { backgroundColor: "#F3E5F5" }]}>
                                <Feather name="user" size={20} color="#7B1FA2" />
                            </View>
                            <Text style={styles.settingsItemText}>Manage Account</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={18} color="#BBB" />
                    </TouchableOpacity>

                    <View style={styles.separator} />

                    <TouchableOpacity style={styles.settingsItem}>
                        <View style={styles.settingsItemLeft}>
                            <View style={[styles.iconContainer, { backgroundColor: "#ECEFF1" }]}>
                                <Feather name="shield" size={20} color="#455A64" />
                            </View>
                            <Text style={styles.settingsItemText}>Privacy Policy</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={18} color="#BBB" />
                    </TouchableOpacity>

                    <View style={styles.separator} />

                    <TouchableOpacity style={styles.settingsItem}>
                        <View style={styles.settingsItemLeft}>
                            <View style={[styles.iconContainer, { backgroundColor: "#FBE9E7" }]}>
                                <Feather name="file-text" size={20} color="#BF360C" />
                            </View>
                            <Text style={styles.settingsItemText}>Terms of Service</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={18} color="#BBB" />
                    </TouchableOpacity>

                    <View style={styles.separator} />

                    <TouchableOpacity style={styles.settingsItem} onPress={handleSignOut}>
                        <View style={styles.settingsItemLeft}>
                            <View style={[styles.iconContainer, { backgroundColor: "#FFEBEE" }]}>
                                <Ionicons name="log-out-outline" size={20} color="#D32F2F" />
                            </View>
                            <Text style={[styles.settingsItemText, { color: "#D32F2F" }]}>Log Out</Text>
                        </View>
                    </TouchableOpacity>
                </View>
            </Animated.ScrollView>

            {showPaywall && (
                <View style={StyleSheet.absoluteFill}>
                    <View style={styles.fallbackPaywall}>
                        <LinearGradient
                            colors={["#2D6A4F", "#081C15"]}
                            style={styles.fallbackContent}
                        >
                            <Ionicons name="sparkles" size={64} color="#FFD700" style={{ marginBottom: 20 }} />
                            <Text style={styles.fallbackTitle}>Sugarcane Gold</Text>
                            <Text style={styles.fallbackSubtitle}>
                                The RevenueCat Paywall requires a Development Build to display natively.
                            </Text>
                            <TouchableOpacity
                                style={styles.fallbackButton}
                                onPress={() => setShowPaywall(false)}
                            >
                                <Text style={styles.fallbackButtonText}>Close Demo</Text>
                            </TouchableOpacity>
                        </LinearGradient>
                    </View>
                </View>
            )}
        </SafeAreaView>
    );
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#FFFBF0",
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 20,
        paddingTop: 10,
        paddingBottom: 15,
        marginTop: 10,
        backgroundColor: "#FFF",
        borderBottomWidth: 1,
        borderBottomColor: "#F0EAD6",
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: "700",
        color: "#111",
    },
    closeButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: "transparent",
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#E0E0E0",
    },
    scrollContent: {
        paddingBottom: 40,
    },
    userInfoSection: {
        alignItems: "center",
        marginTop: 40,
        marginBottom: 30,
    },
    avatarOuterRing: {
        width: 110,
        height: 110,
        borderRadius: 55,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 15,
        shadowColor: "#52B788",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
        elevation: 5,
    },
    avatarGradientRing: {
        width: "100%",
        height: "100%",
        borderRadius: 55,
        justifyContent: "center",
        alignItems: "center",
        padding: 3,
    },
    avatarContainer: {
        width: "100%",
        height: "100%",
        borderRadius: 55,
        backgroundColor: "#FFF",
        justifyContent: "center",
        alignItems: "center",
        overflow: "hidden",
        borderWidth: 2,
        borderColor: "#FFF",
    },
    avatar: {
        width: "100%",
        height: "100%",
    },
    userName: {
        fontSize: 24,
        fontWeight: "800",
        color: "#111",
        letterSpacing: -0.5,
        marginBottom: 4,
    },
    userEmail: {
        fontSize: 14,
        color: "#666",
        fontWeight: "500",
    },
    premiumBannerContainer: {
        marginHorizontal: 20,
        marginBottom: 30,
        borderRadius: 24,
        overflow: "hidden",
        elevation: 8,
        shadowColor: "#1B4332",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    premiumBanner: {
        padding: 24,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    premiumContent: {
        flex: 1,
    },
    premiumBadge: {
        backgroundColor: "rgba(255, 215, 0, 0.2)",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        alignSelf: "flex-start",
        marginBottom: 12,
        borderWidth: 1,
        borderColor: "rgba(255, 215, 0, 0.3)",
    },
    premiumBadgeText: {
        color: "#FFD700",
        fontSize: 12,
        fontWeight: "800",
        letterSpacing: 1,
    },
    premiumTitle: {
        color: "#FFF",
        fontSize: 22,
        fontWeight: "800",
        marginBottom: 6,
    },
    premiumSubtitle: {
        color: "rgba(255, 255, 255, 0.8)",
        fontSize: 14,
        fontWeight: "500",
    },
    premiumIconContainer: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: "rgba(255, 255, 255, 0.15)",
        justifyContent: "center",
        alignItems: "center",
        marginLeft: 15,
    },
    premiumArrow: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: "rgba(255,255,255,0.15)",
        justifyContent: "center",
        alignItems: "center",
        marginLeft: 15,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.2)",
    },
    settingsGroup: {
        backgroundColor: "#FFF",
        borderRadius: 24,
        marginHorizontal: 20,
        marginBottom: 20,
        paddingVertical: 8,
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
    },
    settingsItem: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: 14,
        paddingHorizontal: 16,
    },
    settingsItemLeft: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
    },
    iconContainer: {
        width: 42,
        height: 42,
        borderRadius: 12,
        justifyContent: "center",
        alignItems: "center",
        marginRight: 16,
    },
    settingsItemText: {
        fontSize: 16,
        color: "#333",
        fontWeight: "600",
    },
    settingsItemRight: {
        flexDirection: "row",
        alignItems: "center",
    },
    separator: {
        height: 1,
        backgroundColor: "#F9F9F9",
        marginHorizontal: 20,
    },
    fallbackPaywall: {
        flex: 1,
        backgroundColor: "rgba(20, 40, 30, 0.95)", // Dark green, not pitch black
        justifyContent: "center",
        alignItems: "center",
    },
    fallbackContent: {
        width: "85%",
        padding: 40,
        borderRadius: 32,
        alignItems: "center",
        elevation: 10,
    },
    fallbackTitle: {
        color: "#FFF",
        fontSize: 28,
        fontWeight: "800",
        marginBottom: 10,
    },
    fallbackSubtitle: {
        color: "rgba(255,255,255,0.7)",
        fontSize: 16,
        textAlign: "center",
        marginBottom: 30,
        lineHeight: 24,
    },
    fallbackButton: {
        backgroundColor: "#FFF",
        paddingHorizontal: 30,
        paddingVertical: 15,
        borderRadius: 25,
    },
    fallbackButtonText: {
        color: "#2D6A4F",
        fontWeight: "700",
        fontSize: 16,
    },
});
