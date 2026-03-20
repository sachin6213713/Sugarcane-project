import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    SafeAreaView,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
    Alert,
} from "react-native";
import { Stack, useRouter, Link } from "expo-router";
import { Ionicons, AntDesign } from "@expo/vector-icons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { supabase } from "../../utils/supabase";

export default function SignInScreen() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSignIn = async () => {
        if (!email.trim() || !password.trim()) {
            Alert.alert("Error", "Please fill in all fields");
            return;
        }

        setLoading(true);
        const { error } = await supabase.auth.signInWithPassword({
            email: email.trim(),
            password,
        });

        if (error) {
            Alert.alert("Sign In Failed", error.message);
            setLoading(false);
        } else {
            // Success: _layout.tsx will auto-redirect because session changes
            setLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        // Note: Google sign in requires extra setup in Supabase & mobile configuration
        // This is the implementation stub that triggers the web OAuth flow
        Alert.alert("Not fully configured", "Google OAuth requires native Google Sign-In setup.");
    };

    return (
        <SafeAreaView style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />

            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={styles.flex1}
            >
                <View style={styles.content}>
                    {/* Logo & Welcome */}
                    <View style={styles.headerContainer}>
                        <Image
                            source={require("../../assets/images/icon.png")}
                            style={styles.logo}
                            contentFit="contain"
                        />
                        <Text style={styles.title}>Welcome back</Text>
                        <Text style={styles.subtitle}>Sign in to continue your journey</Text>
                    </View>

                    {/* Form */}
                    <View style={styles.formContainer}>
                        <View style={styles.inputContainer}>
                            <Ionicons name="mail-outline" size={20} color="#777" style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Email"
                                placeholderTextColor="#999"
                                value={email}
                                onChangeText={setEmail}
                                autoCapitalize="none"
                                keyboardType="email-address"
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <Ionicons name="lock-closed-outline" size={20} color="#777" style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Password"
                                placeholderTextColor="#999"
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry
                            />
                        </View>

                        <TouchableOpacity style={styles.forgotPassword}>
                            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.signInButtonContainer}
                            onPress={handleSignIn}
                            disabled={loading}
                        >
                            <LinearGradient
                                colors={["#52B788", "#2D6A4F"]}
                                style={styles.signInButton}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                            >
                                {loading ? (
                                    <ActivityIndicator color="#FFF" />
                                ) : (
                                    <Text style={styles.signInButtonText}>Sign In</Text>
                                )}
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>

                    {/* Divider */}
                    <View style={styles.dividerContainer}>
                        <View style={styles.dividerLine} />
                        <Text style={styles.dividerText}>or continue with</Text>
                        <View style={styles.dividerLine} />
                    </View>

                    {/* Social Auth */}
                    <View style={styles.socialContainer}>
                        <TouchableOpacity style={styles.socialButton} onPress={handleGoogleSignIn}>
                            <AntDesign name="google" size={24} color="#DB4437" />
                            <Text style={styles.socialButtonText}>Google</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Footer */}
                    <View style={styles.footerContainer}>
                        <Text style={styles.footerText}>Don't have an account? </Text>
                        <Link href="/(auth)/sign-up" asChild>
                            <TouchableOpacity>
                                <Text style={styles.footerLink}>Sign Up</Text>
                            </TouchableOpacity>
                        </Link>
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
    content: {
        flex: 1,
        paddingHorizontal: 24,
        justifyContent: "center",
    },
    headerContainer: {
        alignItems: "center",
        marginBottom: 40,
    },
    logo: {
        width: 80,
        height: 80,
        marginBottom: 24,
        borderRadius: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: "800",
        color: "#111",
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 15,
        color: "#666",
        fontWeight: "500",
    },
    formContainer: {
        width: "100%",
    },
    inputContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#FFF",
        borderRadius: 16,
        marginBottom: 16,
        paddingHorizontal: 16,
        height: 56,
        borderWidth: 1,
        borderColor: "#EAEAEA",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.03,
        shadowRadius: 4,
        elevation: 1,
    },
    inputIcon: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: "#333",
        height: "100%",
    },
    forgotPassword: {
        alignSelf: "flex-end",
        marginBottom: 24,
    },
    forgotPasswordText: {
        color: "#2D6A4F",
        fontSize: 14,
        fontWeight: "600",
    },
    signInButtonContainer: {
        width: "100%",
        shadowColor: "#2D6A4F",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 5,
    },
    signInButton: {
        height: 56,
        borderRadius: 16,
        justifyContent: "center",
        alignItems: "center",
    },
    signInButtonText: {
        color: "#FFF",
        fontSize: 16,
        fontWeight: "700",
        letterSpacing: 0.5,
    },
    dividerContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginVertical: 32,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: "#E0E0E0",
    },
    dividerText: {
        paddingHorizontal: 16,
        color: "#888",
        fontSize: 13,
        fontWeight: "500",
        textTransform: "uppercase",
        letterSpacing: 0.5,
    },
    socialContainer: {
        flexDirection: "row",
        justifyContent: "center",
        marginBottom: 32,
    },
    socialButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#FFF",
        height: 56,
        width: "100%",
        borderRadius: 16,
        borderWidth: 1,
        borderColor: "#EAEAEA",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 4,
        elevation: 1,
    },
    socialButtonText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#333",
        marginLeft: 12,
    },
    footerContainer: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        paddingBottom: 20,
    },
    footerText: {
        color: "#666",
        fontSize: 14,
    },
    footerLink: {
        color: "#2D6A4F",
        fontSize: 14,
        fontWeight: "700",
    },
});
