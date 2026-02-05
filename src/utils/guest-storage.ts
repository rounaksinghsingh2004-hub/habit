// ============================================================================
// GUEST MODE STORAGE UTILITY
// ============================================================================
// Handles localStorage operations for non-logged-in users
// ============================================================================

import type { Habit, DailyData } from './supabase-schema';

// ============================================================================
// CONSTANTS
// ============================================================================

const GUEST_DATA_KEY = 'habit_dashboard_guest_data';
const GUEST_ID_KEY = 'habit_dashboard_guest_id';
const GUEST_MIGRATION_FLAG = 'habit_dashboard_migrated';

// ============================================================================
// GUEST DATA TYPES (extends base types with computed fields)
// ============================================================================

interface GuestHabit {
  id: string;
  user_id?: string;
  year_id?: string;
  name: string;
  description?: string;
  category: string;
  frequency?: string;
  target_days?: number[];
  time_hint?: string;
  color?: string;
  icon?: string;
  priority: number;
  is_archived: boolean;
  sort_order?: number;
  created_at: string;
  updated_at?: string;
  completed_dates: string[];
  streak: number;
}

interface GuestDataInternal {
  habits: GuestHabit[];
  dailyData: Record<string, DailyData>;
  currentStreak: number;
  lastSyncAt?: string;
  guestId: string;
  createdAt: string;
  migratedToAuth?: boolean;
}

// ============================================================================
// GUEST ID MANAGEMENT
// ============================================================================

