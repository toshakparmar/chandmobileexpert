"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { User, Mail, Phone, Loader2 } from "lucide-react";
import { api } from "@/lib/api";
import { ShinyButton } from "@/components/reactbits/ShinyButton";

export default function ProfilePage() {
  const router = useRouter();
  const { user, updateProfile, isAuthenticated, logout } = useAuthStore();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/auth/login");
      return;
    }
    if (user) {
      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        phone: user.phone || "",
      });
    }
  }, [isAuthenticated, user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage("");

    try {
      await api.patch('/users/me', {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
      });

      updateProfile(formData);
      setMessage("Profile updated successfully!");
    } catch (error) {
      console.error("Failed to update profile:", error);
      setMessage("Failed to update profile.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background py-20 px-4">
      <div className="max-w-3xl mx-auto space-y-8">
        <h1 className="text-4xl font-bold text-foreground">My Profile</h1>
        
        <div className="bg-card rounded-3xl p-8 border border-border shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground/80">First Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/40" />
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full pl-12 pr-4 py-3 rounded-xl bg-foreground/5 border border-border/50 focus:border-accent outline-none"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground/80">Last Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/40" />
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="w-full pl-12 pr-4 py-3 rounded-xl bg-foreground/5 border border-border/50 focus:border-accent outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground/80">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/40" />
                <input
                  type="email"
                  value={user.email || ""}
                  readOnly
                  className="w-full pl-12 pr-4 py-3 rounded-xl bg-foreground/10 text-foreground/60 border border-border/50 outline-none cursor-not-allowed"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground/80">Phone</label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/40" />
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full pl-12 pr-4 py-3 rounded-xl bg-foreground/5 border border-border/50 focus:border-accent outline-none"
                />
              </div>
            </div>

            {message && (
              <p className={`text-sm ${message.includes("success") ? "text-green-500" : "text-red-500"}`}>
                {message}
              </p>
            )}

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <ShinyButton
                type="submit"
                disabled={isSubmitting}
                shimmerColor="rgba(168,217,70,0.4)"
                shimmerDuration={1800}
                className="flex-1 py-3 rounded-xl bg-foreground text-background font-semibold flex items-center justify-center gap-2 hover:bg-accent hover:text-black transition-all shadow-md active:scale-95 cursor-pointer"
              >
                {isSubmitting && <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>}
                Save Changes
              </ShinyButton>
              <button
                type="button"
                onClick={handleLogout}
                className="flex-1 py-3 rounded-xl bg-red-500 text-white font-semibold hover:bg-red-600 transition-colors"
              >
                Logout
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
