// BioSync Analysis System

// Services catalog
const BEWELL_SERVICES = {
    musculoskeletal: {
        title: "🔹 Musculoskeletal Optimization",
        description: "For posture, performance, and pain relief:",
        services: ["Chiropractic", "Dry Needling", "Cupping", "Compression Therapy"]
    },
    regenerative: {
        title: "🔹 Regenerative Recovery & Performance",
        description: "To support muscle gain, energy, and sleep quality:",
        services: ["IV Vitamin Therapy", "Vitamin Injections", "Peptide Therapy", "Massage Therapy"]
    },
    longevity: {
        title: "🔹 Longevity & Anti-Aging Support",
        description: "To support hormonal balance and cellular health:",
        services: ["Peptide Therapy Consultation", "Future bloodwork to guide personalized care", "12-Week Total Transformation Program"]
    },
    nutrition: {
        title: "🔹 Nutritional & Lifestyle Enhancement",
        description: "To align nutrition with your physical goals:",
        services: ["Be Well Café options (high-protein meals, smoothies, clean snacks)", 
                  "Supplementation guidance (based on future lab results and preferences)",
                  "Weekly coaching and habit support through our Transformation System"]
    }
};

// Initialize upload functionality
document.addEventListener('DOMContentLoaded', function() {
    initializeUpload();
});

function initializeUpload() {
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput');
    
    // Drag and drop functionality
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    });
    
    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('dragover');
    });
    
    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFileUpload(files[0]);
        }
    });
    
    // Click to upload
    uploadArea.addEventListener('click', () => {
        fileInput.click();
    });
    
    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleFileUpload(e.target.files[0]);
        }
    });
}

