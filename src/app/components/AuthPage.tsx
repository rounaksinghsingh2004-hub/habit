import { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase-client';
import { Loader2, Mail, Lock, User, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { getAuthErrorMessage, validateEmail } from '@/utils/auth';

type AuthMode = 'login' | 'signup' | 'forgot-password' | 'reset-password';

interface AuthPageProps {
  onAuthSuccess: (accessToken: string, userId: string) => void;
  onSwitchToGuest?: () => void;
}

export default function AuthPage({ onAuthSuccess, onSwitchToGuest }: AuthPageProps) {
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Clear messages when mode changes
  useEffect(() => {
    setError('');
    setSuccessMessage('');
  }, [mode]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      setLoading(false);
      return;
    }

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        setError(getAuthErrorMessage(authError.message));
        return;
      }

      if (data.session) {
        onAuthSuccess(data.session.access_token, data.user.id);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to login. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      setLoading(false);
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      setLoading(false);
      return;
    }

    if (!name.trim()) {
      setError('Please enter your name');
      setLoading(false);
      return;
    }

    try {
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name.trim(),
          },
        },
      });

      if (authError) {
        setError(getAuthErrorMessage(authError.message));
        return;
      }

      // If user was created but email confirmation is required
      if (data.user && data.session) {
        onAuthSuccess(data.session.access_token, data.user.id);
      } else if (data.user && !data.session) {
        // Email confirmation required
        setSuccessMessage('Account created! Please check your email to confirm your account.');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      setLoading(false);
      return;
    }

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (resetError) {
        setError(getAuthErrorMessage(resetError.message));
        return;
      }

      setSuccessMessage('Password reset email sent! Check your inbox for instructions.');
    } catch (err: any) {
      setError(err.message || 'Failed to send reset email.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      setLoading(false);
      return;
    }

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password,
      });

      if (updateError) {
        setError(getAuthErrorMessage(updateError.message));
        return;
      }

      setSuccessMessage('Password updated successfully! Redirecting to home...');
      
      // Redirect to home after a brief delay
      setTimeout(() => {
        const { data: { session } } = supabase.auth.getSession();
        if (session) {
          onAuthSuccess(session.access_token, session.user.id);
        }
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to update password.');
    } finally {
      setLoading(false);
    }
  };

  const handleSwitchMode = (newMode: AuthMode) => {
    setMode(newMode);
  };

  const isLoginMode = mode === 'login';
  const isSignupMode = mode === 'signup';
  const isForgotMode = mode === 'forgot-password';
  const isResetMode = mode === 'reset-password';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Habit Tracker
          </h1>
          <p className="text-gray-600">
            {isForgotMode 
              ? 'Reset your password' 
              : isResetMode 
                ? 'Enter your new password'
                : 'Track your daily habits and build better routines'}
          </p>
        </div>

        {/* Auth Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          {/* Back button for non-login modes */}
          {!isLoginMode && (
            <button
              onClick={() => handleSwitchMode('login')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
            >
              <ArrowLeft size={20} />
              <span>Back to login</span>
            </button>
          )}

          {/* Toggle Login/Signup (only on main auth screen) */}
          {isLoginMode && (
            <div className="flex gap-2 mb-6 bg-gray-100 rounded-xl p-1">
              <button
                onClick={() => handleSwitchMode('login')}
                className={`flex-1 py-2 rounded-lg font-medium transition-all ${
                  isLoginMode
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Login
              </button>
              <button
                onClick={() => handleSwitchMode('signup')}
                className={`flex-1 py-2 rounded-lg font-medium transition-all ${
                  isSignupMode
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Sign Up
              </button>
            </div>
          )}

          {/* Form */}
          <form onSubmit={isForgotMode ? handleForgotPassword : isResetMode ? handleResetPassword : isLoginMode ? handleLogin : handleSignup} className="space-y-4">
            {/* Name field - Signup only */}
            {isSignupMode && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Name
                </label>
                <div className="relative">
                  <User size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Your name"
                    required={isSignupMode}
                  />
                </div>
              </div>
            )}

            {/* Email field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            {/* Password field - Not for forgot password */}
            {!isForgotMode && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="••••••••"
                    required={!isForgotMode}
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
            )}

            {/* Error message */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                {error}
              </div>
            )}

            {/* Success message */}
            {successMessage && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-xl text-green-600 text-sm">
                {successMessage}
              </div>
            )}

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium hover:from-blue-700 hover:to-purple-700 transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  {isLoginMode 
                    ? 'Logging in...' 
                    : isSignupMode 
                      ? 'Creating account...' 
                      : isForgotMode 
                        ? 'Sending...' 
                        : 'Updating...'}
                </>
              ) : (
                isLoginMode 
                  ? 'Login' 
                  : isSignupMode 
                    ? 'Create Account' 
                    : isForgotMode 
                      ? 'Send Reset Link' 
                      : 'Update Password'
              )}
            </button>
          </form>

          {/* Forgot Password link */}
          {isLoginMode && (
            <button
              onClick={() => handleSwitchMode('forgot-password')}
              className="w-full text-center text-sm text-blue-600 hover:underline mt-4"
            >
              Forgot your password?
            </button>
          )}
        </div>

        {/* Footer */}
        {isLoginMode && (
          <>
            <p className="text-center text-sm text-gray-500 mt-6">
              Don't have an account?{' '}
              <button
                onClick={() => handleSwitchMode('signup')}
                className="text-blue-600 hover:underline font-medium"
              >
                Sign up
              </button>
            </p>
            
            {/* Guest mode option */}
            {onSwitchToGuest && (
              <>
                <div className="flex items-center gap-4 my-6">
                  <div className="flex-1 h-px bg-gray-200" />
                  <span className="text-sm text-gray-400">or</span>
                  <div className="flex-1 h-px bg-gray-200" />
                </div>
                
                <button
                  onClick={onSwitchToGuest}
                  className="w-full py-3 bg-white border-2 border-gray-200 text-gray-700 rounded-xl font-medium hover:border-blue-400 hover:text-blue-600 transition-all flex items-center justify-center gap-2"
                >
                  Continue as Guest
                </button>
                <p className="text-center text-xs text-gray-400 mt-3">
                  Try without creating an account
                </p>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
