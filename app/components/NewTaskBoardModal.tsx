"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useRef } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { RiCloseLine } from "react-icons/ri";
import { z } from "zod";
import { createTaskBoardSchema } from "../ValidationSchemas";
import ThemeText from "./ThemeText";
import ValidationError from "./ValidationError";

type TaskBoardForm = z.infer<typeof createTaskBoardSchema>;

const NewTaskBoardModal = () => {
  const newTaskBoardModal = useRef<HTMLDialogElement>(null);
  const queryClient = useQueryClient();
  const { mutate: createTaskBoard } = useMutation(
    (newTaskBoardData: { title: string; columns?: { title: string }[] }) =>
      axios.post("/api/task-boards", newTaskBoardData)
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    clearErrors,
    control,
  } = useForm<TaskBoardForm>({
    resolver: zodResolver(createTaskBoardSchema),
  });

  const { fields, remove, append, replace } = useFieldArray({
    name: "columns",
    control,
  });

  const handleCancel = () => {
    newTaskBoardModal.current?.close();
    clearErrors("title");
    reset();
    replace([]);
  };

  const onSubmit = (data: TaskBoardForm) => {
    createTaskBoard(data, {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ["taskBoards"],
        });
        reset();
        replace([]);
        newTaskBoardModal.current?.close();
      },
    });
  };

  return (
    <>
      <div
        onClick={() => newTaskBoardModal.current?.showModal()}
        className="flex items-center gap-1 ml-3 mt-2"
      >
        <a className="link link-hover link-accent font-semibold">
          +Create New Board
        </a>
      </div>
      <dialog ref={newTaskBoardModal} id="newTaskBoardModal" className="modal">
        <div className="modal-box">
          <h2 className="mb-3 font-bold">
            <ThemeText>Create Task Board</ThemeText>
          </h2>
          <form onSubmit={handleSubmit(onSubmit)}>
            <label className="input input-bordered flex items-center gap-2">
              Title
              <input {...register("title")} type="text" className="grow" />
            </label>
            {errors.title && (
              <ValidationError errorMessage={errors.title.message!} />
            )}

            {fields.map((field, index) => {
              return (
                <div key={field.id}>
                  <div className="flex items-end gap-3">
                    <label className="form-control w-full">
                      <div className="label">
                        <span className="label-text">Column</span>
                      </div>
                      <input
                        {...register(`columns.${index}.title` as const)}
                        type="text"
                        placeholder="e.g. Refactor"
                        className="input input-bordered w-full "
                      />
                    </label>

                    <button onClick={() => remove(index)} className="btn">
                      <RiCloseLine size="20" />
                    </button>
                  </div>
                  {errors.columns?.[index]?.title?.message && (
                    <ValidationError
                      errorMessage={errors.columns[index]?.title?.message || ""}
                    />
                  )}
                </div>
              );
            })}

            <div className="mt-3 space-y-3">
              <button
                type="button"
                onClick={() => append({ title: "" })}
                className="btn btn-block btn-outline"
              >
                Add New Column
              </button>
              <div className="flex space-x-3">
                <button
                  onClick={handleCancel}
                  type="button"
                  className="btn btn-danger grow "
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary grow">
                  Submit Task Board
                </button>
              </div>
            </div>
          </form>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>
    </>
  );
};

export default NewTaskBoardModal;
