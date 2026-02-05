import { useState } from "react"
import { cn } from "@/app/components/ui/utils"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Area,
  AreaChart,
} from "recharts"
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Flame,
  CheckCircle,
  Calendar,
  Trophy,
  Target,
  Zap,
  Star,
} from "lucide-react"

type TimeRange = "weekly" | "monthly" | "yearly"

// Sample data
const weeklyData = [
  { day: "Mon", habits: 4, tasks: 3, rate: 80 },
  { day: "Tue", habits: 5, tasks: 4, rate: 90 },
  { day: "Wed", habits: 3, tasks: 2, rate: 60 },
  { day: "Thu", habits: 6, tasks: 5, rate: 100 },
  { day: "Fri", habits: 4, tasks: 4, rate: 85 },
  { day: "Sat", habits: 2, tasks: 2, rate: 45 },
  { day: "Sun", habits: 5, tasks: 4, rate: 88 },
]

const monthlyData = [
  { week: "Week 1", habits: 3.5, rate: 72 },
  { week: "Week 2", habits: 4.2, rate: 78 },
  { week: "Week 3", habits: 3.8, rate: 68 },
  { week: "Week 4", habits: 4.5, rate: 85 },
]

const yearlyData = [
  { month: "Jan", habits: 3.2 },
  { month: "Feb", habits: 3.8 },
  { month: "Mar", habits: 4.1 },
  { month: "Apr", habits: 3.5 },
  { month: "May", habits: 4.3 },
  { month: "Jun", habits: 3.9 },
  { month: "Jul", habits: 4.5 },
  { month: "Aug", habits: 4.2 },
  { month: "Sep", habits: 3.7 },
  { month: "Oct", habits: 4.0 },
  { month: "Nov", habits: 4.4 },
  { month: "Dec", habits: 3.6 },
]

interface StatCardProps {
  title: string
  value: string
  subtitle?: string
  icon: React.ReactNode
  trend?: "up" | "down" | "neutral"
  trendValue?: string
  color: string
}

function StatCard({ title, value, subtitle, icon, trend, trendValue, color }: StatCardProps) {
  return (
    <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{title}</p>
          <p className="text-2xl font-bold text-slate-800 mt-1">{value}</p>
          {subtitle && <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>}
        </div>
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: `${color}15` }}
        >
          {icon}
        </div>
      </div>
      {trend && trendValue && (
        <div className="flex items-center gap-1 mt-2">
          {trend === "up" && <TrendingUp className="w-4 h-4 text-green-500" />}
          {trend === "down" && <TrendingDown className="w-4 h-4 text-red-500" />}
          {trend === "neutral" && <Minus className="w-4 h-4 text-slate-400" />}
          <span
            className={cn(
              "text-xs font-medium",
              trend === "up" && "text-green-600",
              trend === "down" && "text-red-600",
              trend === "neutral" && "text-slate-500"
            )}
          >
            {trendValue}
          </span>
        </div>
      )}
    </div>
  )
}

