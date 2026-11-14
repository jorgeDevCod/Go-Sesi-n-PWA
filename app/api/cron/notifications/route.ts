import { NextResponse } from "next/server";
import { processSessionNotifications } from "@/services/notifications/session-notifications.service";
import { processPlanningNotifications } from "@/services/notifications/planning-notifications.service";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

function authorized(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const authorization = request.headers.get("authorization");
  const bearer = authorization?.startsWith("Bearer ")
    ? authorization.slice("Bearer ".length)
    : null;
  const url = new URL(request.url);
  return bearer === secret || url.searchParams.get("secret") === secret;
}

async function run(request: Request) {
  if (!authorized(request)) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const [sessions, planning] = await Promise.all([
    processSessionNotifications(),
    processPlanningNotifications(),
  ]);

  return NextResponse.json({ ok: true, sessions, planning });
}

export async function GET(request: Request) {
  return run(request);
}

export async function POST(request: Request) {
  return run(request);
}
