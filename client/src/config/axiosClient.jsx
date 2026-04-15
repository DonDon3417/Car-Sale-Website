import axios from 'axios';
import { clearAuthSession, getAccessToken, getRefreshToken, isTabLoggedIn, setAuthSession } from './authSession';

export class ApiClient {
    constructor(baseURL) {
        this.baseURL = baseURL || import.meta.env.VITE_API_URL || '';
        this.axiosInstance = axios.create({
            baseURL: this.baseURL,
            timeout: 10000,
            withCredentials: true,
        });

        this.isRefreshing = false;
        this.isHandlingAuthFailure = false;
        this.failedQueue = [];

        this.setupInterceptors();
    }

    setupInterceptors() {
        // Request interceptor
        this.axiosInstance.interceptors.request.use(
            (config) => {
                const accessToken = getAccessToken();
                if (accessToken) {
                    config.headers = config.headers || {};
                    config.headers.Authorization = `Bearer ${accessToken}`;
                }
                return config;
            },
            (error) => Promise.reject(error),
        );

        // Response interceptor
        this.axiosInstance.interceptors.response.use(
            (response) => response,
            async (error) => {
                const originalRequest = error.config;

                if (!originalRequest) {
                    return Promise.reject(error);
                }

                const requestUrl = originalRequest.url || '';
                const isAuthEndpoint =
                    requestUrl.includes('/api/users/login') ||
                    requestUrl.includes('/api/users/register') ||
                    requestUrl.includes('/api/users/refresh-token') ||
                    requestUrl.includes('/api/users/logout');

                if (error.response?.status === 401 && !originalRequest._retry) {
                    // Do not retry auth endpoints to avoid recursion.
                    if (isAuthEndpoint) {
                        return Promise.reject(error);
                    }

                    if (!this.isLoggedIn()) {
                        this.handleAuthFailure();
                        return Promise.reject(error);
                    }

                    if (this.isRefreshing) {
                        return new Promise((resolve, reject) => {
                            this.failedQueue.push({ resolve, reject });
                        })
                            .then(() => this.axiosInstance(originalRequest))
                            .catch((err) => Promise.reject(err));
                    }

                    originalRequest._retry = true;
                    this.isRefreshing = true;

                    try {
                        await this.refreshToken();
                        this.processQueue(null);
                        return this.axiosInstance(originalRequest);
                    } catch (refreshError) {
                        this.processQueue(refreshError);
                        this.handleAuthFailure();
                        return Promise.reject(refreshError);
                    } finally {
                        this.isRefreshing = false;
                    }
                }

                return Promise.reject(error);
            },
        );
    }

    async refreshToken() {
        try {
            const refreshToken = getRefreshToken();
            if (!refreshToken) {
                throw new Error('Missing refresh token');
            }

            const res = await axios.get(`${this.baseURL}/api/users/refresh-token`, {
                withCredentials: true,
                headers: {
                    'x-refresh-token': refreshToken,
                },
            });

            const nextToken = res?.data?.metadata?.token;
            if (!nextToken) {
                throw new Error('Invalid refresh response');
            }

            setAuthSession({
                accessToken: nextToken,
                refreshToken,
            });
            console.log('Token refreshed successfully');
        } catch (error) {
            console.error('Failed to refresh token:', error);
            throw error;
        }
    }

    processQueue(error) {
        this.failedQueue.forEach(({ resolve, reject }) => {
            if (error) {
                reject(error);
            } else {
                resolve();
            }
        });

        this.failedQueue = [];
    }

    handleAuthFailure() {
        if (this.isHandlingAuthFailure) return;
        this.isHandlingAuthFailure = true;

        clearAuthSession();

        this.logout().finally(() => {
            if (window.location.pathname !== '/account/login') {
                window.location.replace('/account/login');
            }
        });
    }

    isLoggedIn() {
        return isTabLoggedIn();
    }

    async logout() {
        try {
            // Use a plain request (without this interceptor) to avoid 401 recursion.
            const accessToken = getAccessToken();
            await axios.post(
                `${this.baseURL}/api/users/logout`,
                {},
                {
                    withCredentials: true,
                    headers: accessToken
                        ? {
                              Authorization: `Bearer ${accessToken}`,
                          }
                        : {},
                },
            );
        } catch (error) {
            console.error('Logout error:', error);
        }
    }

    checkAuthStatus() {
        return this.isLoggedIn();
    }

    get(url, config) {
        return this.axiosInstance.get(url, config);
    }

    post(url, data, config) {
        return this.axiosInstance.post(url, data, config);
    }

    put(url, data, config) {
        return this.axiosInstance.put(url, data, config);
    }

    delete(url, config) {
        return this.axiosInstance.delete(url, config);
    }

    patch(url, data, config) {
        return this.axiosInstance.patch(url, data, config);
    }
}

// Export instance
export const apiClient = new ApiClient();
