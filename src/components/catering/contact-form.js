/**
 * Shared Contact Form for Catering Orders
 * Reusable across boxed meals and shared platters
 * Includes delivery/billing addresses with toggle and date/time picker with PM/AM selector
 */

/**
 * Render complete contact form
 * @param {Object} initialData - Pre-filled form data
 * @returns {string} HTML string
 */
export function renderContactForm(initialData = {}) {
  const today = new Date().toISOString().split('T')[0];

  return `
    <div class="contact-form-section">
      <div class="contact-form-header">
        <h3>Delivery & Contact Details</h3>
        <p class="form-subtitle">Tell us where and when to deliver your catering order</p>
      </div>

      <!-- Company & Contact Information -->
      <div class="form-group">
        <label for="contact-company" class="form-label">Company Name</label>
        <input
          type="text"
          id="contact-company"
          class="form-input"
          placeholder="Your Company Name (Optional)"
          value="${initialData.company || ''}">
      </div>

      <div class="form-group">
        <label for="contact-name" class="form-label">
          Full Name <span class="required">*</span>
        </label>
        <input
          type="text"
          id="contact-name"
          class="form-input"
          placeholder="First and Last Name"
          required
          value="${initialData.name || ''}">
      </div>

      <div class="form-row-split">
        <div class="form-group">
          <label for="contact-email" class="form-label">
            Email <span class="required">*</span>
          </label>
          <input
            type="email"
            id="contact-email"
            class="form-input"
            placeholder="your@email.com"
            required
            value="${initialData.email || ''}">
        </div>
        <div class="form-group">
          <label for="contact-phone" class="form-label">
            Phone <span class="required">*</span>
          </label>
          <input
            type="tel"
            id="contact-phone"
            class="form-input"
            placeholder="(267) 376-3113"
            required
            value="${initialData.phone || ''}">
        </div>
      </div>

      <!-- Delivery Address -->
      ${renderAddressGroup('delivery', 'Delivery Address', initialData.deliveryAddress)}

      <!-- Billing Address Toggle -->
      <div class="billing-address-toggle">
        <label class="checkbox-label">
          <input
            type="checkbox"
            id="billing-same-as-delivery"
            ${!initialData.billingAddress || initialData.billingAddress.sameAsDelivery !== false ? 'checked' : ''}>
          <span>Billing address is the same as delivery address</span>
        </label>
      </div>

      <div id="billing-address-group" style="display: ${initialData.billingAddress?.sameAsDelivery === false ? 'block' : 'none'};">
        ${renderAddressGroup('billing', 'Billing Address', initialData.billingAddress)}
      </div>

      <!-- Date & Time with PM/AM Selector -->
      <div class="form-row-split">
        <div class="form-group">
          <label for="delivery-date" class="form-label">
            Delivery Date <span class="required">*</span>
          </label>
          <input
            type="date"
            id="delivery-date"
            class="form-input"
            min="${today}"
            required
            value="${initialData.deliveryDate || ''}">
        </div>
        <div class="form-group">
          <label for="delivery-time" class="form-label">
            Delivery Time <span class="required">*</span>
          </label>
          <div class="time-input-group">
            <input
              type="time"
              id="delivery-time"
              class="form-input time-input"
              required
              value="${initialData.deliveryTime || ''}">
            <select id="delivery-period" class="form-select period-selector">
              <option value="AM" ${initialData.deliveryPeriod === 'AM' ? 'selected' : ''}>AM</option>
              <option value="PM" ${!initialData.deliveryPeriod || initialData.deliveryPeriod === 'PM' ? 'selected' : ''}>PM</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Additional Notes -->
      <div class="form-group">
        <label for="contact-notes" class="form-label">Additional Notes or Special Requests</label>
        <textarea
          id="contact-notes"
          class="form-textarea"
          placeholder="Any special instructions, dietary restrictions, or delivery notes..."
          rows="3">${initialData.notes || ''}</textarea>
      </div>
    </div>
  `;
}

/**
 * Render address input group
 * @param {string} prefix - 'delivery' or 'billing'
 * @param {string} label - Display label
 * @param {Object} initialData - Pre-filled address data
 * @returns {string} HTML string
 */
