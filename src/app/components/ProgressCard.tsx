import { useEffect, useRef } from "react"
import { cn } from "@/app/components/ui/utils"
import { Flame, Star, Trophy, Sparkles } from "lucide-react"

interface ProgressCardProps {
  completed: number
  total: number
  streak: number
  className?: string
}

export default function ProgressCard({
  completed,
  total,
  streak,
  className,
}: ProgressCardProps) {
  const progress = total > 0 ? Math.round((completed / total) * 100) : 0
  const circumference = 2 * Math.PI * 40
  const strokeDashoffset = circumference - (progress / 100) * circumference

  const isPerfect = completed === total && total > 0
  const isAlmost = progress >= 70 && progress < 100

  // Celebration confetti effect
  useEffect(() => {
    if (isPerfect) {
      const colors = ["#22c55e", "#3b82f6", "#a855f7", "#f97316", "#f472b6"]
      const confettiCount = 50
      const confettiElements: HTMLDivElement[] = []

      for (let i = 0; i < confettiCount; i++) {
        const confetti = document.createElement("div")
        confetti.style.position = "fixed"
        confetti.style.left = Math.random() * 100 + "%"
        confetti.style.top = "-10px"
        confetti.style.width = Math.random() * 10 + 5 + "px"
        confetti.style.height = confetti.style.width
        confetti.style.background = colors[Math.floor(Math.random() * colors.length)]
        confetti.style.borderRadius = Math.random() > 0.5 ? "50%" : "0"
        confetti.style.transform = `rotate(${Math.random() * 360}deg)`
        confetti.style.zIndex = "9999"
        confetti.style.pointerEvents = "none"
        confetti.style.animation = `confetti ${Math.random() * 2 + 1}s linear forwards`
        document.body.appendChild(confetti)
        confettiElements.push(confetti)
      }

      const timeout = setTimeout(() => {
        confettiElements.forEach((el) => el.remove())
      }, 3000)

      return () => {
        clearTimeout(timeout)
        confettiElements.forEach((el) => el.remove())
      }
    }
  }, [isPerfect])

  const getMotivationalMessage = () => {
    if (isPerfect) return "Perfect Day! 🎉"
    if (progress === 0) return "Ready to start? Let's go! ✨"
    if (progress < 25) return "Great start! Keep it up! 🚀"
    if (progress < 50) return "You're in the flow! 💪"
    if (progress < 75) return "Almost there! Keep going! 🔥"
    if (isAlmost) return "So close! Final push! 🎯"
    return "Amazing work today! 🌟"
  }

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl bg-white border border-slate-200 shadow-sm",
        "transition-all duration-500",
        isPerfect && "ring-2 ring-green-400 ring-offset-2",
        className
      )}
    >
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 to-slate-100" />

      {/* Floating Stars for Perfect Day */}
      {isPerfect && (
        <>
          <div className="absolute top-2 right-8 animate-bounce">
            <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
          </div>
          <div className="absolute top-4 right-16 animate-bounce" style={{ animationDelay: "100ms" }}>
            <Sparkles className="w-4 h-4 text-yellow-300" />
          </div>
          <div className="absolute top-3 right-24 animate-bounce" style={{ animationDelay: "200ms" }}>
            <Trophy className="w-4 h-4 text-amber-400" />
          </div>
        </>
      )}

      <div className="relative p-5 flex items-center gap-5">
        {/* Circular Progress */}
        <div className="relative flex-shrink-0">
          <svg
            className="w-28 h-28 transform -rotate-90"
            viewBox="0 0 100 100"
          >
            {/* Background Circle */}
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke="#e2e8f0"
              strokeWidth="8"
            />
            {/* Progress Circle */}
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke="url(#progressGradient)"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-700 ease-out"
              style={{
                filter: progress > 0 ? "drop-shadow(0 0 6px rgba(99, 102, 241, 0.4))" : "none",
              }}
            />
            {/* Gradient Definition */}
            <defs>
              <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#6366f1" />
                <stop offset="50%" stopColor="#8b5cf6" />
                <stop offset="100%" stopColor="#a855f7" />
              </linearGradient>
            </defs>
          </svg>

          {/* Center Text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold text-slate-800">{completed}</span>
            <span className="text-xs text-slate-400">/ {total}</span>
          </div>
        </div>

        {/* Stats & Message */}
        <div className="flex-1">
          {/* Motivational Message */}
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className={cn(
              "w-4 h-4",
              isPerfect ? "text-green-500" : "text-indigo-400"
            )} />
            <span className={cn(
              "font-medium",
              isPerfect ? "text-green-600" : "text-slate-700"
            )}>
              {getMotivationalMessage()}
            </span>
          </div>

          {/* Progress Text */}
          <p className="text-sm text-slate-500 mb-3">
            {progress}% of your habits completed today
          </p>

          {/* Stats Row */}
          <div className="flex items-center gap-4">
            {/* Streak Badge */}
            {streak > 0 && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-100">
                <Flame className="w-4 h-4 text-orange-500" />
                <span className="text-sm font-semibold text-orange-600">{streak} day streak</span>
              </div>
            )}

            {/* Completion Badge */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-100">
              <Trophy className="w-4 h-4 text-indigo-500" />
              <span className="text-sm font-medium text-indigo-600">
                {total - completed} remaining
              </span>
            </div>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="hidden sm:block">
          <div className={cn(
            "w-16 h-16 rounded-full flex items-center justify-center text-2xl",
            "bg-gradient-to-br from-indigo-100 to-purple-100",
            "transition-transform duration-300 hover:scale-110"
          )}>
            {isPerfect ? "🎉" : progress >= 75 ? "🔥" : progress >= 50 ? "💪" : "✨"}
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="h-1 bg-slate-100">
        <div
          className={cn(
            "h-full transition-all duration-700 ease-out",
            "bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400"
          )}
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Confetti Animation Styles */}
      <style>{`
        @keyframes confetti {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  )
}
