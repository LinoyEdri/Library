import axios, { type AxiosRequestConfig } from 'axios';
import type { ApiErrorResponse, ApiSuccessResponse } from '@library/shared';
import { accessTokenStorage } from './access-token-storage';
import { StatusCodes } from 'http-status-codes';
import { ApiRequestError, NETWORK_ERROR_STATUS_CODE } from './api-request-error';

// Called when a logged-in request gets 401 (token expired, account disabled)
let handleExpiredSession: () => void = () => {};

export const setExpiredSessionHandler = (handler: () => void): void => {
  handleExpiredSession = handler;
};

// Vite proxies /api to the backend on port 3001
const apiClient = axios.create({ baseURL: '/api' });

apiClient.interceptors.request.use((requestConfig) => {
  const accessToken = accessTokenStorage.read();

  if (accessToken) {
    requestConfig.headers.Authorization = `Bearer ${accessToken}`;
  }

  return requestConfig;
});

apiClient.interceptors.response.use(
  (response) => response,

  (error) => {
    if (!axios.isAxiosError<ApiErrorResponse>(error) || !error.response) {
      return Promise.reject(new ApiRequestError('Network error', NETWORK_ERROR_STATUS_CODE));
    }

    const { status, data, config } = error.response;

    const requestWasAuthenticated = Boolean(config.headers?.Authorization);

    if (status === StatusCodes.UNAUTHORIZED && requestWasAuthenticated) {
      handleExpiredSession();
    }

    return Promise.reject(
      new ApiRequestError(data?.message ?? error.message, status, data?.error?.details ?? []),
    );
  },
);

// Sends a request and returns only the `data` part of the success envelope
export const sendApiRequest = async <ResponseData>(
  requestConfig: AxiosRequestConfig,
): Promise<ResponseData> => {
  const response = await apiClient.request<ApiSuccessResponse<ResponseData>>(requestConfig);

  return response.data.data;
};
