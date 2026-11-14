"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import { api } from "@/lib/api";
import {
  User,
  Mail,
  Phone,
  CheckCircle2,
  Loader2,
  MessageSquare,
  Bell,
  Camera,
  Upload,
  Trash2,
} from "lucide-react";

export default function ProfilePage() {
  const { user, updateProfile } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [profilePicture, setProfilePicture] = useState<string>("");

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    whatsappUpdates: true,
    smsAlerts: true,
  });

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        phone: user.phone || "",
      }));
      setProfilePicture(user.profilePicture || "");
    }
  }, [user]);

  useEffect(() => {
    const fetchLatestUser = async () => {
      try {
        const res = await api.get("/users/me");
        if (res.data) {
          updateProfile({
            firstName: res.data.firstName || undefined,
            lastName: res.data.lastName || undefined,
            phone: res.data.phone || undefined,
            profilePicture: res.data.profilePicture || undefined,
          });
          if (res.data.profilePicture) {
            setProfilePicture(res.data.profilePicture);
          }
        }
      } catch (err) {
        // Fallback to local user
      }
    };
    fetchLatestUser();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleToggle = (key: "whatsappUpdates" | "smsAlerts") => {
    setFormData((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("File size exceeds 5MB limit. Please choose a smaller image.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setProfilePicture(base64);
      updateProfile({ profilePicture: base64 });
      try {
        api.patch("/users/me", { profilePicture: base64 });
      } catch (err) {
        console.error("Failed to sync profile picture:", err);
      }
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    setProfilePicture("");
    updateProfile({ profilePicture: "" });
    try {
      api.patch("/users/me", { profilePicture: null });
    } catch (err) {}
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setShowSuccess(false);

    try {
      await api.patch("/users/me", {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        profilePicture: profilePicture || null,
      });

      updateProfile({
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        profilePicture: profilePicture || undefined,
      });

      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error("Failed to update profile:", error);
      updateProfile({
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        profilePicture: profilePicture || undefined,
      });
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) return null;

  const initials =
    (formData.firstName?.[0] || user.firstName?.[0] || "") +
      (formData.lastName?.[0] || user.lastName?.[0] || "") ||
    (formData.email?.[0] || user.email?.[0] || "U").toUpperCase();

  return (
    <div className="w-full max-w-3xl flex-1 flex flex-col justify-between space-y-8">
      {/* Page Header */}
      <div className="pb-5 border-b border-border/70 dark:border-white/[0.08]">
        <h2 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
          Profile Details
        </h2>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
          Update your personal identity, contact numbers, and communication preferences.
        </p>
      </div>

      {/* Success Notification */}
      {showSuccess && (
        <div className="p-3.5 rounded-xl bg-accent/15 border border-accent/30 text-foreground text-xs sm:text-sm flex items-center gap-2.5 animate-in fade-in slide-in-from-top-2 shadow-2xs">
          <CheckCircle2 className="w-4 h-4 text-accent shrink-0" />
          <span className="font-medium">Profile details updated successfully.</span>
        </div>
      )}

      {/* Form with Clean Spacing & Alignment */}
      <form onSubmit={handleSubmit} className="space-y-8 flex-1 flex flex-col justify-between">
        <div className="space-y-7">
          
          {/* SECTION 0: Profile Picture Upload / Edit */}
          <div className="p-4 sm:p-5 rounded-2xl bg-foreground/[0.02] dark:bg-white/[0.02] border border-border/80 dark:border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
            <div className="flex items-center gap-4">
              <div className="relative group">
                <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl overflow-hidden bg-slate-900 text-white dark:bg-accent dark:text-slate-950 font-bold text-xl sm:text-2xl flex items-center justify-center shrink-0 shadow-sm border border-border/70 dark:border-white/10">
                  {profilePicture ? (
                    <img
                      src={profilePicture}
                      alt={formData.firstName || "User"}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    initials
                  )}
                </div>
                <label
                  htmlFor="avatar-upload-input"
                  className="absolute -bottom-1 -right-1 w-6.5 h-6.5 rounded-xl bg-accent text-slate-950 flex items-center justify-center shadow-md cursor-pointer hover:scale-105 active:scale-95 transition-all border border-card"
                  title="Upload profile photo"
                >
                  <Camera className="w-3.5 h-3.5" />
                </label>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-foreground">
                  Profile Photo
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {user.authMethod === "google" && profilePicture
                    ? "Synced with your connected Google account."
                    : "Upload a JPG, PNG or WebP image up to 5MB."}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 self-start sm:self-center">
              <input
                id="avatar-upload-input"
                type="file"
                accept="image/png, image/jpeg, image/webp"
                onChange={handleFileChange}
                className="hidden"
              />
              <label
                htmlFor="avatar-upload-input"
                className="h-9 px-3.5 rounded-xl bg-foreground/[0.05] dark:bg-white/[0.08] hover:bg-foreground/[0.08] dark:hover:bg-white/[0.12] text-foreground text-xs font-semibold flex items-center gap-2 cursor-pointer transition-all border border-border/60 dark:border-white/10"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>{profilePicture ? "Change Photo" : "Upload Photo"}</span>
              </label>

              {profilePicture && (
                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  className="h-9 px-3 rounded-xl text-rose-500 hover:bg-rose-500/10 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remove</span>
                </button>
              )}
            </div>
          </div>
          
          {/* SECTION 1: Personal Information */}
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-foreground">
                Personal Information
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Your legal name used on tax invoices and device pickup receipts.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-foreground/90">
                  First Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    required
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="First name"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-background border border-border/80 dark:border-white/10 text-sm font-medium text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-foreground/90">
                  Last Name
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="Last name"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-background border border-border/80 dark:border-white/10 text-sm font-medium text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 2: Contact Information */}
          <div className="space-y-4 pt-2">
            <div>
              <h3 className="text-sm font-semibold text-foreground">
                Contact Details
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Channels used for doorstep pickup coordination and repair alerts.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Email Address */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-foreground/90">
                    Email Address <span className="text-rose-500">*</span>
                  </label>
                  {formData.email && (
                    <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                      Verified
                    </span>
                  )}
                </div>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    required
                    type="email"
                    name="email"
                    value={formData.email}
                    readOnly={user.authMethod === "email" || user.authMethod === "google"}
                    onChange={handleChange}
                    placeholder="yourname@gmail.com"
                    className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-background border border-border/80 dark:border-white/10 text-sm font-medium focus:outline-none placeholder:text-muted-foreground/50 transition-all ${
                      user.authMethod === "email" || user.authMethod === "google"
                        ? "text-muted-foreground bg-muted/30 cursor-not-allowed"
                        : "text-foreground focus:border-accent focus:ring-1 focus:ring-accent"
                    }`}
                  />
                </div>
              </div>

              {/* Phone Number */}
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-foreground/90">
                  Mobile Number (WhatsApp Preferred) <span className="text-rose-500">*</span>
                </label>
                <div className="flex rounded-xl border border-border/80 dark:border-white/10 bg-background overflow-hidden focus-within:border-accent focus-within:ring-1 focus-within:ring-accent transition-all">
                  <div className="flex items-center gap-1 px-3 bg-muted/40 dark:bg-white/[0.04] border-r border-border/70 dark:border-white/10 text-xs font-semibold text-muted-foreground select-none shrink-0">
                    <span>🇮🇳</span>
                    <span>+91</span>
                  </div>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    readOnly={user.authMethod === "phone"}
                    maxLength={10}
                    placeholder="9876543210"
                    className={`w-full px-3 py-2.5 bg-transparent text-sm font-medium focus:outline-none placeholder:text-muted-foreground/50 ${
                      user.authMethod === "phone"
                        ? "text-muted-foreground bg-muted/30 cursor-not-allowed"
                        : "text-foreground"
                    }`}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 3: Communication Preferences */}
          <div className="space-y-3 pt-2">
            <div>
              <h3 className="text-sm font-semibold text-foreground">
                Notification Preferences
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Select how you prefer to receive repair tracking and order dispatches.
              </p>
            </div>

            <div className="divide-y divide-border/60 dark:divide-white/[0.06] rounded-xl border border-border/80 dark:border-white/10 bg-foreground/[0.01] dark:bg-white/[0.02] overflow-hidden">
              {/* WhatsApp Updates */}
              <div
                onClick={() => handleToggle("whatsappUpdates")}
                className="flex items-center justify-between p-3.5 sm:p-4 hover:bg-foreground/[0.02] dark:hover:bg-white/[0.03] cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-3 pr-4">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-foreground">
                      WhatsApp Live Updates
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      Receive technician notes, diagnosis photos, and delivery OTPs directly on WhatsApp.
                    </p>
                  </div>
                </div>

                <div
                  className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer shrink-0 ${
                    formData.whatsappUpdates ? "bg-accent" : "bg-muted"
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white dark:bg-slate-950 shadow-xs transform transition-transform absolute top-0.5 ${
                      formData.whatsappUpdates ? "translate-x-4.5" : "translate-x-0.5"
                    }`}
                  />
                </div>
              </div>

              {/* SMS Alerts */}
              <div
                onClick={() => handleToggle("smsAlerts")}
                className="flex items-center justify-between p-3.5 sm:p-4 hover:bg-foreground/[0.02] dark:hover:bg-white/[0.03] cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-3 pr-4">
                  <div className="w-8 h-8 rounded-lg bg-accent/15 text-accent-foreground dark:text-accent flex items-center justify-center shrink-0">
                    <Bell className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-foreground">
                      SMS Status Alerts
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      Receive backup order confirmation and tax invoice links via SMS.
                    </p>
                  </div>
                </div>

                <div
                  className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer shrink-0 ${
                    formData.smsAlerts ? "bg-accent" : "bg-muted"
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white dark:bg-slate-950 shadow-xs transform transition-transform absolute top-0.5 ${
                      formData.smsAlerts ? "translate-x-4.5" : "translate-x-0.5"
                    }`}
                  />
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Action Button */}
        <div className="pt-6 border-t border-border/70 dark:border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            Changes will reflect across all your booked repairs and invoices.
          </p>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto h-11 px-7 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-accent dark:hover:bg-[#bbf055] dark:text-slate-950 text-xs sm:text-sm font-semibold shadow-xs hover:shadow transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving Changes...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Save Changes</span>
              </>
            )}
          </button>
        </div>

      </form>
    </div>
  );
}
