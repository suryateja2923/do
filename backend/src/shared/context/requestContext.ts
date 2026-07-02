import { AsyncLocalStorage } from 'async_hooks';
import { RequestContextData } from '../../types';

export const requestContextStorage = new AsyncLocalStorage<RequestContextData>();

export class RequestContext {
  /**
   * Get the current request context data from storage
   */
  public static current(): RequestContextData | null {
    return requestContextStorage.getStore() || null;
  }

  /**
   * Get the current request ID
   */
  public static getRequestId(): string | null {
    const store = this.current();
    return store ? store.requestId : null;
  }

  /**
   * Get the current correlation ID
   */
  public static getCorrelationId(): string | null {
    const store = this.current();
    return store ? store.correlationId : null;
  }

  /**
   * Get the current authenticated user details
   */
  public static getUser() {
    const store = this.current();
    return store ? store.user : null;
  }
}
export default RequestContext;
