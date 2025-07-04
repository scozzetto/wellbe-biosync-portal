-- BE WELL TASK MANAGEMENT DATABASE SETUP
-- Run this in Supabase SQL Editor

-- 1. Create staff users table
CREATE TABLE IF NOT EXISTS staff (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT DEFAULT 'staff' CHECK (role IN ('admin', 'staff', 'viewer')),
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create tasks table with all features
CREATE TABLE IF NOT EXISTS tasks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    description TEXT NOT NULL,
    assigned_to TEXT NOT NULL,
    created_by TEXT NOT NULL,
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
    due_date TIMESTAMPTZ,
    completed BOOLEAN DEFAULT false,
    completed_by TEXT,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create task_comments table for discussion
CREATE TABLE IF NOT EXISTS task_comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
    comment TEXT NOT NULL,
    created_by TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Create activity_log for audit trail
CREATE TABLE IF NOT EXISTS activity_log (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    action TEXT NOT NULL,
    table_name TEXT NOT NULL,
    record_id UUID,
    user_email TEXT NOT NULL,
    details JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Enable Row Level Security
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

-- 6. Create policies for public access (temporary for setup)
CREATE POLICY "Public read access" ON staff FOR SELECT USING (true);
CREATE POLICY "Public insert access" ON staff FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update access" ON staff FOR UPDATE USING (true);

CREATE POLICY "Public read access" ON tasks FOR SELECT USING (true);
CREATE POLICY "Public insert access" ON tasks FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update access" ON tasks FOR UPDATE USING (true);
CREATE POLICY "Public delete access" ON tasks FOR DELETE USING (true);

CREATE POLICY "Public read access" ON task_comments FOR SELECT USING (true);
CREATE POLICY "Public insert access" ON task_comments FOR INSERT WITH CHECK (true);

CREATE POLICY "Public read access" ON activity_log FOR SELECT USING (true);
CREATE POLICY "Public insert access" ON activity_log FOR INSERT WITH CHECK (true);

-- 7. Create indexes for performance
CREATE INDEX idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_created_at ON tasks(created_at DESC);
CREATE INDEX idx_task_comments_task_id ON task_comments(task_id);
CREATE INDEX idx_activity_log_user ON activity_log(user_email);

-- 8. Insert default staff members
INSERT INTO staff (email, full_name, role) VALUES 
    ('silvio@bewelllifestylecenters.com', 'Silvio Cozzetto', 'admin'),
    ('admin@bewelllifestylecenters.com', 'Admin User', 'admin'),
    ('staff1@bewelllifestylecenters.com', 'Staff Member 1', 'staff'),
    ('staff2@bewelllifestylecenters.com', 'Staff Member 2', 'staff')
ON CONFLICT (email) DO NOTHING;

-- 9. Create function to log activities
CREATE OR REPLACE FUNCTION log_activity()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO activity_log (action, table_name, record_id, user_email, details)
    VALUES (
        TG_OP,
        TG_TABLE_NAME,
        CASE 
            WHEN TG_OP = 'DELETE' THEN OLD.id
            ELSE NEW.id
        END,
        COALESCE(NEW.created_by, OLD.created_by, 'system'),
        jsonb_build_object(
            'old', row_to_json(OLD),
            'new', row_to_json(NEW)
        )
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 10. Create triggers for activity logging
CREATE TRIGGER tasks_activity_trigger
AFTER INSERT OR UPDATE OR DELETE ON tasks
FOR EACH ROW EXECUTE FUNCTION log_activity();

-- Success message
SELECT 'Database setup complete! Tables created: staff, tasks, task_comments, activity_log' as message;