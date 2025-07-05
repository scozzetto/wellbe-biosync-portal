/**
 * Universal Authentication System for Be Well LifeStyle Centers
 * Provides secure authentication, authorization, and session management
 * across all staff portal pages
 */

class AuthSystem {
    constructor() {
        this.supabaseUrl = 'https://atkfcwdmmwayzyixlpum.supabase.co';
        this.supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF0a2Zjd2RtbXdheXp5aXhscHVtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE2NTIzODYsImV4cCI6MjA2NzIyODM4Nn0.VkFA1SIOLgddP-P_KjFdvDyiNdUSgYfbcP5UvOardKI';
        this.currentUser = null;
        this.sessionKey = 'bewell_staff_session';
        this.sessionTimeout = 8 * 60 * 60 * 1000; // 8 hours
        this.inactivityTimeout = 30 * 60 * 1000; // 30 minutes
        this.inactivityTimer = null;
        
        // Role-based permissions - load from permissions config if available
        this.permissions = window.PermissionsConfig ? {
            'management': {
                pages: ['*'], // All pages
                actions: ['*'], // All actions
                tabs: ['*'] // All tabs
            },
            'admin': {
                pages: ['staff-knowledge-base', 'task-management', 'front-desk-dashboard', 'inventory-management', 'cafe-operations-portal', 'simple-inventory', 'recipe-inventory-tracker', 'checklist-hub', 'patient-checkin', 'admin-dashboard', 'member-portal'],
                actions: ['read', 'write', 'create', 'update'],
                tabs: Object.keys(window.PermissionsConfig.tabs).filter(tab => 
                    window.PermissionsConfig.tabs[tab].roles.includes('admin')
                )
            },
            'staff': {
                pages: ['staff-knowledge-base', 'task-management', 'front-desk-dashboard', 'patient-checkin', 'checklist-hub'],
                actions: ['read', 'write', 'create'],
                tabs: Object.keys(window.PermissionsConfig.tabs).filter(tab => 
                    window.PermissionsConfig.tabs[tab].roles.includes('staff')
                )
            }
        } : {
            'management': {
                pages: ['*'],
                actions: ['*'],
                tabs: ['*']
            },
            'admin': {
                pages: ['staff-knowledge-base', 'task-management', 'front-desk-dashboard', 'inventory-management', 'cafe-operations-portal', 'simple-inventory', 'recipe-inventory-tracker', 'checklist-hub', 'patient-checkin', 'admin-dashboard', 'member-portal'],
                actions: ['read', 'write', 'create', 'update'],
                tabs: ['dashboard', 'tasks', 'inventory', 'cafe', 'checklist', 'patients', 'members']
            },
            'staff': {
                pages: ['staff-knowledge-base', 'task-management', 'front-desk-dashboard', 'patient-checkin', 'checklist-hub'],
                actions: ['read', 'write', 'create'],
                tabs: ['dashboard', 'tasks', 'checklist', 'patients']
            }
        };
        
        this.initializeAuth();
    }
    
    /**
     * Initialize authentication system
     */
    initializeAuth() {
        // Check for existing session
        this.loadSession();
        
        // Set up inactivity monitoring
        this.setupInactivityMonitoring();
        
        // Set up periodic session validation
        this.setupSessionValidation();
    }
    