function handleFileUpload(file) {
    // Display file info
    const uploadArea = document.getElementById('uploadArea');
    uploadArea.classList.add('file-selected');
    
    const fileInfo = `
        <div class="file-info">
            <i class="fas fa-file-alt"></i>
            <div class="file-details">
                <div class="file-name">${file.name}</div>
                <div class="file-size">${formatFileSize(file.size)}</div>
            </div>
            <button class="btn-primary" onclick="processFile()">
                <i class="fas fa-check"></i> Analyze
            </button>
        </div>
    `;
    
    uploadArea.innerHTML += fileInfo;
    
    // Store file for processing
    window.uploadedFile = file;
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function processFile() {
    // Hide upload section, show analysis
    document.getElementById('uploadSection').classList.add('hidden');
    document.getElementById('analysisSection').classList.remove('hidden');
    
    // Simulate analysis progress
    simulateAnalysis();
}

function simulateAnalysis() {
    const progressFill = document.getElementById('progressFill');
    const analysisStatus = document.getElementById('analysisStatus');
    
    const steps = [
        { progress: 20, status: "Reading form data..." },
        { progress: 40, status: "Analyzing health goals..." },
        { progress: 60, status: "Matching services to your needs..." },
        { progress: 80, status: "Creating personalized recommendations..." },
        { progress: 100, status: "Finalizing your BioSync plan..." }
    ];
    
    let currentStep = 0;
    
    const interval = setInterval(() => {
        if (currentStep < steps.length) {
            progressFill.style.width = steps[currentStep].progress + '%';
            analysisStatus.textContent = steps[currentStep].status;
            currentStep++;
        } else {
            clearInterval(interval);
            setTimeout(() => {
                showResults();
            }, 500);
        }
    }, 800);
}

async function showResults() {
    // Parse the uploaded file
    const formData = await parseUploadedFile(window.uploadedFile);
    
    // Analyze with ChatGPT
    try {
        const analysis = await analyzeWithChatGPT(formData);
        
        // Hide analysis, show results
        document.getElementById('analysisSection').classList.add('hidden');
        document.getElementById('resultsSection').classList.remove('hidden');
        
        // Display the AI-generated results
        displayAIResults(formData, analysis);
    } catch (error) {
        console.error('Analysis error:', error);
        showNotification('Error analyzing form. Please check your API key.', 'error');
        // Fall back to demo mode
        showDemoResults();
    }
}

function displayResults(data) {
    // Display client info
    const clientInfo = document.getElementById('clientInfo');
    clientInfo.innerHTML = `
        <p><strong>Client:</strong> ${data.name}</p>
        <p><strong>Date Submitted:</strong> ${data.date}</p>
        <p><strong>Referred By:</strong> ${data.referredBy}</p>
        <p><strong>Motivation Level:</strong> 🔟 (Extremely Motivated)</p>
        <p><strong>Primary Goals Identified:</strong></p>
        <ul style="list-style: none; padding: 0;">
            ${data.goals.map(goal => `<li>• ${goal}</li>`).join('')}
        </ul>
    `;
    
    // Display recommendations
    const recommendationsGrid = document.getElementById('recommendationsGrid');
    recommendationsGrid.innerHTML = `
        <h2 style="grid-column: 1/-1;">🧭 ${data.name.split(' ')[0]}, Here's What We Recommend Based on Your Goals</h2>
        <p style="grid-column: 1/-1; margin-bottom: 30px;">You're a strong candidate for a multi-disciplinary approach focused on regeneration, recovery, and performance enhancement. Here are the areas we suggest exploring to support your transformation:</p>
    `;
    
    // Add service recommendations
    Object.values(BEWELL_SERVICES).forEach(category => {
        const card = createRecommendationCard(category);
        recommendationsGrid.innerHTML += card;
    });
    
    // Display next steps
    const nextStepsContent = document.getElementById('nextStepsContent');
    nextStepsContent.innerHTML = `
        <p style="margin-bottom: 20px;">Based on your goals and service selections, here are our initial recommendations to begin your transformation:</p>
        <div class="step-item">
            <i class="fas fa-check"></i>
            <span>Begin with a Transformation Intake Session to map out your personalized program</span>
        </div>
        <div class="step-item">
            <i class="fas fa-check"></i>
            <span>Consider scheduling a Chiropractic Assessment and Massage Consultation</span>
        </div>
        <div class="step-item">
            <i class="fas fa-check"></i>
            <span>Explore Dry Needling, Cupping, and Compression Therapy for musculoskeletal support</span>
        </div>
        <div class="step-item">
            <i class="fas fa-check"></i>
            <span>Book an IV or Vitamin Injection Consultation for energy, performance, and recovery</span>
        </div>
        <div class="step-item">
            <i class="fas fa-check"></i>
            <span>Schedule a Peptide Therapy Intro Session to discuss options for hormone and aging support</span>
        </div>
        <div class="step-item">
            <i class="fas fa-check"></i>
            <span>Plan for Initial Bloodwork to guide a targeted therapy and supplement strategy</span>
        </div>
    `;
}

function createRecommendationCard(category) {
    return `
        <div class="recommendation-card">
            <h3>${category.title}</h3>
            <p>${category.description}</p>
            <ul class="service-list">
                ${category.services.map(service => `<li>${service}</li>`).join('')}
            </ul>
        </div>
    `;
}

function scheduleConsultation() {
    // Redirect to Be Well booking page
    showNotification('Redirecting to appointment booking...', 'success');
    setTimeout(() => {
        window.location.href = 'https://bewelllifestylecenters.com/book-an-appointment/';
    }, 1000);
}

function downloadPlan() {
    // In production, this would generate a PDF
    showNotification('PDF download feature coming soon!', 'info');
}

function startNewAnalysis() {
    // Reset the form
    location.reload();
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check' : 'info'}-circle"></i>
        <span>${message}</span>
    `;
    
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

// Add animation styles
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

// FormAssembly Integration (for future implementation)
function parseFormAssemblyData(data) {
    // This function will parse the actual FormAssembly submission
    // and extract relevant fields for analysis
    // TO BE IMPLEMENTED based on actual form structure
    return {
        name: data.name || "Client",
        email: data.email,
        phone: data.phone,
        referredBy: data.referredBy,
        motivationLevel: data.motivationLevel,
        goals: data.goals || [],
        healthConcerns: data.healthConcerns || [],
        preferences: data.preferences || []
    };
}

// Parse uploaded file
async function parseUploadedFile(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = (e) => {
            try {
                const content = e.target.result;
                let formData;
                
                // Try to parse as JSON first
                if (file.name.endsWith('.json')) {
                    formData = JSON.parse(content);
                } else {
                    // Parse as text/CSV
                    formData = parseTextContent(content);
                }
                
                resolve(formData);
            } catch (error) {
                reject(error);
            }
        };
        
        reader.readAsText(file);
    });
}

// Parse text content into structured data
function parseTextContent(content) {
    console.log('Raw file content:', content); // Debug log
    
    // Enhanced parsing for Be Well BioSync form
    const lines = content.split('\n');
    const data = {
        name: '',
        email: '',
        phone: '',
        referredBy: '',
        motivationLevel: '',
        goals: [],
        healthConcerns: [],
        preferredFormat: '',
        currentChallenges: [],
        timestamp: new Date().toISOString(),
        rawContent: content // Keep raw content for debugging
    };
    
    // Try different parsing strategies
    
    // Strategy 1: Standard key:value format
    lines.forEach(line => {
        const cleanLine = line.trim();
        if (!cleanLine) return;
        
        // Name variations (more flexible matching)
        if (cleanLine.match(/name|full.?name|first.?name|client.?name/i) && cleanLine.includes(':')) {
            const value = cleanLine.split(':').slice(1).join(':').trim();
            if (value && value !== '') data.name = value;
        }
        
        // Email variations
        if (cleanLine.match(/email|e.?mail|contact.?email/i) && cleanLine.includes(':')) {
            const value = cleanLine.split(':').slice(1).join(':').trim();
            if (value && value !== '') data.email = value;
        }
        
        // Phone variations
        if (cleanLine.match(/phone|cell|mobile|telephone/i) && cleanLine.includes(':')) {
            const value = cleanLine.split(':').slice(1).join(':').trim();
            if (value && value !== '') data.phone = value;
        }
        
        // Referral variations
        if (cleanLine.match(/referred.?by|referral|how.?did.?you.?hear|source/i) && cleanLine.includes(':')) {
            const value = cleanLine.split(':').slice(1).join(':').trim();
            if (value && value !== '') data.referredBy = value;
        }
        
        // Motivation variations
        if (cleanLine.match(/motivation|committed|dedication|scale/i) && cleanLine.includes(':')) {
            const value = cleanLine.split(':').slice(1).join(':').trim();
            if (value && value !== '') data.motivationLevel = value;
        }
        
        // Goals variations
        if (cleanLine.match(/goals|objectives|targets|want.?to.?achieve/i) && cleanLine.includes(':')) {
            const goalsText = cleanLine.split(':').slice(1).join(':').trim();
            if (goalsText && goalsText !== '') {
                data.goals = goalsText.split(/[,;|]/).map(g => g.trim()).filter(g => g);
            }
        }
        
        // Health concerns
        if (cleanLine.match(/concerns|challenges|issues|problems|health.?concerns/i) && cleanLine.includes(':')) {
            const concernsText = cleanLine.split(':').slice(1).join(':').trim();
            if (concernsText && concernsText !== '') {
                data.healthConcerns = concernsText.split(/[,;|]/).map(c => c.trim()).filter(c => c);
            }
        }
    });
    
    // Strategy 2: CSV-style parsing (if it's a CSV export)
    if (content.includes(',') && content.includes('"')) {
        const csvLines = content.split('\n');
        if (csvLines.length > 1) {
            const headers = csvLines[0].split(',').map(h => h.replace(/"/g, '').trim().toLowerCase());
            const values = csvLines[1].split(',').map(v => v.replace(/"/g, '').trim());
            
            headers.forEach((header, index) => {
                const value = values[index] || '';
                if (header.includes('name') && !data.name) data.name = value;
                if (header.includes('email') && !data.email) data.email = value;
                if (header.includes('phone') && !data.phone) data.phone = value;
                if (header.includes('refer') && !data.referredBy) data.referredBy = value;
                if (header.includes('motivation') && !data.motivationLevel) data.motivationLevel = value;
            });
        }
    }
    
    // Strategy 3: Look for common goal keywords in the entire content
    const goalKeywords = ['Muscle Gain', 'Weight Loss', 'Pain Relief', 'Better Sleep', 
                         'Reverse Aging', 'Athletic Performance', 'Longevity', 'Energy', 
                         'Stress Management', 'Hormone Balance', 'Fat Loss', 'Fitness',
                         'Wellness', 'Recovery', 'Strength', 'Endurance'];
    
    goalKeywords.forEach(goal => {
        if (content.toLowerCase().includes(goal.toLowerCase()) && !data.goals.includes(goal)) {
            data.goals.push(goal);
        }
    });
    
    // Strategy 4: Extract any person-like names from the content
    if (!data.name) {
        // Try multiple name patterns
        const namePatterns = [
            /([A-Z][a-z]+ [A-Z][a-z]+)/g, // Standard First Last
            /Name[:\s]+([A-Z][a-z]+ [A-Z][a-z]+)/gi, // After "Name:"
            /Client[:\s]+([A-Z][a-z]+ [A-Z][a-z]+)/gi, // After "Client:"
            /([A-Z][a-z]+\s+[A-Z][a-z]+)/g // Alternative pattern
        ];
        
        for (const pattern of namePatterns) {
            const matches = content.match(pattern);
            if (matches && matches.length > 0) {
                // Clean up the match (remove "Name:" etc.)
                let name = matches[0].replace(/^(Name|Client)[:\s]+/gi, '').trim();
                if (name && name.length > 3 && name.includes(' ')) {
                    data.name = name;
                    break;
                }
            }
        }
    }
    
    // Strategy 5: Extract email addresses
    if (!data.email) {
        const emailPattern = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
        const emailMatches = content.match(emailPattern);
        if (emailMatches && emailMatches.length > 0) {
            data.email = emailMatches[0];
        }
    }
    
    // Strategy 6: Extract phone numbers
    if (!data.phone) {
        const phonePattern = /(\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4})/g;
        const phoneMatches = content.match(phonePattern);
        if (phoneMatches && phoneMatches.length > 0) {
            data.phone = phoneMatches[0];
        }
    }
    
    console.log('Parsed data:', data); // Debug log
    
    // If still no name found, show what we're working with
    if (!data.name && content.length > 0) {
        console.log('No name found. First 200 chars of content:', content.substring(0, 200));
        // Try one more aggressive search
        const allCapWords = content.match(/[A-Z][a-z]+/g);
        if (allCapWords && allCapWords.length >= 2) {
            console.log('Found capitalized words:', allCapWords);
            // Take first two capitalized words as potential name
            data.name = `${allCapWords[0]} ${allCapWords[1]}`;
        }
    }
    
    return data;
}

// ChatGPT Analysis Function
async function analyzeWithChatGPT(formData) {
    // Check if API key is configured
    if (!window.API_CONFIG || !window.API_CONFIG.apiKey || window.API_CONFIG.apiKey === 'YOUR_OPENAI_API_KEY_HERE') {
        throw new Error('OpenAI API key not configured');
    }
    
    // Prepare the prompt
    const userPrompt = `
        Please analyze this health inquiry form and provide personalized recommendations:
        
        Client Name: ${formData.name || 'Guest Client'}
        Email: ${formData.email || 'Not provided'}
        Phone: ${formData.phone || 'Not provided'}
        Referred By: ${formData.referredBy || 'Self-referred'}
        Motivation Level: ${formData.motivationLevel || 'High (assumed)'}
        Primary Goals: ${formData.goals && formData.goals.length > 0 ? formData.goals.join(', ') : 'General wellness and health optimization'}
        Health Concerns: ${formData.healthConcerns && formData.healthConcerns.length > 0 ? formData.healthConcerns.join(', ') : 'General health improvement'}
        
        RAW FORM CONTENT FOR ADDITIONAL CONTEXT:
        ${formData.rawContent ? formData.rawContent.substring(0, 1000) : 'No additional content available'}
        
        IMPORTANT: Even if some information is missing, please still create a comprehensive BioSync analysis. Use the available information and make reasonable assumptions for general wellness goals. Always provide the full format with:
        1. Personalized greeting using their name (or "Guest" if no name)
        2. Summary of their goals and motivation
        3. Recommended services in our four categories
        4. Specific next steps they should take
        5. Encouragement to schedule a consultation
        
        Do not refuse to create an analysis due to missing information - instead, provide general wellness recommendations.
    `;
    
    // Make API call to ChatGPT
    const response = await fetch(window.API_CONFIG.endpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${window.API_CONFIG.apiKey}`
        },
        body: JSON.stringify({
            model: window.API_CONFIG.model,
            messages: [
                {
                    role: 'system',
                    content: window.API_CONFIG.systemPrompt
                },
                {
                    role: 'user',
                    content: userPrompt
                }
            ],
            temperature: 0.7,
            max_tokens: 2000
        })
    });
    
    if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    return data.choices[0].message.content;
}

