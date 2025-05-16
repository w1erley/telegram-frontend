import { api } from "@/lib/api";

export async function logoutUser() {
    try {
        await api.post("/logout");
        window.location.href = "/login";
    } catch (error: any) {
        console.error("Logout failed:", error.response?.data?.message || error.message);
        throw error;
    }
}
