import { z } from "zod";

export const createTaskBoardSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required.")
    .max(25, "Maximum of 25 characters."),
  columns: z
    .array(
      z.object({
        title: z
          .string()
          .min(1, "Title is required when assigning columns to boards.")
          .max(15, "Maximum of 15 characters"),
      })
    )
    .optional(),
});

export const createTaskSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required.")
    .max(255, "Maximum of 255 characters."),
  description: z
    .string()
    .min(1, "Description is required")
    .max(255, "Maximum of 255 characters."),
  columnId: z.string(),
  subtasks: z
    .array(
      z.object({
        title: z
          .string()
          .min(1, "Title is required when assigning subtasks to tasks.")
          .max(35, "Maximum of 35 characters."),
      })
    )
    .optional(),
});

export const updateTaskSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required.")
    .max(255, "Maximum of 255 characters."),
  description: z
    .string()
    .min(1, "Description is required")
    .max(255, "Maximum of 255 characters."),
  subtasks: z.array(
    z.object({
      id: z.number().optional(),
      description: z
        .string()
        .min(1, "Title is required when assigning subtasks to tasks.")
        .max(35, "Maximum of 35 characters."),
    })
  ),
});
export const updateTaskBoardSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required.")
    .max(25, "Maximum of 25 characters."),
  columns: z.array(
    z.object({
      id: z.number().optional(), // Optional id for new columns
      title: z
        .string()
        .min(1, "Title is required when assigning columns to boards.")
        .max(15, "Maximum of 15 characters"),
    })
  ),
});
