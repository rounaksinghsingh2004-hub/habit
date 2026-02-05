import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import confetti from "canvas-confetti";
import Sidebar from "@/app/components/Sidebar";
import TopBar from "@/app/components/TopBar";
import MyDayView from "@/app/components/MyDayView";
import ImportantView from "@/app/components/ImportantView";
import PlannedView from "@/app/components/PlannedView";
import CalendarView from "@/app/components/CalendarView";
import InsightsPage from "@/app/components/InsightsPage";
import AddHabitDialog from "@/app/components/AddHabitDialog";
import AuthPage from "@/app/components/AuthPage";
import UserProfile from "@/app/components/UserProfile";
import BottomNav from "@/app/components/BottomNav";
import OfflineIndicator from "@/app/components/OfflineIndicator";
import LoadingSkeleton from "@/app/components/LoadingSkeleton";
import { ThemeProvider } from "@/app/components/ThemeProvider";
import { supabase } from "@/utils/supabase-client";
import { projectId, publicAnonKey } from "/utils/supabase/info";

interface Habit {
  id: string;
  name: string;
  category: "Health" | "Study" | "Mental" | "Lifestyle";
  time?: string;
  streak: number;
  completedDates: string[];
}

interface DailyData {
  completedHabits: string[];
  mood: number | null;
  reflection: string;
}

function AppWrapper() {
  return (
    <ThemeProvider>
      <App />
    </ThemeProvider>
  );
}

