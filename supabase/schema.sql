-- ==============================================================================
-- Schema Setup: Reminder & Note-Taking Application
-- Security: Row Level Security (RLS) restricted strictly to GitHub: Surendhar2252
-- ==============================================================================

-- 1. Create Enums for Recurrence Pattern and Task Status
CREATE TYPE task_recurrence AS ENUM ('once', 'daily', 'weekly', 'monthly', 'yearly');
CREATE TYPE task_status AS ENUM ('pending', 'completed');

-- 2. Create Tasks Table
CREATE TABLE IF NOT EXISTS public.tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) DEFAULT auth.uid(),
    title TEXT NOT NULL,
    note TEXT,
    recurrence_pattern task_recurrence NOT NULL DEFAULT 'once',
    status task_status NOT NULL DEFAULT 'pending',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    due_date TIMESTAMPTZ NOT NULL,
    completed_at TIMESTAMPTZ
);

-- Index for fast queries on status, due_date, and completed_at
CREATE INDEX IF NOT EXISTS idx_tasks_status_due_date ON public.tasks (status, due_date);
CREATE INDEX IF NOT EXISTS idx_tasks_status_completed_at ON public.tasks (status, completed_at DESC);
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON public.tasks (user_id);

-- 3. Create Important Dates Table
CREATE TABLE IF NOT EXISTS public.important_dates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) DEFAULT auth.uid(),
    title TEXT NOT NULL,
    event_date DATE NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for sorting upcoming events
CREATE INDEX IF NOT EXISTS idx_important_dates_event_date ON public.important_dates (event_date ASC);
CREATE INDEX IF NOT EXISTS idx_important_dates_user_id ON public.important_dates (user_id);

-- 4. Enable Row Level Security (RLS) on both tables
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.important_dates ENABLE ROW LEVEL SECURITY;

-- 5. Helper Function: Is the current user Surendhar2252?
CREATE OR REPLACE FUNCTION public.is_authorized_surendhar()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN (
        auth.role() = 'authenticated' AND (
            (auth.jwt() -> 'user_metadata' ->> 'user_name' = 'Surendhar2252') OR
            (auth.jwt() -> 'user_metadata' ->> 'preferred_username' = 'Surendhar2252')
        )
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- 6. Strict RLS Policies for Tasks Table
-- Access is granted ONLY if authenticated GitHub username is exactly 'Surendhar2252'

CREATE POLICY "Surendhar2252 select tasks"
    ON public.tasks
    FOR SELECT
    TO authenticated
    USING (public.is_authorized_surendhar());

CREATE POLICY "Surendhar2252 insert tasks"
    ON public.tasks
    FOR INSERT
    TO authenticated
    WITH CHECK (public.is_authorized_surendhar());

CREATE POLICY "Surendhar2252 update tasks"
    ON public.tasks
    FOR UPDATE
    TO authenticated
    USING (public.is_authorized_surendhar())
    WITH CHECK (public.is_authorized_surendhar());

CREATE POLICY "Surendhar2252 delete tasks"
    ON public.tasks
    FOR DELETE
    TO authenticated
    USING (public.is_authorized_surendhar());

-- 7. Strict RLS Policies for Important Dates Table
CREATE POLICY "Surendhar2252 select important_dates"
    ON public.important_dates
    FOR SELECT
    TO authenticated
    USING (public.is_authorized_surendhar());

CREATE POLICY "Surendhar2252 insert important_dates"
    ON public.important_dates
    FOR INSERT
    TO authenticated
    WITH CHECK (public.is_authorized_surendhar());

CREATE POLICY "Surendhar2252 update important_dates"
    ON public.important_dates
    FOR UPDATE
    TO authenticated
    USING (public.is_authorized_surendhar())
    WITH CHECK (public.is_authorized_surendhar());

CREATE POLICY "Surendhar2252 delete important_dates"
    ON public.important_dates
    FOR DELETE
    TO authenticated
    USING (public.is_authorized_surendhar());
