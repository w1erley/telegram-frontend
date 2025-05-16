"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useApi } from "@/hooks/useApi"
import { cn } from "@/lib/utils"

interface VerifyEmailProps {
  code: string
}

export default function VerifyEmail({ code }: VerifyEmailProps) {
  const router = useRouter()
  const { get } = useApi()
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [message, setMessage] = useState<string>("")

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        setStatus("loading")
        const response = await get(`verify-email/${code}`)
        setStatus("success")
        setMessage("Your email has been successfully verified!")
      } catch (error) {
        setStatus("error")
        setMessage("Failed to verify your email. The link may be invalid or expired.")
        console.error("Verification error:", error)
      }
    }

    if (code) {
      verifyEmail()
    } else {
      setStatus("error")
      setMessage("Verification code is missing.")
    }
  }, [code, get])

  const handleGoToLogin = () => {
    router.push("/")
  }

  return (
    <div className="w-full max-w-md m-auto">
      <div className="mb-8 text-center">
        <div className="mb-2 flex justify-center">
          <div className="h-16 w-16 rounded-full bg-primary p-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-full w-full text-white"
            >
              <path d="m22 2-7 20-4-9-9-4Z" />
              <path d="M22 2 11 13" />
            </svg>
          </div>
        </div>
        <h1 className="text-2xl font-bold">Email Verification</h1>
        <p className="mt-1 text-sm text-muted-foreground">Verifying your email address</p>
      </div>

      <div className="overflow-hidden rounded-lg bg-muted shadow">
        <div className="p-6">
          <div className="space-y-6 text-center">
            {status === "loading" && (
              <div className="flex flex-col items-center space-y-4">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                <p>Verifying your email address...</p>
              </div>
            )}

            {status === "success" && (
              <div className="flex flex-col items-center space-y-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-green-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-green-600 font-medium">{message}</p>
              </div>
            )}

            {status === "error" && (
              <div className="flex flex-col items-center space-y-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-red-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <p className="text-red-600 font-medium">{message}</p>
              </div>
            )}

            <Button
              onClick={handleGoToLogin}
              className={cn("w-full bg-primary", status === "loading" && "opacity-50 cursor-not-allowed")}
              disabled={status === "loading"}
            >
              {status === "success" ? "Go to Login" : "Back to Login"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
