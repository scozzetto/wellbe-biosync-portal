/**
 * Tab-Level Permissions Configuration
 * Be Well LifeStyle Centers Staff Portal
 */

window.PermissionsConfig = {
    // Tab definitions with their required permissions
    tabs: {
        'dashboard': {
            name: 'Dashboard',
            description: 'Main dashboard and overview',
            roles: ['management', 'admin', 'staff'],
            actions: ['read']
        },
        'tasks': {
            name: 'Task Management',
            description: 'Create and manage tasks',
            roles: ['management', 'admin', 'staff'],
            actions: ['read', 'write', 'create']
        },
        'inventory': {
            name: 'Inventory Management',
            description: 'Manage inventory and supplies',
            roles: ['management', 'admin'],
            actions: ['read', 'write', 'create', 'update']
        },
        'cafe': {
            name: 'Café Operations',
            description: 'Café ordering and management',
            roles: ['management', 'admin', 'staff'],
            actions: ['read', 'write']
        },
        'checklist': {
            name: 'Checklists',
            description: 'Daily checklists and procedures',
            roles: ['management', 'admin', 'staff'],
            actions: ['read', 'write']
        },
        'patients': {
            name: 'Patient Management',
            description: 'Patient check-in and management',
            roles: ['management', 'admin', 'staff'],
            actions: ['read', 'write']
        },
        'members': {
            name: 'Member Portal',
            description: 'Member management and portal',
            roles: ['management', 'admin'],
            actions: ['read', 'write', 'update']
        },
        'admin': {
            name: 'Admin Settings',
            description: 'User management and system settings',
            roles: ['management'],
            actions: ['read', 'write', 'create', 'update', 'delete']
        },
        'reports': {
            name: 'Reports & Analytics',
            description: 'View reports and analytics',
            roles: ['management', 'admin'],
            actions: ['read']
        }
    },

    // Page-to-tab mappings
    pageTabMappings: {
        'staff-knowledge-base.html': ['dashboard'],
        'task-management.html': ['tasks'],
        'task-management-v2.html': ['tasks'],
        'front-desk-dashboard.html': ['dashboard', 'patients'],
        'inventory-management.html': ['inventory'],
        'simple-inventory.html': ['inventory'],
        'cafe-operations-portal.html': ['cafe'],
        'recipe-inventory-tracker.html': ['cafe', 'inventory'],
        'checklist-hub.html': ['checklist'],
        'patient-checkin.html': ['patients'],
        'admin-dashboard.html': ['admin', 'members'],
        'member-portal.html': ['members'],
        'admin-settings.html': ['admin']
    },

    // Action-based restrictions
    actionRestrictions: {
        'create': {
            description: 'Create new items',
            elements: [
                'button[onclick*="create"]',
                'button[onclick*="add"]',
                '.create-btn',
                '.add-btn',
                'input[type="submit"]'
            ]
        },
        'update': {
            description: 'Edit existing items',
            elements: [
                'button[onclick*="edit"]',
                'button[onclick*="update"]',
                '.edit-btn',
                '.update-btn'
            ]
        },
        'delete': {
            description: 'Delete items',
            elements: [
                'button[onclick*="delete"]',
                'button[onclick*="remove"]',
                '.delete-btn',
                '.remove-btn'
            ]
        },
        'write': {
            description: 'Modify data',
            elements: [
                'input:not([readonly])',
                'textarea:not([readonly])',
                'select:not([disabled])',
                'form'
            ]
        }
    },

    // Role hierarchy (higher roles inherit lower role permissions)
    roleHierarchy: {
        'management': 100,
        'admin': 50,
        'staff': 10
    },

    // Check if user has tab permission
    hasTabPermission: function(userRole, tabName) {
        const tab = this.tabs[tabName];
        if (!tab) return false;
        
        return tab.roles.includes(userRole) || userRole === 'management';
    },

    // Check if user has action permission for a tab
    hasTabActionPermission: function(userRole, tabName, action) {
        if (!this.hasTabPermission(userRole, tabName)) {
            return false;
        }
        
        const tab = this.tabs[tabName];
        return tab.actions.includes(action) || userRole === 'management';
    },

    // Get tabs accessible by role
    getAccessibleTabs: function(userRole) {
        const accessibleTabs = [];
        
        for (const [tabName, tab] of Object.entries(this.tabs)) {
            if (this.hasTabPermission(userRole, tabName)) {
                accessibleTabs.push({
                    name: tabName,
                    ...tab
                });
            }
        }
        
        return accessibleTabs;
    },

    // Get tabs for a specific page
    getPageTabs: function(pageName) {
        return this.pageTabMappings[pageName] || [];
    },

    // Apply permissions to current page
    applyPagePermissions: function(userRole, pageName) {
        const pageTabs = this.getPageTabs(pageName);
        
        // Check if user has access to any tab on this page
        const hasAccess = pageTabs.some(tabName => 
            this.hasTabPermission(userRole, tabName)
        );
        
        if (!hasAccess && pageTabs.length > 0) {
            // User doesn't have access to any tab on this page
            window.location.href = '/access-denied.html';
            return false;
        }
        
        // Apply action-based restrictions
        this.applyActionRestrictions(userRole, pageTabs);
        
        // Apply tab-specific UI modifications
        this.applyTabUI(userRole, pageTabs);
        
        return true;
    },

    // Apply action-based restrictions to page elements
    applyActionRestrictions: function(userRole, pageTabs) {
        for (const [action, restriction] of Object.entries(this.actionRestrictions)) {
            // Check if user has this action permission for any tab on this page
            const hasAction = pageTabs.some(tabName => 
                this.hasTabActionPermission(userRole, tabName, action)
            );
            
            if (!hasAction) {
                // Hide or disable elements for this action
                restriction.elements.forEach(selector => {
                    const elements = document.querySelectorAll(selector);
                    elements.forEach(element => {
                        if (action === 'write') {
                            // For write actions, make inputs readonly
                            if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                                element.setAttribute('readonly', true);
                                element.style.opacity = '0.6';
                            } else if (element.tagName === 'SELECT') {
                                element.setAttribute('disabled', true);
                                element.style.opacity = '0.6';
                            }
                        } else {
                            // For other actions, hide elements
                            element.style.display = 'none';
                        }
                    });
                });
            }
        }
    },

    // Apply tab-specific UI modifications
    applyTabUI: function(userRole, pageTabs) {
        // Add role indicator to page
        this.addRoleIndicator(userRole);
        
        // Add permission indicator for tabs
        this.addTabPermissionIndicators(userRole, pageTabs);
        
        // Hide navigation items user doesn't have access to
        this.hideInaccessibleNavigation(userRole);
    },

    // Add role indicator to page
    addRoleIndicator: function(userRole) {
        const roleIndicator = document.createElement('div');
        roleIndicator.id = 'role-indicator';
        roleIndicator.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 20px;
            background: var(--primary-color, #A47C5B);
            color: white;
            padding: 8px 12px;
            border-radius: 6px;
            font-size: 0.8rem;
            font-weight: 600;
            z-index: 1000;
            box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        `;
        roleIndicator.innerHTML = `<i class="fas fa-user"></i> ${userRole.toUpperCase()}`;
        
        // Remove existing indicator
        const existing = document.getElementById('role-indicator');
        if (existing) {
            existing.remove();
        }
        
        document.body.appendChild(roleIndicator);
    },

    // Add permission indicators for tabs
    addTabPermissionIndicators: function(userRole, pageTabs) {
        // Add tooltips to restricted elements
        const restrictedElements = document.querySelectorAll('[readonly], [disabled]');
        restrictedElements.forEach(element => {
            if (!element.title) {
                element.title = `Access restricted - ${userRole} role permissions`;
                element.style.cursor = 'not-allowed';
            }
        });
    },

    // Hide navigation items user doesn't have access to
    hideInaccessibleNavigation: function(userRole) {
        // Hide links to pages user can't access
        const allLinks = document.querySelectorAll('a[href]');
        allLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (href && href.endsWith('.html')) {
                const pageName = href.split('/').pop();
                const pageTabs = this.getPageTabs(pageName);
                
                if (pageTabs.length > 0) {
                    const hasAccess = pageTabs.some(tabName => 
                        this.hasTabPermission(userRole, tabName)
                    );
                    
                    if (!hasAccess) {
                        link.style.display = 'none';
                    }
                }
            }
        });
    },

    // Initialize permissions for current page
    initializePermissions: function() {
        // Wait for auth system to be ready
        document.addEventListener('DOMContentLoaded', function() {
            if (window.getCurrentUser) {
                const currentUser = window.getCurrentUser();
                if (currentUser) {
                    const pageName = window.location.pathname.split('/').pop();
                    window.PermissionsConfig.applyPagePermissions(currentUser.role, pageName);
                }
            }
        });
    }
};

// Auto-initialize permissions
window.PermissionsConfig.initializePermissions();