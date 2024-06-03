import { ReactNode } from "react";
import useTheme from "../zustand/ThemeStore";

interface Props {
  children: ReactNode;
}

const ThemeText = ({ children }: Props) => {
  const { activeTheme } = useTheme();
  return (
    <span
      className={`${
        activeTheme === "myTheme" ? "text-[#2b2c34]" : "text-white"
      }`}
    >
      {children}
    </span>
  );
};

export default ThemeText;
