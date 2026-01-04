-- Create the daily_rolls table for storing calendar rolls
CREATE TABLE public.daily_rolls (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  roll_date DATE NOT NULL UNIQUE,
  roll_number INTEGER NOT NULL UNIQUE CHECK (roll_number >= 1 AND roll_number <= 365),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.daily_rolls ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read rolls (public app)
CREATE POLICY "Anyone can view rolls" 
ON public.daily_rolls 
FOR SELECT 
USING (true);

-- Allow anyone to insert rolls (public app - no auth required)
CREATE POLICY "Anyone can insert rolls" 
ON public.daily_rolls 
FOR INSERT 
WITH CHECK (true);

-- Create index for faster date lookups
CREATE INDEX idx_daily_rolls_date ON public.daily_rolls(roll_date);
CREATE INDEX idx_daily_rolls_number ON public.daily_rolls(roll_number);