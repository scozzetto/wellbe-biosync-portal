// Salesforce Service Cloud Chat Integration
// This file will be replaced with the Embedded Service code from Salesforce

// SETUP INSTRUCTIONS:
// 1. In Salesforce Setup, search for "Embedded Service"
// 2. Click "New Deployment" 
// 3. Select "Chat" as the channel
// 4. Configure your chat settings:
//    - Chat button position
//    - Pre-chat form fields
//    - Routing to agents/queues
// 5. In the final step, Salesforce will generate JavaScript code
// 6. Replace this entire file with that generated code
// 7. The code will look something like this:

/*
<style type='text/css'>
    .embeddedServiceHelpButton .helpButton .uiButton {
        background-color: #A47C5B;
        font-family: "Arial", sans-serif;
    }
    .embeddedServiceHelpButton .helpButton .uiButton:focus {
        outline: 1px solid #A47C5B;
    }
</style>

<script type='text/javascript' src='https://service.force.com/embeddedservice/5.0/esw.min.js'></script>
<script type='text/javascript'>
    var initESW = function(gslbBaseURL) {
        embedded_svc.settings.displayHelpButton = true;
        embedded_svc.settings.language = '';
        
        embedded_svc.settings.enabledFeatures = ['LiveAgent'];
        embedded_svc.settings.entryFeature = 'LiveAgent';
        
        // YOUR SALESFORCE CONFIGURATION WILL GO HERE
        
        embedded_svc.init(
            'https://YOUR_ORG.my.salesforce.com',
            'https://YOUR_SITE.force.com/liveAgentSetupFlow',
            gslbBaseURL,
            'YOUR_ORG_ID',
            'YOUR_DEPLOYMENT_NAME',
            {
                baseLiveAgentContentURL: 'https://c.la1-c2-ord.salesforceliveagent.com/content',
                deploymentId: 'YOUR_DEPLOYMENT_ID',
                buttonId: 'YOUR_BUTTON_ID',
                baseLiveAgentURL: 'https://d.la1-c2-ord.salesforceliveagent.com/chat',
                eswLiveAgentDevName: 'YOUR_CHAT_DEPLOYMENT',
                isOfflineSupportEnabled: true
            }
        );
    };
    
    if (!window.embedded_svc) {
        var s = document.createElement('script');
        s.setAttribute('src', 'https://YOUR_ORG.my.salesforce.com/embeddedservice/5.0/esw.min.js');
        s.onload = function() {
            initESW(null);
        };
        document.body.appendChild(s);
    } else {
        initESW('https://service.force.com');
    }
</script>
*/

// BENEFITS OF SALESFORCE CHAT:
// - Automatically creates Cases/Leads
// - Routes to correct agents based on skills
// - Full chat transcript saved in Salesforce
// - Pre-chat forms capture customer info
// - Integrates with Knowledge Base
// - Works with Omni-Channel routing

