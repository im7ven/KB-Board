import { Metadata } from "next";
import UserContent from "./components/UserContent";

export default function Home() {
  return (
    <main className="h-screen md:overflow-hidden ">
      <UserContent />
    </main>
  );
}

export const metadata: Metadata = {
  title: "Kanban Board",
  description:
    "Task manager for tracking and updating tasks in an organized and user-friendly environment.",
};
