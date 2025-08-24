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
        const response = await apiClient.get<{users: User[]} | User[]>(`/users?search=${encodeURIComponent(credentials.email)}`);
        console.log('Login response:', response);
        if (!response.data ) {
        throw new Error('Resposta inválida da API');
        }

        let usersList: User[] = [];

        if(Array.isArray(response.data)) {
            usersList = response.data;
        } else if (response.data && 'users' in response.data) {
            usersList = response.data.users;
        } else {
            throw new Error('Resposta inválida da API');
        }

        console.log('Users list:', usersList.length);

        if(usersList.length === 0) {
            throw new Error('Usuário não encontrado');
        }

        const user = usersList.find(u => u.email === credentials.email);

        if (!user) {
            throw new Error('Usuário não encontrado(match exato');
        }

        console.log('Found user:', {id: user.$id, email: user.email});

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
        const response = await apiClient.get<{users: User[]} | User[]>(endpoint);
        
        if (!response.data) {
        return [];
        }

        // Verificar formato da resposta
        if (Array.isArray(response.data)) {
        return response.data;
        } else if ('users' in response.data) {
        return response.data.users;
        }
        
        return [];
    }
}

export const authService = new AuthService();