// Be Well Admin Dashboard JavaScript

// Sample patient data
const samplePatients = [
    {
        name: 'Sarah Johnson',
        email: 'sarah.j@email.com',
        intakeDate: '2024-03-15',
        wellnessScore: 92,
        status: 'active',
        portalUrl: 'https://sarah-johnson-20240315.netlify.app'
    },
    {
        name: 'Michael Chen',
        email: 'mchen@email.com',
        intakeDate: '2024-03-14',
        wellnessScore: 85,
        status: 'active',
        portalUrl: 'https://michael-chen-20240314.netlify.app'
    },
    {
        name: 'Emma Wilson',
        email: 'emma.w@email.com',
        intakeDate: '2024-03-14',
        wellnessScore: 78,
        status: 'pending',
        portalUrl: null
    },
    {
        name: 'James Martinez',
        email: 'j.martinez@email.com',
        intakeDate: '2024-03-13',
        wellnessScore: 88,
        status: 'active',
        portalUrl: 'https://james-martinez-20240313.netlify.app'
    },
    {
        name: 'Lisa Anderson',
        email: 'lisa.a@email.com',
        intakeDate: '2024-03-13',
        wellnessScore: 91,
        status: 'active',
        portalUrl: 'https://lisa-anderson-20240313.netlify.app'
    }
];

// Initialize dashboard
document.addEventListener('DOMContentLoaded', function() {
    loadPatients();
    initializeEventHandlers();
    animateStats();
});

// Load patients into table
function loadPatients() {
    const tbody = document.getElementById('patientsTableBody');
    tbody.innerHTML = '';
    
    samplePatients.forEach((patient, index) => {
        const row = createPatientRow(patient, index);
        tbody.appendChild(row);
    });
}

// Create patient table row
function createPatientRow(patient, index) {
    const row = document.createElement('tr');
    const initials = patient.name.split(' ').map(n => n[0]).join('');
    
    row.innerHTML = `
        <td>
            <div class="patient-name">
                <div class="patient-avatar">${initials}</div>
                <div>
                    <strong>${patient.name}</strong><br>
                    <small>${patient.email}</small>
                </div>
            </div>
        </td>
        <td>${formatDate(patient.intakeDate)}</td>
        <td>
            <span class="wellness-badge ${getWellnessClass(patient.wellnessScore)}">
                ${patient.wellnessScore}%
            </span>
        </td>
        <td>
            <span class="status-badge ${patient.status}">
                ${patient.status === 'active' ? 'Active' : 'Pending'}
            </span>
        </td>
        <td>
            <div class="action-buttons">
                <button class="action-btn view" onclick="viewPatient('${patient.name}')" title="View Details">
                    <i class="fas fa-eye"></i>
                </button>
                ${patient.status === 'pending' ? 
                    `<button class="action-btn deploy" onclick="deployPortalForPatient('${patient.name}')" title="Deploy Portal">
                        <i class="fas fa-rocket"></i>
                    </button>` : 
                    `<button class="action-btn view" onclick="window.open('${patient.portalUrl}', '_blank')" title="View Portal">
                        <i class="fas fa-external-link-alt"></i>
                    </button>`
                }
            </div>
        </td>
    `;
    
    // Add animation
    row.style.animation = `slideUp 0.5s ease ${index * 0.1}s both`;
    
    return row;
}

// Utility functions
function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
    });
}

function getWellnessClass(score) {
    if (score >= 85) return 'high';
    if (score >= 70) return 'medium';
    return 'low';
}

// Event handlers
function initializeEventHandlers() {
    // Navigation
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
            this.classList.add('active');
        });
    });
    
    // Deploy form
    const deployForm = document.getElementById('deployForm');
    if (deployForm) {
        deployForm.addEventListener('submit', handleDeploy);
    }
}

// Show quick deploy modal
function showQuickDeploy() {
    const modal = document.getElementById('quickDeployModal');
    modal.classList.add('show');
}

// Close modal
function closeModal() {
    const modal = document.getElementById('quickDeployModal');
    modal.classList.remove('show');
    document.getElementById('deployForm').reset();
}

