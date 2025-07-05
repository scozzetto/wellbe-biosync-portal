# Role-Based Permission System Guide

## Overview

The task management system now includes a comprehensive role-based permission system that controls what users can see and do based on their assigned role. This ensures proper security and workflow management within your organization.

## Database Setup

### 1. Update Your Database

Run the SQL scripts in the following order:

1. First, run `supabase-setup-clean.sql` if you haven't already
2. Then, run `supabase-role-permissions-update.sql` to add the permission system

### 2. Database Schema Changes

The role-based system adds:
- `permissions` JSONB field to the `staff` table
- New role: `management` (highest level)
- Permission checking functions
- Enhanced RLS policies

## User Roles and Permissions

### Management Role
**Highest level access - Full system control**
- ✅ Create, edit, and delete all tasks
- ✅ View all tasks
- ✅ Manage staff accounts (add, edit, deactivate)
- ✅ Change staff roles and permissions
- ✅ Access all reports
- ✅ Full system administration

### Admin Role
**High level access - Full task management**
- ✅ Create, edit, and delete all tasks
- ✅ View all tasks
- ✅ Complete any task
- ✅ Access reports
- ❌ Cannot manage staff accounts

### Staff Role
**Standard user access - Own tasks only**
- ✅ Create new tasks
- ✅ Edit and delete own tasks
- ✅ View only assigned tasks
- ❌ Cannot view all tasks
- ❌ Cannot manage staff

### Viewer Role
**Read-only access - Limited viewing**
- ✅ View assigned tasks only
- ❌ Cannot create, edit, or delete tasks
- ❌ Cannot access staff management
- ❌ Limited to viewing only

## Permission Functions

The system includes several permission checking functions:

### Task Permissions
```javascript
canCreateTask(user)          // Check if user can create tasks
canEditTask(user, task)      // Check if user can edit specific task
canDeleteTask(user, task)    // Check if user can delete specific task
canViewAllTasks(user)        // Check if user can view all tasks
```

### Staff Management Permissions
```javascript
canManageStaff(user)         // Check if user can manage staff
```

## UI Features

### Role-Based Interface
- Buttons and features are hidden/shown based on permissions
- Permission info boxes explain user limitations
- Filter options adjust based on viewing permissions
- Staff management interface only visible to management users

### Staff Management Interface
Available only to Management role users:
- Add new staff members
- Edit existing staff (name, email, role)
- Activate/deactivate staff accounts
- View all staff information with role indicators

### Task Visibility
- **Management/Admin**: See all tasks
- **Staff**: See only their assigned tasks and tasks they created
- **Viewer**: See only tasks assigned to them

## Security Features

### Permission Validation
- All task operations check permissions before executing
- Database-level permission validation
- Client-side UI restrictions
- Server-side permission enforcement

### Role-Based Statistics
- Task counts adjust based on what user can see
- "My Tasks" always shows user's assigned tasks
- Other stats respect permission boundaries

## Setting Up Users

### Adding Management Users
1. Use the staff management interface (if you're already management)
2. Or update the database directly:
```sql
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
WHERE email = 'your-email@domain.com';
```

### Default Users
The system creates these default users:
- `silvio@bewelllifestylecenters.com` - Management role
- `admin@bewelllifestylecenters.com` - Management role

## Best Practices

### Role Assignment
1. **Management**: Only for owners/senior managers
2. **Admin**: For department heads/supervisors
3. **Staff**: For regular employees
4. **Viewer**: For contractors/temporary access

### Security Guidelines
1. Regularly review staff roles and permissions
2. Deactivate accounts when staff leave
3. Use the principle of least privilege
4. Monitor activity through the audit log

### Workflow Recommendations
1. Management users handle staff onboarding
2. Staff create and manage their own tasks
3. Admins can step in to help with any task
4. Viewers are assigned specific tasks to monitor

## Troubleshooting

### Common Issues

**User can't see any tasks**
- Check if user exists in staff table
- Verify user has `active = true`
- Ensure user has appropriate permissions

**Permission denied errors**
- Check user role and permissions in database
- Verify user is logged in correctly
- Check browser console for detailed errors

**Staff management not visible**
- Only Management role users can see this feature
- Check user role in database
- Refresh page after role changes

### Database Queries for Troubleshooting

Check user permissions:
```sql
SELECT email, role, permissions, active 
FROM staff 
WHERE email = 'user@domain.com';
```

View all roles:
```sql
SELECT email, full_name, role, active 
FROM staff 
ORDER BY role, full_name;
```

## Migration from Previous Version

If upgrading from a previous version:
1. Run the database update script
2. Existing users will get default permissions based on their role
3. Review and adjust permissions as needed
4. Test with different user roles

## API Integration

The permission system works with:
- Supabase Row Level Security (RLS)
- Real-time subscriptions
- Database triggers and functions
- Client-side validation

## Support

For technical support or questions about the permission system:
1. Check the browser console for errors
2. Verify database permissions
3. Review this documentation
4. Contact system administrator

---

**Last Updated**: December 2024
**Version**: 2.0 with Role-Based Permissions