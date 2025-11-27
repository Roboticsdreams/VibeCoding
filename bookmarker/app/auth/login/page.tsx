import { Metadata } from "next";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Login - Bookmarker",
  description: "Login to your Bookmarker account",
};

export default function LoginPage({
  searchParams,
}: {
  searchParams: { registered?: string };
}) {
  return (
    <div className="space-y-6">
      {searchParams.registered === "true" && (
        <div className="p-3 rounded-md bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300 text-sm border border-green-200 dark:border-green-900">
          Account created successfully! Please sign in.
        </div>
      )}
      <LoginForm />
    </div>
  );
}
