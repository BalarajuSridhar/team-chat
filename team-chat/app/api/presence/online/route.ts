// app/api/presence/online/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import { getCurrentUser } from "../../../lib/auth";

export async function GET(req: NextRequest) {
  const me = await getCurrentUser();
  if (!me) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  // A user is considered online if lastseen was updated in the past 30 seconds.
  const THRESHOLD_MS = 30 * 1000;
  const since = new Date(Date.now() - THRESHOLD_MS);

  try {
    const users = await prisma.user.findMany({
      where: {
        // 👇 use lastseen instead of lastSeen
        lastseen: {
          gte: since,
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json({ users });
  } catch (error) {
    console.error("Error fetching online users:", error);
    return NextResponse.json(
      { message: "Server error while fetching online users" },
      { status: 500 }
    );
  }
}
