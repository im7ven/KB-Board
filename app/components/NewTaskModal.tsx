import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useSession } from "next-auth/react";
import { useEffect, useRef } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { RiAddLine, RiCloseLine } from "react-icons/ri";
import { z } from "zod";
import useTaskBoards from "../hooks/useTaskBoards";
import { createTaskSchema } from "../ValidationSchemas";
import useActiveTaskBoard from "../zustand/store";
import BoardOption from "./BoardOption";
import ThemeText from "./ThemeText";
import ValidationError from "./ValidationError";

type TaskForm = z.infer<typeof createTaskSchema>;

const NewTaskModal = ({ onEdit }: { onEdit: () => void }) => {
  const newTaskModal = useRef<HTMLDialogElement>(null);
  const { activeBoard, setActiveBoard } = useActiveTaskBoard();
  const { taskBoards } = useTaskBoards();
  const queryClient = useQueryClient();
  const { status } = useSession();

  const {
    register,
    handleSubmit,
    reset,
    clearErrors,
    control,
    formState: { errors },
  } = useForm<TaskForm>({
    resolver: zodResolver(createTaskSchema),
    defaultValues: {
      columnId: activeBoard?.columns?.[0]?.id?.toString(),
    },
  });

  const { fields, append, remove, replace } = useFieldArray({
    name: "subtasks",
    control,
  });

  useEffect(() => {
    reset({
      columnId: activeBoard?.columns?.[0]?.id.toString(),
    });
  }, [activeBoard, reset]);

  const { mutate: createTask } = useMutation<void, unknown, TaskForm>(
    async (newTaskData: TaskForm) => {
      await axios.post("/api/tasks", newTaskData);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ["taskBoards"],
        });
        reset();
        replace([]);
        newTaskModal.current?.close();
      },
    }
  );

  const onSubmit = (data: TaskForm) => {
    createTask(data);
  };

  const handleCancel = () => {
    newTaskModal.current?.close();
    clearErrors("title");
    reset();
    replace([]);
  };

  return (
    <div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => newTaskModal.current?.showModal()}
          disabled={
            (taskBoards && taskBoards.length < 1) ||
            status === "unauthenticated" ||
            (activeBoard !== null && activeBoard.columns.length < 1)
              ? true
              : false
          }
          className="btn btn-primary btn-sm md:btn-md"
        >
          <span className="hidden md:block">+Add Task</span>
          <span className="md:hidden">
            <RiAddLine size="20" />
          </span>
        </button>
        <BoardOption onEdit={onEdit} />
      </div>
      <dialog ref={newTaskModal} id="newTaskModal" className="modal">
        <div className="modal-box">
          <form onSubmit={handleSubmit(onSubmit)}>
            <h2 className="font-bold mb-3">
              <ThemeText>Add New Task</ThemeText>
            </h2>

            <label className="form-control w-full mb-3">
              <div className="label">
                <span className="label-text">Title</span>
              </div>
              <input
                {...register("title")}
                type="text"
                placeholder="e.g. Take a 15 minute break"
                className="input input-bordered"
              />
              {errors.title?.message && (
                <ValidationError errorMessage={errors.title.message} />
              )}
            </label>
            <label className="form-control mb-6">
              <div className="label">
                <span className="label-text">Description</span>
              </div>
              <textarea
                {...register("description")}
                className="textarea textarea-bordered h-24"
                placeholder="e.g. It is always a good idea to take a break to refresh the body and mind"
              ></textarea>
              {errors.description?.message && (
                <ValidationError errorMessage={errors.description.message} />
              )}
            </label>

            {fields.map((field, index) => {
              return (
                <div key={field.id}>
                  <div className="flex items-end gap-3">
                    <label className="form-control w-full">
                      <div className="label">
                        <span className="label-text">Column</span>
                      </div>
                      <input
                        {...register(`subtasks.${index}.title` as const)}
                        type="text"
                        placeholder="e.g. Refactor"
                        className="input input-bordered w-full "
                      />
                    </label>

                    <button onClick={() => remove(index)} className="btn">
                      <RiCloseLine size="20" />
                    </button>
                  </div>
                  {errors.subtasks?.[index]?.title?.message && (
                    <ValidationError
                      errorMessage={
                        errors.subtasks[index]?.title?.message || ""
                      }
                    />
                  )}
                </div>
              );
            })}

            <button
              type="button"
              className="btn btn-outline w-full my-3"
              onClick={() =>
                append({
                  title: "",
                })
              }
            >
              Add Subtask
            </button>

            <label className="form-control w-full mb-3">
              <div className="label">
                <span className="label-text">Status</span>
              </div>
              <select
                {...register("columnId")}
                className="select select-bordered"
              >
                {activeBoard?.columns.map((col) => (
                  <option value={col.id} key={col.id}>
                    {col.title}
                  </option>
                ))}
              </select>
            </label>
            <div className="flex space-x-3">
              <button
                onClick={handleCancel}
                type="button"
                className="btn btn-danger grow "
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary grow">
                Submit Task
              </button>
            </div>
          </form>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>
    </div>
  );
};

export default NewTaskModal;
