export default function LoadingSkeleton() {
  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6 animate-pulse">
      {/* Top stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-gray-200 dark:bg-gray-700 rounded-2xl h-32"></div>
        ))}
      </div>

      {/* Progress card */}
      <div className="bg-gray-200 dark:bg-gray-700 rounded-2xl h-64"></div>

      {/* Habits list */}
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="bg-gray-200 dark:bg-gray-700 rounded-xl h-20"></div>
        ))}
      </div>

      {/* Mood tracker */}
      <div className="bg-gray-200 dark:bg-gray-700 rounded-2xl h-32"></div>
    </div>
  );
}
