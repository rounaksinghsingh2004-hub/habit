import { Calendar, CheckCircle2, Flame, ListTodo, User, Star, TrendingUp } from 'lucide-react';
import { cn } from '@/app/components/ui/utils';

interface SidebarProps {
  activeView: string;
  onViewChange: (view: string) => void;
  isMobile?: boolean;
}

export default function Sidebar({ activeView, onViewChange, isMobile = false }: SidebarProps) {
  const menuItems = [
    { id: 'my-day', label: 'My Day', icon: CheckCircle2 },
    { id: 'important', label: 'Important', icon: Star },
    { id: 'planned', label: 'Planned', icon: ListTodo },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    { id: 'insights', label: 'Insights', icon: TrendingUp },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  if (isMobile) {
    return (
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
        <div className="flex justify-around items-center px-2 py-3">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                className={cn(
                  "flex flex-col items-center gap-1 px-3 py-1 rounded-lg transition-all",
                  activeView === item.id
                    ? "text-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                )}
              >
                <Icon size={20} />
                <span className="text-xs">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col h-screen transition-colors">
      <div className="p-6 border-b border-gray-100 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <Flame className="text-orange-500" size={28} />
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Habit Tracker</h1>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all",
                activeView === item.id
                  ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50"
              )}
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
