import { NextResponse } from "next/server";

type ChunkTelemetryPayload = {
  source?: string;
  name?: string;
  message?: string;
  stack?: string;
  digest?: string;
  href?: string;
  pathname?: string;
  search?: string;
  hash?: string;
  referrer?: string;
  navigationType?: string;
  release?: string;
  failedChunk?: string;
  resourceHits?: Array<{
    name: string;
    initiatorType?: string;
    transferSize?: number;
    encodedBodySize?: number;
    duration?: number;
  }>;
  userAgent?: string;
  buildId?: string;
  attempt?: number;
  maxAttempts?: number;
  timestamp?: string;
};

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as ChunkTelemetryPayload;
    const headers = Object.fromEntries(request.headers.entries());

    console.error("[chunk-telemetry][client]", {
      source: payload.source,
      name: payload.name,
      message: payload.message,
      digest: payload.digest,
      href: payload.href,
      pathname: payload.pathname,
      search: payload.search,
      hash: payload.hash,
      referrer: payload.referrer,
      navigationType: payload.navigationType,
      release: payload.release,
      failedChunk: payload.failedChunk,
      resourceHits: payload.resourceHits,
      buildId: payload.buildId,
      attempt: payload.attempt,
      maxAttempts: payload.maxAttempts,
      timestamp: payload.timestamp,
      userAgent: payload.userAgent,
      stack: payload.stack,
    });

    console.error("[chunk-telemetry][request]", {
      vercelEnv: process.env.VERCEL_ENV,
      region: process.env.VERCEL_REGION,
      deploymentId: process.env.VERCEL_DEPLOYMENT_ID,
      gitCommitSha: process.env.VERCEL_GIT_COMMIT_SHA,
      headers: {
        "x-vercel-id": headers["x-vercel-id"],
        "x-forwarded-for": headers["x-forwarded-for"],
        "x-forwarded-host": headers["x-forwarded-host"],
        "user-agent": headers["user-agent"],
        referer: headers["referer"],
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[chunk-telemetry][invalid-payload]", error);
    return NextResponse.json({ success: false }, { status: 400 });
  }
}
