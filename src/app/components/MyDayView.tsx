import { useState, useEffect } from 'react';
import { Plus, Sparkles, Calendar } from 'lucide-react';
import HabitCard from '@/app/components/HabitCard';
import ProgressCard from '@/app/components/ProgressCard';
import MoodTracker from '@/app/components/MoodTracker';
import ReflectionBox from '@/app/components/ReflectionBox';
import InsightsPreview from '@/app/components/InsightsPreview';
import { motion, AnimatePresence } from 'motion/react';

interface Habit {
  id: string;
  name: string;
  category: 'Health' | 'Study' | 'Mental' | 'Lifestyle';
  time?: string;
  streak: number;
  completedDates: string[];
}

interface MyDayViewProps {
  habits: Habit[];
  completedHabits: string[];
  onToggle: (habitId: string) => void;
  mood: number | null;
  onMoodSelect: (mood: number) => void;
  reflection: string;
  onReflectionChange: (reflection: string) => void;
  onAddHabit: () => void;
  insights: {
    weeklyAverage: number;
    bestStreak: number;
    totalDaysTracked: number;
  };
  isPerfectDay: boolean;
}

// Simple confetti component
function Confetti({ show }: { show: boolean }) {
  if (!show) return null;

  const colors = ['#6366f1', '#22c55e', '#f97316', '#a855f7', '#3b82f6', '#f59e0b'];
  const confetti = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    color: colors[Math.floor(Math.random() * colors.length)],
    x: Math.random() * 100,
    delay: Math.random() * 2,
    duration: 2 + Math.random() * 2,
    size: 8 + Math.random() * 8,
  }));

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {confetti.map((piece) => (
        <motion.div
          key={piece.id}
          className="absolute rounded-full"
          style={{
            left: `${piece.x}%`,
            top: '-20px',
            width: piece.size,
            height: piece.size,
            backgroundColor: piece.color,
          }}
          animate={{
            top: ['-20px', '100vh'],
            left: [`${piece.x}%`, `${piece.x + (Math.random() - 0.5) * 30}%`],
            rotate: [0, 720],
            opacity: [1, 1, 0],
          }}
          transition={{
            duration: piece.duration,
            delay: piece.delay,
            ease: 'easeIn',
          }}
        />
      ))}
    </div>
  );
}

export default function MyDayView({
  habits,
  completedHabits,
  onToggle,
  mood,
  onMoodSelect,
  reflection,
  onReflectionChange,
  onAddHabit,
  insights,
  isPerfectDay
}: MyDayViewProps) {
  const [showConfetti, setShowConfetti] = useState(false);
  const completedCount = completedHabits.length;
  const totalCount = habits.length;

  // Trigger confetti when perfect day is achieved
  useEffect(() => {
    if (isPerfectDay && completedCount === totalCount && totalCount > 0) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [isPerfectDay, completedCount, totalCount]);

  // Get today's date for header
  const today = new Date();
  const dateStr = today.toLocaleDateString('en-US', { 
    weekday: 'long', 
    month: 'long', 
    day: 'numeric' 
  });

  return (
    <div className="space-y-6">
      <Confetti show={showConfetti} />
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
            <Calendar size={14} />
            <span>{dateStr}</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-800">My Day</h1>
          <p className="text-gray-500 mt-1">
            {isPerfectDay 
              ? "🎉 Amazing! You've completed all habits!" 
              : `${completedCount} of ${totalCount} habits completed`}
          </p>
        </div>
        <button
          onClick={onAddHabit}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-primary to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5"
        >
          <Plus size={20} />
          <span>Add Habit</span>
        </button>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Progress & Habits */}
        <div className="lg:col-span-2 space-y-6">
          <ProgressCard
            completed={completedCount}
            total={totalCount}
            isPerfectDay={isPerfectDay}
          />

          {/* Habits Section */}
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-md">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800">Today's Habits</h2>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Sparkles size={14} className="text-primary" />
                <span>{completedCount}/{totalCount} done</span>
              </div>
            </div>
            
            <div className="space-y-3">
              {habits.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-primary/10 to-purple-500/10 rounded-full flex items-center justify-center">
                    <Sparkles size={40} className="text-primary/50" />
                  </div>
                  <p className="text-gray-500 mb-4">No habits yet!</p>
                  <button
                    onClick={onAddHabit}
                    className="text-primary font-semibold hover:underline"
                  >
                    Add your first habit
                  </button>
                </div>
              ) : (
                <AnimatePresence mode="popLayout">
                  {habits.map(habit => (
                    <HabitCard
                      key={habit.id}
                      id={habit.id}
                      name={habit.name}
                      category={habit.category}
                      time={habit.time}
                      streak={habit.streak}
                      completed={completedHabits.includes(habit.id)}
                      onToggle={onToggle}
                    />
                  ))}
                </AnimatePresence>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Mood, Reflection, Insights */}
        <div className="space-y-6">
          <MoodTracker
            selectedMood={mood}
            onMoodSelect={onMoodSelect}
          />
          <ReflectionBox
            value={reflection}
            onChange={onReflectionChange}
          />
          <InsightsPreview
            weeklyAverage={insights.weeklyAverage}
            bestStreak={insights.bestStreak}
            totalDaysTracked={insights.totalDaysTracked}
          />
        </div>
      </div>
    </div>
  );
}
