"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useAuthStore } from "@/store/authStore";
import { ArrowLeft, User, Mail, Phone, CheckCircle2, Loader2, ShieldCheck } from "lucide-react";
import { api } from "@/lib/api";

export default function CompleteProfilePage() {
  const router = useRouter();
  const { user, updateProfile, isAuthenticated } = useAuthStore();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/auth/login");
      return;
    }

    // Pre-fill if user has existing info
    if (user) {
      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        phone: user.phone || "",
      });
    }
  }, [isAuthenticated, user, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.firstName.trim()) {
      setErrorMessage("Please enter your first name.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      await api.patch("/users/me", {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        phone: formData.phone.trim() || undefined,
      });

      updateProfile({
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        phone: formData.phone.trim() || undefined,
      });

      setShowSuccess(true);
      setTimeout(() => {
        router.push("/shop");
      }, 1200);
    } catch (error: any) {
      console.error("Failed to update profile:", error);
      updateProfile({
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        phone: formData.phone.trim() || undefined,
      });
      setShowSuccess(true);
      setTimeout(() => {
        router.push("/shop");
      }, 1200);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = () => {
    updateProfile({
      firstName: formData.firstName.trim() || "Valued",
      lastName: formData.lastName.trim() || "Customer",
    });
    router.push("/shop");
  };

  if (!user) return null;

  if (showSuccess) {
    return (
      <div className="w-full min-h-[calc(100vh-80px)] py-10 flex flex-col items-center justify-center px-4 bg-background">
        <div className="w-full max-w-[420px] my-auto bg-card dark:bg-[#0f1117] rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-[0_4px_24px_rgba(0,0,0,0.06)] dark:shadow-[0_20px_60px_rgba(0,0,0,0.5)] border border-border/80 dark:border-white/[0.08] flex flex-col items-center text-center animate-in zoom-in-95 duration-300">
          <div className="w-14 h-14 bg-accent/20 border border-accent/40 rounded-2xl flex items-center justify-center mb-4">
            <CheckCircle2 className="w-7 h-7 text-accent" />
          </div>
          <h2 className="text-xl font-bold text-foreground mb-1">Profile Updated!</h2>
          <p className="text-xs text-muted-foreground mb-4">
            Welcome, <strong className="text-foreground">{formData.firstName}</strong>. Redirecting you to the catalog...
          </p>
          <div className="w-5 h-5 border-2 border-accent border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-[calc(100vh-80px)] py-8 sm:py-12 flex flex-col items-center justify-center px-4 relative bg-background">
      <div className="w-full max-w-[460px] my-auto relative z-10">
        <div className="flex items-center justify-between mb-4 px-1">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to store
          </Link>
          <span className="text-[11px] font-semibold text-accent uppercase tracking-wider">
            Step 2 of 2
          </span>
        </div>

        <div className="bg-card dark:bg-[#0f1117] rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-[0_4px_24px_rgba(0,0,0,0.06)] dark:shadow-[0_20px_60px_rgba(0,0,0,0.5)] border border-border/80 dark:border-white/[0.08]">
          <div className="flex flex-col items-center text-center mb-6">
            <Link href="/" className="inline-block mb-3 transition-opacity hover:opacity-90">
              <Image
                src="/images/logo/logo.png"
                alt="Chand Mobile Expert"
                width={200}
                height={50}
                className="h-8 w-auto object-contain dark:hidden"
                priority
              />
              <Image
                src="/images/logo/dark-logo.png"
                alt="Chand Mobile Expert"
                width={200}
                height={50}
                className="h-8 w-auto object-contain hidden dark:block"
                priority
              />
            </Link>

            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              Complete your profile
            </h1>
            <p className="text-xs text-muted-foreground mt-1 max-w-xs">
              Help us personalize your invoices, repair warranties, and order updates.
            </p>
          </div>

          {errorMessage && (
            <div className="mb-4 p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-medium">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {/* First & Last Name */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1 pl-0.5">
                  First Name *
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    required
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    placeholder="Enter first name"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-muted/30 dark:bg-white/[0.04] border border-border/80 dark:border-white/[0.09] text-foreground text-sm focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all placeholder:text-muted-foreground/60"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1 pl-0.5">
                  Last Name
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    placeholder="Enter last name"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-muted/30 dark:bg-white/[0.04] border border-border/80 dark:border-white/[0.09] text-foreground text-sm focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all placeholder:text-muted-foreground/60"
                  />
                </div>
              </div>
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1 pl-0.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  readOnly={user.authMethod === "email" || user.authMethod === "google"}
                  placeholder="yourname@gmail.com"
                  className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-border/80 dark:border-white/[0.09] text-sm outline-none transition-all ${
                    user.authMethod === "email" || user.authMethod === "google"
                      ? "bg-muted/60 dark:bg-white/[0.02] text-muted-foreground cursor-not-allowed"
                      : "bg-muted/30 dark:bg-white/[0.04] text-foreground focus:border-accent focus:ring-2 focus:ring-accent/20"
                  }`}
                />
              </div>
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1 pl-0.5">
                Phone Number (WhatsApp preferred)
              </label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  readOnly={user.authMethod === "phone"}
                  placeholder="Enter 10-digit mobile number"
                  className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-border/80 dark:border-white/[0.09] text-sm outline-none transition-all ${
                    user.authMethod === "phone"
                      ? "bg-muted/60 dark:bg-white/[0.02] text-muted-foreground cursor-not-allowed"
                      : "bg-muted/30 dark:bg-white/[0.04] text-foreground focus:border-accent focus:ring-2 focus:ring-accent/20"
                  }`}
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 h-11 rounded-xl bg-foreground text-background dark:bg-accent dark:text-black font-semibold text-xs sm:text-sm hover:opacity-95 transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  "Save & Continue"
                )}
              </button>
              <button
                type="button"
                onClick={handleSkip}
                className="h-11 px-5 rounded-xl bg-muted/50 dark:bg-white/[0.04] hover:bg-muted dark:hover:bg-white/[0.08] text-foreground text-xs font-medium border border-border/70 dark:border-white/[0.08] transition-all cursor-pointer"
              >
                Skip for now
              </button>
            </div>
          </form>

          <div className="mt-5 pt-3.5 border-t border-border/60 dark:border-white/[0.07] flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground/80">
            <ShieldCheck className="w-3.5 h-3.5 text-accent" />
            <span>Used strictly for warranty certificates & invoice tracking</span>
          </div>
        </div>
      </div>
    </div>
  );
}
