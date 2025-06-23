const fs = require('fs');
const path = require('path');

// Simple file-based storage for staff data
const STAFF_FILE = '/tmp/staff-data.json';

// Default staff data
const DEFAULT_STAFF = [
    {
        id: 'admin-001',
        name: 'System Administrator',
        email: 'admin@bewelllifestylecenters.com',
        position: 'Administrator',
        location: 'All',
        accessLevel: 'admin',
        password: '$Be7926570!ADMIN',
        active: true,
        created: new Date().toISOString()
    },
    {
        id: 'staff-001',
        name: 'General Staff',
        email: 'staff@bewelllifestylecenters.com',
        position: 'Staff Member',
        location: 'All',
        accessLevel: 'staff',
        password: '$Be7926570!',
        active: true,
        created: new Date().toISOString()
    }
];

// Load staff data
function loadStaffData() {
    try {
        if (fs.existsSync(STAFF_FILE)) {
            const data = fs.readFileSync(STAFF_FILE, 'utf8');
            return JSON.parse(data);
        }
    } catch (error) {
        console.error('Error loading staff data:', error);
    }
    return DEFAULT_STAFF;
}

// Save staff data
function saveStaffData(staffData) {
    try {
        fs.writeFileSync(STAFF_FILE, JSON.stringify(staffData, null, 2));
        return true;
    } catch (error) {
        console.error('Error saving staff data:', error);
        return false;
    }
}

// Generate random password
function generatePassword() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$';
    let password = '';
    for (let i = 0; i < 12; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
}

exports.handler = async (event, context) => {
    // Enable CORS
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
    };

    // Handle preflight requests
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers,
            body: ''
        };
    }

    try {
        const method = event.httpMethod;
        const body = event.body ? JSON.parse(event.body) : {};
        let staffData = loadStaffData();

        switch (method) {
            case 'GET':
                // Get all staff or specific staff member
                if (event.queryStringParameters?.id) {
                    const staff = staffData.find(s => s.id === event.queryStringParameters.id);
                    return {
                        statusCode: staff ? 200 : 404,
                        headers,
                        body: JSON.stringify(staff || { error: 'Staff not found' })
                    };
                }
                
                // Return all staff (without passwords for security)
                const safeStaffData = staffData.map(staff => ({
                    ...staff,
                    password: '***HIDDEN***'
                }));
                
                return {
                    statusCode: 200,
                    headers,
                    body: JSON.stringify(safeStaffData)
                };

            case 'POST':
                // Add new staff member or authenticate
                if (body.action === 'authenticate') {
                    const { password } = body;
                    const staff = staffData.find(s => s.password === password && s.active);
                    
                    if (staff) {
                        return {
                            statusCode: 200,
                            headers,
                            body: JSON.stringify({
                                success: true,
                                staff: {
                                    id: staff.id,
                                    name: staff.name,
                                    email: staff.email,
                                    position: staff.position,
                                    location: staff.location,
                                    accessLevel: staff.accessLevel,
                                    active: staff.active
                                }
                            })
                        };
                    } else {
                        return {
                            statusCode: 401,
                            headers,
                            body: JSON.stringify({ success: false, message: 'Invalid password' })
                        };
                    }
                }
                
                // Admin authentication
                if (body.action === 'admin-auth') {
                    const { password } = body;
                    if (password === '$Be7926570!ADMIN') {
                        return {
                            statusCode: 200,
                            headers,
                            body: JSON.stringify({ success: true })
                        };
                    } else {
                        return {
                            statusCode: 401,
                            headers,
                            body: JSON.stringify({ success: false, message: 'Invalid admin password' })
                        };
                    }
                }
                
                // Add new staff member
                if (body.action === 'add-staff') {
                    const { name, email, position, location, accessLevel, password } = body;
                    
                    const newStaff = {
                        id: 'staff-' + Date.now(),
                        name,
                        email,
                        position,
                        location,
                        accessLevel,
                        password: password || generatePassword(),
                        active: true,
                        created: new Date().toISOString()
                    };
                    
                    staffData.push(newStaff);
                    
                    if (saveStaffData(staffData)) {
                        return {
                            statusCode: 201,
                            headers,
                            body: JSON.stringify({
                                success: true,
                                staff: newStaff,
                                message: 'Staff member added successfully'
                            })
                        };
                    } else {
                        return {
                            statusCode: 500,
                            headers,
                            body: JSON.stringify({ success: false, message: 'Failed to save staff data' })
                        };
                    }
                }
                break;

            case 'PUT':
                // Update staff member
                const { id, ...updateData } = body;
                const staffIndex = staffData.findIndex(s => s.id === id);
                
                if (staffIndex === -1) {
                    return {
                        statusCode: 404,
                        headers,
                        body: JSON.stringify({ success: false, message: 'Staff not found' })
                    };
                }
                
                // Update staff data
                staffData[staffIndex] = { ...staffData[staffIndex], ...updateData };
                
                if (saveStaffData(staffData)) {
                    return {
                        statusCode: 200,
                        headers,
                        body: JSON.stringify({
                            success: true,
                            staff: staffData[staffIndex],
                            message: 'Staff member updated successfully'
                        })
                    };
                } else {
                    return {
                        statusCode: 500,
                        headers,
                        body: JSON.stringify({ success: false, message: 'Failed to save staff data' })
                    };
                }

            case 'DELETE':
                // Delete staff member
                const staffId = event.queryStringParameters?.id;
                if (!staffId) {
                    return {
                        statusCode: 400,
                        headers,
                        body: JSON.stringify({ success: false, message: 'Staff ID required' })
                    };
                }
                
                const initialLength = staffData.length;
                staffData = staffData.filter(s => s.id !== staffId);
                
                if (staffData.length < initialLength) {
                    if (saveStaffData(staffData)) {
                        return {
                            statusCode: 200,
                            headers,
                            body: JSON.stringify({
                                success: true,
                                message: 'Staff member deleted successfully'
                            })
                        };
                    } else {
                        return {
                            statusCode: 500,
                            headers,
                            body: JSON.stringify({ success: false, message: 'Failed to save staff data' })
                        };
                    }
                } else {
                    return {
                        statusCode: 404,
                        headers,
                        body: JSON.stringify({ success: false, message: 'Staff not found' })
                    };
                }

            default:
                return {
                    statusCode: 405,
                    headers,
                    body: JSON.stringify({ error: 'Method not allowed' })
                };
        }
    } catch (error) {
        console.error('Staff manager error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Internal server error', details: error.message })
        };
    }
};