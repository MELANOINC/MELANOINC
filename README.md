# 🤖 MELANO INC - Bilingual Funnel System

![MELANO INC](https://img.shields.io/badge/MELANO-INC-FFD700?style=for-the-badge&logo=robot&logoColor=black)
![Status](https://img.shields.io/badge/STATUS-Production%20Ready-00D400?style=for-the-badge)
![Version](https://img.shields.io/badge/VERSION-1.0.0-blue?style=for-the-badge)

**IA • Automatización • Impacto**  
Sistemas que venden, invierten y escalan solos. **Cashflow desde día 1** con ROI medible en ≤30 días.

## 🎯 Sistema Completo

### ✨ Características Principales
- **🌍 Bilingüe** - Español/English con switch dinámico
- **🎨 Diseño Premium** - Tema negro/dorado, animaciones avanzadas
- **📱 Responsive** - Optimizado para todos los dispositivos
- **🤖 Automatización Total** - n8n + Supabase + WhatsApp Cloud API
- **📊 Analytics** - Tracking completo de conversiones
- **🔒 Seguridad** - RLS, validaciones, sanitización
- **💳 Stripe Checkout** - Pagos en 1 click
- **📧 Email Sequences** - Onboarding automatizado
- **💰 Revenue Analytics** - Métricas en tiempo real
- **🎯 Freemium to Premium** - Conversión optimizada

### 🏗️ Arquitectura
```
Landing → Stripe Checkout → Subscription → Email Sequences → Revenue Analytics
    ↓           ↓              ↓                ↓               ↓
Form Submit → Payment → User Onboarding → Conversion → Real-time Metrics
```

## 🚀 Deploy Instructions

### 1️⃣ Landing Page Deploy
```bash
# Build static files
npm run build

# Deploy to Netlify/Vercel
# Set domain: brunomelano.com
# Update assets/js/config.js → webhookURL after n8n setup
```

### 2️⃣ Supabase Setup (Extended)
```sql
-- Execute supabase/schema.sql in SQL Editor
-- Execute supabase/subscription_schema.sql for revenue tracking
-- Save SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY
```

### 3️⃣ Stripe Configuration
```bash
# Stripe Dashboard Setup:
# 1. Create products: Starter ($0), Pro ($297), Enterprise ($997)
# 2. Get publishable key and secret key
# 3. Configure webhooks → n8n endpoint
# 4. Update config.js with real Stripe keys
```

### 4️⃣ n8n Deployment (Extended)
```bash
# Import workflows:
# - n8n/lead_capture.json
# - n8n/waba_inbound.json
# - n8n/email_sequences.json (NEW)

# Environment Variables:
WABA_TOKEN=your_whatsapp_token
WABA_PHONE_NUMBER_ID=your_phone_id
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE=your_service_key
OWNER_WHATSAPP=+5492235506595
VERIFY_TOKEN=melano-verify-token
STRIPE_SECRET_KEY=your_stripe_secret
SENDGRID_API_KEY=your_sendgrid_key

# Deploy with HTTPS: https://n8n.YOUR-DOMAIN.com
```

### 5️⃣ WhatsApp Cloud API Setup
```
Callback URL: https://n8n.YOUR-DOMAIN.com/webhook/waba_inbound
Verify Token: melano-verify-token
Events: messages, message_status, message_template_status_update
```

## 💰 **NUEVAS FUNCIONALIDADES - CASHFLOW SYSTEM**

### ✅ **Stripe Checkout en 1 Click**
- 3 planes: Starter (Free), Pro ($297), Enterprise ($997)
- Onboarding automático post-pago
- Webhooks para sincronización en tiempo real

### ✅ **Email Sequences Automatizadas**
- **Welcome Series** → Onboarding nuevos usuarios
- **Trial Ending** → Conversión freemium → premium
- **Conversion Series** → Upgrades y retención
- Templates personalizables con variables dinámicas

### ✅ **Revenue Analytics en Tiempo Real**
- **MRR/ARR** tracking automático
- **Churn Rate** y Customer Lifetime Value
- **Conversion Rates** por plan
- Dashboard live con actualización cada 30s

### ✅ **Sistema Freemium Optimizado**
- Plan Starter gratuito con limitaciones
- Progresión natural hacia planes pagos
- Triggers automáticos para upgrade
- Métricas de conversión detalladas

## 🧪 Testing

### Validación Pre-Deploy
```bash
npm run validate
```

### Test Completo
```bash
# Set environment variables first
export WEBHOOK_URL="https://n8n.YOUR-DOMAIN.com/webhook/melano_lead"
export WABA_TOKEN="your_token"
export WABA_PHONE_NUMBER_ID="your_id"
export SUPABASE_URL="your_url"
export SUPABASE_SERVICE_ROLE="your_key"
export STRIPE_SECRET_KEY="your_stripe_key"

npm run test
```

### Test Stripe Integration
```bash
# Test checkout creation
curl -X POST "https://n8n.YOUR-DOMAIN.com/api/create-checkout-session" \
  -H "Content-Type: application/json" \
  -d '{"plan": "pro", "amount": "29700", "currency": "usd"}'

# Test webhook endpoint
curl -X POST "https://n8n.YOUR-DOMAIN.com/webhook/stripe-webhook" \
  -H "Content-Type: application/json" \
  -d '{"type": "customer.subscription.created", "data": {...}}'
```

### Test Manual WhatsApp
```bash
curl -X POST "https://graph.facebook.com/v20.0/$WABA_PHONE_NUMBER_ID/messages" \
  -H "Authorization: Bearer $WABA_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "messaging_product": "whatsapp",
    "to": "+5492235506595",
    "type": "text",
    "text": {"body": "🧪 Test OK - MELANO INC"}
  }'
```

### Test Supabase Direct
```bash
curl -X POST "$SUPABASE_URL/rest/v1/crm_clientes" \
  -H "apikey: $SUPABASE_SERVICE_ROLE" \
  -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE" \
  -H "Content-Type: application/json" \
  -H "Prefer: return=representation" \
  -d '{
    "name": "Test User",
    "email": "test@demo.com",
    "phone": "+5492235506595",
    "budget": ">20000",
    "urgency": "now",
    "message": "Test directo",
    "lang": "es"
  }'
```

## 📁 Estructura del Proyecto

```
MELANO-INC-FUNNEL/
├── index.html                 # Landing page principal
├── assets/
│   ├── css/
│   │   └── styles.css         # Estilos principales (negro/dorado)
│   ├── js/
│   │   ├── config.js          # Configuración y constantes
│   │   ├── translations.js    # Traducciones ES/EN
│   │   └── app.js            # Lógica principal
│   └── pdf/
│       ├── MELANO_INC_Automation_Guide_ES.pdf
│       ├── MELANO_INC_Automation_Guide_EN.pdf
│       ├── MELANO_INC_Bots_Manual_ES.pdf
│       └── MELANO_INC_Bots_Manual_EN.pdf
├── supabase/
│   └── schema.sql            # Schema completo del CRM
├── n8n/
│   ├── lead_capture.json     # Workflow captura de leads
│   └── waba_inbound.json     # Webhook WhatsApp entrante
├── scripts/
│   ├── validate.js           # Validación pre-deploy
│   └── test.js              # Tests de integración
└── README.md
```

## 🎨 Design System

### Colores
- **Primary Black**: `#0f0f0f`
- **Secondary Black**: `#1a1a1a` 
- **Accent Black**: `#2d2d2d`
- **Gold Primary**: `#ffd700`
- **Gold Secondary**: `#ffed4e`
- **Gold Dark**: `#b8860b`

### Typography
- **Font**: Inter (Google Fonts)
- **Weights**: 300, 400, 500, 600, 700, 800, 900

### Components
- **Gradient Gold**: `linear-gradient(135deg, #ffd700 0%, #b8860b 100%)`
- **Shadow Gold**: `0 0 20px rgba(255, 215, 0, 0.3)`
- **Animations**: Floating cards, hover effects, micro-interactions

## 🔧 Configuración

### Variables Críticas
```javascript
// assets/js/config.js
window.MELANO_CONF = {
    webhookURL: "https://n8n.YOUR-DOMAIN.com/webhook/melano_lead", // ⚠️ UPDATE!
    contact: {
        phone: "+5492235506595",
        email: "contacto@brunomelano.com",
        whatsapp: "https://wa.me/5492235506595"
    },
    checkoutURL: "https://link.mercadopago.com/melanoinc"
};
```

### Supabase Tables
- **crm_clientes** - Leads principales
- **crm_interactions** - Historial de comunicaciones
- **crm_analytics** - Eventos y métricas

### n8n Workflows
- **Lead Capture** - Formulario → Supabase → WhatsApp
- **WhatsApp Inbound** - Mensajes entrantes → Notificaciones

## ✅ Checklist Final

### Pre-Deploy
- [ ] Todos los archivos validados (`npm run validate`)
- [ ] PDFs subidos al directorio `assets/pdf/`
- [ ] Dominio configurado: brunomelano.com
- [ ] n8n deployado con HTTPS
- [ ] Variables de entorno configuradas

### Post-Deploy
- [ ] Landing online y funcionando
- [ ] Form submit → Supabase ✅
- [ ] Notificaciones WhatsApp ✅
- [ ] Callback WhatsApp Cloud API verificado
- [ ] PDFs descargables
- [ ] Switch de idiomas funcionando
- [ ] Responsive en móviles

### Tests Finales
- [ ] Submit formulario desde landing
- [ ] Recibir WhatsApp en +5492235506595
- [ ] Verificar data en Supabase
- [ ] Test downloads PDFs
- [ ] Link MercadoPago funcional

## 📞 Contacto

**Bruno A. Melano**  
CEO & Founder | MELANO INC  
📧 contacto@brunomelano.com  
📱 +54 9223 550-6595  
🌐 https://brunomelano.com  

---

**🤖 MELANO INC - IA • Automatización • Impacto**  
*Sistemas que venden, invierten y escalan solos.*