import { useState } from 'react';
import { Plus, Calendar as CalendarIcon } from 'lucide-react';
import HabitCard from '@/app/components/HabitCard';

interface Habit {
  id: string;
  name: string;
  category: 'Health' | 'Study' | 'Mental' | 'Lifestyle';
  time?: string;
  streak: number;
  completedDates: string[];
}

interface PlannedViewProps {
  habits: Habit[];
  onToggle: (habitId: string) => void;
  completedHabits: string[];
  onAddHabit: () => void;
}

export default function PlannedView({ habits, onToggle, completedHabits, onAddHabit }: PlannedViewProps) {
  // Group habits by time
  const morningHabits = habits.filter(h => h.time?.toLowerCase().includes('morning') || h.time?.toLowerCase().includes('am') || h.time?.toLowerCase().includes('before'));
  const afternoonHabits = habits.filter(h => h.time?.toLowerCase().includes('afternoon') || h.time?.toLowerCase().includes('lunch'));
  const eveningHabits = habits.filter(h => h.time?.toLowerCase().includes('evening') || h.time?.toLowerCase().includes('night') || h.time?.toLowerCase().includes('pm'));
  const anytimeHabits = habits.filter(h => !h.time);

  const renderHabitGroup = (title: string, groupHabits: Habit[], icon: string) => {
    if (groupHabits.length === 0) return null;

    return (
      <div className="bg-white rounded-2xl p-6 border border-gray-100">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-2xl">{icon}</span>
          <h3 className="text-lg font-medium">{title}</h3>
          <span className="ml-auto text-sm text-gray-500">
            {groupHabits.filter(h => completedHabits.includes(h.id)).length}/{groupHabits.length}
          </span>
        </div>
        <div className="space-y-3">
          {groupHabits.map(habit => (
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
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Planned</h1>
          <p className="text-gray-600 mt-1">
            Your habits organized by time of day
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

      {habits.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 border border-gray-100 text-center">
          <CalendarIcon className="mx-auto mb-4 text-gray-400" size={48} />
          <h3 className="text-xl font-medium mb-2">No habits planned yet</h3>
          <p className="text-gray-600 mb-4">Start adding habits to organize your day</p>
          <button
            onClick={onAddHabit}
            className="text-blue-600 hover:underline"
          >
            Add your first habit
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {renderHabitGroup('Morning', morningHabits, '🌅')}
          {renderHabitGroup('Afternoon', afternoonHabits, '☀️')}
          {renderHabitGroup('Evening', eveningHabits, '🌙')}
          {renderHabitGroup('Anytime', anytimeHabits, '⏰')}
        </div>
      )}
    </div>
  );
}
