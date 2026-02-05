import { useState } from "react"
import { cn } from "@/app/components/ui/utils"
import { Check, Flame, Clock, Sparkles } from "lucide-react"

// Category types
type Category = "health" | "study" | "mental" | "lifestyle"

interface HabitCardProps {
  name: string
  category: Category
  completed: boolean
  streak: number
  timeHint?: string
  onToggle: () => void
  className?: string
}

// Category icons and colors
const categoryConfig: Record<Category, { icon: string; color: string; bgColor: string; shadow: string }> = {
  health: { icon: "💪", color: "#22c55e", bgColor: "#dcfce7", shadow: "0 4px 12px rgba(34, 197, 94, 0.25)" },
  study: { icon: "📚", color: "#3b82f6", bgColor: "#dbeafe", shadow: "0 4px 12px rgba(59, 130, 246, 0.25)" },
  mental: { icon: "🧠", color: "#a855f7", bgColor: "#ede9fe", shadow: "0 4px 12px rgba(168, 85, 247, 0.25)" },
  lifestyle: { icon: "🌟", color: "#f97316", bgColor: "#ffedd5", shadow: "0 4px 12px rgba(249, 115, 22, 0.25)" },
}

export default function HabitCard({
  name,
  category,
  completed,
  streak,
  timeHint,
  onToggle,
  className,
}: HabitCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [showSparkles, setShowSparkles] = useState(false)

  const config = categoryConfig[category]

  const handleToggle = () => {
    if (!completed) {
      setShowSparkles(true)
      setTimeout(() => setShowSparkles(false), 1000)
    }
    onToggle()
  }

  return (
    <div
      className={cn(
        "relative group overflow-hidden rounded-xl transition-all duration-300",
        "bg-white border border-slate-200",
        completed ? "opacity-75" : "hover:shadow-lg hover:-translate-y-0.5",
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleToggle}
    >
      {/* Category Indicator Bar */}
      <div
        className="absolute left-0 top-0 bottom-0 w-1.5"
        style={{
          background: `linear-gradient(180deg, ${config.color} 0%, ${config.color}80 100%)`,
        }}
      />

      {/* Sparkle Animation */}
      {showSparkles && !completed && (
        <div className="absolute inset-0 pointer-events-none">
          <Sparkles className="absolute top-2 right-16 w-4 h-4 text-yellow-400 animate-pulse" />
          <Sparkles className="absolute top-6 right-20 w-3 h-3 text-yellow-300 animate-pulse" style={{ animationDelay: "100ms" }} />
          <Sparkles className="absolute top-3 right-24 w-2 h-2 text-yellow-200 animate-pulse" style={{ animationDelay: "200ms" }} />
        </div>
      )}

      <div className="pl-4 pr-3 py-3 flex items-center gap-3">
        {/* Animated Checkbox */}
        <div className="relative flex-shrink-0">
          <div
            className={cn(
              "w-6 h-6 rounded-full border-2 transition-all duration-300",
              completed
                ? "bg-gradient-to-br from-green-400 to-green-500 border-green-400 shadow-sm"
                : "border-slate-300 bg-white group-hover:border-slate-400"
            )}
            style={{ boxShadow: completed ? config.shadow : "none" }}
          >
            {completed && (
              <Check className="w-3.5 h-3.5 text-white absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
            )}
          </div>
        </div>

        {/* Habit Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span
              className="text-lg flex-shrink-0"
              role="img"
              aria-label={category}
            >
              {config.icon}
            </span>
            <span
              className={cn(
                "font-medium text-slate-800 truncate transition-all duration-200",
                completed && "line-through text-slate-400"
              )}
            >
              {name}
            </span>
          </div>
        </div>

        {/* Right Side - Streak & Time */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {timeHint && (
            <span className="flex items-center gap-1 text-xs text-slate-400 bg-slate-50 px-2 py-1 rounded-full">
              <Clock className="w-3 h-3" />
              {timeHint}
            </span>
          )}

          {streak > 0 && (
            <span
              className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold"
              style={{
                background: "linear-gradient(135deg, #f97316 0%, #fb923c 100%)",
                color: "white",
                boxShadow: "0 2px 8px rgba(249, 115, 22, 0.3)",
              }}
            >
              <Flame className="w-3 h-3" />
              {streak}
            </span>
          )}

          {/* Category Tag */}
          <span
            className="px-2 py-1 rounded-full text-xs font-medium capitalize"
            style={{
              backgroundColor: config.bgColor,
              color: config.color,
            }}
          >
            {category}
          </span>
        </div>
      </div>

      {/* Progress Line */}
      <div className="absolute bottom-0 left-0 h-0.5 bg-slate-100">
        <div
          className={cn(
            "h-full transition-all duration-500 ease-out",
            completed ? "w-full" : "w-0"
          )}
          style={{
            background: `linear-gradient(90deg, ${config.color} 0%, ${config.color}80 100%)`,
          }}
        />
      </div>

      {/* Completion Celebration */}
      {completed && (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-end pr-3">
          <div className="animate-bounce">
            <span className="text-lg">🎉</span>
          </div>
        </div>
      )}
    </div>
  )
}
