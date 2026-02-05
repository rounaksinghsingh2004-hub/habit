import { TrendingUp, Award, Calendar, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';

interface InsightsPreviewProps {
  weeklyAverage: number;
  bestStreak: number;
  totalDaysTracked: number;
}

export default function InsightsPreview({ weeklyAverage, bestStreak, totalDaysTracked }: InsightsPreviewProps) {
  const stats = [
    { 
      icon: TrendingUp, 
      value: weeklyAverage.toFixed(1), 
      label: 'Avg/Day',
      sublabel: 'Last 7 days',
      color: 'from-blue-400 to-cyan-500',
      bg: 'bg-blue-50',
      text: 'text-blue-600',
    },
    { 
      icon: Award, 
      value: bestStreak, 
      label: 'Best streak',
      sublabel: 'days in a row',
      color: 'from-orange-400 to-amber-500',
      bg: 'bg-orange-50',
      text: 'text-orange-600',
    },
    { 
      icon: Calendar, 
      value: totalDaysTracked, 
      label: 'Days tracked',
      sublabel: 'total',
      color: 'from-purple-400 to-pink-500',
      bg: 'bg-purple-50',
      text: 'text-purple-600',
    },
  ];

  return (
    <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-md overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <Sparkles size={20} className="text-primary" />
        <h2 className="text-xl font-bold text-gray-800">Quick Insights</h2>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-3">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex flex-col items-center p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors"
          >
            <div className={`p-2 rounded-xl ${stat.bg} mb-2`}>
              <stat.icon size={20} className={stat.text} />
            </div>
            <div className={`text-2xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
              {stat.value}
            </div>
            <div className="text-xs text-gray-600 font-medium mt-1">{stat.label}</div>
            <div className="text-xs text-gray-400">{stat.sublabel}</div>
          </motion.div>
        ))}
      </div>

      {/* Insight Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4 }}
        className="mt-4 p-4 bg-gradient-to-r from-primary/5 to-purple-500/5 rounded-2xl border border-primary/10"
      >
        <div className="flex items-start gap-3">
          <div className="text-lg">💡</div>
          <div>
            <p className="text-sm text-gray-700">
              <span className="font-semibold">Insight:</span> You complete{' '}
              <span className="text-primary font-semibold">20% more</span> habits on weekends!
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
