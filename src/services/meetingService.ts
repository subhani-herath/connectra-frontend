import axiosInstance from '../api/axiosInstance';

// Backend wraps all responses in ApiResponse<T>
interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
}

export type MeetingStatus = 'SCHEDULED' | 'LIVE' | 'ENDED' | 'CANCELLED';

export interface Meeting {
    meetingId: string; // UUID
    title: string;
    description?: string;
    scheduledStartTime: string;
    scheduledEndTime: string;
    actualStartTime?: string;
    actualEndTime?: string;
    status: MeetingStatus;
    createdById: number;
    createdByName: string;
    targetDegree: string;
    targetBatch: number;
}

export interface CreateMeetingRequest {
    title: string;
    description?: string;
    scheduledStartTime: string;
    scheduledEndTime: string;
    targetDegree: string;
    targetBatch: number;
}

export interface JoinMeetingResponse {
    appId: string;
    channelName: string;
    agoraToken: string;
    uid: number;
    isHost?: boolean;
    userName?: string;
}

export interface UpdateMeetingRequest {
    title?: string;
    description?: string;
    scheduledStartTime?: string;
    scheduledEndTime?: string;
}

export interface AttendanceEntry {
    studentId: number;
    studentName: string;
    studentEmail: string;
    status: 'PRESENT' | 'ABSENT' | 'PARTIALLY_PRESENT';
    joinedAt?: string;
    leftAt?: string;
}

export interface AttendanceReport {
    meetingId: string;
    meetingTitle: string;
    totalStudents: number;
    presentCount: number;
    absentCount: number;
    partialCount: number;
    entries: AttendanceEntry[];
}

export const meetingService = {
    // Student endpoints
    getStudentMeetings: async (): Promise<Meeting[]> => {
        const response = await axiosInstance.get<ApiResponse<Meeting[]>>(
            '/api/student/meetings'
        );
        return response.data.data;
    },

    // Lecturer endpoints - Backend uses /api/meeting (singular)
    getLecturerMeetings: async (): Promise<Meeting[]> => {
        const response = await axiosInstance.get<ApiResponse<Meeting[]>>(
            '/api/meeting/lecturer'
        );
        return response.data.data;
    },

    getMeetingById: async (meetingId: string): Promise<Meeting> => {
        const response = await axiosInstance.get<ApiResponse<Meeting>>(
            `/api/meeting/${meetingId}`
        );
        return response.data.data;
    },

    createMeeting: async (data: CreateMeetingRequest): Promise<Meeting> => {
        const response = await axiosInstance.post<ApiResponse<Meeting>>(
            '/api/meeting',
            data
        );
        return response.data.data;
    },

    startMeeting: async (meetingId: string): Promise<JoinMeetingResponse> => {
        const response = await axiosInstance.post<ApiResponse<JoinMeetingResponse>>(
            `/api/meeting/${meetingId}/join`
        );
        return response.data.data;
    },

    endMeeting: async (meetingId: string): Promise<void> => {
        await axiosInstance.put(`/api/meeting/${meetingId}/stop`);
    },

    joinMeeting: async (meetingId: string): Promise<JoinMeetingResponse> => {
        const response = await axiosInstance.post<ApiResponse<JoinMeetingResponse>>(
            `/api/meeting/${meetingId}/join`
        );
        return response.data.data;
    },

    leaveMeeting: async (meetingId: string): Promise<void> => {
        await axiosInstance.put(`/api/meeting/${meetingId}/leave`);
    },

    cancelMeeting: async (meetingId: string): Promise<void> => {
        await axiosInstance.put(`/api/meeting/${meetingId}/cancel`);
    },

    updateMeeting: async (meetingId: string, data: UpdateMeetingRequest): Promise<Meeting> => {
        const response = await axiosInstance.put<ApiResponse<Meeting>>(
            `/api/meeting/${meetingId}`,
            data
        );
        return response.data.data;
    },

    getAttendanceReport: async (meetingId: string): Promise<AttendanceReport> => {
        const response = await axiosInstance.get<ApiResponse<AttendanceReport>>(
            `/api/meeting/${meetingId}/attendance`
        );
        return response.data.data;
    },
};
