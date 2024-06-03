"use server";
import prisma from "@/prisma/client";

export const updateTaskStatus = async (taskId: number, columnId: number) => {
  "use server";
  return prisma.task.update({
    where: { id: taskId },
    data: { columnId },
  });
};

export const updateSubtaskStatus = async (
  subtaskId: number,
  status: boolean
) => {
  "use server";
  return prisma.subtask.update({
    where: { id: subtaskId },
    data: { status },
  });
};
