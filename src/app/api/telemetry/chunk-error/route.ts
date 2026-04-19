import { NextResponse } from "next/server";

type ChunkTelemetryPayload = {
  source?: string;
  name?: string;
  message?: string;
  stack?: string;
  digest?: string;
  href?: string;
  userAgent?: string;
  buildId?: string;
  attempt?: number;
  maxAttempts?: number;
  timestamp?: string;
};

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as ChunkTelemetryPayload;

    console.error("[chunk-telemetry][client]", {
      source: payload.source,
      name: payload.name,
      message: payload.message,
      digest: payload.digest,
      href: payload.href,
      buildId: payload.buildId,
      attempt: payload.attempt,
      maxAttempts: payload.maxAttempts,
      timestamp: payload.timestamp,
      userAgent: payload.userAgent,
      stack: payload.stack,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[chunk-telemetry][invalid-payload]", error);
    return NextResponse.json({ success: false }, { status: 400 });
  }
}
