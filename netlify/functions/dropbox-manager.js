const https = require('https');
const querystring = require('querystring');

// Dropbox API endpoints
const DROPBOX_API_URL = 'https://api.dropboxapi.com/2';
const DROPBOX_CONTENT_URL = 'https://content.dropboxapi.com/2';

// File paths in Dropbox
const STAFF_DATA_PATH = '/bewellbe-data/staff-data.json';
const CONVERSATION_BACKUP_PATH = '/bewellbe-data/conversation-backups/';
const INVENTORY_DATA_PATH = '/bewellbe-data/inventory-data.json';

// Make HTTP request helper
function makeRequest(url, options, data = null) {
    return new Promise((resolve, reject) => {
        const req = https.request(url, options, (res) => {
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => {
                try {
                    const response = JSON.parse(body);
                    if (res.statusCode >= 200 && res.statusCode < 300) {
                        resolve(response);
                    } else {
                        reject(new Error(`HTTP ${res.statusCode}: ${response.error_summary || body}`));
                    }
                } catch (e) {
                    if (res.statusCode >= 200 && res.statusCode < 300) {
                        resolve(body);
                    } else {
                        reject(new Error(`HTTP ${res.statusCode}: ${body}`));
                    }
                }
            });
        });
        
        req.on('error', reject);
        
        if (data) {
            req.write(data);
        }
        req.end();
    });
}

// Download file from Dropbox
async function downloadFile(accessToken, path) {
    const options = {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Dropbox-API-Arg': JSON.stringify({ path })
        }
    };
    
    try {
        const response = await makeRequest(`${DROPBOX_CONTENT_URL}/files/download`, options);
        return JSON.parse(response);
    } catch (error) {
        if (error.message.includes('path/not_found')) {
            return null; // File doesn't exist
        }
        throw error;
    }
}

// Upload file to Dropbox
async function uploadFile(accessToken, path, content) {
    const data = JSON.stringify(content, null, 2);
    const options = {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Dropbox-API-Arg': JSON.stringify({
                path,
                mode: 'overwrite',
                autorename: false
            }),
            'Content-Type': 'application/octet-stream'
        }
    };
    
    return await makeRequest(`${DROPBOX_CONTENT_URL}/files/upload`, options, data);
}

