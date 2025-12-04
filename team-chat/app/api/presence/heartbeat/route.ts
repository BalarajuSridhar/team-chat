// app/api/presence/heartbeat/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import { getCurrentUser } from "../../../lib/auth";

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      // 👇 use the exact field name from Prisma: lastseen
      lastseen: new Date(),
    },
  });

  return NextResponse.json({ message: "ok" });
}
