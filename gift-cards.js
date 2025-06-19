let selectedAmount = 0;

function selectAmount(amount) {
    selectedAmount = amount;
    showGiftCardForm();
    
    // Update button states
    document.querySelectorAll('.amount-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
}

function selectCustomAmount() {
    const customAmount = document.getElementById('custom-amount').value;
    if (customAmount >= 25 && customAmount <= 5000) {
        selectedAmount = parseInt(customAmount);
        showGiftCardForm();
        
        // Clear preset button states
        document.querySelectorAll('.amount-btn').forEach(btn => {
            btn.classList.remove('active');
        });
    } else {
        alert('Please enter an amount between $25 and $5000');
    }
}

function showGiftCardForm() {
    document.getElementById('selected-amount').textContent = selectedAmount;
    document.getElementById('gift-card-form').style.display = 'block';
    document.getElementById('gift-card-form').scrollIntoView({ behavior: 'smooth' });
}

// Handle form submission
document.getElementById('gift-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = {
        recipientName: document.getElementById('recipient-name').value,
        recipientEmail: document.getElementById('recipient-email').value,
        message: document.getElementById('message').value,
        senderName: document.getElementById('sender-name').value,
        senderEmail: document.getElementById('sender-email').value,
        amount: selectedAmount
    };
    
    // Show loading spinner
    document.getElementById('loading').style.display = 'block';
    document.getElementById('gift-card-form').style.display = 'none';
    
    try {
        // Create checkout session for gift card
        const response = await fetch('/.netlify/functions/create-checkout-session', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                type: 'gift-card',
                amount: selectedAmount,
                customerEmail: formData.senderEmail,
                metadata: formData
            })
        });
        
        const data = await response.json();
        
        if (data.url) {
            // Redirect to Stripe Checkout
            window.location.href = data.url;
        } else {
            throw new Error('Failed to create checkout session');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred. Please try again.');
        
        // Hide loading spinner and show form again
        document.getElementById('loading').style.display = 'none';
        document.getElementById('gift-card-form').style.display = 'block';
    }
});