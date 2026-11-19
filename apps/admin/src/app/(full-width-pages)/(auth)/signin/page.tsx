import SignInForm from "@/components/auth/SignInForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Sign In | Chand Mobile Expert",
  description: "Sign in to Chand Mobile Expert administration portal",
};

export default function SignIn() {
  return <SignInForm />;
}
