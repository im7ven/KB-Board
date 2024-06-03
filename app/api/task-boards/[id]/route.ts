import { updateTaskBoardSchema } from "@/app/ValidationSchemas";
import prisma from "@/prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import authOptions from "@/app/auth/authOptions";

// DELETE route to delete a task board if it belongs to the authenticated user
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  // Check for user authentication
  const session = await getServerSession(authOptions);

  if (!session || !session.user || !session.user.email) {
    return NextResponse.json(
      { error: "User not authenticated" },
      { status: 401 }
    );
  }

  // Find the task board by ID
  const taskBoard = await prisma.taskBoard.findUnique({
    where: { id: parseInt(params.id) },
  });

  // Check if task board exists
  if (!taskBoard) {
    return NextResponse.json(
      { error: "Task board does not exist" },
      { status: 404 }
    );
  }

  // Check if the task board was created by the authenticated user
  if (taskBoard.createdBy !== session.user.email) {
    return NextResponse.json(
      { error: "User not authorized to delete this task board" },
      { status: 403 }
    );
  }

  // Delete the task board
  await prisma.taskBoard.delete({
    where: { id: taskBoard.id },
  });

  return NextResponse.json({ message: "Task board deleted successfully" });
}

// PATCH route to update a task board if it belongs to the authenticated user
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  // Check for user authentication
  const session = await getServerSession(authOptions);

  if (!session || !session.user || !session.user.email) {
    return NextResponse.json(
      { error: "User not authenticated" },
      { status: 401 }
    );
  }

  // Validate the request body
  const body = await req.json();
  const validation = updateTaskBoardSchema.safeParse(body);

  if (!validation.success) {
    return NextResponse.json(validation.error.errors, { status: 400 });
  }

  const taskBoardId = parseInt(params.id);

  try {
    // Find the existing task board by ID
    const existingTaskBoardState = await prisma.taskBoard.findUnique({
      where: { id: taskBoardId },
      include: { columns: true },
    });

    // Check if task board exists
    if (!existingTaskBoardState) {
      return NextResponse.json(
        { error: "Task board does not exist" },
        { status: 404 }
      );
    }

    // Check if the task board was created by the authenticated user
    if (existingTaskBoardState.createdBy !== session.user.email) {
      return NextResponse.json(
        { error: "User not authorized to update this task board" },
        { status: 403 }
      );
    }

    const existingColumnIds = existingTaskBoardState.columns.map(
      (col) => col.id
    );
    const newColumnIds = validation.data.columns.map((col) => col.id);
    const columnsToDelete = existingColumnIds.filter(
      (id) => !newColumnIds.includes(id)
    );

    // Delete columns that are no longer in the updated data
    await prisma.column.deleteMany({
      where: { id: { in: columnsToDelete } },
    });

    // Update the task board with new title and columns
    await prisma.taskBoard.update({
      where: { id: taskBoardId },
      data: {
        title: validation.data.title, // Update task board title
        columns: {
          // Update existing columns' titles
          updateMany: validation.data.columns
            .filter((column) => column.id !== undefined)
            .map((column) => ({
              where: { id: column.id },
              data: { title: column.title },
            })),
          // Create new columns
          create: validation.data.columns
            .filter((column) => column.id === undefined)
            .map((column) => ({
              title: column.title,
            })),
        },
      },
    });

    return NextResponse.json({ message: "Task board updated successfully" });
  } catch (error) {
    console.error("Error updating task board:", error);
    return NextResponse.json(
      { error: "Failed to update task board" },
      { status: 500 }
    );
  }
}
