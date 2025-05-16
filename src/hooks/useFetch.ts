import useSWR from "swr";
import { api } from "@/lib/api";

const fetcher = (url: string) => api.get(url).then((res) => res.data);

export function useFetch<T>(url: string, options = {}) {
    const { data, error, isValidating, mutate } = useSWR<T>(url, fetcher, options);

    return {
        data,
        isLoading: !data && !error,
        error,
        isValidating,
        mutate,
    };
}