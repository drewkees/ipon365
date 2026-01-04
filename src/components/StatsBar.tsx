import { Dices, Calendar, Hash } from "lucide-react";

interface StatsBarProps {
  usedCount: number;
  totalCount: number;
}

export function StatsBar({ usedCount, totalCount }: StatsBarProps) {
  const remainingCount = totalCount - usedCount;
  const percentage = (usedCount / totalCount) * 100;

  return (
    <div className="w-full max-w-md mx-auto bg-card rounded-2xl shadow-soft p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
            <Dices className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="font-display font-semibold text-foreground">Progress</span>
        </div>
        <span className="text-sm font-medium text-muted-foreground">
          {usedCount} / {totalCount}
        </span>
      </div>
      
      {/* Progress bar */}
      <div className="h-3 bg-secondary rounded-full overflow-hidden mb-4">
        <div 
          className="h-full gradient-primary transition-all duration-500 ease-out rounded-full"
          style={{ width: `${percentage}%` }}
        />
      </div>
      
      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="flex items-center gap-2 bg-secondary/50 rounded-xl p-3">
          <Calendar className="w-4 h-4 text-primary" />
          <div>
            <p className="text-xs text-muted-foreground">Filled</p>
            <p className="font-display font-bold text-foreground">{usedCount}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-secondary/50 rounded-xl p-3">
          <Hash className="w-4 h-4 text-accent" />
          <div>
            <p className="text-xs text-muted-foreground">Available</p>
            <p className="font-display font-bold text-foreground">{remainingCount}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
