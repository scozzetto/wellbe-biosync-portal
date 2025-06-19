// Chat Support Component
function initChatSupport() {
    // Create chat button HTML
    const chatHTML = `
        <div class="chat-support">
            <button id="chat-button" class="chat-btn">
                <i class="fas fa-comment"></i>
                <span>Questions? Chat with us!</span>
            </button>
        </div>
    `;
    
    // Add chat button to body
    document.body.insertAdjacentHTML('beforeend', chatHTML);
    
    // Add click event listener
    document.getElementById('chat-button').addEventListener('click', function() {
        alert('Chat feature coming soon! For immediate assistance, please call (248) 792-6570 or email us at info@bewelllifestylecenters.com');
    });
}

// Initialize when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initChatSupport);
} else {
    initChatSupport();
}