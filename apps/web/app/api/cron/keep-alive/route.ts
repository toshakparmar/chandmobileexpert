import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const backendUrl =
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.API_URL ||
    "http://localhost:3000";

  try {
    const healthUrl = `${backendUrl.replace(/\/$/, "")}/health`;
    const res = await fetch(healthUrl, {
      method: "GET",
      cache: "no-store",
      headers: {
        "User-Agent": "ChandMobileExpert-KeepAlive-Cron/1.0",
      },
    });

    const data = await res.json().catch(() => ({}));

    return NextResponse.json({
      status: "ok",
      cronPingedAt: new Date().toISOString(),
      backendUrl: healthUrl,
      backendStatus: res.status,
      backendData: data,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        status: "error",
        message: error?.message || "Failed to ping backend",
        backendUrl,
      },
      { status: 502 },
    );
  }
}

