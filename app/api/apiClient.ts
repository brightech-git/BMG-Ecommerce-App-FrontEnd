// apiClient.ts
import { axiosInstance } from "./axiosInstance";

export type HttpMethod = "get" | "post" | "put" | "patch" | "delete";

export interface ApiOptions<T> {
    method: HttpMethod;
    url: string;
    data?: T;
    params?: Record<string, any>;
    headers?: Record<string, string>;
    isFormData?: boolean;
    /** Overrides axiosInstance's default baseURL for this request (e.g. a service on a different base path). */
    baseURL?: string;
}

export interface ApiError {
    status: "error";
    message: string;
    errors?: any;
    statusCode?: number;
}

export const callApi = async <T, R>({
    method,
    url,
    data,
    params,
    headers = {},
    isFormData = false,
    baseURL,
}: ApiOptions<T>): Promise<R> => {
    try {
        const response = await axiosInstance.request<R>({
            method,
            url,
            params,
            data,
            ...(baseURL ? { baseURL } : {}),
            headers: {
                ...headers,
                ...(isFormData ? { "Content-Type": "multipart/form-data" } : {}),
            },
        });

        if ((response.data as any)?.status === 'error') {
            throw {
                status: 'error',
                message: (response.data as any).message ?? 'Something went wrong',
                errors: (response.data as any).errors,
                statusCode: response.status,
            } as ApiError;
        }

        return response.data;
    } catch (error: any) {
        const status  = error?.response?.status;
        const resData = error?.response?.data;

        throw {
            status: 'error',
            message:
                resData?.message ||
                resData?.error   ||
                (typeof resData === 'string' ? resData : null) ||
                error?.message   ||
                'Something went wrong',
            errors:     resData?.errors,
            statusCode: status,
        } as ApiError;
    }
};
