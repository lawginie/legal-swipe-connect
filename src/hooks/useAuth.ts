import { useState, useEffect, useCallback } from 'react';
import { authAPI, sessionAPI, activityAPI } from '../services/api';

interface User {
  userId: string;
  fullName: string;
  userType: string;
  walletAddress: string;
  email?: string;
  profileImageUrl?: string;
  createdAt: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  sessionId: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    token: null,
    sessionId: null,
    isAuthenticated: false,
    isLoading: true,
    error: null
  });

  // Load auth state from localStorage on mount
  useEffect(() => {
    const loadAuthState = () => {
      const token = localStorage.getItem('auth_token');
      const userData = localStorage.getItem('user_data');
      const sessionId = localStorage.getItem('session_id');

      if (token && userData) {
        try {
          const user = JSON.parse(userData);
          setAuthState({
            user,
            token,
            sessionId,
            isAuthenticated: true,
            isLoading: false,
            error: null
          });
        } catch (error) {
          console.error('Failed to parse user data:', error);
          clearAuthState();
        }
      } else {
        setAuthState(prev => ({ ...prev, isLoading: false }));
      }
    };

    loadAuthState();
  }, []);

  const clearAuthState = useCallback(() => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
    localStorage.removeItem('session_id');
    localStorage.removeItem('wallet_address');
    setAuthState({
      user: null,
      token: null,
      sessionId: null,
      isAuthenticated: false,
      isLoading: false,
      error: null
    });
  }, []);

  const signInWithBase = useCallback(async (
    walletAddress: string,
    signature: string,
    message: string,
    fullName?: string,
    userType?: string
  ) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));

      // Authenticate with backend
      const response = await authAPI.baseSignIn(
        walletAddress,
        signature,
        message,
        fullName,
        userType
      );

      if (response.success && response.data) {
        const { user, token, session } = response.data;

        // Store auth data
        localStorage.setItem('auth_token', token);
        localStorage.setItem('user_data', JSON.stringify(user));
        localStorage.setItem('wallet_address', walletAddress.toLowerCase());

        // Create session
        const sessionResponse = await sessionAPI.create(
          user.userId,
          walletAddress,
          token,
          signature,
          message
        );

        if (sessionResponse.success) {
          const sessionId = sessionResponse.data.sessionId;
          localStorage.setItem('session_id', sessionId);

          // Record login activity
          await activityAPI.record(
            user.userId,
            'login',
            undefined,
            { walletAddress, timestamp: new Date().toISOString() },
            sessionId
          );

          setAuthState({
            user,
            token,
            sessionId,
            isAuthenticated: true,
            isLoading: false,
            error: null
          });

          return { success: true, user };
        }
      }

      throw new Error('Authentication failed');
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || error.message || 'Authentication failed';
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage
      }));
      return { success: false, error: errorMessage };
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      if (authState.user) {
        // Record logout activity
        if (authState.sessionId) {
          await activityAPI.record(
            authState.user.userId,
            'logout',
            undefined,
            { timestamp: new Date().toISOString() },
            authState.sessionId
          );

          // Terminate session
          await sessionAPI.terminate(authState.sessionId);
        }

        // Logout from backend
        await authAPI.logout(authState.user.userId);
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      clearAuthState();
      window.location.href = '/';
    }
  }, [authState, clearAuthState]);

  const updateActivity = useCallback(async () => {
    if (authState.sessionId && authState.isAuthenticated) {
      try {
        await sessionAPI.updateActivity(authState.sessionId);
      } catch (error) {
        console.error('Failed to update activity:', error);
      }
    }
  }, [authState.sessionId, authState.isAuthenticated]);

  // Update activity every 5 minutes
  useEffect(() => {
    if (authState.isAuthenticated) {
      const interval = setInterval(() => {
        updateActivity();
      }, 5 * 60 * 1000);

      return () => clearInterval(interval);
    }
  }, [authState.isAuthenticated, updateActivity]);

  return {
    user: authState.user,
    token: authState.token,
    sessionId: authState.sessionId,
    isAuthenticated: authState.isAuthenticated,
    isLoading: authState.isLoading,
    error: authState.error,
    signInWithBase,
    logout,
    clearAuthState,
    updateActivity
  };
};
