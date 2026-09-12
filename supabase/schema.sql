-- ==============================================================================
-- MAKTAB MANAGEMENT SYSTEM - DATABASE SCHEMA
-- ==============================================================================
-- PostgreSQL Schema for Supabase
-- Tables: students, attendance, sabak, advertisements, teacher_secrets

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------------------------
-- 1. STUDENTS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.students (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    father_name TEXT NOT NULL,
    mobile TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Indexes for students
CREATE INDEX IF NOT EXISTS idx_students_name ON public.students (name);
CREATE INDEX IF NOT EXISTS idx_students_father_name ON public.students (father_name);

-- ------------------------------------------------------------------------------
-- 2. ATTENDANCE TABLE
-- Stores daily attendance per student (present/absent)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.attendance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    attendance_date DATE NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('present', 'absent')),
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    -- Unique constraint ensures no duplicate attendance for the same student on the same date
    CONSTRAINT uq_student_attendance_date UNIQUE (student_id, attendance_date)
);

-- Indexes for attendance
CREATE INDEX IF NOT EXISTS idx_attendance_student_id ON public.attendance (student_id);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON public.attendance (attendance_date);
CREATE INDEX IF NOT EXISTS idx_attendance_student_date ON public.attendance (student_id, attendance_date);

-- ------------------------------------------------------------------------------
-- 3. SABAK TABLE
-- Tracks binary daily Sabak completion (completed: true / false)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.sabak (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    sabak_date DATE NOT NULL,
    completed BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    -- Unique constraint ensures no duplicate sabak record for the same student on the same date
    CONSTRAINT uq_student_sabak_date UNIQUE (student_id, sabak_date)
);

-- Indexes for sabak
CREATE INDEX IF NOT EXISTS idx_sabak_student_id ON public.sabak (student_id);
CREATE INDEX IF NOT EXISTS idx_sabak_date ON public.sabak (sabak_date);
CREATE INDEX IF NOT EXISTS idx_sabak_student_date ON public.sabak (student_id, sabak_date);

-- ------------------------------------------------------------------------------
-- 4. ADVERTISEMENTS TABLE (FUTURE USE - ADS CURRENTLY OFF)
-- ------------------------------------------------------------------------------
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

-- Index for active advertisements
CREATE INDEX IF NOT EXISTS idx_advertisements_active ON public.advertisements (active);

-- ------------------------------------------------------------------------------
-- 5. SECURE TEACHER PASSCODE TABLE
-- Never accessible directly by the public client
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.teacher_secrets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    passcode_hash TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ------------------------------------------------------------------------------
-- 6. AUTOMATIC UPDATED_AT TRIGGER FUNCTION
-- ------------------------------------------------------------------------------
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
