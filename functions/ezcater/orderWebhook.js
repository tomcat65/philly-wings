/**
 * ezCater Order Webhook Handler
 * Receives order notifications from ezCater platform
 */

const admin = require('firebase-admin');
const crypto = require('crypto');

/**
 * Webhook endpoint to receive ezCater orders
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Object} config - Firebase Functions config
 */
async function handleEzCaterOrderWebhook(req, res, config) {
  const db = admin.firestore();

  console.log('📦 ezCater webhook received');

  try {
    // 1. Verify webhook signature
    const signature = req.headers['x-ezcater-signature'];
    const webhookSecret = config.ezcater?.webhook_secret;

    if (!webhookSecret) {
      console.error('❌ Webhook secret not configured');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    if (!verifySignature(req.body, signature, webhookSecret)) {
      console.error('❌ Invalid webhook signature');
      return res.status(401).json({ error: 'Invalid signature' });
    }

    console.log('✅ Signature verified');

    // 2. Extract order data
    const orderData = req.body;
    console.log(`   Order ID: ${orderData.order_id}`);
    console.log(`   Customer: ${orderData.customer?.company_name || 'N/A'}`);

    // 3. Store order in Firestore
    const orderId = orderData.order_id;
    const orderDoc = {
      orderId,
      source: 'ezcater',

      // Customer info
      companyName: orderData.customer?.company_name || '',
      contactName: orderData.customer?.contact_name || '',
      contactEmail: orderData.customer?.email || '',
      contactPhone: orderData.customer?.phone || '',

      // Order details
      packageName: orderData.items?.[0]?.name || '',
      servesCount: orderData.items?.[0]?.serves || 0,
      wingCount: orderData.items?.[0]?.wing_count || 0,
      selectedSauces: extractSauceSelections(orderData.items?.[0]?.modifiers),
      addOns: extractAddOns(orderData.items?.slice(1)),

      // Delivery info
      deliveryDate: orderData.delivery_date,
      deliveryTime: orderData.delivery_time,
      deliveryAddress: {
        street: orderData.delivery_address?.street || '',
        city: orderData.delivery_address?.city || '',
        state: orderData.delivery_address?.state || '',
        zip: orderData.delivery_address?.zip || '',
        country: orderData.delivery_address?.country || 'US'
      },

      // Additional info
      specialInstructions: orderData.special_instructions || '',
      totalPrice: orderData.total_price || 0,

      // Status tracking
      status: 'confirmed', // ezCater pre-confirms orders
      paymentStatus: 'paid', // ezCater handles payment

      // Full ezCater payload for reference
      ezCaterData: orderData,

      // Timestamps
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    await db.collection('cateringOrders').doc(orderId).set(orderDoc);
    console.log('✅ Order stored in Firestore');

    // 4. Update availability tracking
    const date = orderData.delivery_date?.split('T')[0]; // Extract YYYY-MM-DD
    if (date && orderDoc.wingCount) {
      await updateAvailability(db, date, orderDoc.wingCount);
      console.log('✅ Availability updated');
    }

    // 5. Notify restaurant manager
    await notifyNewOrder(db, orderId, orderDoc);
    console.log('✅ Notification sent');

    // 6. Respond to ezCater
    res.status(200).json({
      success: true,
      message: 'Order received',
      order_id: orderId
    });

  } catch (error) {
    console.error('❌ Error processing ezCater webhook:', error);

    // Log error but still return 200 to prevent ezCater retries
    res.status(200).json({
      success: false,
      error: 'Internal processing error',
      message: 'Order logged but processing incomplete'
    });
  }
}

/**
 * Verify webhook signature using HMAC-SHA256
 * @param {Object} payload - Request body
 * @param {string} signature - Signature from header
 * @param {string} secret - Webhook secret
 * @returns {boolean} True if signature is valid
 */
function verifySignature(payload, signature, secret) {
  if (!signature || !secret) {
    return false;
  }

  try {
    const hmac = crypto.createHmac('sha256', secret);
    const payloadString = typeof payload === 'string' ? payload : JSON.stringify(payload);
    const calculated = hmac.update(payloadString).digest('hex');

    // Constant-time comparison to prevent timing attacks
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(calculated)
    );
  } catch (error) {
    console.error('Signature verification error:', error);
    return false;
  }
}

/**
 * Extract sauce selections from order modifiers
 * @param {Array} modifiers - Order item modifiers
 * @returns {Array<string>} Selected sauce names
 */
function extractSauceSelections(modifiers) {
  if (!Array.isArray(modifiers)) {
    return [];
  }

  const sauceModifier = modifiers.find(m =>
    m.name === 'Sauce Selections' ||
    m.type === 'sauces'
  );

  return sauceModifier?.selected_options || [];
}

/**
 * Extract add-on items from order
 * @param {Array} items - Additional order items
 * @returns {Array<Object>} Add-on items
 */
function extractAddOns(items) {
  if (!Array.isArray(items)) {
    return [];
  }

  return items.map(item => ({
    name: item.name,
    quantity: item.quantity || 1,
    price: item.price || 0
  }));
}

/**
 * Update availability tracking for a date
 * @param {Object} db - Firestore database
 * @param {string} date - Date string (YYYY-MM-DD)
 * @param {number} wingCount - Number of wings ordered
 */
async function updateAvailability(db, date, wingCount) {
  const availRef = db.collection('cateringAvailability').doc(date);

  await availRef.set({
    date,
    totalWingsOrdered: admin.firestore.FieldValue.increment(wingCount),
    ordersCount: admin.firestore.FieldValue.increment(1),
    lastUpdated: admin.firestore.FieldValue.serverTimestamp()
  }, { merge: true });
}

/**
 * Notify restaurant manager of new order
 * @param {Object} db - Firestore database
 * @param {string} orderId - Order ID
 * @param {Object} orderData - Order details
 */
async function notifyNewOrder(db, orderId, orderData) {
  // Store notification in pending notifications collection
  // Admin dashboard will display these in real-time
  await db.collection('notifications').add({
    type: 'new_catering_order',
    orderId,
    title: `New Catering Order: ${orderData.companyName}`,
    message: `${orderData.packageName} for ${orderData.servesCount} people on ${orderData.deliveryDate}`,
    read: false,
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  });

  // TODO: Send email via SendGrid/Nodemailer
  // TODO: Send SMS via Twilio (optional)

  console.log('   Notification queued for admin dashboard');
}

module.exports = {
  handleEzCaterOrderWebhook,
  verifySignature, // Export for testing
  extractSauceSelections // Export for testing
};
