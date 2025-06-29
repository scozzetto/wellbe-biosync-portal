// Automatic Conversation Backup System
// Include this on every page to auto-backup conversations

(function() {
    // Configuration
    const BACKUP_INTERVAL = 5 * 60 * 1000; // 5 minutes
    const MESSAGE_THRESHOLD = 10; // Backup every 10 messages
    
    let messageCount = 0;
    let lastBackup = Date.now();
    let conversationData = [];
    
    // Capture all page content changes
    const observer = new MutationObserver(function(mutations) {
        messageCount++;
        
        // Capture current state
        const snapshot = {
            timestamp: new Date().toISOString(),
            url: window.location.href,
            title: document.title,
            content: document.body.innerText.slice(0, 5000) // First 5000 chars
        };
        
        conversationData.push(snapshot);
        
        // Check if we should backup
        const timeSinceLastBackup = Date.now() - lastBackup;
        
        if (messageCount >= MESSAGE_THRESHOLD || timeSinceLastBackup >= BACKUP_INTERVAL) {
            performBackup();
        }
    });
    
    // Start observing
    observer.observe(document.body, {
        childList: true,
        subtree: true,
        characterData: true
    });
    
    // Backup function
    async function performBackup() {
        console.log('🔄 Auto-backing up conversation...');
        
        try {
            const response = await fetch('/.netlify/functions/conversation-backup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    conversation: {
                        data: conversationData,
                        pageUrl: window.location.href,
                        timestamp: new Date().toISOString(),
                        messageCount: messageCount,
                        context: {
                            project: 'Be Well Lifestyle Centers',
                            currentWork: getCurrentWork()
                        }
                    },
                    sessionId: getSessionId(),
                    topic: `Auto-backup: ${document.title}`
                })
            });
            
            if (response.ok) {
                console.log('✅ Conversation auto-backed up to Dropbox');
                messageCount = 0;
                lastBackup = Date.now();
                conversationData = []; // Clear after successful backup
                
                // Show subtle notification
                showBackupNotification();
            }
        } catch (error) {
            console.error('Backup failed:', error);
        }
    }
    
    // Get or create session ID
    function getSessionId() {
        let sessionId = sessionStorage.getItem('backupSessionId');
        if (!sessionId) {
            sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            sessionStorage.setItem('backupSessionId', sessionId);
        }
        return sessionId;
    }
    
    // Detect current work context
    function getCurrentWork() {
        const url = window.location.pathname;
        if (url.includes('inventory')) return 'Inventory Management System';
        if (url.includes('staff')) return 'Staff Login System';
        if (url.includes('vendor')) return 'Vendor Management';
        if (url.includes('recipe')) return 'Recipe Tracking';
        return 'General Development';
    }
    
    // Show backup notification
    function showBackupNotification() {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: #4CAF50;
            color: white;
            padding: 10px 20px;
            border-radius: 5px;
            font-family: system-ui, -apple-system, sans-serif;
            font-size: 14px;
            z-index: 10000;
            animation: slideIn 0.3s ease;
        `;
        notification.innerHTML = '✅ Conversation auto-saved to Dropbox';
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
    
    // Add CSS animations
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
    `;
    document.head.appendChild(style);
    
    // Manual backup button removed for production
    // Auto-backup still runs in the background without UI
    
    // Auto-backup on page unload
    window.addEventListener('beforeunload', () => {
        if (conversationData.length > 0) {
            // Use sendBeacon for reliable unload backup
            const data = JSON.stringify({
                conversation: conversationData,
                sessionId: getSessionId(),
                topic: 'Page unload backup'
            });
            
            navigator.sendBeacon('/.netlify/functions/conversation-backup', data);
        }
    });
    
    // Initial backup after 30 seconds
    setTimeout(performBackup, 30000);
    
    console.log('🔄 Auto-backup system activated');
})();