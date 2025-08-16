#!/usr/bin/env node

/**
 * MELANO INC - Test Script
 * Tests API endpoints and integrations
 */

const https = require('https');
const http = require('http');

// Test configuration
const TEST_CONFIG = {
    webhookURL: process.env.WEBHOOK_URL || 'https://n8n.YOUR-DOMAIN.com/webhook/melano_lead',
    wabaToken: process.env.WABA_TOKEN,
    wabaPhoneId: process.env.WABA_PHONE_NUMBER_ID,
    supabaseUrl: process.env.SUPABASE_URL,
    supabaseKey: process.env.SUPABASE_SERVICE_ROLE,
    ownerWhatsApp: process.env.OWNER_WHATSAPP || '+5492235506595'
};

// Test data
const TEST_LEAD = {
    name: 'Test User',
    email: 'test@demo.com',
    phone: '+5492235506595',
    budget: '>20000',
    urgency: 'asap',
    message: 'Testing MELANO INC system',
    language: 'es',
    source: 'test_script',
    user_agent: 'Node.js Test Script',
    referrer: '',
    url: 'https://brunomelano.com',
    timestamp: new Date().toISOString()
};

function makeRequest(url, options, data = null) {
    return new Promise((resolve, reject) => {
        const client = url.startsWith('https:') ? https : http;
        
        const req = client.request(url, options, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                resolve({
                    statusCode: res.statusCode,
                    headers: res.headers,
                    body: body
                });
            });
        });
        
        req.on('error', reject);
        
        if (data) {
            req.write(JSON.stringify(data));
        }
        
        req.end();
    });
}

async function testWebhook() {
    console.log('🔗 Testing webhook endpoint...');
    
    try {
        const response = await makeRequest(TEST_CONFIG.webhookURL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'MELANO-Test-Script/1.0'
            }
        }, TEST_LEAD);
        
        console.log(`Status: ${response.statusCode}`);
        console.log(`Response: ${response.body}`);
        
        if (response.statusCode === 200) {
            console.log('✅ Webhook test passed');
            return true;
        } else {
            console.log('❌ Webhook test failed');
            return false;
        }
    } catch (error) {
        console.log(`❌ Webhook error: ${error.message}`);
        return false;
    }
}

async function testSupabase() {
    console.log('\n📊 Testing Supabase connection...');
    
    if (!TEST_CONFIG.supabaseUrl || !TEST_CONFIG.supabaseKey) {
        console.log('⚠️  Supabase credentials not configured');
        return false;
    }
    
    const url = `${TEST_CONFIG.supabaseUrl}/rest/v1/crm_clientes`;
    
    try {
        const response = await makeRequest(url, {
            method: 'POST',
            headers: {
                'apikey': TEST_CONFIG.supabaseKey,
                'Authorization': `Bearer ${TEST_CONFIG.supabaseKey}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=representation'
            }
        }, {
            name: 'Test User',
            email: 'test+supabase@demo.com',
            phone: '+5492235506595',
            budget: '>20000',
            urgency: 'now',
            message: 'Supabase connection test',
            lang: 'es'
        });
        
        console.log(`Status: ${response.statusCode}`);
        console.log(`Response: ${response.body}`);
        
        if (response.statusCode === 201) {
            console.log('✅ Supabase test passed');
            return true;
        } else {
            console.log('❌ Supabase test failed');
            return false;
        }
    } catch (error) {
        console.log(`❌ Supabase error: ${error.message}`);
        return false;
    }
}

async function testWhatsApp() {
    console.log('\n💬 Testing WhatsApp API...');
    
    if (!TEST_CONFIG.wabaToken || !TEST_CONFIG.wabaPhoneId) {
        console.log('⚠️  WhatsApp credentials not configured');
        return false;
    }
    
    const url = `https://graph.facebook.com/v20.0/${TEST_CONFIG.wabaPhoneId}/messages`;
    
    try {
        const response = await makeRequest(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${TEST_CONFIG.wabaToken}`,
                'Content-Type': 'application/json'
            }
        }, {
            messaging_product: 'whatsapp',
            to: TEST_CONFIG.ownerWhatsApp,
            type: 'text',
            text: {
                body: '🧪 MELANO INC Test Message\n\nAPI connection test successful!\n\n' + new Date().toISOString()
            }
        });
        
        console.log(`Status: ${response.statusCode}`);
        console.log(`Response: ${response.body}`);
        
        if (response.statusCode === 200) {
            console.log('✅ WhatsApp test passed');
            return true;
        } else {
            console.log('❌ WhatsApp test failed');
            return false;
        }
    } catch (error) {
        console.log(`❌ WhatsApp error: ${error.message}`);
        return false;
    }
}

async function testDomain() {
    console.log('\n🌐 Testing domain resolution...');
    
    const domains = [
        'https://brunomelano.com',
        'https://n8n.YOUR-DOMAIN.com' // Update after n8n deployment
    ];
    
    let passed = 0;
    
    for (const domain of domains) {
        try {
            const response = await makeRequest(domain, { method: 'GET' });
            if (response.statusCode < 400) {
                console.log(`✅ ${domain} - Status: ${response.statusCode}`);
                passed++;
            } else {
                console.log(`❌ ${domain} - Status: ${response.statusCode}`);
            }
        } catch (error) {
            console.log(`❌ ${domain} - Error: ${error.message}`);
        }
    }
    
    return passed === domains.length;
}

async function main() {
    console.log('🤖 MELANO INC - Integration Tests\n');
    
    const tests = [
        { name: 'Domain Resolution', fn: testDomain },
        { name: 'Webhook Endpoint', fn: testWebhook },
        { name: 'Supabase Database', fn: testSupabase },
        { name: 'WhatsApp API', fn: testWhatsApp }
    ];
    
    let passed = 0;
    
    for (const test of tests) {
        const result = await test.fn();
        if (result) passed++;
        console.log(''); // Space between tests
    }
    
    console.log('📊 TEST SUMMARY:');
    console.log(`✅ Passed: ${passed}/${tests.length} tests`);
    
    if (passed === tests.length) {
        console.log('\n🎉 All tests passed! System is ready.');
    } else {
        console.log('\n⚠️  Some tests failed. Check configuration.');
    }
    
    console.log('\n📋 MANUAL TESTS:');
    console.log('1. Submit form on landing page');
    console.log('2. Check WhatsApp notifications');
    console.log('3. Verify Supabase data insertion');
    console.log('4. Test PDF downloads');
    console.log('5. Test language switching');
    console.log('6. Test responsive design');
}

if (require.main === module) {
    main().catch(console.error);
}

module.exports = { testWebhook, testSupabase, testWhatsApp };