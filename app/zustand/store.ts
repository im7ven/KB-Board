import { create } from "zustand";
import { TaskBoard } from "../types";

interface ActiveTaskBoardStore {
  activeBoard: TaskBoard | null;
  setDefaultBoard: (taskBoards: TaskBoard[] | null) => void;
  setActiveBoard: (board: TaskBoard | null) => void;
}

const useActiveTaskBoard = create<ActiveTaskBoardStore>((set) => ({
  activeBoard: null,
  setDefaultBoard: (taskBoards: TaskBoard[] | null) => {
    if (taskBoards && taskBoards.length > 0) {
      set({ activeBoard: taskBoards[0] });
    } else {
      set({ activeBoard: null });
    }
  },
  setActiveBoard: (board: TaskBoard | null) => {
    set({ activeBoard: board });
  },
}));

export default useActiveTaskBoard;