// Handle deploy form submission
async function handleDeploy(e) {
    e.preventDefault();
    
    const patientName = document.getElementById('patientName').value;
    const patientEmail = document.getElementById('patientEmail').value;
    const wellnessScore = document.getElementById('wellnessScore').value;
    const htmlContent = document.getElementById('htmlContent').value;
    
    // Show loading state
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Deploying...';
    submitBtn.disabled = true;
    
    // Simulate deployment
    setTimeout(() => {
        // Generate project name
        const date = new Date().toISOString().split('T')[0].replace(/-/g, '');
        const projectName = `${patientName.toLowerCase().replace(/\s+/g, '-')}-${date}`;
        const portalUrl = `https://${projectName}.netlify.app`;
        
        // Add to patients list
        const newPatient = {
            name: patientName,
            email: patientEmail,
            intakeDate: new Date().toISOString().split('T')[0],
            wellnessScore: parseInt(wellnessScore),
            status: 'active',
            portalUrl: portalUrl
        };
        
        samplePatients.unshift(newPatient);
        loadPatients();
        
        // Show success message
        showNotification(`Portal deployed successfully for ${patientName}!`, 'success');
        
        // Generate Salesforce entry
        const salesforceEntry = generateSalesforceEntry(newPatient);
        console.log('Salesforce Entry:', salesforceEntry);
        
        // Reset form and close modal
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
        closeModal();
        
        // Open portal in new tab
        setTimeout(() => {
            if (confirm(`Portal deployed! Open ${portalUrl} in a new tab?`)) {
                window.open(portalUrl, '_blank');
            }
        }, 500);
    }, 2000);
}

// Generate Salesforce entry
function generateSalesforceEntry(patient) {
    const today = new Date().toLocaleDateString('en-US');
    return {
        resourceName: `${patient.name} BioSync Intake ${today}`,
        url: patient.portalUrl,
        projectName: patient.portalUrl.split('.')[0].replace('https://', ''),
        type: 'BioSync Patient Portal',
        dateCreated: today,
        status: 'Active',
        wellnessScore: patient.wellnessScore
    };
}

// Action functions
function viewPatient(patientName) {
    showNotification(`Opening details for ${patientName}...`, 'info');
}

function deployPortalForPatient(patientName) {
    document.getElementById('patientName').value = patientName;
    showQuickDeploy();
}

function processIntake() {
    window.location.href = 'formassembly.html';
}

function deployPortal() {
    showQuickDeploy();
}

function generateReport() {
    showNotification('Generating wellness analytics report...', 'info');
    setTimeout(() => {
        showNotification('Report generated successfully!', 'success');
    }, 2000);
}

function scheduleFollowUp() {
    showNotification('Opening scheduling system...', 'info');
}

// Show notification
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    
    const icons = {
        info: 'fa-info-circle',
        success: 'fa-check-circle',
        error: 'fa-exclamation-circle'
    };
    
    notification.innerHTML = `
        <i class="fas ${icons[type]}"></i>
        <span>${message}</span>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: white;
        padding: 15px 25px;
        border-radius: 8px;
        box-shadow: 0 5px 20px rgba(0,0,0,0.1);
        display: flex;
        align-items: center;
        gap: 10px;
        z-index: 2000;
        animation: slideIn 0.3s ease;
        border-left: 4px solid ${type === 'success' ? '#48bb78' : type === 'error' ? '#f56565' : '#667eea'};
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Animate statistics on load
function animateStats() {
    const statNumbers = document.querySelectorAll('.stat-number');
    
    statNumbers.forEach(stat => {
        const target = parseInt(stat.textContent);
        let current = 0;
        const increment = target / 50;
        
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }
            
            // Format based on content
            if (stat.textContent.includes('%')) {
                stat.textContent = Math.floor(current) + '%';
            } else {
                stat.textContent = Math.floor(current).toLocaleString();
            }
        }, 30);
    });
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

// Click outside modal to close
window.onclick = function(event) {
    const modal = document.getElementById('quickDeployModal');
    if (event.target === modal) {
        closeModal();
    }
};

// Auto-refresh data every 30 seconds
setInterval(() => {
    // In production, this would fetch real data
    console.log('Refreshing patient data...');
}, 30000);