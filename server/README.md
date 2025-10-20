# ReachInbox Server - Backend Architecture

Enterprise-grade backend server with MVC architecture, security middleware, rate limiting, and comprehensive error handling.

## 🏗️ Architecture

### MVC Structure

```
server/src/
├── models/              # Data models and business logic
│   └── Email.model.ts   # Email entity with validation
│
├── controllers/         # Request handlers (business logic)
│   ├── email.controller.ts     # Email operations
│   ├── account.controller.ts   # Account management
│   └── health.controller.ts    # Health checks & metrics
│
├── services/            # Business logic layer
│   ├── elasticsearch.service.ts  # Email indexing & search
│   ├── imap.service.ts          # Real-time email sync
│   ├── ai.service.ts            # Gemini AI integration
│   ├── vector.service.ts        # Qdrant RAG pipeline
│   ├── webhook.service.ts       # Slack & webhooks
│   └── email-processor.service.ts # Email processing pipeline
│
├── validators/          # Request validation
│   └── email.validator.ts  # Joi schemas for validation
│
├── middlewares/         # Express middlewares
│   ├── security.middleware.ts   # Helmet, CORS, compression
│   ├── ratelimit.middleware.ts  # Rate limiting
│   ├── error.middleware.ts      # Error handling
│   └── logger.middleware.ts     # HTTP logging
│
├── api/                 # Route definitions
│   ├── email.routes.ts   # Email endpoints
│   ├── account.routes.ts # Account endpoints
│   └── health.routes.ts  # Health & monitoring
│
├── config/              # Configuration
│   └── index.ts         # Environment config
│
├── types/               # TypeScript types
│   └── index.ts         # Shared interfaces
│
└── utils/               # Utilities
    └── logger.ts        # Pino logger
```

## 🛡️ Security Features

### 1. Helmet Security Headers
- XSS Protection
- Content Security Policy
- HSTS (HTTP Strict Transport Security)
- Frame Options (Clickjacking prevention)
- Content Type Options

### 2. CORS Configuration
- Origin whitelist (configurable)
- Credentials support
- Method restrictions
- Header controls

### 3. Request Sanitization
- Trim whitespace from inputs
- Body parsing limits (10MB)
- Query parameter sanitization

### 4. API Key Validation
- Production API key requirement
- Header-based authentication
- Query parameter fallback

## ⚡ Rate Limiting

Multiple rate limiters for different operations:

| Limiter | Window | Max Requests | Scope |
|---------|--------|--------------|-------|
| **General API** | 15 min | 100 | All API endpoints |
| **Search** | 5 min | 50 | Search operations |
| **AI Operations** | 1 hour | 50 | Expensive AI calls |
| **Auth** | 15 min | 5 | Login attempts |

### Load Balancer Support
- `trust proxy` enabled
- IP-based rate limiting works behind reverse proxies

## ✅ Input Validation

Using **Joi** for schema validation:

```typescript
// Example: Search emails validation
{
  q: string (max 500 chars, optional),
  account: email format (optional),
  folder: enum ['INBOX', 'Sent', 'Drafts', 'Trash'] (optional),
  category: enum [AI categories] (optional),
  page: integer min(1) (optional, default: 1),
  pageSize: integer min(1) max(100) (optional, default: 20)
}
```

