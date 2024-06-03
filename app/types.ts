import {
  Column as PrismaColumn,
  Task as PrismaTask,
  TaskBoard as PrismaTaskBoard,
  Subtask,
} from "@prisma/client";

export interface TaskBoard extends PrismaTaskBoard {
  columns: Column[];
  tasks: Task[];
}

export interface Column extends PrismaColumn {
  tasks: Task[];
}

export interface Task extends PrismaTask {
  subtasks: Subtask[];
  column: Column;
}
