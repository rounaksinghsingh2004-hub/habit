// ============================================================================
// SUPABASE DATABASE TYPES
// ============================================================================
// These types match the database schema defined in supabase/schema.sql
// ============================================================================

// ============================================================================
// ENUMS (must match SQL definitions)
// ============================================================================

export type HabitCategory = 'Health' | 'Study' | 'Mental' | 'Lifestyle';
export type HabitFrequency = 'daily' | 'weekly' | 'monthly';

// ============================================================================
// BASE TYPES
// ============================================================================

export interface TimestampFields {
  created_at: string;
  updated_at?: string;
}

// ============================================================================
// PROFILES TABLE
// ============================================================================

export interface Profile extends TimestampFields {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  timezone?: string;
  preferred_year?: number;
}

// ============================================================================
// YEARS TABLE (Year-based habit organization)
// ============================================================================

export interface Year extends TimestampFields {
  id: string;
  user_id: string;
  year: number;
  is_active: boolean;
}

// ============================================================================
// HABITS TABLE
// ============================================================================

export interface Habit {
  id: string;
  user_id: string;
  year_id: string;
  name: string;
  description?: string;
  category: HabitCategory;
  frequency: HabitFrequency;
  target_days?: number[]; // Days of week (1=Monday, 7=Sunday)
  time_hint?: string;
  color?: string;
  icon?: string;
  priority: number; // 0=normal, 1=important, 2=very important
  is_archived: boolean;
  sort_order: number;
  created_at: string;
  updated_at?: string;
}

// ============================================================================
// HABIT COMPLETIONS TABLE
// ============================================================================

export interface HabitCompletion extends TimestampFields {
  id: string;
  habit_id: string;
  user_id: string;
  completion_date: string; // YYYY-MM-DD format
  notes?: string;
}

// ============================================================================
// DAILY MOODS TABLE
// ============================================================================

export interface DailyMood extends TimestampFields {
  id: string;
  user_id: string;
  mood_date: string; // YYYY-MM-DD format
  mood_score: number; // 1-5
  mood_note?: string;
}

// ============================================================================
// DAILY REFLECTIONS TABLE
// ============================================================================

export interface DailyReflection extends TimestampFields {
  id: string;
  user_id: string;
  reflection_date: string; // YYYY-MM-DD format
  reflection_text?: string;
  gratitude?: string[]; // Array of gratitude items
  goals?: string[]; // Array of daily goals
}

// ============================================================================
// HABIT STREAKS TABLE (Cached calculated streaks)
// ============================================================================

export interface HabitStreak extends TimestampFields {
  id: string;
  habit_id: string;
  user_id: string;
  current_streak: number;
  longest_streak: number;
  total_completions: number;
  last_completion_date?: string;
}

// ============================================================================
// USER STATS TABLE (Aggregated statistics)
// ============================================================================

export interface UserStats extends TimestampFields {
  id: string;
  user_id: string;
  year: number;
  total_habits: number;
  total_completions: number;
  current_overall_streak: number;
  longest_overall_streak: number;
  perfect_days: number;
  completion_rate: number;
}

// ============================================================================
// COMPOSED TYPES (Frontend-friendly structures)
// ============================================================================

export interface HabitWithStatus extends Omit<Habit, 'completed_dates'> {
  completed_today: boolean;
  current_streak: number;
  longest_streak: number;
  total_completions: number;
  completed_dates: string[];
}

export interface DailyData {
  completed_habits: string[];
  mood: number | null;
  mood_note?: string;
  reflection: string;
  gratitude?: string[];
  goals?: string[];
}

export interface DailySummary {
  date: string;
  completed_habits: number;
  total_habits: number;
  completion_rate: number;
  mood_score?: number;
  perfect_day: boolean;
}

export interface UserInsights {
  weeklyAverage: number;
  bestStreak: number;
  totalDaysTracked: number;
  completionRate: number;
  currentStreak: number;
  perfectDays: number;
  categoryBreakdown: Record<HabitCategory, number>;
}

// ============================================================================
// DATABASE VIEW TYPES
// ============================================================================

export interface HabitDashboardRow {
  habit_id: string;
  user_id: string;
  habit_name: string;
  category: HabitCategory;
  time_hint?: string;
  color?: string;
  priority: number;
  created_at: string;
  current_streak: number;
  longest_streak: number;
  total_completions: number;
  completed_today: boolean;
}

export interface DailySummaryRow {
  user_id: string;
  date: string;
  completed_habits: number;
  total_habits: number;
  mood_score?: number;
  reflection_text?: string;
  completion_rate: number;
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface LoadDataResponse {
  habits: HabitWithStatus[];
  dailyData: Record<string, DailyData>;
  currentStreak: number;
  userStats?: UserStats;
  year?: Year;
  success: boolean;
  error?: string;
}

export interface SaveDataResponse {
  success: boolean;
  error?: string;
  savedAt?: string;
}

// ============================================================================
// AUTH TYPES
// ============================================================================

export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  created_at?: string;
}

export interface AuthSession {
  access_token: string;
  refresh_token?: string;
  user: AuthUser;
  expires_at?: number;
}

// ============================================================================
// GUEST MODE TYPES
// ============================================================================

export interface GuestData {
  habits: Habit[];
  dailyData: Record<string, DailyData>;
  currentStreak: number;
  lastSyncAt?: string;
  guestId: string;
  createdAt: string;
  migratedToAuth?: boolean;
}

export interface GuestMigrationResult {
  success: boolean;
  error?: string;
  migratedHabits?: number;
  migratedCompletions?: number;
}

// ============================================================================
// REAL-TIME EVENT TYPES
// ============================================================================

export type RealtimeEventType = 'INSERT' | 'UPDATE' | 'DELETE';

export interface RealtimePayload<T> {
  new?: T;
  old?: T;
  eventType: RealtimeEventType;
}

export interface HabitRealtimeEvent {
  table: 'habits';
  payload: RealtimePayload<Habit>;
}

export interface CompletionRealtimeEvent {
  table: 'habit_completions';
  payload: RealtimePayload<HabitCompletion>;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

export type DateString = string; // YYYY-MM-DD format

export interface DateRange {
  start: DateString;
  end: DateString;
}

export type SortDirection = 'asc' | 'desc';

export interface SortConfig {
  field: string;
  direction: SortDirection;
}

export interface PaginationConfig {
  page: number;
  limit: number;
}

export interface FilterConfig {
  category?: HabitCategory;
  archived?: boolean;
  priority?: number;
  search?: string;
}

// ============================================================================
// EXPORTS - All types are already exported via 'export interface' and 'export type' statements
// ============================================================================