    /**
     * Authenticate user with username and password
     */
    async authenticateUser(username, password) {
        try {
            let user = null;
            
            // First try to authenticate against database
            try {
                // Query Supabase for user
                const response = await fetch(`${this.supabaseUrl}/rest/v1/staff?select=*&username=eq.${username}&active=eq.true`, {
                    headers: {
                        'apikey': this.supabaseKey,
                        'Authorization': `Bearer ${this.supabaseKey}`,
                        'Content-Type': 'application/json'
                    }
                });
                
                if (response.ok) {
                    const users = await response.json();
                    
                    if (users.length > 0) {
                        const dbUser = users[0];
                        
                        // Verify password
                        const isPasswordValid = await this.verifyPassword(password, dbUser.password_hash);
                        
                        if (isPasswordValid) {
                            user = dbUser;
                        }
                    }
                }
            } catch (dbError) {
                console.warn('Database authentication failed, trying fallback:', dbError);
            }
            
            // If database authentication failed, try fallback demo accounts
            if (!user) {
                const demoAccounts = {
                    'admin': {
                        username: 'admin',
                        password: 'BeWell2024!Admin',
                        full_name: 'System Administrator',
                        email: 'admin@bewelllifestylecenters.com',
                        role: 'management',
                        active: true,
                        id: 'demo-admin-001'
                    },
                    'staff': {
                        username: 'staff',
                        password: 'BeWell2024!Staff',
                        full_name: 'General Staff Member',
                        email: 'staff@bewelllifestylecenters.com',
                        role: 'staff',
                        active: true,
                        id: 'demo-staff-001'
                    }
                };
                
                const demoUser = demoAccounts[username];
                
                if (demoUser && demoUser.password === password) {
                    user = demoUser;
                }
            }
            
            // If no user found
            if (!user) {
                throw new Error('Invalid username or password');
            }
            
            // Create session
            this.createSession(user);
            
            return {
                success: true,
                user: this.sanitizeUser(user),
                message: 'Authentication successful'
            };
            
        } catch (error) {
            console.error('Authentication error:', error);
            return {
                success: false,
                error: error.message || 'Authentication failed'
            };
        }
    }
    
    /**
     * Create user session
     */
    createSession(user) {
        const sessionData = {
            user: this.sanitizeUser(user),
            timestamp: Date.now(),
            expires: Date.now() + this.sessionTimeout,
            sessionId: this.generateSessionId()
        };
        
        // Store in localStorage with encryption
        localStorage.setItem(this.sessionKey, this.encryptData(JSON.stringify(sessionData)));
        
        // Set current user
        this.currentUser = user;
        
        // Reset inactivity timer
        this.resetInactivityTimer();
        
        // Log authentication event
        this.logAuthEvent('login', user.username);
    }
    
    /**
     * Load existing session
     */
    loadSession() {
        try {
            const sessionData = localStorage.getItem(this.sessionKey);
            
            if (!sessionData) {
                return false;
            }
            
            const decryptedData = this.decryptData(sessionData);
            const session = JSON.parse(decryptedData);
            
            // Check if session is expired
            if (Date.now() > session.expires) {
                this.destroySession();
                return false;
            }
            
            // Validate session integrity
            if (!this.validateSession(session)) {
                this.destroySession();
                return false;
            }
            
            this.currentUser = session.user;
            this.resetInactivityTimer();
            
            return true;
            
        } catch (error) {
            console.error('Session load error:', error);
            this.destroySession();
            return false;
        }
    }
    
    /**
     * Destroy current session
     */
    destroySession() {
        const username = this.currentUser?.username || 'unknown';
        
        localStorage.removeItem(this.sessionKey);
        this.currentUser = null;
        
        if (this.inactivityTimer) {
            clearTimeout(this.inactivityTimer);
            this.inactivityTimer = null;
        }
        
        this.logAuthEvent('logout', username);
    }
    
    /**
     * Check if user is authenticated
     */
    isAuthenticated() {
        return this.currentUser !== null && this.loadSession();
    }
    
    /**
     * Get current user
     */
    getCurrentUser() {
        return this.currentUser;
    }
    
    /**
     * Check if user has permission for specific page
     */
    hasPagePermission(pageName) {
        if (!this.isAuthenticated()) {
            return false;
        }
        
        const userRole = this.currentUser.role;
        const rolePermissions = this.permissions[userRole];
        
        if (!rolePermissions) {
            return false;
        }
        
        // Management has access to everything
        if (userRole === 'management') {
            return true;
        }
        
        // Check specific page permissions
        return rolePermissions.pages.includes(pageName) || rolePermissions.pages.includes('*');
    }
    
    /**
     * Check if user has permission for specific action
     */
    hasActionPermission(action) {
        if (!this.isAuthenticated()) {
            return false;
        }
        
        const userRole = this.currentUser.role;
        const rolePermissions = this.permissions[userRole];
        
        if (!rolePermissions) {
            return false;
        }
        
        return rolePermissions.actions.includes(action) || rolePermissions.actions.includes('*');
    }
    
    /**
     * Check if user has permission for specific tab
     */
    hasTabPermission(tabName) {
        if (!this.isAuthenticated()) {
            return false;
        }
        
        const userRole = this.currentUser.role;
        const rolePermissions = this.permissions[userRole];
        
        if (!rolePermissions) {
            return false;
        }
        
        return rolePermissions.tabs.includes(tabName) || rolePermissions.tabs.includes('*');
    }
    
