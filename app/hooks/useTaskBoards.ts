import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import useActiveTaskBoard from "../zustand/store";
import { TaskBoard } from "../types";
const useTaskBoards = () => {
  const { status } = useSession();
  const { setDefaultBoard, setActiveBoard, activeBoard } = useActiveTaskBoard();
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    if (status === "authenticated") {
      setAuthenticated(true);
    } else if (status === "loading") {
      setAuthenticated(null);
    } else {
      setAuthenticated(false);
    }
  }, [status]);

  const taskBoardQueries = useQuery<TaskBoard[]>({
    queryKey: ["taskBoards"],
    queryFn: () =>
      axios
        .get("api/task-boards")
        .then((res) => res.data)
        .catch((error) => {
          throw new Error(
            error.response?.data?.message || "Failed to fetch task boards."
          );
        }),
    staleTime: 60 * 1000,
    retry: 3,
    enabled: authenticated === true,
    onSuccess: (data) => {
      if (!activeBoard) {
        setDefaultBoard(data);
      } else {
        const updatedBoard = data.find((board) => board.id === activeBoard.id);
        setActiveBoard(updatedBoard || null);
      }
    },
  });

  const { isLoading, data: taskBoards, isError } = taskBoardQueries;

  return { isLoading, isError, taskBoards, authenticated };
};

export default useTaskBoards;
