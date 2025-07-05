-- Supabase Schema Update for Authentication System
-- Be Well LifeStyle Centers Staff Authentication

-- Add new columns to existing staff table
ALTER TABLE staff 
ADD COLUMN IF NOT EXISTS username VARCHAR(50) UNIQUE,
ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255),
ADD COLUMN IF NOT EXISTS permissions JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS created_by VARCHAR(50),
ADD COLUMN IF NOT EXISTS updated_by VARCHAR(50),
ADD COLUMN IF NOT EXISTS last_login TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS login_attempts INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS locked_until TIMESTAMP WITH TIME ZONE;

-- Update existing records with default usernames if they don't exist
UPDATE staff 
SET username = LOWER(REPLACE(email, '@bewelllifestylecenters.com', ''))
WHERE username IS NULL AND email IS NOT NULL;

-- Set role field if it doesn't exist (assuming role exists, if not add it)
-- ALTER TABLE staff ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'staff';

-- Update role values to match new system
UPDATE staff SET role = 'management' WHERE role = 'admin' AND email LIKE '%silvio%';
UPDATE staff SET role = 'admin' WHERE role = 'manager';
UPDATE staff SET role = 'staff' WHERE role NOT IN ('management', 'admin');

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_staff_username ON staff(username);
CREATE INDEX IF NOT EXISTS idx_staff_email ON staff(email);
CREATE INDEX IF NOT EXISTS idx_staff_role ON staff(role);
CREATE INDEX IF NOT EXISTS idx_staff_active ON staff(active);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_staff_updated_at ON staff;
CREATE TRIGGER update_staff_updated_at
    BEFORE UPDATE ON staff
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert default admin user if not exists
INSERT INTO staff (
    username, 
    email, 
    full_name, 
    role, 
    password_hash,
    active,
    permissions,
    created_at,
    created_by
) VALUES (
    'admin',
    'admin@bewelllifestylecenters.com',
    'System Administrator',
    'management',
    'e258d248fda94c63753607f7c4494ee0fcbe92f1a76bfdac795c9d84101eb317', -- SHA-256 of 'BeWell2024!Admin'
    true,
    '{"pages": ["*"], "actions": ["*"], "tabs": ["*"]}',
    NOW(),
    'system'
) ON CONFLICT (username) DO NOTHING;

-- Insert default staff user if not exists
INSERT INTO staff (
    username, 
    email, 
    full_name, 
    role, 
    password_hash,
    active,
    permissions,
    created_at,
    created_by
) VALUES (
    'staff',
    'staff@bewelllifestylecenters.com',
    'General Staff Member',
    'staff',
    '8b2c86ea9cf2ea4eb517fd1e06b74f399e7fec0fef92e3b482a6cf2e2b092023', -- SHA-256 of 'BeWell2024!Staff'
    true,
    '{"pages": ["staff-knowledge-base", "task-management", "front-desk-dashboard", "patient-checkin", "checklist-hub"], "actions": ["read", "write", "create"], "tabs": ["dashboard", "tasks", "checklist", "patients"]}',
    NOW(),
    'system'
) ON CONFLICT (username) DO NOTHING;

-- Create authentication log table
CREATE TABLE IF NOT EXISTS auth_logs (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50),
    event VARCHAR(50) NOT NULL,
    ip_address INET,
    user_agent TEXT,
    success BOOLEAN DEFAULT true,
    error_message TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on auth_logs
CREATE INDEX IF NOT EXISTS idx_auth_logs_username ON auth_logs(username);
CREATE INDEX IF NOT EXISTS idx_auth_logs_timestamp ON auth_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_auth_logs_event ON auth_logs(event);

-- Create session management table
CREATE TABLE IF NOT EXISTS user_sessions (
    id SERIAL PRIMARY KEY,
    session_id VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(50) REFERENCES staff(username),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT,
    active BOOLEAN DEFAULT true
);

-- Create indexes on user_sessions
CREATE INDEX IF NOT EXISTS idx_user_sessions_session_id ON user_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_username ON user_sessions(username);
CREATE INDEX IF NOT EXISTS idx_user_sessions_expires_at ON user_sessions(expires_at);

-- Create function to clean up expired sessions
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM user_sessions 
    WHERE expires_at < NOW() OR last_activity < (NOW() - INTERVAL '24 hours');
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Set up Row Level Security (RLS) for staff table
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;

-- Create policy for staff to see their own record and admins to see all
CREATE POLICY staff_access_policy ON staff
    FOR ALL
    USING (
        username = current_setting('app.current_user', true) OR
        current_setting('app.user_role', true) IN ('management', 'admin')
    );

-- Create policy for auth_logs (only management can see all logs)
ALTER TABLE auth_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY auth_logs_access_policy ON auth_logs
    FOR SELECT
    USING (
        username = current_setting('app.current_user', true) OR
        current_setting('app.user_role', true) = 'management'
    );

-- Create policy for user_sessions
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY user_sessions_access_policy ON user_sessions
    FOR ALL
    USING (
        username = current_setting('app.current_user', true) OR
        current_setting('app.user_role', true) IN ('management', 'admin')
    );

-- Grant appropriate permissions
GRANT SELECT, INSERT, UPDATE ON staff TO anon;
GRANT SELECT, INSERT ON auth_logs TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON user_sessions TO anon;

-- Grant sequence permissions
GRANT USAGE ON SEQUENCE auth_logs_id_seq TO anon;
GRANT USAGE ON SEQUENCE user_sessions_id_seq TO anon;

-- Create helper function for authentication
CREATE OR REPLACE FUNCTION authenticate_user(p_username VARCHAR, p_password_hash VARCHAR)
RETURNS TABLE(
    user_id INTEGER,
    username VARCHAR,
    email VARCHAR,
    full_name VARCHAR,
    role VARCHAR,
    permissions JSONB,
    last_login TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        s.id,
        s.username,
        s.email,
        s.full_name,
        s.role,
        s.permissions,
        s.last_login
    FROM staff s
    WHERE s.username = p_username 
        AND s.password_hash = p_password_hash 
        AND s.active = true
        AND (s.locked_until IS NULL OR s.locked_until < NOW());
    
    -- Update last login if user found
    IF FOUND THEN
        UPDATE staff 
        SET last_login = NOW(), login_attempts = 0
        WHERE staff.username = p_username;
    ELSE
        -- Increment login attempts
        UPDATE staff 
        SET login_attempts = COALESCE(login_attempts, 0) + 1,
            locked_until = CASE 
                WHEN COALESCE(login_attempts, 0) + 1 >= 5 
                THEN NOW() + INTERVAL '30 minutes'
                ELSE locked_until
            END
        WHERE staff.username = p_username AND staff.active = true;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comments for documentation
COMMENT ON TABLE staff IS 'Staff members with authentication credentials';
COMMENT ON COLUMN staff.username IS 'Unique username for login';
COMMENT ON COLUMN staff.password_hash IS 'SHA-256 hashed password';
COMMENT ON COLUMN staff.permissions IS 'JSON object containing role-based permissions';
COMMENT ON COLUMN staff.login_attempts IS 'Number of failed login attempts';
COMMENT ON COLUMN staff.locked_until IS 'Account locked until this timestamp';

COMMENT ON TABLE auth_logs IS 'Authentication and authorization event logs';
COMMENT ON TABLE user_sessions IS 'Active user sessions for tracking and security';

-- Sample data for testing (remove in production)
-- These demonstrate the expected data structure