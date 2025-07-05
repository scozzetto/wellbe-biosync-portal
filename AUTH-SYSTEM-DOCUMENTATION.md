# Be Well LifeStyle Centers - Authentication & Authorization System

## Overview

This comprehensive authentication and authorization system provides secure access control for the Be Well LifeStyle Centers staff portal. The system implements role-based access control (RBAC) with three distinct user roles and granular permissions.

## System Components

### 1. Core Files

- **`auth-system.js`** - Main authentication library
- **`permissions-config.js`** - Tab-level permissions configuration
- **`staff-auth.html`** - Login page with username/password authentication
- **`admin-settings.html`** - Management interface for user creation and role assignment
- **`access-denied.html`** - Access denied page for unauthorized attempts
- **`auth-test.html`** - Comprehensive testing interface
- **`supabase-schema-update.sql`** - Database schema updates

### 2. Authentication Flow

```
User accesses protected page
    ↓
Check if authenticated (auth-system.js)
    ↓
If not authenticated → Redirect to staff-auth.html
    ↓
Username/Password validation
    ↓
If invalid → Show error, allow retry
    ↓
If valid → Create encrypted session
    ↓
Apply role-based permissions
    ↓
Access granted to authorized resources
```

## User Roles & Permissions

### Management Role
- **Access**: All pages, all actions, all tabs
- **Special Privileges**: 
  - User creation and management
  - System settings access
  - View all authentication logs
  - Full admin settings access

### Admin Role
- **Access**: Most pages except user management
- **Pages**: Knowledge base, task management, front desk, inventory, café operations, member portal, admin dashboard
- **Actions**: Read, write, create, update
- **Restrictions**: Cannot create/modify users or access system settings

### Staff Role
- **Access**: Limited to core operational pages
- **Pages**: Knowledge base, task management, front desk, patient check-in, checklists
- **Actions**: Read, write, create
- **Restrictions**: No admin functions, no inventory management, no member management

## Default Accounts

For demo/testing purposes, the system includes default accounts:

```
Admin Account:
Username: admin
Password: BeWell2024!Admin
Role: management

Staff Account:
Username: staff
Password: BeWell2024!Staff
Role: staff
```

## Security Features

### 1. Password Security
- SHA-256 password hashing
- Minimum password requirements enforced
- Failed login attempt tracking
- Account lockout after 5 failed attempts (30-minute lockout)

### 2. Session Management
- Encrypted session storage
- 8-hour session timeout
- 30-minute inactivity timeout
- Automatic session cleanup
- Session validation on page load

### 3. Permission Enforcement
- Page-level access control
- Action-level restrictions (create, read, update, delete)
- Tab-level permissions
- Real-time UI element hiding/disabling
- Server-side validation (when connected to Supabase)

### 4. Security Monitoring
- Authentication event logging
- Failed login tracking
- Session activity monitoring
- Access attempt logging

## Implementation Guide

### 1. Adding Authentication to a New Page

```html
<!DOCTYPE html>
<html>
<head>
    <!-- Include authentication scripts -->
    <script src="permissions-config.js"></script>
    <script src="auth-system.js"></script>
</head>
<body>
    <script>
        // Protect the page
        document.addEventListener('DOMContentLoaded', function() {
            if (!requireAuth('page-name', ['read', 'write'])) {
                return; // Will redirect if not authenticated
            }
        });
    </script>
</body>
</html>
```

### 2. Checking Permissions in JavaScript

```javascript
// Check if user is authenticated
if (window.authSystem.isAuthenticated()) {
    // User is logged in
}

// Get current user
const user = getCurrentUser();

// Check page permission
if (hasPermission('write')) {
    // User can write
}

// Check tab permission
if (hasTabPermission('admin')) {
    // User can access admin tab
}
```

### 3. Role-Based UI Elements

```html
<!-- Button only visible to management -->
<button id="adminBtn" style="display: none;">Admin Function</button>

<script>
const user = getCurrentUser();
if (user && user.role === 'management') {
    document.getElementById('adminBtn').style.display = 'block';
}
</script>
```

