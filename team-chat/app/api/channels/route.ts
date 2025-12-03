// app/api/channels/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../lib/prisma";
import { getCurrentUser } from "../../lib/auth";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const channels = await prisma.channel.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { members: true },
      },
    },
  });

  const result = channels.map((ch) => ({
    id: ch.id,
    name: ch.name,
    memberCount: ch._count.members,
  }));

  return NextResponse.json({ channels: result });
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { name } = body;

  if (!name || !name.trim()) {
    return NextResponse.json(
      { message: "Channel name is required" },
      { status: 400 }
    );
  }

  const channel = await prisma.channel.create({
    data: {
      name: name.trim(),
      members: {
        create: {
          userId: user.id, // creator joins automatically
        },
      },
    },
    include: {
      _count: {
        select: { members: true },
      },
    },
  });

  return NextResponse.json(
    {
      message: "Channel created",
      channel: {
        id: channel.id,
        name: channel.name,
        memberCount: channel._count.members,
      },
    },
    { status: 201 }
  );
}
