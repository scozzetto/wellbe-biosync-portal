// Check-in bridge - ensures both pages use the same storage
window.CheckinBridge = {
    // Save a check-in
    saveCheckin: function(checkinData) {
        try {
            // Get existing data
            let checkins = this.getAllCheckins();
            
            // Add new check-in
            checkins.push(checkinData);
            
            // Save to multiple places
            localStorage.setItem('patientCheckins', JSON.stringify(checkins));
            localStorage.setItem('checkin_' + checkinData.id, JSON.stringify(checkinData));
            sessionStorage.setItem('patientCheckins', JSON.stringify(checkins));
            
            console.log('Bridge saved checkin:', checkinData.name);
            return true;
        } catch (e) {
            console.error('Bridge save error:', e);
            return false;
        }
    },
    
    // Get all check-ins
    getAllCheckins: function() {
        try {
            // Check localStorage first
            let checkins = JSON.parse(localStorage.getItem('patientCheckins') || '[]');
            
            // Also check for individual items
            const keys = Object.keys(localStorage);
            const individualKeys = keys.filter(key => key.startsWith('checkin_'));
            
            individualKeys.forEach(key => {
                const checkin = JSON.parse(localStorage.getItem(key));
                // Only add if not already in main array
                if (!checkins.find(c => c.id === checkin.id)) {
                    checkins.push(checkin);
                }
            });
            
            // Sort by timestamp
            checkins.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
            
            return checkins;
        } catch (e) {
            console.error('Bridge get error:', e);
            return [];
        }
    },
    
    // Get today's check-ins
    getTodayCheckins: function() {
        const today = new Date().toISOString().split('T')[0];
        return this.getAllCheckins().filter(c => c.dateIn === today);
    },
    
    // Clear all data
    clearAll: function() {
        localStorage.removeItem('patientCheckins');
        sessionStorage.removeItem('patientCheckins');
        
        // Remove individual items
        const keys = Object.keys(localStorage);
        keys.filter(key => key.startsWith('checkin_')).forEach(key => {
            localStorage.removeItem(key);
        });
    }
};