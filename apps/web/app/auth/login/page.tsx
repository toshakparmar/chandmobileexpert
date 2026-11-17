"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { useAuthStore } from "@/store/authStore";
import {
  ArrowLeft,
  Mail,
  Phone,
  Loader2,
  Lock,
  User,
  Eye,
  EyeOff,
  CheckCircle2,
  RefreshCw,
  X,
  Send,
  AlertCircle,
  ArrowRight,
} from "lucide-react";
import { auth } from "@/lib/firebase";
import {
  signInWithPopup,
  GoogleAuthProvider,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile as updateFirebaseProfile,
  AuthError,
} from "firebase/auth";
import { api } from "@/lib/api";
import Cookies from "js-cookie";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialMode = searchParams.get("mode") === "signup" ? "signup" : "signin";
  const redirectUrl = searchParams.get("redirect") || "/shop";

  const { login, updateProfile, isAuthenticated, isProfileComplete } = useAuthStore();

  // Mode: "signin" | "signup"
  const [authMode, setAuthMode] = useState<"signin" | "signup">(initialMode);
  // Method: "phone" | "email"
  const [authMethod, setAuthMethod] = useState<"phone" | "email">("phone");
  // Phone flow step: "input" | "otp"
  const [phoneStep, setPhoneStep] = useState<"input" | "otp">("input");

  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  // Form inputs
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");

  // OTP confirmation & countdown
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [resendTimer, setResendTimer] = useState(0);

  // Forgot Password modal
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotStatus, setForgotStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [forgotMessage, setForgotMessage] = useState("");

  // Update mode if query param changes
  useEffect(() => {
    const mode = searchParams.get("mode");
    if (mode === "signup" || mode === "signin") {
      setAuthMode(mode);
    }
  }, [searchParams]);

  // Redirect if already authenticated with active token and profile complete
  useEffect(() => {
    const hasToken = !!Cookies.get("user_access_token");
    if (isAuthenticated && isProfileComplete && hasToken) {
      router.push(redirectUrl);
    } else if (!hasToken && isAuthenticated) {
      useAuthStore.getState().logout();
    }
  }, [isAuthenticated, isProfileComplete, router, redirectUrl]);

  // Resend OTP Countdown
  useEffect(() => {
    let interval: any = null;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  // Clean up recaptcha on unmount
  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && (window as any).recaptchaVerifier) {
        try {
          (window as any).recaptchaVerifier.clear();
          (window as any).recaptchaVerifier = null;
        } catch (e) {}
      }
    };
  }, []);

  const handleFirebaseError = (error: unknown) => {
    const err = error as AuthError;
    console.error("Auth Error:", err);
    switch (err.code) {
      case "auth/invalid-credential":
      case "auth/user-not-found":
      case "auth/wrong-password":
        return "Invalid email or password. Please verify your credentials.";
      case "auth/email-already-in-use":
        return "An account with this email already exists. Please switch to Sign In.";
      case "auth/invalid-verification-code":
        return "The 6-digit OTP code you entered is invalid. Please check and try again.";
      case "auth/code-expired":
        return "The OTP code has expired. Please request a new code.";
      case "auth/too-many-requests":
        return "Too many attempts from this device. Please wait a moment and try again.";
      case "auth/invalid-phone-number":
        return "Please enter a valid 10-digit Indian mobile number.";
      case "auth/weak-password":
        return "Password is too weak. Please use at least 6 characters with letters and numbers.";
      case "auth/network-request-failed":
        return "Network connection issue. Please check your internet connectivity.";
      case "auth/popup-closed-by-user":
        return "Google sign-in was cancelled. Please try again.";
      default:
        return err.message || "An unexpected error occurred during authentication.";
    }
  };

  const handleBackendLogin = async (
    idToken: string,
    provider: "google" | "phone" | "email",
    identifierStr: string,
    displayName?: string,
    photoURL?: string
  ) => {
    try {
      const res = await api.post("/auth/login", { idToken });
      const token = res.data.accessToken || res.data.access_token;
      if (token) {
        Cookies.set("user_access_token", token, { expires: 7 });
      }

      const backendUser = res.data.user;
      const resolvedName =
        displayName ||
        (backendUser?.firstName && backendUser.firstName !== "Unknown"
          ? `${backendUser.firstName} ${backendUser.lastName || ""}`.trim()
          : "");

      const resolvedPhoto = photoURL || backendUser?.profilePicture;

      login(provider, identifierStr, {
        id: backendUser?.id,
        email: backendUser?.email || (provider === "email" ? identifierStr : undefined),
        phone: backendUser?.phone || (provider === "phone" ? identifierStr : undefined),
        profilePicture: resolvedPhoto,
      });

      // Synchronize guest cart into backend database
      try {
        const { useCartStore } = await import("@/store/cartStore");
        useCartStore.getState().syncCart();
      } catch (e) {}

      if (resolvedName) {
        const parts = resolvedName.trim().split(" ");
        const fName = parts[0];
        const lName = parts.slice(1).join(" ") || "";
        updateProfile({
          firstName: fName,
          lastName: lName,
          profilePicture: resolvedPhoto,
        });
        try {
          await api.patch("/users/me", {
            firstName: fName,
            lastName: lName,
            profilePicture: resolvedPhoto,
          });
        } catch (e) {}
      } else if (resolvedPhoto) {
        updateProfile({ profilePicture: resolvedPhoto });
        try {
          await api.patch("/users/me", { profilePicture: resolvedPhoto });
        } catch (e) {}
      }

      if (resolvedName) {
        router.push(redirectUrl);
      } else {
        router.push("/auth/complete-profile");
      }
    } catch (error: any) {
      setAuthError(error.response?.data?.message || "Failed to sync with server. Please try again.");
    }
  };

  const setupRecaptcha = () => {
    if (typeof window !== "undefined" && !(window as any).recaptchaVerifier) {
      (window as any).recaptchaVerifier = new RecaptchaVerifier(auth, "recaptcha-container", {
        size: "invisible",
      });
    }
  };

  // ── Phone Flow ──
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    const cleanPhone = phoneNumber.replace(/\D/g, "");
    if (cleanPhone.length !== 10) {
      setAuthError("Please enter a valid 10-digit Indian mobile number.");
      return;
    }

    if (authMode === "signup" && !fullName.trim()) {
      setAuthError("Please enter your full name to create an account.");
      return;
    }

    setIsLoading(true);
    try {
      setupRecaptcha();
      const appVerifier = (window as any).recaptchaVerifier;
      const formattedPhone = `+91${cleanPhone}`;
      const result = await signInWithPhoneNumber(auth, formattedPhone, appVerifier);
      setConfirmationResult(result);
      setPhoneStep("otp");
      setResendTimer(30);
    } catch (error) {
      setAuthError(handleFirebaseError(error));
      if ((window as any).recaptchaVerifier) {
        try {
          (window as any).recaptchaVerifier.clear();
        } catch (e) {}
        (window as any).recaptchaVerifier = null;
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length < 6 || !confirmationResult) return;

    setAuthError(null);
    setIsLoading(true);
    try {
      const result = await confirmationResult.confirm(otp);
      const idToken = await result.user.getIdToken();
      await handleBackendLogin(
        idToken,
        "phone",
        result.user.phoneNumber || `+91${phoneNumber}`,
        authMode === "signup" ? fullName.trim() : undefined
      );
    } catch (error) {
      setAuthError(handleFirebaseError(error));
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendTimer > 0 || isLoading) return;
    setAuthError(null);
    setIsLoading(true);
    try {
      setupRecaptcha();
      const appVerifier = (window as any).recaptchaVerifier;
      const cleanPhone = phoneNumber.replace(/\D/g, "");
      const formattedPhone = `+91${cleanPhone}`;
      const result = await signInWithPhoneNumber(auth, formattedPhone, appVerifier);
      setConfirmationResult(result);
      setResendTimer(30);
    } catch (error) {
      setAuthError(handleFirebaseError(error));
    } finally {
      setIsLoading(false);
    }
  };

  // ── Email Flow ──
  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    if (!email.trim() || !password) {
      setAuthError("Please enter both email and password.");
      return;
    }

    if (password.length < 6) {
      setAuthError("Password must be at least 6 characters.");
      return;
    }

    if (authMode === "signup" && !fullName.trim()) {
      setAuthError("Please enter your full name.");
      return;
    }

    setIsLoading(true);
    try {
      let result;
      if (authMode === "signup") {
        result = await createUserWithEmailAndPassword(auth, email.trim(), password);
        if (fullName.trim()) {
          await updateFirebaseProfile(result.user, { displayName: fullName.trim() });
        }
      } else {
        result = await signInWithEmailAndPassword(auth, email.trim(), password);
      }

      const idToken = await result.user.getIdToken();
      await handleBackendLogin(
        idToken,
        "email",
        email.trim(),
        authMode === "signup" ? fullName.trim() : result.user.displayName || undefined
      );
    } catch (error) {
      setAuthError(handleFirebaseError(error));
    } finally {
      setIsLoading(false);
    }
  };

  // ── Google Flow ──
  const handleGoogleLogin = async () => {
    setAuthError(null);
    setIsLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const idToken = await result.user.getIdToken();
      await handleBackendLogin(
        idToken,
        "google",
        result.user.email || result.user.uid,
        result.user.displayName || undefined,
        result.user.photoURL || undefined
      );
    } catch (error) {
      setAuthError(handleFirebaseError(error));
    } finally {
      setIsLoading(false);
    }
  };

  // ── Forgot Password ──
  const handleSendPasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail.trim()) return;

    setForgotStatus("sending");
    try {
      await sendPasswordResetEmail(auth, forgotEmail.trim());
      setForgotStatus("sent");
      setForgotMessage("Password reset email sent! Please check your inbox and spam folder.");
    } catch (error: any) {
      setForgotStatus("error");
      setForgotMessage(handleFirebaseError(error));
    }
  };

  return (
    <div className="w-full min-h-screen py-10 sm:py-16 overflow-y-auto flex items-center justify-center px-4 sm:px-6 relative bg-background select-none">
      {/* Top-Left Floating Back to Home Button */}
      <div className="absolute top-4 left-4 sm:top-6 sm:left-8 z-20">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-card/85 dark:bg-white/[0.04] border border-border/80 dark:border-white/[0.09] text-xs font-semibold text-muted-foreground hover:text-foreground transition-all shadow-xs backdrop-blur-md hover:border-accent/40"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Home</span>
        </Link>
      </div>

      {/* Subtle ambient lighting */}
      <div className="hidden dark:block absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-accent/[0.05] rounded-full blur-[140px] pointer-events-none" />

      {/* ── Main Dual-Column Card (100% Dead-Center Horizontally & Vertically, Steady 570px Height on Desktop) ── */}
      <div className="w-full max-w-5xl lg:max-w-[980px] min-h-[570px] h-auto lg:h-[570px] bg-card dark:bg-[#0f1117] rounded-3xl shadow-[0_16px_50px_rgba(0,0,0,0.08)] dark:shadow-[0_24px_70px_rgba(0,0,0,0.65)] border border-border/80 dark:border-white/[0.09] overflow-hidden flex flex-col lg:flex-row relative z-10 my-auto">
        
        {/* ── LEFT COLUMN (40%): Big Logo + Subtle Tagline with Visible Background Image in Light & Dark ── */}
        <div className="w-full lg:w-[40%] min-h-[170px] lg:h-full p-6 sm:p-8 lg:p-12 flex flex-col items-center justify-center text-center border-b lg:border-b-0 lg:border-r border-border/70 dark:border-white/[0.08] relative overflow-hidden shrink-0">
          {/* Background image: clearly visible in both light & dark mode */}
          <div
            className="absolute inset-0 bg-cover bg-center scale-105 pointer-events-none transition-all duration-300 brightness-100 dark:brightness-[0.55] contrast-[1.05]"
            style={{ backgroundImage: "url(/BG.jpg)" }}
          />
          {/* Light mode overlay: soft translucent white frosted wash for clear visibility & text contrast */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/75 via-white/60 to-white/80 dark:hidden backdrop-blur-[1px] pointer-events-none" />
          {/* Dark mode overlay: sleek darkened ambiance letting store details show through */}
          <div className="absolute inset-0 hidden dark:block bg-gradient-to-b from-[#0f1117]/80 via-[#0f1117]/65 to-[#0f1117]/85 backdrop-blur-[1px] pointer-events-none" />

          <div className="relative z-10 flex flex-col items-center justify-center max-w-[280px]">
            <Link href="/" className="inline-block transition-transform duration-200 hover:scale-105 mb-5">
              <Image
                src="/images/logo/logo.png"
                alt="Chand Mobile Expert"
                width={380}
                height={120}
                className="h-20 sm:h-24 w-auto object-contain dark:hidden drop-shadow-xs"
                priority
              />
              <Image
                src="/images/logo/dark-logo.png"
                alt="Chand Mobile Expert"
                width={380}
                height={120}
                className="h-20 sm:h-24 w-auto object-contain hidden dark:block drop-shadow-xs"
                priority
              />
            </Link>

            {/* Subtle Minimalist Line */}
            <div className="w-10 h-0.5 bg-accent/70 rounded-full mb-3 shadow-[0_0_8px_rgba(168,217,70,0.4)]" />

            {/* Reduced, Refined Tagline */}
            <p className="text-xs sm:text-[13px] font-semibold text-foreground/90 leading-snug">
              Certified Smartphone Repair & Premium Accessories Lab
            </p>
            <p className="text-[11px] text-muted-foreground mt-1.5 font-medium tracking-wide">
              Precision Diagnostics • Genuine Spares
            </p>
          </div>
        </div>

        {/* ── RIGHT COLUMN (60%): Elevated, Highly-Optimized Form Experience ── */}
        <div className="w-full lg:w-[60%] min-h-[400px] lg:h-full p-6 sm:p-9 lg:p-10 flex flex-col justify-between relative overflow-y-auto">
          
          {/* TOP SECTION: Header + Mode Switcher */}
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-[26px] font-extrabold tracking-tight text-foreground">
                {authMode === "signin" ? "Welcome Back" : "Create Account"}
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 font-medium">
                {authMode === "signin"
                  ? "Enter your credentials to access your account."
                  : "Register in seconds with phone or email."}
              </p>
            </div>

            {/* Glassmorphic Segmented Mode Switcher */}
            <div className="flex items-center p-1 rounded-xl bg-muted/70 dark:bg-white/[0.05] border border-border/70 dark:border-white/[0.08] shadow-xs shrink-0">
              <button
                type="button"
                onClick={() => {
                  setAuthMode("signin");
                  setAuthError(null);
                  setPhoneStep("input");
                }}
                className={`px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  authMode === "signin"
                    ? "bg-background text-foreground dark:bg-white/[0.14] dark:text-white shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMode("signup");
                  setAuthError(null);
                  setPhoneStep("input");
                }}
                className={`px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  authMode === "signup"
                    ? "bg-background text-foreground dark:bg-white/[0.14] dark:text-white shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Sign Up
              </button>
            </div>
          </div>

          {/* MIDDLE SECTION: Google, Divider, Method Tabs & Form */}
          <div className="my-auto flex flex-col justify-center">
            {/* Error Banner */}
            {authError && (
              <div className="mb-2.5 p-2.5 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-semibold flex items-start gap-2 animate-in fade-in">
                <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                <span className="leading-tight">{authError}</span>
              </div>
            )}

            {/* 1-Tap Google Button with Premium Micro-interaction */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="group relative w-full h-11 rounded-xl border border-border/80 dark:border-white/[0.1] bg-card hover:bg-muted/40 dark:bg-white/[0.03] dark:hover:bg-white/[0.07] flex items-center justify-center gap-3 font-semibold text-foreground text-xs sm:text-sm transition-all duration-150 disabled:opacity-50 cursor-pointer shadow-xs hover:border-foreground/20 hover:shadow-sm"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin text-accent" />
              ) : (
                <svg viewBox="0 0 24 24" className="w-4.5 h-4.5 shrink-0 transition-transform group-hover:scale-105" aria-hidden="true">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
              )}
              <span>Continue with Google</span>
            </button>

            {/* Subtle Gradient Divider */}
            <div className="relative flex items-center justify-center my-3">
              <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-border/80 dark:via-white/[0.12] to-transparent" />
              <span className="absolute bg-card dark:bg-[#0f1117] px-3 text-[10px] uppercase font-bold tracking-widest text-muted-foreground/75">
                or continue with
              </span>
            </div>

            {/* Segmented Method Selector */}
            <div className="grid grid-cols-2 gap-1.5 p-1 mb-3.5 rounded-xl bg-muted/40 dark:bg-white/[0.03] border border-border/60 dark:border-white/[0.06]">
              <button
                type="button"
                onClick={() => {
                  setAuthMethod("phone");
                  setAuthError(null);
                  setPhoneStep("input");
                }}
                className={`py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  authMethod === "phone"
                    ? "bg-background text-foreground dark:bg-white/[0.12] dark:text-white shadow-xs border border-border/50 dark:border-white/10 font-bold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Phone className="w-4 h-4 text-accent" />
                Phone (OTP)
              </button>

              <button
                type="button"
                onClick={() => {
                  setAuthMethod("email");
                  setAuthError(null);
                }}
                className={`py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  authMethod === "email"
                    ? "bg-background text-foreground dark:bg-white/[0.12] dark:text-white shadow-xs border border-border/50 dark:border-white/10 font-bold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Mail className="w-4 h-4 text-accent" />
                Email & Password
              </button>
            </div>

            {/* ── Form Section ── */}
            <div>
              {/* Method 1: Phone Authentication */}
              {authMethod === "phone" && (
                <div>
                  {phoneStep === "input" ? (
                    <form onSubmit={handleSendOtp} className="space-y-3">
                      {/* Name for Sign Up */}
                      {authMode === "signup" && (
                        <div>
                          <label className="block text-xs font-semibold text-foreground/90 mb-1 pl-0.5">
                            Full Name *
                          </label>
                          <div className="relative flex items-center rounded-xl bg-foreground/[0.02] dark:bg-white/[0.03] border border-border/80 dark:border-white/[0.09] focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/20 transition-all">
                            <User className="absolute left-3.5 w-4 h-4 text-muted-foreground" />
                            <input
                              type="text"
                              required
                              placeholder="Enter your full name"
                              value={fullName}
                              onChange={(e) => setFullName(e.target.value)}
                              className="w-full pl-10 pr-3.5 py-2.5 bg-transparent text-foreground text-sm font-medium focus:outline-none placeholder:text-muted-foreground/60"
                            />
                          </div>
                        </div>
                      )}

                      {/* Mobile Number Input with Indian Flag */}
                      <div>
                        <label className="block text-xs font-semibold text-foreground/90 mb-1 pl-0.5">
                          Mobile Number *
                        </label>
                        <div className="relative flex rounded-xl border border-border/80 dark:border-white/[0.09] bg-foreground/[0.02] dark:bg-white/[0.03] overflow-hidden focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/20 transition-all">
                          <div className="flex items-center gap-1.5 px-3.5 bg-muted/60 dark:bg-white/[0.06] border-r border-border/70 dark:border-white/[0.08] text-xs sm:text-sm font-bold select-none shrink-0">
                            <span className="text-base leading-none">🇮🇳</span>
                            <span>+91</span>
                          </div>
                          <input
                            type="tel"
                            required
                            maxLength={10}
                            placeholder="Enter 10-digit mobile number"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ""))}
                            className="w-full px-3.5 py-2.5 bg-transparent text-foreground text-sm sm:text-base font-semibold focus:outline-none placeholder:text-muted-foreground/60 placeholder:text-xs sm:placeholder:text-sm placeholder:font-normal placeholder:tracking-normal tracking-wider"
                          />
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-1 pl-0.5">
                          We will send a 6-digit verification code via SMS.
                        </p>
                      </div>

                      <button
                        type="submit"
                        disabled={isLoading || phoneNumber.replace(/\D/g, "").length !== 10}
                        className="group w-full h-11.5 mt-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-accent dark:hover:bg-[#bbf055] dark:text-slate-950 font-bold text-sm shadow-md hover:shadow-lg hover:scale-[1.008] active:scale-[0.99] transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:scale-100 cursor-pointer"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin text-accent dark:text-slate-950" />
                            <span>Sending code...</span>
                          </>
                        ) : (
                          <>
                            <span>Get OTP via SMS</span>
                            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                          </>
                        )}
                      </button>
                    </form>
                  ) : (
                    /* OTP Verification Step */
                    <form onSubmit={handleVerifyOtp} className="space-y-3 animate-in fade-in">
                      <div className="p-3 rounded-xl bg-muted/50 dark:bg-white/[0.04] border border-border/70 dark:border-white/[0.08] flex items-center justify-between text-xs sm:text-sm">
                        <div>
                          <span className="text-muted-foreground">Code sent to </span>
                          <strong className="text-foreground font-bold">+91 {phoneNumber}</strong>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setPhoneStep("input");
                            setOtp("");
                            setAuthError(null);
                          }}
                          className="text-accent hover:underline font-bold cursor-pointer"
                        >
                          Change
                        </button>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-foreground/90 mb-1 pl-0.5">
                          Enter 6-Digit Code *
                        </label>
                        <input
                          type="text"
                          required
                          maxLength={6}
                          autoFocus
                          inputMode="numeric"
                          placeholder="••••••"
                          value={otp}
                          onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                          className="w-full py-2.5 px-4 rounded-xl bg-foreground/[0.02] dark:bg-white/[0.03] border border-border/80 dark:border-white/[0.09] text-foreground text-center text-xl font-bold tracking-[0.35em] focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all placeholder:text-muted-foreground/40"
                        />
                      </div>

                      <div className="flex items-center justify-between text-xs px-0.5">
                        <span className="text-muted-foreground">Didn't receive SMS?</span>
                        {resendTimer > 0 ? (
                          <span className="text-muted-foreground font-medium">
                            Resend in {resendTimer}s
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={handleResendOtp}
                            disabled={isLoading}
                            className="font-bold text-accent hover:underline flex items-center gap-1 cursor-pointer disabled:opacity-50"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                            Resend Code
                          </button>
                        )}
                      </div>

                      <button
                        type="submit"
                        disabled={isLoading || otp.length !== 6}
                        className="w-full h-11.5 mt-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-accent dark:hover:bg-[#bbf055] dark:text-slate-950 font-bold text-sm shadow-md hover:shadow-lg hover:scale-[1.008] active:scale-[0.99] transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:scale-100 cursor-pointer"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin text-accent dark:text-slate-950" />
                            <span>Verifying...</span>
                          </>
                        ) : (
                          "Verify & Continue"
                        )}
                      </button>
                    </form>
                  )}
                </div>
              )}

              {/* Method 2: Email & Password Authentication */}
              {authMethod === "email" && (
                <form onSubmit={handleEmailAuth} className="space-y-2.5">
                  {authMode === "signup" && (
                    <div>
                      <label className="block text-xs font-semibold text-foreground/90 mb-1 pl-0.5">
                        Full Name *
                      </label>
                      <div className="relative flex items-center rounded-xl bg-foreground/[0.02] dark:bg-white/[0.03] border border-border/80 dark:border-white/[0.09] focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/20 transition-all">
                        <User className="absolute left-3.5 w-4 h-4 text-muted-foreground" />
                        <input
                          type="text"
                          required
                          placeholder="Enter your full name"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          className="w-full pl-10 pr-3.5 py-2.5 bg-transparent text-foreground text-sm font-medium focus:outline-none placeholder:text-muted-foreground/60"
                        />
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-semibold text-foreground/90 mb-1 pl-0.5">
                      Email Address *
                    </label>
                    <div className="relative flex items-center rounded-xl bg-foreground/[0.02] dark:bg-white/[0.03] border border-border/80 dark:border-white/[0.09] focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/20 transition-all">
                      <Mail className="absolute left-3.5 w-4 h-4 text-muted-foreground" />
                      <input
                        type="email"
                        required
                        placeholder="yourname@gmail.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-10 pr-3.5 py-2.5 bg-transparent text-foreground text-sm font-medium focus:outline-none placeholder:text-muted-foreground/60"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1 pl-0.5">
                      <label className="text-xs font-semibold text-foreground/90">
                        Password *
                      </label>
                      {authMode === "signin" && (
                        <button
                          type="button"
                          onClick={() => {
                            setForgotEmail(email);
                            setForgotStatus("idle");
                            setForgotMessage("");
                            setIsForgotModalOpen(true);
                          }}
                          className="text-xs font-semibold text-accent hover:underline cursor-pointer"
                        >
                          Forgot password?
                        </button>
                      )}
                    </div>
                    <div className="relative flex items-center rounded-xl bg-foreground/[0.02] dark:bg-white/[0.03] border border-border/80 dark:border-white/[0.09] focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/20 transition-all">
                      <Lock className="absolute left-3.5 w-4 h-4 text-muted-foreground" />
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        placeholder={authMode === "signup" ? "At least 6 characters" : "Enter your password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-10 pr-10 py-2.5 bg-transparent text-foreground text-sm font-medium focus:outline-none placeholder:text-muted-foreground/60"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 text-muted-foreground hover:text-foreground transition-colors cursor-pointer p-1"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="group w-full h-11.5 mt-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-accent dark:hover:bg-[#bbf055] dark:text-slate-950 font-bold text-sm shadow-md hover:shadow-lg hover:scale-[1.008] active:scale-[0.99] transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:scale-100 cursor-pointer"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-accent dark:text-slate-950" />
                        <span>{authMode === "signin" ? "Signing In..." : "Creating Account..."}</span>
                      </>
                    ) : (
                      <>
                        <span>{authMode === "signin" ? "Sign In" : "Create Account"}</span>
                        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* BOTTOM SECTION: Account Switch Link */}
          <div className="pt-2 text-center text-xs sm:text-sm text-muted-foreground border-t border-border/60 dark:border-white/[0.07]">
            {authMode === "signin" ? (
              <p>
                Don't have an account?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode("signup");
                    setAuthError(null);
                  }}
                  className="font-bold text-accent hover:underline cursor-pointer"
                >
                  Create one now
                </button>
              </p>
            ) : (
              <p>
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode("signin");
                    setAuthError(null);
                  }}
                  className="font-bold text-accent hover:underline cursor-pointer"
                >
                  Sign in here
                </button>
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ── Forgot Password Modal ── */}
      {isForgotModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in">
          <div className="relative w-full max-w-sm bg-card dark:bg-[#11131a] rounded-2xl p-6 shadow-2xl border border-border dark:border-white/10 text-foreground">
            <button
              type="button"
              onClick={() => setIsForgotModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center text-accent mb-3">
              <Mail className="w-5 h-5" />
            </div>

            <h3 className="text-lg font-bold">Reset Password</h3>
            <p className="text-xs text-muted-foreground mb-4">
              Enter your email address and we'll send a link to reset your password.
            </p>

            {forgotStatus === "sent" ? (
              <div className="p-3.5 rounded-xl bg-accent/15 border border-accent/30 text-xs space-y-2.5">
                <div className="flex items-center gap-1.5 text-accent font-semibold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Email Sent</span>
                </div>
                <p className="text-muted-foreground">{forgotMessage}</p>
                <button
                  type="button"
                  onClick={() => setIsForgotModalOpen(false)}
                  className="w-full py-2 rounded-lg bg-accent text-black font-semibold text-xs hover:bg-accent/90 transition-colors"
                >
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={handleSendPasswordReset} className="space-y-3">
                {forgotStatus === "error" && (
                  <div className="p-2.5 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs font-medium">
                    {forgotMessage}
                  </div>
                )}
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="yourname@gmail.com"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-muted/30 dark:bg-white/[0.04] border border-border/80 dark:border-white/[0.09] text-foreground text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/20 transition-all placeholder:text-muted-foreground/60"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsForgotModalOpen(false)}
                    className="px-3 py-2 rounded-xl text-muted-foreground hover:text-foreground text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={forgotStatus === "sending" || !forgotEmail.trim()}
                    className="px-4 py-2 rounded-xl bg-foreground text-background dark:bg-accent dark:text-black font-semibold text-xs hover:opacity-90 transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer shadow-sm"
                  >
                    {forgotStatus === "sending" ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Sending...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>Send Link</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Invisible Recaptcha container for Phone Auth */}
      <div id="recaptcha-container"></div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full min-h-[60vh] flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
