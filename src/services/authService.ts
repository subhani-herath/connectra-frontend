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

export interface RegisterResponse {
    email: string;
    message: string;
    requiresVerification: boolean;
}

export interface VerifyEmailRequest {
    email: string;
    otp: string;
}

export interface ResendOtpRequest {
    email: string;
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

    register: async (data: RegisterRequest): Promise<RegisterResponse> => {
        const response = await axiosInstance.post<ApiResponse<RegisterResponse>>(
            '/api/auth/register',
            { ...data, role: 'STUDENT' }
        );
        return response.data.data;
    },

    verifyEmail: async (data: VerifyEmailRequest): Promise<AuthResponse> => {
        const response = await axiosInstance.post<ApiResponse<AuthResponse>>(
            '/api/auth/verify-email',
            data
        );
        return response.data.data;
    },

    resendOtp: async (data: ResendOtpRequest): Promise<void> => {
        await axiosInstance.post<ApiResponse<string>>(
            '/api/auth/resend-otp',
            data
        );
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
