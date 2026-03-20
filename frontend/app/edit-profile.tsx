import React, { useState, useEffect } from "react";
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
import { Stack, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { getUser, updateUser } from "../utils/api";
import { supabase } from "../utils/supabase";

export default function EditProfileScreen() {
    const router = useRouter();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (!session?.user?.id) return;
                const data = await getUser(session.user.id);
                setName(data.name || "");
                setEmail(data.email || "");
            } catch (error) {
                console.error("Failed to load user:", error);
                Alert.alert("Error", "Could not load user profile.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchUser();
    }, []);

    const handleSave = async () => {
        if (!name.trim() || !email.trim()) {
            Alert.alert("Validation Error", "Name and email cannot be empty.");
            return;
        }

        setIsSaving(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session?.user?.id) throw new Error("Not logged in");

            await updateUser(session.user.id, {
                name: name.trim(),
                email: email.trim(),
            });
            Alert.alert("Success", "Profile updated successfully!", [
                { text: "OK", onPress: () => router.back() }
            ]);
        } catch (error) {
            console.error("Failed to update user:", error);
            Alert.alert("Error", "Could not update profile. Make sure the backend is running.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                    <Ionicons name="chevron-back" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Edit Profile</Text>
                <View style={{ width: 40 }} /> {/* Spacer to center title */}
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={styles.flex1}
            >
                {isLoading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#2D6A4F" />
                    </View>
                ) : (
                    <View style={styles.formContainer}>
                        <Text style={styles.label}>Name</Text>
                        <TextInput
                            style={styles.input}
                            value={name}
                            onChangeText={setName}
                            placeholder="Enter your name"
                            placeholderTextColor="#999"
                            autoCapitalize="words"
                        />

                        <Text style={styles.label}>Email</Text>
                        <TextInput
                            style={styles.input}
                            value={email}
                            onChangeText={setEmail}
                            placeholder="Enter your email"
                            placeholderTextColor="#999"
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />

                        <TouchableOpacity
                            style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
                            onPress={handleSave}
                            disabled={isSaving}
                        >
                            {isSaving ? (
                                <ActivityIndicator color="#FFF" />
                            ) : (
                                <Text style={styles.saveButtonText}>Save Changes</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                )}
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
        justifyContent: "space-between",
        paddingHorizontal: 15,
        paddingVertical: 15,
        backgroundColor: "#FFF",
        borderBottomWidth: 1,
        borderBottomColor: "rgba(0,0,0,0.05)",
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 20,
        backgroundColor: "#F5F5F5",
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: "700",
        color: "#111",
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    formContainer: {
        padding: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: "600",
        color: "#444",
        marginBottom: 8,
        marginLeft: 4,
    },
    input: {
        backgroundColor: "#FFF",
        borderWidth: 1,
        borderColor: "#E0E0E0",
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 16,
        color: "#333",
        marginBottom: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.03,
        shadowRadius: 4,
        elevation: 1,
    },
    saveButton: {
        backgroundColor: "#2D6A4F",
        paddingVertical: 16,
        borderRadius: 14,
        alignItems: "center",
        marginTop: 10,
        shadowColor: "#2D6A4F",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    saveButtonDisabled: {
        opacity: 0.7,
    },
    saveButtonText: {
        color: "#FFF",
        fontSize: 16,
        fontWeight: "700",
    },
});
