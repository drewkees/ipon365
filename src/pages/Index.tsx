import { useState } from "react";
import { Calendar } from "@/components/Calendar";
import { RollModal } from "@/components/RollModal";
import { StatsBar } from "@/components/StatsBar";
import { useDailyRolls } from "@/hooks/useDailyRolls";
import { Dices, Loader2 } from "lucide-react";

const Index = () => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const { 
    rolls, 
    isLoading, 
    rollNumber, 
    getRollForDate,
    getAvailableNumbers 
  } = useDailyRolls();

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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-primary animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground font-medium">Loading calendar...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="pt-8 pb-6 px-4">
        <div className="max-w-md mx-auto text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl gradient-primary shadow-glow mb-4">
            <Dices className="w-7 h-7 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-display font-bold text-foreground mb-2">
            Daily Roll
          </h1>
          <p className="text-muted-foreground">
            Tap a date to roll your lucky number
          </p>
        </div>
      </header>

      {/* Main content */}
      <main className="px-4 pb-8 space-y-6">
        {/* Stats */}
        <StatsBar usedCount={rolls.length} totalCount={365} />

        {/* Calendar */}
        <div className="bg-card rounded-2xl shadow-soft p-4">
          <Calendar 
            rolls={rolls} 
            onDateSelect={handleDateSelect}
            selectedDate={selectedDate}
          />
        </div>
      </main>

      {/* Roll Modal */}
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
