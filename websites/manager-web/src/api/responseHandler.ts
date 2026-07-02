export interface APIResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  timestamp: string;
}

export const formatResponse = <T>(response: any): APIResponse<T> => {
  if (response && typeof response === 'object' && 'data' in response) {
    return {
      success: response.success ?? true,
      message: response.message,
      data: response.data as T,
      timestamp: response.timestamp || new Date().toISOString(),
    };
  }

  return {
    success: true,
    data: response as T,
    timestamp: new Date().toISOString(),
  };
};

export default formatResponse;
