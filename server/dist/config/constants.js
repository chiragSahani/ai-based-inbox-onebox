"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MEMORY_UNITS = exports.HTTP_STATUS = exports.ELASTICSEARCH = exports.WEBHOOK = exports.AI = exports.IMAP = exports.PAGINATION = void 0;
exports.PAGINATION = {
    DEFAULT_PAGE: 1,
    DEFAULT_PAGE_SIZE: 20,
    MAX_PAGE_SIZE: 500,
};
exports.IMAP = {
    INITIAL_SYNC_LIMIT: 100,
    MAX_RECONNECT_ATTEMPTS: 5,
    RECONNECT_BASE_DELAY: 1000,
    RECONNECT_MAX_DELAY: 60000,
    PROCESS_INTERVAL: 500,
};
exports.AI = {
    RATE_LIMIT_DELAY: 4000,
    VECTOR_DIMENSION: 768,
    DEFAULT_TOP_K: 3,
};
exports.WEBHOOK = {
    MAX_CACHE_SIZE: 10000,
    TIMEOUT: 10000,
};
exports.ELASTICSEARCH = {
    DEFAULT_BATCH_SIZE: 10000,
    INDEX_NAME: 'emails',
};
exports.HTTP_STATUS = {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    INTERNAL_SERVER_ERROR: 500,
    SERVICE_UNAVAILABLE: 503,
};
exports.MEMORY_UNITS = {
    BYTES_TO_MB: 1024 * 1024,
};
//# sourceMappingURL=constants.js.map