const nodemailer = require('nodemailer');

// In-memory storage (in production, use a proper database)
let inventoryStorage = {};

const handler = async (event, context) => {
    // CORS headers
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
    };

    // Handle preflight requests
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers,
            body: ''
        };
    }

    try {
        const method = event.httpMethod;
        const path = event.path;
        
        console.log(`Inventory Manager - ${method} ${path}`);

        if (method === 'GET') {
            return handleGetInventory(event, headers);
        } else if (method === 'POST') {
            return handleUpdateInventory(event, headers);
        } else if (method === 'PUT') {
            return handlePlaceOrder(event, headers);
        }

        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ error: 'Method not allowed' })
        };

    } catch (error) {
        console.error('Inventory Manager Error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ 
                error: 'Internal server error',
                details: error.message 
            })
        };
    }
};

const handleGetInventory = async (event, headers) => {
    const { location, category } = event.queryStringParameters || {};
    
    console.log('Getting inventory for:', { location, category });
    
    // Return current inventory data
    const response = {
        success: true,
        data: inventoryStorage,
        timestamp: new Date().toISOString()
    };

    if (location) {
        response.data = inventoryStorage[location] || {};
        if (category) {
            response.data = inventoryStorage[location]?.[category] || [];
        }
    }

    return {
        statusCode: 200,
        headers,
        body: JSON.stringify(response)
    };
};

const handleUpdateInventory = async (event, headers) => {
    const body = JSON.parse(event.body || '{}');
    const { location, category, item, action, quantity } = body;

    console.log('Updating inventory:', { location, category, item, action, quantity });

    if (!inventoryStorage[location]) {
        inventoryStorage[location] = {};
    }
    if (!inventoryStorage[location][category]) {
        inventoryStorage[location][category] = [];
    }

    let itemFound = false;
    
    // Update existing item
    inventoryStorage[location][category] = inventoryStorage[location][category].map(inventoryItem => {
        if (inventoryItem.name === item.name) {
            itemFound = true;
            if (action === 'use') {
                inventoryItem.current = Math.max(0, inventoryItem.current - quantity);
            } else if (action === 'restock') {
                inventoryItem.current += quantity;
            } else if (action === 'set') {
                inventoryItem.current = quantity;
            }
            
            // Update status
            if (inventoryItem.current <= inventoryItem.reorderPoint * 0.5) {
                inventoryItem.status = 'critical';
            } else if (inventoryItem.current <= inventoryItem.reorderPoint) {
                inventoryItem.status = 'low';
            } else {
                inventoryItem.status = 'good';
            }
            
            return inventoryItem;
        }
        return inventoryItem;
    });

    // Add new item if not found
    if (!itemFound && action === 'add') {
        inventoryStorage[location][category].push({
            ...item,
            current: quantity || item.current || 0,
            status: 'good'
        });
    }

    // Check for low stock and send alerts
    await checkAndSendAlerts(location, category);

    return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
            success: true,
            message: `Inventory updated for ${item.name}`,
            timestamp: new Date().toISOString()
        })
    };
};

const handlePlaceOrder = async (event, headers) => {
    const body = JSON.parse(event.body || '{}');
    const { location, orders } = body;

    console.log('Placing order:', { location, orderCount: orders?.length });

    if (!orders || !Array.isArray(orders)) {
        return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: 'Invalid order data' })
        };
    }

    // Process each order
    const orderResults = [];
    
    for (const order of orders) {
        const { item, quantity, vendor } = order;
        
        // In a real system, you'd integrate with vendor APIs here
        orderResults.push({
            item: item.name,
            quantity,
            vendor,
            status: 'ordered',
            estimatedDelivery: getEstimatedDelivery(vendor),
            orderNumber: generateOrderNumber()
        });
    }

    // Send order confirmation email
    await sendOrderConfirmation(location, orderResults);

    return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
            success: true,
            message: `${orders.length} orders placed successfully`,
            orders: orderResults,
            timestamp: new Date().toISOString()
        })
    };
};

const checkAndSendAlerts = async (location, category) => {
    if (!inventoryStorage[location] || !inventoryStorage[location][category]) {
        return;
    }

    const lowStockItems = inventoryStorage[location][category].filter(item => 
        item.status === 'low' || item.status === 'critical'
    );

    if (lowStockItems.length > 0) {
        await sendLowStockAlert(location, lowStockItems);
    }
};