All validation errors return:
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {"field": "email", "message": "must be a valid email"}
  ]
}
```

## 🚨 Error Handling

### Error Classes
- **AppError**: Custom operational errors
- **ValidationError**: Input validation failures
- **ResponseError**: Elasticsearch errors
- **IMAP Errors**: Email service errors

### Error Response Format
```json
{
  "success": false,
  "message": "Error description",
  "statusCode": 400,
  "stack": "..." // Only in development
}
```

### Error Codes
- `400` - Bad Request (validation)
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `429` - Too Many Requests
- `500` - Internal Server Error
- `503` - Service Unavailable

### Global Error Handlers
- Uncaught exceptions
- Unhandled promise rejections
- Async error wrapper

## 📊 Monitoring & Health Checks

### Endpoints

#### `GET /api/health`
Basic health check
```json
{
  "success": true,
  "message": "Service is healthy",
  "timestamp": "2025-10-19T...",
  "uptime": 3600,
  "environment": "production"
}
```

#### `GET /api/health/detailed`
Comprehensive health check
```json
{
  "success": true,
  "services": {
    "elasticsearch": {"status": "healthy", "clusterStatus": "green"},
    "qdrant": {"status": "unknown"},
    "imap": {"status": "running"}
  },
  "system": {
    "memory": {"total": 16384, "used": 8192, "percentage": 50},
    "cpu": {"cores": 8}
  }
}
```

#### `GET /api/health/ready`
Kubernetes readiness probe

#### `GET /api/health/live`
Kubernetes liveness probe

#### `GET /api/health/metrics`
Application metrics
```json
{
  "uptime": 3600,
  "memory": {
    "rss": 256,
    "heapUsed": 128
  },
  "cpu": {...}
}
```

## 📝 Logging

### HTTP Request Logging
Using **Morgan** + **Pino**:
- Development: Simple format
- Production: Apache combined format
- Response time tracking
- Slow request detection (>1s)

### Request Tracking
- Unique request IDs
- `X-Request-ID` header
- Performance monitoring

### Log Levels
- `error` - Errors and exceptions
- `warn` - Warnings and slow requests
- `info` - General information
- `debug` - Debug information (development)

## 🔌 API Endpoints

### Email Endpoints
```
GET    /api/emails              # Get all emails (paginated)
GET    /api/emails/search       # Search & filter emails
GET    /api/emails/:id          # Get email by ID
POST   /api/emails/:id/suggest-reply  # Generate AI reply (rate limited)
```

### Account Endpoints
```
GET    /api/accounts            # Get configured accounts
```

### Health Endpoints
```
GET    /api/health              # Basic health check
GET    /api/health/detailed     # Detailed health check
GET    /api/health/ready        # Readiness probe
GET    /api/health/live         # Liveness probe
GET    /api/health/metrics      # Metrics
```

## 🚀 Running the Server

### Development
```bash
npm run dev
```

### Production
```bash
npm run build
npm start
```

### Environment Variables
See `.env.example` for all configuration options.

## 📦 Dependencies

### Core
- `express` - Web framework
- `typescript` - Type safety

### Security
- `helmet` - Security headers
- `cors` - CORS configuration
- `compression` - Response compression
- `express-rate-limit` - Rate limiting

### Validation
- `joi` - Schema validation
- `express-validator` - Request validation

### Logging
- `pino` - Fast JSON logger
- `morgan` - HTTP request logger
- `pino-pretty` - Pretty logging (dev)

### Business Logic
- `@elastic/elasticsearch` - Search engine
- `@qdrant/js-client-rest` - Vector database
- `@google/generative-ai` - Gemini AI
- `node-imap` - IMAP client
- `mailparser` - Email parsing

## 🔧 Configuration

### Trust Proxy
For deployment behind load balancers:
```typescript
app.set('trust proxy', 1);
```

### CORS Origins
Update in `.env`:
```
CLIENT_URL=https://your-frontend-domain.com
```

### Rate Limits
Customize in `middlewares/ratelimit.middleware.ts`

## 🏢 Production Deployment

### Checklist
- [ ] Set `NODE_ENV=production`
- [ ] Configure secure `API_KEY`
- [ ] Enable HTTPS
- [ ] Set up reverse proxy (Nginx/Apache)
- [ ] Configure trusted proxy
- [ ] Set appropriate rate limits
- [ ] Enable centralized logging
- [ ] Set up monitoring (Prometheus, etc.)
- [ ] Configure health check endpoints in orchestrator
- [ ] Secure Elasticsearch with authentication
- [ ] Use environment-specific secrets

### Load Balancer Configuration
- Health check: `GET /api/health/ready`
- Sticky sessions: Not required
- Timeout: 30s
- Keep-alive: Enabled

## 🐛 Debugging

### Enable Debug Logging
```bash
LOG_LEVEL=debug npm run dev
```

### Check Health
```bash
curl http://localhost:5000/api/health/detailed
```

### View Metrics
```bash
curl http://localhost:5000/api/health/metrics
```

## 📚 Best Practices Implemented

- ✅ MVC Architecture
- ✅ Input Validation
- ✅ Error Handling
- ✅ Security Headers
- ✅ Rate Limiting
- ✅ Request Logging
- ✅ Performance Monitoring
- ✅ Health Checks
- ✅ Graceful Shutdown
- ✅ TypeScript Strict Mode
- ✅ Environment Configuration
- ✅ Load Balancer Support

## 📖 Further Reading

- [Express Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [Helmet.js Documentation](https://helmetjs.github.io/)
- [Joi Validation](https://joi.dev/api/)
- [Rate Limiting Strategies](https://cloud.google.com/architecture/rate-limiting-strategies-techniques)
