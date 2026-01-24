import axiosInstance from '../api/axiosInstance';

// Backend wraps all responses in ApiResponse<T>
interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
}

export interface Quiz {
    id: number;
    question: string;
    optionA: string;
    optionB: string;
    optionC: string;
    optionD: string;
    correctAnswer: 'A' | 'B' | 'C' | 'D';
    timeLimitSeconds: number;
    isActive: boolean;
    createdAt: string;
}

export interface CreateQuizRequest {
    questionText: string;
    optionA: string;
    optionB: string;
    optionC: string;
    optionD: string;
    correctAnswer: 'A' | 'B' | 'C' | 'D';
    timeLimitSeconds: number;
}

export interface ActiveQuiz {
    id: number;
    question: string;
    optionA: string;
    optionB: string;
    optionC: string;
    optionD: string;
    timeRemainingSeconds: number;
}

export interface QuizResultsSummary {
    totalResponses: number;
    correctResponses: number;
    optionACount: number;
    optionBCount: number;
    optionCCount: number;
    optionDCount: number;
    correctAnswer: 'A' | 'B' | 'C' | 'D';
}

export const quizService = {
    // Lecturer endpoints - under MeetingController (/api/meeting)
    getQuizzes: async (meetingId: string): Promise<Quiz[]> => {
        const response = await axiosInstance.get<ApiResponse<Quiz[]>>(
            `/api/meeting/${meetingId}/quizzes`
        );
        return response.data.data;
    },

    createQuiz: async (meetingId: string, data: CreateQuizRequest): Promise<Quiz> => {
        const response = await axiosInstance.post<ApiResponse<Quiz>>(
            `/api/meeting/${meetingId}/quizzes`,
            data
        );
        return response.data.data;
    },

    launchQuiz: async (quizId: number): Promise<void> => {
        await axiosInstance.post(`/api/meeting/quizzes/${quizId}/launch`);
    },

    endQuiz: async (quizId: number): Promise<void> => {
        await axiosInstance.post(`/api/meeting/quizzes/${quizId}/end`);
    },

    getQuizResults: async (quizId: number): Promise<QuizResultsSummary> => {
        const response = await axiosInstance.get<ApiResponse<QuizResultsSummary>>(
            `/api/meeting/quizzes/${quizId}/results`
        );
        return response.data.data;
    },

    deleteQuiz: async (quizId: number): Promise<void> => {
        await axiosInstance.delete(`/api/meeting/quizzes/${quizId}`);
    },

    // Student endpoints - under StudentController
    getActiveQuiz: async (meetingId: string): Promise<ActiveQuiz | null> => {
        try {
            const response = await axiosInstance.get<ApiResponse<ActiveQuiz>>(
                `/api/student/meetings/${meetingId}/quiz/active`
            );
            return response.data.data;
        } catch {
            // No active quiz
            return null;
        }
    },

    submitResponse: async (
        quizId: number,
        selectedAnswer: 'A' | 'B' | 'C' | 'D'
    ): Promise<void> => {
        await axiosInstance.post(`/api/student/quizzes/${quizId}/respond`, {
            selectedAnswer,
        });
    },
};
