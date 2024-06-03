import Image from "next/image";
import { useEffect, useState } from "react";
import { AiOutlineEye } from "react-icons/ai";
import TaskBoardMenu from "./TaskBoardMenu";
import ThemeText from "./ThemeText";

interface Props {
  sidebar: boolean;
  onShowSideBar: () => void;
}

const Sidebar = ({ sidebar, onShowSideBar }: Props) => {
  const [isSmallScreen, setIsSmallScreen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsSmallScreen(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (isSmallScreen) {
    return null;
  }

  return (
    <>
      {sidebar ? (
        <>
          <div className="hidden md:flex flex-col pr-5 py-4 border-r-[1px] border-zinc-600">
            <div className="gap-4 px-3 md:w-[17rem] lg:w-[19rem] hidden md:flex">
              <Image
                src="/taskmanager-logo.png"
                width="60"
                height="60"
                alt="logo"
                className="w-auto h-auto"
              />
              <h1 className=" font-bold text-white text-2xl self-center">
                <ThemeText>KANBAN</ThemeText>
              </h1>
            </div>
            <TaskBoardMenu onShowSideBar={onShowSideBar} />
          </div>
        </>
      ) : (
        <button
          onClick={onShowSideBar}
          className=" hidden md:flex bg-primary h-[3rem] rounded-r-full w-[4rem] absolute left-0 bottom-[3.2rem]  justify-center items-center"
        >
          <AiOutlineEye color="#fff" size="20px" />
        </button>
      )}
    </>
  );
};

export default Sidebar;
