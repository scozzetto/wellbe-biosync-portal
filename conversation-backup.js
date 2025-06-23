// Conversation Backup System for Dropbox
class ConversationBackup {
    constructor() {
        this.backupEnabled = true;
        this.autoBackupInterval = 5 * 60 * 1000; // 5 minutes
        this.conversationHistory = [];
        this.sessionId = 'session-' + Date.now();
        
        // Start auto-backup if enabled
        if (this.backupEnabled) {
            this.startAutoBackup();
        }
    }
    
    // Add a message to the conversation history
    addMessage(type, content, timestamp = null) {
        const message = {
            type: type, // 'user' or 'assistant'
            content: content,
            timestamp: timestamp || new Date().toISOString(),
            sessionId: this.sessionId
        };
        
        this.conversationHistory.push(message);
        
        // Auto-backup after certain number of messages
        if (this.conversationHistory.length % 10 === 0) {
            this.backupToDropbox('Auto-backup every 10 messages');
        }
    }
    
    // Backup conversation to Dropbox
    async backupToDropbox(title = null) {
        try {
            const backupData = {
                title: title || `Be Well Project Conversation - ${new Date().toLocaleDateString()}`,
                sessionId: this.sessionId,
                timestamp: new Date().toISOString(),
                messageCount: this.conversationHistory.length,
                conversation: this.conversationHistory,
                project: 'Be Well Lifestyle Centers',
                topics: this.extractTopics(),
                summary: this.generateSummary()
            };
            
            const response = await fetch('/.netlify/functions/dropbox-manager', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'backup-conversation',
                    title: backupData.title,
                    content: backupData,
                    timestamp: Date.now()
                })
            });
            
            if (response.ok) {
                const result = await response.json();
                console.log('✅ Conversation backed up to Dropbox:', result.filepath);
                this.showBackupStatus('✅ Backed up to Dropbox', 'success');
                return true;
            } else {
                console.error('❌ Dropbox backup failed');
                this.showBackupStatus('❌ Backup failed', 'error');
                return false;
            }
        } catch (error) {
            console.error('Error backing up conversation:', error);
            this.showBackupStatus('⚠️ Backup error', 'warning');
            return false;
        }
    }
    
    // Extract topics from conversation
    extractTopics() {
        const topics = new Set();
        
        this.conversationHistory.forEach(message => {
            const content = message.content.toLowerCase();
            
            // Look for key topics
            if (content.includes('inventory') || content.includes('café') || content.includes('vendor')) {
                topics.add('Inventory Management');
            }
            if (content.includes('staff') || content.includes('login') || content.includes('password')) {
                topics.add('Staff Management');
            }
            if (content.includes('dropbox') || content.includes('backup')) {
                topics.add('Dropbox Integration');
            }
            if (content.includes('membership') || content.includes('member')) {
                topics.add('Membership System');
            }
            if (content.includes('patient') || content.includes('check-in')) {
                topics.add('Patient Check-in');
            }
            if (content.includes('website') || content.includes('portal')) {
                topics.add('Website Development');
            }
        });
        
        return Array.from(topics);
    }
    
    // Generate conversation summary
    generateSummary() {
        if (this.conversationHistory.length === 0) {
            return 'Empty conversation';
        }
        
        const lastMessages = this.conversationHistory.slice(-5);
        const recentTopics = this.extractTopics();
        
        return `Conversation with ${this.conversationHistory.length} messages. Recent topics: ${recentTopics.join(', ')}. Latest activity focused on Be Well Lifestyle Centers project development.`;
    }
    
    // Show backup status to user
    showBackupStatus(message, type) {
        // Create or update status indicator
        let statusDiv = document.getElementById('backup-status');
        if (!statusDiv) {
            statusDiv = document.createElement('div');
            statusDiv.id = 'backup-status';
            statusDiv.style.cssText = `
                position: fixed;
                top: 10px;
                right: 10px;
                z-index: 9999;
                padding: 8px 12px;
                border-radius: 6px;
                font-size: 0.8rem;
                font-weight: 600;
                max-width: 200px;
                transition: all 0.3s ease;
            `;
            document.body.appendChild(statusDiv);
        }
        
        // Set colors based on type
        const colors = {
            success: { bg: '#10b981', text: 'white' },
            error: { bg: '#ef4444', text: 'white' },
            warning: { bg: '#f59e0b', text: 'white' }
        };
        
        const color = colors[type] || colors.warning;
        statusDiv.style.backgroundColor = color.bg;
        statusDiv.style.color = color.text;
        statusDiv.textContent = message;
        
        // Auto-hide after 3 seconds
        setTimeout(() => {
            if (statusDiv) {
                statusDiv.style.opacity = '0';
                setTimeout(() => {
                    if (statusDiv && statusDiv.parentNode) {
                        statusDiv.parentNode.removeChild(statusDiv);
                    }
                }, 300);
            }
        }, 3000);
    }
    
    // Start automatic backup
    startAutoBackup() {
        setInterval(() => {
            if (this.conversationHistory.length > 0) {
                this.backupToDropbox('Auto-backup');
            }
        }, this.autoBackupInterval);
    }
    
    // Manual backup with custom title
    async manualBackup(title) {
        return await this.backupToDropbox(title);
    }
    
    // Get conversation history
    getHistory() {
        return this.conversationHistory;
    }
    
    // Clear conversation history
    clearHistory() {
        this.conversationHistory = [];
        this.sessionId = 'session-' + Date.now();
    }
    
    // Load conversation from backup (placeholder for future feature)
    async loadFromBackup(sessionId) {
        // This would fetch a specific conversation from Dropbox
        console.log('Load from backup feature - coming soon');
    }
}

// Initialize backup system
const conversationBackup = new ConversationBackup();

// Add backup button to pages
function addBackupButton() {
    const backupButton = document.createElement('button');
    backupButton.innerHTML = '💾 Backup Conversation';
    backupButton.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        z-index: 9999;
        background: linear-gradient(135deg, #6366f1, #8b5cf6);
        color: white;
        padding: 10px 15px;
        border: none;
        border-radius: 8px;
        font-size: 0.9rem;
        font-weight: 600;
        cursor: pointer;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        transition: transform 0.3s ease;
    `;
    
    backupButton.addEventListener('click', async () => {
        const title = prompt('Enter backup title (optional):') || 'Manual backup';
        const success = await conversationBackup.manualBackup(title);
        if (success) {
            alert('✅ Conversation backed up to Dropbox successfully!');
        } else {
            alert('❌ Backup failed. Please check your Dropbox configuration.');
        }
    });
    
    backupButton.addEventListener('mouseenter', () => {
        backupButton.style.transform = 'translateY(-2px)';
    });
    
    backupButton.addEventListener('mouseleave', () => {
        backupButton.style.transform = 'translateY(0)';
    });
    
    document.body.appendChild(backupButton);
}

// Auto-add backup button when page loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', addBackupButton);
} else {
    addBackupButton();
}

// Simulate conversation logging (for demonstration)
// In a real implementation, this would hook into the actual chat interface
setTimeout(() => {
    conversationBackup.addMessage('user', 'We were working on the Be Well website inventory system');
    conversationBackup.addMessage('assistant', 'I\'ve created a complete Dropbox integration for staff management and conversation backups');
}, 1000);

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ConversationBackup;
}

// Make available globally
window.ConversationBackup = ConversationBackup;
window.conversationBackup = conversationBackup;