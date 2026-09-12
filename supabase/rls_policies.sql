-- ==============================================================================
-- MAKTAB MANAGEMENT SYSTEM - ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- Enable Row Level Security on all tables
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sabak ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.advertisements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teacher_secrets ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------------------------
-- 1. TEACHER SECRETS TABLE (Strict lockdown: no direct client access)
-- ------------------------------------------------------------------------------
-- Block all direct read/write from anon & authenticated roles.
-- Access is granted exclusively through SECURITY DEFINER functions.
DROP POLICY IF EXISTS "No direct access to teacher secrets" ON public.teacher_secrets;
CREATE POLICY "No direct access to teacher secrets"
    ON public.teacher_secrets
    FOR ALL
    TO public
    USING (false);

-- ------------------------------------------------------------------------------
-- 2. STUDENTS TABLE POLICIES
-- ------------------------------------------------------------------------------
-- Public/Student side: Read students (for student search and dashboard)
DROP POLICY IF EXISTS "Public can view students" ON public.students;
CREATE POLICY "Public can view students"
    ON public.students
    FOR SELECT
    TO anon, authenticated
    USING (true);

-- Teacher only: Insert students
DROP POLICY IF EXISTS "Authorized teachers can insert students" ON public.students;
CREATE POLICY "Authorized teachers can insert students"
    ON public.students
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.role() = 'authenticated');

-- Teacher only: Update students
DROP POLICY IF EXISTS "Authorized teachers can update students" ON public.students;
CREATE POLICY "Authorized teachers can update students"
    ON public.students
    FOR UPDATE
    TO authenticated
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

-- Teacher only: Delete students
DROP POLICY IF EXISTS "Authorized teachers can delete students" ON public.students;
CREATE POLICY "Authorized teachers can delete students"
    ON public.students
    FOR DELETE
    TO authenticated
    USING (auth.role() = 'authenticated');

-- ------------------------------------------------------------------------------
-- 3. ATTENDANCE TABLE POLICIES
-- ------------------------------------------------------------------------------
-- Public/Student side: Read attendance (for monthly calendar and student dashboard)
DROP POLICY IF EXISTS "Public can view attendance" ON public.attendance;
CREATE POLICY "Public can view attendance"
    ON public.attendance
    FOR SELECT
    TO anon, authenticated
    USING (true);

-- Teacher only: Insert attendance
DROP POLICY IF EXISTS "Authorized teachers can insert attendance" ON public.attendance;
CREATE POLICY "Authorized teachers can insert attendance"
    ON public.attendance
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.role() = 'authenticated');

-- Teacher only: Update attendance
DROP POLICY IF EXISTS "Authorized teachers can update attendance" ON public.attendance;
CREATE POLICY "Authorized teachers can update attendance"
    ON public.attendance
    FOR UPDATE
    TO authenticated
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

-- Teacher only: Delete attendance
DROP POLICY IF EXISTS "Authorized teachers can delete attendance" ON public.attendance;
CREATE POLICY "Authorized teachers can delete attendance"
    ON public.attendance
    FOR DELETE
    TO authenticated
    USING (auth.role() = 'authenticated');

-- ------------------------------------------------------------------------------
-- 4. SABAK TABLE POLICIES
-- ------------------------------------------------------------------------------
-- Public/Student side: Read sabak (for previous day Sabak display on student dashboard)
DROP POLICY IF EXISTS "Public can view sabak" ON public.sabak;
CREATE POLICY "Public can view sabak"
    ON public.sabak
    FOR SELECT
    TO anon, authenticated
    USING (true);

-- Teacher only: Insert sabak
DROP POLICY IF EXISTS "Authorized teachers can insert sabak" ON public.sabak;
CREATE POLICY "Authorized teachers can insert sabak"
    ON public.sabak
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.role() = 'authenticated');

-- Teacher only: Update sabak
DROP POLICY IF EXISTS "Authorized teachers can update sabak" ON public.sabak;
CREATE POLICY "Authorized teachers can update sabak"
    ON public.sabak
    FOR UPDATE
    TO authenticated
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

-- Teacher only: Delete sabak
DROP POLICY IF EXISTS "Authorized teachers can delete sabak" ON public.sabak;
CREATE POLICY "Authorized teachers can delete sabak"
    ON public.sabak
    FOR DELETE
    TO authenticated
    USING (auth.role() = 'authenticated');

-- ------------------------------------------------------------------------------
-- 5. ADVERTISEMENTS TABLE POLICIES (FUTURE USE)
-- ------------------------------------------------------------------------------
-- Public can only view active ads (currently none active)
DROP POLICY IF EXISTS "Public can view active advertisements" ON public.advertisements;
CREATE POLICY "Public can view active advertisements"
    ON public.advertisements
    FOR SELECT
    TO anon, authenticated
    USING (active = true);

-- Teacher only: Manage advertisements
DROP POLICY IF EXISTS "Authorized teachers can manage advertisements" ON public.advertisements;
CREATE POLICY "Authorized teachers can manage advertisements"
    ON public.advertisements
    FOR ALL
    TO authenticated
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');
