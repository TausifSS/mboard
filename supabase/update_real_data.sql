-- ==============================================================================
-- MAKTAB MANAGEMENT SYSTEM - REAL STUDENTS DATA MIGRATION
-- 29 Boys + 25 Girls (Total 54 Students)
-- Clears old dummy attendance & sabak, starts fresh from today!
-- ==============================================================================

-- 1. Ensure gender column exists and mobile can be empty
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS gender TEXT CHECK (gender IN ('boy', 'girl')) DEFAULT 'boy';
ALTER TABLE public.students ALTER COLUMN mobile DROP NOT NULL;

-- 2. Clear old dummy records
DELETE FROM public.attendance;
DELETE FROM public.sabak;
DELETE FROM public.students;

-- 3. INSERT REAL BOYS (29 Students)
INSERT INTO public.students (name, father_name, mobile, gender) VALUES
('Irshad Tamboli', 'Mubarak Tamboli', '9822353425', 'boy'),
('Arsalan Tamboli', 'Ayuub Tamboli', '9860952493', 'boy'),
('Huzaif Tamboli', 'Irfan Tamboli', '9673886060', 'boy'),
('Arsh Shaikh', 'Riyaz Shaikh', '', 'boy'),
('Arsalan Tamboli', 'Mustak Tamboli', '', 'boy'),
('Ab Rahman Alamel', 'Nabi Rasul Alamel', '9860258779', 'boy'),
('Abu Talha Pathan', 'Alim Pathan', '7798523804', 'boy'),
('Dastgir Guledgud', 'Guspak Guledgud', '7057116809', 'boy'),
('Fahad Shah', 'Usman Shah', '8459895293', 'boy'),
('Rohan Roshan', 'Roshan Ali', '6388221952', 'boy'),
('Suleman Alamel', 'Nabi Rasul Alamel', '9860258779', 'boy'),
('Muawiyah Sayyad', 'Naveed Sayyad', '9595308109', 'boy'),
('Azhaan Shaikh', 'Imtiyaz Shaikh', '9623738419', 'boy'),
('Saad Shaikh', 'Yaseen Shaikh', '9922874685', 'boy'),
('Faizal Tamboli', 'Jamir Tamboli', '8446140501', 'boy'),
('Mohammad Hanzala', 'Mazhar Shah', '9604063568', 'boy'),
('Sultan Tamboli', 'Shahbaz Tamboli', '9673886060', 'boy'),
('Mo Tamhid', 'Mo Ismail Ali', '7458806386', 'boy'),
('Sahir Tamboli', 'Salim Tamboli', '9579409191', 'boy'),
('Arsalan Tamboli', 'Shoyab Tamboli', '9730202496', 'boy'),
('Mubarak Ansari', 'Asgar Ansari', '', 'boy'),
('Aahil Shaikh', 'Javeed Shaikh', '', 'boy'),
('Muhammad Khan', 'Irshad Khan', '9175363517', 'boy'),
('Bilal Sayyad', 'Sajid Sayyad', '', 'boy'),
('Miraj Hawaldar', 'Shakir Hawaldar', '9970234289', 'boy'),
('Sahil Guledgud', 'Guspak Guledgud', '7057116809', 'boy'),
('Armaan Attar', 'Abdul Attar', '9881056095', 'boy'),
('Anas Ansari', 'Shakir Ansari', '', 'boy'),
('Faiz Ansari', 'Shakir Ansari', '', 'boy');

-- 4. INSERT REAL GIRLS (25 Students)
INSERT INTO public.students (name, father_name, mobile, gender) VALUES
('Sana Tamboli', 'Firoz Tamboli', '8975158138', 'girl'),
('Aliya Tamboli', 'Abdul Attar', '9881056095', 'girl'),
('Sabiya Shaikh', 'Yaseen Shaikh', '9922874685', 'girl'),
('Fatima Tamboli', 'Sadik Tamboli', '9823767857', 'girl'),
('Aliza Tamboli', 'Shoyab Tamboli', '9730202496', 'girl'),
('Fatima Shah', 'Usman Shah', '8459895293', 'girl'),
('Nida Shaikh', 'Muhammad Shk', '9284815051', 'girl'),
('Aliya Shaikh', 'Muhammad Shk', '9284815051', 'girl'),
('Khwaish Ali', 'Roshan Ali', '6388221952', 'girl'),
('Namira Falak', 'Naveed Sayyad', '9595308109', 'girl'),
('Samiya Shaikh', 'Yaseen Shaikh', '9922874685', 'girl'),
('Alina Sayyad', 'Akbar Sayyad', '7350664251', 'girl'),
('Sumayya Alamel', 'Nabi Rasul Alamel', '9860258779', 'girl'),
('Alfa', 'Ali Hasan', '8983052278', 'girl'),
('Hina Ansari', 'Asgar Ansari', '', 'girl'),
('Arfa Shaikh', 'Shafik Shaikh', '8806535813', 'girl'),
('Mehak Hawaldar', 'Shakir Hawaldar', '9970234289', 'girl'),
('Naaz Sayyad', 'Sajid Sayyad', '', 'girl'),
('Ilma Khan', 'Irshad Khan', '9175363517', 'girl'),
('Ajia Khan', 'Irshad Khan', '9175363517', 'girl'),
('Fatima Pathan', 'Umar Pathan', '8668701762', 'girl'),
('Mahira Shikh', 'Mudassir Shaikh', '7972921078', 'girl'),
('Ahana Sayyad', 'Sajid Sayyad', '', 'girl'),
('Anam Shaikh', 'Javeed Shaikh', '', 'girl'),
('Iqra Tamboli', 'Salim Tamboli', '9579409191', 'girl');
