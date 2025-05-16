import { toast } from "react-toastify";

export function toastError(error: any, fallbackMessage = "Something went wrong") {
  const message =
    error?.response?.data?.message ||
    error?.message?.message ||
    error?.message ||
    fallbackMessage;

  toast.error(message);
}