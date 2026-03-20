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
import { Ionicons, AntDesign, Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { supabase } from "../../utils/supabase";

export default function SignUpScreen() {
    const router = useRouter();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSignUp = async () => {
        if (!name.trim() || !email.trim() || !password.trim()) {
            Alert.alert("Error", "Please fill in all fields");
            return;
        }

        setLoading(true);
        // Uses Supabase auth signup, passing display name via meta_data
        const { error, data } = await supabase.auth.signUp({
            email: email.trim(),
            password,
            options: {
                data: {
                    full_name: name.trim(),
                },
            },
        });

        if (error) {
            Alert.alert("Sign Up Failed", error.message);
            setLoading(false);
        } else {
            console.log("Signup success:", data);
            Alert.alert(
                "Check your email",
                "We sent you an email with a link to verify your account."
            );
            setLoading(false);
        }
    };

    const handleGoogleSignUp = async () => {
        Alert.alert("Not fully configured", "Google OAuth requires native Google Sign-In setup.");
    };

    return (
        <SafeAreaView style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />

            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={styles.flex1}
            >
                {/* Custom Back Button */}
                <View style={styles.topBar}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color="#333" />
                    </TouchableOpacity>
                </View>

                <View style={styles.content}>
                    {/* Header */}
                    <View style={styles.headerContainer}>
                        <Text style={styles.title}>Create Account</Text>
                        <Text style={styles.subtitle}>Join us and unlock your potential</Text>
                    </View>

                    {/* Form */}
                    <View style={styles.formContainer}>
                        <View style={styles.inputContainer}>
                            <Feather name="user" size={20} color="#777" style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Full Name"
                                placeholderTextColor="#999"
                                value={name}
                                onChangeText={setName}
                                autoCapitalize="words"
                            />
                        </View>

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

                        <TouchableOpacity
                            style={styles.signUpButtonContainer}
                            onPress={handleSignUp}
                            disabled={loading}
                        >
                            <LinearGradient
                                colors={["#52B788", "#2D6A4F"]}
                                style={styles.signUpButton}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                            >
                                {loading ? (
                                    <ActivityIndicator color="#FFF" />
                                ) : (
                                    <Text style={styles.signUpButtonText}>Sign Up</Text>
                                )}
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>

                    {/* Divider */}
                    <View style={styles.dividerContainer}>
                        <View style={styles.dividerLine} />
                        <Text style={styles.dividerText}>or register with</Text>
                        <View style={styles.dividerLine} />
                    </View>

                    {/* Social Auth */}
                    <View style={styles.socialContainer}>
                        <TouchableOpacity style={styles.socialButton} onPress={handleGoogleSignUp}>
                            <AntDesign name="google" size={24} color="#DB4437" />
                            <Text style={styles.socialButtonText}>Google</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Footer */}
                    <View style={styles.footerContainer}>
                        <Text style={styles.footerText}>Already have an account? </Text>
                        <Link href="/(auth)/sign-in" asChild>
                            <TouchableOpacity>
                                <Text style={styles.footerLink}>Sign In</Text>
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
    topBar: {
        paddingHorizontal: 20,
        paddingTop: 10,
    },
    backButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: "#FFF",
        justifyContent: "center",
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    content: {
        flex: 1,
        paddingHorizontal: 24,
        justifyContent: "center",
    },
    headerContainer: {
        marginBottom: 40,
        marginTop: -20,
    },
    title: {
        fontSize: 32,
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
    signUpButtonContainer: {
        width: "100%",
        marginTop: 16,
        shadowColor: "#2D6A4F",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 5,
    },
    signUpButton: {
        height: 56,
        borderRadius: 16,
        justifyContent: "center",
        alignItems: "center",
    },
    signUpButtonText: {
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
