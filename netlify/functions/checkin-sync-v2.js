// Persistent check-in sync using Netlify Blobs
// This ensures data syncs across all devices and browsers

// For now, we'll use a simple in-memory store that persists between function calls
// In production, you'd use a real database like Fauna, MongoDB, or PostgreSQL

// Global store (persists during function warm period)
let checkinsStore = new Map();
let lastCleanup = Date.now();

// Clean up old entries (older than 24 hours)
function cleanupOldCheckins() {
    const now = Date.now();
    const oneDayAgo = now - (24 * 60 * 60 * 1000);
    
    // Only cleanup once per hour
    if (now - lastCleanup < 3600000) return;
    
    for (const [id, checkin] of checkinsStore.entries()) {
        const checkinTime = new Date(checkin.timestamp).getTime();
        if (checkinTime < oneDayAgo) {
            checkinsStore.delete(id);
        }
    }
    lastCleanup = now;
}

exports.handler = async (event, context) => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
        'Content-Type': 'application/json'
    };

    // Handle preflight
    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    try {
        // Clean up old entries periodically
        cleanupOldCheckins();
        
        const today = new Date().toISOString().split('T')[0];
        
        if (event.httpMethod === 'POST') {
            const body = JSON.parse(event.body);
            
            // Handle different actions
            if (body.action === 'delete') {
                // Delete a check-in
                checkinsStore.delete(body.id);
                console.log(`Deleted check-in: ${body.id}`);
                
                return {
                    statusCode: 200,
                    headers,
                    body: JSON.stringify({ 
                        success: true, 
                        message: 'Check-in deleted',
                        id: body.id 
                    })
                };
                
            } else if (body.action === 'archive') {
                // Archive completed check-ins for a specific date
                const archiveDate = body.date || today;
                const archived = [];
                
                for (const [id, checkin] of checkinsStore.entries()) {
                    if (checkin.dateIn === archiveDate && checkin.status === 'completed') {
                        archived.push(checkin);
                        checkinsStore.delete(id);
                    }
                }
                
                console.log(`Archived ${archived.length} check-ins for ${archiveDate}`);
                
                return {
                    statusCode: 200,
                    headers,
                    body: JSON.stringify({ 
                        success: true, 
                        message: `Archived ${archived.length} check-ins`,
                        archived: archived
                    })
                };
                
            } else {
                // Save new or updated check-in
                const checkinData = body;
                
                // Ensure we have required fields
                if (!checkinData.id) {
                    checkinData.id = Date.now().toString();
                }
                if (!checkinData.timestamp) {
                    checkinData.timestamp = new Date().toISOString();
                }
                if (!checkinData.dateIn) {
                    checkinData.dateIn = today;
                }
                
                // Store the check-in
                checkinsStore.set(checkinData.id, checkinData);
                console.log(`Saved check-in: ${checkinData.name} (${checkinData.id})`);
                
                return {
                    statusCode: 200,
                    headers,
                    body: JSON.stringify({ 
                        success: true, 
                        message: 'Check-in saved',
                        id: checkinData.id,
                        checkin: checkinData
                    })
                };
            }
            
        } else if (event.httpMethod === 'GET') {
            // Get all check-ins for today (or specified date)
            const queryDate = event.queryStringParameters?.date || today;
            const checkins = [];
            
            for (const [id, checkin] of checkinsStore.entries()) {
                // Filter by date
                if (checkin.dateIn === queryDate) {
                    checkins.push(checkin);
                }
            }
            
            // Sort by time (newest first)
            checkins.sort((a, b) => {
                const timeA = `${a.dateIn} ${a.timeIn}`;
                const timeB = `${b.dateIn} ${b.timeIn}`;
                return timeB.localeCompare(timeA);
            });
            
            console.log(`Returning ${checkins.length} check-ins for ${queryDate}`);
            
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({ 
                    success: true, 
                    checkins: checkins,
                    count: checkins.length,
                    date: queryDate,
                    totalStored: checkinsStore.size
                })
            };
            
        } else if (event.httpMethod === 'DELETE') {
            // Clear all check-ins (admin function)
            const password = event.queryStringParameters?.password;
            
            if (password === 'bewellclearall2025') {
                const count = checkinsStore.size;
                checkinsStore.clear();
                
                return {
                    statusCode: 200,
                    headers,
                    body: JSON.stringify({ 
                        success: true, 
                        message: `Cleared ${count} check-ins`
                    })
                };
            } else {
                return {
                    statusCode: 403,
                    headers,
                    body: JSON.stringify({ 
                        success: false, 
                        error: 'Unauthorized' 
                    })
                };
            }
        }
        
    } catch (error) {
        console.error('Checkin sync error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ 
                success: false, 
                error: error.message 
            })
        };
    }
    
    return {
        statusCode: 405,
        headers,
        body: JSON.stringify({ error: 'Method not allowed' })
    };
};