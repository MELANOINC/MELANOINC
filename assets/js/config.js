// MELANO INC Configuration
window.MELANO_CONF = {
    // Webhook URL for form submissions (UPDATE THIS AFTER N8N DEPLOYMENT)
    webhookURL: "https://n8n.YOUR-DOMAIN.com/webhook/melano_lead",
    
    // Contact Information
    contact: {
        phone: "+5492235506595",
        email: "contacto@brunomelano.com",
        whatsapp: "https://wa.me/5492235506595",
        website: "https://brunomelano.com"
    },
    
    // MercadoPago Checkout
    checkoutURL: "https://link.mercadopago.com/melanoinc",
    
    // Form Configuration
    form: {
        requiredFields: ['name', 'email', 'phone', 'budget', 'urgency', 'message'],
        validateEmail: true,
        validatePhone: true,
        redirectAfterSubmit: false,
        showSuccessModal: true
    },
    
    // Analytics & Tracking
    analytics: {
        enabled: true,
        gtag: null, // Add Google Analytics ID if needed
        fbPixel: null, // Add Facebook Pixel ID if needed
        events: {
            formSubmit: 'lead_form_submit',
            downloadPDF: 'pdf_download',
            whatsappClick: 'whatsapp_click',
            checkoutClick: 'checkout_click'
        }
    },
    
    // API Endpoints
    api: {
        leadCapture: "/api/lead",
        downloadTracking: "/api/download",
        contactForm: "/api/contact"
    },
    
    // Feature Flags
    features: {
        multiLanguage: true,
        darkMode: true,
        animations: true,
        formValidation: true,
        modalSuccess: true,
        downloadTracking: true
    },
    
    // PDF Resources
    resources: {
        automation_guide: {
            es: "assets/pdf/MELANO_INC_Automation_Guide_ES.pdf",
            en: "assets/pdf/MELANO_INC_Automation_Guide_EN.pdf"
        },
        bots_manual: {
            es: "assets/pdf/MELANO_INC_Bots_Manual_ES.pdf",
            en: "assets/pdf/MELANO_INC_Bots_Manual_EN.pdf"
        }
    },
    
    // Default Language
    defaultLanguage: "es",
    
    // Environment
    env: "production", // or "development"
    version: "1.0.0",
    buildDate: new Date().toISOString()
};

// Utility Functions
window.MELANO_UTILS = {
    // Get current language
    getCurrentLanguage() {
        return document.documentElement.getAttribute('data-theme') || window.MELANO_CONF.defaultLanguage;
    },
    
    // Format phone number for WhatsApp
    formatPhoneForWhatsApp(phone) {
        return phone.replace(/[\s\-\(\)]/g, '').replace(/^\+/, '');
    },
    
    // Generate WhatsApp URL with message
    generateWhatsAppURL(phone, message = '') {
        const formattedPhone = this.formatPhoneForWhatsApp(phone);
        const encodedMessage = encodeURIComponent(message);
        return `https://wa.me/${formattedPhone}${message ? `?text=${encodedMessage}` : ''}`;
    },
    
    // Track event
    trackEvent(eventName, eventData = {}) {
        if (window.MELANO_CONF.analytics.enabled) {
            // Google Analytics
            if (typeof gtag !== 'undefined') {
                gtag('event', eventName, eventData);
            }
            
            // Facebook Pixel
            if (typeof fbq !== 'undefined') {
                fbq('track', eventName, eventData);
            }
            
            // Custom tracking
            console.log('Event tracked:', eventName, eventData);
        }
    },
    
    // Validate email
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },
    
    // Validate phone
    isValidPhone(phone) {
        const phoneRegex = /^[\+]?[0-9\s\-\(\)]{10,}$/;
        return phoneRegex.test(phone);
    },
    
    // Show loading state
    showLoading(button) {
        if (button) {
            button.disabled = true;
            const btnText = button.querySelector('.btn-text');
            const btnLoading = button.querySelector('.btn-loading');
            if (btnText) btnText.style.display = 'none';
            if (btnLoading) btnLoading.style.display = 'flex';
        }
    },
    
    // Hide loading state
    hideLoading(button) {
        if (button) {
            button.disabled = false;
            const btnText = button.querySelector('.btn-text');
            const btnLoading = button.querySelector('.btn-loading');
            if (btnText) btnText.style.display = 'inline';
            if (btnLoading) btnLoading.style.display = 'none';
        }
    },
    
    // Show success modal
    showSuccessModal() {
        const modal = document.getElementById('successModal');
        if (modal) {
            modal.classList.add('active');
        }
    },
    
    // Hide success modal
    hideSuccessModal() {
        const modal = document.getElementById('successModal');
        if (modal) {
            modal.classList.remove('active');
        }
    }
};

// Debug mode
if (window.MELANO_CONF.env === 'development') {
    window.MELANO_DEBUG = {
        config: window.MELANO_CONF,
        utils: window.MELANO_UTILS,
        version: window.MELANO_CONF.version,
        log: (message, data = null) => {
            console.log(`[MELANO DEBUG] ${message}`, data);
        }
    };
    
    console.log('MELANO INC Debug Mode Enabled');
    console.log('Config:', window.MELANO_CONF);
}