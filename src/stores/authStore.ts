import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface User {
    id?: number;
    email: string;
    role: 'STUDENT' | 'LECTURER' | 'ADMIN';
    firstName?: string;
    lastName?: string;
}

interface AuthState {
    user: User | null;
    accessToken: string | null;
    isAuthenticated: boolean;

    // Actions
    login: (user: User, accessToken: string) => void;
    logout: () => void;
    setAccessToken: (token: string) => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            accessToken: null,
            isAuthenticated: false,

            login: (user, accessToken) => {
                set({
                    user,
                    accessToken,
                    isAuthenticated: true,
                });
            },

            logout: () => {
                set({
                    user: null,
                    accessToken: null,
                    isAuthenticated: false,
                });
            },

            setAccessToken: (token) => {
                set({ accessToken: token });
            },
        }),
        {
            name: 'connectra-auth',
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({
                user: state.user,
                accessToken: state.accessToken,
                isAuthenticated: state.isAuthenticated,
            }),
        }
    )
);
