import { AxiosError } from 'axios';

export interface UserFriendlyError {
  status: number;
  code: string;
  message: string;
  debugMessage?: string;
}

export const mapAxiosError = (error: AxiosError): UserFriendlyError => {
  const status = error.response?.status || 500;
  const serverMessage = (error.response?.data as any)?.message;
  
  const errorMap: Record<number, { code: string; message: string }> = {
    400: {
      code: 'BAD_REQUEST',
      message: 'The request payload is invalid or malformed.',
    },
    401: {
      code: 'UNAUTHORIZED',
      message: 'Your active session has expired or is invalid. Please sign in again.',
    },
    403: {
      code: 'FORBIDDEN',
      message: 'You do not possess the manager permissions required to perform this action.',
    },
    404: {
      code: 'NOT_FOUND',
      message: 'The requested resource or pathway could not be found.',
    },
    409: {
      code: 'CONFLICT',
      message: 'The operation conflicts with existing database states (e.g. duplicate details).',
    },
    422: {
      code: 'UNPROCESSABLE_ENTITY',
      message: 'Validation failed. Please verify input fields.',
    },
    429: {
      code: 'TOO_MANY_REQUESTS',
      message: 'Rate limit exceeded. Please throttle request speeds.',
    },
    500: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'A critical server exception occurred. Please try again later.',
    },
  };

  const mapped = errorMap[status] || {
    code: 'UNKNOWN_ERROR',
    message: serverMessage || error.message || 'An unexpected error occurred.',
  };

  return {
    status,
    code: mapped.code,
    message: serverMessage || mapped.message,
    debugMessage: error.message,
  };
};

export default mapAxiosError;
