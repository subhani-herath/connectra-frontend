import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '../stores/authStore';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

// Paths that should not trigger token refresh
const AUTH_PATHS = ['/api/auth/login', '/api/auth/register', '/api/auth/refresh-token'];

export const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true, // Required for HttpOnly cookies (refresh token)
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request Interceptor - Attach JWT
axiosInstance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const token = useAuthStore.getState().accessToken;
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response Interceptor - Handle 401 & Token Refresh
let isRefreshing = false;
let failedQueue: Array<{
    resolve: (value?: unknown) => void;
    reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: AxiosError | null, token: string | null = null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

axiosInstance.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

        // Don't try to refresh for auth endpoints
        const isAuthPath = AUTH_PATHS.some(path => originalRequest.url?.includes(path));

        if (error.response?.status === 401 && !originalRequest._retry && !isAuthPath) {
            // Only try refresh if user was previously authenticated
            const wasAuthenticated = useAuthStore.getState().isAuthenticated;

            if (!wasAuthenticated) {
                // Not logged in, just reject without refresh attempt
                return Promise.reject(error);
            }

            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                })
                    .then((token) => {
                        originalRequest.headers.Authorization = `Bearer ${token}`;
                        return axiosInstance(originalRequest);
                    })
                    .catch((err) => Promise.reject(err));
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                const response = await axios.post(
                    `${API_BASE_URL}/api/auth/refresh-token`,
                    {},
                    { withCredentials: true }
                );

                // Handle ApiResponse wrapper - accessToken is in data.data
                const accessToken = response.data?.data?.accessToken || response.data?.accessToken;

                if (accessToken) {
                    useAuthStore.getState().setAccessToken(accessToken);
                    processQueue(null, accessToken);
                    originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                    return axiosInstance(originalRequest);
                } else {
                    throw new Error('No access token in refresh response');
                }
            } catch (refreshError) {
                processQueue(refreshError as AxiosError, null);
                useAuthStore.getState().logout();
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);

export default axiosInstance;
