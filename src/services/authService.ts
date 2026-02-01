import axiosInstance from '../api/axiosInstance';

// Backend wraps all responses in ApiResponse<T>
interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterRequest {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    degree?: string;
    batch?: string;
}

export interface AuthResponse {
    email: string;
    role: 'STUDENT' | 'LECTURER' | 'ADMIN';
    accessToken: string;
    firstName?: string;
    lastName?: string;
}

export const authService = {
    login: async (data: LoginRequest): Promise<AuthResponse> => {
        const response = await axiosInstance.post<ApiResponse<AuthResponse>>(
            '/api/auth/login',
            data
        );
        return response.data.data;
    },

    register: async (data: RegisterRequest): Promise<AuthResponse> => {
        const response = await axiosInstance.post<ApiResponse<AuthResponse>>(
            '/api/auth/register',
            { ...data, role: 'STUDENT' }
        );
        return response.data.data;
    },

    logout: async (): Promise<void> => {
        try {
            await axiosInstance.post('/api/auth/logout');
        } catch {
            // Logout even if the request fails
        }
    },

    refreshToken: async (): Promise<{ accessToken: string }> => {
        const response = await axiosInstance.post<ApiResponse<AuthResponse>>(
            '/api/auth/refresh-token'
        );
        return { accessToken: response.data.data.accessToken };
    },
};
