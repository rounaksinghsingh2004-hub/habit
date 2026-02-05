// ============================================================================
// DATA CONTEXT PROVIDER
// ============================================================================
// Handles data operations for both guest and authenticated modes
// ============================================================================

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  ReactNode,
} from 'react';
import { supabase } from '../utils/supabase-client';
import { loadGuestData, saveGuestData, getGuestId } from '../utils/guest-storage';
import { getSession, getCurrentUser, onAuthStateChange, signOut as authSignOut } from '../utils/auth';
import type { Habit, DailyData, HabitWithStatus } from '../utils/supabase-schema';

// ============================================================================
// TYPES
// ============================================================================

interface DataContextValue {
  // Auth state
  isAuthenticated: boolean;
  isGuest: boolean;
  userId: string | null;
  guestId: string;
  
  // Data
  habits: HabitWithStatus[];
  dailyData: Record<string, DailyData>;
  currentStreak: number;
  selectedYear: number;
  availableYears: number[];
  
  // Loading states
  isLoading: boolean;
  isSaving: boolean;
  isSyncing: boolean;
  
  // Actions
  addHabit: (habit: Omit<Habit, 'id' | 'user_id' | 'year_id' | 'created_at'>) => Promise<void>;
  updateHabit: (habitId: string, updates: Partial<Habit>) => Promise<void>;
  deleteHabit: (habitId: string) => Promise<void>;
  toggleHabit: (habitId: string, date?: string) => Promise<void>;
  updateMood: (date: string, mood: number) => Promise<void>;
  updateReflection: (date: string, reflection: string) => Promise<void>;
  selectYear: (year: number) => void;
  migrateGuestData: () => Promise<boolean>;
  refreshData: () => Promise<void>;
  signOut: () => Promise<void>;
}

const DataContext = createContext<DataContextValue | null>(null);

// ============================================================================
// PROVIDER PROPS
// ============================================================================

interface DataProviderProps {
  children: ReactNode;
}

// ============================================================================
// GUEST HABIT TYPE
// ============================================================================

