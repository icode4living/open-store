import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

interface HttpClientConfig extends AxiosRequestConfig {
  baseURL: string;
  headers?: Record<string, string>;
}

export class RestClient {
  private readonly client: AxiosInstance;

  constructor(config: HttpClientConfig) {
    this.client = axios.create({
      timeout: 10000,
      withCredentials: true,
      ...config,
      headers: {
     
        ...config.headers,
      },
    });

    this.initializeInterceptors();
  }

  private initializeInterceptors() {
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        const message = error.response?.data?.message || error.message;
        console.log("[REST DEBUG]: ", error);
        return Promise.reject(new Error(message));
      }
    );
  }

  public async request<T>(config: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.client.request(config);
    return response.data;
  }

  public async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>({ method: 'GET', url, ...config });
  }

  public async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>({ method: 'POST', url, data, ...config });
  }

  public async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>({ method: 'PUT', url, data, ...config });
  }

  public async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>({ method: 'DELETE', url, ...config });
  }
}