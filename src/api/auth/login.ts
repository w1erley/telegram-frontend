import { api } from "@/lib/api";

interface LoginData {
    email: string;
    password: string;
}

export async function loginUser(data: LoginData) {
    try {
        const response = await api.post("/login", data);
        return response.data;
    } catch (error: any) {
        console.error("Login failed:", error.response?.data?.message || error.message);
        throw error;
    }
}
