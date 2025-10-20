# ReachInbox AI Email Onebox - Complete Architecture

## 📁 Project Structure

```
reachinbox-onebox/
│
├── server/                         # Backend Server (Port 5000)
│   ├── src/
│   │   ├── models/                # Data Models
│   │   │   └── Email.model.ts     # Email entity with validation
│   │   │
│   │   ├── controllers/           # Request Handlers (MVC Controllers)
│   │   │   ├── email.controller.ts      # Email CRUD operations
│   │   │   ├── account.controller.ts    # Account management
│   │   │   └── health.controller.ts     # Health checks & metrics
│   │   │
│   │   ├── services/              # Business Logic Layer
│   │   │   ├── elasticsearch.service.ts    # Email indexing & search
│   │   │   ├── imap.service.ts            # Real-time IMAP IDLE sync
│   │   │   ├── ai.service.ts              # Gemini AI categorization
│   │   │   ├── vector.service.ts          # Qdrant RAG pipeline
│   │   │   ├── webhook.service.ts         # Slack & webhooks
│   │   │   └── email-processor.service.ts # Email processing pipeline
│   │   │
│   │   ├── validators/            # Input Validation (Joi Schemas)
│   │   │   └── email.validator.ts # Email endpoint validation
│   │   │
│   │   ├── middlewares/           # Express Middlewares
│   │   │   ├── security.middleware.ts    # Helmet, CORS, Compression
│   │   │   ├── ratelimit.middleware.ts   # Rate limiting (5 types)
│   │   │   ├── error.middleware.ts       # Global error handling
│   │   │   └── logger.middleware.ts      # HTTP logging (Morgan + Pino)
│   │   │
│   │   ├── api/                   # Route Definitions
│   │   │   ├── email.routes.ts    # Email endpoints
│   │   │   ├── account.routes.ts  # Account endpoints
│   │   │   └── health.routes.ts   # Health & monitoring
│   │   │
│   │   ├── config/                # Configuration
│   │   │   └── index.ts           # Environment variables
│   │   │
│   │   ├── types/                 # TypeScript Types
│   │   │   └── index.ts           # Shared interfaces
│   │   │
│   │   ├── utils/                 # Utilities
│   │   │   └── logger.ts          # Pino logger configuration
│   │   │
│   │   └── index.ts               # Server entry point
│   │
│   ├── package.json
│   ├── tsconfig.json
│   ├── .env.example
│   └── README.md                  # Backend documentation
│
├── client/                        # Frontend (React - Port 3000)
│   ├── src/
│   │   ├── components/           # React Components
│   │   │   ├── EmailList.tsx     # Email list view
│   │   │   └── EmailModal.tsx    # Email detail modal
│   │   │
│   │   ├── services/             # API Client
│   │   │   └── api.ts            # Axios API calls
│   │   │
│   │   ├── types/                # TypeScript Types
│   │   │   └── index.ts          # Frontend interfaces
│   │   │
│   │   ├── App.tsx               # Main app component
│   │   └── App.css               # ReachInbox dark theme
│   │
│   ├── package.json
│   └── .env                      # Client configuration
│
├── docker-compose.yml            # Elasticsearch + Qdrant
├── README.md                     # Main documentation
└── ARCHITECTURE.md               # This file
```

## 🏗️ Architecture Layers

### 1. Presentation Layer (Frontend)
**Tech Stack:** React + TypeScript + Axios

**Components:**
- `App.tsx` - Main application with state management
- `EmailList.tsx` - Email list rendering
- `EmailModal.tsx` - Email details and AI reply generation

**Features:**
- Dark theme (ReachInbox inspired)
- Real-time auto-refresh (30s)
- Search and multi-filter
- Pagination
- AI reply generation

---

### 2. API Layer (Routes)
**Tech Stack:** Express Router

**Routes:**
- `/api/emails/*` - Email operations
- `/api/accounts` - Account management
- `/api/health/*` - Health checks

**Middleware Stack (in order):**
1. Helmet (security headers)
2. CORS (cross-origin)
3. Compression (gzip)
4. JSON parsing (10MB limit)
5. Request sanitization
6. Request ID tracking
7. HTTP logging
8. Performance monitoring
9. Rate limiting
10. Validation
11. Controllers
12. Error handling

---

### 3. Controller Layer
**Pattern:** MVC Controllers

**Responsibilities:**
- Parse and validate requests
- Call service layer
- Format responses
- Handle errors

**Controllers:**
- `EmailController` - Email CRUD
- `AccountController` - Account management
- `HealthController` - Monitoring

---

