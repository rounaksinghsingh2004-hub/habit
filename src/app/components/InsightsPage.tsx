import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { TrendingUp, TrendingDown, Calendar, Award } from 'lucide-react';
import ExcelExport from '@/app/components/ExcelExport';

interface Habit {
  id: string;
  name: string;
  category: string;
  streak: number;
}

interface InsightsPageProps {
  dailyData: any;
  habits: Habit[];
}

export default function InsightsPage({ dailyData, habits }: InsightsPageProps) {
  // Calculate weekly data (last 7 days)
  const getWeeklyData = () => {
    const data = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateKey = date.toISOString().split('T')[0];
      const dayData = dailyData[dateKey];
      
      data.push({
        day: date.toLocaleDateString('en-US', { weekday: 'short' }),
        completed: dayData?.completedHabits?.length || 0,
        date: dateKey,
      });
    }
    
    return data;
  };

  // Calculate monthly data (last 30 days)
  const getMonthlyData = () => {
    const data = [];
    const today = new Date();
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateKey = date.toISOString().split('T')[0];
      const dayData = dailyData[dateKey];
      
      data.push({
        date: date.getDate(),
        completed: dayData?.completedHabits?.length || 0,
      });
    }
    
    return data;
  };

  const weeklyData = getWeeklyData();
  const monthlyData = getMonthlyData();
  
  const weeklyAvg = (weeklyData.reduce((sum, d) => sum + d.completed, 0) / 7).toFixed(1);
  const monthlyAvg = (monthlyData.reduce((sum, d) => sum + d.completed, 0) / 30).toFixed(1);
  
  const weeklyTotal = weeklyData.reduce((sum, d) => sum + d.completed, 0);
  const prevWeekTotal = weeklyTotal; // Simplified for demo
  const weeklyTrend = weeklyTotal >= prevWeekTotal ? 'up' : 'down';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Insights</h1>
        <p className="text-gray-600">Track your progress and discover patterns</p>
      </div>

      {/* Weekly Insights */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Weekly Summary</h2>
          <div className="flex items-center gap-2 text-green-600">
            <TrendingUp size={20} />
            <span className="text-sm font-medium">+12% vs last week</span>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="p-4 bg-blue-50 rounded-xl">
            <div className="text-sm text-blue-700 mb-1">Avg Habits/Day</div>
            <div className="text-2xl font-bold text-blue-900">{weeklyAvg}</div>
          </div>
          <div className="p-4 bg-green-50 rounded-xl">
            <div className="text-sm text-green-700 mb-1">Completion Rate</div>
            <div className="text-2xl font-bold text-green-900">87%</div>
          </div>
          <div className="p-4 bg-purple-50 rounded-xl">
            <div className="text-sm text-purple-700 mb-1">Best Day</div>
            <div className="text-2xl font-bold text-purple-900">Sat</div>
          </div>
          <div className="p-4 bg-orange-50 rounded-xl">
            <div className="text-sm text-orange-700 mb-1">Total Completed</div>
            <div className="text-2xl font-bold text-orange-900">{weeklyTotal}</div>
          </div>
        </div>

        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="day" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                }}
              />
              <Bar dataKey="completed" radius={[8, 8, 0, 0]}>
                {weeklyData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill="#3b82f6" />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Monthly Insights */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Monthly Overview</h2>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar size={20} />
            <span>Last 30 days</span>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="p-4 bg-indigo-50 rounded-xl">
            <div className="text-sm text-indigo-700 mb-1">Avg Habits/Day</div>
            <div className="text-2xl font-bold text-indigo-900">{monthlyAvg}</div>
          </div>
          <div className="p-4 bg-teal-50 rounded-xl">
            <div className="text-sm text-teal-700 mb-1">Productive Days</div>
            <div className="text-2xl font-bold text-teal-900">24/30</div>
          </div>
          <div className="p-4 bg-rose-50 rounded-xl">
            <div className="text-sm text-rose-700 mb-1">Best Week</div>
            <div className="text-2xl font-bold text-rose-900">Week 2</div>
          </div>
          <div className="p-4 bg-amber-50 rounded-xl">
            <div className="text-sm text-amber-700 mb-1">Avg Streak</div>
            <div className="text-2xl font-bold text-amber-900">5.2 days</div>
          </div>
        </div>

        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                }}
              />
              <Line
                type="monotone"
                dataKey="completed"
                stroke="#8b5cf6"
                strokeWidth={2}
                dot={{ fill: '#8b5cf6', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Yearly Insights */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Yearly Progress</h2>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Award size={20} />
            <span>2026</span>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="p-4 bg-violet-50 rounded-xl">
            <div className="text-sm text-violet-700 mb-1">Avg Habits/Day</div>
            <div className="text-2xl font-bold text-violet-900">6.8</div>
          </div>
          <div className="p-4 bg-cyan-50 rounded-xl">
            <div className="text-sm text-cyan-700 mb-1">Total Days</div>
            <div className="text-2xl font-bold text-cyan-900">33</div>
          </div>
          <div className="p-4 bg-fuchsia-50 rounded-xl">
            <div className="text-sm text-fuchsia-700 mb-1">Best Month</div>
            <div className="text-2xl font-bold text-fuchsia-900">Feb</div>
          </div>
          <div className="p-4 bg-lime-50 rounded-xl">
            <div className="text-sm text-lime-700 mb-1">Best Streak</div>
            <div className="text-2xl font-bold text-lime-900">12 days</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="p-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl border border-blue-100">
            <h3 className="font-medium mb-2">🎯 Achievement</h3>
            <p className="text-sm text-gray-700">
              You've maintained a habit streak for 12 consecutive days!
            </p>
          </div>
          <div className="p-6 bg-gradient-to-br from-green-50 to-teal-50 rounded-xl border border-green-100">
            <h3 className="font-medium mb-2">💡 Pattern</h3>
            <p className="text-sm text-gray-700">
              You complete 30% more habits on gym days. Keep exercising!
            </p>
          </div>
        </div>
      </div>

      {/* Excel Export */}
      <ExcelExport habits={habits} dailyData={dailyData} />
    </div>
  );
}
