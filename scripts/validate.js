#!/usr/bin/env node

/**
 * MELANO INC - Validation Script
 * Validates configuration and required files before deployment
 */

const fs = require('fs');
const path = require('path');

const REQUIRED_FILES = [
    'index.html',
    'assets/css/styles.css',
    'assets/js/app.js',
    'assets/js/config.js',
    'assets/js/translations.js',
    'supabase/schema.sql',
    'n8n/lead_capture.json',
    'n8n/waba_inbound.json'
];

const REQUIRED_PDFS = [
    'assets/pdf/MELANO_INC_Automation_Guide_ES.pdf',
    'assets/pdf/MELANO_INC_Automation_Guide_EN.pdf',
    'assets/pdf/MELANO_INC_Bots_Manual_ES.pdf',
    'assets/pdf/MELANO_INC_Bots_Manual_EN.pdf'
];

function validateFiles() {
    console.log('🔍 Validating MELANO INC files...\n');
    
    let errors = [];
    let warnings = [];
    
    // Check required files
    REQUIRED_FILES.forEach(file => {
        if (!fs.existsSync(file)) {
            errors.push(`❌ Missing required file: ${file}`);
        } else {
            console.log(`✅ Found: ${file}`);
        }
    });
    
    // Check PDF resources (warnings only)
    REQUIRED_PDFS.forEach(file => {
        if (!fs.existsSync(file)) {
            warnings.push(`⚠️  Missing PDF resource: ${file}`);
        } else {
            console.log(`✅ Found: ${file}`);
        }
    });
    
    // Validate configuration
    if (fs.existsSync('assets/js/config.js')) {
        const configContent = fs.readFileSync('assets/js/config.js', 'utf8');
        
        if (configContent.includes('YOUR-DOMAIN.com')) {
            warnings.push('⚠️  Update webhookURL in config.js after n8n deployment');
        }
        
        if (configContent.includes('+5492235506595')) {
            console.log('✅ WhatsApp number configured');
        }
        
        if (configContent.includes('link.mercadopago.com/melanoinc')) {
            console.log('✅ MercadoPago checkout configured');
        }
    }
    
    // Validate translations
    if (fs.existsSync('assets/js/translations.js')) {
        const transContent = fs.readFileSync('assets/js/translations.js', 'utf8');
        
        if (transContent.includes('"es":') && transContent.includes('"en":')) {
            console.log('✅ Bilingual translations configured');
        } else {
            errors.push('❌ Missing Spanish or English translations');
        }
    }
    
    console.log('\n📊 VALIDATION SUMMARY:');
    console.log(`✅ Passed: ${REQUIRED_FILES.length - errors.length}/${REQUIRED_FILES.length} required files`);
    
    if (warnings.length > 0) {
        console.log('\n⚠️  WARNINGS:');
        warnings.forEach(warning => console.log(warning));
    }
    
    if (errors.length > 0) {
        console.log('\n❌ ERRORS:');
        errors.forEach(error => console.log(error));
        console.log('\n🚨 Fix errors before deployment!');
        process.exit(1);
    } else {
        console.log('\n🎉 All validations passed! Ready for deployment.');
    }
}

function validateEnvironment() {
    console.log('\n🌍 REQUIRED ENVIRONMENT VARIABLES:');
    console.log('For n8n workflow:');
    console.log('  - WABA_TOKEN (WhatsApp Business API token)');
    console.log('  - WABA_PHONE_NUMBER_ID (WhatsApp phone number ID)');
    console.log('  - SUPABASE_URL (Supabase project URL)');
    console.log('  - SUPABASE_SERVICE_ROLE (Supabase service role key)');
    console.log('  - OWNER_WHATSAPP (+5492235506595)');
    console.log('  - VERIFY_TOKEN (melano-verify-token)');
}

function main() {
    console.log('🤖 MELANO INC - Funnel Validation\n');
    validateFiles();
    validateEnvironment();
    
    console.log('\n📋 NEXT STEPS:');
    console.log('1. Deploy to Netlify/Vercel');
    console.log('2. Set domain: brunomelano.com');
    console.log('3. Deploy n8n with HTTPS');
    console.log('4. Update webhookURL in config.js');
    console.log('5. Configure WhatsApp Cloud API callback');
    console.log('6. Test form submission and WhatsApp flow');
}

if (require.main === module) {
    main();
}

module.exports = { validateFiles };