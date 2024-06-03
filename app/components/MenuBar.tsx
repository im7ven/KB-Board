"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { RiArrowDropDownLine } from "react-icons/ri";
import useActiveTaskBoard from "../zustand/store";
import useTheme from "../zustand/ThemeStore";
import NewTaskModal from "./NewTaskModal";
import TaskBoardMenu from "./TaskBoardMenu";
import ThemeText from "./ThemeText";

type Status = "authenticated" | "loading" | "unauthenticated";

const MenuBar = ({ onEdit }: { onEdit: () => void }) => {
  const { activeBoard } = useActiveTaskBoard();
  return (
    <div className=" max-w-[100vw] grow flex justify-between items-center px-2 md:px-6 min-h-[4rem]  md:min-h-[5rem] lg:h-[6rem] border-b-[1px] border-zinc-600">
      <div className="flex items-center gap-1">
        <MenuDropDown />
        <h2 className="md:text-xl font-bold">
          <ThemeText>
            {activeBoard ? activeBoard.title : "No Active Board"}
          </ThemeText>
        </h2>
      </div>
      <NewTaskModal onEdit={onEdit} />
      <AuthStatus />
    </div>
  );
};

const MenuDropDown = () => {
  const { activeTheme } = useTheme();
  return (
    <div className=" md:hidden dropdown dropdown-bottom">
      <div tabIndex={0} role="button">
        <RiArrowDropDownLine size="30" />
      </div>
      <div
        tabIndex={0}
        className={`dropdown-content z-[1] w-[18rem] p-2 shadow rounded-lg  ${
          activeTheme === "myTheme" ? "bg-white" : "bg-neutral"
        }`}
      >
        <TaskBoardMenu />
      </div>
    </div>
  );
};

const AuthStatus = () => {
  const { status, data: session } = useSession();
  const { activeTheme } = useTheme();

  if (status === "unauthenticated") {
    return (
      <Link href="/api/auth/signin" className="btn btn-primary">
        Login
      </Link>
    );
  }

  return (
    <div>
      <div className="dropdown dropdown-bottom dropdown-end">
        <div tabIndex={0} role="button">
          <div className="avatar">
            <div className="w-12 rounded-full">
              <img
                alt="User avatar"
                referrerPolicy="no-referrer"
                src={session?.user?.image!}
              />
            </div>
          </div>
        </div>
        <ul
          tabIndex={0}
          className={`dropdown-content z-[1] menu p-2 shadow  rounded-box w-72 ${
            activeTheme === "myTheme" ? "bg-white" : "bg-neutral"
          }`}
        >
          <li className="px-1 font-semibold">{session?.user?.name}</li>
          <li className="p-1">{session?.user?.email}</li>
          <li className="bg-accent text-white rounded-lg">
            <Link
              href="/api/auth/signout"
              className="block w-full text-center py-2"
            >
              Logout
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default MenuBar;
