"use client";

import React, { useState, useEffect } from "react";
import { Phone, HelpCircle } from "lucide-react";
import { useBusinessProfile } from "@/context/BusinessContext";
import { api } from "@/lib/api";
import { faqs as fallbackFaqs } from "@/lib/data";
import { GradientText } from "@/components/reactbits/GradientText";
import { DecryptedText } from "@/components/reactbits/DecryptedText";
import { Magnet } from "@/components/reactbits/Magnet";

export function FAQ() {
  const { waLink, telLink } = useBusinessProfile();
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [faqsList, setFaqsList] = useState<any[]>(fallbackFaqs);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchFaqs = async () => {
      try {
        let data: any[] = [];
        try {
          const res = await fetch('/api/faqs');
          if (res.ok) data = await res.json();
        } catch {
          // ignore
        }
        if (!data || data.length === 0) {
          const response = await api.get('/faqs');
          if (response.data && Array.isArray(response.data)) {
            data = response.data;
          }
        }
        if (Array.isArray(data) && data.length > 0) {
          setFaqsList(data.filter((f: any) => f.isActive !== false));
        }
      } catch (error) {
        console.error("Using fallback FAQs:", error);
      }
    };
    fetchFaqs();
  }, []);

  const toggleItem = (idx: number) => {
    setOpenIndex((prev) => (prev === idx ? null : idx));
  };

  return (
    <section id="faq" className="w-full px-4 sm:px-6 py-16 sm:py-20 lg:py-28">
      <div className="mx-auto max-w-3xl">
        {/* Header */}
        <div className="mb-12 text-center sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-accent/10 border border-accent/20 mb-4">
            <HelpCircle className="w-3.5 h-3.5 text-accent" />
            <DecryptedText
              text="Got Questions? We Have Answers"
              speed={28}
              className="text-xs font-bold text-accent uppercase tracking-wider"
              encryptedClassName="text-accent/60 font-mono"
            />
          </div>
          <h2 className="mt-2 text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground">
            Everything you need to{" "}
            <GradientText colors={["#a8d946", "#5eead4", "#a8d946"]} animationSpeed={9}>
              know
            </GradientText>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base text-muted-foreground sm:text-lg">
            Have questions about your device repair, warranty, or parts? We&#x27;re here to help!
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Magnet padding={24} magnetStrength={2}>
              <a
                href={waLink("Hello Chand Mobile Expert, I have a question about mobile repair.")}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center rounded-xl bg-foreground px-6 py-3 text-sm font-semibold text-background transition-colors hover:bg-accent hover:text-black shadow-sm"
                tabIndex={0}
              >
                Ask on WhatsApp
              </a>
            </Magnet>
            <Magnet padding={24} magnetStrength={2}>
              <a
                href={telLink()}
                className="group inline-flex items-center justify-center gap-2 rounded-xl bg-accent px-6 py-3 text-sm font-semibold text-black shadow-sm transition-all hover:bg-accent/90"
                tabIndex={0}
              >
                <Phone className="w-4 h-4 transition-transform duration-300 group-hover:scale-110" />
                <span>Call Now</span>
              </a>
            </Magnet>
          </div>
        </div>

        {/* Accordion list */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="flex flex-col gap-3" role="list">
            {faqsList.map((item, idx) => {
              const isOpen = openIndex === idx;
              return (
                <div
                  key={item.id || idx}
                  onClick={() => toggleItem(idx)}
                  role="button"
                  tabIndex={0}
                  aria-expanded={isOpen}
                  className={`cursor-pointer rounded-2xl border transition-all duration-300 p-4 sm:p-6 shadow-sm ${
                    isOpen
                      ? "bg-frame border-accent/40 shadow-md shadow-accent/5 ring-1 ring-accent/20"
                      : "bg-frame border-transparent hover:border-accent/20 hover:bg-frame/80"
                  }`}
                >
                <div className="flex w-full items-center justify-between gap-4 text-left">
                  <span className="text-base font-medium text-foreground sm:text-lg">
                    {item.question}
                  </span>
                  <div className="shrink-0">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className={`lucide lucide-chevron-down h-5 w-5 text-muted-foreground transition-transform duration-300 ${isOpen ? "rotate-180" : ""
                        }`}
                      aria-hidden="true"
                    >
                      <path d="m6 9 6 6 6-6" />
                    </svg>
                  </div>
                </div>

                <div
                  className={`grid overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                    }`}
                >
                  <div className="overflow-hidden">
                    <p className="pt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
                      {item.answer}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
          </div>
        )}
      </div>
    </section>
  );
}
