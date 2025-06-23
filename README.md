# 🌐 MELANO INC – El Futuro de la Automatización Inteligente

🚀 **Automatizá inversiones. Escalá resultados. Convertí tiempo en dinero real.**

👤 **CEO & Founder: [Bruno A. Melano](mailto:contacto@brunomelano.com)**  
Desde Mar del Plata al mundo, MELANO INC lidera la revolución de las inversiones automatizadas, real estate tech y ventas premium con bots inteligentes, IA personalizada y blockchain.

---

## 🎯 Nuestra Misión

Creamos **sistemas que venden, invierten y escalan solos**.  
Sin humo. Solo resultados.  
Bots financieros, estrategias tokenizadas y SaaS que convierten mientras dormís.

---

## ⚙️ Bots de Inversión Inteligente

| BOT | PERFIL | RIESGO | RETORNO |
|-----|--------|--------|---------|
| **Arbitraje** | Conservador | Bajo | 10% - 15% anual |
| **Scalping** | Dinámico | Medio | 15% - 20% anual |
| **Tendencias IA** | Visionario | Alto | 20% - 30% anual |

🧠 Todos los bots están listos para operar conectados a Kraken o Binance mediante API Key.  
🎯 **Melania Bot** se encarga de filtrar al inversor, entregar el bot adecuado y automatizar todo el onboarding.

---

## 💼 Nicho Estratégico

- 🏡 Agencias inmobiliarias premium  
- 💰 Inversores cripto y fondos privados  
- 🧠 Desarrolladores, consultoras y nuevos ricos digitales

👉 Todos buscan lo mismo: **automatización que convierta en real**.

---

## 🚀 MELANO INC para Developers

Este proyecto incluye:

- 🔧 **Backend:** FastAPI con conexión real a Kraken  
- 🖥️ **Frontend:** React + Tailwind + Panel administrativo  
- 🐳 Docker Ready  
- 🔐 Configuración `.env` segura  
- 🧠 Integración IA via OpenAI API  
- 📲 Webhook y panel de órdenes

---

## 🛠️ Instalación Local

### 1. Backend – FastAPI

```bash
cd backend
cp .env.example .env  # 👉 Agregá tus credenciales reales
# Recomendado:
docker build -t melano-backend .
docker run --env-file .env -p 8000:8000 melano-backend

# Alternativa sin Docker:
pip install -r requirements.txt
uvicorn app.main:app --reload


