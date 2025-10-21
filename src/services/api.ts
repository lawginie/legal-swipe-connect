import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  baseSignIn: async (walletAddress: string, signature: string, message: string, fullName?: string, userType?: string) => {
    const response = await api.post('/auth/base-signin', {
      walletAddress,
      signature,
      message,
      fullName,
      userType: userType || 'client'
    });
    return response.data;
  },

  verifyToken: async (token: string) => {
    const response = await api.post('/auth/verify-token', { token });
    return response.data;
  },

  logout: async (userId: string) => {
    const response = await api.post('/auth/logout', { userId });
    return response.data;
  }
};

// Session API
export const sessionAPI = {
  create: async (userId: string, walletAddress: string, token: string, signature?: string, message?: string) => {
    const response = await api.post('/sessions', {
      userId,
      walletAddress,
      token,
      signature,
      message,
      deviceInfo: {
        userAgent: navigator.userAgent,
        platform: navigator.platform
      }
    });
    return response.data;
  },

  getActive: async (userId: string) => {
    const response = await api.get(`/sessions/${userId}`);
    return response.data;
  },

  updateActivity: async (sessionId: string) => {
    const response = await api.patch(`/sessions/${sessionId}/activity`);
    return response.data;
  },

  terminate: async (sessionId: string) => {
    const response = await api.delete(`/sessions/${sessionId}`);
    return response.data;
  },

  terminateAll: async (userId: string) => {
    const response = await api.delete(`/sessions/user/${userId}`);
    return response.data;
  }
};

// Profile API
export const profileAPI = {
  get: async (userId: string) => {
    const response = await api.get(`/profile/${userId}`);
    return response.data;
  },

  save: async (profileData: any) => {
    const response = await api.post('/profile', profileData);
    return response.data;
  },

  updateSettings: async (userId: string, settings: any) => {
    const response = await api.patch(`/profile/${userId}/settings`, settings);
    return response.data;
  },

  updateVerification: async (userId: string, verification: any) => {
    const response = await api.patch(`/profile/${userId}/verification`, verification);
    return response.data;
  }
};

// Activity API
export const activityAPI = {
  record: async (userId: string, activityType: string, targetId?: string, metadata?: any, sessionId?: string) => {
    const response = await api.post('/activity', {
      userId,
      activityType,
      targetId,
      metadata,
      sessionId
    });
    return response.data;
  },

  getHistory: async (userId: string, activityType?: string, limit = 50, page = 1) => {
    const params = new URLSearchParams({
      limit: limit.toString(),
      page: page.toString(),
      ...(activityType && { activityType })
    });
    const response = await api.get(`/activity/${userId}?${params}`);
    return response.data;
  },

  getStats: async (userId: string, startDate?: string, endDate?: string) => {
    const params = new URLSearchParams({
      ...(startDate && { startDate }),
      ...(endDate && { endDate })
    });
    const response = await api.get(`/activity/${userId}/stats?${params}`);
    return response.data;
  },

  clear: async (userId: string, olderThan?: string) => {
    const params = olderThan ? `?olderThan=${olderThan}` : '';
    const response = await api.delete(`/activity/${userId}${params}`);
    return response.data;
  }
};

// Chat API (enhanced)
export const chatAPI = {
  getRooms: async (userId: string) => {
    const response = await api.get(`/chats/user/${userId}`);
    return response.data;
  },

  getMessages: async (roomId: string, limit = 50, page = 1) => {
    const response = await api.get(`/chats/room/${roomId}?limit=${limit}&page=${page}`);
    return response.data;
  },

  sendMessage: async (roomId: string, senderId: string, content: string) => {
    const response = await api.post(`/chats/room/${roomId}/message`, {
      senderId,
      content
    });
    return response.data;
  },

  createRoom: async (clientId: string, lawyerId: string, matchId: string) => {
    const response = await api.post('/chats/room', {
      clientId,
      lawyerId,
      matchId
    });
    return response.data;
  }
};

// Payment API (enhanced)
export const paymentAPI = {
  create: async (paymentData: any) => {
    const response = await api.post('/payments', paymentData);
    return response.data;
  },

  getByUser: async (userId: string) => {
    const response = await api.get(`/payments/user/${userId}`);
    return response.data;
  },

  getByService: async (serviceId: string) => {
    const response = await api.get(`/payments/service/${serviceId}`);
    return response.data;
  },

  updateStatus: async (paymentId: string, status: string, transactionHash?: string) => {
    const response = await api.patch(`/payments/${paymentId}/status`, {
      status,
      transactionHash
    });
    return response.data;
  }
};

// Swipe API (enhanced)
export const swipeAPI = {
  create: async (swipeData: any) => {
    const response = await api.post('/swipes', swipeData);
    return response.data;
  },

  getHistory: async (userId: string) => {
    const response = await api.get(`/swipes/user/${userId}`);
    return response.data;
  }
};

// Match API (enhanced)
export const matchAPI = {
  getMatches: async (clientId: string) => {
    const response = await api.get(`/matches/${clientId}`);
    return response.data;
  },

  unmatch: async (matchId: string) => {
    const response = await api.delete(`/matches/${matchId}`);
    return response.data;
  }
};

// Lawyer API (enhanced)
export const lawyerAPI = {
  getAll: async (page = 1, limit = 30, specialization?: string, location?: string, minRating?: number) => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(specialization && { specialization }),
      ...(location && { location }),
      ...(minRating && { minRating: minRating.toString() })
    });
    const response = await api.get(`/lawyers?${params}`);
    return response.data;
  },

  getById: async (lawyerId: string) => {
    const response = await api.get(`/lawyers/${lawyerId}`);
    return response.data;
  },

  getBySpecialization: async (specialization: string) => {
    const response = await api.get(`/lawyers/specialization/${encodeURIComponent(specialization)}`);
    return response.data;
  }
};

export default api;
