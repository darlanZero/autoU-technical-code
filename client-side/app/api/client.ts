import { API_CONFIG, ApiError,type ApiResponse } from "./config";

class ApiClient {
    private baseURL: string;
    private timeout: number;

    constructor() {
        this.baseURL = API_CONFIG.baseURL;
        this.timeout = API_CONFIG.timeout;
    }
    
    private async request<T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<ApiResponse<T>> {
        const url = `${this.baseURL}${endpoint}`;

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);

        try {
            const response = await fetch(url, {
                ...options,
                signal: controller.signal,
                headers: {
                    "Content-Type": "application/json",
                    ...options.headers
                }
            });
            clearTimeout(timeoutId);

            let data;
            const contentType = response.headers.get("Content-Type");

            if (contentType && contentType.includes("application/json")) {
                data = await response.json();
            } else {
                data = await response.text();
            }

            if (!response.ok) {
                const errorMessage = data?.detail || data?.message || `HTTP ${response.status}`;
                throw new ApiError(errorMessage, response.status);
            }

            return {
                data,
                status: response.status
            }
        } catch (error) {
            clearTimeout(timeoutId);

            if (error instanceof ApiError) {
                throw error;
            }

            if (error instanceof Error && error.name === 'AbortError') {
                throw new ApiError('Request timed out', 408);
            }

            throw new ApiError(
                error instanceof Error ? error.message : 'Network error',
                0
            )
        }
    }

    async get<T>(endpoint: string, options?: RequestInit):Promise<ApiResponse<T>> {
        return this.request<T>(endpoint, { ...options, method: 'GET' });
    }

    async post<T>(
        endpoint: string,
        body?: any,
        options?: RequestInit
    ): Promise<ApiResponse<T>> {
        return this.request<T>(endpoint, {
        ...options,
        method: 'POST',
        body: body ? JSON.stringify(body) : undefined,
        });
    }

    async put<T>(
        endpoint: string,
        body?: any,
        options?: RequestInit
    ): Promise<ApiResponse<T>> {
        return this.request<T>(endpoint, {
        ...options,
        method: 'PUT',
        body: body ? JSON.stringify(body) : undefined,
        });
    }

    async delete<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
        return this.request<T>(endpoint, { ...options, method: 'DELETE' });
    }
}

export const apiClient = new ApiClient();