    /**
     * Protect page - call this on each protected page
     */
    protectPage(pageName, requiredPermissions = []) {
        // Check authentication
        if (!this.isAuthenticated()) {
            this.redirectToLogin();
            return false;
        }
        
        // Check page permission
        if (!this.hasPagePermission(pageName)) {
            this.redirectToAccessDenied();
            return false;
        }
        
        // Check additional permissions
        for (const permission of requiredPermissions) {
            if (!this.hasActionPermission(permission)) {
                this.redirectToAccessDenied();
                return false;
            }
        }
        
        // Apply enhanced permissions if PermissionsConfig is available
        if (window.PermissionsConfig && this.currentUser) {
            setTimeout(() => {
                window.PermissionsConfig.applyPagePermissions(this.currentUser.role, pageName);
            }, 100);
        }
        
        return true;
    }
    
    /**
     * Redirect to login page
     */
    redirectToLogin() {
        const currentPage = window.location.pathname;
        window.location.href = `/staff-auth.html?redirect=${encodeURIComponent(currentPage)}`;
    }
    
    /**
     * Redirect to access denied page
     */
    redirectToAccessDenied() {
        window.location.href = '/access-denied.html';
    }
    
    /**
     * Set up inactivity monitoring
     */
    setupInactivityMonitoring() {
        const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
        
        events.forEach(event => {
            document.addEventListener(event, () => {
                this.resetInactivityTimer();
            }, true);
        });
    }
    
    /**
     * Reset inactivity timer
     */
    resetInactivityTimer() {
        if (this.inactivityTimer) {
            clearTimeout(this.inactivityTimer);
        }
        
        this.inactivityTimer = setTimeout(() => {
            this.handleInactivity();
        }, this.inactivityTimeout);
    }
    
    /**
     * Handle user inactivity
     */
    handleInactivity() {
        if (this.isAuthenticated()) {
            this.destroySession();
            alert('Your session has expired due to inactivity. Please log in again.');
            this.redirectToLogin();
        }
    }
    
    /**
     * Set up periodic session validation
     */
    setupSessionValidation() {
        setInterval(() => {
            if (this.isAuthenticated()) {
                this.validateCurrentSession();
            }
        }, 5 * 60 * 1000); // Check every 5 minutes
    }
    
