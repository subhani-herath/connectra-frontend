import axiosInstance from '../api/axiosInstance';

interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
}

export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE';

export interface AttendanceRecord {
    meetingId: number;
    meetingTitle: string;
    lecturerName: string;
    scheduledStartTime: string;
    actualStartTime?: string;
    actualEndTime?: string;
    status: AttendanceStatus;
    joinedAt?: string;
    leftAt?: string;
}

export const studentService = {
    getAttendanceHistory: async (status?: AttendanceStatus): Promise<AttendanceRecord[]> => {
        const params = status ? { status } : {};
        const response = await axiosInstance.get<ApiResponse<AttendanceRecord[]>>(
            '/api/student/attendance/history',
            { params }
        );
        return response.data.data;
    },
};
