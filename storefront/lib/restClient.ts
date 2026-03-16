import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

interface HttpClientConfig extends AxiosRequestConfig {
  baseURL: string;
  headers?: Record<string, string>;
}

export class RestClient {
  private readonly client: AxiosInstance;

  constructor(config: HttpClientConfig) {
    this.client = axios.create({
      timeout: 10000, // 10 second default timeout
      ...config,
    });

    // Optional: Add request/response interceptors for logging or auth token refreshing
    this.initializeInterceptors();
  }

  private initializeInterceptors() {
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        // Centralized production error handling
        const message = error.response?.data?.message || error.message;
        return Promise.reject(new Error(message));
      }
    );
  }

  /**
   * Generic Request Handler
   * @param config - Accepts optional headers here that override defaults
   */
  public async request<T>(config: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.client.request(config);
    return response.data;
  }

  // Convenience methods
  public async get<T>(url: string, headers?: Record<string, string>): Promise<T> {
    return this.request<T>({ method: 'GET', url, headers });
  }

  public async post<T>(url: string, data?: any, headers?: Record<string, string>): Promise<T> {
    return this.request<T>({ method: 'POST', url, data, headers });
  }

  public async put<T>(url: string, data?: any, headers?: Record<string, string>): Promise<T> {
    return this.request<T>({ method: 'PUT', url, data, headers });
  }

  public async delete<T>(url: string, headers?: Record<string, string>): Promise<T> {
    return this.request<T>({ method: 'DELETE', url, headers });
  }
}