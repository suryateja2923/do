"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequestContext = exports.requestContextStorage = void 0;
const async_hooks_1 = require("async_hooks");
exports.requestContextStorage = new async_hooks_1.AsyncLocalStorage();
class RequestContext {
    /**
     * Get the current request context data from storage
     */
    static current() {
        return exports.requestContextStorage.getStore() || null;
    }
    /**
     * Get the current request ID
     */
    static getRequestId() {
        const store = this.current();
        return store ? store.requestId : null;
    }
    /**
     * Get the current correlation ID
     */
    static getCorrelationId() {
        const store = this.current();
        return store ? store.correlationId : null;
    }
    /**
     * Get the current authenticated user details
     */
    static getUser() {
        const store = this.current();
        return store ? store.user : null;
    }
}
exports.RequestContext = RequestContext;
exports.default = RequestContext;
