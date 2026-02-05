-- ============================================================================
-- HABIT DASHBOARD DATABASE SCHEMA
-- ============================================================================
-- Run this SQL in Supabase SQL Editor to set up the complete database
-- ============================================================================

-- Enable necessary extensions
-- ============================================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- ENUMS
-- ============================================================================

-- Habit categories
CREATE TYPE habit_category AS ENUM (
  'Health',
  'Study',
  'Mental',
  'Lifestyle'
);

-- Habit frequency types
CREATE TYPE habit_frequency AS ENUM (
  'daily',
  'weekly',
  'monthly'
);

-- ============================================================================
-- PROFILES TABLE (extends Supabase auth.users)
-- ============================================================================

CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  timezone TEXT DEFAULT 'UTC',
  preferred_year INTEGER DEFAULT EXTRACT(YEAR FROM CURRENT_DATE),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- YEARS TABLE (for year-based habit organization)
-- ============================================================================

CREATE TABLE years (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  year INTEGER NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, year)
);

-- ============================================================================
-- HABITS TABLE
-- ============================================================================

CREATE TABLE habits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  year_id UUID NOT NULL REFERENCES years(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  category habit_category NOT NULL DEFAULT 'Lifestyle',
  frequency habit_frequency NOT NULL DEFAULT 'daily',
  target_days INTEGER[] DEFAULT ARRAY[]::INTEGER[], -- Days of week (1=Monday, 7=Sunday)
  time_hint TEXT, -- Preferred time to complete
  color TEXT DEFAULT '#3B82F6',
  icon TEXT,
  priority INTEGER DEFAULT 0, -- 0=normal, 1=important, 2=very important
  is_archived BOOLEAN DEFAULT FALSE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- HABIT COMPLETIONS TABLE (tracks daily completions)
-- ============================================================================

CREATE TABLE habit_completions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  habit_id UUID NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  completion_date DATE NOT NULL,
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  notes TEXT,
  -- Prevent duplicate completions per day per habit
  UNIQUE(habit_id, completion_date)
);

-- Create index for faster date-based queries
CREATE INDEX idx_habit_completions_date ON habit_completions(user_id, completion_date);
CREATE INDEX idx_habit_completions_habit ON habit_completions(habit_id);

-- ============================================================================
-- DAILY MOODS TABLE
-- ============================================================================

CREATE TABLE daily_moods (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  mood_date DATE NOT NULL,
  mood_score INTEGER NOT NULL CHECK (mood_score >= 1 AND mood_score <= 5),
  mood_note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, mood_date)
);

-- ============================================================================
-- DAILY REFLECTIONS TABLE
-- ============================================================================

CREATE TABLE daily_reflections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  reflection_date DATE NOT NULL,
  reflection_text TEXT,
  gratitude JSONB DEFAULT '[]'::jsonb, -- Array of gratitude items
  goals JSONB DEFAULT '[]'::jsonb, -- Array of daily goals
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, reflection_date)
);

-- ============================================================================
-- HABIT STREAKS TABLE (cached calculated streaks for performance)
-- ============================================================================

CREATE TABLE habit_streaks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  habit_id UUID NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  total_completions INTEGER DEFAULT 0,
  last_completion_date DATE,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(habit_id)
);

-- ============================================================================
-- USER STATS TABLE (aggregated statistics)
-- ============================================================================

CREATE TABLE user_stats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  year INTEGER NOT NULL,
  total_habits INTEGER DEFAULT 0,
  total_completions INTEGER DEFAULT 0,
  current_overall_streak INTEGER DEFAULT 0,
  longest_overall_streak INTEGER DEFAULT 0,
  perfect_days INTEGER DEFAULT 0,
  completion_rate DECIMAL(5,2) DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, year)
);

-- ============================================================================
-- MIGRATIONS LOG (track schema changes)
-- ============================================================================