// Temporary membership info popup until chat is integrated
function initChatSupport() {
    // Create chat button HTML
    const chatHTML = `
        <div class="chat-support">
            <button id="chat-button" class="chat-btn">
                <i class="fas fa-comment"></i>
                <span>Questions? Chat with us!</span>
            </button>
        </div>
        
        <!-- Membership Info Modal -->
        <div id="membership-modal" class="chat-modal" style="display: none;">
            <div class="chat-modal-content">
                <span class="close-modal">&times;</span>
                <h2>Be Well Reserve™ Memberships</h2>
                
                <div class="membership-info">
                    <h3>🌟 Restore ($149/month)</h3>
                    <ul>
                        <li>1 wellness service per month</li>
                        <li>$14.90 in Reserve Credits monthly</li>
                        <li>1 complimentary café item</li>
                        <li>Perfect for maintaining your wellness journey</li>
                    </ul>
                    
                    <h3>✨ Revive ($299/month)</h3>
                    <ul>
                        <li>2 wellness services per month</li>
                        <li>$29.90 in Reserve Credits monthly</li>
                        <li>1 complimentary café item</li>
                        <li>Ideal for active wellness maintenance</li>
                    </ul>
                    
                    <h3>🔥 Renew ($499/month)</h3>
                    <ul>
                        <li>3 wellness services per month</li>
                        <li>$49.90 in Reserve Credits monthly</li>
                        <li>2 complimentary café items</li>
                        <li>Comprehensive wellness support</li>
                    </ul>
                    
                    <h3>💎 Total Wellness ($799/month)</h3>
                    <ul>
                        <li>5 wellness services per month</li>
                        <li>$79.90 in Reserve Credits monthly</li>
                        <li>4 complimentary café items</li>
                        <li>Complete transformation package</li>
                    </ul>
                </div>
                
                <div class="membership-benefits">
                    <h3>Why Join Be Well Reserve™?</h3>
                    <p><strong>Save Money:</strong> Services are 30-50% off regular prices</p>
                    <p><strong>Reserve Credits:</strong> 10% back on every dollar spent, use for any service</p>
                    <p><strong>Priority Booking:</strong> Members get first access to appointments</p>
                    <p><strong>Exclusive Perks:</strong> Member-only events and special offers</p>
                    <p><strong>Flexibility:</strong> Credits never expire while membership is active</p>
                </div>
                
                <div class="contact-info">
                    <p><strong>Ready to transform your health?</strong></p>
                    <p>📞 Call: (248) 792-6570</p>
                    <p>📧 Email: info@bewelllifestylecenters.com</p>
                    <a href="https://bewelllifestylecenters.com/membership-purchase.html" class="join-btn" onclick="document.getElementById('membership-modal').style.display='none';">Join Now</a>
                </div>
            </div>
        </div>
    `;
    
    // Add styles for the modal
    const styles = `
        <style>
        .chat-modal {
            position: fixed;
            z-index: 10000;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0,0,0,0.5);
            overflow-y: auto;
            overflow-x: hidden;
        }
        
        .chat-modal-content {
            background-color: #1a1a1a;
            color: #ffffff;
            margin: 5% auto;
            padding: 40px;
            border: 1px solid #A47C5B;
            width: 90%;
            max-width: 700px;
            min-width: 350px;
            border-radius: 10px;
            max-height: 80vh;
            overflow-y: auto;
        }
        
        .chat-modal-content h2, .chat-modal-content h3 {
            color: #A47C5B;
        }
        
        .chat-modal-content p, .chat-modal-content li {
            color: #ffffff;
        }
        
        .close-modal {
            color: #A47C5B;
            float: right;
            font-size: 28px;
            font-weight: bold;
            cursor: pointer;
        }
        
        .close-modal:hover,
        .close-modal:focus {
            color: #ffffff;
        }
        
        .membership-info h3 {
            color: #A47C5B;
            margin-top: 20px;
        }
        
        .membership-info ul {
            margin-left: 20px;
            margin-bottom: 20px;
            line-height: 1.6;
        }
        
        .membership-info li {
            margin-bottom: 5px;
        }
        
        .membership-benefits {
            background-color: rgba(164, 124, 91, 0.1);
            border: 1px solid #A47C5B;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
        }
        
        .membership-benefits p {
            margin: 10px 0;
        }
        
        .contact-info {
            text-align: center;
            margin-top: 30px;
            padding: 20px 0;
            border-top: 1px solid #A47C5B;
        }
        
        .contact-info p {
            margin: 15px 0;
            white-space: nowrap;
            font-size: 16px;
        }
        
        @media (max-width: 768px) {
            .contact-info p {
                white-space: normal;
                font-size: 14px;
            }
            .chat-modal-content {
                padding: 20px;
                width: 95%;
                max-width: 95%;
                min-width: auto;
                margin: 10px auto;
            }
            .membership-info h3 {
                font-size: 18px;
            }
            .membership-info ul {
                margin-left: 15px;
            }
        }
        
        .join-btn {
            display: inline-block;
            background: linear-gradient(135deg, #A47C5B 0%, #8B6349 100%);
            color: white;
            padding: 12px 30px;
            text-decoration: none;
            border-radius: 25px;
            margin-top: 15px;
            transition: transform 0.3s;
        }
        
        .join-btn:hover {
            transform: translateY(-2px);
        }
        </style>
    `;
    
    // Add HTML and styles to body
    document.head.insertAdjacentHTML('beforeend', styles);
    document.body.insertAdjacentHTML('beforeend', chatHTML);
    
    // Get modal elements
    const modal = document.getElementById('membership-modal');
    const btn = document.getElementById('chat-button');
    const span = document.getElementsByClassName('close-modal')[0];
    
    // Open modal when button is clicked
    btn.onclick = function() {
        modal.style.display = 'block';
    }
    
    // Close modal when X is clicked
    span.onclick = function() {
        modal.style.display = 'none';
    }
    
    // Close modal when clicking outside
    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = 'none';
        }
    }
}

// Initialize when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initChatSupport);
} else {
    initChatSupport();
}