import axiosInstance from '../api/axiosInstance';

interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
}

export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'PARTIALLY_PRESENT';

export interface AttendanceRecord {
    meetingId: string;
    meetingTitle: string;
    lecturerName: string;
    meetingDate: string; // Actual meeting date from backend
    joinedAt?: string; // When student joined
    leftAt?: string; // When student left
    totalTimeInMinutes?: number; // Duration attended
    attendancePercentage?: number; // Percentage attended
    attendanceStatus: string; // PRESENT, ABSENT, PARTIALLY_PRESENT
    meetingDuration?: number; // Total meeting duration
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
