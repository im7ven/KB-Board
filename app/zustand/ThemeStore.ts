import { create } from "zustand";

interface ThemeStore {
  activeTheme: string;
  setTheme: (theme: string) => void;
}

const useTheme = create<ThemeStore>((set) => ({
  activeTheme:
    typeof window !== "undefined"
      ? localStorage.getItem("theme") || "dark"
      : "dark",
  setTheme: (theme: string) => {
    set({ activeTheme: theme });
    if (typeof window !== "undefined") {
      localStorage.setItem("theme", theme);
    }
  },
}));

export default useTheme;
