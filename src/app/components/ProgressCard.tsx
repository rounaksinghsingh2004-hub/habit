import { motion } from 'motion/react';

interface ProgressCardProps {
  completed: number;
  total: number;
  isPerfectDay: boolean;
}

export default function ProgressCard({ completed, total, isPerfectDay }: ProgressCardProps) {
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
  const circumference = 2 * Math.PI * 70;
  const offset = circumference - (percentage / 100) * circumference;

  const getMessage = () => {
    if (isPerfectDay) return "Perfect Day 🎉";
    if (percentage >= 80) return "Almost there, keep going! 🔥";
    if (percentage >= 50) return "Great progress! 💪";
    if (percentage >= 25) return "You're doing it! 🌟";
    return "Let's get started! ✨";
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-8 border border-blue-100">
      <h2 className="text-lg font-medium mb-6">Daily Progress</h2>
      
      <div className="flex items-center justify-between">
        <div className="relative w-44 h-44">
          <svg className="w-44 h-44 transform -rotate-90">
            <circle
              cx="88"
              cy="88"
              r="70"
              stroke="#e0e7ff"
              strokeWidth="12"
              fill="none"
            />
            <motion.circle
              cx="88"
              cy="88"
              r="70"
              stroke="url(#gradient)"
              strokeWidth="12"
              fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="round"
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: offset }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#8b5cf6" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {percentage}%
            </span>
            <span className="text-sm text-gray-600 mt-1">complete</span>
          </div>
        </div>

        <div className="flex-1 ml-8">
          <div className="text-3xl font-bold mb-2">
            {completed} / {total}
          </div>
          <div className="text-gray-600 mb-4">habits completed</div>
          <div className="text-lg">
            {getMessage()}
          </div>
        </div>
      </div>
    </div>
  );
}
