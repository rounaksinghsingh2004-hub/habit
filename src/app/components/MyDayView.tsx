import { Plus } from 'lucide-react';
import HabitCard from '@/app/components/HabitCard';
import ProgressCard from '@/app/components/ProgressCard';
import MoodTracker from '@/app/components/MoodTracker';
import ReflectionBox from '@/app/components/ReflectionBox';
import InsightsPreview from '@/app/components/InsightsPreview';

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
  const completedCount = completedHabits.length;
  const totalCount = habits.length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Day</h1>
          <p className="text-gray-600 mt-1">
            {isPerfectDay 
              ? "Amazing! You've completed all habits! 🎉" 
              : `${completedCount} of ${totalCount} habits completed`}
          </p>
        </div>
        <button
          onClick={onAddHabit}
          className="flex items-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-sm hover:shadow-md"
        >
          <Plus size={20} />
          <span>Add Habit</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <ProgressCard
            completed={completedCount}
            total={totalCount}
            isPerfectDay={isPerfectDay}
          />

          <div className="bg-white rounded-2xl p-6 border border-gray-100">
            <h2 className="text-lg font-medium mb-4">Today's Habits</h2>
            <div className="space-y-3">
              {habits.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <p className="mb-4">No habits yet!</p>
                  <button
                    onClick={onAddHabit}
                    className="text-blue-600 hover:underline"
                  >
                    Add your first habit
                  </button>
                </div>
              ) : (
                habits.map(habit => (
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
                ))
              )}
            </div>
          </div>
        </div>

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
