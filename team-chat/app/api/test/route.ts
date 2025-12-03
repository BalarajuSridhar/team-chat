// app/api/test/route.ts
import { NextResponse } from "next/server";
import { prisma } from "../../lib/prisma"; // ✅ correct


export async function GET() {
  try {
    const users = await prisma.user.findMany({
      take: 5,
    });

    return NextResponse.json({ ok: true, users });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { ok: false, error: "Something went wrong" },
      { status: 500 }
    );
  }
}