### 4. Service Layer
**Pattern:** Service-oriented architecture

**Services:**

| Service | Responsibility |
|---------|---------------|
| **ElasticsearchService** | Email indexing, full-text search, filtering |
| **IMAPService** | Real-time email sync via IMAP IDLE |
| **AIService** | Gemini API integration (categorization + replies) |
| **VectorService** | Qdrant vector DB for RAG |
| **WebhookService** | Slack & webhook notifications |
| **EmailProcessorService** | Orchestrates email processing pipeline |

---

### 5. Model Layer
**Pattern:** Domain models with validation

**Models:**
- `EmailModel` - Email entity with business logic
  - Validation methods
  - JSON serialization
  - Factory methods

---

### 6. Data Layer
**Databases:**

| Database | Purpose | Port |
|----------|---------|------|
| **Elasticsearch** | Full-text search, email storage | 9200 |
| **Qdrant** | Vector storage for RAG | 6333 |

**IMAP Servers:**
- Gmail IMAP (port 993)
- Real-time sync via IDLE

---

## 🔒 Security Architecture

### Defense in Depth

```
┌─────────────────────────────────────────────┐
│ 1. Network Layer                            │
│    - HTTPS (Production)                     │
│    - Firewall rules                         │
└─────────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────────┐
│ 2. Load Balancer / Reverse Proxy           │
│    - SSL Termination                        │
│    - DDoS protection                        │
└─────────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────────┐
│ 3. Rate Limiting Layer                      │
│    - IP-based throttling                    │
│    - Endpoint-specific limits               │
└─────────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────────┐
│ 4. Security Headers (Helmet)                │
│    - XSS Protection                         │
│    - CSP                                    │
│    - HSTS                                   │
└─────────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────────┐
│ 5. Input Validation (Joi)                   │
│    - Schema validation                      │
│    - Sanitization                           │
└─────────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────────┐
│ 6. Business Logic (Controllers/Services)    │
│    - Authorization checks                   │
│    - Business rules                         │
└─────────────────────────────────────────────┘
```

### Security Features

1. **Headers** (Helmet.js)
   - Content Security Policy
   - X-Frame-Options
   - X-Content-Type-Options
   - Strict-Transport-Security

2. **Rate Limiting**
   - General API: 100 req/15min
   - Search: 50 req/5min
   - AI Operations: 50 req/hour
   - Auth: 5 req/15min

3. **Input Validation**
   - Joi schema validation
   - Request sanitization
   - Size limits (10MB)

4. **CORS**
   - Whitelist origins
   - Credential support
   - Method restrictions

5. **API Key** (Production)
   - Header-based auth
   - Environment-specific

---

## 📊 Data Flow

### Email Processing Pipeline

```
1. IMAP Server
   │
   │ (IMAP IDLE - Real-time)
   ↓
2. IMAPService
   │ - Detect new email
   │ - Parse email content
   │
   ↓
3. EmailProcessorService
   │ ┌──────────────────────┐
   │ │ Index in Elasticsearch│
   │ └──────────────────────┘
   │ ┌──────────────────────┐
   │ │ AI Categorization    │
   │ │ (Gemini API)         │
   │ └──────────────────────┘
   │ ┌──────────────────────┐
   │ │ Update Category in ES│
   │ └──────────────────────┘
   │
   ├─[If "Interested"]──────┐
   │                        │
   ↓                        ↓
4. WebhookService     [Skip if not Interested]
   │
   ├─→ Slack Notification
   └─→ Generic Webhook
```

### RAG Reply Generation

```
1. User Request
   │
   ↓
2. Get Email from Elasticsearch
   │
   ↓
3. Generate Query Embedding
   │ (Gemini Embedding API)
   │
   ↓
4. Vector Search in Qdrant
   │ - Find top 3 similar contexts
   │
   ↓
5. Assemble Prompt
   │ - Context + Original Email
   │
   ↓
6. Generate Reply
   │ (Gemini LLM)
   │
   ↓
7. Return to User
```

---

## 🚀 Deployment Architecture

### Development
```
┌──────────────┐     ┌──────────────┐
│   Client     │────▶│   Server     │
│ localhost:3000│    │ localhost:5000│
└──────────────┘     └───────┬──────┘
                             │
        ┌────────────────────┼────────────────────┐
        ↓                    ↓                    ↓
  ┌──────────┐        ┌──────────┐        ┌──────────┐
  │Elasticsearch│      │  Qdrant  │        │   IMAP   │
  │  :9200   │        │  :6333   │        │  :993    │
  └──────────┘        └──────────┘        └──────────┘
```