export default function InsightsPage() {
  const [timeRange, setTimeRange] = useState<TimeRange>("weekly")

  const averages = {
    weekly: {
      habitsPerDay: 4.1,
      tasksPerDay: 3.4,
      completionRate: 78,
      trendUp: true,
      trendValue: "12% higher than last week",
    },
    monthly: {
      habitsPerDay: 3.8,
      productiveDays: 4.2,
      avgStreak: 5.3,
      trendUp: true,
      trendValue: "Better than last month",
    },
    yearly: {
      habitsPerDay: 3.9,
      bestMonth: "July",
      avgStreak: 6.1,
      avgPerMonth: 4.0,
      trendUp: true,
      trendValue: "On track for goals",
    },
  }

  const currentAverages = averages[timeRange]

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Insights</h1>
          <p className="text-sm text-slate-500 mt-0.5">Track your progress over time</p>
        </div>
        <div className="flex gap-1 p-1 bg-slate-100 rounded-lg">
          {(["weekly", "monthly", "yearly"] as TimeRange[]).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={cn(
                "px-4 py-1.5 rounded-md text-sm font-medium transition-all",
                timeRange === range
                  ? "bg-white text-slate-800 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              )}
            >
              {range.charAt(0).toUpperCase() + range.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Weekly Averages Card */}
      {timeRange === "weekly" && (
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-5 border border-indigo-100">
          <div className="flex items-center gap-2 mb-4">
            <Trophy className="w-5 h-5 text-indigo-500" />
            <h2 className="text-lg font-semibold text-slate-800">Weekly Averages</h2>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <StatCard
              title="Habits/Day"
              value={currentAverages.habitsPerDay.toFixed(1)}
              subtitle="Last 7 days"
              icon={<CheckCircle className="w-5 h-5 text-green-500" />}
              trend={currentAverages.trendUp ? "up" : "down"}
              trendValue={currentAverages.trendValue}
              color="#22c55e"
            />
            <StatCard
              title="Tasks/Day"
              value={(currentAverages as any).tasksPerDay?.toFixed(1) || "3.4"}
              subtitle="Completed daily"
              icon={<Target className="w-5 h-5 text-blue-500" />}
              color="#3b82f6"
            />
            <StatCard
              title="Completion"
              value={`${currentAverages.completionRate}%`}
              subtitle="Success rate"
              icon={<Zap className="w-5 h-5 text-amber-500" />}
              trend={currentAverages.trendUp ? "up" : "neutral"}
              trendValue="Great progress!"
              color="#eab308"
            />
          </div>
        </div>
      )}

      {/* Monthly Averages Card */}
      {timeRange === "monthly" && (
        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl p-5 border border-blue-100">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5 text-blue-500" />
            <h2 className="text-lg font-semibold text-slate-800">Monthly Averages</h2>
          </div>
          <div className="grid grid-cols-2 grid-rows-2 gap-4">
            <StatCard
              title="Habits/Day"
              value={currentAverages.habitsPerDay.toFixed(1)}
              subtitle="Daily average"
              icon={<CheckCircle className="w-5 h-5 text-green-500" />}
              color="#22c55e"
            />
            <StatCard
              title="Productive Days"
              value={(currentAverages as any).productiveDays.toFixed(1)}
              subtitle="Per week avg"
              icon={<Star className="w-5 h-5 text-amber-500" />}
              color="#eab308"
            />
            <StatCard
              title="Avg Streak"
              value={`${(currentAverages as any).avgStreak} days`}
              subtitle="Current month"
              icon={<Flame className="w-5 h-5 text-orange-500" />}
              color="#f97316"
            />
            <StatCard
              title="Best Week"
              value="Week 4"
              subtitle="4.5 habits/day"
              icon={<Trophy className="w-5 h-5 text-purple-500" />}
              color="#a855f7"
            />
          </div>
        </div>
      )}

      {/* Yearly Averages Card */}
      {timeRange === "yearly" && (
        <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl p-5 border border-orange-100">
          <div className="flex items-center gap-2 mb-4">
            <Star className="w-5 h-5 text-amber-500" />
            <h2 className="text-lg font-semibold text-slate-800">Yearly Averages & Trends</h2>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <StatCard
              title="Habits/Day"
              value={currentAverages.habitsPerDay.toFixed(1)}
              subtitle="Yearly average"
              icon={<CheckCircle className="w-5 h-5 text-green-500" />}
              color="#22c55e"
            />
            <StatCard
              title="Best Month"
              value={(currentAverages as any).bestMonth}
              subtitle="Highest average"
              icon={<Trophy className="w-5 h-5 text-amber-500" />}
              color="#eab308"
            />
            <StatCard
              title="Avg Streak"
              value={`${(currentAverages as any).avgStreak} days`}
              subtitle="This year"
              icon={<Flame className="w-5 h-5 text-orange-500" />}
              color="#f97316"
            />
            <StatCard
              title="Monthly Avg"
              value={(currentAverages as any).avgPerMonth.toFixed(1)}
              subtitle="Habits/month"
              icon={<Calendar className="w-5 h-5 text-blue-500" />}
              color="#3b82f6"
            />
          </div>
        </div>
      )}

      {/* Charts */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">
          {timeRange === "weekly" && "Daily Completions"}
          {timeRange === "monthly" && "Weekly Progress"}
          {timeRange === "yearly" && "Monthly Trends"}
        </h3>
        <ResponsiveContainer width="100%" height={200}>
          {timeRange === "weekly" ? (
            <BarChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="day" stroke="#94a3b8" fontSize={12} />
              <YAxis stroke="#94a3b8" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #e2e8f0",
                  borderRadius: "8px",
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                }}
              />
              <Bar dataKey="habits" fill="url(#barGradient)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="tasks" fill="url(#barGradient2)" radius={[4, 4, 0, 0]} />
              <defs>
                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" />
                  <stop offset="100%" stopColor="#818cf8" />
                </linearGradient>
                <linearGradient id="barGradient2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#22c55e" />
                  <stop offset="100%" stopColor="#86efac" />
                </linearGradient>
              </defs>
            </BarChart>
          ) : timeRange === "monthly" ? (
            <AreaChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="week" stroke="#94a3b8" fontSize={12} />
              <YAxis stroke="#94a3b8" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #e2e8f0",
                  borderRadius: "8px",
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                }}
              />
              <Area
                type="monotone"
                dataKey="habits"
                stroke="#3b82f6"
                fill="url(#areaGradient)"
                strokeWidth={2}
              />
              <defs>
                <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
            </AreaChart>
          ) : (
            <LineChart data={yearlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
              <YAxis stroke="#94a3b8" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #e2e8f0",
                  borderRadius: "8px",
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                }}
              />
              <Line
                type="monotone"
                dataKey="habits"
                stroke="#f97316"
                strokeWidth={2}
                dot={{ fill: "#f97316", strokeWidth: 2 }}
              />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Category Breakdown */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Category Breakdown</h3>
        <div className="space-y-3">
          {[
            { category: "Health", percentage: 85, color: "bg-green-500" },
            { category: "Study", percentage: 72, color: "bg-blue-500" },
            { category: "Mental", percentage: 68, color: "bg-purple-500" },
            { category: "Lifestyle", percentage: 91, color: "bg-orange-500" },
          ].map((item) => (
            <div key={item.category} className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-700">{item.category}</span>
                <span className="text-sm text-slate-500">{item.percentage}%</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={cn("h-full rounded-full transition-all duration-500", item.color)}
                  style={{ width: `${item.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Achievements */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Achievements</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { name: "First Steps", earned: true, icon: "👟" },
            { name: "Week Warrior", earned: true, icon: "🔥" },
            { name: "Perfect Week", earned: false, icon: "⭐" },
            { name: "Monthly Master", earned: false, icon: "🏆" },
          ].map((achievement) => (
            <div
              key={achievement.name}
              className={cn(
                "p-3 rounded-xl text-center transition-all",
                achievement.earned
                  ? "bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200"
                  : "bg-slate-50 border border-slate-200 opacity-50"
              )}
            >
              <div className="text-2xl mb-1">{achievement.icon}</div>
              <p className={cn(
                "text-xs font-medium",
                achievement.earned ? "text-slate-800" : "text-slate-500"
              )}>
                {achievement.name}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
