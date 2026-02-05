import { useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/app/components/ui/utils';

interface CalendarViewProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  dailyData: Record<string, any>;
  totalHabits: number;
}

export default function CalendarView({ selectedDate, onDateSelect, dailyData, totalHabits }: CalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Get the day of week for the first day (0 = Sunday, 1 = Monday, etc.)
  const firstDayOfWeek = monthStart.getDay();

  // Create empty cells for days before the month starts
  const emptyCells = Array(firstDayOfWeek).fill(null);

  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const getCompletionRate = (date: Date) => {
    const dateKey = date.toISOString().split('T')[0];
    const dayData = dailyData[dateKey];
    if (!dayData || !dayData.completedHabits) return 0;
    if (totalHabits === 0) return 0;
    return (dayData.completedHabits.length / totalHabits) * 100;
  };

  const getCompletionColor = (rate: number) => {
    if (rate === 0) return 'bg-gray-50';
    if (rate < 25) return 'bg-red-100';
    if (rate < 50) return 'bg-orange-100';
    if (rate < 75) return 'bg-yellow-100';
    if (rate < 100) return 'bg-green-100';
    return 'bg-green-500';
  };

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Calendar</h1>
        <p className="text-gray-600 mt-1">
          Track your habit completion over time
        </p>
      </div>

      <div className="bg-white rounded-2xl p-6 border border-gray-100">
        {/* Calendar Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold">
            {format(currentMonth, 'MMMM yyyy')}
          </h2>
          <div className="flex gap-2">
            <button
              onClick={goToPreviousMonth}
              className="p-2 hover:bg-gray-100 rounded-lg transition-all"
              aria-label="Previous month"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={goToNextMonth}
              className="p-2 hover:bg-gray-100 rounded-lg transition-all"
              aria-label="Next month"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        {/* Week day headers */}
        <div className="grid grid-cols-7 gap-2 mb-2">
          {weekDays.map(day => (
            <div key={day} className="text-center text-sm font-medium text-gray-600 py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-2">
          {/* Empty cells before month starts */}
          {emptyCells.map((_, index) => (
            <div key={`empty-${index}`} className="aspect-square" />
          ))}

          {/* Days of the month */}
          {daysInMonth.map(day => {
            const completionRate = getCompletionRate(day);
            const isSelected = isSameDay(day, selectedDate);
            const isTodayDate = isToday(day);
            
            return (
              <button
                key={day.toISOString()}
                onClick={() => onDateSelect(day)}
                className={cn(
                  "aspect-square rounded-xl p-2 transition-all relative border-2",
                  getCompletionColor(completionRate),
                  isSelected && "ring-2 ring-blue-500 border-blue-500",
                  !isSelected && "border-transparent hover:border-gray-300",
                  isTodayDate && !isSelected && "border-blue-300"
                )}
              >
                <div className="flex flex-col items-center justify-center h-full">
                  <span className={cn(
                    "text-sm font-medium",
                    completionRate === 100 && "text-white",
                    completionRate < 100 && completionRate > 0 && "text-gray-700",
                    completionRate === 0 && "text-gray-400"
                  )}>
                    {format(day, 'd')}
                  </span>
                  {completionRate > 0 && (
                    <span className={cn(
                      "text-xs mt-1",
                      completionRate === 100 ? "text-white" : "text-gray-600"
                    )}>
                      {Math.round(completionRate)}%
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-6 mt-6 pt-6 border-t border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-gray-50 border border-gray-200" />
            <span className="text-sm text-gray-600">0%</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-yellow-100 border border-yellow-200" />
            <span className="text-sm text-gray-600">25-75%</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-green-100 border border-green-200" />
            <span className="text-sm text-gray-600">75-99%</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-green-500 border border-green-600" />
            <span className="text-sm text-gray-600">100%</span>
          </div>
        </div>
      </div>

      {/* Selected day info */}
      {dailyData[selectedDate.toISOString().split('T')[0]] && (
        <div className="bg-white rounded-2xl p-6 border border-gray-100">
          <h3 className="text-lg font-medium mb-4">
            {format(selectedDate, 'EEEE, MMMM d, yyyy')}
          </h3>
          <div className="flex items-center gap-4">
            <div className="flex-1 p-4 bg-blue-50 rounded-xl">
              <div className="text-sm text-blue-700 mb-1">Habits Completed</div>
              <div className="text-2xl font-bold text-blue-900">
                {dailyData[selectedDate.toISOString().split('T')[0]].completedHabits.length} / {totalHabits}
              </div>
            </div>
            <div className="flex-1 p-4 bg-purple-50 rounded-xl">
              <div className="text-sm text-purple-700 mb-1">Completion Rate</div>
              <div className="text-2xl font-bold text-purple-900">
                {Math.round(getCompletionRate(selectedDate))}%
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
