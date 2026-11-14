import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface UserProfile {
  id: string;
  email?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  profilePicture?: string;
  authMethod: "google" | "email" | "phone";
}

interface AuthState {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isProfileComplete: boolean;
  
  login: (method: "google" | "email" | "phone", identifier: string, extra?: Partial<UserProfile>) => void;
  updateProfile: (data: Partial<UserProfile>) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isProfileComplete: false,
      
      login: (method, identifier, extra) => {
        set({
          user: {
            id: extra?.id || `usr_${Math.random().toString(36).substring(2, 10)}`,
            authMethod: method,
            email: method === "email" || method === "google" ? identifier : undefined,
            phone: method === "phone" ? identifier : undefined,
            firstName: extra?.firstName,
            lastName: extra?.lastName,
            profilePicture: extra?.profilePicture,
            ...extra,
          },
          isAuthenticated: true,
          isProfileComplete: !!(extra?.firstName && (extra?.email || extra?.phone)),
        });
      },
      
      updateProfile: (data) => {
        set((state) => {
          if (!state.user) return state;
          
          const updatedUser = { ...state.user, ...data };
          // Check if required fields are present
          const isComplete = !!(updatedUser.firstName && updatedUser.lastName && (updatedUser.email || updatedUser.phone));
          
          return {
            user: updatedUser,
            isProfileComplete: isComplete,
          };
        });
      },
      
      logout: () => {
        set({
          user: null,
          isAuthenticated: false,
          isProfileComplete: false,
        });
      },
    }),
    {
      name: "auth-storage",
    }
  )
);
