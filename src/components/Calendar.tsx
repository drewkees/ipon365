import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, startOfWeek, endOfWeek } from "date-fns";
import { cn } from "@/lib/utils";

interface DailyRoll {
  roll_date: string;
  roll_number: number;
}

interface CalendarProps {
  rolls: DailyRoll[];
  onDateSelect: (date: Date) => void;
  selectedDate: Date | null;
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const formatPeso = (amount: number) => {
  if (amount >= 100) {
    return `₱${amount}`;
  }
  return `₱${amount}`;
};

export function Calendar({ rolls, onDateSelect, selectedDate }: CalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const getRollForDate = (date: Date): number | null => {
    const dateStr = format(date, "yyyy-MM-dd");
    const roll = rolls.find(r => r.roll_date === dateStr);
    return roll ? roll.roll_number : null;
  };

  const handlePrevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const handleNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 px-2">
        <button 
          onClick={handlePrevMonth}
          className="p-3 rounded-full bg-card shadow-soft hover:bg-secondary transition-all active:scale-95"
          aria-label="Previous month"
        >
          <ChevronLeft className="w-5 h-5 text-foreground" />
        </button>
        
        <h2 className="text-xl font-display font-semibold text-foreground">
          {format(currentMonth, "MMMM yyyy")}
        </h2>
        
        <button 
          onClick={handleNextMonth}
          className="p-3 rounded-full bg-card shadow-soft hover:bg-secondary transition-all active:scale-95"
          aria-label="Next month"
        >
          <ChevronRight className="w-5 h-5 text-foreground" />
        </button>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 mb-2">
        {WEEKDAYS.map(day => (
          <div key={day} className="text-center text-xs font-medium text-muted-foreground py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1.5">
        {days.map((day, index) => {
          const rollNumber = getRollForDate(day);
          const isCurrentMonth = isSameMonth(day, currentMonth);
          const isSelected = selectedDate && isSameDay(day, selectedDate);
          const hasRoll = rollNumber !== null;

          return (
            <button
              key={index}
              onClick={() => onDateSelect(day)}
              disabled={!isCurrentMonth}
              className={cn(
                "aspect-square rounded-xl flex flex-col items-center justify-center transition-all duration-200 relative overflow-hidden",
                "text-sm font-medium",
                !isCurrentMonth && "opacity-30 cursor-not-allowed",
                isCurrentMonth && !hasRoll && "bg-card shadow-soft hover:shadow-glow hover:scale-105 active:scale-95",
                isCurrentMonth && hasRoll && "bg-primary text-primary-foreground shadow-glow",
                isSelected && !hasRoll && "ring-2 ring-primary ring-offset-2 ring-offset-background",
                isSelected && hasRoll && "ring-2 ring-accent ring-offset-2 ring-offset-background"
              )}
            >
              <span className={cn(
                "text-[10px]",
                hasRoll ? "text-primary-foreground/70" : "text-muted-foreground"
              )}>
                {format(day, "d")}
              </span>
              {hasRoll && (
                <span className="text-xs font-display font-bold text-primary-foreground">
                  {formatPeso(rollNumber)}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
