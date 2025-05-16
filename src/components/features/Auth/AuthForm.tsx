"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {useApi} from "@/hooks/useApi"
import {useRouter} from "next/navigation"
import {toastError} from "@/lib/utils"
import Cookies from "js-cookie";

const loginSchema = yup.object({
  name: yup.string().required("Name is required"),
  password: yup.string().required("Password is required"),
})

const registerSchema = yup.object({
  name: yup.string().required("Name is required"),
  email: yup.string().email("Must be a valid email").required("Email is required"),
  password: yup.string().min(8, "Password must be at least 8 characters").required("Password is required"),
  password_confirmation: yup
    .string()
    .oneOf([yup.ref("password")], "Passwords must match")
    .required("Password confirmation is required"),
})

type LoginFormData = yup.InferType<typeof loginSchema>
type RegisterFormData = yup.InferType<typeof registerSchema>

export default function AuthForm() {
  const [isLogin, setIsLogin] = useState(true)

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
        <h1 className="text-2xl font-bold ">
          {isLogin ? "Log in to Telegram" : "Sign up for Telegram"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {isLogin ? "Please enter your credentials to continue" : "Create your account to get started"}
        </p>
      </div>

      <div className="overflow-hidden rounded-lg bg-muted shadow">
        {isLogin ? <LoginForm /> : <RegisterForm />}

        <div className="border-t p-4 text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-sm font-medium text-primary"
          >
            {isLogin ? "Don't have an account? Sign up" : "Already have an account? Log in"}
          </button>
        </div>
      </div>
    </div>
  )
}

function LoginForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: yupResolver(loginSchema),
  })

  const router = useRouter()
  const { post } = useApi()

  const onSubmit = async (data: LoginFormData) => {
    console.log("Login data:", data)
    const { user, session, token } = await post('login', {
      body: data
    });
    Cookies.set('access_token', token?.plainTextToken);
    router.push('/k');
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="p-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="login-name">Name</label>
          <Input
            id="login-name"
            {...register("name")}
          />
          {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
        </div>

        <div className="space-y-2">
          <label htmlFor="login-password">Password</label>
          <Input
            id="login-password"
            type="password"
            {...register("password")}
          />
          {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
        </div>

        <Button type="submit" disabled={isSubmitting} className="w-full bg-primary">
          {isSubmitting ? "Logging in..." : "Log in"}
        </Button>
      </div>
    </form>
  )
}

function RegisterForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: yupResolver(registerSchema),
  })

  const { post } = useApi()

  const onSubmit = async (data: RegisterFormData) => {
    console.log("Register data:", data)
    const responseData = await post('register', {
      body: data
    });
    window.location.reload();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="p-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="register-name">Name</label>
          <Input
            id="register-name"
            {...register("name")}
          />
          {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
        </div>

        <div className="space-y-2">
          <label htmlFor="register-email">Email</label>
          <Input
            id="register-email"
            type="email"
            {...register("email")}
          />
          {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
        </div>

        <div className="space-y-2">
          <label htmlFor="register-password">Password</label>
          <Input
            id="register-password"
            type="password"
            {...register("password")}
          />
          {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
        </div>

        <div className="space-y-2">
          <label htmlFor="register-password-confirmation">Confirm Password</label>
          <Input
            id="register-password-confirmation"
            type="password"
            {...register("password_confirmation")}
          />
          {errors.password_confirmation && (
            <p className="text-xs text-destructive">{errors.password_confirmation.message}</p>
          )}
        </div>

        <Button type="submit" disabled={isSubmitting} className="w-full bg-primary">
          {isSubmitting ? "Creating account..." : "Create account"}
        </Button>
      </div>
    </form>
  )
}
