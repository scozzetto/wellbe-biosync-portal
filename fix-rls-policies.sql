-- Fix RLS policies for public access
-- Run this in Supabase SQL Editor

-- First, check if RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('staff', 'tasks', 'task_comments', 'activity_log');

-- Drop existing policies to start fresh
DROP POLICY IF EXISTS "Public read access" ON staff;
DROP POLICY IF EXISTS "Public insert access" ON staff;
DROP POLICY IF EXISTS "Public update access" ON staff;

DROP POLICY IF EXISTS "Public read access" ON tasks;
DROP POLICY IF EXISTS "Public insert access" ON tasks;
DROP POLICY IF EXISTS "Public update access" ON tasks;
DROP POLICY IF EXISTS "Public delete access" ON tasks;

-- Create new policies with anon access
CREATE POLICY "Enable read access for all users" ON staff
FOR SELECT USING (true);

CREATE POLICY "Enable insert for all users" ON staff
FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for all users" ON staff
FOR UPDATE USING (true);

CREATE POLICY "Enable read access for all users" ON tasks
FOR SELECT USING (true);

CREATE POLICY "Enable insert for all users" ON tasks
FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for all users" ON tasks
FOR UPDATE USING (true);

CREATE POLICY "Enable delete for all users" ON tasks
FOR DELETE USING (true);

-- Verify the policies
SELECT tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN ('staff', 'tasks');

-- Test query
SELECT * FROM staff WHERE email = 'silvio@bewelllifestylecenters.com';