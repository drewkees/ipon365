import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import Ipon365Auth from "@/components/auth/Ipon365Auth";
import { Calendar } from "@/components/Calendar";
import { RollModal } from "@/components/RollModal";
import { StatsBar } from "@/components/StatsBar";
import { useDailyRolls } from "@/hooks/useDailyRolls";
import { PiggyBank, Loader2, LogOut , Plus} from "lucide-react";
import AdBanner from "@/components/AdBanner";

const Index = () => {
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [rollMode, setRollMode] = useState<"normal" | "low" | "challenge">("normal");
  const hasAd = false;
  const { rolls, isLoading, rollNumber, getRollForDate, getAvailableNumbers } = useDailyRolls();

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      setAuthChecked(true);
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setAuthChecked(true);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { setUser(null); return; }
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
    } catch (err) { console.error("Logout failed:", err); }
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setIsModalOpen(true);
  };

  const handleRoll = async (): Promise<number | null> => {
    if (!selectedDate) return null;
    return await rollNumber(selectedDate, rollMode);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedDate(null);
    setRollMode("normal");
  };

  const existingNumber = selectedDate ? getRollForDate(selectedDate) : null;
  const availableCount = getAvailableNumbers().length;

  if (!authChecked) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    );
  }

  if (!user) return <Ipon365Auth />;
  if (isLoading) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-10 h-10 text-primary animate-spin mx-auto mb-4" />
        <p className="text-muted-foreground font-medium">Loading savings...</p>
      </div>
    </div>
  );

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
                <h1 className="text-3xl font-display font-bold text-foreground">Ipon365</h1>
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
         <AdBanner /> 
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
        rollMode={rollMode}
        setRollMode={setRollMode} // pass mode setter to modal
      />

       <button
        onClick={() => {
          // Add your new feature handler here
          alert('New feature coming soon!');
        }}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full gradient-primary shadow-glow hover:shadow-glow-lg transition-all duration-300 flex items-center justify-center group hover:scale-110"
        title="New Feature"
      >
        <Plus className="w-6 h-6 text-primary-foreground group-hover:rotate-90 transition-transform duration-300" />
      </button>
    </div>
  );
};

export default Index;
