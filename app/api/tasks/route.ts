import { createTaskSchema } from "@/app/ValidationSchemas";
import prisma from "@/prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import authOptions from "@/app/auth/authOptions";

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || !session.user.email) {
    return NextResponse.json(
      { error: "User not authenticated" },
      { status: 401 }
    );
  }

  const body = await request.json();

  const validation = createTaskSchema.safeParse(body);

  if (!validation.success) {
    return NextResponse.json(validation.error.errors, { status: 400 });
  }

  const columnId = parseInt(body.columnId);

  // Verify the column exists and belongs to a task board owned by the authenticated user
  const column = await prisma.column.findUnique({
    where: { id: columnId },
    include: {
      taskBoard: true,
    },
  });

  if (!column) {
    return NextResponse.json(
      { error: "Column does not exist" },
      { status: 404 }
    );
  }

  if (column.taskBoard.createdBy !== session.user.email) {
    return NextResponse.json(
      { error: "User not authorized to add tasks to this column" },
      { status: 403 }
    );
  }

  const newTask = await prisma.task.create({
    data: {
      title: body.title,
      description: body.description,
      columnId: columnId,
      subtasks: {
        create:
          validation.data.subtasks?.map((task: { title: string }) => ({
            description: task.title,
            status: false,
          })) || [],
      },
    },
  });

  return NextResponse.json(newTask, { status: 201 });
}
