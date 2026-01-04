import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Dices, X, Sparkles, PiggyBank } from "lucide-react";
import { cn } from "@/lib/utils";

interface RollModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: Date | null;
  existingNumber: number | null;
  onRoll: () => Promise<number | null>;
  availableCount: number;
  isLoading: boolean;
}

const formatPeso = (amount: number) => {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export function RollModal({ 
  isOpen, 
  onClose, 
  selectedDate, 
  existingNumber,
  onRoll,
  availableCount,
  isLoading
}: RollModalProps) {
  const [rolledNumber, setRolledNumber] = useState<number | null>(null);
  const [isRolling, setIsRolling] = useState(false);
  const [showResult, setShowResult] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setRolledNumber(null);
      setIsRolling(false);
      setShowResult(false);
    }
  }, [isOpen]);

  if (!isOpen || !selectedDate) return null;

  const handleRoll = async () => {
    setIsRolling(true);
    setShowResult(false);
    
    // Simulate spinning delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const result = await onRoll();
    setRolledNumber(result);
    setIsRolling(false);
    
    if (result !== null) {
      setTimeout(() => setShowResult(true), 100);
    }
  };

  const displayNumber = existingNumber ?? rolledNumber;
  const hasNumber = displayNumber !== null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-foreground/20 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-sm mx-4 mb-4 sm:mb-0 bg-card rounded-2xl shadow-soft overflow-hidden animate-scale-in">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-secondary transition-colors z-10"
        >
          <X className="w-5 h-5 text-muted-foreground" />
        </button>

        <div className="p-6 pt-8">
          {/* Date display */}
          <div className="text-center mb-6">
            <p className="text-sm text-muted-foreground mb-1">Selected Date</p>
            <h3 className="text-2xl font-display font-bold text-foreground">
              {format(selectedDate, "MMMM d, yyyy")}
            </h3>
          </div>

          {/* Number display area */}
          <div className={cn(
            "relative mx-auto w-40 h-40 rounded-2xl flex flex-col items-center justify-center mb-6 transition-all duration-500",
            hasNumber ? "gradient-primary shadow-glow" : "bg-secondary",
            isRolling && "animate-pulse-glow"
          )}>
            {isRolling ? (
              <Dices className="w-16 h-16 text-primary animate-spin-slow" />
            ) : hasNumber ? (
              <div className={cn(
                "text-center",
                showResult || existingNumber ? "animate-roll-number" : ""
              )}>
                <span className="text-3xl font-display font-bold text-primary-foreground">
                  {formatPeso(displayNumber)}
                </span>
              </div>
            ) : (
              <span className="text-4xl font-display font-bold text-muted-foreground">?</span>
            )}
            
            {/* Sparkle decoration */}
            {hasNumber && !isRolling && (
              <>
                <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-accent animate-bounce-in" style={{ animationDelay: '0.2s' }} />
                <Sparkles className="absolute -bottom-2 -left-2 w-5 h-5 text-accent animate-bounce-in" style={{ animationDelay: '0.4s' }} />
              </>
            )}
          </div>

          {/* Actions */}
          {existingNumber !== null ? (
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                You already saved {formatPeso(existingNumber)} this day!
              </p>
            </div>
          ) : rolledNumber !== null ? (
            <div className="text-center space-y-3">
              <p className="text-success font-medium flex items-center justify-center gap-2">
                <PiggyBank className="w-4 h-4" />
                Savings recorded!
              </p>
              <button
                onClick={onClose}
                className="w-full py-3 px-6 rounded-xl bg-secondary text-secondary-foreground font-medium hover:bg-muted transition-colors"
              >
                Done
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <button
                onClick={handleRoll}
                disabled={isRolling || isLoading || availableCount === 0}
                className={cn(
                  "w-full py-4 px-6 rounded-xl font-display font-semibold text-lg transition-all",
                  "gradient-accent text-accent-foreground shadow-accent",
                  "hover:opacity-90 active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed",
                  "flex items-center justify-center gap-3"
                )}
              >
                <Dices className="w-6 h-6" />
                {isRolling ? "Rolling..." : "Roll Savings"}
              </button>
              
              <p className="text-center text-sm text-muted-foreground">
                {availableCount} amounts remaining
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