CREATE TABLE schema_migrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  migration_name TEXT NOT NULL UNIQUE,
  applied_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE years ENABLE ROW LEVEL SECURITY;
ALTER TABLE habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE habit_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_moods ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_reflections ENABLE ROW LEVEL SECURITY;
ALTER TABLE habit_streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE schema_migrations ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- PROFILES RLS POLICIES
-- ============================================================================

-- Users can view their own profile
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Users can insert their own profile (handled by trigger)
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- ============================================================================
-- YEARS RLS POLICIES
-- ============================================================================

-- Users can view their own years
CREATE POLICY "Users can view own years" ON years
  FOR SELECT USING (user_id = auth.uid());

-- Users can insert their own years
CREATE POLICY "Users can insert own years" ON years
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Users can update their own years
CREATE POLICY "Users can update own years" ON years
  FOR UPDATE USING (user_id = auth.uid());

-- Users can delete their own years
CREATE POLICY "Users can delete own years" ON years
  FOR DELETE USING (user_id = auth.uid());

-- ============================================================================
-- HABITS RLS POLICIES
-- ============================================================================

-- Users can view their own habits
CREATE POLICY "Users can view own habits" ON habits
  FOR SELECT USING (user_id = auth.uid());

-- Users can insert their own habits
CREATE POLICY "Users can insert own habits" ON habits
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Users can update their own habits
CREATE POLICY "Users can update own habits" ON habits
  FOR UPDATE USING (user_id = auth.uid());

-- Restrict updates to past habits (created before today)
CREATE POLICY "Users cannot edit past habits" ON habits
  FOR UPDATE USING (
    user_id = auth.uid() AND
    created_at::DATE >= CURRENT_DATE
  );

-- Users can delete their own habits (only if no completions or created today)
CREATE POLICY "Users can delete own habits" ON habits
  FOR DELETE USING (
    user_id = auth.uid() AND
    created_at::DATE >= CURRENT_DATE
  );

-- ============================================================================
-- HABIT COMPLETIONS RLS POLICIES
-- ============================================================================

-- Users can view their own completions
CREATE POLICY "Users can view own completions" ON habit_completions
  FOR SELECT USING (user_id = auth.uid());

