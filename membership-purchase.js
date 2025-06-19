// Stripe public key - replace with your actual public key
const STRIPE_PUBLIC_KEY = 'pk_test_your_stripe_public_key_here';

// Membership price IDs - replace with your actual Stripe price IDs
const MEMBERSHIP_PRICES = {
    'restore': 'price_restore_id',
    'revive': 'price_revive_id',
    'renew': 'price_renew_id',
    'total-wellness': 'price_total_wellness_id'
};

let selectedMembership = null;

function selectMembership(type) {
    selectedMembership = type;
    
    // Hide membership cards and show checkout form
    document.querySelector('.membership-cards').style.display = 'none';
    document.getElementById('checkout-form').style.display = 'block';
    
    // Update form heading
    const membershipName = type.charAt(0).toUpperCase() + type.slice(1).replace('-', ' ');
    document.querySelector('#checkout-form h2').textContent = `Complete Your ${membershipName} Membership`;
}

// Handle form submission
document.getElementById('membership-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const name = document.getElementById('name').value;
    
    // Show loading spinner
    document.getElementById('loading').style.display = 'block';
    document.getElementById('checkout-form').style.display = 'none';
    
    try {
        // Create checkout session
        const response = await fetch('/.netlify/functions/create-checkout-session', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                type: 'membership',
                priceId: MEMBERSHIP_PRICES[selectedMembership],
                customerEmail: email
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
        document.getElementById('checkout-form').style.display = 'block';
    }
});

// Chat button functionality
document.getElementById('chat-button').addEventListener('click', function() {
    alert('Chat feature coming soon! For immediate assistance, please call (248) 792-6570 or email us at info@bewelllifestylecenters.com');
});