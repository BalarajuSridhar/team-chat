import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { getCurrentUser } from "../../../../lib/auth";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(req: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  const channelId = id;

  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  if (!channelId) {
    return NextResponse.json(
      { message: "Channel id is missing" },
      { status: 400 }
    );
  }

  await prisma.channelMember.deleteMany({
    where: {
      userId: user.id,
      channelId,
    },
  });

  return NextResponse.json({ message: "Left channel" }, { status: 200 });
}
