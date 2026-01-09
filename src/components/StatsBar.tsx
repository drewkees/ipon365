import { PiggyBank, Calendar, TrendingUp } from "lucide-react";
import { useState } from "react";
import { CelebrationModal } from "./CelebrationModal";

interface DailyRoll {
  roll_date: string;
  roll_number: number;
}

interface StatsBarProps {
  rolls: DailyRoll[];
  totalDays: number;
}

export function StatsBar({ rolls, totalDays }: StatsBarProps) {
  const [showCelebration, setShowCelebration] = useState(false);
  
  const totalSavings = rolls.reduce((sum, roll) => sum + roll.roll_number, 0);
  const maxPossibleSavings = (365 * 366) / 2; // Sum of 1 to 365
  const percentage = (totalSavings / maxPossibleSavings) * 100;
  const filledDays = rolls.length;

  const formatPeso = (amount: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <>
      <div className="w-full max-w-md mx-auto bg-card rounded-2xl shadow-soft p-4">
        {/* Total Savings Display */}
        <div className="text-center mb-4">
          <div className="inline-flex items-center gap-2 mb-2">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
              <PiggyBank className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-display font-semibold text-foreground">Total Savings</span>
          </div>
          <p className="text-4xl font-display font-bold text-primary">
            {formatPeso(totalSavings)}
          </p>
        </div>
        
        {/* Progress bar */}
        <div className="h-3 bg-secondary rounded-full overflow-hidden mb-4">
          <div 
            className="h-full gradient-primary transition-all duration-500 ease-out rounded-full"
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>
        
        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setShowCelebration(true)}
            className="flex items-center gap-2 bg-secondary/50 rounded-xl p-3 hover:bg-secondary transition-all hover:scale-105 cursor-pointer active:scale-95"
          >
            <Calendar className="w-4 h-4 text-primary" />
            <div className="text-left">
              <p className="text-xs text-muted-foreground">Days Filled</p>
              <p className="font-display font-bold text-foreground">{filledDays} / {totalDays}</p>
            </div>
          </button>
          <div className="flex items-center gap-2 bg-secondary/50 rounded-xl p-3">
            <TrendingUp className="w-4 h-4 text-accent" />
            <div>
              <p className="text-xs text-muted-foreground">Max Possible</p>
              <p className="font-display font-bold text-foreground">{formatPeso(maxPossibleSavings)}</p>
            </div>
          </div>
        </div>
      </div>

      <CelebrationModal
        isOpen={showCelebration}
        onClose={() => setShowCelebration(false)}
        filledDays={filledDays}
        totalDays={totalDays}
        // totalSavings={totalSavings}
      />
    </>
  );
}