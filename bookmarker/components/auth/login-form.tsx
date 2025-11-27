"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LoginForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const emailInputRef = useRef<HTMLInputElement>(null);
  const passwordInputRef = useRef<HTMLInputElement>(null);
  
  const fillDemoCredentials = () => {
    if (emailInputRef.current && passwordInputRef.current) {
      emailInputRef.current.value = "user@example.com";
      passwordInputRef.current.value = "Password123!";
    }
  };
  
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    
    // Clear any previous errors

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      // Basic client-side validation
      if (!email || !password) {
        throw new Error("Please fill in all fields");
      }
      
      // Make the API call to the login endpoint
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Login failed. Please try again.");
      }
      
      // Store user name in localStorage if available
      if (data.user && data.user.name) {
        localStorage.setItem("userName", data.user.name);
      } else {
        // Extract name from email as fallback
        const nameFromEmail = email.split('@')[0];
        localStorage.setItem("userName", nameFromEmail);
      }
      
      // Success - redirect to dashboard
      router.push("/dashboard");
      
    } catch (err) {
      console.error("Login error:", err);
      
      // Format the error message to be more user-friendly
      let errorMessage: string;
      if (err instanceof Error) {
        // Make the error message more user-friendly
        if (err.message.includes("user@example.com")) {
          errorMessage = "Invalid login credentials";
        } else {
          errorMessage = err.message;
        }
      } else {
        errorMessage = "Login failed. Please try again.";
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="flex flex-col items-center gap-3 text-center">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#6C63FF] via-[#FF5DA2] to-[#FF9D66] text-white text-3xl font-semibold flex items-center justify-center shadow-lg">
          B
        </div>
        <div className="space-y-1">
          <h1 className="text-[28px] font-semibold text-[#1E1E2F]">Login</h1>
          <p className="text-sm text-[#80808F]">Sign in to continue managing your bookmarks</p>
        </div>
      </div>

      <div className="mt-6 space-y-6">
        {error && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
            {error}
          </div>
        )}

        <button
          type="button"
          className="w-full flex items-center justify-center gap-3 border border-[#E1E3EC] bg-white rounded-xl py-2.5 text-sm font-medium text-[#505060] hover:border-[#d5d7e3] hover:shadow-md transition"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-5 h-5">
            <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.6-6 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.2 6.1 29.4 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.2-.1-2.1-.4-3.5z"/>
            <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 15.2 18.9 12 24 12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.2 6.1 29.4 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/>
            <path fill="#4CAF50" d="M24 44c5.3 0 10.1-2 13.7-5.2l-6.3-5.3c-2 1.5-4.5 2.5-7.4 2.5-5.2 0-9.6-3.3-11.2-8l-6.6 5.1C9.6 39.7 16.2 44 24 44z"/>
            <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.7 2.1-2 3.9-3.7 5.2l.1.1 6.3 5.3C39.7 36.2 44 30.6 44 24c0-1.2-.1-2.1-.4-3.5z"/>
          </svg>
          Sign in with Google
        </button>

        <div className="flex items-center gap-3 text-[11px] tracking-[0.3em] text-[#B0B0BD] uppercase">
          <span className="h-px flex-1 bg-[#E8E9F3]" />
          Or sign in with email
          <span className="h-px flex-1 bg-[#E8E9F3]" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-xs font-semibold text-[#73738C]">Email</Label>
            <Input
              ref={emailInputRef}
              id="email"
              name="email"
              type="email"
              placeholder="name@example.com"
              autoComplete="email"
              className="h-12 rounded-2xl border-[#E5E7F2] bg-[#F9FAFE] focus-visible:ring-[#A07BFF]"
              required
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-xs font-semibold text-[#73738C]">Password</Label>
              <Link href="/auth/forgot-password" className="text-xs font-semibold text-[#6C6CE5] hover:underline">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Input
                ref={passwordInputRef}
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                autoComplete="current-password"
                className="h-12 rounded-2xl border-[#E5E7F2] bg-[#F9FAFE] pr-10 focus-visible:ring-[#A07BFF]"
                required
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                onClick={togglePasswordVisibility}
                tabIndex={-1}
                aria-label="Toggle password visibility"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between w-full">
            <label className="flex items-center gap-2 text-xs text-[#7A7A8C]">
              <input
                type="checkbox"
                id="remember"
                className="rounded border-gray-300 text-[#6C6CE5] focus:ring-[#6C6CE5]"
              />
              Keep me logged in
            </label>
            <button
              type="button"
              onClick={fillDemoCredentials}
              className="text-[11px] font-semibold text-[#6C6CE5] hover:underline"
            >
              Use demo account
            </button>
          </div>

          <Button
            type="submit"
            className="w-full h-12 rounded-2xl bg-gradient-to-r from-[#6F6BFF] via-[#A34BFF] to-[#FF5EA1] text-white shadow-[0_15px_40px_rgba(140,98,255,0.35)] border-0 hover:opacity-95"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              "Login"
            )}
          </Button>
        </form>

        <div className="text-center text-xs text-[#8A8AA2]">
          Don&apos;t have an account?{" "}
          <Link href="/auth/register" className="text-[#6C6CE5] font-semibold hover:underline">
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
}
