import axios, { AxiosError } from 'axios';
import { tokenStorage } from '../lib/tokenStorage';
import type { ApiErrorResponse } from '../types/api';

export const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8080/v1';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const token = tokenStorage.get();
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorResponse>) => {
    if (error.response?.status === 401) {
      tokenStorage.clear();
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('app:unauthorized', {
            detail: { message: 'Сессия истекла, авторизуйтесь снова.' },
          })
        );
      }
    }
    return Promise.reject(error);
  }
);

export const extractErrorMessage = (error: unknown, fallback = 'Произошла ошибка'): string => {
  if (axios.isAxiosError<ApiErrorResponse>(error)) {
    const apiMessage = error.response?.data?.error?.message;
    if (apiMessage) {
      return apiMessage;
    }
    return error.message || fallback;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return fallback;
};

