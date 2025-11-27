import { Metadata } from "next";
import { RegisterForm } from "@/components/auth/register-form";

export const metadata: Metadata = {
  title: "Register - Bookmarker",
  description: "Create a new Bookmarker account",
};

export default function RegisterPage() {
  return <RegisterForm />;
}
