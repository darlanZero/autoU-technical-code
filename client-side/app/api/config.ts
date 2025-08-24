export const API_CONFIG = {
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
}

export interface ApiResponse<T> {
    data?: T;
    error?: string;
    status: number;
}

export class ApiError extends Error {
    status: number;
    constructor(message: string, status: number) {
        super(message);
        this.status = status;
        this.name = 'ApiError';
    }
}