function renderAddressGroup(prefix, label, initialData = {}) {
  return `
    <div class="address-group">
      <label class="address-label">
        ${label} <span class="required">*</span>
      </label>

      <div class="form-group">
        <input
          type="text"
          id="${prefix}-street"
          class="form-input"
          placeholder="Street Address"
          required
          data-address-field="${prefix}"
          value="${initialData?.street || ''}">
      </div>

      <div class="form-group">
        <input
          type="text"
          id="${prefix}-street2"
          class="form-input"
          placeholder="Apt, Suite, Floor (Optional)"
          data-address-field="${prefix}"
          value="${initialData?.street2 || ''}">
      </div>

      <div class="address-row-split">
        <div class="form-group">
          <input
            type="text"
            id="${prefix}-city"
            class="form-input"
            placeholder="City"
            required
            data-address-field="${prefix}"
            value="${initialData?.city || ''}">
        </div>
        <div class="form-group">
          <input
            type="text"
            id="${prefix}-state"
            class="form-input"
            placeholder="State"
            required
            maxlength="2"
            data-address-field="${prefix}"
            value="${initialData?.state || ''}">
        </div>
        <div class="form-group">
          <input
            type="text"
            id="${prefix}-zip"
            class="form-input"
            placeholder="ZIP Code"
            required
            pattern="[0-9]{5}"
            data-address-field="${prefix}"
            value="${initialData?.zip || ''}">
        </div>
      </div>
    </div>
  `;
}

/**
 * Initialize contact form interactions
 * Call after rendering the form
 */
export function initContactFormInteractions() {
  const billingToggle = document.getElementById('billing-same-as-delivery');
  const billingGroup = document.getElementById('billing-address-group');

  // Toggle billing address visibility
  if (billingToggle && billingGroup) {
    billingToggle.addEventListener('change', (e) => {
      billingGroup.style.display = e.target.checked ? 'none' : 'block';

      // Clear billing fields if toggled to "same as delivery"
      if (e.target.checked) {
        ['billing-street', 'billing-street2', 'billing-city', 'billing-state', 'billing-zip'].forEach(id => {
          const el = document.getElementById(id);
          if (el) {
            el.value = '';
            el.classList.remove('error');
          }
        });
      }
    });
  }

  // Auto-uppercase state abbreviations
  ['delivery-state', 'billing-state'].forEach(id => {
    const stateInput = document.getElementById(id);
    if (stateInput) {
      stateInput.addEventListener('input', (e) => {
        e.target.value = e.target.value.toUpperCase();
      });
    }
  });

  // Phone number formatting
  const phoneInput = document.getElementById('contact-phone');
  if (phoneInput) {
    phoneInput.addEventListener('input', (e) => {
      let value = e.target.value.replace(/\D/g, '');
      if (value.length > 10) value = value.substring(0, 10);

      if (value.length >= 6) {
        e.target.value = `(${value.substring(0, 3)}) ${value.substring(3, 6)}-${value.substring(6)}`;
      } else if (value.length >= 3) {
        e.target.value = `(${value.substring(0, 3)}) ${value.substring(3)}`;
      } else {
        e.target.value = value;
      }
    });
  }
}

/**
 * Validate contact form
 * @returns {Object} { isValid: boolean, errors: string[] }
 */
export function validateContactForm() {
  const errors = [];
  let isValid = true;

  // Required text fields
  const requiredFields = [
    { id: 'contact-name', label: 'Full Name' },
    { id: 'contact-email', label: 'Email' },
    { id: 'contact-phone', label: 'Phone' },
    { id: 'delivery-date', label: 'Delivery Date' },
    { id: 'delivery-time', label: 'Delivery Time' }
  ];

  requiredFields.forEach(({ id, label }) => {
    const el = document.getElementById(id);
    if (!el?.value.trim()) {
      isValid = false;
      errors.push(`${label} is required`);
      el?.classList.add('error');
    } else {
      el?.classList.remove('error');
    }
  });

  // Validate delivery address
  const deliveryAddressValid = validateAddress('delivery');
  if (!deliveryAddressValid.isValid) {
    isValid = false;
    errors.push(...deliveryAddressValid.errors);
  }

  // Validate billing address if different from delivery
  const billingSame = document.getElementById('billing-same-as-delivery')?.checked;
  if (!billingSame) {
    const billingAddressValid = validateAddress('billing');
    if (!billingAddressValid.isValid) {
      isValid = false;
      errors.push(...billingAddressValid.errors);
    }
  }

  // Email format validation
  const emailInput = document.getElementById('contact-email');
  if (emailInput?.value.trim()) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailInput.value.trim())) {
      isValid = false;
      errors.push('Invalid email format');
      emailInput.classList.add('error');
    }
  }

  // Phone validation (basic - should have 10 digits)
  const phoneInput = document.getElementById('contact-phone');
  if (phoneInput?.value.trim()) {
    const digits = phoneInput.value.replace(/\D/g, '');
    if (digits.length !== 10) {
      isValid = false;
      errors.push('Phone number must be 10 digits');
      phoneInput.classList.add('error');
    }
  }

  return { isValid, errors };
}

