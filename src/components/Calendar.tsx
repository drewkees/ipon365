import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek
} from "date-fns";
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
const formatPeso = (amount: number) => `₱${amount}`;

export function Calendar({ rolls, onDateSelect, selectedDate }: CalendarProps) {
  const today = new Date();
  const currentYear = today.getFullYear();

  const [currentMonth, setCurrentMonth] = useState(
    new Date(currentYear, today.getMonth(), 1)
  );

  // Month boundaries
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);

  // Calendar grid (IMPORTANT: do NOT filter days)
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  // Find roll for a date
  const getRollForDate = (date: Date): number | null => {
    const dateStr = format(date, "yyyy-MM-dd");
    const roll = rolls.find(r => r.roll_date === dateStr);
    return roll ? roll.roll_number : null;
  };

  // Navigation (lock to current year)
  const handlePrevMonth = () => {
    const prev = subMonths(currentMonth, 1);
    if (prev.getFullYear() === currentYear) {
      setCurrentMonth(prev);
    }
  };

  const handleNextMonth = () => {
    const next = addMonths(currentMonth, 1);
    if (next.getFullYear() === currentYear) {
      setCurrentMonth(next);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 px-2">
        <button
          onClick={handlePrevMonth}
          className="p-3 rounded-full bg-card shadow-soft hover:bg-secondary transition-all active:scale-95"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-semibold">
          {format(currentMonth, "MMMM yyyy")}
        </h2>

        <button
          onClick={handleNextMonth}
          className="p-3 rounded-full bg-card shadow-soft hover:bg-secondary transition-all active:scale-95"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Weekdays */}
      <div className="grid grid-cols-7 mb-2">
        {WEEKDAYS.map(day => (
          <div
            key={day}
            className="text-center text-xs font-medium text-muted-foreground py-2"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar */}
      <div className="grid grid-cols-7 gap-1.5">
        {days.map((day, index) => {
          const rollNumber = getRollForDate(day);
          const isCurrentMonth = isSameMonth(day, currentMonth);
          const isSelected = selectedDate && isSameDay(day, selectedDate);
          const hasRoll = rollNumber !== null;
          const isFuture = day > today;
          const isOutsideYear = day.getFullYear() !== currentYear;

          return (
            <button
              key={index}
              onClick={() => onDateSelect(day)}
              disabled={!isCurrentMonth || isFuture || isOutsideYear}
              className={cn(
                "aspect-square rounded-xl flex flex-col items-center justify-center transition-all relative",
                "text-sm font-medium",
                (isFuture || isOutsideYear || !isCurrentMonth) &&
                  "opacity-30 cursor-not-allowed",
                isCurrentMonth && !hasRoll && !isFuture &&
                  "bg-card shadow-soft hover:scale-105",
                hasRoll && "bg-primary text-primary-foreground shadow-glow",
                isSelected && !hasRoll &&
                  "ring-2 ring-primary ring-offset-2",
                isSelected && hasRoll &&
                  "ring-2 ring-accent ring-offset-2"
              )}
            >
              <span className={cn(
                "text-[10px]",
                hasRoll ? "text-primary-foreground/70" : "text-muted-foreground"
              )}>
                {format(day, "d")}
              </span>

              {hasRoll && (
                <span className="text-xs font-bold">
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
