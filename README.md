# 📧 ReachInbox AI Email Onebox

> **Enterprise-grade AI-powered email management platform with real-time IMAP synchronization, intelligent categorization, and RAG-based suggested replies.**

[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61dafb?logo=react)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green?logo=node.js)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-5-lightgrey?logo=express)](https://expressjs.com/)

**GitHub Repository:** [https://github.com/chiragSahani/ai-based-inbox-onebox.git](https://github.com/chiragSahani/ai-based-inbox-onebox.git)

---

## ✨ Features

### 🎯 Core Features
- 📧 **Real-Time Email Sync** - IMAP IDLE for ≥2 accounts (no polling, fetches last 100 emails)
- 🤖 **AI Categorization** - 11 intelligent categories using Google Gemini 2.5 Flash
- 🔍 **Full-Text Search** - Elasticsearch-powered search with multi-dimensional filtering
- 🎯 **Smart Filtering** - Filter by account, folder, and AI category
- 💬 **RAG-Based Replies** - Context-aware AI replies using Qdrant vector database
- 📨 **Webhook Integration** - Idempotent Slack notifications on "Interested" emails
- 🎨 **Modern UI** - Dark-themed Next.js 15 interface with shadcn/ui
- 📱 **Responsive Design** - Fully responsive with mobile support

### 🏆 Enterprise Features
- 🛡️ **Security** - Helmet.js security headers, CORS, API key authentication
- ⚡ **Rate Limiting** - 5 different rate limiters (API, Search, AI, Auth, Account)
- 📊 **Monitoring** - 5 health check endpoints, metrics, and performance tracking
- 🔄 **Feature Flags** - Toggle services via environment variables
- 🚨 **Error Handling** - Global error handler with custom error classes
- 📝 **Request Logging** - Morgan + Pino structured logging with request IDs
- ✅ **Input Validation** - Joi schema validation on all endpoints
- 🏗️ **MVC Architecture** - Clean separation with Model-Service-Controller pattern
- 🔁 **Idempotent Webhooks** - Message-ID based deduplication
- 🎭 **Graceful Shutdown** - Clean resource cleanup on exit

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                      FRONTEND (Port 3000)                   │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Next.js 15 + React 19 + shadcn/ui + Zustand        │  │
│  │  - 56 UI Components  - Dark Theme  - TypeScript     │  │
│  └────────────────────────┬─────────────────────────────┘  │
└───────────────────────────┼────────────────────────────────┘
                            │ HTTP/REST API
┌───────────────────────────┼────────────────────────────────┐
│                      BACKEND (Port 5000)                    │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Express 5 + TypeScript + MVC Architecture           │  │
│  │  - Security  - Rate Limiting  - Validation           │  │
│  └────────┬──────────┬──────────┬──────────┬────────────┘  │
└───────────┼──────────┼──────────┼──────────┼───────────────┘
            │          │          │          │
    ┌───────▼────┐ ┌──▼────┐ ┌──▼─────┐ ┌──▼──────┐
    │Elasticsearch│ │Qdrant │ │ Gmail  │ │ Gemini  │
    │   :9200    │ │ :6333 │ │  IMAP  │ │   AI    │
    └────────────┘ └───────┘ └────────┘ └─────────┘
```

**📖 For detailed architecture, see [ARCHITECTURE.md](ARCHITECTURE.md)**

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18+ ([Download](https://nodejs.org/))
- **Docker** & **Docker Compose** ([Install](https://www.docker.com/get-started))
- **Gmail** account with App Password
- **Gemini API** key ([Get Free Key](https://makersuite.google.com/app/apikey))

### Installation

#### 1️⃣ Clone Repository
```bash
git clone https://github.com/chiragSahani/ai-based-inbox-onebox.git
cd reachinbox-onebox
```

#### 2️⃣ Start Infrastructure (Elasticsearch + Qdrant)
```bash
docker-compose up -d

# Verify services are running
curl http://localhost:9200/_cluster/health
curl http://localhost:6333/healthz
```

#### 3️⃣ Configure Server
```bash
cd server
npm install
```

**Create `server/.env` file:**
```env
# Server Configuration
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:3000

# Feature Flags
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

# IMAP Account 2 (Optional)
IMAP_USER_2=second-email@gmail.com
IMAP_PASSWORD_2=your-16-char-app-password
IMAP_HOST_2=imap.gmail.com
IMAP_PORT_2=993

# Elasticsearch
ELASTICSEARCH_URL=http://localhost:9200

# Qdrant Vector Database
QDRANT_URL=http://localhost:6333

# Google Gemini AI
GEMINI_API_KEY=your-gemini-api-key-here

# Webhooks (Optional)
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
WEBHOOK_SITE_URL=https://webhook.site/your-unique-url
BOOKING_LINK=https://cal.com/your-username
```

#### 4️⃣ Configure Client
```bash
cd ../client
npm install  # or pnpm install
```

**Create `client/.env.local` file:**
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

#### 5️⃣ Run Application

**Terminal 1 - Backend Server:**
```bash
cd server
npm run dev
# Server running at http://localhost:5000
```

**Terminal 2 - Frontend Client:**
```bash
cd client
npm run dev
# Client running at http://localhost:3000
```

#### 6️⃣ Open Application
🎉 **Visit:** [http://localhost:3000](http://localhost:3000)

---

## 📸 What You'll See

- ✅ **Real emails** from your Gmail account synced in real-time
- ✅ **AI-categorized emails** with color-coded badges (11 categories)
- ✅ **Full-text search** across subject and body
- ✅ **Smart filters** by account, folder, and AI category
- ✅ **AI-generated reply suggestions** using RAG pipeline
- ✅ **Account switcher** for managing multiple email accounts
- ✅ **Beautiful dark theme** with purple gradients
- ✅ **Responsive layout** that works on mobile and desktop

---

## 📁 Project Structure

```
reachinbox-onebox/
├── client/                          # Next.js 15 Frontend
│   ├── app/                         # App Router (Next.js 15)
│   │   ├── layout.tsx               # Root layout
│   │   ├── page.tsx                 # Home page
│   │   └── globals.css              # Dark theme styles
│   ├── components/
│   │   ├── page.tsx                 # Main email app
│   │   ├── header.tsx               # Search + notifications
│   │   ├── sidebar.tsx              # Account/category filters
│   │   ├── email-list.tsx           # Email inbox list
│   │   ├── email-detail.tsx         # Email viewer
│   │   ├── suggested-replies.tsx    # AI reply generation
│   │   └── ui/                      # 56 shadcn/ui components
│   ├── hooks/
│   │   └── use-email-store.ts       # Zustand state management
│   ├── lib/
│   │   ├── api.ts                   # API client
│   │   └── constants.tsx            # AI categories config
│   └── package.json
│
├── server/                          # Express 5 Backend
│   ├── src/
│   │   ├── config/
│   │   │   ├── index.ts             # Environment config
│   │   │   ├── constants.ts         # App constants
│   │   │   ├── ai-prompts.config.ts # Gemini AI prompts
│   │   │   └── seed-data.ts         # Vector DB sample data
│   │   ├── models/
│   │   │   └── Email.model.ts       # Email entity
│   │   ├── controllers/
│   │   │   ├── email.controller.ts  # Email CRUD
│   │   │   ├── account.controller.ts# Account management
│   │   │   ├── health.controller.ts # Health checks
│   │   │   └── notification.controller.ts # Notifications
│   │   ├── services/
│   │   │   ├── elasticsearch.service.ts # Search engine
│   │   │   ├── imap.service.ts      # Email sync
│   │   │   ├── ai.service.ts        # Gemini AI
│   │   │   ├── vector.service.ts    # RAG pipeline
│   │   │   ├── webhook.service.ts   # Notifications
│   │   │   └── email-processor.service.ts # Orchestrator
│   │   ├── middlewares/
│   │   │   ├── security.middleware.ts # Helmet, CORS
│   │   │   ├── ratelimit.middleware.ts # 5 rate limiters
│   │   │   ├── error.middleware.ts  # Global error handler
│   │   │   └── logger.middleware.ts # Morgan + Pino
│   │   ├── validators/
│   │   │   └── email.validator.ts   # Joi validation
│   │   ├── api/
│   │   │   ├── email.routes.ts      # Email endpoints
│   │   │   ├── account.routes.ts    # Account endpoints
│   │   │   ├── health.routes.ts     # Health endpoints
│   │   │   └── notification.routes.ts # Notification endpoints
│   │   └── index.ts                 # Server entry point
│   └── package.json
│
├── docker-compose.yml               # Elasticsearch + Qdrant
├── .gitignore                       # Git ignore (.env, node_modules)
├── README.md                        # This file
└── ARCHITECTURE.md                  # Detailed architecture
```

---

## 🔒 Security Features

| Feature | Implementation | Status |
|---------|---------------|--------|
| **Security Headers** | Helmet.js (CSP, XSS, HSTS, X-Frame-Options) | ✅ |
| **CORS** | Origin whitelist with credentials support | ✅ |
| **Rate Limiting** | 5 endpoint-specific limiters | ✅ |
| **Input Validation** | Joi schema validation | ✅ |
| **Request Sanitization** | Trim inputs, size limits (10MB) | ✅ |
| **Error Handling** | Global handler with stack traces (dev only) | ✅ |
| **API Key Auth** | Production API key authentication | ✅ |
| **Load Balancer** | Trust proxy for X-Forwarded-* headers | ✅ |

### Rate Limits

| Endpoint | Window | Max Requests |
|----------|--------|--------------|
| General API | 15 min | 100 |
| Search | 5 min | 50 |
| AI Operations | 1 hour | 50 |
| Authentication | 15 min | 5 |
| Account Creation | 1 hour | 10 |

---

## 📡 API Documentation

### Email Endpoints

```http
GET /api/emails
```
Get all emails with pagination.

**Query Parameters:**
- `page` (number) - Page number (default: 1)
- `pageSize` (number) - Items per page (default: 20, max: 500)

**Response:**
```json
{
  "success": true,
  "data": {
    "emails": [...],
    "pagination": {
      "total": 150,
      "page": 1,
      "pageSize": 20,
      "totalPages": 8
    }
  }
}
```

---

```http
GET /api/emails/search
```
Search and filter emails.

**Query Parameters:**
- `q` (string) - Search query (searches subject + body)
- `account` (string) - Filter by account ID
- `folder` (string) - Filter by folder name
- `category` (string) - Filter by AI category
- `page` (number) - Page number
- `pageSize` (number) - Items per page

**Example:**
```bash
curl "http://localhost:5000/api/emails/search?q=meeting&category=Interested&page=1"
```

---

```http
GET /api/emails/:id
```
Get email by ID.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "1234567890",
    "from": "john@example.com",
    "subject": "Project Update",
    "body": "Email content...",
    "aiCategory": "Important",
    "date": "2024-01-15T10:30:00Z"
  }
}
```

---

```http
POST /api/emails/:id/suggest-reply
```
Generate AI-powered reply suggestion using RAG.

**Request Body:**
```json
{
  "includeContext": true
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "reply": "Thank you for your email...",
    "context": [...]
  }
}
```

### Account Endpoints

```http
GET /api/accounts
```
List all configured IMAP accounts.

### Health & Monitoring Endpoints

```http
GET /api/health              # Basic health check
GET /api/health/detailed     # All services status + metrics
GET /api/health/ready        # Kubernetes readiness probe
GET /api/health/live         # Kubernetes liveness probe
GET /api/health/metrics      # Application metrics
```

### Notification Endpoints

```http
GET /api/notifications           # Get all notifications
GET /api/notifications/unread    # Get unread notifications
PUT /api/notifications/:id/read  # Mark as read
DELETE /api/notifications        # Clear all
```

---

## 🤖 AI Categories

The system automatically categorizes emails into 11 intelligent categories:

| Category | Description | Icon |
|----------|-------------|------|
| **Interested** | Positive responses, asking questions | 🎯 |
| **Meeting Booked** | Confirmed meetings with date/time | 📅 |
| **Not Interested** | Clear rejections, "No thank you" | ❌ |
| **Follow Up** | Requires response, checking in | 📧 |
| **Job Opportunity** | Recruitment, career opportunities | 💼 |
| **Newsletter** | Marketing, promotional content | 📰 |
| **Spam** | Unsolicited, suspicious emails | 🚫 |
| **Out of Office** | Automated absence replies | 🏖️ |
| **Important** | Urgent, time-sensitive emails | ⚠️ |
| **Informational** | FYI, no action needed | ℹ️ |
| **Uncategorized** | Fallback category | 📁 |

---

## 🎨 UI Features

- **Dark Theme** - Professional purple gradient theme (`oklch` color space)
- **Search Bar** - Real-time full-text search
- **Sidebar Filters** - Account switcher + AI category filters
- **Email List** - Avatar initials, unread badges, star functionality
- **Email Detail View** - HTML email rendering with reply composer
- **AI Reply Generator** - RAG-based suggestions with copy-to-clipboard
- **Notification Center** - Real-time notifications with badge count
- **Responsive Layout** - Mobile-first design with breakpoints
- **Loading States** - Skeleton loaders and spinners
- **Error Handling** - Toast notifications for errors

---

## 📊 Monitoring & Health Checks

### Health Check Examples

```bash
# Basic health check
curl http://localhost:5000/api/health

# Detailed health with all services
curl http://localhost:5000/api/health/detailed

# Kubernetes readiness probe
curl http://localhost:5000/api/health/ready

# Application metrics
curl http://localhost:5000/api/health/metrics
```

### Detailed Health Response

```json
{
  "success": true,
  "timestamp": "2024-01-15T10:30:00Z",
  "uptime": 3600,
  "environment": "production",
  "services": {
    "elasticsearch": {
      "status": "healthy",
      "clusterStatus": "green"
    },
    "qdrant": {
      "status": "unknown",
      "message": "Health check not implemented"
    },
    "imap": {
      "status": "running",
      "message": "IMAP services are active"
    }
  },
  "system": {
    "platform": "linux",
    "nodeVersion": "v18.17.0",
    "memory": {
      "total": 16384,
      "free": 8192,
      "used": 8192,
      "percentage": 50
    },
    "cpu": {
      "cores": 8,
      "model": "Intel Core i7"
    }
  }
}
```

### Logging

**Request Logging:**
- HTTP requests logged with Morgan (dev/production formats)
- Unique request ID tracking (`X-Request-ID`)
- Performance monitoring (slow request detection >1s)

**Application Logging:**
- Structured JSON logs with Pino
- Log levels: error, warn, info, debug
- Automatic error serialization

---

## 🐛 Troubleshooting

### IMAP Connection Issues

**Problem:** `IMAP connection failed`

**Solutions:**
1. Use Gmail **App Password**, not your regular password
2. Enable IMAP in Gmail Settings → Forwarding and POP/IMAP
3. Enable 2-Step Verification to generate App Passwords
4. Check firewall allows port 993 (IMAP SSL)

```bash
# Test IMAP connection
openssl s_client -connect imap.gmail.com:993 -crlf
```

---

### Docker Services Not Running

**Problem:** Elasticsearch or Qdrant not accessible

**Solutions:**
```bash
# Check container status
docker ps

# View logs
docker logs reachinbox-onebox-elasticsearch-1
docker logs reachinbox-onebox-qdrant-1

# Restart services
docker-compose restart

# Rebuild containers
docker-compose down -v
docker-compose up -d --build
```

---

### Port Already in Use

**Problem:** `EADDRINUSE: address already in use`

**Solutions:**

**Windows:**
```cmd
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

**Linux/Mac:**
```bash
lsof -ti:5000 | xargs kill -9
```

**Or change port in `server/.env`:**
```env
PORT=5001
```

---

### Gemini API Rate Limits

**Problem:** `429 Too Many Requests` from Gemini API

**Solutions:**
1. Default: 15 calls/minute (configurable)
2. Increase delay in `server/.env`:
```env
GEMINI_CALLS_PER_MINUTE=10
```
3. Upgrade to Gemini Pro API for higher limits

---

## 🚀 Production Deployment

### Build for Production

```bash
# Server
cd server
npm run build
npm start

# Client
cd client
npm run build
npm start
```

### Environment Variables (Production)

```env
NODE_ENV=production
PORT=5000
CLIENT_URL=https://your-domain.com
API_KEY=your-secure-api-key-here

# Enable security features
ENABLE_API_KEY_AUTH=true
```

### Deployment Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Configure `API_KEY` for authentication
- [ ] Enable HTTPS (Let's Encrypt or certificate)
- [ ] Set up reverse proxy (Nginx/Apache)
- [ ] Configure CORS with production origins
- [ ] Enable Elasticsearch authentication
- [ ] Set up monitoring (Prometheus + Grafana)
- [ ] Configure centralized logging (ELK stack)
- [ ] Set appropriate rate limits
- [ ] Configure health check endpoints
- [ ] Set up automatic backups
- [ ] Configure secrets management (HashiCorp Vault)

### Docker Production Deployment

```bash
# Build images
docker build -t reachinbox-server:latest ./server
docker build -t reachinbox-client:latest ./client

# Run with docker-compose
docker-compose -f docker-compose.prod.yml up -d
```

---

## 🎓 Technologies Used

### Frontend Stack
| Technology | Version | Purpose |
|------------|---------|---------|
| **Next.js** | 15.2.4 | React framework with App Router |
| **React** | 19 | UI library with latest features |
| **TypeScript** | 5 | Type safety |
| **shadcn/ui** | Latest | 56 pre-built components |
| **Zustand** | Latest | Lightweight state management (< 1KB) |
| **Tailwind CSS** | 4.1.9 | Utility-first styling |
| **Lucide React** | 0.454.0 | Icon library (1000+ icons) |
| **Zod** | 3.25.76 | Schema validation |
| **React Hook Form** | 7.60.0 | Form management |

### Backend Stack
| Technology | Version | Purpose |
|------------|---------|---------|
| **Node.js** | 18+ | JavaScript runtime |
| **Express** | 5.1.0 | Web framework |
| **TypeScript** | 5.9.3 | Type safety |
| **Joi** | 18.0.1 | Input validation |
| **Helmet** | 8.1.0 | Security headers |
| **Pino** | 10.1.0 | Fast JSON logging |
| **Morgan** | 1.10.1 | HTTP request logging |
| **node-imap** | 0.9.6 | IMAP email sync |
| **Elasticsearch** | 7.17.1 | Full-text search |
| **Qdrant** | Latest | Vector database |
| **Google Gemini** | 0.24.1 | AI categorization & replies |

### Infrastructure
- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration
- **Elasticsearch** - Document store (9200)
- **Qdrant** - Vector store (6333)

---

## 🏆 Feature Implementation Status

### ✅ All Required Features
- [x] **Real-Time Email Sync** - IMAP IDLE for ≥2 accounts
- [x] **Fetch Last 30 Days** - Fetches last 100 emails on startup
- [x] **AI Categorization** - 11 categories using Gemini AI
- [x] **Full-Text Search** - Elasticsearch with subject + body
- [x] **Filtering** - Multi-dimensional (account, folder, category)
- [x] **RAG-Based Replies** - Qdrant vector search + Gemini
- [x] **Webhook Integration** - Idempotent Slack notifications
- [x] **Dark UI** - Professional Next.js interface

### ✅ Bonus Features (Enterprise-Grade)
- [x] **MVC Architecture** - Clean separation of concerns
- [x] **Security** - Helmet, CORS, rate limiting, validation
- [x] **Error Handling** - Global handler with custom errors
- [x] **Monitoring** - 5 health check endpoints
- [x] **Logging** - Morgan + Pino structured logs
- [x] **Feature Flags** - Toggle services via ENV
- [x] **Graceful Shutdown** - Clean resource cleanup
- [x] **Load Balancer Support** - Trust proxy configuration
- [x] **Type Safety** - Full TypeScript coverage
- [x] **Modern UI** - Next.js 15 + 56 shadcn/ui components

---

## 📦 NPM Scripts

### Server Scripts
```bash
npm run dev          # Development with ts-node-dev
npm run build        # Compile TypeScript to dist/
npm start            # Run compiled JavaScript
npm run lint         # Run ESLint
npm test             # Run tests (if implemented)
```

### Client Scripts
```bash
npm run dev          # Next.js development server
npm run build        # Production build
npm start            # Start production server
npm run lint         # Run Next.js linter
```

---

## 🔧 Configuration Guide

### Gmail App Password Setup

1. **Enable 2-Step Verification:**
   - Go to [Google Account Security](https://myaccount.google.com/security)
   - Enable "2-Step Verification"

2. **Generate App Password:**
   - Visit [App Passwords](https://myaccount.google.com/apppasswords)
   - Select "Mail" and "Other (Custom name)"
   - Copy the 16-character password
   - Use this in `IMAP_PASSWORD_1` (no spaces)

3. **Enable IMAP:**
   - Go to Gmail → Settings → Forwarding and POP/IMAP
   - Enable IMAP access

### Gemini API Key Setup

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Click "Create API Key"
3. Copy the key
4. Add to `server/.env`:
```env
GEMINI_API_KEY=AIzaSy...
```

### Slack Webhook Setup (Optional)

1. Create Slack app at [api.slack.com/apps](https://api.slack.com/apps)
2. Enable "Incoming Webhooks"
3. Create new webhook for your channel
4. Copy webhook URL
5. Add to `server/.env`:
```env
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/...
```

---

## 📚 Documentation

- **[README.md](README.md)** - This file (overview & quick start)
- **[ARCHITECTURE.md](ARCHITECTURE.md)** - Detailed architecture guide
- **[server/README.md](server/README.md)** - Backend API documentation

---

## 📄 License

ISC

---

## 🙏 Acknowledgments

- UI design inspired by [ReachInbox](https://reachinbox.com)
- Built with ❤️ using modern technologies

---

## 👥 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📞 Support

For issues and questions:
- 🐛 [Report Bug](https://github.com/chiragSahani/ai-based-inbox-onebox/issues)
- 💡 [Request Feature](https://github.com/chiragSahani/ai-based-inbox-onebox/issues)

---

**⭐ Star this repo if you find it helpful!**

Built for the ReachInbox Assignment | [GitHub](https://github.com/chiragSahani/ai-based-inbox-onebox.git)
