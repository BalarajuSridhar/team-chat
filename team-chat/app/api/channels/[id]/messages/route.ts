// app/api/channels/[id]/messages/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { getCurrentUser } from "../../../../lib/auth";
import { pusherServer } from "../../../../lib/pusher";


type RouteContext = {
  params: Promise<{ id: string }>;
};

const PAGE_SIZE = 20;

export async function GET(req: NextRequest, context: RouteContext) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const channelId = id;

  if (!channelId) {
    return NextResponse.json(
      { message: "Channel id is missing" },
      { status: 400 }
    );
  }

  const cursor = req.nextUrl.searchParams.get("cursor") || null;

  const messages = await prisma.message.findMany({
    where: { channelId },
    orderBy: { createdAt: "desc" }, // newest first
    take: PAGE_SIZE + 1,            // fetch one extra to know if there is more
    ...(cursor
      ? {
          cursor: { id: cursor },
          skip: 1, // skip the cursor item itself
        }
      : {}),
    include: {
      user: {
        select: { id: true, name: true, email: true },
      },
    },
  });

  let nextCursor: string | null = null;

  if (messages.length > PAGE_SIZE) {
    const last = messages.pop(); // remove extra
    nextCursor = last!.id;
  }

  // reverse to oldest → newest for UI
  const ordered = messages.reverse();

  return NextResponse.json({
    messages: ordered,
    nextCursor,
  });
}
export async function POST(req: NextRequest, context: RouteContext) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const channelId = id;

  if (!channelId) {
    return NextResponse.json(
      { message: "Channel id is missing" },
      { status: 400 }
    );
  }

  const body = await req.json();
  const { text } = body;

  if (!text || !text.trim()) {
    return NextResponse.json(
      { message: "Message text is required" },
      { status: 400 }
    );
  }

  // Optional: ensure user is a member
  const membership = await prisma.channelMember.findUnique({
    where: {
      userId_channelId: {
        userId: user.id,
        channelId,
      },
    },
  });

  if (!membership) {
    return NextResponse.json(
      { message: "You are not a member of this channel" },
      { status: 403 }
    );
  }

  const message = await prisma.message.create({
    data: {
      text: text.trim(),
      userId: user.id,
      channelId,
    },
    include: {
      user: {
        select: { id: true, name: true, email: true },
      },
    },
  });

  // 🔔 Notify all subscribers in this channel
  await pusherServer.trigger(
    `channel-${channelId}`,
    "message:new",
    message
  );

    return NextResponse.json(
      {
        message,
      },
      { status: 201 }
    );
  }
