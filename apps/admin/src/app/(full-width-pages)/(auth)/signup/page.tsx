import SignUpForm from "@/components/auth/SignUpForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Sign Up | Chand Mobile Expert",
  description: "Sign up for Chand Mobile Expert administration portal",
  // other metadata
};

export default function SignUp() {
  return <SignUpForm />;
}