/**
 * Validate address fields
 * @param {string} prefix - 'delivery' or 'billing'
 * @returns {Object} { isValid: boolean, errors: string[] }
 */
function validateAddress(prefix) {
  const errors = [];
  let isValid = true;

  const addressFields = [
    { id: `${prefix}-street`, label: `${prefix === 'delivery' ? 'Delivery' : 'Billing'} Street Address` },
    { id: `${prefix}-city`, label: 'City' },
    { id: `${prefix}-state`, label: 'State' },
    { id: `${prefix}-zip`, label: 'ZIP Code' }
  ];

  addressFields.forEach(({ id, label }) => {
    const el = document.getElementById(id);
    if (!el?.value.trim()) {
      isValid = false;
      errors.push(`${label} is required`);
      el?.classList.add('error');
    } else {
      el?.classList.remove('error');
    }
  });

  // Validate ZIP code format
  const zipInput = document.getElementById(`${prefix}-zip`);
  if (zipInput?.value.trim()) {
    const zipRegex = /^\d{5}$/;
    if (!zipRegex.test(zipInput.value.trim())) {
      isValid = false;
      errors.push('ZIP code must be 5 digits');
      zipInput.classList.add('error');
    }
  }

  // Validate state (2 letters)
  const stateInput = document.getElementById(`${prefix}-state`);
  if (stateInput?.value.trim()) {
    const stateRegex = /^[A-Z]{2}$/;
    if (!stateRegex.test(stateInput.value.trim())) {
      isValid = false;
      errors.push('State must be 2-letter abbreviation (e.g., PA)');
      stateInput.classList.add('error');
    }
  }

  return { isValid, errors };
}

/**
 * Collect contact form data
 * @returns {Object} Contact data object
 */
export function collectContactData() {
  const billingSame = document.getElementById('billing-same-as-delivery')?.checked;

  const contactData = {
    company: document.getElementById('contact-company')?.value.trim() || '',
    name: document.getElementById('contact-name')?.value.trim() || '',
    email: document.getElementById('contact-email')?.value.trim() || '',
    phone: document.getElementById('contact-phone')?.value.trim() || '',
    deliveryAddress: {
      street: document.getElementById('delivery-street')?.value.trim() || '',
      street2: document.getElementById('delivery-street2')?.value.trim() || '',
      city: document.getElementById('delivery-city')?.value.trim() || '',
      state: document.getElementById('delivery-state')?.value.trim().toUpperCase() || '',
      zip: document.getElementById('delivery-zip')?.value.trim() || ''
    },
    billingAddress: billingSame ? {
      sameAsDelivery: true
    } : {
      sameAsDelivery: false,
      street: document.getElementById('billing-street')?.value.trim() || '',
      street2: document.getElementById('billing-street2')?.value.trim() || '',
      city: document.getElementById('billing-city')?.value.trim() || '',
      state: document.getElementById('billing-state')?.value.trim().toUpperCase() || '',
      zip: document.getElementById('billing-zip')?.value.trim() || ''
    },
    deliveryDate: document.getElementById('delivery-date')?.value || '',
    deliveryTime: document.getElementById('delivery-time')?.value || '',
    deliveryPeriod: document.getElementById('delivery-period')?.value || 'PM',
    notes: document.getElementById('contact-notes')?.value.trim() || ''
  };

  return contactData;
}
