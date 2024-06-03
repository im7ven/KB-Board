import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma/client";
import { getServerSession } from "next-auth";
import authOptions from "@/app/auth/authOptions";
import { createTaskBoardSchema } from "@/app/ValidationSchemas";

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || !session.user.email) {
    return NextResponse.json(
      { error: "User not authenticated" },
      { status: 401 }
    );
  }

  const taskBoards = await prisma.taskBoard.findMany({
    where: {
      createdBy: session!.user!.email!,
    },
    include: {
      columns: {
        include: {
          tasks: {
            include: {
              subtasks: true,
              column: true,
            },
          },
        },
      },
    },
  });

  if (!taskBoards) {
    return NextResponse.json({ status: 404 });
  }

  return NextResponse.json(taskBoards, { status: 200 });
}

export async function POST(request: NextRequest | any) {
  const body = await request.json();
  const validation = createTaskBoardSchema.safeParse(body);

  const session = await getServerSession(authOptions);

  if (!session || !session.user || !session.user.email) {
    return NextResponse.json(
      { error: "User not authenticated" },
      { status: 401 }
    );
  }

  if (!validation.success) {
    return NextResponse.json(validation.error.errors, { status: 400 });
  }

  const newTaskBoard = await prisma.taskBoard.create({
    data: {
      title: body.title,
      createdBy: session.user.email,
      columns: {
        create:
          validation.data.columns?.map((col: { title: string }) => ({
            title: col.title,
          })) || [], // If validation.data.columns is undefined, use an empty array
      },
    },
    include: {
      columns: true,
    },
  });

  return NextResponse.json(newTaskBoard, { status: 201 });
}
