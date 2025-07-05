-- ROLE-BASED PERMISSION SYSTEM UPDATE
-- Run this in Supabase SQL Editor to add permission support

-- 1. Update staff table with additional permission fields
ALTER TABLE staff 
ADD COLUMN IF NOT EXISTS permissions JSONB DEFAULT '{
    "canCreateTasks": true,
    "canEditOwnTasks": true,
    "canDeleteOwnTasks": true,
    "canViewAllTasks": false,
    "canEditAllTasks": false,
    "canDeleteAllTasks": false,
    "canManageStaff": false,
    "canViewReports": false
}';

-- 2. Update existing roles with appropriate permissions
UPDATE staff 
SET permissions = '{
    "canCreateTasks": true,
    "canEditOwnTasks": true,
    "canDeleteOwnTasks": true,
    "canViewAllTasks": true,
    "canEditAllTasks": true,
    "canDeleteAllTasks": true,
    "canManageStaff": true,
    "canViewReports": true
}'
WHERE role = 'admin';

UPDATE staff 
SET permissions = '{
    "canCreateTasks": true,
    "canEditOwnTasks": true,
    "canDeleteOwnTasks": true,
    "canViewAllTasks": false,
    "canEditAllTasks": false,
    "canDeleteAllTasks": false,
    "canManageStaff": false,
    "canViewReports": false
}'
WHERE role = 'staff';

UPDATE staff 
SET permissions = '{
    "canCreateTasks": false,
    "canEditOwnTasks": false,
    "canDeleteOwnTasks": false,
    "canViewAllTasks": false,
    "canEditAllTasks": false,
    "canDeleteAllTasks": false,
    "canManageStaff": false,
    "canViewReports": false
}'
WHERE role = 'viewer';

-- 3. Add a management role (higher than admin)
UPDATE staff 
SET role = 'management',
    permissions = '{
        "canCreateTasks": true,
        "canEditOwnTasks": true,
        "canDeleteOwnTasks": true,
        "canViewAllTasks": true,
        "canEditAllTasks": true,
        "canDeleteAllTasks": true,
        "canManageStaff": true,
        "canViewReports": true,
        "canManagePermissions": true,
        "canDeactivateStaff": true
    }'
WHERE role = 'admin' AND email IN ('silvio@bewelllifestylecenters.com', 'admin@bewelllifestylecenters.com');

-- 4. Update role constraint to include management
ALTER TABLE staff DROP CONSTRAINT IF EXISTS staff_role_check;
ALTER TABLE staff ADD CONSTRAINT staff_role_check CHECK (role IN ('management', 'admin', 'staff', 'viewer'));

-- 5. Create function to check permissions
CREATE OR REPLACE FUNCTION check_permission(user_email TEXT, permission_name TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    user_permissions JSONB;
BEGIN
    SELECT permissions INTO user_permissions
    FROM staff
    WHERE email = user_email AND active = true;
    
    IF user_permissions IS NULL THEN
        RETURN false;
    END IF;
    
    RETURN COALESCE((user_permissions ->> permission_name)::BOOLEAN, false);
END;
$$ LANGUAGE plpgsql;

-- 6. Create function to get user role and permissions
CREATE OR REPLACE FUNCTION get_user_info(user_email TEXT)
RETURNS TABLE(
    role TEXT,
    permissions JSONB,
    full_name TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT s.role, s.permissions, s.full_name
    FROM staff s
    WHERE s.email = user_email AND s.active = true;
END;
$$ LANGUAGE plpgsql;

-- 7. Update RLS policies for proper role-based access
-- Drop existing policies
DROP POLICY IF EXISTS "Public read access" ON staff;
DROP POLICY IF EXISTS "Public insert access" ON staff;
DROP POLICY IF EXISTS "Public update access" ON staff;

-- Create role-based policies for staff table
CREATE POLICY "Staff can read own record" ON staff 
    FOR SELECT USING (email = current_setting('app.current_user', true));

CREATE POLICY "Management can read all staff" ON staff 
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM staff 
            WHERE email = current_setting('app.current_user', true) 
            AND role = 'management' 
            AND active = true
        )
    );

CREATE POLICY "Management can update staff" ON staff 
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM staff 
            WHERE email = current_setting('app.current_user', true) 
            AND role = 'management' 
            AND active = true
        )
    );

CREATE POLICY "Management can insert staff" ON staff 
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM staff 
            WHERE email = current_setting('app.current_user', true) 
            AND role = 'management' 
            AND active = true
        )
    );

-- For now, keep tasks accessible to all for compatibility
-- In production, you'd want stricter policies here

SELECT 'Role-based permission system setup complete!' as message;