// Create folder if it doesn't exist
async function createFolder(accessToken, path) {
    const options = {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        }
    };
    
    try {
        await makeRequest(`${DROPBOX_API_URL}/files/create_folder_v2`, options, JSON.stringify({ path }));
    } catch (error) {
        if (!error.message.includes('folder_conflict')) {
            throw error;
        }
        // Folder already exists, that's fine
    }
}

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

    // Check for Dropbox access token
    const accessToken = process.env.DROPBOX_ACCESS_TOKEN;
    if (!accessToken) {
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ 
                error: 'Dropbox access token not configured',
                setup_required: true 
            })
        };
    }

    try {
        const method = event.httpMethod;
        const body = event.body ? JSON.parse(event.body) : {};

        // Ensure folder structure exists (ignore errors if folders already exist)
        try {
            await createFolder(accessToken, '/bewellbe-data');
        } catch (err) {
            // Ignore folder exists errors
        }
        
        try {
            await createFolder(accessToken, '/bewellbe-data/conversation-backups');
        } catch (err) {
            // Ignore folder exists errors
        }

        switch (method) {
            case 'GET':
                if (event.path.includes('/conversations')) {
                    // Get conversation backups list
                    const options = {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${accessToken}`,
                            'Content-Type': 'application/json'
                        }
                    };
                    
                    const response = await makeRequest(`${DROPBOX_API_URL}/files/list_folder`, options, 
                        JSON.stringify({ path: CONVERSATION_BACKUP_PATH.slice(0, -1) }));
                    
                    return {
                        statusCode: 200,
                        headers,
                        body: JSON.stringify({
                            conversations: response.entries.filter(entry => entry['.tag'] === 'file')
                        })
                    };
                } else {
                    // Get staff data
                    let staffData = await downloadFile(accessToken, STAFF_DATA_PATH);
                    
                    if (!staffData) {
                        // Initialize with default data
                        staffData = DEFAULT_STAFF;
                        await uploadFile(accessToken, STAFF_DATA_PATH, staffData);
                    }
                    
                    // Return staff data without passwords for admin dashboard
                    const safeStaffData = staffData.map(staff => ({
                        ...staff,
                        password: '***HIDDEN***'
                    }));
                    
                    return {
                        statusCode: 200,
                        headers,
                        body: JSON.stringify(safeStaffData)
                    };
                }

            case 'POST':
                // Handle different actions
                if (body.action === 'get-staff-for-auth') {
                    // Special endpoint that returns full staff data including passwords for auth
                    let staffData = await downloadFile(accessToken, STAFF_DATA_PATH) || DEFAULT_STAFF;
                    
                    return {
                        statusCode: 200,
                        headers,
                        body: JSON.stringify({ staff: staffData })
                    };
                } else if (body.action === 'authenticate') {
                    const { password } = body;
                    let staffData = await downloadFile(accessToken, STAFF_DATA_PATH) || DEFAULT_STAFF;
                    
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
                
                if (body.action === 'add-staff') {
                    const { name, email, position, location, accessLevel, password } = body;
                    
                    let staffData = await downloadFile(accessToken, STAFF_DATA_PATH) || DEFAULT_STAFF;
                    
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
                    
                    // Save to Dropbox
                    await uploadFile(accessToken, STAFF_DATA_PATH, staffData);
                    
                    return {
                        statusCode: 201,
                        headers,
                        body: JSON.stringify({
                            success: true,
                            staff: newStaff,
                            message: 'Staff member added successfully and synced to Dropbox'
                        })
                    };
                }
                
                if (body.action === 'backup-conversation') {
                    const { title, content, timestamp } = body;
                    const filename = `conversation-${timestamp || Date.now()}.json`;
                    const filepath = `${CONVERSATION_BACKUP_PATH}${filename}`;
                    
                    const conversationData = {
                        title: title || 'Claude Conversation Backup',
                        timestamp: timestamp || new Date().toISOString(),
                        content,
                        project: 'Be Well Lifestyle Centers',
                        session_id: `session-${Date.now()}`
                    };
                    
                    await uploadFile(accessToken, filepath, conversationData);
                    
                    return {
                        statusCode: 200,
                        headers,
                        body: JSON.stringify({
                            success: true,
                            message: 'Conversation backed up to Dropbox',
                            filepath
                        })
                    };
                }
                break;

            case 'PUT':
                // Update staff member
                const { id, ...updateData } = body;
                let staffData = await downloadFile(accessToken, STAFF_DATA_PATH) || DEFAULT_STAFF;
                
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
                
                // Save to Dropbox
                await uploadFile(accessToken, STAFF_DATA_PATH, staffData);
                
                return {
                    statusCode: 200,
                    headers,
                    body: JSON.stringify({
                        success: true,
                        staff: staffData[staffIndex],
                        message: 'Staff member updated and synced to Dropbox'
                    })
                };

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
                
                let currentStaffData = await downloadFile(accessToken, STAFF_DATA_PATH) || DEFAULT_STAFF;
                const initialLength = currentStaffData.length;
                currentStaffData = currentStaffData.filter(s => s.id !== staffId);
                
                if (currentStaffData.length < initialLength) {
                    await uploadFile(accessToken, STAFF_DATA_PATH, currentStaffData);
                    
                    return {
                        statusCode: 200,
                        headers,
                        body: JSON.stringify({
                            success: true,
                            message: 'Staff member deleted and synced to Dropbox'
                        })
                    };
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
        console.error('Dropbox manager error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ 
                error: 'Internal server error', 
                details: error.message,
                dropbox_error: true
            })
        };
    }
};