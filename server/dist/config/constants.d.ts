export declare const PAGINATION: {
    readonly DEFAULT_PAGE: 1;
    readonly DEFAULT_PAGE_SIZE: 20;
    readonly MAX_PAGE_SIZE: 500;
};
export declare const IMAP: {
    readonly INITIAL_SYNC_LIMIT: 100;
    readonly MAX_RECONNECT_ATTEMPTS: 5;
    readonly RECONNECT_BASE_DELAY: 1000;
    readonly RECONNECT_MAX_DELAY: 60000;
    readonly PROCESS_INTERVAL: 500;
};
export declare const AI: {
    readonly RATE_LIMIT_DELAY: 4000;
    readonly VECTOR_DIMENSION: 768;
    readonly DEFAULT_TOP_K: 3;
};
export declare const WEBHOOK: {
    readonly MAX_CACHE_SIZE: 10000;
    readonly TIMEOUT: 10000;
};
export declare const ELASTICSEARCH: {
    readonly DEFAULT_BATCH_SIZE: 10000;
    readonly INDEX_NAME: "emails";
};
export declare const HTTP_STATUS: {
    readonly OK: 200;
    readonly CREATED: 201;
    readonly BAD_REQUEST: 400;
    readonly UNAUTHORIZED: 401;
    readonly FORBIDDEN: 403;
    readonly NOT_FOUND: 404;
    readonly CONFLICT: 409;
    readonly INTERNAL_SERVER_ERROR: 500;
    readonly SERVICE_UNAVAILABLE: 503;
};
export declare const MEMORY_UNITS: {
    readonly BYTES_TO_MB: number;
};
//# sourceMappingURL=constants.d.ts.map