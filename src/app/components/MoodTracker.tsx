import { motion } from 'motion/react';
import { cn } from '@/app/components/ui/utils';

interface MoodTrackerProps {
  selectedMood: number | null;
  onMoodSelect: (mood: number) => void;
}

const moods = [
  { emoji: '😄', label: 'Amazing', value: 5 },
  { emoji: '🙂', label: 'Good', value: 4 },
  { emoji: '😐', label: 'Okay', value: 3 },
  { emoji: '😞', label: 'Bad', value: 2 },
  { emoji: '😫', label: 'Terrible', value: 1 },
];

export default function MoodTracker({ selectedMood, onMoodSelect }: MoodTrackerProps) {
  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-100">
      <h2 className="text-lg font-medium mb-4">How was today?</h2>
      
      <div className="flex justify-between gap-2">
        {moods.map((mood) => (
          <motion.button
            key={mood.value}
            onClick={() => onMoodSelect(mood.value)}
            className={cn(
              "flex-1 flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all",
              selectedMood === mood.value
                ? "border-blue-500 bg-blue-50 scale-105"
                : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
            )}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="text-3xl">{mood.emoji}</span>
            <span className="text-xs text-gray-600">{mood.label}</span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
