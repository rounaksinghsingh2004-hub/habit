import { Plus, Star } from 'lucide-react';
import HabitCard from '@/app/components/HabitCard';

interface Habit {
  id: string;
  name: string;
  category: 'Health' | 'Study' | 'Mental' | 'Lifestyle';
  time?: string;
  streak: number;
  completedDates: string[];
  isImportant?: boolean;
}

interface ImportantViewProps {
  habits: Habit[];
  onToggle: (habitId: string) => void;
  completedHabits: string[];
  onAddHabit: () => void;
  onToggleImportant?: (habitId: string) => void;
}

export default function ImportantView({ habits, onToggle, completedHabits, onAddHabit }: ImportantViewProps) {
  // Filter only important habits (for now, show habits with streak > 5 or Health/Study category)
  const importantHabits = habits.filter(h => 
    h.streak >= 5 || h.category === 'Health' || h.category === 'Study'
  );

  const completedImportant = importantHabits.filter(h => completedHabits.includes(h.id)).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Star className="text-yellow-500" />
            Important
          </h1>
          <p className="text-gray-600 mt-1">
            Focus on your most critical habits
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-6 border border-yellow-100">
          <div className="text-sm text-yellow-700 mb-1">Important Habits</div>
          <div className="text-3xl font-bold text-yellow-900">{importantHabits.length}</div>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-teal-50 rounded-xl p-6 border border-green-100">
          <div className="text-sm text-green-700 mb-1">Completed Today</div>
          <div className="text-3xl font-bold text-green-900">{completedImportant}</div>
        </div>
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-100">
          <div className="text-sm text-blue-700 mb-1">Completion Rate</div>
          <div className="text-3xl font-bold text-blue-900">
            {importantHabits.length > 0 ? Math.round((completedImportant / importantHabits.length) * 100) : 0}%
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 border border-gray-100">
        <h2 className="text-lg font-medium mb-4 flex items-center gap-2">
          <Star size={20} className="text-yellow-500" />
          Priority Habits
        </h2>
        
        {importantHabits.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Star className="mx-auto mb-4 text-gray-400" size={48} />
            <p className="mb-2">No important habits yet</p>
            <p className="text-sm text-gray-400 mb-4">
              Habits with 5+ day streaks or in Health/Study categories are automatically marked as important
            </p>
            <button
              onClick={onAddHabit}
              className="text-blue-600 hover:underline"
            >
              Add your first habit
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {importantHabits.map(habit => (
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
        )}
      </div>

      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-100">
        <h3 className="font-medium mb-2">💡 Pro Tip</h3>
        <p className="text-sm text-gray-700">
          Focus on completing your important habits first each day. Building strong streaks in Health and Study habits creates lasting positive change!
        </p>
      </div>
    </div>
  );
}
