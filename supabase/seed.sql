-- ==============================================================================
-- MAKTAB MANAGEMENT SYSTEM - SEED DATA
-- ==============================================================================

-- 1. Insert Initial Students
INSERT INTO public.students (id, name, father_name, mobile) VALUES
('b3c8f121-6d73-42e1-88ef-2b36a1111111', 'Abdullah Shaikh', 'Mohammed Shaikh', '9820011223'),
('b3c8f121-6d73-42e1-88ef-2b36a2222222', 'Ibrahim Shaikh', 'Ahmed Shaikh', '9820033445'),
('b3c8f121-6d73-42e1-88ef-2b36a3333333', 'Yusuf Shaikh', 'Tariq Shaikh', '9820055667'),
('b3c8f121-6d73-42e1-88ef-2b36a4444444', 'Ahmed Shaikh', 'Mohammed Ahmed', '9820077889'),
('b3c8f121-6d73-42e1-88ef-2b36a5555555', 'Ibrahim Khan', 'Yusuf Khan', '9820099001'),
('b3c8f121-6d73-42e1-88ef-2b36a6666666', 'Hamza Patel', 'Farooq Patel', '9820122334'),
('b3c8f121-6d73-42e1-88ef-2b36a7777777', 'Umar Farooq', 'Bilal Farooq', '9820233445'),
('b3c8f121-6d73-42e1-88ef-2b36a8888888', 'Zayd Ansari', 'Salman Ansari', '9820344556')
ON CONFLICT (id) DO NOTHING;

-- 2. Insert Historical Attendance for September 2026 (Abdullah Shaikh)
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

-- 3. Insert Historical Sabak Records
INSERT INTO public.sabak (student_id, sabak_date, completed) VALUES
('b3c8f121-6d73-42e1-88ef-2b36a1111111', '2026-09-10', true),
('b3c8f121-6d73-42e1-88ef-2b36a1111111', '2026-09-11', false),
('b3c8f121-6d73-42e1-88ef-2b36a1111111', '2026-09-12', true)
ON CONFLICT (student_id, sabak_date) DO NOTHING;
