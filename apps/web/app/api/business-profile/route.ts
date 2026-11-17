import { NextResponse } from "next/server";

export async function GET() {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
    const res = await fetch(`${apiUrl}/business-profile`, {
      headers: { "Content-Type": "application/json" },
      next: { revalidate: 60 },
    });
    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }
  } catch (error) {
    // Fallback response if API service is restarting
  }

  return NextResponse.json({
    companyName: "Chand Mobile Expert",
    phone: "+91 98765 43210",
    whatsapp: "+91 98765 43210",
    email: "support@chandmobileexpert.com",
    address: "Main Market, Near Clock Tower, Roorkee, Uttarakhand - 247667",
    openingHours: "Mon - Sat: 10:00 AM - 8:00 PM, Sun: 11:00 AM - 5:00 PM",
  });
}

