# ReachInbox AI Email Onebox 🚀

Enterprise-grade AI-powered email management platform with real-time IMAP synchronization, intelligent categorization, and RAG-based suggested replies.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18-61dafb)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-5-lightgrey)](https://expressjs.com/)

## ✨ Features

### Core Features
- 📧 **Real-Time Email Sync** - IMAP sync for ≥2 accounts (fetches last 30 days)
- 🤖 **AI Categorization** - 10 categories (Interested, Meeting Booked, Follow Up, Job Opportunity, Newsletter, Spam, Out of Office, Important, Informational, Not Interested)
- 🔍 **Full-Text Search** - Elasticsearch indexing with folder/account filters
- 🎯 **Smart Filtering** - Multi-dimensional filtering (account, folder, category)
- 💬 **RAG-Based Replies** - Context-aware AI replies using vector database + booking link injection
- 📨 **Webhook Integration** - Idempotent Slack + webhook.site notifications on "Interested"
- 🎨 **Dark UI** - Professional ReachInbox-inspired interface with search/filter
- 📱 **Responsive Design** - Works on desktop and mobile

### Enterprise Features
- 🛡️ **Security** - OAuth2-ready, secure secrets management, GDPR-friendly
- ⚡ **Rate Limiting** - Gemini API: 15 calls/minute (configurable)
- 📊 **Monitoring** - Health checks, metrics, detailed logging
- 🔄 **Feature Flags** - Backwards-compatible ENV flags for Elasticsearch, Vector DB, AI, Webhooks
- 🚨 **Error Handling** - Global error handler, custom error classes
- 📝 **Request Logging** - HTTP logging with Morgan + Pino
- ✅ **Input Validation** - Joi schema validation
- 🏗️ **MVC Architecture** - Model-Service-Controller pattern
- 🔁 **Idempotent Webhooks** - Dedupe by message-id

## 🏗️ Architecture

```
┌─────────────┐         ┌──────────────────────────────┐
│   Client    │────────▶│         Server API           │
│  (React)    │  HTTP   │  (Express + TypeScript)      │
│  Port 3000  │◀────────│       Port 5000              │
└─────────────┘         └──────────┬───────────────────┘
                                   │
                    ┌──────────────┼──────────────┐
                    ↓              ↓              ↓
              ┌──────────┐  ┌──────────┐  ┌──────────┐
              │Elasticsearch│ │  Qdrant  │  │   IMAP   │
              │   :9200  │  │  :6333   │  │   :993   │
              └──────────┘  └──────────┘  └──────────┘
```

**See [ARCHITECTURE.md](ARCHITECTURE.md) for detailed architecture documentation.**

## 🚀 Quick Start

> **📖 For detailed integration documentation, see [INTEGRATION.md](INTEGRATION.md)**
>
> **⚡ For fast setup, see [QUICKSTART.md](QUICKSTART.md)**

### Prerequisites
- Node.js 18+
- Docker & Docker Compose (for Elasticsearch & Qdrant - no API keys needed)
- Gmail account with App Password (for IMAP)
- Gemini API key (for AI features)

### 1. Clone & Setup

```bash
git clone <your-repo>
cd reachinbox-onebox
```

### 2. Start Infrastructure

```bash
# Start Elasticsearch & Qdrant
docker-compose up -d

# Verify services
curl http://localhost:9200
curl http://localhost:6333/healthz
```

### 3. Configure Server

```bash
cd server
npm install
# Create .env file (see below)
```

**.env Configuration:**
```env
# Server
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:3000

# Feature Flags (Set to 'false' to disable)
ENABLE_ELASTICSEARCH=true
ENABLE_VECTOR_DB=true
ENABLE_AI_LABELING=true
ENABLE_WEBHOOKS=true
ENABLE_REALTIME=false

# IMAP Account 1 (Required)
IMAP_USER_1=your-email@gmail.com
IMAP_PASSWORD_1=your-16-char-app-password
IMAP_HOST_1=imap.gmail.com
IMAP_PORT_1=993

# IMAP Account 2 (Optional - for ≥2 accounts requirement)
IMAP_USER_2=another-email@gmail.com
IMAP_PASSWORD_2=your-16-char-app-password
IMAP_HOST_2=imap.gmail.com
IMAP_PORT_2=993

# Elasticsearch (no auth required for local Docker)
ELASTICSEARCH_URL=http://localhost:9200

# Qdrant Vector DB (no API key required for local Docker)
QDRANT_URL=http://localhost:6333

# Gemini API
GEMINI_API_KEY=your-gemini-api-key-here
GEMINI_CALLS_PER_MINUTE=15

# Webhooks
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
WEBHOOK_SITE_URL=https://webhook.site/your-unique-url
BOOKING_LINK=https://cal.com/example
```

### 4. Setup Client

```bash
cd ../client
npm install  # or pnpm install

# Create .env.local file
echo "NEXT_PUBLIC_API_URL=http://localhost:5000" > .env.local
```

### 5. Run Application

**Terminal 1 - Server:**
```bash
cd server
npm run dev
```

**Terminal 2 - Client:**
```bash
cd client
npm run dev  # or pnpm dev
```

🎉 **Open** http://localhost:3000

### What You'll See

- ✅ Real emails from your Gmail account
- ✅ AI-categorized emails (11 categories)
- ✅ Full-text search
- ✅ AI-generated reply suggestions
- ✅ Account switcher (if you configured multiple accounts)
- ✅ Dark mode UI with purple gradients

## 📁 Project Structure

```
reachinbox-onebox/
├── server/                    # Backend (MVC Architecture)
│   ├── src/
│   │   ├── models/           # Data models
│   │   ├── controllers/      # Request handlers
│   │   ├── services/         # Business logic
│   │   ├── validators/       # Input validation
│   │   ├── middlewares/      # Security, logging, errors
│   │   ├── api/              # Route definitions
│   │   └── index.ts          # Server entry
│   └── README.md             # Backend docs
│
├── client/                    # Frontend (React)
│   ├── src/
│   │   ├── components/       # React components
│   │   ├── services/         # API client
│   │   └── App.tsx           # Main app
│   └── package.json
│
├── docker-compose.yml         # Elasticsearch + Qdrant
├── README.md                  # This file
└── ARCHITECTURE.md            # Detailed architecture
```

## 🔒 Security Features

| Feature | Implementation |
|---------|----------------|
| **Security Headers** | Helmet.js (CSP, HSTS, XSS protection) |
| **CORS** | Configurable origin whitelist |
| **Rate Limiting** | 5 different limiters (API, Search, AI, Auth) |
| **Input Validation** | Joi schema validation |
| **Request Sanitization** | Trim, size limits |
| **Error Handling** | Global error handler |
| **API Key Auth** | Production API key |
| **Load Balancer** | Trust proxy enabled |

## 📡 API Endpoints

### Email Operations
```
GET    /api/emails              # Get all emails (paginated)
GET    /api/emails/search       # Search & filter
GET    /api/emails/:id          # Get by ID
POST   /api/emails/:id/suggest-reply  # AI reply (rate limited)
```

### Accounts
```
GET    /api/accounts            # List configured accounts
```

### Health & Monitoring
```
GET    /api/health              # Basic health
GET    /api/health/detailed     # All services status
GET    /api/health/ready        # Readiness probe (K8s)
GET    /api/health/live         # Liveness probe (K8s)
GET    /api/health/metrics      # Application metrics
```

## 🎨 UI Features

- **Dark Theme** - Purple gradients (#667eea → #764ba2)
- **Real-Time Updates** - Auto-refresh every 30s
- **Search** - Full-text search across subject & body
- **Filters** - Account, Folder, AI Category
- **Pagination** - Navigate through emails
- **Email Modal** - View details & generate AI replies
- **Color-Coded Tags** - Visual AI category indicators
- **Responsive** - Mobile-friendly design

## 📊 Monitoring

### Health Checks
```bash
# Basic health
curl http://localhost:5000/api/health

# Detailed with all services
curl http://localhost:5000/api/health/detailed

# Application metrics
curl http://localhost:5000/api/health/metrics
```

### Logging
- **HTTP Requests** - Morgan (development/production formats)
- **Application Logs** - Pino (structured JSON)
- **Performance** - Slow request detection (>1s)
- **Request Tracking** - Unique request IDs

## 🚨 Error Handling

All errors follow consistent format:
```json
{
  "success": false,
  "message": "Error description",
  "statusCode": 400,
  "errors": [...],  // Validation errors
  "stack": "..."    // Development only
}
```

**HTTP Status Codes:**
- `400` - Bad Request (validation)
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `429` - Too Many Requests
- `500` - Internal Server Error
- `503` - Service Unavailable

## ⚡ Rate Limits

| Operation | Window | Max Requests |
|-----------|--------|--------------|
| General API | 15 min | 100 |
| Search | 5 min | 50 |
| AI Operations | 1 hour | 50 |
| Authentication | 15 min | 5 |

## 🔧 Configuration

### Gmail Setup
1. Enable IMAP in Gmail settings
2. Enable 2-Step Verification
3. Generate App Password: https://myaccount.google.com/apppasswords
4. Use App Password in `IMAP_PASSWORD_1`

### Gemini API
1. Get API key: https://makersuite.google.com/app/apikey
2. Add to `GEMINI_API_KEY` in `.env`

### Slack Webhook (Optional)
1. Create Slack app: https://api.slack.com/apps
2. Enable Incoming Webhooks
3. Add URL to `SLACK_WEBHOOK_URL`

## 🐛 Troubleshooting

### IMAP Connection Failed
```bash
# Check credentials
# Use Gmail App Password (not regular password)
# Verify IMAP is enabled in Gmail settings
```

### Docker Services Not Running
```bash
# Check status
docker ps

# View logs
docker logs es-onebox
docker logs qdrant-onebox

# Restart
docker-compose restart
```

### Port Already in Use
```bash
# Change server port in server/.env
PORT=5001

# Or kill process using port
# Windows: netstat -ano | findstr :5000
# Linux/Mac: lsof -ti:5000 | xargs kill
```

## 📦 Scripts

### Server
```bash
npm run dev      # Development with ts-node
npm run build    # Compile TypeScript
npm start        # Run compiled code
```

### Client
```bash
npm start        # Development server
npm run build    # Production build
npm test         # Run tests
```

## 🚀 Production Deployment

### Build
```bash
# Server
cd server && npm run build

# Client
cd client && npm run build
```

### Environment
```env
NODE_ENV=production
PORT=5000
CLIENT_URL=https://your-frontend.com
API_KEY=your-secure-api-key
```

### Deployment Checklist
- [ ] Set `NODE_ENV=production`
- [ ] Configure `API_KEY`
- [ ] Enable HTTPS
- [ ] Set up reverse proxy (Nginx)
- [ ] Configure CORS origins
- [ ] Enable Elasticsearch auth
- [ ] Set up monitoring
- [ ] Configure health checks
- [ ] Enable centralized logging
- [ ] Set appropriate rate limits

## 📚 Documentation

### Main Documentation
- **[README.md](README.md)** - This file (overview & quick start)
- **[QUICKSTART.md](QUICKSTART.md)** - 5-minute setup guide
- **[INTEGRATION.md](INTEGRATION.md)** - Complete frontend-backend integration guide
- **[INTEGRATION_SUMMARY.md](INTEGRATION_SUMMARY.md)** - Integration completion summary
- **[ARCHITECTURE.md](ARCHITECTURE.md)** - Complete architecture guide

### Component Documentation
- **[server/README.md](server/README.md)** - Backend API documentation
- **[server/ARCHITECTURE.md](server/ARCHITECTURE.md)** - Backend architecture details

## 🎓 Technologies Used

### Backend
- **Node.js** + **TypeScript** - Runtime & language
- **Express.js** - Web framework
- **Joi** - Input validation
- **Helmet** - Security headers
- **Pino** + **Morgan** - Logging
- **node-imap** - IMAP client
- **Elasticsearch** - Search engine
- **Qdrant** - Vector database
- **Gemini AI** - AI categorization & replies

### Frontend
- **Next.js 15** - React framework with App Router
- **React 19** - UI library
- **TypeScript** - Type safety
- **Zustand** - State management
- **shadcn/ui** - Component library (57 components)
- **Tailwind CSS 4** - Utility-first styling
- **Lucide React** - Icon library

### Infrastructure
- **Docker** - Containerization
- **Docker Compose** - Local orchestration
- **Elasticsearch** - Document store
- **Qdrant** - Vector store

## 🏆 Features Implemented

### Phase 0: Project Setup ✅
- TypeScript + Node.js backend
- React + TypeScript frontend
- Docker Compose infrastructure
- MVC architecture

### Phase 1: Real-Time Sync ✅
- IMAP IDLE (no polling)
- Connection watchdog
- Auto-reconnection
- Initial sync (30 days)

### Phase 2: Search ✅
- Elasticsearch indexing
- Full-text search
- Multi-filter support
- Pagination

### Phase 3: AI Categorization ✅
- Gemini API integration
- 5 categories + Uncategorized
- Retry with exponential backoff
- JSON schema validation

### Phase 4: Webhooks ✅
- Slack notifications
- Generic webhook
- "Interested" trigger

### Phase 5: Frontend ✅
- React with TypeScript
- Dark ReachInbox theme
- Search & filters
- Email modal
- Real-time updates

### Phase 6: RAG Pipeline ✅
- Qdrant vector database
- Embedding generation
- Context retrieval
- AI reply generation

### Bonus Features ✅
- MVC architecture
- Input validation (Joi)
- Security (Helmet, CORS)
- Rate limiting (5 types)
- Error handling
- Health checks & monitoring
- Request logging
- Load balancer support

## 📄 License

ISC

## 🙏 Credits

UI design inspired by [ReachInbox](https://reachinbox.com)

---

Built with ❤️ for ReachInbox Assignment
