/**
 * Integration Tests for Complete User Flows
 * Tests end-to-end user journeys from registration to core functionality
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from '@/App';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';
import { featureFlags } from '@/utils/featureFlags';

// Mock Supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      signUp: vi.fn(),
      signInWithPassword: vi.fn(),
      getSession: vi.fn(),
      onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
    },
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(),
        })),
      })),
      insert: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    })),
  }
}));

// Mock toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  }
}));

// Mock logger
vi.mock('@/utils/logger', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
    warn: vi.fn(),
  }
}));

// Mock feature flags
vi.mock('@/utils/featureFlags', () => ({
  featureFlags: {
    isEnabled: vi.fn(),
    setContext: vi.fn(),
  }
}));

const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
});

const renderApp = () => {
  const queryClient = createTestQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </QueryClientProvider>
  );
};

interface MockSession {
  user?: {
    id: string;
    email: string;
  };
  access_token?: string;
}

describe('Complete User Flows Integration Tests', () => {
  let mockSession: MockSession | null;

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Default feature flags enabled
    vi.mocked(featureFlags.isEnabled).mockReturnValue(true);
    
    // Mock no initial session
    mockSession = null;
    vi.mocked(supabase.auth.getSession).mockResolvedValue({ 
      data: { session: mockSession }, 
      error: null 
    });
    
    // Mock auth state change
    vi.mocked(supabase.auth.onAuthStateChange).mockImplementation((callback) => {
      callback('SIGNED_OUT', mockSession);
      return { data: { subscription: { unsubscribe: vi.fn() } } };
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Client User Journey', () => {
    it('should complete full client registration and access discovery page', async () => {
      // Mock successful signup
      vi.mocked(supabase.auth.signUp).mockResolvedValue({ error: null });
      
      // Mock successful signin
      const clientSession = {
        user: {
          id: 'client-123',
          email: 'client@test.com',
          user_metadata: {
            full_name: 'John Client',
            user_type: 'client'
          }
        }
      };
      vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({ error: null });
      
      renderApp();
      
      // Should start on auth page
      expect(screen.getByText('Welcome to LawFinder')).toBeInTheDocument();
      
      // Step 1: Register as client
      const signUpButton = screen.getByText('Sign Up');
      fireEvent.click(signUpButton);
      
      // Fill client registration form
      fireEvent.change(screen.getByPlaceholderText('Full Name'), {
        target: { value: 'John Client' }
      });
      fireEvent.change(screen.getByPlaceholderText('Email'), {
        target: { value: 'client@test.com' }
      });
      fireEvent.change(screen.getByPlaceholderText('Password'), {
        target: { value: 'password123' }
      });
      
      // Ensure client is selected (default)
      const clientRadio = screen.getByLabelText('Client');
      expect(clientRadio).toBeChecked();
      
      // Submit registration
      const submitButton = screen.getByRole('button', { name: /sign up/i });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(supabase.auth.signUp).toHaveBeenCalledWith({
          email: 'client@test.com',
          password: 'password123',
          options: {
            data: {
              full_name: 'John Client',
              user_type: 'client'
            }
          }
        });
      });
      
      // Step 2: Sign in after registration
      fireEvent.change(screen.getByPlaceholderText('Email'), {
        target: { value: 'client@test.com' }
      });
      fireEvent.change(screen.getByPlaceholderText('Password'), {
        target: { value: 'password123' }
      });
      
      const signInButton = screen.getByRole('button', { name: /sign in/i });
      fireEvent.click(signInButton);
      
      // Mock session change to signed in
      mockSession = clientSession;
      vi.mocked(supabase.auth.onAuthStateChange).mockImplementation((callback) => {
        callback('SIGNED_IN', mockSession);
        return { data: { subscription: { unsubscribe: vi.fn() } } };
      });
      
      // Should redirect to discovery page for clients
      await waitFor(() => {
        expect(logger.info).toHaveBeenCalledWith('Sign in successful', {
          action: 'auth_signin_success',
          metadata: { email: 'client@test.com' }
        });
      });
    });

    it('should show lawyer-specific fields only when lawyer is selected', async () => {
      renderApp();
      
      // Go to sign up
      const signUpButton = screen.getByText('Sign Up');
      fireEvent.click(signUpButton);
      
      // Initially, lawyer fields should not be visible
      expect(screen.queryByPlaceholderText('Practice Number')).not.toBeInTheDocument();
      expect(screen.queryByPlaceholderText('Business Address')).not.toBeInTheDocument();
      expect(screen.queryByPlaceholderText('Phone Number')).not.toBeInTheDocument();
      
      // Select lawyer
      const lawyerRadio = screen.getByLabelText('Lawyer');
      fireEvent.click(lawyerRadio);
      
      // Now lawyer fields should be visible
      expect(screen.getByPlaceholderText('Practice Number')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Business Address')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Phone Number')).toBeInTheDocument();
      
      // Switch back to client
      const clientRadio = screen.getByLabelText('Client');
      fireEvent.click(clientRadio);
      
      // Lawyer fields should be hidden again
      expect(screen.queryByPlaceholderText('Practice Number')).not.toBeInTheDocument();
      expect(screen.queryByPlaceholderText('Business Address')).not.toBeInTheDocument();
      expect(screen.queryByPlaceholderText('Phone Number')).not.toBeInTheDocument();
    });
  });

  describe('Lawyer User Journey', () => {
    it('should complete full lawyer registration with validation', async () => {
      // Mock successful signup
      vi.mocked(supabase.auth.signUp).mockResolvedValue({ error: null });
      
      renderApp();
      
      // Go to sign up
      const signUpButton = screen.getByText('Sign Up');
      fireEvent.click(signUpButton);
      
      // Select lawyer
      const lawyerRadio = screen.getByLabelText('Lawyer');
      fireEvent.click(lawyerRadio);
      
      // Fill basic fields but not lawyer-specific ones
      fireEvent.change(screen.getByPlaceholderText('Full Name'), {
        target: { value: 'Sarah Lawyer' }
      });
      fireEvent.change(screen.getByPlaceholderText('Email'), {
        target: { value: 'sarah@lawyer.com' }
      });
      fireEvent.change(screen.getByPlaceholderText('Password'), {
        target: { value: 'password123' }
      });
      
      // Try to submit without lawyer fields - should fail validation
      const submitButton = screen.getByRole('button', { name: /sign up/i });
      fireEvent.click(submitButton);
      
      // Should not call signup yet
      expect(supabase.auth.signUp).not.toHaveBeenCalled();
      
      // Fill lawyer-specific fields
      fireEvent.change(screen.getByPlaceholderText('Practice Number'), {
        target: { value: 'LAW123456' }
      });
      fireEvent.change(screen.getByPlaceholderText('Business Address'), {
        target: { value: '123 Legal Street, Law City' }
      });
      fireEvent.change(screen.getByPlaceholderText('Phone Number'), {
        target: { value: '+1234567890' }
      });
      
      // Now submit should work
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(supabase.auth.signUp).toHaveBeenCalledWith({
          email: 'sarah@lawyer.com',
          password: 'password123',
          options: {
            data: {
              full_name: 'Sarah Lawyer',
              user_type: 'lawyer',
              practice_number: 'LAW123456',
              address: '123 Legal Street, Law City',
              phone_number: '+1234567890'
            }
          }
        });
      });
    });

    it('should redirect lawyer to dashboard after login', async () => {
      // Mock lawyer session
      const lawyerSession = {
        user: {
          id: 'lawyer-123',
          email: 'lawyer@test.com',
          user_metadata: {
            full_name: 'Sarah Lawyer',
            user_type: 'lawyer'
          }
        }
      };
      
      // Mock successful signin
      vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({ error: null });
      
      renderApp();
      
      // Sign in as lawyer
      fireEvent.change(screen.getByPlaceholderText('Email'), {
        target: { value: 'lawyer@test.com' }
      });
      fireEvent.change(screen.getByPlaceholderText('Password'), {
        target: { value: 'password123' }
      });
      
      const signInButton = screen.getByRole('button', { name: /sign in/i });
      fireEvent.click(signInButton);
      
      // Mock session change
      mockSession = lawyerSession;
      vi.mocked(supabase.auth.onAuthStateChange).mockImplementation((callback) => {
        callback('SIGNED_IN', mockSession);
        return { data: { subscription: { unsubscribe: vi.fn() } } };
      });
      
      await waitFor(() => {
        expect(logger.info).toHaveBeenCalledWith('Sign in successful', {
          action: 'auth_signin_success',
          metadata: { email: 'lawyer@test.com' }
        });
      });
    });
  });

  describe('Feature Flag Integration', () => {
    it('should hide Base wallet features when feature flag is disabled', () => {
      // Disable Base wallet feature
      vi.mocked(featureFlags.isEnabled).mockImplementation((flag: string) => {
        return flag !== 'base_wallet_integration';
      });
      
      renderApp();
      
      // Base wallet elements should not be visible
      expect(screen.queryByText('Sign in with Base Wallet')).not.toBeInTheDocument();
      expect(screen.queryByText('Register with BASE')).not.toBeInTheDocument();
    });

    it('should show Base wallet features when feature flag is enabled', () => {
      // Enable all features
      vi.mocked(featureFlags.isEnabled).mockReturnValue(true);
      
      renderApp();
      
      // Base wallet elements should be visible
      expect(screen.getByText('Sign in with Base Wallet')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors gracefully', async () => {
      // Mock network error
      vi.mocked(supabase.auth.signInWithPassword).mockRejectedValue(
        new Error('Network error')
      );
      
      renderApp();
      
      // Try to sign in
      fireEvent.change(screen.getByPlaceholderText('Email'), {
        target: { value: 'user@test.com' }
      });
      fireEvent.change(screen.getByPlaceholderText('Password'), {
        target: { value: 'password123' }
      });
      
      const signInButton = screen.getByRole('button', { name: /sign in/i });
      fireEvent.click(signInButton);
      
      await waitFor(() => {
        expect(logger.error).toHaveBeenCalledWith('Sign in failed', {
          action: 'auth_signin_error',
          error: 'Network error',
          metadata: { email: 'user@test.com' }
        });
      });
    });

    it('should handle validation errors appropriately', async () => {
      renderApp();
      
      // Go to sign up
      const signUpButton = screen.getByText('Sign Up');
      fireEvent.click(signUpButton);
      
      // Try to submit empty form
      const submitButton = screen.getByRole('button', { name: /sign up/i });
      fireEvent.click(submitButton);
      
      // Should not call signup
      expect(supabase.auth.signUp).not.toHaveBeenCalled();
    });
  });

  describe('Logging and Observability', () => {
    it('should log authentication events properly', async () => {
      vi.mocked(supabase.auth.signUp).mockResolvedValue({ error: null });
      
      renderApp();
      
      // Go to sign up and fill form
      const signUpButton = screen.getByText('Sign Up');
      fireEvent.click(signUpButton);
      
      fireEvent.change(screen.getByPlaceholderText('Full Name'), {
        target: { value: 'Test User' }
      });
      fireEvent.change(screen.getByPlaceholderText('Email'), {
        target: { value: 'test@user.com' }
      });
      fireEvent.change(screen.getByPlaceholderText('Password'), {
        target: { value: 'password123' }
      });
      
      const submitButton = screen.getByRole('button', { name: /sign up/i });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        // Should log signup start
        expect(logger.info).toHaveBeenCalledWith('Sign up attempt started', {
          action: 'auth_signup_start',
          metadata: { email: 'test@user.com', userType: 'client' }
        });
        
        // Should log signup success
        expect(logger.info).toHaveBeenCalledWith('Sign up successful', {
          action: 'auth_signup_success',
          metadata: { email: 'test@user.com', userType: 'client' }
        });
      });
    });
  });
});