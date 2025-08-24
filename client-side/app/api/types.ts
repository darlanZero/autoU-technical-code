
export interface User {
$id: string;
$createdAt: string;
$updatedAt: string;
name: string;
email: string;
status: boolean;
registration: string;
passwordUpdate: string;
emailVerification: boolean;
phoneVerification: boolean;
phone?: string;
labels?: string[];
prefs?: Record<string, any>;
}

export interface CreateUserRequest {
name: string;
email: string;
password: string;
}

export interface CreateUserResponse {
$id: string;
$createdAt: string;
$updatedAt: string;
name: string;
email: string;
status: boolean;
registration: string;
emailVerification: boolean;
phoneVerification: boolean;
}

export interface LoginRequest {
email: string;
password: string;
}


export interface AuthResponse {
user: User;
session?: string;
token?: string;
}