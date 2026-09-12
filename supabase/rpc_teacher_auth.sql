-- ==============================================================================
-- MAKTAB MANAGEMENT SYSTEM - SECURE TEACHER AUTHENTICATION RPC
-- ==============================================================================
-- This function runs securely on the PostgreSQL server with SECURITY DEFINER privileges.
-- The teacher passcode is NEVER sent in plain-text to the client, nor is it stored
-- in frontend source code.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Initialize the teacher secret with bcrypt hash of '19836-6'
-- Notice: This is executed during Supabase DB setup; client never receives the raw passcode.
DELETE FROM public.teacher_secrets;
INSERT INTO public.teacher_secrets (passcode_hash)
VALUES (crypt('19836-6', gen_salt('bf', 10)));

-- ------------------------------------------------------------------------------
-- RPC Function: verify_teacher_passcode
-- Parameters: entered_passcode (TEXT)
-- Returns: BOOLEAN (true if match, false if mismatch)
-- ------------------------------------------------------------------------------
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
    -- Retrieve the current active teacher passcode hash
    SELECT passcode_hash INTO stored_hash
    FROM public.teacher_secrets
    LIMIT 1;

    IF stored_hash IS NULL THEN
        RETURN false;
    END IF;

    -- Secure bcrypt verification
    IF stored_hash = crypt(entered_passcode, stored_hash) THEN
        is_valid := true;
    END IF;

    RETURN is_valid;
END;
$$;

-- Grant execution permission to anon and authenticated roles
GRANT EXECUTE ON FUNCTION public.verify_teacher_passcode(TEXT) TO anon, authenticated;
