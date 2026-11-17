import GridShape from "@/components/common/GridShape";
import ThemeTogglerTwo from "@/components/common/ThemeTogglerTwo";

import { ThemeProvider } from "@/context/ThemeContext";
import Image from "next/image";
import Link from "next/link";
import React from "react";

import logoImg from "../../../../public/images/logo/logo.png";
import darkLogoImg from "../../../../public/images/logo/dark-logo.png";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative h-screen w-full bg-gray-50 dark:bg-gray-900 overflow-hidden">
      <ThemeProvider>
        <div className="flex h-full w-full">
          
          {/* Left Side: Form Content (Children) */}
          <div className="flex w-full lg:w-1/2 flex-col justify-center px-6 sm:px-12 xl:px-24 bg-white dark:bg-gray-950 relative z-10 transition-colors duration-300 overflow-hidden">
            
            {/* Ambient Background Glows */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-brand-500/10 dark:bg-brand-500/5 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[80px]" />
              <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-brand-400/10 dark:bg-brand-400/5 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[80px]" />
            </div>

            <div className="relative z-10 w-full">
              {children}
            </div>

            <div className="absolute bottom-6 left-6 lg:hidden z-50">
              <ThemeTogglerTwo />
            </div>
          </div>

          {/* Right Side: Premium Branding Area (Desktop Only) */}
          <div className="hidden lg:flex w-1/2 h-full relative items-center justify-center overflow-hidden bg-brand-500 dark:bg-gray-950 transition-colors duration-500">
            
            {/* Background Pattern / Texture - White in light mode, Bright Green in dark mode */}
            <div 
              className="absolute inset-0 opacity-[0.15] dark:opacity-[0.08] pointer-events-none transition-opacity duration-500 bg-[url('data:image/svg+xml,%3Csvg width=\\'60\\' height=\\'60\\' viewBox=\\'0 0 60 60\\' xmlns=\\'http://www.w3.org/2000/svg\\'%3E%3Cg fill=\\'none\\' fill-rule=\\'evenodd\\'%3E%3Cg fill=\\'%23ffffff\\' fill-opacity=\\'1\\'%3E%3Cpath d=\\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] dark:bg-[url('data:image/svg+xml,%3Csvg width=\\'60\\' height=\\'60\\' viewBox=\\'0 0 60 60\\' xmlns=\\'http://www.w3.org/2000/svg\\'%3E%3Cg fill=\\'none\\' fill-rule=\\'evenodd\\'%3E%3Cg fill=\\'%23a8d946\\' fill-opacity=\\'1\\'%3E%3Cpath d=\\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]"
            />
            
            {/* Elegant Gradients - Brand green used as accent */}
            <div className="absolute top-0 right-0 -mt-20 -mr-20 w-[500px] h-[500px] bg-white/20 dark:bg-brand-500/20 rounded-full mix-blend-overlay dark:mix-blend-screen filter blur-[100px] animate-pulse pointer-events-none" />
            <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-[600px] h-[600px] bg-black/10 dark:bg-brand-400/20 rounded-full mix-blend-overlay dark:mix-blend-screen filter blur-[120px] pointer-events-none" />

            {/* Content Container with Glassmorphism */}
            <div className="relative z-10 flex flex-col items-center justify-center p-12 max-w-lg w-full mx-8 rounded-[2.5rem] bg-white/90 dark:bg-gray-900/60 backdrop-blur-xl border border-white/60 dark:border-white/10 shadow-[0_12px_40px_0_rgba(0,0,0,0.15)] dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.4)] transition-all duration-500 hover:shadow-[0_16px_50px_0_rgba(0,0,0,0.2)] dark:hover:shadow-[0_16px_48px_0_rgba(0,0,0,0.6)] group">
              
              <div className="block mb-10 relative w-72 h-32 transform transition-transform duration-700 group-hover:scale-105">
                <Image
                  src={logoImg}
                  alt="Chand Mobile Expert Logo"
                  fill
                  priority
                  className="object-contain dark:hidden drop-shadow-sm"
                />
                <Image
                  src={darkLogoImg}
                  alt="Chand Mobile Expert Logo"
                  fill
                  priority
                  className="object-contain hidden dark:block drop-shadow-md"
                />
              </div>

              <div className="text-center space-y-4">
                <div className="inline-block px-4 py-1.5 rounded-full bg-brand-100/50 dark:bg-brand-500/10 border border-brand-200/50 dark:border-brand-500/20 mb-2">
                  <span className="text-xs font-semibold text-brand-700 dark:text-brand-300 uppercase tracking-wider">
                    Secure Backend Access
                  </span>
                </div>
                <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                  Administration Portal
                </h2>
                <p className="text-gray-500 dark:text-gray-400 text-sm max-w-[280px] mx-auto leading-relaxed">
                  Manage your catalog, orders, and services seamlessly.
                </p>
              </div>
              
            </div>

            <div className="absolute bottom-8 right-8 z-50">
              <ThemeTogglerTwo />
            </div>
          </div>
          
        </div>
      </ThemeProvider>
    </div>
  );
}