const sendLowStockAlert = async (location, items) => {
    try {
        // Configure email transporter (you'll need to set up SMTP credentials)
        const transporter = nodemailer.createTransporter({
            host: process.env.SMTP_HOST || 'smtp.gmail.com',
            port: process.env.SMTP_PORT || 587,
            secure: false,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        });

        const emailContent = `
            <h2>🚨 Low Stock Alert - ${location.toUpperCase()}</h2>
            <p>The following items are running low and need to be reordered:</p>
            <ul>
                ${items.map(item => `
                    <li>
                        <strong>${item.name}</strong> - 
                        Current: ${item.current} ${item.unit} 
                        (Reorder at: ${item.reorderPoint} ${item.unit})
                        <br>
                        <em>Vendor: ${item.vendor}</em>
                        ${item.status === 'critical' ? ' <span style="color: red;">⚠️ CRITICAL</span>' : ''}
                    </li>
                `).join('')}
            </ul>
            <p>Please place orders as soon as possible to avoid stockouts.</p>
            <p><em>Alert generated at: ${new Date().toLocaleString()}</em></p>
        `;

        const mailOptions = {
            from: process.env.SMTP_USER,
            to: process.env.INVENTORY_ALERT_EMAIL || 'orders@bewelllifestylecenters.com',
            subject: `🚨 Low Stock Alert - ${location.toUpperCase()}`,
            html: emailContent
        };

        if (process.env.SMTP_USER && process.env.SMTP_PASS) {
            await transporter.sendMail(mailOptions);
            console.log('Low stock alert email sent successfully');
        } else {
            console.log('Email credentials not configured, skipping email alert');
        }

    } catch (error) {
        console.error('Error sending low stock alert:', error);
    }
};

const sendOrderConfirmation = async (location, orders) => {
    try {
        const transporter = nodemailer.createTransporter({
            host: process.env.SMTP_HOST || 'smtp.gmail.com',
            port: process.env.SMTP_PORT || 587,
            secure: false,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        });

        const emailContent = `
            <h2>📋 Order Confirmation - ${location.toUpperCase()}</h2>
            <p>The following orders have been placed:</p>
            <table border="1" style="border-collapse: collapse; width: 100%;">
                <tr>
                    <th>Item</th>
                    <th>Quantity</th>
                    <th>Vendor</th>
                    <th>Order #</th>
                    <th>Est. Delivery</th>
                </tr>
                ${orders.map(order => `
                    <tr>
                        <td>${order.item}</td>
                        <td>${order.quantity}</td>
                        <td>${order.vendor}</td>
                        <td>${order.orderNumber}</td>
                        <td>${order.estimatedDelivery}</td>
                    </tr>
                `).join('')}
            </table>
            <p><em>Order placed at: ${new Date().toLocaleString()}</em></p>
        `;

        const mailOptions = {
            from: process.env.SMTP_USER,
            to: process.env.INVENTORY_ALERT_EMAIL || 'orders@bewelllifestylecenters.com',
            subject: `📋 Order Confirmation - ${location.toUpperCase()}`,
            html: emailContent
        };

        if (process.env.SMTP_USER && process.env.SMTP_PASS) {
            await transporter.sendMail(mailOptions);
            console.log('Order confirmation email sent successfully');
        } else {
            console.log('Email credentials not configured, skipping order confirmation');
        }

    } catch (error) {
        console.error('Error sending order confirmation:', error);
    }
};

const getEstimatedDelivery = (vendor) => {
    const deliverySchedules = {
        'VACPAK': 'Next delivery day (M/W/F Birmingham, M/F UWM)',
        'Distribution': '1-2 business days',
        'Packaging Co': '3-5 business days',
        'Supplement Co': '5-7 business days',
        'Berkeley Prep': 'Next prep cycle (1-2 days)',
        'Equipment Co': '7-10 business days'
    };

    return deliverySchedules[vendor] || '5-7 business days';
};

const generateOrderNumber = () => {
    return 'BW' + Date.now().toString().slice(-8);
};

module.exports = { handler };