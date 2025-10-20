import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { SyncProfile } from "@/components/auth/sync-profile";
import { WelcomeCard } from "@/components/dashboard/welcome-card";
import { LogMealCard } from "@/components/dashboard/log-meal-card";
import { TodaysTipCard } from "@/components/dashboard/todays-tip-card";
import { ProgressSnapshot } from "@/components/dashboard/progress-snapshot";
import { AskCoachButton } from "@/components/dashboard/ask-coach-button";
import { getUserHealthGoal, getUserHealthProfile } from "@/lib/services/dashboard-data";
import { generateNutritionTip } from "@/lib/services/openrouter";

export default async function DashboardPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const user = await currentUser();

  // Check if user has completed onboarding
  const healthGoal = await getUserHealthGoal(userId);
  if (!healthGoal) {
    redirect("/onboarding");
  }

  // Fetch remaining user data from Supabase
  const healthProfile = await getUserHealthProfile(userId);

  // Generate initial nutrition tip (no try/catch needed as function returns fallback on error)
  const initialTip = await generateNutritionTip(healthGoal.goal_type) ||
    "Start your day with a balanced breakfast including protein, healthy fats, and complex carbs.";

  // Get user's first name with fallback
  const firstName = user?.firstName || healthProfile?.full_name?.split(" ")[0] || "there";
  const goalType = healthGoal.goal_type;

  return (
    <div className="space-y-4 sm:space-y-6 pb-24 sm:pb-6">
      <SyncProfile />

      {/* Main Dashboard Grid - 5 column layout on desktop, stacked on mobile */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 sm:gap-6">
        {/* Row 1: Welcome Card (60% = 3 cols) */}
        <div className="lg:col-span-3">
          <WelcomeCard firstName={firstName} healthGoal={goalType} />
        </div>

        {/* Row 1-2: Today's Tip Card (40% = 2 cols, spans 2 rows) */}
        <div className="lg:col-span-2 lg:row-span-2">
          <TodaysTipCard initialTip={initialTip} healthGoal={goalType} />
        </div>

        {/* Row 2: Log Meal Card (60% = 3 cols) */}
        <div className="lg:col-span-3">
          <LogMealCard />
        </div>

        {/* Row 3: Progress Snapshot (full width = 5 cols) */}
        <div className="lg:col-span-5">
          <ProgressSnapshot isNewUser={false} />
        </div>
      </div>

      {/* Floating Ask Coach Button */}
      <AskCoachButton />
    </div>
  );
}
