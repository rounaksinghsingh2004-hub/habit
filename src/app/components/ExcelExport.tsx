import { useState } from 'react';
import { Download, Calendar } from 'lucide-react';
import * as XLSX from 'xlsx';
import { format, eachDayOfInterval, parseISO } from 'date-fns';

interface Habit {
  id: string;
  name: string;
  category: string;
  streak: number;
}

interface DailyData {
  completedHabits: string[];
  mood: number | null;
  reflection: string;
}

interface ExcelExportProps {
  habits: Habit[];
  dailyData: Record<string, DailyData>;
}

export default function ExcelExport({ habits, dailyData }: ExcelExportProps) {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    if (!startDate || !endDate) {
      alert('Please select both start and end dates');
      return;
    }

    const start = parseISO(startDate);
    const end = parseISO(endDate);

    if (start > end) {
      alert('Start date must be before end date');
      return;
    }

    setIsExporting(true);

    try {
      // Generate date range
      const dateRange = eachDayOfInterval({ start, end });
      
      // Create header row with dates
      const headers = ['Habit Name', 'Category', 'Current Streak', ...dateRange.map(date => format(date, 'MMM dd, yyyy'))];
      
      // Create data rows for each habit
      const rows = habits.map(habit => {
        const row = [habit.name, habit.category, habit.streak];
        
        // Add completion status for each date
        dateRange.forEach(date => {
          const dateKey = format(date, 'yyyy-MM-dd');
          const dayData = dailyData[dateKey];
          const isCompleted = dayData?.completedHabits?.includes(habit.id);
          row.push(isCompleted ? '✓' : '');
        });
        
        return row;
      });

      // Add summary row
      const summaryRow = ['TOTAL COMPLETED', '', '', ...dateRange.map(date => {
        const dateKey = format(date, 'yyyy-MM-dd');
        const dayData = dailyData[dateKey];
        return dayData?.completedHabits?.length || 0;
      })];

      // Add mood row
      const moodRow = ['MOOD RATING', '', '', ...dateRange.map(date => {
        const dateKey = format(date, 'yyyy-MM-dd');
        const dayData = dailyData[dateKey];
        return dayData?.mood !== null && dayData?.mood !== undefined ? dayData.mood : '';
      })];

      // Combine all data
      const worksheetData = [headers, ...rows, [], summaryRow, moodRow];

      // Create workbook and worksheet
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.aoa_to_sheet(worksheetData);

      // Set column widths
      const colWidths = [
        { wch: 25 }, // Habit Name
        { wch: 12 }, // Category
        { wch: 15 }, // Current Streak
        ...dateRange.map(() => ({ wch: 12 })) // Dates
      ];
      ws['!cols'] = colWidths;

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(wb, ws, 'Habit Tracker');

      // Generate filename
      const filename = `habit-tracker-${format(start, 'yyyy-MM-dd')}-to-${format(end, 'yyyy-MM-dd')}.xlsx`;

      // Export file
      XLSX.writeFile(wb, filename);
    } catch (error) {
      console.error('Export error:', error);
      alert('Failed to export data. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  // Set default dates (last 30 days)
  const setDefaultDates = () => {
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);
    
    setEndDate(format(today, 'yyyy-MM-dd'));
    setStartDate(format(thirtyDaysAgo, 'yyyy-MM-dd'));
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center gap-3 mb-4">
        <Download className="text-blue-600 dark:text-blue-400" size={24} />
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Export to Excel</h2>
      </div>

      <p className="text-gray-600 dark:text-gray-400 mb-6">
        Download your habit tracking data as a formatted Excel spreadsheet. Select a date range to include in your export.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Start Date
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            End Date
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={setDefaultDates}
          className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
        >
          Last 30 Days
        </button>

        <button
          onClick={handleExport}
          disabled={isExporting || !startDate || !endDate}
          className="flex-1 flex items-center justify-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          <Download size={20} />
          {isExporting ? 'Exporting...' : 'Export Excel File'}
        </button>
      </div>

      <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
        <p className="text-sm text-blue-800 dark:text-blue-200">
          <strong>Excel file will include:</strong> Habit names, categories, current streaks, daily completion checkmarks, 
          total completed count per day, and mood ratings.
        </p>
      </div>
    </div>
  );
}
