import { api } from "@/lib/api";

interface RegisterData {
    name: string;
    email: string;
    password: string;
}

export async function registerUser(data: RegisterData) {
    try {
        const response = await api.post("/register", data);
        return response.data;
    } catch (error: any) {
        console.error("Signup failed:", error.response?.data?.message || error.message);
        throw error;
    }
}