## Database Schema

### Staff Table Structure

```sql
CREATE TABLE staff (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE,
    full_name VARCHAR(255),
    role VARCHAR(20) DEFAULT 'staff',
    permissions JSONB DEFAULT '{}',
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by VARCHAR(50),
    updated_by VARCHAR(50),
    last_login TIMESTAMP WITH TIME ZONE,
    login_attempts INTEGER DEFAULT 0,
    locked_until TIMESTAMP WITH TIME ZONE
);
```

### Authentication Logs Table

```sql
CREATE TABLE auth_logs (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50),
    event VARCHAR(50) NOT NULL,
    ip_address INET,
    user_agent TEXT,
    success BOOLEAN DEFAULT true,
    error_message TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Configuration

### Tab Permissions Configuration

The `permissions-config.js` file defines tab-level permissions:

```javascript
tabs: {
    'dashboard': {
        name: 'Dashboard',
        roles: ['management', 'admin', 'staff'],
        actions: ['read']
    },
    'admin': {
        name: 'Admin Settings',
        roles: ['management'],
        actions: ['read', 'write', 'create', 'update', 'delete']
    }
}
```

### Page-to-Tab Mappings

```javascript
pageTabMappings: {
    'staff-knowledge-base.html': ['dashboard'],
    'admin-settings.html': ['admin'],
    'task-management.html': ['tasks']
}
```

## Testing

### 1. Authentication Test Page

Access `auth-test.html` to test:
- Authentication status
- User permissions
- Role-based UI restrictions
- Session management
- Navigation controls

### 2. Manual Testing Checklist

**Authentication Tests:**
- [ ] Login with valid credentials
- [ ] Login with invalid credentials
- [ ] Session persistence across page reloads
- [ ] Automatic logout after inactivity
- [ ] Session expiration handling

**Authorization Tests:**
- [ ] Management user can access all pages
- [ ] Admin user cannot access admin-settings.html
- [ ] Staff user cannot access admin-dashboard.html
- [ ] Proper access denied redirects
- [ ] Role-based UI element visibility

**Security Tests:**
- [ ] Direct URL access blocked when not authenticated
- [ ] Session tampering protection
- [ ] Password strength enforcement
- [ ] Account lockout after failed attempts

## Deployment Considerations

### 1. Environment Variables

```javascript
// Production configuration
const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY;
```

### 2. HTTPS Requirements

- Always use HTTPS in production
- Secure session storage
- CSP headers for XSS protection

### 3. Database Setup

1. Run `supabase-schema-update.sql` to create/update tables
2. Set up Row Level Security (RLS) policies
3. Configure proper user permissions
4. Set up backup and monitoring

## Troubleshooting

### Common Issues

**1. Authentication not working:**
- Check if auth-system.js is loaded
- Verify Supabase connection
- Check browser console for errors

**2. Permissions not applying:**
- Ensure permissions-config.js is loaded before auth-system.js
- Check user role assignment
- Verify tab mappings

**3. Session issues:**
- Clear browser storage
- Check session timeout settings
- Verify encryption/decryption

### Debug Mode

Enable debug logging by setting:
```javascript
window.authSystem.debug = true;
```

## Future Enhancements

1. **Two-Factor Authentication (2FA)**
2. **Single Sign-On (SSO) Integration**
3. **Advanced Audit Logging**
4. **Role-Based Workflows**
5. **IP-Based Access Controls**
6. **Mobile App Authentication**

## Support

For technical support or questions about the authentication system:

- **Primary Contact**: Development Team
- **Documentation**: This file and inline code comments
- **Testing**: Use auth-test.html for comprehensive testing
- **Logs**: Check authentication logs via Admin Settings (management only)

---

**Last Updated**: December 2024  
**Version**: 1.0  
**Compatibility**: Modern browsers, Supabase backend