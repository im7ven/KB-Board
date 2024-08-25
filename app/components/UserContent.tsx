"use client";

import { useSession } from "next-auth/react";
import { useRef, useState } from "react";
import EditTaskBoardModal from "./EditTaskBoardModal";
import MenuBar from "./MenuBar";
import Sidebar from "./Sidebar";
import TaskBoard from "./TaskBoard";
import useTaskBoards from "../hooks/useTaskBoards";

const UserContent = () => {
  const [showSideBar, setShowSideBar] = useState(true);
  const { isLoading } = useTaskBoards();

  const handleShowSideBar = () => {
    setShowSideBar(!showSideBar);
  };

  const editModalRef = useRef<HTMLDialogElement>(null);

  const handleOpenEditModal = () => {
    editModalRef.current?.showModal();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <span className="loading loading-bars loading-lg"></span>
      </div>
    );
  }

  return (
    <div className="flex ">
      <Sidebar sidebar={showSideBar} onShowSideBar={handleShowSideBar} />
      <div className={`flex-1 ${showSideBar ? "" : "col-span-2"}`}>
        <EditTaskBoardModal editModalRef={editModalRef} />
        <MenuBar onEdit={handleOpenEditModal} />
        <TaskBoard
          onEdit={handleOpenEditModal}
          isSideBarVisible={showSideBar}
        />
      </div>
    </div>
  );
};

export default UserContent;
