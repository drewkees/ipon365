import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import Ipon365Auth from "@/components/auth/Ipon365Auth";
import { Calendar } from "@/components/Calendar";
import { RollModal } from "@/components/RollModal";
import { StatsBar } from "@/components/StatsBar";
import { useDailyRolls } from "@/hooks/useDailyRolls";
import { PiggyBank, Loader2, LogOut } from "lucide-react";

const Index = () => {
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false); // important
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { rolls, isLoading, rollNumber, getRollForDate, getAvailableNumbers } = useDailyRolls();

  // --- Check authentication and subscribe to auth changes ---
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      setAuthChecked(true);
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setAuthChecked(true); // make sure authChecked is set on auth changes too
    });

    return () => subscription.unsubscribe();
  }, []);

  // --- Logout ---
  const handleSignOut = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setUser(null);
        return;
      }
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setIsModalOpen(true);
  };

  const handleRoll = async (): Promise<number | null> => {
    if (!selectedDate) return null;
    return await rollNumber(selectedDate);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedDate(null);
  };

  const existingNumber = selectedDate ? getRollForDate(selectedDate) : null;
  const availableCount = getAvailableNumbers().length;

  // --- Guard render until authChecked ---
  if (!authChecked) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Ipon365Auth />;
  }

  // --- Loading rolls ---
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-primary animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground font-medium">Loading savings...</p>
        </div>
      </div>
    );
  }

  // --- Main content ---
  return (
    <div className="min-h-screen bg-background">
      <header className="pt-8 pb-6 px-4">
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl gradient-primary shadow-glow">
                <PiggyBank className="w-7 h-7 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-3xl font-display font-bold text-foreground">
                  Ipon365
                </h1>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              className="p-2 rounded-lg hover:bg-secondary transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
          <p className="text-muted-foreground text-center">
            Tap a date to roll your daily savings
          </p>
        </div>
      </header>

      <main className="px-4 pb-8 space-y-6">
        <StatsBar rolls={rolls} totalDays={365} />
        <div className="bg-card rounded-2xl shadow-soft p-4">
          <Calendar rolls={rolls} onDateSelect={handleDateSelect} selectedDate={selectedDate} />
        </div>
      </main>

      <RollModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        selectedDate={selectedDate}
        existingNumber={existingNumber}
        onRoll={handleRoll}
        availableCount={availableCount}
        isLoading={isLoading}
      />
    </div>
  );
};

export default Index;
