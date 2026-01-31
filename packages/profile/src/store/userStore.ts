import { create } from 'zustand';

interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    avatar: string;
    phone: string;
}

interface UserState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    setUser: (user: User | null) => void;
    logout: () => void;
}

export const useUserStore = create<UserState>((set) => ({
    user: {
        id: '1',
        email: 'john.doe@example.com',
        firstName: 'John',
        lastName: 'Doe',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
        phone: '+1 (555) 123-4567',
    },
    isAuthenticated: true,
    isLoading: false,
    setUser: (user) => set({ user, isAuthenticated: !!user }),
    logout: () => set({ user: null, isAuthenticated: false }),
}));