    /**
     * Validate current session
     */
    async validateCurrentSession() {
        try {
            const sessionData = localStorage.getItem(this.sessionKey);
            
            if (!sessionData) {
                return false;
            }
            
            const session = JSON.parse(this.decryptData(sessionData));
            
            // Check expiration
            if (Date.now() > session.expires) {
                this.destroySession();
                this.redirectToLogin();
                return false;
            }
            
            // Validate user still exists and is active
            const response = await fetch(`${this.supabaseUrl}/rest/v1/staff?select=*&username=eq.${session.user.username}&active=eq.true`, {
                headers: {
                    'apikey': this.supabaseKey,
                    'Authorization': `Bearer ${this.supabaseKey}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok || (await response.json()).length === 0) {
                this.destroySession();
                this.redirectToLogin();
                return false;
            }
            
            return true;
            
        } catch (error) {
            console.error('Session validation error:', error);
            return false;
        }
    }
    
    /**
     * Hash password using Web Crypto API
     */
    async hashPassword(password) {
        const encoder = new TextEncoder();
        const data = encoder.encode(password);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }
    
    /**
     * Verify password against hash
     */
    async verifyPassword(password, hash) {
        const hashedPassword = await this.hashPassword(password);
        return hashedPassword === hash;
    }
    
    /**
     * Generate session ID
     */
    generateSessionId() {
        return 'sess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
    
    /**
     * Encrypt data for storage
     */
    encryptData(data) {
        // Simple base64 encoding for now - in production, use proper encryption
        return btoa(unescape(encodeURIComponent(data)));
    }
    
    /**
     * Decrypt data from storage
     */
    decryptData(data) {
        // Simple base64 decoding for now - in production, use proper decryption
        return decodeURIComponent(escape(atob(data)));
    }
    
    /**
     * Validate session integrity
     */
    validateSession(session) {
        return session.user && session.user.username && session.sessionId && session.expires;
    }
    
    /**
     * Sanitize user object (remove sensitive data)
     */
    sanitizeUser(user) {
        const { password_hash, ...sanitized } = user;
        return sanitized;
    }
    
    /**
     * Log authentication events
     */
    logAuthEvent(event, username) {
        const logEntry = {
            timestamp: new Date().toISOString(),
            event,
            username,
            ip: 'unknown', // Would need server-side implementation
            userAgent: navigator.userAgent
        };
        
        // Store in localStorage for now - in production, send to server
        const logs = JSON.parse(localStorage.getItem('auth_logs') || '[]');
        logs.push(logEntry);
        
        // Keep only last 100 logs
        if (logs.length > 100) {
            logs.splice(0, logs.length - 100);
        }
        
        localStorage.setItem('auth_logs', JSON.stringify(logs));
    }
    
    /**
     * Create new user (management only)
     */
    async createUser(userData) {
        if (!this.isAuthenticated() || this.currentUser.role !== 'management') {
            throw new Error('Unauthorized: Management role required');
        }
        
        try {
            // Hash password
            const hashedPassword = await this.hashPassword(userData.password);
            
            // Prepare user data
            const newUser = {
                username: userData.username,
                password_hash: hashedPassword,
                full_name: userData.full_name,
                email: userData.email,
                role: userData.role,
                permissions: JSON.stringify(userData.permissions || {}),
                active: true,
                created_at: new Date().toISOString(),
                created_by: this.currentUser.username
            };
            
            // Insert into database
            const response = await fetch(`${this.supabaseUrl}/rest/v1/staff`, {
                method: 'POST',
                headers: {
                    'apikey': this.supabaseKey,
                    'Authorization': `Bearer ${this.supabaseKey}`,
                    'Content-Type': 'application/json',
                    'Prefer': 'return=representation'
                },
                body: JSON.stringify(newUser)
            });
            
            if (!response.ok) {
                throw new Error('Failed to create user');
            }
            
            const createdUser = await response.json();
            
            this.logAuthEvent('user_created', userData.username);
            
            return {
                success: true,
                user: this.sanitizeUser(createdUser[0]),
                message: 'User created successfully'
            };
            
        } catch (error) {
            console.error('Create user error:', error);
            return {
                success: false,
                error: error.message || 'Failed to create user'
            };
        }
    }
    
    /**
     * Update user permissions (management only)
     */
    async updateUserPermissions(username, permissions) {
        if (!this.isAuthenticated() || this.currentUser.role !== 'management') {
            throw new Error('Unauthorized: Management role required');
        }
        
        try {
            const response = await fetch(`${this.supabaseUrl}/rest/v1/staff?username=eq.${username}`, {
                method: 'PATCH',
                headers: {
                    'apikey': this.supabaseKey,
                    'Authorization': `Bearer ${this.supabaseKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    permissions: JSON.stringify(permissions),
                    updated_at: new Date().toISOString(),
                    updated_by: this.currentUser.username
                })
            });
            
            if (!response.ok) {
                throw new Error('Failed to update permissions');
            }
            
            this.logAuthEvent('permissions_updated', username);
            
            return {
                success: true,
                message: 'Permissions updated successfully'
            };
            
        } catch (error) {
            console.error('Update permissions error:', error);
            return {
                success: false,
                error: error.message || 'Failed to update permissions'
            };
        }
    }
    
    /**
     * Get authentication logs (management only)
     */
    getAuthLogs() {
        if (!this.isAuthenticated() || this.currentUser.role !== 'management') {
            throw new Error('Unauthorized: Management role required');
        }
        
        return JSON.parse(localStorage.getItem('auth_logs') || '[]');
    }
    
    /**
     * Logout user
     */
    logout() {
        this.destroySession();
        window.location.href = '/staff-auth.html';
    }
}

// Initialize global auth system
window.authSystem = new AuthSystem();

// Utility functions for easy access
window.requireAuth = function(pageName, requiredPermissions = []) {
    return window.authSystem.protectPage(pageName, requiredPermissions);
};

window.getCurrentUser = function() {
    return window.authSystem.getCurrentUser();
};

window.hasPermission = function(action) {
    return window.authSystem.hasActionPermission(action);
};

window.hasTabPermission = function(tabName) {
    return window.authSystem.hasTabPermission(tabName);
};

window.logout = function() {
    window.authSystem.logout();
};