// Be Well Portal - Interactive JavaScript

// Get patient data from URL parameters or localStorage
function getPatientData() {
    const urlParams = new URLSearchParams(window.location.search);
    const patientName = urlParams.get('name') || localStorage.getItem('patientName') || 'Friend';
    const patientId = urlParams.get('id') || localStorage.getItem('patientId') || generateId();
    
    // Store for future visits
    localStorage.setItem('patientName', patientName);
    localStorage.setItem('patientId', patientId);
    
    return { name: patientName, id: patientId };
}

function generateId() {
    return 'BW' + Date.now().toString(36).toUpperCase();
}

// Initialize the portal
document.addEventListener('DOMContentLoaded', function() {
    const patient = getPatientData();
    
    // Show loading animation
    setTimeout(() => {
        document.getElementById('welcomeScreen').classList.add('hidden');
        document.getElementById('dashboard').classList.remove('hidden');
        initializeDashboard(patient);
    }, 3000);
});

function initializeDashboard(patient) {
    // Set patient name
    document.getElementById('patientName').textContent = patient.name;
    
    // Create avatar with initials
    const avatar = document.getElementById('userAvatar');
    const initials = patient.name.split(' ').map(n => n[0]).join('').toUpperCase();
    avatar.innerHTML = `<span style="color: white; font-weight: 600;">${initials}</span>`;
    avatar.style.display = 'flex';
    avatar.style.alignItems = 'center';
    avatar.style.justifyContent = 'center';
    
    // Animate wellness score
    animateScore();
    
    // Initialize progress chart
    initializeChart();
    
    // Add smooth scrolling
    initializeSmoothScroll();
    
    // Add interactive elements
    addInteractivity();
}

function animateScore() {
    const scoreNumber = document.getElementById('scoreNumber');
    const targetScore = 85;
    let currentScore = 0;
    
    const increment = setInterval(() => {
        currentScore += 2;
        scoreNumber.textContent = currentScore;
        
        if (currentScore >= targetScore) {
            clearInterval(increment);
            scoreNumber.textContent = targetScore;
        }
    }, 30);
    
    // Add gradient to SVG
    const svg = document.querySelector('.score-circle svg');
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    const gradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
    gradient.setAttribute('id', 'gradient');
    gradient.innerHTML = `
        <stop offset="0%" stop-color="#667eea" />
        <stop offset="100%" stop-color="#764ba2" />
    `;
    defs.appendChild(gradient);
    svg.appendChild(defs);
}

function initializeChart() {
    const ctx = document.getElementById('progressChart');
    if (!ctx) return;
    
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            datasets: [
                {
                    label: 'Physical Health',
                    data: [82, 84, 83, 86, 88, 87, 88],
                    borderColor: '#667eea',
                    backgroundColor: 'rgba(102, 126, 234, 0.1)',
                    tension: 0.4
                },
                {
                    label: 'Mental Wellness',
                    data: [78, 80, 79, 81, 82, 83, 82],
                    borderColor: '#764ba2',
                    backgroundColor: 'rgba(118, 75, 162, 0.1)',
                    tension: 0.4
                },
                {
                    label: 'Lifestyle Balance',
                    data: [80, 82, 84, 83, 85, 86, 85],
                    borderColor: '#48bb78',
                    backgroundColor: 'rgba(72, 187, 120, 0.1)',
                    tension: 0.4
                }
            ]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 20,
                        usePointStyle: true
                    }
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    backgroundColor: 'rgba(45, 55, 72, 0.9)',
                    padding: 12,
                    cornerRadius: 8
                }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    min: 70,
                    max: 100,
                    ticks: {
                        callback: function(value) {
                            return value + '%';
                        }
                    }
                }
            },
            interaction: {
                mode: 'nearest',
                axis: 'x',
                intersect: false
            }
        }
    });
}

function initializeSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
                
                // Update active nav
                document.querySelectorAll('.nav-link').forEach(link => {
                    link.classList.remove('active');
                });
                this.classList.add('active');
            }
        });
    });
}

function addInteractivity() {
    // Add click handlers to wellness cards
    document.querySelectorAll('.wellness-card button').forEach(button => {
        button.addEventListener('click', function() {
            const card = this.closest('.wellness-card');
            const title = card.querySelector('h3').textContent;
            showNotification(`${title} module loading...`, 'info');
        });
    });
    
    // Add hover effects to resource cards
    document.querySelectorAll('.resource-card').forEach(card => {
        card.addEventListener('click', function() {
            const title = this.querySelector('h3').textContent;
            showNotification(`Opening ${title}...`, 'info');
        });
    });
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="fas fa-info-circle"></i>
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
        z-index: 1000;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Schedule consultation function
function scheduleConsultation() {
    const patient = getPatientData();
    const message = `Scheduling consultation for ${patient.name} (ID: ${patient.id})`;
    showNotification(message, 'success');
    
    // In real implementation, this would trigger API call
    setTimeout(() => {
        showNotification('Our team will contact you within 24 hours!', 'success');
    }, 1000);
}

// Add notification animations
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

// Track user engagement
function trackEngagement(action, details) {
    const timestamp = new Date().toISOString();
    const patient = getPatientData();
    
    const engagement = {
        patientId: patient.id,
        patientName: patient.name,
        action: action,
        details: details,
        timestamp: timestamp
    };
    
    // Store locally
    const engagements = JSON.parse(localStorage.getItem('engagements') || '[]');
    engagements.push(engagement);
    localStorage.setItem('engagements', JSON.stringify(engagements));
    
    console.log('Engagement tracked:', engagement);
}

// Track page views
window.addEventListener('load', () => {
    trackEngagement('page_view', { page: 'wellness_portal' });
});

// Add real-time updates
function simulateRealTimeUpdates() {
    setInterval(() => {
        // Randomly update wellness scores
        const scores = document.querySelectorAll('.detail-item strong');
        scores.forEach(score => {
            const current = parseInt(score.textContent);
            const change = Math.random() > 0.5 ? 1 : -1;
            const newScore = Math.max(75, Math.min(95, current + change));
            score.textContent = newScore + '%';
        });
    }, 10000); // Update every 10 seconds
}

// Initialize real-time updates
simulateRealTimeUpdates();