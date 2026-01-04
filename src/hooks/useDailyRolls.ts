import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { toast } from "sonner";

interface DailyRoll {
  id: string;
  roll_date: string;
  roll_number: number;
  created_at: string;
}

export function useDailyRolls() {
  const [rolls, setRolls] = useState<DailyRoll[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all rolls
  const fetchRolls = useCallback(async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("daily_rolls")
        .select("*")
        .order("roll_date", { ascending: true });

      if (error) throw error;
      setRolls(data || []);
      setError(null);
    } catch (err) {
      console.error("Error fetching rolls:", err);
      setError("Failed to load data");
      toast.error("Failed to load calendar data");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Get all used numbers
  const getUsedNumbers = useCallback((): Set<number> => {
    return new Set(rolls.map(r => r.roll_number));
  }, [rolls]);

  // Get available numbers
  const getAvailableNumbers = useCallback((): number[] => {
    const used = getUsedNumbers();
    const available: number[] = [];
    for (let i = 1; i <= 365; i++) {
      if (!used.has(i)) {
        available.push(i);
      }
    }
    return available;
  }, [getUsedNumbers]);

  // Roll a new number for a date
  const rollNumber = useCallback(async (date: Date): Promise<number | null> => {
    const available = getAvailableNumbers();
    
    if (available.length === 0) {
      toast.error("All numbers have been used!");
      return null;
    }

    // Pick a random number from available
    const randomIndex = Math.floor(Math.random() * available.length);
    const rolledNumber = available[randomIndex];
    const dateStr = format(date, "yyyy-MM-dd");

    try {
      const { data, error } = await supabase
        .from("daily_rolls")
        .insert({
          roll_date: dateStr,
          roll_number: rolledNumber,
        })
        .select()
        .single();

      if (error) {
        // Handle unique constraint violation
        if (error.code === "23505") {
          toast.error("This date or number is already taken!");
          await fetchRolls(); // Refresh data
          return null;
        }
        throw error;
      }

      // Update local state
      setRolls(prev => [...prev, data]);
      toast.success(`Rolled ${rolledNumber}!`);
      return rolledNumber;
    } catch (err) {
      console.error("Error rolling number:", err);
      toast.error("Failed to save. Please try again.");
      return null;
    }
  }, [getAvailableNumbers, fetchRolls]);

  // Get roll for a specific date
  const getRollForDate = useCallback((date: Date): number | null => {
    const dateStr = format(date, "yyyy-MM-dd");
    const roll = rolls.find(r => r.roll_date === dateStr);
    return roll ? roll.roll_number : null;
  }, [rolls]);

  // Initial fetch
  useEffect(() => {
    fetchRolls();
  }, [fetchRolls]);

  return {
    rolls,
    isLoading,
    error,
    rollNumber,
    getRollForDate,
    getAvailableNumbers,
    refetch: fetchRolls,
  };
}
