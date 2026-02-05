import { ChevronLeft, ChevronRight, Flame, LogOut } from 'lucide-react';
import { format } from 'date-fns';

interface TopBarProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  streak: number;
  completionRate: number;
  onLogout?: () => void;
  userName?: string;
}

export default function TopBar({ selectedDate, onDateChange, streak, completionRate, onLogout, userName }: TopBarProps) {
  const goToPreviousDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() - 1);
    onDateChange(newDate);
  };

  const goToNextDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + 1);
    onDateChange(newDate);
  };

  const goToToday = () => {
    onDateChange(new Date());
  };

  const isToday = format(selectedDate, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');

  return (
    <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 transition-colors">
      <div className="flex items-center justify-between max-w-7xl">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-1">
            <button
              onClick={goToPreviousDay}
              className="p-2 hover:bg-white rounded transition-all"
              aria-label="Previous day"
            >
              <ChevronLeft size={20} />
            </button>
            <div className="px-4 min-w-[200px] text-center">
              <div className="text-sm text-gray-500">
                {format(selectedDate, 'EEEE')}
              </div>
              <div className="font-medium">
                {format(selectedDate, 'MMMM d, yyyy')}
              </div>
            </div>
            <button
              onClick={goToNextDay}
              className="p-2 hover:bg-white rounded transition-all"
              aria-label="Next day"
            >
              <ChevronRight size={20} />
            </button>
          </div>
          {!isToday && (
            <button
              onClick={goToToday}
              className="px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
            >
              Today
            </button>
          )}
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 bg-orange-50 px-4 py-2 rounded-lg">
            <Flame className="text-orange-500" size={20} />
            <span className="font-medium text-orange-900">{streak} days</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-right">
              <div className="text-sm text-gray-500">Progress</div>
              <div className="font-medium">{completionRate}%</div>
            </div>
            <div className="w-12 h-12 relative">
              <svg className="w-12 h-12 transform -rotate-90">
                <circle
                  cx="24"
                  cy="24"
                  r="20"
                  stroke="#e5e7eb"
                  strokeWidth="4"
                  fill="none"
                />
                <circle
                  cx="24"
                  cy="24"
                  r="20"
                  stroke="#3b82f6"
                  strokeWidth="4"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 20}`}
                  strokeDashoffset={`${2 * Math.PI * 20 * (1 - completionRate / 100)}`}
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>
          {userName && (
            <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
              <div className="text-right">
                <div className="text-sm font-medium">{userName}</div>
              </div>
              {onLogout && (
                <button
                  onClick={onLogout}
                  className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                  title="Logout"
                >
                  <LogOut size={20} />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
