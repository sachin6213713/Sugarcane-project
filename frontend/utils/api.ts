import { Platform } from "react-native";

const getBaseUrl = () => {
    const url = process.env.EXPO_PUBLIC_API_URL;
    if (url) {
        // If it's the host IP and we're on an emulator, 10.0.2.2 might be needed
        // but let's trust the env var if it's explicitly set to an IP.
        return url;
    }
    // Fallback for local development
    return Platform.OS === "android" ? "http://10.0.2.2:8000" : "http://localhost:8000";
};

const BASE_URL = getBaseUrl();

// ─── Types ────────────────────────────────────────────────────────────────────

export interface User {
    id: string;
    name: string;
    email: string;
    created_at: string;
}

export interface ChatMessage {
    id: string;
    user_id: string;
    role: "user" | "assistant";
    message: string;
    created_at: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function request<T>(path: string, options?: RequestInit): Promise<T> {
    try {
        const url = `${BASE_URL}${path}`;
        const res = await fetch(url, {
            headers: { "Content-Type": "application/json" },
            ...options,
        });

        if (!res.ok) {
            const error = await res.json().catch(() => ({ detail: res.statusText }));
            throw new Error(error.detail ?? `API Error ${res.status}: ${res.statusText}`);
        }

        return res.json() as Promise<T>;
    } catch (error: any) {
        console.error(`API Request failed [${options?.method || "GET"} ${path}]:`, error);
        if (error.stack) console.error(error.stack);
        throw error;
    }
}

// ─── Users ────────────────────────────────────────────────────────────────────

export const getUser = (userId: string) =>
    request<User>(`/users/${userId}`);

export const updateUser = (userId: string, data: { name?: string; email?: string }) =>
    request<User>(`/users/${userId}`, {
        method: "PATCH",
        body: JSON.stringify(data),
    });

export const listUsers = () =>
    request<User[]>("/users");

// ─── Chats ────────────────────────────────────────────────────────────────────

export const getChatHistory = (userId: string) =>
    request<ChatMessage[]>(`/chats/${userId}`);

export const sendChatMessage = (
    userId: string,
    role: "user" | "assistant",
    message: string
) =>
    request<ChatMessage>("/chats", {
        method: "POST",
        body: JSON.stringify({ user_id: userId, role, message }),
    });

export const clearChatHistory = (userId: string) =>
    request<{ message: string }>(`/chats/${userId}`, { method: "DELETE" });
