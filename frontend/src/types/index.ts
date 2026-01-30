export interface Product {
    id?: number;
    name: string;
    description: string;
    price: number | string;
}

export interface User {
    username: string;
    authdata: string;
}

export interface PaginationState {
    page: number;
    size: number;
    totalPages: number;
    totalElements: number;
}

export interface PageResponse<T> {
    content: T[];
    totalPages: number;
    totalElements: number;
    size: number;
    number: number;
}

export interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (username: string, password: string) => Promise<User>;
    logout: () => void;
    isAuthenticated: boolean;
}
