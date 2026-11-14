"use client";

import React, { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCartStore, CartItem } from "@/store/cartStore";
import { useAuthStore } from "@/store/authStore";
import { Store, ArrowLeft, AlertCircle } from "lucide-react";
import { api } from "@/lib/api";
import { CheckoutStepsBar } from "@/components/checkout/CheckoutStepsBar";
import { AddressSelectionStep, SavedAddress } from "@/components/checkout/AddressSelectionStep";
import { NewAddressForm, NewAddressData } from "@/components/checkout/NewAddressForm";
import { PaymentSelectionStep, PaymentMethod } from "@/components/checkout/PaymentSelectionStep";
import { OrderSummarySidebar } from "@/components/checkout/OrderSummarySidebar";
import { OrderSuccessView } from "@/components/checkout/OrderSuccessView";

export default function CheckoutPage() {
  const router = useRouter();
  const cart = useCartStore();
  const { user, isAuthenticated } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  // Stepper state
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Address state
  const [addressMode, setAddressMode] = useState<"saved" | "new">("saved");
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>("");
  const [newAddress, setNewAddress] = useState<NewAddressData>({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    phone: user?.phone?.replace(/\D/g, "") || "",
    street: "",
    city: "Sambhal",
    state: "Uttar Pradesh",
    postalCode: "244302",
    type: "HOME",
    saveToProfile: true,
  });

  // Payment state
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("upi");
  const [livePaymentData, setLivePaymentData] = useState<any>(null);
  const [utrSubmitted, setUtrSubmitted] = useState(false);

  // Loading & error state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmittingUtr, setIsSubmittingUtr] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);

  // Success snapshot
  const [placedOrder, setPlacedOrder] = useState<any>(null);
  const [orderedItemsSnapshot, setOrderedItemsSnapshot] = useState<CartItem[]>([]);
  const [finalShippingSummary, setFinalShippingSummary] = useState<string>("");

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && cart.getTotalItems() === 0 && step !== 3) {
      router.push("/cart");
    }
  }, [mounted, cart, router, step]);

  // Load saved addresses
  useEffect(() => {
    if (!mounted) return;
    let isSubscribed = true;

    async function loadAddresses() {
      try {
        if (isAuthenticated) {
          const res = await api.get("/users/me/addresses");
          if (isSubscribed && res.data && Array.isArray(res.data) && res.data.length > 0) {
            const mapped: SavedAddress[] = res.data.map((a: any) => ({
              id: a.id,
              name: a.name || [user?.firstName, user?.lastName].filter(Boolean).join(" ") || "Saved Address",
              phone: a.phone || user?.phone?.replace(/\D/g, "") || "",
              street: a.street,
              city: a.city,
              state: a.state || "Uttar Pradesh",
              postalCode: a.postalCode,
              type: a.tag || a.type || "HOME",
              isDefault: !!a.isDefault,
            }));
            setSavedAddresses(mapped);
            const defaultAddr = mapped.find((a) => a.isDefault) || mapped[0];
            setSelectedAddressId(defaultAddr.id);
            setAddressMode("saved");
            return;
          }
        }
      } catch (err) {
        // Fallback
      }

      try {
        const stored = localStorage.getItem("cme_user_addresses");
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            const valid = parsed.filter((a: any) => a.id && a.street);
            if (isSubscribed && valid.length > 0) {
              setSavedAddresses(valid);
              const defaultAddr = valid.find((a: any) => a.isDefault) || valid[0];
              setSelectedAddressId(defaultAddr.id);
              setAddressMode("saved");
              return;
            }
          }
        }
      } catch {}

      if (isSubscribed) {
        setSavedAddresses([]);
        setAddressMode("new");
      }
    }

    loadAddresses();
    return () => {
      isSubscribed = false;
    };
  }, [mounted, isAuthenticated, user]);

  if (!mounted) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 border-3 border-accent border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-muted-foreground animate-pulse">Initializing secure checkout...</p>
      </div>
    );
  }

  const subtotal = cart.getSubtotal();
  const tax = Math.round(subtotal * 0.18);
  const total = subtotal + tax;
  const activeSavedAddress = savedAddresses.find((a) => a.id === selectedAddressId);
  const canProceedToStep2 =
    addressMode === "saved"
      ? !!selectedAddressId
      : !!(newAddress.street.trim() && newAddress.city.trim() && newAddress.phone.trim());

  // Proceed from Step 1 to Step 2
  const handleProceedToPayment = () => {
    setOrderError(null);
    if (addressMode === "saved") {
      if (!selectedAddressId || !activeSavedAddress) {
        setOrderError("Please select a delivery address to proceed.");
        return;
      }
      setFinalShippingSummary(
        `${activeSavedAddress.street}, ${activeSavedAddress.city}, ${activeSavedAddress.state} – ${activeSavedAddress.postalCode}`
      );
    } else {
      if (!newAddress.street.trim() || !newAddress.city.trim() || !newAddress.postalCode.trim()) {
        setOrderError("Please fill in all required address fields.");
        return;
      }
      setFinalShippingSummary(
        `${newAddress.street}, ${newAddress.city}, ${newAddress.state} – ${newAddress.postalCode}`
      );
    }
    setStep(2);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Place Order Handler
  const handlePlaceOrder = async () => {
    setIsSubmitting(true);
    setOrderError(null);
    setOrderedItemsSnapshot([...cart.items]);

    try {
      const isValidUuid = (str?: string) =>
        str ? /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(str) : false;

      const payload: any = {
        paymentMethod: paymentMethod === "test" ? "TEST_ORDER_NO_PAYMENT" : paymentMethod,
        userId: isValidUuid(user?.id) ? user?.id : undefined,
        userEmail: user?.email || "customer@chandmobile.in",
        userName: [user?.firstName, user?.lastName].filter(Boolean).join(" ") || "Customer",
        userPhone: user?.phone || "9876543210",
        items: cart.items.map((it) => ({
          productId: it.id,
          quantity: it.quantity,
        })),
      };

      if (addressMode === "saved" && selectedAddressId && isValidUuid(selectedAddressId)) {
        payload.shippingAddressId = selectedAddressId;
      } else if (addressMode === "saved" && activeSavedAddress) {
        payload.newShippingAddress = {
          name: activeSavedAddress.name || "Customer",
          phone: activeSavedAddress.phone || "9876543210",
          tag: activeSavedAddress.type || "HOME",
          street: activeSavedAddress.street,
          city: activeSavedAddress.city,
          state: activeSavedAddress.state,
          postalCode: activeSavedAddress.postalCode,
          country: "IN",
        };
      } else {
        payload.newShippingAddress = {
          name: `${newAddress.firstName} ${newAddress.lastName}`.trim() || "Customer",
          phone: newAddress.phone.trim() || "9876543210",
          tag: newAddress.type || "HOME",
          street: newAddress.street.trim(),
          city: newAddress.city.trim(),
          state: newAddress.state.trim(),
          postalCode: newAddress.postalCode.trim(),
          country: "IN",
        };

        if (newAddress.saveToProfile && isAuthenticated) {
          try {
            await api.post("/users/me/addresses", {
              name: `${newAddress.firstName} ${newAddress.lastName}`.trim() || undefined,
              phone: newAddress.phone.trim() || undefined,
              tag: newAddress.type,
              street: newAddress.street.trim(),
              city: newAddress.city.trim(),
              state: newAddress.state.trim(),
              postalCode: newAddress.postalCode.trim(),
              country: "IN",
              isDefault: savedAddresses.length === 0,
            });
          } catch {}
        }
      }

      const res = await api.post("/orders/checkout", payload);
      setPlacedOrder(res.data);

      // If user selected UPI, fetch the dynamic QR code instructions
      if (paymentMethod === "upi" && res.data?.id) {
        try {
          const instructionsRes = await api.get(`/payments/instructions/${res.data.id}`);
          setLivePaymentData(instructionsRes.data);
          // Stay on step 2 to allow the customer to scan QR and input UTR
          setIsSubmitting(false);
          return;
        } catch (qrErr) {
          console.warn("Could not load dynamic QR instructions:", qrErr);
        }
      }

      // Non-UPI or immediate completion
      cart.clearCart();
      setStep(3);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err: any) {
      if (paymentMethod === "test") {
        const demoOrderId = `TEST-${Date.now().toString().slice(-8)}`;
        setPlacedOrder({
          id: demoOrderId,
          status: "CONFIRMED",
          totalAmount: total,
          createdAt: new Date().toISOString(),
          paymentMethod: "TEST_ORDER_NO_PAYMENT",
        });
        cart.clearCart();
        setStep(3);
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }

      const msg =
        err?.response?.data?.message ||
        "Failed to place order. Please check your connectivity or try again.";
      setOrderError(typeof msg === "string" ? msg : JSON.stringify(msg));
    } finally {
      setIsSubmitting(false);
    }
  };

  // UTR submission for UPI payment
  const handleUtrSubmit = async (utr: string) => {
    if (!livePaymentData?.paymentId) return;
    setIsSubmittingUtr(true);
    setOrderError(null);
    try {
      await api.post(`/payments/${livePaymentData.paymentId}/submit`, { utr });
      setUtrSubmitted(true);
      cart.clearCart();
      setStep(3);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Failed to submit UTR. Please verify the 12-digit number.";
      setOrderError(typeof msg === "string" ? msg : JSON.stringify(msg));
    } finally {
      setIsSubmittingUtr(false);
    }
  };

  // STEP 3: Order Confirmed Screen
  if (step === 3) {
    return (
      <OrderSuccessView
        orderId={placedOrder?.id || `ORD-${Date.now().toString().slice(-6)}`}
        total={Number(placedOrder?.totalAmount || total)}
        paymentMethod={paymentMethod}
        shippingSummary={finalShippingSummary}
        items={orderedItemsSnapshot}
        isTestOrder={paymentMethod === "test"}
        paymentStatus={livePaymentData?.status || placedOrder?.paymentStatus}
        utrSubmitted={utrSubmitted}
      />
    );
  }

  // STEPS 1 & 2: Main Checkout Form
  return (
    <div className="min-h-screen bg-background relative pt-6 sm:pt-8 pb-20 overflow-x-hidden">
      <Head>
        <title>Checkout | Chand Mobile Expert</title>
      </Head>

      <div className="pointer-events-none absolute top-16 right-1/4 w-[500px] h-[500px] bg-accent/5 dark:bg-accent/[0.04] rounded-full blur-3xl -z-10" />
      <div className="pointer-events-none absolute top-96 left-10 w-[400px] h-[400px] bg-emerald-500/5 dark:bg-emerald-500/[0.03] rounded-full blur-3xl -z-10" />

      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Bar */}
        <div className="flex flex-col min-[480px]:flex-row items-start min-[480px]:items-center justify-between gap-3.5 pb-6 mb-6 border-b border-border/70 dark:border-white/[0.08]">
          <Link href="/" className="flex items-center gap-3 group shrink-0">
            <div className="relative flex items-center justify-center w-[150px] sm:w-[210px]">
              <Image
                src="/images/logo/logo.png"
                alt="Chand Mobile Expert"
                width={210}
                height={70}
                className="w-full h-auto object-contain dark:hidden"
                priority
              />
              <Image
                src="/images/logo/dark-logo.png"
                alt="Chand Mobile Expert"
                width={210}
                height={70}
                className="w-full h-auto object-contain hidden dark:block"
                priority
              />
            </div>
          </Link>

          <div className="flex items-center gap-2 sm:gap-2.5 w-full min-[480px]:w-auto justify-end">
            <Link
              href="/cart"
              className="inline-flex items-center gap-1.5 px-2.5 sm:px-4 py-2 rounded-xl text-xs font-semibold bg-foreground/[0.05] hover:bg-foreground/[0.09] dark:bg-white/[0.06] text-foreground border border-border/60 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Cart</span>
            </Link>
            <Link
              href="/shop"
              className="inline-flex items-center gap-1.5 px-2.5 sm:px-4 py-2 rounded-xl text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 dark:bg-accent dark:hover:bg-[#bbf055] dark:text-slate-950 transition-colors shadow-xs"
            >
              <Store className="w-3.5 h-3.5" />
              <span>Browse Shop</span>
            </Link>
          </div>
        </div>

        {/* Stepper Bar */}
        <CheckoutStepsBar
          currentStep={step}
          onStepChange={(s) => setStep(s)}
          canProceedToStep2={canProceedToStep2}
        />

        {/* Global Error Banner */}
        {orderError && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs sm:text-sm flex items-center gap-3">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span className="font-semibold">{orderError}</span>
          </div>
        )}

        {/* 2-Column Checkout Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          <div className="lg:col-span-8 space-y-6">
            {step === 1 && (
              <div className="bg-card dark:bg-[#121214] border border-border/80 dark:border-white/[0.08] rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border/70 dark:border-white/[0.08]">
                  <div>
                    <h2 className="text-lg font-bold text-foreground">1. Shipping Address</h2>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Select where you want your accessories or order delivered.
                    </p>
                  </div>

                  {savedAddresses.length > 0 && (
                    <div className="flex items-center gap-1.5 p-1 bg-foreground/[0.04] dark:bg-white/[0.05] border border-border/60 dark:border-white/10 rounded-xl text-xs font-semibold self-start sm:self-auto">
                      <button
                        type="button"
                        onClick={() => setAddressMode("saved")}
                        className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                          addressMode === "saved"
                            ? "bg-foreground text-background dark:bg-white dark:text-slate-950 shadow-2xs font-bold"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        Saved ({savedAddresses.length})
                      </button>
                      <button
                        type="button"
                        onClick={() => setAddressMode("new")}
                        className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                          addressMode === "new"
                            ? "bg-foreground text-background dark:bg-white dark:text-slate-950 shadow-2xs font-bold"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        New Address
                      </button>
                    </div>
                  )}
                </div>

                {addressMode === "saved" && savedAddresses.length > 0 ? (
                  <AddressSelectionStep
                    savedAddresses={savedAddresses}
                    selectedAddressId={selectedAddressId}
                    onSelectAddress={(id) => setSelectedAddressId(id)}
                    onAddNew={() => setAddressMode("new")}
                  />
                ) : (
                  <NewAddressForm
                    address={newAddress}
                    onChange={(updated) => setNewAddress((prev) => ({ ...prev, ...updated }))}
                    isAuthenticated={isAuthenticated}
                  />
                )}
              </div>
            )}

            {step === 2 && (
              <div className="bg-card dark:bg-[#121214] border border-border/80 dark:border-white/[0.08] rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
                <div className="pb-4 border-b border-border/70 dark:border-white/[0.08]">
                  <h2 className="text-lg font-bold text-foreground">2. Payment Method</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Select payment method to complete your order.
                  </p>
                </div>

                <PaymentSelectionStep
                  selectedMethod={paymentMethod}
                  onSelectMethod={(m) => setPaymentMethod(m)}
                  subtotal={subtotal}
                  tax={tax}
                  total={total}
                  livePaymentData={livePaymentData}
                  onUtrSubmit={handleUtrSubmit}
                  isSubmittingUtr={isSubmittingUtr}
                />
              </div>
            )}
          </div>

          {/* Right Column: Order Summary Sidebar */}
          <div className="lg:col-span-4">
            <OrderSummarySidebar
              items={cart.items}
              subtotal={subtotal}
              tax={tax}
              total={total}
              currentStep={step}
              isSubmitting={isSubmitting}
              onProceed={step === 1 ? handleProceedToPayment : handlePlaceOrder}
              disabled={step === 1 ? !canProceedToStep2 : false}
              ctaText={
                step === 1
                  ? "Proceed to Payment"
                  : livePaymentData
                  ? "Awaiting UTR Submission"
                  : "Generate Dynamic UPI QR & Place Order"
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
}
