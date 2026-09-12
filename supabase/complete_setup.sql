-- ==============================================================================
-- MAKTAB MANAGEMENT SYSTEM - COMPLETE ONE-CLICK DATABASE SETUP
-- ==============================================================================
-- Run this entire script in your Supabase SQL Editor:
-- Project: ekxpvfquihlmubeijdih
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. TABLES
-- Students Table
CREATE TABLE IF NOT EXISTS public.students (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    father_name TEXT NOT NULL,
    mobile TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_students_name ON public.students (name);
CREATE INDEX IF NOT EXISTS idx_students_father_name ON public.students (father_name);

-- Attendance Table (One record per student per date)
CREATE TABLE IF NOT EXISTS public.attendance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    attendance_date DATE NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('present', 'absent')),
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    CONSTRAINT uq_student_attendance_date UNIQUE (student_id, attendance_date)
);

CREATE INDEX IF NOT EXISTS idx_attendance_student_id ON public.attendance (student_id);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON public.attendance (attendance_date);
CREATE INDEX IF NOT EXISTS idx_attendance_student_date ON public.attendance (student_id, attendance_date);

-- Sabak Table (Binary Yes/No for previous day)
CREATE TABLE IF NOT EXISTS public.sabak (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    sabak_date DATE NOT NULL,
    completed BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    CONSTRAINT uq_student_sabak_date UNIQUE (student_id, sabak_date)
);

CREATE INDEX IF NOT EXISTS idx_sabak_student_id ON public.sabak (student_id);
CREATE INDEX IF NOT EXISTS idx_sabak_date ON public.sabak (sabak_date);
CREATE INDEX IF NOT EXISTS idx_sabak_student_date ON public.sabak (student_id, sabak_date);

-- Advertisements Table (Future use - ADS OFF)
CREATE TABLE IF NOT EXISTS public.advertisements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    link TEXT,
    active BOOLEAN DEFAULT false NOT NULL,
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_advertisements_active ON public.advertisements (active);

-- Teacher Secrets Table (Never exposed to frontend)
CREATE TABLE IF NOT EXISTS public.teacher_secrets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    passcode_hash TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Seed Teacher Passcode Hash (Bcrypt hash of '19836-6')
DELETE FROM public.teacher_secrets;
INSERT INTO public.teacher_secrets (passcode_hash)
VALUES (crypt('19836-6', gen_salt('bf', 10)));

-- 3. TRIGGERS FOR UPDATED_AT
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_students_updated_at ON public.students;
CREATE TRIGGER tr_students_updated_at
    BEFORE UPDATE ON public.students
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS tr_attendance_updated_at ON public.attendance;
CREATE TRIGGER tr_attendance_updated_at
    BEFORE UPDATE ON public.attendance
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS tr_sabak_updated_at ON public.sabak;
CREATE TRIGGER tr_sabak_updated_at
    BEFORE UPDATE ON public.sabak
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 4. ROW LEVEL SECURITY (RLS)
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sabak ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.advertisements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teacher_secrets ENABLE ROW LEVEL SECURITY;

-- Teacher Secrets: Strict lockdown (no direct table access)
DROP POLICY IF EXISTS "No direct access to teacher secrets" ON public.teacher_secrets;
CREATE POLICY "No direct access to teacher secrets" ON public.teacher_secrets FOR ALL TO public USING (false);

-- Students Policies
DROP POLICY IF EXISTS "Allow read students" ON public.students;
CREATE POLICY "Allow read students" ON public.students FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Allow write students" ON public.students;
CREATE POLICY "Allow write students" ON public.students FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- Attendance Policies
DROP POLICY IF EXISTS "Allow read attendance" ON public.attendance;
CREATE POLICY "Allow read attendance" ON public.attendance FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Allow write attendance" ON public.attendance;
CREATE POLICY "Allow write attendance" ON public.attendance FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- Sabak Policies
DROP POLICY IF EXISTS "Allow read sabak" ON public.sabak;
CREATE POLICY "Allow read sabak" ON public.sabak FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Allow write sabak" ON public.sabak;
CREATE POLICY "Allow write sabak" ON public.sabak FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- Ads Policies
DROP POLICY IF EXISTS "Allow read active ads" ON public.advertisements;
CREATE POLICY "Allow read active ads" ON public.advertisements FOR SELECT TO anon, authenticated USING (active = true);

