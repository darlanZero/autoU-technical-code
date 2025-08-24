import { createContext, useContext, useEffect, useReducer, type ReactNode } from "react";
import type { CreateUserRequest, LoginRequest, User } from "./types";
import { authService } from "./auth";

interface AuthState {
    user: User | null;
    isLoading: boolean;
    error: string | null;
    isAuthenticated: boolean;
}

type AuthAction = 
    | { type: 'LOGIN_START' }
    | { type: 'LOGIN_SUCCESS'; payload: User }
    | { type: 'LOGIN_FAILURE'; payload: string }
    | { type: 'REGISTER_START' }
    | { type: 'REGISTER_SUCCESS' }
    | { type: 'REGISTER_FAILURE'; payload: string }
    | { type: 'LOGOUT' }
    | { type: 'CLEAR_ERROR' }
    | { type: 'SET_USER'; payload: User };

const initialState: AuthState = {
    user: null,
    isLoading: false,
    error: null,
    isAuthenticated: false
}

function authReducer(state: AuthState, action: AuthAction): AuthState {
    switch (action.type) {
        case 'LOGIN_START':
        case 'REGISTER_START':
            return {
                ...state,
                isLoading: true,
                error: null,
            };

        case 'LOGIN_SUCCESS':
            return {
                ...state,
                isLoading: false,
                user: action.payload,
                isAuthenticated: true,
                error: null,
            };

        case 'REGISTER_SUCCESS':
            return {
                ...state,
                isLoading: false,
                error: null,
            };

        case 'LOGIN_FAILURE':
        case 'REGISTER_FAILURE':
            return {
                ...state,
                isLoading: false,
                error: action.payload,
                user: null,
                isAuthenticated: false,
            };

        case 'LOGOUT':
            return {
                ...initialState,
            };

        case 'SET_USER':
            return {
                ...state,
                user: action.payload,
                isAuthenticated: true,
            };

        case 'CLEAR_ERROR':
            return {
                ...state,
                error: null,
            };

        default:
            return state;
    }
}

interface AuthContextType {
    state: AuthState;
    login: (credentials: LoginRequest) => Promise<void>;
    register: (userData: CreateUserRequest) => Promise<void>;
    logout: () => void;
    clearError: () => void;
}

// ✅ CORREÇÃO: Declarar AuthContext ANTES de usar
const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
    children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
    const [state, dispatch] = useReducer(authReducer, initialState);

    useEffect(() => {
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
            try {
                const user = JSON.parse(savedUser);
                dispatch({ type: 'SET_USER', payload: user });
            } catch (error) {
                console.error('Failed to parse user from localStorage:', error);
                localStorage.removeItem('user');
            }
        }
    }, [])

    const login = async (credentials: LoginRequest): Promise<void> => {
        dispatch({ type: 'LOGIN_START'});

        try {
            const user = await authService.login(credentials);
            localStorage.setItem('user', JSON.stringify(user));
            dispatch({ type: 'LOGIN_SUCCESS', payload: user });
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
            dispatch({ type: 'LOGIN_FAILURE', payload: errorMessage });
            throw error;
        }
    }

    const register = async (userData: CreateUserRequest): Promise<void> => {
        dispatch({ type: 'REGISTER_START'});

        try {
            await authService.register(userData);
            dispatch({ type: 'REGISTER_SUCCESS' });
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
            dispatch({ type: 'REGISTER_FAILURE', payload: errorMessage });
            throw error;
        }
    }

    const logout = () => {
        localStorage.removeItem('user');
        dispatch({ type: 'LOGOUT' });
    }

    const clearError = () => {
        dispatch({ type: 'CLEAR_ERROR' });
    }

    const value: AuthContextType = {
        state,
        login,
        register,
        logout,
        clearError
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth(): AuthContextType {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}