// MELANO INC Main Application
(function() {
    'use strict';
    
    // Wait for DOM to be fully loaded
    document.addEventListener('DOMContentLoaded', function() {
        initializeApp();
    });
    
    function initializeApp() {
        // Initialize translations
        if (window.MELANO_I18N) {
            window.MELANO_I18N.init();
        }
        
        // Initialize components
        initializeLanguageToggle();
        initializeNavigation();
        initializeHeroAnimations();
        initializeFormHandling();
        initializeStripeCheckout();
        initializeRevenueDashboard();
        initializeScrollEffects();
        initializeModals();
        initializeResourceTracking();
        initializeWhatsAppTracking();
        
        console.log('MELANO INC App Initialized');
    }
    
    // Language Toggle
    function initializeLanguageToggle() {
        const langButtons = document.querySelectorAll('.lang-btn');
        
        langButtons.forEach(button => {
            button.addEventListener('click', function() {
                const lang = this.getAttribute('data-lang');
                if (window.MELANO_I18N) {
                    window.MELANO_I18N.switchLanguage(lang);
                }
            });
        });
    }
    
    // Navigation
    function initializeNavigation() {
        const navbar = document.querySelector('.navbar');
        const hamburger = document.getElementById('hamburger');
        
        // Scroll effect for navbar
        let lastScrollTop = 0;
        window.addEventListener('scroll', function() {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            
            if (scrollTop > 100) {
                navbar.style.background = 'rgba(15, 15, 15, 0.98)';
                navbar.style.backdropFilter = 'blur(20px)';
            } else {
                navbar.style.background = 'rgba(15, 15, 15, 0.95)';
                navbar.style.backdropFilter = 'blur(20px)';
            }
            
            lastScrollTop = scrollTop;
        });
        
        // Mobile menu toggle
        if (hamburger) {
            hamburger.addEventListener('click', function() {
                // Mobile menu functionality can be added here
                console.log('Mobile menu clicked');
            });
        }
        
        // Smooth scrolling for navigation links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }
    
    // Hero Animations
    function initializeHeroAnimations() {
        // Animate floating cards
        const cards = document.querySelectorAll('.floating-cards .card');
        cards.forEach((card, index) => {
            card.style.animationDelay = `${index * 2}s`;
        });
        
        // Hero CTA click tracking
        const heroCTA = document.getElementById('hero-cta');
        if (heroCTA) {
            heroCTA.addEventListener('click', function() {
                // Scroll to form
                const formSection = document.getElementById('contact');
                if (formSection) {
                    formSection.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
                
                // Track event
                if (window.MELANO_UTILS) {
                    window.MELANO_UTILS.trackEvent('hero_cta_click');
                }
            });
        }
    }
    
    // Form Handling
    function initializeFormHandling() {
        const leadForm = document.getElementById('leadForm');
        const submitBtn = document.getElementById('submitBtn');
        
        if (!leadForm || !submitBtn) return;
        
        leadForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // Validate form
            if (!validateForm(leadForm)) {
                return;
            }
            
            // Show loading state
            if (window.MELANO_UTILS) {
                window.MELANO_UTILS.showLoading(submitBtn);
            }
            
            // Collect form data
            const formData = collectFormData(leadForm);
            
            try {
                // Submit to webhook
                const success = await submitFormData(formData);
                
                if (success) {
                    // Show success modal
                    if (window.MELANO_UTILS) {
                        window.MELANO_UTILS.showSuccessModal();
                    }
                    
                    // Reset form
                    leadForm.reset();
                    
                    // Track successful submission
                    if (window.MELANO_UTILS) {
                        window.MELANO_UTILS.trackEvent('lead_form_submit', formData);
                    }
                } else {
                    throw new Error('Form submission failed');
                }
            } catch (error) {
                console.error('Form submission error:', error);
                showFormError('Hubo un error al enviar el formulario. Por favor, intenta nuevamente.');
            } finally {
                // Hide loading state
                if (window.MELANO_UTILS) {
                    window.MELANO_UTILS.hideLoading(submitBtn);
                }
            }
        });
        
        // Real-time validation
        const requiredFields = leadForm.querySelectorAll('[required]');
        requiredFields.forEach(field => {
            field.addEventListener('blur', function() {
                validateField(this);
            });
            
            field.addEventListener('input', function() {
                // Remove error state on input
                this.classList.remove('error');
                const errorMsg = this.parentNode.querySelector('.error-message');
                if (errorMsg) {
                    errorMsg.remove();
                }
            });
        });
    }
    
    // Form Validation
    function validateForm(form) {
        let isValid = true;
        const requiredFields = form.querySelectorAll('[required]');
        
        requiredFields.forEach(field => {
            if (!validateField(field)) {
                isValid = false;
            }
        });
        
        return isValid;
    }
    
    function validateField(field) {
        const value = field.value.trim();
        const fieldType = field.type;
        const fieldName = field.name;
        
        // Remove existing error
        field.classList.remove('error');
        const existingError = field.parentNode.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }
        
        // Check if required field is empty
        if (field.hasAttribute('required') && !value) {
            showFieldError(field, 'Este campo es obligatorio');
            return false;
        }
        
        // Email validation
        if (fieldType === 'email' && value) {
            if (!window.MELANO_UTILS.isValidEmail(value)) {
                showFieldError(field, 'Ingresa un email válido');
                return false;
            }
        }
        
        // Phone validation
        if (fieldName === 'phone' && value) {
            if (!window.MELANO_UTILS.isValidPhone(value)) {
                showFieldError(field, 'Ingresa un teléfono válido');
                return false;
            }
        }
        
        return true;
    }
    
    function showFieldError(field, message) {
        field.classList.add('error');
        
        const errorElement = document.createElement('div');
        errorElement.className = 'error-message';
        errorElement.textContent = message;
        errorElement.style.color = 'var(--error)';
        errorElement.style.fontSize = '0.875rem';
        errorElement.style.marginTop = 'var(--space-xs)';
        
        field.parentNode.appendChild(errorElement);
    }
    
    function showFormError(message) {
        // You can implement a toast notification or alert here
        alert(message);
    }
    
    // Collect Form Data
    function collectFormData(form) {
        const formData = new FormData(form);
        const data = {};
        
        for (let [key, value] of formData.entries()) {
            data[key] = value;
        }
        
        // Add additional data
        data.timestamp = new Date().toISOString();
        data.language = window.MELANO_I18N ? window.MELANO_I18N.currentLang : 'es';
        data.source = 'landing_page';
        data.user_agent = navigator.userAgent;
        data.referrer = document.referrer;
        data.url = window.location.href;
        
        return data;
    }
    
    // Submit Form Data
    async function submitFormData(data) {
        const webhookURL = window.MELANO_CONF.webhookURL;
        
        try {
            const response = await fetch(webhookURL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });
            
            return response.ok;
        } catch (error) {
            console.error('Webhook submission error:', error);
            return false;
        }
    }
    
    // Scroll Effects
    function initializeScrollEffects() {
        // Intersection Observer for animations
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                }
            });
        }, observerOptions);
        
        // Observe sections
        document.querySelectorAll('section').forEach(section => {
            observer.observe(section);
        });
        
        // Parallax effect for hero
        window.addEventListener('scroll', function() {
            const scrolled = window.pageYOffset;
            const hero = document.querySelector('.hero');
            
            if (hero) {
                const rate = scrolled * -0.5;
                hero.style.transform = `translateY(${rate}px)`;
            }
        });
    }
    
    // Modal Handling
    function initializeModals() {
        const modal = document.getElementById('successModal');
        const closeBtn = modal?.querySelector('.btn-modal-close');
        
        if (closeBtn) {
            closeBtn.addEventListener('click', function() {
                if (window.MELANO_UTILS) {
                    window.MELANO_UTILS.hideSuccessModal();
                }
            });
        }
        
        // Close modal on outside click
        if (modal) {
            modal.addEventListener('click', function(e) {
                if (e.target === modal) {
                    if (window.MELANO_UTILS) {
                        window.MELANO_UTILS.hideSuccessModal();
                    }
                }
            });
        }
        
        // Close modal on Escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && modal?.classList.contains('active')) {
                if (window.MELANO_UTILS) {
                    window.MELANO_UTILS.hideSuccessModal();
                }
            }
        });
    }
    
    // Resource Download Tracking
    function initializeResourceTracking() {
        const downloadLinks = document.querySelectorAll('.resource-download');
        
        downloadLinks.forEach(link => {
            link.addEventListener('click', function() {
                const resourceType = this.closest('.resource-card').querySelector('h3').textContent;
                
                if (window.MELANO_UTILS) {
                    window.MELANO_UTILS.trackEvent('pdf_download', {
                        resource: resourceType,
                        url: this.href
                    });
                }
            });
        });
        
        // Checkout link tracking
        const checkoutLinks = document.querySelectorAll('.resource-premium');
        checkoutLinks.forEach(link => {
            link.addEventListener('click', function() {
                if (window.MELANO_UTILS) {
                    window.MELANO_UTILS.trackEvent('checkout_click', {
                        url: this.href
                    });
                }
            });
        });
    }
    
    // WhatsApp Click Tracking
    function initializeWhatsAppTracking() {
        const whatsappLinks = document.querySelectorAll('a[href*="wa.me"], a[href*="whatsapp"]');
        
        whatsappLinks.forEach(link => {
            link.addEventListener('click', function() {
                if (window.MELANO_UTILS) {
                    window.MELANO_UTILS.trackEvent('whatsapp_click', {
                        url: this.href,
                        context: this.closest('section')?.id || 'unknown'
                    });
                }
            });
        });
    }
    
    // Stripe Checkout Integration
    function initializeStripeCheckout() {
        // Load Stripe.js
        if (!window.Stripe && window.MELANO_CONF.stripe.publishableKey) {
            const script = document.createElement('script');
            script.src = 'https://js.stripe.com/v3/';
            script.onload = () => {
                window.stripe = Stripe(window.MELANO_CONF.stripe.publishableKey);
                setupPricingButtons();
            };
            document.head.appendChild(script);
        }
        
        // Setup pricing buttons
        function setupPricingButtons() {
            const pricingButtons = document.querySelectorAll('.pricing-btn[data-plan]');
            
            pricingButtons.forEach(button => {
                button.addEventListener('click', async function() {
                    const plan = this.getAttribute('data-plan');
                    const amount = this.getAttribute('data-amount');
                    
                    if (plan === 'starter') {
                        // Free plan - direct signup
                        handleFreePlanSignup();
                    } else if (plan === 'enterprise') {
                        // Enterprise - contact sales
                        handleEnterpriseContact();
                    } else {
                        // Paid plans - Stripe checkout
                        await handleStripeCheckout(plan, amount);
                    }
                });
            });
        }
        
        async function handleStripeCheckout(plan, amount) {
            if (!window.stripe) return;
            
            try {
                // Show loading
                const button = event.target;
                button.disabled = true;
                button.textContent = 'Procesando...';
                
                // Create checkout session
                const response = await fetch('/api/create-checkout-session', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        plan: plan,
                        amount: amount,
                        currency: 'usd'
                    })
                });
                
                const session = await response.json();
                
                // Redirect to Stripe Checkout
                const result = await window.stripe.redirectToCheckout({
                    sessionId: session.id
                });
                
                if (result.error) {
                    console.error('Stripe error:', result.error);
                    showPaymentError(result.error.message);
                }
                
            } catch (error) {
                console.error('Checkout error:', error);
                showPaymentError('Error al procesar el pago. Intenta nuevamente.');
            }
            
            // Track checkout attempt
            if (window.MELANO_UTILS) {
                window.MELANO_UTILS.trackEvent('checkout_attempt', {
                    plan: plan,
                    amount: amount
                });
            }
        }
        
        function handleFreePlanSignup() {
            // Redirect to signup/onboarding
            window.location.href = '#contact';
            
            // Track free signup
            if (window.MELANO_UTILS) {
                window.MELANO_UTILS.trackEvent('free_signup_attempt');
            }
        }
        
        function handleEnterpriseContact() {
            // Open WhatsApp with enterprise message
            const message = encodeURIComponent('Hola Bruno, me interesa el plan Enterprise de MELANO INC. ¿Podemos agendar una llamada?');
            window.open(`https://wa.me/5492235506595?text=${message}`, '_blank');
            
            // Track enterprise interest
            if (window.MELANO_UTILS) {
                window.MELANO_UTILS.trackEvent('enterprise_contact');
            }
        }
        
        function showPaymentError(message) {
            // Show error modal or notification
            alert(message); // Simple implementation - can be improved
        }
    }
    
    // Revenue Dashboard (Real-time)
    function initializeRevenueDashboard() {
        if (!window.MELANO_CONF.analytics.revenueTracking) return;
        
        // Create dashboard if not exists
        createRevenueDashboard();
        
        // Start real-time updates
        if (window.MELANO_CONF.analytics.realTimeUpdates) {
            setInterval(updateRevenueDashboard, window.MELANO_CONF.analytics.dashboardRefreshInterval);
            updateRevenueDashboard(); // Initial load
        }
    }
    
    function createRevenueDashboard() {
        const dashboardHTML = `
            <div class="revenue-dashboard" id="revenueDashboard" style="display: none;">
                <div class="dashboard-header">
                    <h3 class="dashboard-title">💰 Revenue Analytics</h3>
                    <div class="live-indicator">
                        <span class="live-dot"></span>
                        <span>LIVE</span>
                    </div>
                </div>
                <div class="revenue-metrics">
                    <div class="revenue-metric">
                        <div class="metric-value" id="mrrValue">$0</div>
                        <div class="metric-label">MRR</div>
                        <div class="metric-change positive" id="mrrChange">+0%</div>
                    </div>
                    <div class="revenue-metric">
                        <div class="metric-value" id="activeUsers">0</div>
                        <div class="metric-label">Active Users</div>
                        <div class="metric-change positive" id="usersChange">+0%</div>
                    </div>
                    <div class="revenue-metric">
                        <div class="metric-value" id="conversionRate">0%</div>
                        <div class="metric-label">Conversion</div>
                        <div class="metric-change positive" id="conversionChange">+0%</div>
                    </div>
                    <div class="revenue-metric">
                        <div class="metric-value" id="churnRate">0%</div>
                        <div class="metric-label">Churn Rate</div>
                        <div class="metric-change negative" id="churnChange">-0%</div>
                    </div>
                </div>
            </div>
        `;
        
        // Insert dashboard after results section
        const resultsSection = document.getElementById('results');
        if (resultsSection) {
            resultsSection.insertAdjacentHTML('afterend', dashboardHTML);
        }
    }
    
    async function updateRevenueDashboard() {
        try {
            const response = await fetch('/api/revenue-analytics', {
                headers: {
                    'Authorization': 'Bearer ' + getAuthToken()
                }
            });
            
            const data = await response.json();
            
            // Update MRR
            document.getElementById('mrrValue').textContent = `$${formatCurrency(data.mrr)}`;
            document.getElementById('mrrChange').textContent = `${data.mrrGrowth >= 0 ? '+' : ''}${data.mrrGrowth}%`;
            
            // Update Active Users
            document.getElementById('activeUsers').textContent = data.activeUsers;
            document.getElementById('usersChange').textContent = `${data.usersGrowth >= 0 ? '+' : ''}${data.usersGrowth}%`;
            
            // Update Conversion Rate
            document.getElementById('conversionRate').textContent = `${data.conversionRate}%`;
            document.getElementById('conversionChange').textContent = `${data.conversionChange >= 0 ? '+' : ''}${data.conversionChange}%`;
            
            // Update Churn Rate
            document.getElementById('churnRate').textContent = `${data.churnRate}%`;
            document.getElementById('churnChange').textContent = `${data.churnChange <= 0 ? '+' : ''}${data.churnChange}%`;
            
            // Show dashboard
            document.getElementById('revenueDashboard').style.display = 'block';
            
        } catch (error) {
            console.error('Failed to update revenue dashboard:', error);
        }
    }
    
    function formatCurrency(amount) {
        return new Intl.NumberFormat('en-US').format(amount);
    }
    
    function getAuthToken() {
        // Get from localStorage or cookie
        return localStorage.getItem('auth_token') || '';
    }
    
    // Add CSS for animations
    const style = document.createElement('style');
    style.textContent = `
        .error {
            border-color: var(--error) !important;
            box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1) !important;
        }
        
        section {
            opacity: 0;
            transform: translateY(30px);
            transition: all 0.6s ease-out;
        }
        
        section.animate-in {
            opacity: 1;
            transform: translateY(0);
        }
        
        .floating-cards .card {
            transform: translateY(0px) rotate(0deg);
        }
        
        @media (prefers-reduced-motion: reduce) {
            section,
            .floating-cards .card {
                transform: none !important;
                transition: none !important;
                animation: none !important;
            }
        }
    `;
    document.head.appendChild(style);
    
})();

// Service Worker Registration (if needed for offline functionality)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        navigator.serviceWorker.register('/sw.js')
            .then(function(registration) {
                console.log('SW registered: ', registration);
            })
            .catch(function(registrationError) {
                console.log('SW registration failed: ', registrationError);
            });
    });
}