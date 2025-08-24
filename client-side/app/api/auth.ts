// app/api/auth.ts
import { apiClient } from './client';
import type { CreateUserRequest, CreateUserResponse, LoginRequest, User } from './types';

export class AuthService {
    async register(userData: CreateUserRequest): Promise<CreateUserResponse> {
        const response = await apiClient.post<CreateUserResponse>('/users', userData);
        
        if (!response.data) {
        throw new Error('Erro ao criar usuário');
        }
        
        return response.data;
    }


    async login(credentials: LoginRequest): Promise<User> {
        const response = await apiClient.get<User[]>(`/users?search=${encodeURIComponent(credentials.email)}`);
        if (!response.data || response.data.length === 0) {
        throw new Error('Email não encontrado');
        }


        const user = response.data.find(u => u.email === credentials.email);
        if (!user) {
        throw new Error('Email não encontrado');
        }

        console.log('🚧 TODO: Validar senha real:', credentials.password);

        return user;
    }

    async getUser(userId: string): Promise<User> {
        const response = await apiClient.get<User>(`/users/${userId}`);
        
        if (!response.data) {
        throw new Error('Usuário não encontrado');
        }
        
        return response.data;
    }

    async listUsers(search?: string): Promise<User[]> {
        const endpoint = search ? `/users?search=${encodeURIComponent(search)}` : '/users';
        const response = await apiClient.get<User[]>(endpoint);
        
        return response.data || [];
    }
}

export const authService = new AuthService();