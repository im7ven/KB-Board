import { updateTaskSchema } from "@/app/ValidationSchemas";
import prisma from "@/prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import authOptions from "@/app/auth/authOptions";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || !session.user.email) {
    return NextResponse.json(
      { error: "User not authenticated" },
      { status: 401 }
    );
  }

  const body = await request.json();

  const validation = updateTaskSchema.safeParse(body);

  if (!validation.success) {
    return NextResponse.json(validation.error.errors, { status: 400 });
  }

  const existingTask = await prisma.task.findUnique({
    where: { id: parseInt(params.id) },
    include: {
      subtasks: true,
      column: {
        include: {
          taskBoard: true,
        },
      },
    },
  });

  if (!existingTask) {
    return NextResponse.json({ error: "Task not found" }, { status: 404 });
  }

  if (existingTask.column.taskBoard.createdBy !== session.user.email) {
    return NextResponse.json(
      { error: "User not authorized to update this task" },
      { status: 403 }
    );
  }

  const existingSubIds = existingTask.subtasks.map((sub) => sub.id);
  const newSubTaskIds = validation.data.subtasks?.map((sub) => sub.id) || [];

  const subTaskToDelete = existingSubIds.filter(
    (id) => !newSubTaskIds.includes(id)
  );

  console.log("Subtasks to delete:", subTaskToDelete);

  await prisma.subtask.deleteMany({
    where: { id: { in: subTaskToDelete } },
  });

  const updatedTask = await prisma.task.update({
    where: { id: parseInt(params.id) },
    data: {
      title: validation.data.title,
      description: validation.data.description,
      subtasks: {
        // Update existing subtasks
        updateMany: validation.data.subtasks
          .filter((sub) => sub.id !== undefined)
          .map((sub) => ({
            where: { id: sub.id },
            data: { description: sub.description },
          })),
        // Create new subtasks
        create: validation.data.subtasks
          .filter((sub) => sub.id === undefined)
          .map((sub) => ({
            description: sub.description,
            status: false,
          })),
      },
    },
  });

  return NextResponse.json(updatedTask);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || !session.user.email) {
    return NextResponse.json(
      { error: "User not authenticated" },
      { status: 401 }
    );
  }

  const existingTask = await prisma.task.findUnique({
    where: { id: parseInt(params.id) },
    include: {
      column: {
        include: {
          taskBoard: true,
        },
      },
    },
  });

  if (!existingTask) {
    return NextResponse.json({ error: "Task not found" }, { status: 404 });
  }

  if (existingTask.column.taskBoard.createdBy !== session.user.email) {
    return NextResponse.json(
      { error: "User not authorized to delete this task" },
      { status: 403 }
    );
  }

  await prisma.task.delete({
    where: { id: existingTask.id },
  });

  return NextResponse.json({});
}
