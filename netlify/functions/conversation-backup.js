// Conversation Backup Function
exports.handler = async (event, context) => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
    };
    
    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }
    
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
    }
    
    try {
        const { conversation, sessionId, topic } = JSON.parse(event.body);
        const dropboxToken = process.env.DROPBOX_ACCESS_TOKEN;
        
        if (!dropboxToken) {
            console.error('No Dropbox token found');
            return { statusCode: 500, headers, body: JSON.stringify({ error: 'Dropbox not configured' }) };
        }
        
        // Create filename with timestamp
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `/bewellbe-data/conversation-backups/conversation-${sessionId || timestamp}.json`;
        
        // Prepare conversation data
        const backupData = {
            timestamp: new Date().toISOString(),
            sessionId: sessionId || `session-${Date.now()}`,
            topic: topic || 'Be Well Website Development',
            conversation: conversation,
            metadata: {
                project: 'Be Well Lifestyle Centers',
                developer: 'Claude',
                user: 'Silvio',
                backupVersion: '1.0'
            }
        };
        
        // Upload to Dropbox
        const https = require('https');
        
        const uploadOptions = {
            hostname: 'content.dropboxapi.com',
            path: '/2/files/upload',
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${dropboxToken}`,
                'Content-Type': 'application/octet-stream',
                'Dropbox-API-Arg': JSON.stringify({
                    path: filename,
                    mode: 'overwrite',
                    autorename: true,
                    mute: false
                })
            }
        };
        
        return new Promise((resolve, reject) => {
            const req = https.request(uploadOptions, (res) => {
                let body = '';
                res.on('data', chunk => body += chunk);
                res.on('end', () => {
                    if (res.statusCode === 200) {
                        resolve({
                            statusCode: 200,
                            headers,
                            body: JSON.stringify({ 
                                success: true, 
                                message: 'Conversation backed up successfully',
                                filename: filename
                            })
                        });
                    } else {
                        console.error('Dropbox upload failed:', body);
                        resolve({
                            statusCode: res.statusCode,
                            headers,
                            body: JSON.stringify({ error: 'Backup failed', details: body })
                        });
                    }
                });
            });
            
            req.on('error', (error) => {
                console.error('Request error:', error);
                resolve({
                    statusCode: 500,
                    headers,
                    body: JSON.stringify({ error: 'Network error', details: error.message })
                });
            });
            
            req.write(JSON.stringify(backupData));
            req.end();
        });
        
    } catch (error) {
        console.error('Backup error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Internal error', details: error.message })
        };
    }
};