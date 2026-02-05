import { useState } from "react"
import { cn } from "@/app/components/ui/utils"
import { PenLine, Sparkles, Send } from "lucide-react"

interface ReflectionBoxProps {
  onSubmit?: (reflection: string) => void
  className?: string
}

const prompts = [
  "One thing I learned today...",
  "I'm grateful for...",
  "Tomorrow I want to...",
  "Today I felt...",
  "One win I had today...",
]

export default function ReflectionBox({ onSubmit, className }: ReflectionBoxProps) {
  const [reflection, setReflection] = useState("")
  const [currentPromptIndex, setCurrentPromptIndex] = useState(0)
  const [isExpanded, setIsExpanded] = useState(false)

  const handleSubmit = () => {
    if (reflection.trim()) {
      onSubmit?.(reflection.trim())
      setReflection("")
    }
  }

  const changePrompt = () => {
    setCurrentPromptIndex((prev) => (prev + 1) % prompts.length)
  }

  const characterCount = reflection.length
  const maxCharacters = 280
  const progress = Math.min((characterCount / maxCharacters) * 100, 100)

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl bg-white border border-slate-200 shadow-sm transition-all duration-300",
        isExpanded && "shadow-lg",
        className
      )}
    >
      {/* Header */}
      <div
        className="p-4 border-b border-slate-100 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PenLine className="w-5 h-5 text-indigo-400" />
            <h3 className="font-semibold text-slate-800">Daily Reflection</h3>
          </div>
          <div
            className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center transition-transform duration-300",
              "bg-slate-100 text-slate-500",
              isExpanded && "rotate-180"
            )}
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path
                d="M3 4.5L6 7.5L9 4.5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="p-4 animate-fade-in">
          {/* Prompt */}
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span className="text-sm text-slate-500">
              {prompts[currentPromptIndex]}
            </span>
            <button
              onClick={changePrompt}
              className="text-xs text-indigo-500 hover:text-indigo-600 underline ml-auto"
            >
              New prompt
            </button>
          </div>

          {/* Text Input */}
          <textarea
            value={reflection}
            onChange={(e) => setReflection(e.target.value.slice(0, maxCharacters))}
            placeholder="Write your thoughts here..."
            className={cn(
              "w-full p-3 rounded-xl border border-slate-200",
              "focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400",
              "resize-none text-sm text-slate-700",
              "placeholder:text-slate-400"
            )}
            rows={4}
          />

          {/* Character Count */}
          <div className="flex items-center gap-2 mt-2">
            <div className="flex-1 h-1 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={cn(
                  "h-full transition-all duration-300",
                  progress < 80 ? "bg-indigo-400" : progress < 100 ? "bg-amber-400" : "bg-red-400"
                )}
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className={cn(
              "text-xs",
              progress < 80 ? "text-slate-400" : progress < 100 ? "text-amber-500" : "text-red-500"
            )}>
              {characterCount}/{maxCharacters}
            </span>
          </div>

          {/* Quick Inserts */}
          <div className="flex flex-wrap gap-1 mt-3">
            {["😊", "😔", "💪", "🙏", "🔥", "🤔", "⭐"].map((emoji) => (
              <button
                key={emoji}
                onClick={() => setReflection((prev) => prev + emoji)}
                className="w-7 h-7 rounded-lg bg-slate-50 hover:bg-indigo-50 flex items-center justify-center text-sm transition-colors"
              >
                {emoji}
              </button>
            ))}
          </div>

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={!reflection.trim()}
            className={cn(
              "w-full mt-3 py-2.5 rounded-xl flex items-center justify-center gap-2",
              "font-medium text-sm transition-all duration-200",
              reflection.trim()
                ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md hover:shadow-lg hover:scale-[1.02]"
                : "bg-slate-100 text-slate-400 cursor-not-allowed"
            )}
          >
            <Send className="w-4 h-4" />
            Save Reflection
          </button>
        </div>
      )}

      {/* Collapsed Preview */}
      {!isExpanded && reflection && (
        <div className="px-4 pb-3">
          <p className="text-sm text-slate-600 line-clamp-2">
            {reflection}
          </p>
          <div className="flex items-center gap-1 mt-1">
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span className="text-xs text-slate-400">
              {characterCount} characters
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