export function getGuestId(): string {
  if (typeof window === 'undefined') {
    return '';
  }
  
  let guestId = localStorage.getItem(GUEST_ID_KEY);
  
  if (!guestId) {
    guestId = `guest_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    localStorage.setItem(GUEST_ID_KEY, guestId);
  }
  
  return guestId;
}

export function isGuestSession(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }
  
  const supabaseAuth = localStorage.getItem('sb-access-token');
  return !supabaseAuth;
}

// ============================================================================
// DATA STORAGE
// ============================================================================

export function saveGuestData(
  habits: GuestHabit[],
  dailyData: Record<string, DailyData>,
  currentStreak: number
): boolean {
  if (typeof window === 'undefined') {
    return false;
  }
  
  try {
    const guestData: GuestDataInternal = {
      habits,
      dailyData,
      currentStreak,
      lastSyncAt: new Date().toISOString(),
      guestId: getGuestId(),
      createdAt: getGuestCreatedAt(),
    };
    
    localStorage.setItem(GUEST_DATA_KEY, JSON.stringify(guestData));
    return true;
  } catch (error) {
    console.error('Failed to save guest data:', error);
    return false;
  }
}

export function loadGuestData(): GuestDataInternal | null {
  if (typeof window === 'undefined') {
    return null;
  }
  
  try {
    const data = localStorage.getItem(GUEST_DATA_KEY);
    
    if (!data) {
      return null;
    }
    
    const parsed = JSON.parse(data) as GuestDataInternal;
    
    if (!parsed.habits || !Array.isArray(parsed.habits)) {
      return null;
    }
    
    if (!parsed.guestId) {
      parsed.guestId = getGuestId();
    }
    
    if (!parsed.createdAt) {
      parsed.createdAt = new Date().toISOString();
    }
    
    return parsed;
  } catch (error) {
    console.error('Failed to load guest data:', error);
    return null;
  }
}

function getGuestCreatedAt(): string {
  const existingData = loadGuestData();
  if (existingData?.createdAt) {
    return existingData.createdAt;
  }
  return new Date().toISOString();
}

export function clearGuestData(): void {
  if (typeof window === 'undefined') {
    return;
  }
  localStorage.removeItem(GUEST_DATA_KEY);
}

export function clearAllGuestData(): void {
  if (typeof window === 'undefined') {
    return;
  }
  localStorage.removeItem(GUEST_DATA_KEY);
  localStorage.removeItem(GUEST_ID_KEY);
  localStorage.removeItem(GUEST_MIGRATION_FLAG);
}

// ============================================================================
// MIGRATION FLAG
// ============================================================================

export function hasMigratedToAuth(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }
  return localStorage.getItem(GUEST_MIGRATION_FLAG) === 'true';
}

export function setMigratedToAuth(): void {
  if (typeof window === 'undefined') {
    return;
  }
  localStorage.setItem(GUEST_MIGRATION_FLAG, 'true');
}

export function getMigrationStatus(): {
  migrated: boolean;
  migratedAt?: string;
} {
  if (typeof window === 'undefined') {
    return { migrated: false };
  }
  
  const migrated = hasMigratedToAuth();
  const migratedAt = localStorage.getItem(`${GUEST_MIGRATION_FLAG}_at`) || undefined;
  
  return { migrated, migratedAt };
}

// ============================================================================
// HABIT OPERATIONS
// ============================================================================

export function addHabitToGuest(habit: Partial<GuestHabit>): boolean {
  const data = loadGuestData();
  
  if (!data) {
    return false;
  }
  
  const newHabit: GuestHabit = {
    id: Date.now().toString(),
    name: habit.name || '',
    category: habit.category || 'Lifestyle',
    priority: habit.priority || 0,
    is_archived: false,
    created_at: new Date().toISOString(),
    completed_dates: [],
    streak: 0,
    ...habit,
  };
  
  data.habits.push(newHabit);
  return saveGuestData(data.habits, data.dailyData, data.currentStreak);
}

export function updateHabitInGuest(
  habitId: string,
  updates: Partial<GuestHabit>
): boolean {
  const data = loadGuestData();
  
  if (!data) {
    return false;
  }
  
  const habitIndex = data.habits.findIndex((h) => h.id === habitId);
  
  if (habitIndex === -1) {
    return false;
  }
  
  const habit = data.habits[habitIndex];
  const habitCreatedDate = new Date(habit.created_at).toISOString().split('T')[0];
  const today = new Date().toISOString().split('T')[0];
  
  if (habitCreatedDate < today) {
    console.warn('Cannot edit habits created in the past');
    return false;
  }
  
  data.habits[habitIndex] = { ...habit, ...updates };
  return saveGuestData(data.habits, data.dailyData, data.currentStreak);
}

export function deleteHabitFromGuest(habitId: string): boolean {
  const data = loadGuestData();
  
  if (!data) {
    return false;
  }
  
  const habit = data.habits.find((h) => h.id === habitId);
  
  if (habit) {
    const habitCreatedDate = new Date(habit.created_at).toISOString().split('T')[0];
    const today = new Date().toISOString().split('T')[0];
    
    if (habitCreatedDate < today) {
      console.warn('Cannot delete habits created in the past');
      return false;
    }
  }
  
  data.habits = data.habits.filter((h) => h.id !== habitId);
  
  Object.keys(data.dailyData).forEach((dateKey) => {
    data.dailyData[dateKey].completed_habits = data.dailyData[dateKey].completed_habits.filter(
      (id) => id !== habitId
    );
  });
  
  return saveGuestData(data.habits, data.dailyData, data.currentStreak);
}

// ============================================================================
// COMPLETION OPERATIONS
// ============================================================================

export function toggleCompletionInGuest(
  habitId: string,
  date: string
): { completed: boolean; newStreak: number } {
  const data = loadGuestData();
  
  if (!data) {
    return { completed: false, newStreak: 0 };
  }
  
  const dateData = data.dailyData[date] || {
    completed_habits: [],
    mood: null,
    reflection: '',
  };
  
  const isCompleted = dateData.completed_habits.includes(habitId);
  
  if (isCompleted) {
    dateData.completed_habits = dateData.completed_habits.filter((id) => id !== habitId);
  } else {
    dateData.completed_habits.push(habitId);
  }
  
  data.dailyData[date] = dateData;
  
  const habitIndex = data.habits.findIndex((h) => h.id === habitId);
  
  if (habitIndex !== -1) {
    const habit = data.habits[habitIndex];
    const completedDates = habit.completed_dates || [];
    
    if (isCompleted) {
      habit.completed_dates = completedDates.filter((d) => d !== date);
    } else {
      habit.completed_dates = [...new Set([...completedDates, date])];
    }
    
    habit.streak = calculateStreak(habit.completed_dates);
  }
  
  data.currentStreak = calculateOverallStreak(data.dailyData);
  
  saveGuestData(data.habits, data.dailyData, data.currentStreak);
  
  return {
    completed: !isCompleted,
    newStreak: (data.habits[habitIndex]?.streak) || 0,
  };
}

function calculateStreak(completedDates: string[]): number {
  if (!completedDates || completedDates.length === 0) {
    return 0;
  }
  
  const sorted = [...completedDates].sort().reverse();
  const today = new Date().toISOString().split('T')[0];
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

function calculateOverallStreak(dailyData: Record<string, DailyData>): number {
  const dates = Object.keys(dailyData).sort().reverse();
  
  if (dates.length === 0) {
    return 0;
  }
  
  const today = new Date().toISOString().split('T')[0];
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
    
    if (dayData && dayData.completed_habits.length > 0) {
      streak++;
    } else if (dateStr === today) {
      continue;
    } else {
      break;
    }
    
    checkDate.setDate(checkDate.getDate() - 1);
  }
  
  return streak;
}

// ============================================================================
// MOOD & REFLECTION OPERATIONS
// ============================================================================

export function updateMoodInGuest(date: string, mood: number): boolean {
  const data = loadGuestData();
  
  if (!data) {
    return false;
  }
  
  const dateData = data.dailyData[date] || {
    completed_habits: [],
    mood: null,
    reflection: '',
  };
  
  dateData.mood = mood;
  data.dailyData[date] = dateData;
  
  return saveGuestData(data.habits, data.dailyData, data.currentStreak);
}

export function updateReflectionInGuest(date: string, reflection: string): boolean {
  const data = loadGuestData();
  
  if (!data) {
    return false;
  }
  
  const dateData = data.dailyData[date] || {
    completed_habits: [],
    mood: null,
    reflection: '',
  };
  
  dateData.reflection = reflection;
  data.dailyData[date] = dateData;
  
  return saveGuestData(data.habits, data.dailyData, data.currentStreak);
}

// ============================================================================
// EXPORT/IMPORT
// ============================================================================

export function exportGuestData(): string | null {
  const data = loadGuestData();
  
  if (!data) {
    return null;
  }
  
  return JSON.stringify(data, null, 2);
}

export function importGuestData(jsonString: string): boolean {
  if (typeof window === 'undefined') {
    return false;
  }
  
  try {
    const data = JSON.parse(jsonString) as GuestDataInternal;
    
    if (!data.habits || !Array.isArray(data.habits)) {
      throw new Error('Invalid data format');
    }
    
    return saveGuestData(data.habits, data.dailyData || {}, data.currentStreak || 0);
  } catch (error) {
    console.error('Failed to import guest data:', error);
    return false;
  }
}

export function getGuestDataSize(): number {
  if (typeof window === 'undefined') {
    return 0;
  }
  
  const data = localStorage.getItem(GUEST_DATA_KEY);
  return data ? new Blob([data]).size : 0;
}

export function checkStorageAvailability(): { available: boolean } {
  if (typeof window === 'undefined') {
    return { available: false };
  }
  
  try {
    const testKey = '__storage_test__';
    localStorage.setItem(testKey, testKey);
    localStorage.removeItem(testKey);
    return { available: true };
  } catch {
    return { available: false };
  }
}

// ============================================================================
// MIGRATION HELPERS
// ============================================================================

export function prepareMigrationData(): {
  habits: Habit[];
  dailyData: Record<string, DailyData>;
  currentStreak: number;
  guestId: string;
  createdAt: string;
} | null {
  const data = loadGuestData();
  
  if (!data) {
    return null;
  }
  
  const habits: Habit[] = data.habits.map((h) => ({
    id: h.id,
    user_id: '',
    year_id: '',
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
    sort_order: h.sort_order || 0,
    created_at: h.created_at,
    updated_at: h.updated_at,
  }));
  
  return {
    habits,
    dailyData: data.dailyData,
    currentStreak: data.currentStreak,
    guestId: data.guestId,
    createdAt: data.createdAt,
  };
}

export function finalizeMigration(): void {
  if (typeof window === 'undefined') {
    return;
  }
  localStorage.setItem(`${GUEST_MIGRATION_FLAG}_at`, new Date().toISOString());
}

// ============================================================================
// CLEANUP
// ============================================================================

export function cleanupOldData(): number {
  const data = loadGuestData();
  
  if (!data) {
    return 0;
  }
  
  const twoYearsAgo = new Date();
  twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);
  const cutoffDate = twoYearsAgo.toISOString().split('T')[0];
  
  let removedCount = 0;
  Object.keys(data.dailyData).forEach((dateKey) => {
    if (dateKey < cutoffDate) {
      delete data.dailyData[dateKey];
      removedCount++;
    }
  });
  
  if (removedCount > 0) {
    saveGuestData(data.habits, data.dailyData, data.currentStreak);
  }
  
  return removedCount;
}

// ============================================================================
// DEBUG
// ============================================================================

export function getDebugInfo(): {
  guestId: string;
  hasData: boolean;
  dataSize: number;
  habitCount: number;
  dailyDataCount: number;
  currentStreak: number;
  storageAvailable: boolean;
} {
  const data = loadGuestData();
  const guestId = getGuestId();
  const storageInfo = checkStorageAvailability();
  
  return {
    guestId,
    hasData: !!data,
    dataSize: getGuestDataSize(),
    habitCount: data?.habits.length || 0,
    dailyDataCount: data ? Object.keys(data.dailyData).length : 0,
    currentStreak: data?.currentStreak || 0,
    storageAvailable: storageInfo.available,
  };
}

export function resetGuestData(): void {
  clearAllGuestData();
}
