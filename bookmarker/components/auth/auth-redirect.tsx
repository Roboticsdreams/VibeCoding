"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

interface AuthRedirectProps {
  redirectTo: string;
  message?: string;
  delay?: number; // in milliseconds
}

/**
 * Component to redirect users after successful auth operations
 */
export function AuthRedirect({ redirectTo, message, delay = 1500 }: AuthRedirectProps) {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push(redirectTo);
    }, delay);

    return () => clearTimeout(timer);
  }, [router, redirectTo, delay]);

  return (
    <div className="flex flex-col items-center justify-center space-y-4 text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      <p className="text-lg font-medium">{message || "Redirecting..."}</p>
    </div>
  );
}