interface GuestHabit {
  id: string;
  name: string;
  category: string;
  priority: number;
  is_archived: boolean;
  created_at: string;
  completed_dates: string[];
  streak: number;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

function getTodayDate(): string {
  return new Date().toISOString().split('T')[0];
}

function calculateHabitStreak(completedDates: string[]): number {
  if (!completedDates || completedDates.length === 0) {
    return 0;
  }
  
  const sorted = [...completedDates].sort().reverse();
  const today = getTodayDate();
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  
  const lastCompleted = sorted[0];
  if (lastCompleted !== today && lastCompleted !== yesterday) {
    return 0;
  }
  
  let streak = 0;
  let checkDate = lastCompleted === today ? new Date(today) : new Date(yesterday);
  
  while (true) {
    const dateStr = checkDate.toISOString().split('T')[0];
    if (sorted.includes(dateStr)) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else if (dateStr === today) {
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }
  
  return streak;
}

function calculateOverallStreak(
  dailyData: Record<string, DailyData>,
  habits: HabitWithStatus[]
): number {
  const dates = Object.keys(dailyData).sort().reverse();
  
  if (dates.length === 0) {
    return 0;
  }
  
  const today = getTodayDate();
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  
  const latestDate = dates[0];
  if (latestDate !== today && latestDate !== yesterday) {
    return 0;
  }
  
  let streak = 0;
  let checkDate = new Date(latestDate);
  const todayDate = new Date(today);
  
  while (checkDate <= todayDate) {
    const dateStr = checkDate.toISOString().split('T')[0];
    const dayData = dailyData[dateStr];
    const requiredHabits = habits.filter((h) => !h.is_archived).length || 1;
    const completionThreshold = Math.max(1, Math.floor(requiredHabits * 0.7));
    
    if (dayData && dayData.completed_habits.length >= completionThreshold) {
      streak++;
    } else if (dateStr === today) {
      checkDate.setDate(checkDate.getDate() + 1);
      continue;
    } else {
      break;
    }
    
    checkDate.setDate(checkDate.getDate() - 1);
  }
  
  return streak;
}

function habitToWithStatus(habit: Habit | GuestHabit, dailyData: Record<string, DailyData>): HabitWithStatus {
  const today = getTodayDate();
  const completedDates = Object.keys(dailyData).filter(
    (date) => dailyData[date]?.completed_habits?.includes(habit.id)
  );
  
  const h = habit as any;
  return {
    id: h.id,
    user_id: h.user_id || '',
    year_id: h.year_id || '',
    name: h.name,
    description: h.description,
    category: h.category as Habit['category'],
    frequency: h.frequency as Habit['frequency'],
    target_days: h.target_days,
    time_hint: h.time_hint,
    color: h.color,
    icon: h.icon,
    priority: h.priority,
    is_archived: h.is_archived,
    sort_order: h.sort_order,
    created_at: h.created_at,
    updated_at: h.updated_at,
    completed_today: dailyData[today]?.completed_habits?.includes(habit.id) || false,
    current_streak: calculateHabitStreak(completedDates),
    longest_streak: h.streak || 0,
    total_completions: completedDates.length,
    completed_dates: completedDates,
  };
}

// ============================================================================
// DATA PROVIDER
// ============================================================================

export function DataProvider({ children }: DataProviderProps) {
  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [guestId] = useState(getGuestId());
  
  // Data state
  const [habits, setHabits] = useState<HabitWithStatus[]>([]);
  const [dailyData, setDailyData] = useState<Record<string, DailyData>>({});
  const [currentStreak, setCurrentStreak] = useState(0);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [availableYears, setAvailableYears] = useState<number[]>([
    new Date().getFullYear(),
  ]);
  
  // Loading states
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  
  // Refs
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isGuestModeRef = useRef(false);
  
  // =========================================================================
  // LOAD DATA
  // =========================================================================
  
  const loadData = useCallback(async () => {
    setIsLoading(true);
    
    try {
      // Check session first
      const session = await getSession();
      
      if (session.accessToken) {
        // Authenticated mode
        isGuestModeRef.current = false;
        setIsAuthenticated(true);
        setUserId(session.userId);
        await loadAuthenticatedData(session.accessToken);
      } else {
        // Guest mode
        isGuestModeRef.current = true;
        setIsAuthenticated(false);
        setUserId(null);
        loadGuestModeData();
      }
    } catch {
      // Fall back to guest mode
      isGuestModeRef.current = true;
      loadGuestModeData();
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  const loadAuthenticatedData = async (accessToken: string) => {
    try {
      const response = await fetch('/api/load-data', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        const habitsWithStatus = (data.habits || []).map((h: Habit) =>
          habitToWithStatus(h, data.dailyData || {})
        );
        
        setHabits(habitsWithStatus);
        setDailyData(data.dailyData || {});
        setCurrentStreak(data.currentStreak || 0);
        
        if (data.availableYears) {
          setAvailableYears(data.availableYears);
        }
        
        if (data.selectedYear) {
          setSelectedYear(data.selectedYear);
        }
      }
    } catch (error) {
      console.error('Failed to load authenticated data:', error);
    }
  };
  
  const loadGuestModeData = () => {
    const guestData = loadGuestData();
    
    if (guestData) {
      const habitsWithStatus = guestData.habits.map((h: GuestHabit) =>
        habitToWithStatus(h, guestData.dailyData)
      );
      
      setHabits(habitsWithStatus);
      setDailyData(guestData.dailyData);
      setCurrentStreak(guestData.currentStreak);
    }
  };
  
  // =========================================================================
  // SAVE DATA
  // =========================================================================
  
  const saveData = useCallback(async () => {
    if (isGuestModeRef.current) {
      // Save to localStorage
      const guestHabits = habits.map((h) => ({
        id: h.id,
        name: h.name,
        category: h.category,
        priority: h.priority,
        is_archived: h.is_archived,
        created_at: h.created_at,
        completed_dates: (h as any).completed_dates || [],
        streak: h.current_streak,
      }));
      
      saveGuestData(guestHabits as any, dailyData, currentStreak);
    } else if (userId) {
      // Save to server
      setIsSyncing(true);
      try {
        const session = await getSession();
        if (session.accessToken) {
          await fetch('/api/save-data', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${session.accessToken}`,
            },
            body: JSON.stringify({
              habits: habits.map((h) => ({
                id: h.id,
                name: h.name,
                category: h.category,
                priority: h.priority,
                is_archived: h.is_archived,
                created_at: h.created_at,
              })),
              dailyData,
              currentStreak,
            }),
          });
        }
      } catch (error) {
        console.error('Failed to save data:', error);
      } finally {
        setIsSyncing(false);
      }
    }
  }, [habits, dailyData, currentStreak, userId]);
  
  // =========================================================================
  // AUTOSAVE
  // =========================================================================
  
  useEffect(() => {
    if (isLoading) return;
    
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    saveTimeoutRef.current = setTimeout(() => {
      saveData();
    }, 1000);
    
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [habits, dailyData, currentStreak, isLoading, saveData]);
  
  // =========================================================================
  // INITIAL LOAD & AUTH LISTENER
  // =========================================================================
  
  useEffect(() => {
    loadData();
    
    const unsubscribe = onAuthStateChange(async (state) => {
      if (state.isAuthenticated && !isGuestModeRef.current) {
        // Already authenticated
        setUserId(state.userId);
      } else if (!state.isAuthenticated && isGuestModeRef.current) {
        // Still guest mode
      } else {
        // Auth state changed, reload data
        loadData();
      }
    });
    
    return () => {
      unsubscribe();
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [loadData]);
  
  // =========================================================================
  // REAL-TIME SUBSCRIPTIONS (Authenticated mode only)
  // =========================================================================
  
  useEffect(() => {
    if (!isAuthenticated || !userId) return;
    
    const habitsChannel = supabase
      .channel('habits-changes')
      .on(
        'postgres_changes' as any,
        {
          event: '*',
          schema: 'public',
          table: 'habits',
          filter: `user_id=eq.${userId}`,
        },
        () => {
          loadData();
        }
      )
      .subscribe();
    
    const completionsChannel = supabase
      .channel('completions-changes')
      .on(
        'postgres_changes' as any,
        {
          event: '*',
          schema: 'public',
          table: 'habit_completions',
          filter: `user_id=eq.${userId}`,
        },
        () => {
          loadData();
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(habitsChannel);
      supabase.removeChannel(completionsChannel);
    };
  }, [isAuthenticated, userId, loadData]);
  
  // =========================================================================
  // ACTIONS
  // =========================================================================
  
  const addHabit = async (
    habitData: Omit<Habit, 'id' | 'user_id' | 'year_id' | 'created_at'>
  ) => {
    const newHabit: HabitWithStatus = {
      ...habitData,
      id: generateId(),
      user_id: userId || '',
      year_id: '',
      created_at: new Date().toISOString(),
      completed_today: false,
      current_streak: 0,
      longest_streak: 0,
      total_completions: 0,
      completed_dates: [],
    };
    
    setHabits((prev) => [...prev, newHabit]);
  };
  
  const updateHabit = async (habitId: string, updates: Partial<Habit>) => {
    setHabits((prev) =>
      prev.map((h) => {
        if (h.id !== habitId) return h;
        
        // Check edit restrictions for past habits
        const habitCreatedDate = new Date(h.created_at).toISOString().split('T')[0];
        const today = getTodayDate();
        
        if (habitCreatedDate < today && !isGuestModeRef.current) {
          console.warn('Cannot edit habits created in the past');
          return h;
        }
        
        return { ...h, ...updates };
      })
    );
  };
  
  const deleteHabit = async (habitId: string) => {
    const habit = habits.find((h) => h.id === habitId);
    
    if (habit) {
      const habitCreatedDate = new Date(habit.created_at).toISOString().split('T')[0];
      const today = getTodayDate();
      
      if (habitCreatedDate < today && !isGuestModeRef.current) {
        console.warn('Cannot delete habits created in the past');
        return;
      }
    }
    
    setHabits((prev) => prev.filter((h) => h.id !== habitId));
    
    // Remove from daily data
    setDailyData((prev) => {
      const updated = { ...prev };
      Object.keys(updated).forEach((dateKey) => {
        updated[dateKey] = {
          ...updated[dateKey],
          completed_habits: updated[dateKey].completed_habits.filter(
            (id: string) => id !== habitId
          ),
        };
      });
      return updated;
    });
  };
  
  const toggleHabit = async (habitId: string, date?: string) => {
    const targetDate = date || getTodayDate();
    const todayData = dailyData[targetDate] || {
      completed_habits: [],
      mood: null,
      reflection: '',
    };
    
    const isCompleted = todayData.completed_habits.includes(habitId);
    const newCompletedHabits = isCompleted
      ? todayData.completed_habits.filter((id: string) => id !== habitId)
      : [...todayData.completed_habits, habitId];
    
    // Update daily data
    setDailyData((prev) => ({
      ...prev,
      [targetDate]: {
        ...todayData,
        completed_habits: newCompletedHabits,
      },
    }));
    
    // Update habit status
    setHabits((prev) =>
      prev.map((h) => {
        if (h.id !== habitId) return h;
        
        const currentDates = (h as any).completed_dates || [];
        const completedDates = isCompleted
          ? currentDates.filter((d: string) => d !== targetDate)
          : [...new Set([...currentDates, targetDate])];
        
        return {
          ...h,
          completed_today: targetDate === getTodayDate() ? !isCompleted : h.completed_today,
          completed_dates: completedDates,
          current_streak: calculateHabitStreak(completedDates),
        };
      })
    );
    
    // Recalculate overall streak
    setTimeout(() => {
      setCurrentStreak((streak) =>
        calculateOverallStreak(
          dailyData,
          habits.map((h) =>
            h.id === habitId
              ? {
                  ...h,
                  completed_dates: isCompleted
                    ? ((h as any).completed_dates || []).filter((d: string) => d !== targetDate)
                    : [...new Set([...((h as any).completed_dates || []), targetDate])],
                }
              : h
          )
        )
      );
    }, 0);
  };
  
  const updateMood = async (date: string, mood: number) => {
    setDailyData((prev) => ({
      ...prev,
      [date]: {
        ...prev[date],
        mood,
      },
    }));
  };
  
  const updateReflection = async (date: string, reflection: string) => {
    setDailyData((prev) => ({
      ...prev,
      [date]: {
        ...prev[date],
        reflection,
      },
    }));
  };
  
  const selectYear = (year: number) => {
    setSelectedYear(year);
    loadData();
  };
  
  const migrateGuestData = async (): Promise<boolean> => {
    if (isAuthenticated || !userId) return false;
    
    try {
      const session = await getSession();
      if (!session.accessToken) return false;
      
      const response = await fetch('/api/migrate-guest-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.accessToken}`,
        },
        body: JSON.stringify({
          habits: habits.map((h) => ({
            name: h.name,
            category: h.category,
            priority: h.priority,
            is_archived: h.is_archived,
            created_at: h.created_at,
            completed_dates: (h as any).completed_dates,
          })),
          dailyData,
          currentStreak,
        }),
      });
      
      return response.ok;
    } catch (error) {
      console.error('Migration failed:', error);
      return false;
    }
  };
  
  const refreshData = async () => {
    await loadData();
  };
  
  const signOut = async () => {
    await authSignOut();
    isGuestModeRef.current = true;
    setIsAuthenticated(false);
    setUserId(null);
    setHabits([]);
    setDailyData({});
    setCurrentStreak(0);
  };
  
  // =========================================================================
  // VALUE
  // =========================================================================
  
  const value: DataContextValue = {
    isAuthenticated,
    isGuest: !isAuthenticated,
    userId,
    guestId,
    habits,
    dailyData,
    currentStreak,
    selectedYear,
    availableYears,
    isLoading,
    isSaving,
    isSyncing,
    addHabit,
    updateHabit,
    deleteHabit,
    toggleHabit,
    updateMood,
    updateReflection,
    selectYear,
    migrateGuestData,
    refreshData,
    signOut,
  };
  
  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

// ============================================================================
// HOOK
// ============================================================================

export function useData(): DataContextValue {
  const context = useContext(DataContext);
  
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  
  return context;
}

// ============================================================================
// EXPORT
// ============================================================================

export { DataContext };
