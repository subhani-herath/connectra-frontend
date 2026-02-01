import axiosInstance from '../api/axiosInstance';

// Backend wraps all responses in ApiResponse<T>
interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
}

export interface Lecturer {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    createdAt?: string;
}

export interface CreateLecturerRequest {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
}

export interface UpdateLecturerRequest {
    firstName?: string;
    lastName?: string;
    email?: string;
}

export const adminService = {
    getLecturers: async (): Promise<Lecturer[]> => {
        const response = await axiosInstance.get<ApiResponse<Lecturer[]>>(
            '/api/lecturers'
        );
        return response.data.data;
    },

    createLecturer: async (data: CreateLecturerRequest): Promise<Lecturer> => {
        const response = await axiosInstance.post<ApiResponse<Lecturer>>(
            '/api/lecturers',
            data
        );
        return response.data.data;
    },

    deleteLecturer: async (userId: number): Promise<void> => {
        await axiosInstance.delete(`/api/admin/users/${userId}`);
    },

    updateLecturer: async (lecturerId: number, data: UpdateLecturerRequest): Promise<Lecturer> => {
        const response = await axiosInstance.put<ApiResponse<Lecturer>>(
            `/api/lecturers/${lecturerId}`,
            data
        );
        return response.data.data;
    },
};
