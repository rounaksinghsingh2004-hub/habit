import { useState, useEffect } from 'react';
import { User, Mail, Calendar, LogOut, Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from '@/app/components/ThemeProvider';
import { supabase } from '@/utils/supabase-client';

interface UserProfileProps {
  userName: string;
  userEmail: string;
  createdAt: string;
  onLogout: () => void;
  totalHabits: number;
  totalDaysTracked: number;
  currentStreak: number;
}

export default function UserProfile({
  userName,
  userEmail,
  createdAt,
  onLogout,
  totalHabits,
  totalDaysTracked,
  currentStreak,
}: UserProfileProps) {
  const { theme, setTheme } = useTheme();
  const [displayName, setDisplayName] = useState(userName);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveName = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({
        data: { name: displayName }
      });
      
      if (error) {
        console.error('Failed to update name:', error);
      } else {
        setIsEditing(false);
      }
    } catch (err) {
      console.error('Error updating name:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const themeOptions = [
    { value: 'light', icon: Sun, label: 'Light' },
    { value: 'dark', icon: Moon, label: 'Dark' },
    { value: 'system', icon: Monitor, label: 'System' },
  ];

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Profile Header */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-8">
        <div className="flex items-start gap-6">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-3xl font-bold">
            {userName.charAt(0).toUpperCase()}
          </div>
          
          <div className="flex-1">
            {isEditing ? (
              <div className="flex items-center gap-2 mb-2">
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                  autoFocus
                />
                <button
                  onClick={handleSaveName}
                  disabled={isSaving}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {isSaving ? 'Saving...' : 'Save'}
                </button>
                <button
                  onClick={() => {
                    setDisplayName(userName);
                    setIsEditing(false);
                  }}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 mb-2">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{displayName}</h1>
                <button
                  onClick={() => setIsEditing(true)}
                  className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Edit
                </button>
              </div>
            )}
            
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-1">
              <Mail size={16} />
              <span>{userEmail}</span>
            </div>
            
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <Calendar size={16} />
              <span>Member since {formatDate(createdAt)}</span>
            </div>
          </div>
          
          <button
            onClick={onLogout}
            className="flex items-center gap-2 px-4 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-all"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-1">{totalHabits}</div>
          <div className="text-gray-600 dark:text-gray-400">Total Habits</div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-1">{totalDaysTracked}</div>
          <div className="text-gray-600 dark:text-gray-400">Days Tracked</div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="text-3xl font-bold text-orange-600 dark:text-orange-400 mb-1">{currentStreak}</div>
          <div className="text-gray-600 dark:text-gray-400">Current Streak</div>
        </div>
      </div>

      {/* Theme Settings */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Appearance</h2>
        
        <div className="flex gap-3">
          {themeOptions.map((option) => {
            const Icon = option.icon;
            const isActive = theme === option.value;
            
            return (
              <button
                key={option.value}
                onClick={() => setTheme(option.value as any)}
                className={`flex-1 flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all ${
                  isActive
                    ? 'border-blue-600 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/30'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <Icon size={24} className={isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'} />
                <span className={`text-sm font-medium ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'}`}>
                  {option.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Data & Privacy */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Data & Privacy</h2>
        
        <div className="space-y-3 text-gray-600 dark:text-gray-400 text-sm">
          <p>✓ Your data is securely stored and encrypted</p>
          <p>✓ Real-time sync across all your devices</p>
          <p>✓ Only you can access your habits and progress</p>
          <p>✓ Export your data anytime from the Insights page</p>
        </div>
      </div>
    </div>
  );
}
