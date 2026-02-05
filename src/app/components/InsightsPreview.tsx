import { TrendingUp, Award, Calendar } from 'lucide-react';

interface InsightsPreviewProps {
  weeklyAverage: number;
  bestStreak: number;
  totalDaysTracked: number;
}

export default function InsightsPreview({ weeklyAverage, bestStreak, totalDaysTracked }: InsightsPreviewProps) {
  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-100">
      <h2 className="text-lg font-medium mb-4">Quick Insights</h2>
      
      <div className="grid grid-cols-3 gap-4">
        <div className="flex flex-col items-center p-4 bg-blue-50 rounded-xl">
          <TrendingUp className="text-blue-600 mb-2" size={24} />
          <div className="text-2xl font-bold text-blue-900">{weeklyAverage.toFixed(1)}</div>
          <div className="text-xs text-blue-700 text-center mt-1">Avg habits/day</div>
          <div className="text-xs text-blue-600 mt-0.5">(Last 7 days)</div>
        </div>

        <div className="flex flex-col items-center p-4 bg-orange-50 rounded-xl">
          <Award className="text-orange-600 mb-2" size={24} />
          <div className="text-2xl font-bold text-orange-900">{bestStreak}</div>
          <div className="text-xs text-orange-700 text-center mt-1">Best streak</div>
          <div className="text-xs text-orange-600 mt-0.5">days in a row</div>
        </div>

        <div className="flex flex-col items-center p-4 bg-purple-50 rounded-xl">
          <Calendar className="text-purple-600 mb-2" size={24} />
          <div className="text-2xl font-bold text-purple-900">{totalDaysTracked}</div>
          <div className="text-xs text-purple-700 text-center mt-1">Days tracked</div>
          <div className="text-xs text-purple-600 mt-0.5">total</div>
        </div>
      </div>

      <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-100">
        <p className="text-sm text-gray-700">
          💡 <span className="font-medium">Insight:</span> You complete 20% more habits on weekends!
        </p>
      </div>
    </div>
  );
}