// Display AI-generated results
function displayAIResults(formData, aiAnalysis) {
    // Parse the AI response and display it
    const clientInfo = document.getElementById('clientInfo');
    clientInfo.innerHTML = `
        <p><strong>Client:</strong> ${formData.name || 'Guest'}</p>
        <p><strong>Date Submitted:</strong> ${new Date().toLocaleDateString()}</p>
        <p><strong>Analysis Generated by:</strong> ChatGPT-4 BioSync™</p>
    `;
    
    // Display the AI analysis
    const recommendationsGrid = document.getElementById('recommendationsGrid');
    recommendationsGrid.innerHTML = `
        <div style="grid-column: 1/-1; white-space: pre-wrap; line-height: 1.8;">
            ${aiAnalysis}
        </div>
    `;
    
    // Update next steps if AI provided them
    const nextStepsContent = document.getElementById('nextStepsContent');
    nextStepsContent.innerHTML = `
        <p style="margin-bottom: 20px;">Your personalized BioSync™ analysis has been generated based on your health inquiry.</p>
        <div class="step-item">
            <i class="fas fa-check"></i>
            <span>Review your personalized recommendations above</span>
        </div>
        <div class="step-item">
            <i class="fas fa-check"></i>
            <span>Schedule your initial consultation to begin your transformation</span>
        </div>
    `;
}

// Demo mode fallback
function showDemoResults() {
    const clientData = {
        name: "Demo Client",
        date: new Date().toLocaleDateString(),
        referredBy: "Website",
        motivationLevel: "10",
        goals: ["Muscle Gain", "Pain Relief", "Better Sleep", "Reverse Aging", "Athletic Performance", "Longevity"]
    };
    
    displayResults(clientData);
}