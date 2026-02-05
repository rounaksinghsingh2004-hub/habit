import { useState } from "react"
import { cn } from "@/app/components/ui/utils"
import { Sparkles } from "lucide-react"

// Mood types
type Mood = "amazing" | "good" | "okay" | "bad" | "terrible"

interface MoodOption {
  emoji: string
  label: string
  color: string
  bgColor: string
  shadow: string
}

const moodOptions: Record<Mood, MoodOption> = {
  amazing: {
    emoji: "😄",
    label: "Amazing",
    color: "#22c55e",
    bgColor: "#dcfce7",
    shadow: "0 4px 12px rgba(34, 197, 94, 0.25)",
  },
  good: {
    emoji: "🙂",
    label: "Good",
    color: "#3b82f6",
    bgColor: "#dbeafe",
    shadow: "0 4px 12px rgba(59, 130, 246, 0.25)",
  },
  okay: {
    emoji: "😐",
    label: "Okay",
    color: "#eab308",
    bgColor: "#fef9c3",
    shadow: "0 4px 12px rgba(234, 179, 8, 0.25)",
  },
  bad: {
    emoji: "😞",
    label: "Bad",
    color: "#f97316",
    bgColor: "#ffedd5",
    shadow: "0 4px 12px rgba(249, 115, 22, 0.25)",
  },
  terrible: {
    emoji: "😫",
    label: "Tough Day",
    color: "#ef4444",
    bgColor: "#fee2e2",
    shadow: "0 4px 12px rgba(239, 68, 68, 0.25)",
  },
}

interface MoodTrackerProps {
  onMoodSelect?: (mood: Mood) => void
  className?: string
}

export default function MoodTracker({ onMoodSelect, className }: MoodTrackerProps) {
  const [selectedMood, setSelectedMood] = useState<Mood | null>(null)
  const [hoveredMood, setHoveredMood] = useState<Mood | null>(null)

  const handleMoodSelect = (mood: Mood) => {
    setSelectedMood(mood)
    onMoodSelect?.(mood)
  }

  const currentMood = selectedMood ? moodOptions[selectedMood] : null

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl bg-white border border-slate-200 shadow-sm",
        className
      )}
    >
      {/* Header */}
      <div className="p-5 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-400" />
          <h3 className="font-semibold text-slate-800">How was today?</h3>
        </div>
        <p className="text-sm text-slate-500 mt-1">
          Take a moment to reflect on your day
        </p>
      </div>

      {/* Mood Selection */}
      <div className="p-5">
        <div className="flex justify-between gap-2">
          {(Object.keys(moodOptions) as Mood[]).map((mood) => {
            const option = moodOptions[mood]
            const isSelected = selectedMood === mood
            const isHovered = hoveredMood === mood

            return (
              <button
                key={mood}
                onClick={() => handleMoodSelect(mood)}
                onMouseEnter={() => setHoveredMood(mood)}
                onMouseLeave={() => setHoveredMood(null)}
                className={cn(
                  "flex flex-col items-center gap-1.5 p-2 rounded-xl transition-all duration-300",
                  "hover:scale-110 hover:shadow-md",
                  isSelected && "ring-2 ring-offset-2"
                )}
                style={{
                  backgroundColor: isSelected || isHovered ? option.bgColor : "transparent",
                  boxShadow: isSelected ? option.shadow : "none",
                }}
              >
                <span
                  className={cn(
                    "text-2xl transition-all duration-300",
                    isSelected && "scale-125",
                    isHovered && !isSelected && "scale-110"
                  )}
                >
                  {option.emoji}
                </span>
                <span
                  className={cn(
                    "text-xs font-medium transition-all duration-200",
                    isSelected ? "text-slate-800" : "text-slate-400",
                    isHovered && !isSelected && "text-slate-600"
                  )}
                >
                  {option.label}
                </span>
              </button>
            )
          })}
        </div>

        {/* Selected Mood Message */}
        {currentMood && (
          <div
            className={cn(
              "mt-4 p-3 rounded-xl flex items-center gap-2 animate-fade-in",
              "bg-gradient-to-r from-slate-50 to-slate-100"
            )}
            style={{
              borderLeft: `3px solid ${currentMood.color}`,
            }}
          >
            <span className="text-xl">{currentMood.emoji}</span>
            <span className="text-sm text-slate-600">
              Feeling <strong>{currentMood.label.toLowerCase()}</strong> today!
            </span>
          </div>
        )}

        {/* Dynamic Insights Based on Mood */}
        {selectedMood && (
          <div className="mt-4 p-3 rounded-xl bg-slate-50 animate-fade-in">
            <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Insight</p>
            <p className="text-sm text-slate-700">
              {selectedMood === "amazing" && "🌟 Amazing day! Your habits are really paying off. Keep this energy going!"}
              {selectedMood === "good" && "💪 Good work! Small consistent steps lead to big results."}
              {selectedMood === "okay" && "😊 Every day is a new opportunity. Tomorrow is another chance!"}
              {selectedMood === "bad" && "🤗 It's okay to have tough days. Be kind to yourself and try again tomorrow."}
              {selectedMood === "terrible" && "💙 Tomorrow is a fresh start. Rest and come back stronger!"}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