function App() {
  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(
    null,
  );
  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string>("");
  const [userName, setUserName] = useState<string>("");
  const [userCreatedAt, setUserCreatedAt] =
    useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  // App state
  const [activeView, setActiveView] = useState("my-day");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [habits, setHabits] = useState<Habit[]>([]);
  const [dailyData, setDailyData] = useState<
    Record<string, DailyData>
  >({});
  const [currentStreak, setCurrentStreak] = useState(0);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [hasShownConfetti, setHasShownConfetti] =
    useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [pendingActions, setPendingActions] = useState<any[]>(
    [],
  );

  // Check for existing session on mount
  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) {
        setAccessToken(session.access_token);
        setUserId(session.user.id);
        setUserEmail(session.user.email || "");
        setUserName(
          session.user.user_metadata?.name ||
            session.user.email?.split("@")[0] ||
            "User",
        );
        setUserCreatedAt(
          session.user.created_at || new Date().toISOString(),
        );
        setIsAuthenticated(true);
        await loadDataFromServer(session.access_token);
      } else {
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Session check error:", error);
      setIsLoading(false);
    }
  };

  // Load data from server
  const loadDataFromServer = async (
    token: string,
    retryCount = 0,
  ) => {
    try {
      const response = await fetch(
        `/api/load-data`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.ok) {
        const data = await response.json();
        setHabits(data.habits || []);
        setDailyData(data.dailyData || {});
        setCurrentStreak(data.currentStreak || 0);
      } else if (response.status === 401) {
        // Unauthorized, logout
        handleLogout();
      } else if (retryCount < 3) {
        // Retry on failure
        setTimeout(
          () => loadDataFromServer(token, retryCount + 1),
          1000 * (retryCount + 1),
        );
      }
    } catch (error) {
      console.error("Load data error:", error);
      if (retryCount < 3) {
        setTimeout(
          () => loadDataFromServer(token, retryCount + 1),
          1000 * (retryCount + 1),
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Save data to server (debounced)
  const saveDataToServer = async (retryCount = 0) => {
    if (!accessToken || isSyncing) return;

    setIsSyncing(true);
    try {
      const response = await fetch(
        `/api/save-data`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            habits,
            dailyData,
            currentStreak,
          }),
        },
      );

      if (!response.ok && retryCount < 3) {
        setTimeout(
          () => saveDataToServer(retryCount + 1),
          1000 * (retryCount + 1),
        );
      }
    } catch (error) {
      console.error("Save data error:", error);
      if (retryCount < 3) {
        setTimeout(
          () => saveDataToServer(retryCount + 1),
          1000 * (retryCount + 1),
        );
      }
    } finally {
      setIsSyncing(false);
    }
  };

  // Auto-save when data changes
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      const timer = setTimeout(() => {
        saveDataToServer();
      }, 1000); // Debounce for 1 second

      return () => clearTimeout(timer);
    }
  }, [
    habits,
    dailyData,
    currentStreak,
    isAuthenticated,
    isLoading,
  ]);

  // Handle online/offline events
  useEffect(() => {
    const handleOnline = () => {
      if (isAuthenticated && accessToken) {
        loadDataFromServer(accessToken);
      }
    };

    window.addEventListener("online", handleOnline);
    return () =>
      window.removeEventListener("online", handleOnline);
  }, [isAuthenticated, accessToken]);

  // Detect mobile
  useEffect(() => {
    const checkMobile = () =>
      setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () =>
      window.removeEventListener("resize", checkMobile);
  }, []);

  // Get current day's data
  const dateKey = selectedDate.toISOString().split("T")[0];
  const todayData = dailyData[dateKey] || {
    completedHabits: [],
    mood: null,
    reflection: "",
  };

  // Calculate completion rate
  const completedCount = todayData.completedHabits.length;
  const totalCount = habits.length;
  const completionRate =
    totalCount > 0
      ? Math.round((completedCount / totalCount) * 100)
      : 0;
  const isPerfectDay =
    completedCount === totalCount && totalCount > 0;

  // Show confetti on perfect day
  useEffect(() => {
    if (
      isPerfectDay &&
      !hasShownConfetti &&
      dateKey === new Date().toISOString().split("T")[0]
    ) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
      setHasShownConfetti(true);
    }
    if (!isPerfectDay) {
      setHasShownConfetti(false);
    }
  }, [isPerfectDay, hasShownConfetti, dateKey]);

  // Calculate streak
  useEffect(() => {
    const calculateStreak = () => {
      let streak = 0;
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      for (let i = 0; i < 365; i++) {
        const checkDate = new Date(today);
        checkDate.setDate(today.getDate() - i);
        const checkDateKey = checkDate
          .toISOString()
          .split("T")[0];
        const dayData = dailyData[checkDateKey];

        if (
          dayData &&
          dayData.completedHabits.length >=
            Math.max(1, totalCount * 0.7)
        ) {
          streak++;
        } else if (i === 0) {
          continue;
        } else {
          break;
        }
      }

      setCurrentStreak(streak);
    };

    calculateStreak();
  }, [dailyData, totalCount]);

  const toggleHabit = (habitId: string) => {
    const newCompletedHabits =
      todayData.completedHabits.includes(habitId)
        ? todayData.completedHabits.filter(
            (id) => id !== habitId,
          )
        : [...todayData.completedHabits, habitId];

    setDailyData({
      ...dailyData,
      [dateKey]: {
        ...todayData,
        completedHabits: newCompletedHabits,
      },
    });

    // Update habit streak
    setHabits(
      habits.map((habit) => {
        if (habit.id === habitId) {
          const completedDates = newCompletedHabits.includes(
            habitId,
          )
            ? [...new Set([...habit.completedDates, dateKey])]
            : habit.completedDates.filter((d) => d !== dateKey);

          return { ...habit, completedDates };
        }
        return habit;
      }),
    );
  };

  const updateMood = (mood: number) => {
    setDailyData({
      ...dailyData,
      [dateKey]: {
        ...todayData,
        mood,
      },
    });
  };

  const updateReflection = (reflection: string) => {
    setDailyData({
      ...dailyData,
      [dateKey]: {
        ...todayData,
        reflection,
      },
    });
  };

  const addHabit = ({
    name,
    category,
    time,
  }: {
    name: string;
    category: string;
    time: string;
  }) => {
    const newHabit: Habit = {
      id: Date.now().toString(),
      name,
      category: category as Habit["category"],
      time,
      streak: 0,
      completedDates: [],
    };
    setHabits([...habits, newHabit]);
  };

  const deleteHabit = (habitId: string) => {
    setHabits(habits.filter((h) => h.id !== habitId));

    // Remove from all daily data
    const updatedDailyData = { ...dailyData };
    Object.keys(updatedDailyData).forEach((dateKey) => {
      updatedDailyData[dateKey] = {
        ...updatedDailyData[dateKey],
        completedHabits: updatedDailyData[
          dateKey
        ].completedHabits.filter((id) => id !== habitId),
      };
    });
    setDailyData(updatedDailyData);
  };

  const editHabit = (
    habitId: string,
    updates: Partial<Habit>,
  ) => {
    setHabits(
      habits.map((h) =>
        h.id === habitId ? { ...h, ...updates } : h,
      ),
    );
  };

  const handleAuthSuccess = (token: string, uid: string) => {
    setAccessToken(token);
    setUserId(uid);
    setIsAuthenticated(true);
    checkSession();
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsAuthenticated(false);
    setAccessToken(null);
    setUserId(null);
    setUserName("");
    setUserEmail("");
    setHabits([]);
    setDailyData({});
    setCurrentStreak(0);
    setActiveView("my-day");
  };

  // Calculate insights
  const calculateInsights = () => {
    const last7Days = [];
    const today = new Date();

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const key = date.toISOString().split("T")[0];
      last7Days.push(
        dailyData[key]?.completedHabits?.length || 0,
      );
    }

    const weeklyAverage =
      last7Days.reduce((a, b) => a + b, 0) / 7;
    const bestStreak = currentStreak;
    const totalDaysTracked = Object.keys(dailyData).length;

    return { weeklyAverage, bestStreak, totalDaysTracked };
  };

  const insights = calculateInsights();

  const renderMainContent = () => {
    switch (activeView) {
      case "my-day":
        return (
          <MyDayView
            habits={habits}
            completedHabits={todayData.completedHabits}
            onToggle={toggleHabit}
            mood={todayData.mood}
            onMoodSelect={updateMood}
            reflection={todayData.reflection}
            onReflectionChange={updateReflection}
            onAddHabit={() => setIsAddDialogOpen(true)}
            insights={insights}
            isPerfectDay={isPerfectDay}
          />
        );

      case "important":
        return (
          <ImportantView
            habits={habits}
            completedHabits={todayData.completedHabits}
            onToggle={toggleHabit}
            onAddHabit={() => setIsAddDialogOpen(true)}
          />
        );

      case "planned":
        return (
          <PlannedView
            habits={habits}
            completedHabits={todayData.completedHabits}
            onToggle={toggleHabit}
            onAddHabit={() => setIsAddDialogOpen(true)}
          />
        );

      case "calendar":
        return (
          <CalendarView
            selectedDate={selectedDate}
            onDateSelect={setSelectedDate}
            dailyData={dailyData}
            totalHabits={totalCount}
          />
        );

      case "insights":
        return (
          <InsightsPage dailyData={dailyData} habits={habits} />
        );

      case "profile":
        return (
          <UserProfile
            userName={userName}
            userEmail={userEmail}
            createdAt={userCreatedAt}
            onLogout={handleLogout}
            totalHabits={totalCount}
            totalDaysTracked={Object.keys(dailyData).length}
            currentStreak={currentStreak}
          />
        );

      default:
        return (
          <MyDayView
            habits={habits}
            completedHabits={todayData.completedHabits}
            onToggle={toggleHabit}
            mood={todayData.mood}
            onMoodSelect={updateMood}
            reflection={todayData.reflection}
            onReflectionChange={updateReflection}
            onAddHabit={() => setIsAddDialogOpen(true)}
            insights={insights}
            isPerfectDay={isPerfectDay}
          />
        );
    }
  };

  // Show auth page if not authenticated
  if (!isAuthenticated) {
    return <AuthPage onAuthSuccess={handleAuthSuccess} />;
  }

  // Show loading screen
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <LoadingSkeleton />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <OfflineIndicator />

      <div className="flex h-screen">
        {!isMobile && (
          <Sidebar
            activeView={activeView}
            onViewChange={setActiveView}
          />
        )}

        <div className="flex-1 flex flex-col overflow-hidden">
          <TopBar
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
            streak={currentStreak}
            completionRate={completionRate}
            onLogout={handleLogout}
            userName={userName}
          />

          <main
            className={`flex-1 overflow-y-auto p-6 ${isMobile ? "pb-24" : ""}`}
          >
            <div className="max-w-7xl mx-auto">
              {renderMainContent()}
            </div>
          </main>
        </div>
      </div>

      {isMobile && (
        <>
          <BottomNav
            activeView={activeView}
            onViewChange={setActiveView}
          />
          {activeView !== "profile" && (
            <button
              onClick={() => setIsAddDialogOpen(true)}
              className="fixed bottom-20 right-6 w-14 h-14 bg-blue-600 dark:bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-all flex items-center justify-center z-40"
              aria-label="Add new habit"
            >
              <Plus size={24} />
            </button>
          )}
        </>
      )}

      <AddHabitDialog
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        onAdd={addHabit}
      />

      {/* Sync indicator */}
      {isSyncing && (
        <div className="fixed bottom-6 left-6 bg-white dark:bg-gray-800 px-4 py-2 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 flex items-center gap-2 z-50">
          <div className="w-4 h-4 border-2 border-blue-600 dark:border-blue-400 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-gray-600 dark:text-gray-300">
            Syncing...
          </span>
        </div>
      )}
    </div>
  );
}

export default AppWrapper;