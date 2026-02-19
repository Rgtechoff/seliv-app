import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1';

export const apiClient = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor: attach JWT
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('seliv_token');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error: unknown) => Promise.reject(error),
);

// Response interceptor: handle 401
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('seliv_token');
      localStorage.removeItem('seliv_user');
      document.cookie = 'seliv_token=; path=/; max-age=0';
      const currentPath = window.location.pathname + window.location.search;
      window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`;
    }
    return Promise.reject(error);
  },
);

export const authApi = {
  login: (email: string, password: string) =>
    apiClient.post('/auth/login', { email, password }),
  register: (data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: 'client' | 'vendeur';
    companyName?: string;
    siret?: string;
  }) => apiClient.post('/auth/register', data),
};

export const usersApi = {
  getMe: () => apiClient.get('/users/me'),
  updateMe: (data: Record<string, unknown>) => apiClient.patch('/users/me', data),
  getPublicProfile: (id: string) => apiClient.get(`/users/${id}/public`),
};

export const missionsApi = {
  create: (data: Record<string, unknown>) => apiClient.post('/missions', data),
  getMyMissions: () => apiClient.get('/missions/my'),
  getAvailable: () => apiClient.get('/missions/available'),
  getById: (id: string) => apiClient.get(`/missions/${id}`),
  accept: (id: string) => apiClient.patch(`/missions/${id}/accept`),
  complete: (id: string) => apiClient.patch(`/missions/${id}/complete`),
};

export const paymentsApi = {
  createCheckout: (missionId: string) =>
    apiClient.post(`/payments/missions/${missionId}/checkout`),
  cancelMission: (missionId: string, reason: string) =>
    apiClient.post(`/payments/missions/${missionId}/cancel`, { reason }),
  downloadInvoice: (missionId: string) =>
    apiClient.get(`/payments/missions/${missionId}/invoice`, { responseType: 'blob' }),
};

export const subscriptionsApi = {
  getMy: () => apiClient.get('/subscriptions/my'),
  createCheckout: (plan: string) =>
    apiClient.post('/subscriptions/checkout', { plan }),
};

export const notificationsApi = {
  getAll: () => apiClient.get('/notifications'),
  markRead: (id: string) => apiClient.patch(`/notifications/${id}/read`),
  markAllRead: () => apiClient.patch('/notifications/read-all'),
};

export const reviewsApi = {
  create: (data: { missionId: string; rating: number; comment?: string }) =>
    apiClient.post('/reviews', data),
  getByVendeur: (vendeurId: string) =>
    apiClient.get(`/reviews/vendeur/${vendeurId}`),
};

export const chatApi = {
  getMessages: (missionId: string) =>
    apiClient.get(`/chat/${missionId}/messages`),
  getPresets: (category?: string) =>
    apiClient.get('/chat/presets', {
      params: category ? { category } : undefined,
    }),
};

export const availabilitiesApi = {
  getMy: () => apiClient.get('/availabilities'),
  upsert: (data: {
    dayOfWeek?: number | null;
    startTime?: string | null;
    endTime?: string | null;
    dateSpecific?: string | null;
    isAvailable?: boolean;
  }) => apiClient.post('/availabilities', data),
  remove: (id: string) => apiClient.delete(`/availabilities/${id}`),
  getPublic: (userId: string) =>
    apiClient.get(`/availabilities/${userId}/public`),
};

export interface VendeurPublicItem {
  id: string;
  firstName: string;
  lastNameInitial: string;
  avatarUrl: string | null;
  bio: string | null;
  zones: string[];
  categories: string[];
  level: 'debutant' | 'confirme' | 'star';
  isStar: boolean;
  ratingAvg: number;
  missionsCount: number;
}

export interface ReviewPublic {
  rating: number;
  comment: string | null;
  clientFirstName: string;
  createdAt: string;
}

export interface VendeurPublicDetail extends VendeurPublicItem {
  reviews: ReviewPublic[];
}

export interface VendeursPublicParams {
  page?: number;
  limit?: number;
  categories?: string;
  zones?: string;
  level?: 'debutant' | 'confirme' | 'star';
  isStar?: boolean;
  minRating?: number;
  sort?: 'rating' | 'missions' | 'recent';
}

export interface VendeursPublicMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface VendeursPublicResponse {
  data: VendeurPublicItem[];
  meta: VendeursPublicMeta;
}

export const vendeursPublicApi = {
  getAll: (params?: VendeursPublicParams) =>
    apiClient.get<VendeursPublicResponse>('/vendeurs-public', { params }),
  getOne: (id: string) =>
    apiClient.get<VendeurPublicDetail>(`/vendeurs-public/${id}`),
};

export const adminApi = {
  getMissions: () => apiClient.get('/admin/missions'),
  assignVendeur: (missionId: string, vendeurId: string) =>
    apiClient.patch(`/admin/missions/${missionId}/assign`, { vendeurId }),
  getVendeurs: () => apiClient.get('/admin/vendeurs'),
  validateVendeur: (id: string) => apiClient.patch(`/admin/vendeurs/${id}/validate`),
  toggleStar: (id: string) => apiClient.patch(`/admin/vendeurs/${id}/toggle-star`),
  getClients: () => apiClient.get('/admin/clients'),
  getFlaggedMessages: () => apiClient.get('/admin/chat/flagged'),
  approveMessage: (id: string) => apiClient.patch(`/admin/chat/${id}/approve`),
  deleteMessage: (id: string) => apiClient.post(`/admin/chat/${id}/delete`),
  exportMissions: () =>
    apiClient.get('/admin/export/missions', { responseType: 'blob' }),
  getSubscriptions: () => apiClient.get('/admin/subscriptions'),
  getMission: (id: string) => apiClient.get(`/missions/${id}`),
};
