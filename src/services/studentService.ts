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
    meetingDate: string;
    lecturerName: string;
    joinedAt?: string;
    leftAt?: string;
    totalTimeInMinutes?: number;
    attendancePercentage?: number;
    attendanceStatus: AttendanceStatus;
    meetingDuration?: number;
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
