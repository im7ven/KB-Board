import { useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { useRef } from "react";
import useTaskBoards from "../hooks/useTaskBoards";
import { updateSubtaskStatus, updateTaskStatus } from "../serverActions";
import { Column, Task } from "../types";
import useActiveTaskBoard from "../zustand/store";
import useTheme from "../zustand/ThemeStore";
import EditTaskModal from "./EditTaskModal";
import ThemeText from "./ThemeText";

interface TaskBoardProps {
  isSideBarVisible: boolean;
  onEdit: () => void;
}

const ColumnComponent = ({ column }: { column: Column }) => {
  return (
    <div className="min-w-[17.5rem] space-y-5">
      <h2 className="tracking-widest uppercase">{`${column.title} (${column.tasks.length})`}</h2>
      {column.tasks.map((task) => (
        <TaskComponent key={task.id} task={task} />
      ))}
    </div>
  );
};

const TaskComponent = ({ task }: { task: Task }) => {
  const editTaskModal = useRef<HTMLDialogElement>(null);
  const queryClient = useQueryClient();
  const { activeBoard } = useActiveTaskBoard();
  const { activeTheme } = useTheme();

  const handleSubtaskStatusChange = async (subtaskId: number) => {
    const subtaskIndex = task.subtasks.findIndex((sub) => sub.id === subtaskId);
    const updatedSubtasks = [...task.subtasks];
    updatedSubtasks[subtaskIndex].status =
      !updatedSubtasks[subtaskIndex].status;

    await updateSubtaskStatus(subtaskId, updatedSubtasks[subtaskIndex].status);
    queryClient.invalidateQueries(["taskBoards"]);
  };

  const handleTaskStatusChange = async (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const newColumnId = parseInt(e.target.value);

    await updateTaskStatus(task.id, newColumnId);
    queryClient.invalidateQueries(["taskBoards"]);
  };

  const handleCloseCurrentModal = () => {
    editTaskModal.current?.close();
  };

  return (
    <>
      <dialog ref={editTaskModal} id="editTaskModal" className="modal">
        <div className="modal-box">
          <div className="flex justify-between items-center">
            <h2 className="font-bold ">
              <ThemeText>{task.title}</ThemeText>
            </h2>
            <EditTaskModal onOpen={handleCloseCurrentModal} task={task} />
          </div>
          <p className="py-4">{task.description}</p>
          <p className="my-3 text-sm">
            {task.subtasks.length > 0 &&
              `Subtasks (${
                task.subtasks.filter((sub) => sub.status).length
              } / ${task.subtasks.length})`}
          </p>
          <ul className="space-y-2">
            {task.subtasks.map((sub) => (
              <li
                className={`p-2 bg-secondary rounded-md ${
                  sub.status === true ? "line-through" : ""
                }`}
                key={sub.id}
              >
                <div className="form-control flex items-start space-x-4 ">
                  <label className="label cursor-pointer">
                    <input
                      type="checkbox"
                      className="checkbox checkbox-xs checkbox-primary rounded-sm"
                      checked={sub.status}
                      onChange={() => handleSubtaskStatusChange(sub.id)}
                    />
                    <p className="label-text ml-3">{sub.description}</p>
                  </label>
                </div>
              </li>
            ))}
          </ul>

          <label className="form-control w-full mt-3">
            <div className="label">
              <span className="label-text">Current Status</span>
            </div>
            <select
              className="select select-bordered"
              value={task.column.id.toString()}
              onChange={handleTaskStatusChange}
            >
              {activeBoard?.columns.map((col) => (
                <option key={col.id} value={col.id}>
                  {col.title}
                </option>
              ))}
            </select>
          </label>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>

      <div
        onClick={() => editTaskModal.current?.showModal()}
        className={`space-y-5 rounded-lg p-4 shadow-xl ${
          activeTheme === "myTheme" ? "bg-white" : "bg-neutral"
        }`}
      >
        <h3 className="font-bold text-md">
          <ThemeText>{task.title}</ThemeText>
        </h3>
        <p className="text-sm">
          {task.subtasks.length < 1
            ? "0 Subtasks"
            : `${task.subtasks.filter((sub) => sub.status).length}/${
                task.subtasks.length
              } Subtasks Completed`}
        </p>
      </div>
    </>
  );
};

const TaskBoard = ({ isSideBarVisible, onEdit }: TaskBoardProps) => {
  const { activeBoard } = useActiveTaskBoard();
  const { taskBoards } = useTaskBoards();
  const { activeTheme } = useTheme();
  const { status } = useSession();

  return (
    <div
      className={`bg-secondary gap-6 flex p-4 overflow-x-auto overflow-y-auto boardContainerHeight ${
        isSideBarVisible ? "boardContainerWidth" : "w-[100vw] md:pl-[5rem]"
      } ${
        (taskBoards && taskBoards.length < 1) ||
        (activeBoard && activeBoard?.columns.length < 1)
          ? "justify-center items-center"
          : ""
      }`}
    >
      {taskBoards && taskBoards.length < 1 ? (
        <p className="text-[#828FA3] text-lg text-center">
          You Currently have no boards. Create a new board to get started.
        </p>
      ) : activeBoard && activeBoard?.columns.length < 1 ? (
        <div className="flex flex-col justify-center gap-3">
          <p
            className="text-[#828FA3] text-lg text-center
          "
          >
            This board is empty. Create a new column to get started.
          </p>
          <button
            onClick={() => onEdit()}
            className="btn btn-primary max-w-full mx-auto"
          >
            +Add New Column
          </button>
        </div>
      ) : (
        <>
          {activeBoard?.columns.map((col) => (
            <ColumnComponent key={col.id} column={col} />
          ))}
          {status === "authenticated" && (
            <div
              onClick={() => onEdit()}
              className={`rounded min-w-[17.5rem] flex items-center justify-center font-bold text-xl text-[#828FA3] shadow hover:bg-base-300 hover:scale-[1.02] transition ${
                activeTheme === "myTheme" ? "bg-[#EEF2FE]" : "bg-base-200"
              }`}
            >
              <h3 className="tracking-wide uppercase font-extralight">
                +New Column
              </h3>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default TaskBoard;
