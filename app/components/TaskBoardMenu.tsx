import { AiOutlineEyeInvisible } from "react-icons/ai";
import { CgBoard } from "react-icons/cg";
import useTaskBoards from "../hooks/useTaskBoards";
import useActiveTaskBoard from "../zustand/store";
import NewTaskBoardModal from "./NewTaskBoardModal";
import ThemeToggle from "./ThemeToggle";

const TaskBoardMenu = ({ onShowSideBar }: { onShowSideBar?: () => void }) => {
  const { isError, isLoading, taskBoards, authenticated } = useTaskBoards();
  const { setActiveBoard, activeBoard } = useActiveTaskBoard();
  if (authenticated === null) {
    return <div className="ml-3 loading loading-spinner text-secondary"></div>;
  }

  if (authenticated === false) {
    return (
      <p className="mt-3 text-center font-semibold">
        Please sign in to view taskBoards
      </p>
    );
  }

  return (
    <div className="flex flex-col md:flex-1 md:mt-7">
      <div className="md:flex-1">
        <h2 className="mb-3 ml-3 font-bold text-[#828FA3]">
          All Boards ({taskBoards?.length})
        </h2>

        <ul>
          {isLoading && (
            <span className="ml-3 loading loading-spinner text-secondary"></span>
          )}
          {isError ? (
            <p className="text-warning ml-3">
              Sorry an unexpected error has occurred.
            </p>
          ) : (
            taskBoards?.map((board) => (
              <li
                className={`rounded-r-full py-3 cursor-pointer ${
                  board === activeBoard ? "bg-primary text-white" : ""
                }${board === activeBoard ? "" : " hover:bg-base-200"}`}
                key={board.id}
                onClick={() => setActiveBoard(board)}
              >
                <button className="flex items-center ml-3 gap-1">
                  <CgBoard size="20" />
                  {board.title}
                </button>
              </li>
            ))
          )}
        </ul>
        <NewTaskBoardModal />
      </div>

      <div className="flex justify-center mb-2">
        <ThemeToggle />
      </div>

      <button
        onClick={onShowSideBar}
        className="items-align hidden md:flex btn ml-3"
      >
        <AiOutlineEyeInvisible />
        Hide Side Bar
      </button>
    </div>
  );
};

export default TaskBoardMenu;
