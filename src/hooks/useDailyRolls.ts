import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { toast } from "sonner";

interface DailyRoll {
  id: string;
  roll_date: string;
  roll_number: number;
  created_at: string;
  user_id?: string;
  user_email?: string;
}

export function useDailyRolls() {
  const [rolls, setRolls] = useState<DailyRoll[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  // Get current user
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUserId(session?.user?.id || null);
    });
  }, []);

  // Fetch rolls for current user - REMOVE useCallback here
  const fetchRolls = async () => {
    if (!userId) return;
    
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("daily_rolls")
        .select("*")
        .eq("user_id", userId)
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
  };

  const getUsedNumbers = useCallback((): Set<number> => {
    return new Set(rolls.map(r => r.roll_number));
  }, [rolls]);

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

  const rollNumber = useCallback(async (date: Date): Promise<number | null> => {
    if (!userId) {
      toast.error("You must be logged in to roll");
      return null;
    }

    const available = getAvailableNumbers();
    
    if (available.length === 0) {
      toast.error("All numbers have been used!");
      return null;
    }

    const randomIndex = Math.floor(Math.random() * available.length);
    const rolledNumber = available[randomIndex];
    const dateStr = format(date, "yyyy-MM-dd");

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const { data, error } = await supabase
        .from("daily_rolls")
        .insert({
          user_id: userId,
          user_email: session?.user?.email || null,
          roll_date: dateStr,
          roll_number: rolledNumber,
        })
        .select()
        .single();

      if (error) {
        if (error.code === "23505") {
          toast.error("This date or number is already taken!");
          await fetchRolls();
          return null;
        }
        throw error;
      }

      setRolls(prev => [...prev, data]);
      toast.success(`Rolled ${rolledNumber}!`);
      return rolledNumber;
    } catch (err) {
      console.error("Error rolling number:", err);
      toast.error("Failed to save. Please try again.");
      return null;
    }
  }, [userId, getAvailableNumbers]); // Remove fetchRolls from dependencies

  const getRollForDate = useCallback((date: Date): number | null => {
    const dateStr = format(date, "yyyy-MM-dd");
    const roll = rolls.find(r => r.roll_date === dateStr);
    return roll ? roll.roll_number : null;
  }, [rolls]);

  // Use userId as dependency instead of fetchRolls
  useEffect(() => {
    if (userId) {
      fetchRolls();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]); // Only depend on userId

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