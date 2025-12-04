// app/api/debug-db-env/route.ts
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  const url = process.env.DATABASE_URL || "";

  return NextResponse.json({
    hasDatabaseUrl: !!url,
    length: url.length,
    preview: url.slice(0, 40) + (url.length > 40 ? "..." : ""),
  });
}
