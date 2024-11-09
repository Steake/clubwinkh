import { browser } from '$app/environment';

const API_BASE_URL = 'http://localhost:3000/api/v1';

interface ApiResponse<T> {
    data?: T;
    error?: string;
}

class ApiClient {
    private token: string | null = null;

    constructor() {
        if (browser) {
            this.token = localStorage.getItem('token');
        }
    }

    setToken(token: string) {
        this.token = token;
        if (browser) {
            localStorage.setItem('token', token);
        }
    }

    clearToken() {
        this.token = null;
        if (browser) {
            localStorage.removeItem('token');
        }
    }

    private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
        const headers = new Headers({
            'Content-Type': 'application/json',
            ...(options.headers as Record<string, string>),
        });

        if (this.token) {
            headers.set('Authorization', `Bearer ${this.token}`);
        }

        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                ...options,
                headers,
            });

            if (!response.ok) {
                const error = await response.json();
                return { error: error.message || 'An error occurred' };
            }

            const data = await response.json();
            return { data };
        } catch (error) {
            return { error: 'Network error occurred' };
        }
    }

    // Auth endpoints
    async register(email: string, password: string, username: string) {
        return this.request<{ token: string; user: any }>('/auth/register', {
            method: 'POST',
            body: JSON.stringify({ email, password, username }),
        });
    }

    async login(email: string, password: string) {
        return this.request<{ token: string; user: any }>('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        });
    }

    // User endpoints
    async getUsers(page = 1, limit = 10) {
        return this.request<any[]>(`/users?page=${page}&limit=${limit}`);
    }

    async getUser(userId: string) {
        return this.request<any>(`/users/${userId}`);
    }

    // Transaction endpoints
    async createTransaction(type: 'deposit' | 'withdrawal' | 'bet' | 'win', amount: number) {
        return this.request<any>('/transactions', {
            method: 'POST',
            body: JSON.stringify({ type, amount }),
        });
    }

    async getTransactions(params: { userId?: string; type?: string; status?: string; page?: number; limit?: number } = {}) {
        const queryParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
            if (value) queryParams.append(key, value.toString());
        });
        return this.request<any[]>(`/transactions?${queryParams.toString()}`);
    }

    // Leaderboard endpoints
    async getLeaderboard(period: 'daily' | 'weekly' | 'monthly', limit?: number) {
        const queryParams = new URLSearchParams({ period });
        if (limit) queryParams.append('limit', limit.toString());
        return this.request<any[]>(`/leaderboard?${queryParams.toString()}`);
    }

    // Game endpoints
    async getGames() {
        return this.request<any[]>('/games');
    }

    async createGame(gameData: { name: string; description: string; minBet: number; maxBet: number; isActive?: boolean }) {
        return this.request<any>('/games', {
            method: 'POST',
            body: JSON.stringify(gameData),
        });
    }

    async placeBet(gameId: string, amount: number) {
        return this.request<any>(`/games/${gameId}/bet`, {
            method: 'POST',
            body: JSON.stringify({ amount }),
        });
    }
}

export const api = new ApiClient();
