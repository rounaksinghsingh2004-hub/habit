import { Flame, Check } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '@/app/components/ui/utils';

interface HabitCardProps {
  id: string;
  name: string;
  category: 'Health' | 'Study' | 'Mental' | 'Lifestyle';
  time?: string;
  streak: number;
  completed: boolean;
  onToggle: (id: string) => void;
}

const categoryColors = {
  Health: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
  Study: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  Mental: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  Lifestyle: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
};

export default function HabitCard({ id, name, category, time, streak, completed, onToggle }: HabitCardProps) {
  const colors = categoryColors[category];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "flex items-center gap-4 p-4 rounded-xl border-2 transition-all cursor-pointer group",
        completed
          ? "bg-gray-50 border-gray-200"
          : "bg-white border-gray-100 hover:border-gray-200 hover:shadow-sm"
      )}
      onClick={() => onToggle(id)}
    >
      <motion.div
        className={cn(
          "w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all",
          completed
            ? "bg-blue-500 border-blue-500"
            : "border-gray-300 group-hover:border-blue-400"
        )}
        whileTap={{ scale: 0.9 }}
      >
        {completed && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          >
            <Check size={16} className="text-white" />
          </motion.div>
        )}
      </motion.div>

      <div className="flex-1 min-w-0">
        <h3 className={cn(
          "font-medium transition-all",
          completed && "line-through text-gray-500"
        )}>
          {name}
        </h3>
        {time && (
          <p className="text-sm text-gray-500 mt-0.5">{time}</p>
        )}
      </div>

      <div className="flex items-center gap-3 flex-shrink-0">
        <span className={cn(
          "px-3 py-1 rounded-full text-xs border",
          colors.bg,
          colors.text,
          colors.border
        )}>
          {category}
        </span>
        {streak > 0 && (
          <div className="flex items-center gap-1 text-orange-600 bg-orange-50 px-2 py-1 rounded-full">
            <Flame size={14} />
            <span className="text-xs font-medium">{streak}</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}
