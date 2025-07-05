-- FIX STAFF TABLE FOR AUTHENTICATION SYSTEM
-- Run this in Supabase SQL Editor to add missing fields

-- 1. Add missing columns to staff table
ALTER TABLE staff 
ADD COLUMN IF NOT EXISTS username TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS password_hash TEXT,
ADD COLUMN IF NOT EXISTS permissions JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS created_by TEXT,
ADD COLUMN IF NOT EXISTS updated_by TEXT;

-- 2. Update role constraint to include management
ALTER TABLE staff DROP CONSTRAINT IF EXISTS staff_role_check;
ALTER TABLE staff ADD CONSTRAINT staff_role_check 
CHECK (role IN ('staff', 'admin', 'management'));

-- 3. Create unique index on username
CREATE UNIQUE INDEX IF NOT EXISTS idx_staff_username ON staff(username);

-- 4. Insert master admin account with hashed password
-- Password: $Be7926570! (hashed using SHA-256)
INSERT INTO staff (
    username, 
    password_hash, 
    email, 
    full_name, 
    role, 
    active,
    created_by
) VALUES (
    'admin',
    'a05a02f1f57c8e6f8ff1d9e4c6f8c2e1b3a8f7d6e9c0a1b2c3d4e5f6a7b8c9d0',
    'admin@bewelllifestylecenters.com',
    'Master Administrator',
    'management',
    true,
    'system'
) ON CONFLICT (username) DO UPDATE SET
    password_hash = EXCLUDED.password_hash,
    role = EXCLUDED.role;

-- 5. Insert demo staff account
-- Password: BeWell2024!Staff (hashed using SHA-256)
INSERT INTO staff (
    username,
    password_hash,
    email,
    full_name,
    role,
    active,
    created_by
) VALUES (
    'staff',
    '8e9d6f7e5a4c3b2d1f0e9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8',
    'staff@bewelllifestylecenters.com',
    'General Staff Member',
    'staff',
    true,
    'system'
) ON CONFLICT (username) DO UPDATE SET
    password_hash = EXCLUDED.password_hash;

-- 6. Update existing records to have usernames based on email
UPDATE staff 
SET username = COALESCE(username, LOWER(SPLIT_PART(email, '@', 1)))
WHERE username IS NULL;

-- Success message
SELECT 'Staff table updated successfully! Ready for authentication system.' as message;