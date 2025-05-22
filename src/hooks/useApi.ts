import { api } from "@/lib/api";
import type { AxiosRequestConfig } from "axios";

interface ApiRequestOptions<TBody = any> {
    body?: TBody;
    params?: Record<string, any>;
    headers?: Record<string, string>;
    config?: AxiosRequestConfig;
}

export function useApi() {
    const call = async <TResp, TBody = any>(
      method: "get" | "post" | "put" | "patch" | "delete",
      url: string,
      { body, params, headers, config }: ApiRequestOptions<TBody> = {},
    ) => {
        const res = await api.request<TResp>({
            method,
            url,
            data: body,
            params,
            headers,
            ...config,
        });
        return res.data;
    };

    return {
        get:  <T = any>(url: string, opts?: ApiRequestOptions) => call<T>("get", url, opts),
        post: <T = any, B = any>(url: string, opts?: ApiRequestOptions<B>) => call<T, B>("post", url, opts),
        put:  <T = any, B = any>(url: string, opts?: ApiRequestOptions<B>) => call<T, B>("put",  url, opts),
        patch:<T = any, B = any>(url: string, opts?: ApiRequestOptions<B>) => call<T, B>("patch",url, opts),
        del:  <T = any>(url: string, opts?: ApiRequestOptions) => call<T>("delete", url, opts),
    };
}
