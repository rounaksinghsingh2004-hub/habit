// ============================================================================
// AUTHENTICATION UTILITY
// ============================================================================
// Handles email/password authentication with Supabase
// ============================================================================

import { supabase } from './supabase-client';
import type { Profile } from './supabase-schema';

// ============================================================================
// TYPES
// ============================================================================

export interface AuthState {
  isAuthenticated: boolean;
  userId: string | null;
  userEmail: string | null;
  userName: string | null;
  userCreatedAt: string | null;
  isLoading: boolean;
}

export interface AuthResult {
  success: boolean;
  error?: string;
  user?: Profile;
}

// ============================================================================
// AUTHENTICATION FUNCTIONS
// ============================================================================

/**
 * Sign in with email and password
 */
export async function signInWithEmail(
  email: string,
  password: string
): Promise<AuthResult> {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    if (data.user) {
      return {
        success: true,
        user: {
          id: data.user.id,
          email: data.user.email || '',
          full_name: data.user.user_metadata?.name,
          created_at: data.user.created_at,
        },
      };
    }

    return { success: false, error: 'No user returned' };
  } catch (err) {
    console.error('Sign in error:', err);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Sign up with email, password, and name
 */
export async function signUpWithEmail(
  email: string,
  password: string,
  name: string
): Promise<AuthResult> {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
        },
      },
    });

    if (error) {
      return { success: false, error: error.message };
    }

    if (data.user) {
      // Profile will be created automatically by the database trigger
      return {
        success: true,
        user: {
          id: data.user.id,
          email: data.user.email || '',
          full_name: name,
          created_at: data.user.created_at,
        },
      };
    }

    return { success: false, error: 'No user returned' };
  } catch (err) {
    console.error('Sign up error:', err);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Sign out the current user
 */
export async function signOut(): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      return { success: false, error: error.message };
    }
    
    return { success: true };
  } catch (err) {
    console.error('Sign out error:', err);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Reset password (send password reset email)
 */
export async function resetPassword(email: string): Promise<AuthResult> {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    console.error('Password reset error:', err);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Update user password (when logged in)
 */
export async function updatePassword(
  newPassword: string
): Promise<AuthResult> {
  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    console.error('Update password error:', err);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Update user profile
 */
export async function updateProfile(
  updates: Partial<Profile>
): Promise<AuthResult> {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error) {
      return { success: false, error: error.message };
    }

    if (!user) {
      return { success: false, error: 'No user logged in' };
    }

    // Update auth metadata
    const { error: updateError } = await supabase.auth.updateUser({
      data: {
        name: updates.full_name,
      },
    });

    if (updateError) {
      return { success: false, error: updateError.message };
    }

    return {
      success: true,
      user: {
        id: user.id,
        email: user.email || '',
        full_name: updates.full_name,
        avatar_url: updates.avatar_url,
        created_at: new Date().toISOString(),
      },
    };
  } catch (err) {
    console.error('Update profile error:', err);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

// ============================================================================
// SESSION MANAGEMENT
// ============================================================================

/**
 * Get current session
 */
export async function getSession(): Promise<{
  accessToken: string | null;
  refreshToken: string | null;
  userId: string | null;
  userEmail: string | null;
}> {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();

    if (error || !session) {
      return {
        accessToken: null,
        refreshToken: null,
        userId: null,
        userEmail: null,
      };
    }

    return {
      accessToken: session.access_token,
      refreshToken: session.refresh_token,
      userId: session.user.id,
      userEmail: session.user.email || null,
    };
  } catch (err) {
    console.error('Get session error:', err);
    return {
      accessToken: null,
      refreshToken: null,
      userId: null,
      userEmail: null,
    };
  }
}

/**
 * Get current user
 */
export async function getCurrentUser(): Promise<Profile | null> {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      return null;
    }

    return {
      id: user.id,
      email: user.email || '',
      full_name: user.user_metadata?.name,
      avatar_url: user.user_metadata?.avatar_url,
      created_at: user.created_at,
    };
  } catch (err) {
    console.error('Get current user error:', err);
    return null;
  }
}

/**
 * Refresh the session
 */
export async function refreshSession(): Promise<boolean> {
  try {
    const { data: { session }, error } = await supabase.auth.refreshSession();

    if (error || !session) {
      return false;
    }

    return true;
  } catch (err) {
    console.error('Refresh session error:', err);
    return false;
  }
}

/**
 * Check if session is valid
 */
export async function isAuthenticated(): Promise<boolean> {
  const session = await getSession();
  return !!session.accessToken;
}

// ============================================================================
// AUTH STATE LISTENER
// ============================================================================

type AuthCallback = (state: AuthState) => void;

/**
 * Subscribe to auth state changes
 */
export function onAuthStateChange(callback: AuthCallback): () => void {
  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    async (event, session) => {
      const state: AuthState = {
        isAuthenticated: !!session,
        userId: session?.user?.id || null,
        userEmail: session?.user?.email || null,
        userName: session?.user?.user_metadata?.name || null,
        userCreatedAt: session?.user?.created_at || null,
        isLoading: false,
      };
      callback(state);
    }
  );

  return () => subscription.unsubscribe();
}

// ============================================================================
// PASSWORD VALIDATION
// ============================================================================

export interface PasswordValidation {
  valid: boolean;
  errors: string[];
}

export function validatePassword(password: string): PasswordValidation {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// ============================================================================
// ERROR MESSAGES
// ============================================================================

export function getAuthErrorMessage(error: string): string {
  const errorMap: Record<string, string> = {
    'Invalid login credentials': 'Invalid email or password',
    'Email not confirmed': 'Please confirm your email address',
    'User already registered': 'An account with this email already exists',
    'Invalid email': 'Please enter a valid email address',
    'Password should be at least 6 characters': 'Password must be at least 6 characters',
    'Weak password': 'Password is too weak',
    'Rate limit exceeded': 'Too many attempts. Please try again later',
    'Network error': 'Network error. Please check your connection',
    'Session expired': 'Your session has expired. Please log in again',
    'Invalid refresh token': 'Session expired. Please log in again',
  };

  return errorMap[error] || error;
}

// ============================================================================
// CONSTANTS
// ============================================================================

export const AUTH_STORAGE_KEY = 'habit_dashboard_auth';
export const SESSION_TIMEOUT = 24 * 60 * 60 * 1000; // 24 hours

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Check if we're running in a browser
 */
export function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

/**
 * Get redirect URL after auth
 */
export function getRedirectUrl(): string {
  if (!isBrowser()) return '/';
  
  const params = new URLSearchParams(window.location.search);
  const redirect = params.get('redirect');
  
  if (redirect) {
    return decodeURIComponent(redirect);
  }
  
  return '/';
}

/**
 * Clear all auth-related storage
 */
export function clearAuthStorage(): void {
  if (!isBrowser()) return;
  
  localStorage.removeItem(AUTH_STORAGE_KEY);
  
  // Clear Supabase tokens
  Object.keys(localStorage).forEach((key) => {
    if (key.startsWith('sb-')) {
      localStorage.removeItem(key);
    }
  });
}