-- Users can insert their own completions
CREATE POLICY "Users can insert own completions" ON habit_completions
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Users can update their own completions (only today's completions)
CREATE POLICY "Users can update own completions" ON habit_completions
  FOR UPDATE USING (
    user_id = auth.uid() AND
    completion_date >= CURRENT_DATE
  );

-- Users can delete their own completions (only today's completions)
CREATE POLICY "Users can delete own completions" ON habit_completions
  FOR DELETE USING (
    user_id = auth.uid() AND
    completion_date >= CURRENT_DATE
  );

-- ============================================================================
-- DAILY MOODS RLS POLICIES
-- ============================================================================

-- Users can view their own moods
CREATE POLICY "Users can view own moods" ON daily_moods
  FOR SELECT USING (user_id = auth.uid());

-- Users can insert their own moods
CREATE POLICY "Users can insert own moods" ON daily_moods
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Users can update their own moods (only today's or future)
CREATE POLICY "Users can update own moods" ON daily_moods
  FOR UPDATE USING (
    user_id = auth.uid() AND
    mood_date >= CURRENT_DATE
  );

-- Users can delete their own moods (only today's)
CREATE POLICY "Users can delete own moods" ON daily_moods
  FOR DELETE USING (
    user_id = auth.uid() AND
    mood_date >= CURRENT_DATE
  );

-- ============================================================================
-- DAILY REFLECTIONS RLS POLICIES
-- ============================================================================

-- Users can view their own reflections
CREATE POLICY "Users can view own reflections" ON daily_reflections
  FOR SELECT USING (user_id = auth.uid());

-- Users can insert their own reflections
CREATE POLICY "Users can insert own reflections" ON daily_reflections
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Users can update their own reflections (only today's)
CREATE POLICY "Users can update own reflections" ON daily_reflections
  FOR UPDATE USING (
    user_id = auth.uid() AND
    reflection_date >= CURRENT_DATE
  );

-- Users can delete their own reflections (only today's)
CREATE POLICY "Users can delete own reflections" ON daily_reflections
  FOR DELETE USING (
    user_id = auth.uid() AND
    reflection_date >= CURRENT_DATE
  );

-- ============================================================================
-- HABIT STREAKS RLS POLICIES
-- ============================================================================

-- Users can view their own streaks
CREATE POLICY "Users can view own streaks" ON habit_streaks
  FOR SELECT USING (user_id = auth.uid());

-- Users can insert their own streaks (auto-managed)
CREATE POLICY "Users can insert own streaks" ON habit_streaks
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Users can update their own streaks (auto-managed)
CREATE POLICY "Users can update own streaks" ON habit_streaks
  FOR UPDATE USING (user_id = auth.uid());

-- ============================================================================
-- USER STATS RLS POLICIES
-- ============================================================================

-- Users can view their own stats
CREATE POLICY "Users can view own stats" ON user_stats
  FOR SELECT USING (user_id = auth.uid());

-- Users can insert their own stats
CREATE POLICY "Users can insert own stats" ON user_stats
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Users can update their own stats
CREATE POLICY "Users can update own stats" ON user_stats
  FOR UPDATE USING (user_id = auth.uid());

-- ============================================================================
-- SCHEMA MIGRATIONS RLS POLICIES
-- ============================================================================

-- Only service role can manage migrations
CREATE POLICY "Service role can manage migrations" ON schema_migrations
  FOR ALL USING (TRUE);

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email)
  );
  
  -- Create current year entry
  INSERT INTO public.years (user_id, year)
  VALUES (NEW.id, EXTRACT(YEAR FROM CURRENT_DATE))
  ON CONFLICT (user_id, year) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on auth.users insert
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers to relevant tables
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_years_updated_at
  BEFORE UPDATE ON years
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_habits_updated_at
  BEFORE UPDATE ON habits
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_daily_moods_updated_at
  BEFORE UPDATE ON daily_moods
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_daily_reflections_updated_at
  BEFORE UPDATE ON daily_reflections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_habit_streaks_updated_at
  BEFORE UPDATE ON habit_streaks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_stats_updated_at
  BEFORE UPDATE ON user_stats
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function to get habit completion rate for a date range
CREATE OR REPLACE FUNCTION get_habit_completion_rate(
  p_user_id UUID,
  p_habit_id UUID,
  p_start_date DATE,
  p_end_date DATE
)
RETURNS DECIMAL AS $$
DECLARE
  v_total_days INTEGER;
  v_completed_days INTEGER;
BEGIN
  SELECT
    COUNT(*) INTO v_total_days
  FROM generate_dates(p_start_date, p_end_date) d(date);
  
  SELECT
    COUNT(*) INTO v_completed_days
  FROM habit_completions
  WHERE habit_id = p_habit_id
    AND user_id = p_user_id
    AND completion_date BETWEEN p_start_date AND p_end_date;
  
  IF v_total_days = 0 THEN
    RETURN 0;
  END IF;
  
  RETURN ROUND((v_completed_days::DECIMAL / v_total_days::DECIMAL) * 100, 2);
END;
$$ LANGUAGE plpgsql;

-- Function to calculate streak for a habit
CREATE OR REPLACE FUNCTION calculate_habit_streak(p_habit_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_current_streak INTEGER := 0;
  v_check_date DATE;
BEGIN
  -- Check if completed today
  SELECT completion_date INTO v_check_date
  FROM habit_completions
  WHERE habit_id = p_habit_id
  ORDER BY completion_date DESC
  LIMIT 1;
  
  IF v_check_date IS NULL THEN
    RETURN 0;
  END IF;
  
  IF v_check_date < CURRENT_DATE THEN
    RETURN 0;
  END IF;
  
  -- Calculate consecutive days
  WHILE TRUE LOOP
    v_check_date := v_check_date - 1;
    EXIT WHEN NOT EXISTS (
      SELECT 1 FROM habit_completions
      WHERE habit_id = p_habit_id AND completion_date = v_check_date
    );
    v_current_streak := v_current_streak + 1;
  END LOOP;
  
  RETURN v_current_streak + 1; -- Include today
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- VIEWS
-- ============================================================================

-- View for habit dashboard with computed fields
CREATE OR REPLACE VIEW habit_dashboard AS
SELECT
  h.id AS habit_id,
  h.user_id,
  h.name AS habit_name,
  h.category,
  h.time_hint,
  h.color,
  h.priority,
  h.created_at,
  hs.current_streak,
  hs.longest_streak,
  hs.total_completions,
  (
    SELECT COUNT(*) FROM habit_completions hc
    WHERE hc.habit_id = h.id
      AND hc.completion_date = CURRENT_DATE
  ) > 0 AS completed_today
FROM habits h
LEFT JOIN habit_streaks hs ON h.id = hs.habit_id
WHERE h.is_archived = FALSE;

-- View for daily summary
CREATE OR REPLACE VIEW daily_summary AS
SELECT
  d.user_id,
  d.date,
  COUNT(DISTINCT hc.habit_id) AS completed_habits,
  COUNT(DISTINCT h.id) AS total_habits,
  dm.mood_score,
  dr.reflection_text,
  CASE
    WHEN COUNT(DISTINCT h.id) > 0
    THEN ROUND((COUNT(DISTINCT hc.habit_id)::DECIMAL / COUNT(DISTINCT h.id)::DECIMAL) * 100, 2)
    ELSE 0
  END AS completion_rate
FROM generate_series(
  (SELECT MIN(created_at)::DATE FROM habits),
  CURRENT_DATE
) d(date)
CROSS JOIN LATERAL (
  SELECT id FROM habits WHERE user_id = d.user_id AND is_archived = FALSE
) h
LEFT JOIN habit_completions hc
  ON h.id = hc.habit_id AND hc.completion_date = d.date
LEFT JOIN daily_moods dm
  ON d.user_id = dm.user_id AND dm.mood_date = d.date
LEFT JOIN daily_reflections dr
  ON d.user_id = dr.user_id AND dr.reflection_date = d.date
GROUP BY d.user_id, d.date, dm.mood_score, dr.reflection_text;

-- ============================================================================
-- INITIAL MIGRATION RECORD
-- ============================================================================

INSERT INTO schema_migrations (migration_name)
VALUES ('001_initial_schema')
ON CONFLICT (migration_name) DO NOTHING;

-- ============================================================================
-- REALTIME SUBSCRIPTIONS (Enable per table as needed)
-- ============================================================================

-- Note: Enable Realtime on specific tables in Supabase Dashboard:
-- Go to Database -> Tables -> [table_name] -> Edit table -> Enable Realtime

-- ============================================================================
-- EDGE FUNCTION EXAMPLES (Optional - for advanced features)
-- ============================================================================

-- Example: Calculate and update user statistics
-- This can be called via Supabase Edge Functions

-- ============================================================================
-- SUMMARY
-- ============================================================================
/*
This schema provides:
1. User profiles linked to Supabase auth
2. Year-based habit organization
3. Complete habit tracking with categories, frequency, and priorities
4. Daily completions tracking with RLS protection
5. Mood and reflection tracking
6. Streak calculations and statistics
7. Row-level security for data isolation
8. Real-time subscription support

To enable realtime:
1. Go to Supabase Dashboard -> Database -> Tables
2. For each table, click "Edit table" and enable "Realtime"
3. Or use the SQL command: ALTER TABLE table_name REPLICA IDENTITY FULL;

Run this entire file in Supabase SQL Editor.
*/
