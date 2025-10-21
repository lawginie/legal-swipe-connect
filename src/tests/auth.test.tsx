/**
 * Unit Tests for Authentication Flows
 * Tests core authentication functionality including sign up, sign in, and validation
 */

import { describe, it, expect, beforeEach, vi, Mock } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { toast } from 'sonner';
import Auth from '@/pages/Auth';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';
import { featureFlags } from '@/utils/featureFlags';

// Mock dependencies
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      signUp: vi.fn(),
      signInWithPassword: vi.fn(),
    }
  }
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  }
}));

vi.mock('@/utils/logger', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
    warn: vi.fn(),
  }
}));

vi.mock('@/utils/featureFlags', () => ({
  featureFlags: {
    isEnabled: vi.fn(),
    setContext: vi.fn(),
  }
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  };
});

const renderAuth = () => {
  return render(
    <BrowserRouter>
      <Auth />
    </BrowserRouter>
  );
};

describe('Authentication Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (featureFlags.isEnabled as Mock).mockReturnValue(true);
  });

  describe('Sign Up Flow', () => {
    it('should validate required fields for client signup', async () => {
      renderAuth();
      
      // Switch to sign up mode
      const signUpButton = screen.getByText('Sign Up');
      fireEvent.click(signUpButton);
      
      // Try to submit without filling required fields
      const submitButton = screen.getByRole('button', { name: /sign up/i });
      fireEvent.click(submitButton);
      
      // Should show validation errors
      expect(toast.error).toHaveBeenCalledWith('Please fill in all required fields');
    });

    it('should validate lawyer-specific fields when lawyer is selected', async () => {
      renderAuth();
      
      // Switch to sign up mode
      const signUpButton = screen.getByText('Sign Up');
      fireEvent.click(signUpButton);
      
      // Select lawyer user type
      const lawyerRadio = screen.getByLabelText('Lawyer');
      fireEvent.click(lawyerRadio);
      
      // Fill basic fields but not lawyer-specific ones
      fireEvent.change(screen.getByPlaceholderText('Full Name'), {
        target: { value: 'John Lawyer' }
      });
      fireEvent.change(screen.getByPlaceholderText('Email'), {
        target: { value: 'john@lawyer.com' }
      });
      fireEvent.change(screen.getByPlaceholderText('Password'), {
        target: { value: 'password123' }
      });
      
      // Try to submit without lawyer fields
      const submitButton = screen.getByRole('button', { name: /sign up/i });
      fireEvent.click(submitButton);
      
      // Should show lawyer validation error
      expect(toast.error).toHaveBeenCalledWith('Please fill in all lawyer-specific fields');
    });

    it('should successfully create client account', async () => {
      (supabase.auth.signUp as Mock).mockResolvedValue({ error: null });
      
      renderAuth();
      
      // Switch to sign up mode
      const signUpButton = screen.getByText('Sign Up');
      fireEvent.click(signUpButton);
      
      // Fill client form
      fireEvent.change(screen.getByPlaceholderText('Full Name'), {
        target: { value: 'John Client' }
      });
      fireEvent.change(screen.getByPlaceholderText('Email'), {
        target: { value: 'john@client.com' }
      });
      fireEvent.change(screen.getByPlaceholderText('Password'), {
        target: { value: 'password123' }
      });
      
      // Submit form
      const submitButton = screen.getByRole('button', { name: /sign up/i });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(supabase.auth.signUp).toHaveBeenCalledWith({
          email: 'john@client.com',
          password: 'password123',
          options: {
            data: {
              full_name: 'John Client',
              user_type: 'client'
            }
          }
        });
      });
      
      expect(logger.info).toHaveBeenCalledWith('Sign up successful', {
        action: 'auth_signup_success',
        metadata: { email: 'john@client.com', userType: 'client' }
      });
      
      expect(toast.success).toHaveBeenCalledWith('Account created! Please log in.');
    });

    it('should successfully create lawyer account with all fields', async () => {
      (supabase.auth.signUp as Mock).mockResolvedValue({ error: null });
      
      renderAuth();
      
      // Switch to sign up mode
      const signUpButton = screen.getByText('Sign Up');
      fireEvent.click(signUpButton);
      
      // Select lawyer user type
      const lawyerRadio = screen.getByLabelText('Lawyer');
      fireEvent.click(lawyerRadio);
      
      // Fill all fields
      fireEvent.change(screen.getByPlaceholderText('Full Name'), {
        target: { value: 'Sarah Lawyer' }
      });
      fireEvent.change(screen.getByPlaceholderText('Email'), {
        target: { value: 'sarah@lawyer.com' }
      });
      fireEvent.change(screen.getByPlaceholderText('Password'), {
        target: { value: 'password123' }
      });
      fireEvent.change(screen.getByPlaceholderText('Practice Number'), {
        target: { value: 'LAW123456' }
      });
      fireEvent.change(screen.getByPlaceholderText('Business Address'), {
        target: { value: '123 Legal St, Law City' }
      });
      fireEvent.change(screen.getByPlaceholderText('Phone Number'), {
        target: { value: '+1234567890' }
      });
      
      // Submit form
      const submitButton = screen.getByRole('button', { name: /sign up/i });
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
              address: '123 Legal St, Law City',
              phone_number: '+1234567890'
            }
          }
        });
      });
      
      expect(logger.info).toHaveBeenCalledWith('Sign up successful', {
        action: 'auth_signup_success',
        metadata: { email: 'sarah@lawyer.com', userType: 'lawyer' }
      });
    });

    it('should handle signup errors gracefully', async () => {
      const errorMessage = 'Email already registered';
      (supabase.auth.signUp as Mock).mockResolvedValue({ 
        error: { message: errorMessage } 
      });
      
      renderAuth();
      
      // Switch to sign up mode and fill form
      const signUpButton = screen.getByText('Sign Up');
      fireEvent.click(signUpButton);
      
      fireEvent.change(screen.getByPlaceholderText('Full Name'), {
        target: { value: 'John Client' }
      });
      fireEvent.change(screen.getByPlaceholderText('Email'), {
        target: { value: 'existing@client.com' }
      });
      fireEvent.change(screen.getByPlaceholderText('Password'), {
        target: { value: 'password123' }
      });
      
      const submitButton = screen.getByRole('button', { name: /sign up/i });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(logger.error).toHaveBeenCalledWith('Sign up failed', {
          action: 'auth_signup_error',
          error: errorMessage,
          metadata: { email: 'existing@client.com', userType: 'client' }
        });
      });
      
      expect(toast.error).toHaveBeenCalledWith(errorMessage);
    });
  });

  describe('Sign In Flow', () => {
    it('should successfully sign in user', async () => {
      (supabase.auth.signInWithPassword as Mock).mockResolvedValue({ error: null });
      
      renderAuth();
      
      // Fill sign in form
      fireEvent.change(screen.getByPlaceholderText('Email'), {
        target: { value: 'user@test.com' }
      });
      fireEvent.change(screen.getByPlaceholderText('Password'), {
        target: { value: 'password123' }
      });
      
      // Submit form
      const submitButton = screen.getByRole('button', { name: /sign in/i });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
          email: 'user@test.com',
          password: 'password123'
        });
      });
      
      expect(logger.info).toHaveBeenCalledWith('Sign in successful', {
        action: 'auth_signin_success',
        metadata: { email: 'user@test.com' }
      });
      
      expect(toast.success).toHaveBeenCalledWith('Logged in successfully!');
    });

    it('should handle sign in errors', async () => {
      const errorMessage = 'Invalid credentials';
      (supabase.auth.signInWithPassword as Mock).mockResolvedValue({ 
        error: { message: errorMessage } 
      });
      
      renderAuth();
      
      // Fill and submit form
      fireEvent.change(screen.getByPlaceholderText('Email'), {
        target: { value: 'wrong@test.com' }
      });
      fireEvent.change(screen.getByPlaceholderText('Password'), {
        target: { value: 'wrongpassword' }
      });
      
      const submitButton = screen.getByRole('button', { name: /sign in/i });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(logger.error).toHaveBeenCalledWith('Sign in failed', {
          action: 'auth_signin_error',
          error: errorMessage,
          metadata: { email: 'wrong@test.com' }
        });
      });
      
      expect(toast.error).toHaveBeenCalledWith(errorMessage);
    });
  });

  describe('Feature Flags', () => {
    it('should hide Base wallet integration when feature flag is disabled', () => {
      (featureFlags.isEnabled as Mock).mockReturnValue(false);
      
      renderAuth();
      
      // Base wallet button should not be visible
      expect(screen.queryByText('Sign in with Base Wallet')).not.toBeInTheDocument();
      expect(screen.queryByText('Register with BASE')).not.toBeInTheDocument();
    });

    it('should show Base wallet integration when feature flag is enabled', () => {
      (featureFlags.isEnabled as Mock).mockReturnValue(true);
      
      renderAuth();
      
      // Base wallet button should be visible
      expect(screen.getByText('Sign in with Base Wallet')).toBeInTheDocument();
    });
  });

  describe('Form Validation', () => {
    it('should validate email format', async () => {
      renderAuth();
      
      // Fill invalid email
      fireEvent.change(screen.getByPlaceholderText('Email'), {
        target: { value: 'invalid-email' }
      });
      fireEvent.change(screen.getByPlaceholderText('Password'), {
        target: { value: 'password123' }
      });
      
      const submitButton = screen.getByRole('button', { name: /sign in/i });
      fireEvent.click(submitButton);
      
      // Should show validation error
      expect(toast.error).toHaveBeenCalledWith('Please enter a valid email address');
    });

    it('should validate password length', async () => {
      renderAuth();
      
      // Switch to sign up mode
      const signUpButton = screen.getByText('Sign Up');
      fireEvent.click(signUpButton);
      
      // Fill short password
      fireEvent.change(screen.getByPlaceholderText('Full Name'), {
        target: { value: 'John Client' }
      });
      fireEvent.change(screen.getByPlaceholderText('Email'), {
        target: { value: 'john@test.com' }
      });
      fireEvent.change(screen.getByPlaceholderText('Password'), {
        target: { value: '123' }
      });
      
      const submitButton = screen.getByRole('button', { name: /sign up/i });
      fireEvent.click(submitButton);
      
      // Should show validation error
      expect(toast.error).toHaveBeenCalledWith('Password must be at least 6 characters long');
    });
  });
});