### Production (Kubernetes)
```
                     ┌─────────────────┐
                     │ Load Balancer   │
                     │ (HTTPS/SSL)     │
                     └────────┬────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        ↓                     ↓                     ↓
   ┌─────────┐          ┌─────────┐          ┌─────────┐
   │Frontend │          │Frontend │          │Frontend │
   │  Pod 1  │          │  Pod 2  │          │  Pod 3  │
   └────┬────┘          └────┬────┘          └────┬────┘
        │                    │                     │
        └────────────────────┼─────────────────────┘
                             │
                     ┌───────▼────────┐
                     │ Backend Service│
                     │ (ClusterIP)    │
                     └───────┬────────┘
        ┌────────────────────┼────────────────────┐
        ↓                    ↓                    ↓
   ┌─────────┐          ┌─────────┐          ┌─────────┐
   │Backend  │          │Backend  │          │Backend  │
   │  Pod 1  │          │  Pod 2  │          │  Pod 3  │
   └────┬────┘          └────┬────┘          └────┬────┘
        │                    │                     │
        └────────────────────┼─────────────────────┘
                             │
        ┌────────────────────┼────────────────────┐
        ↓                    ↓                    ↓
  ┌──────────┐        ┌──────────┐        ┌──────────┐
  │Elasticsearch│      │  Qdrant  │        │ External │
  │ StatefulSet│       │StatefulSet│       │   IMAP   │
  └──────────┘        └──────────┘        └──────────┘
```

---

## 📈 Scalability

### Horizontal Scaling
- **Frontend:** Stateless, can scale infinitely
- **Backend:** Stateless (except IMAP connections), scale to N pods
- **Elasticsearch:** Clustered, scale with replicas
- **Qdrant:** Can be clustered

### Vertical Scaling
- Increase memory for Elasticsearch
- Increase CPU for AI operations

### Caching Strategy
- Client-side: 30s auto-refresh
- Server-side: (Can add Redis)

---

## 🔍 Monitoring

### Health Checks
- `/api/health` - Basic
- `/api/health/detailed` - All services
- `/api/health/ready` - Readiness probe
- `/api/health/live` - Liveness probe
- `/api/health/metrics` - Application metrics

### Logging Levels
- **Error:** Exceptions, failures
- **Warn:** Slow requests (>1s), deprecations
- **Info:** HTTP requests, business events
- **Debug:** Detailed debugging

### Metrics to Monitor
- Request rate
- Response time (p50, p95, p99)
- Error rate
- Memory usage
- CPU usage
- Elasticsearch cluster health
- IMAP connection status

---

## 🎯 Best Practices Implemented

### Backend
- ✅ MVC Architecture
- ✅ Dependency Injection
- ✅ Input Validation
- ✅ Error Handling
- ✅ Security Headers
- ✅ Rate Limiting
- ✅ Request Logging
- ✅ Health Checks
- ✅ Graceful Shutdown
- ✅ TypeScript Strict Mode

### Frontend
- ✅ Component-based Architecture
- ✅ Type Safety (TypeScript)
- ✅ Separation of Concerns
- ✅ API Abstraction Layer
- ✅ Error Handling
- ✅ Loading States
- ✅ Responsive Design

---

## 🔧 Technology Stack

### Backend
- **Runtime:** Node.js 18+
- **Language:** TypeScript
- **Framework:** Express.js
- **Validation:** Joi
- **Security:** Helmet, CORS, Rate-limit
- **Logging:** Pino + Morgan
- **Email:** node-imap, mailparser
- **Search:** Elasticsearch
- **Vector DB:** Qdrant
- **AI:** Google Gemini API

### Frontend
- **Library:** React 18
- **Language:** TypeScript
- **HTTP Client:** Axios
- **Styling:** CSS (Custom Dark Theme)

### Infrastructure
- **Containerization:** Docker
- **Orchestration:** Docker Compose (dev), Kubernetes (prod)
- **Databases:** Elasticsearch, Qdrant
- **External:** Gmail IMAP

---

## 📚 Documentation

- [Main README](README.md) - Quick start guide
- [Server README](server/README.md) - Backend architecture
- This file - Complete architecture

---

## 🎓 Assignment Compliance

All 6 phases implemented with enterprise-grade features:
- ✅ Real-time IMAP IDLE (no polling)
- ✅ Elasticsearch indexing and search
- ✅ AI categorization with Gemini
- ✅ Slack & webhook integrations
- ✅ React frontend with dark theme
- ✅ RAG pipeline for suggested replies
- ✅ **BONUS:** MVC architecture, security, validation, rate limiting, monitoring
