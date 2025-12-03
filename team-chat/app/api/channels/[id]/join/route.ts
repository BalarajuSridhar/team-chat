import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { getCurrentUser } from "../../../../lib/auth";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(req: NextRequest, context: RouteContext) {
  const { id } = await context.params; // ⬅️ await the promise
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

  const channel = await prisma.channel.findUnique({
    where: { id: channelId },
  });

  if (!channel) {
    return NextResponse.json({ message: "Channel not found" }, { status: 404 });
  }

  const existing = await prisma.channelMember.findUnique({
    where: {
      userId_channelId: {
        userId: user.id,
        channelId,
      },
    },
  });

  if (existing) {
    return NextResponse.json({ message: "Already joined" }, { status: 200 });
  }

  await prisma.channelMember.create({
    data: {
      userId: user.id,
      channelId,
    },
  });

  return NextResponse.json({ message: "Joined channel" }, { status: 200 });
}