-- 5. SECURE SERVER-SIDE RPC FUNCTION (Verify Passcode)
CREATE OR REPLACE FUNCTION public.verify_teacher_passcode(entered_passcode TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
    stored_hash TEXT;
    is_valid BOOLEAN := false;
BEGIN
    SELECT passcode_hash INTO stored_hash
    FROM public.teacher_secrets
    LIMIT 1;

    IF stored_hash IS NULL THEN
        RETURN false;
    END IF;

    IF stored_hash = crypt(entered_passcode, stored_hash) THEN
        is_valid := true;
    END IF;

    RETURN is_valid;
END;
$$;

GRANT EXECUTE ON FUNCTION public.verify_teacher_passcode(TEXT) TO anon, authenticated;

-- 6. INITIAL SEED DATA
INSERT INTO public.students (id, name, father_name, mobile) VALUES
('b3c8f121-6d73-42e1-88ef-2b36a1111111', 'Abdullah Shaikh', 'Mohammed Shaikh', '9820011223'),
('b3c8f121-6d73-42e1-88ef-2b36a2222222', 'Ibrahim Shaikh', 'Ahmed Shaikh', '9820033445'),
('b3c8f121-6d73-42e1-88ef-2b36a3333333', 'Yusuf Shaikh', 'Tariq Shaikh', '9820055667'),
('b3c8f121-6d73-42e1-88ef-2b36a4444444', 'Ahmed Shaikh', 'Mohammed Ahmed', '9820077889'),
('b3c8f121-6d73-42e1-88ef-2b36a5555555', 'Ibrahim Khan', 'Yusuf Khan', '9820099001'),
('b3c8f121-6d73-42e1-88ef-2b36a6666666', 'Hamza Patel', 'Farooq Patel', '9820122334')
ON CONFLICT (id) DO NOTHING;

-- Seed Attendance for September 2026
INSERT INTO public.attendance (student_id, attendance_date, status) VALUES
('b3c8f121-6d73-42e1-88ef-2b36a1111111', '2026-09-01', 'present'),
('b3c8f121-6d73-42e1-88ef-2b36a1111111', '2026-09-02', 'present'),
('b3c8f121-6d73-42e1-88ef-2b36a1111111', '2026-09-03', 'present'),
('b3c8f121-6d73-42e1-88ef-2b36a1111111', '2026-09-04', 'absent'),
('b3c8f121-6d73-42e1-88ef-2b36a1111111', '2026-09-05', 'present'),
('b3c8f121-6d73-42e1-88ef-2b36a1111111', '2026-09-07', 'present'),
('b3c8f121-6d73-42e1-88ef-2b36a1111111', '2026-09-08', 'present'),
('b3c8f121-6d73-42e1-88ef-2b36a1111111', '2026-09-09', 'present'),
('b3c8f121-6d73-42e1-88ef-2b36a1111111', '2026-09-10', 'present'),
('b3c8f121-6d73-42e1-88ef-2b36a1111111', '2026-09-11', 'absent'),
('b3c8f121-6d73-42e1-88ef-2b36a1111111', '2026-09-12', 'present')
ON CONFLICT (student_id, attendance_date) DO NOTHING;

-- Seed Sabak records
INSERT INTO public.sabak (student_id, sabak_date, completed) VALUES
('b3c8f121-6d73-42e1-88ef-2b36a1111111', '2026-09-10', true),
('b3c8f121-6d73-42e1-88ef-2b36a1111111', '2026-09-11', false),
('b3c8f121-6d73-42e1-88ef-2b36a1111111', '2026-09-12', true)
ON CONFLICT (student_id, sabak_date) DO NOTHING;
