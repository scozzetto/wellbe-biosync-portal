exports.handler = async (event, context) => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
    };

    // Handle preflight
    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    try {
        if (event.httpMethod === 'POST') {
            // Save new check-in
            const checkinData = JSON.parse(event.body);
            
            // In a real app, you'd save to a database
            // For now, we'll use a simple file-based approach
            const fs = require('fs').promises;
            const path = require('path');
            
            // Create data directory if it doesn't exist
            const dataDir = '/tmp/checkins';
            try {
                await fs.mkdir(dataDir, { recursive: true });
            } catch (e) {
                // Directory might already exist
            }
            
            // Save individual checkin file
            const filename = `checkin_${checkinData.id}.json`;
            const filepath = path.join(dataDir, filename);
            await fs.writeFile(filepath, JSON.stringify(checkinData));
            
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({ 
                    success: true, 
                    message: 'Check-in saved',
                    id: checkinData.id 
                })
            };
            
        } else if (event.httpMethod === 'GET') {
            // Get all check-ins
            const fs = require('fs').promises;
            const path = require('path');
            
            const dataDir = '/tmp/checkins';
            let checkins = [];
            
            try {
                const files = await fs.readdir(dataDir);
                const checkinFiles = files.filter(f => f.startsWith('checkin_') && f.endsWith('.json'));
                
                for (const file of checkinFiles) {
                    const filepath = path.join(dataDir, file);
                    const content = await fs.readFile(filepath, 'utf8');
                    checkins.push(JSON.parse(content));
                }
                
                // Sort by timestamp
                checkins.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
                
            } catch (e) {
                console.log('No checkins directory or files:', e.message);
            }
            
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({ 
                    success: true, 
                    checkins: checkins,
                    count: checkins.length
                })
            };
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