import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import React, { useRef } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { RiCloseLine } from "react-icons/ri";
import { SlOptionsVertical } from "react-icons/sl";
import { z } from "zod";
import { Task } from "../types";
import { updateTaskSchema } from "../ValidationSchemas";
import useTheme from "../zustand/ThemeStore";
import ThemeText from "./ThemeText";
type EditModalProps = {
  task: Task;
  onOpen: () => void;
  deleteModalRef?: React.RefObject<HTMLDialogElement>;
};

type DeleteModalProps = Omit<EditModalProps, "onOpen">;

type UpdateTaskForm = z.infer<typeof updateTaskSchema>;

const EditTaskModal = ({ onOpen, task }: EditModalProps) => {
  const editModalRef = useRef<HTMLDialogElement>(null);
  const deleteTaskModal = useRef<HTMLDialogElement>(null);
  const { activeTheme } = useTheme();
  const queryClient = useQueryClient();

  const updateTask = async (data: UpdateTaskForm) => {
    console.log("API call with data:", data);
    const response = await axios.patch(
      `/api/tasks/${task.id.toString()}`,
      data
    );
    return response.data;
  };

  const mutation = useMutation(updateTask, {
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["taskBoards"],
      });
      reset(data);
      replace([]);
      editModalRef.current?.close();
    },
  });

  const existingSubtasks = task.subtasks.map(({ id, description }) => ({
    id,
    description,
  }));

  const { register, control, handleSubmit, reset } = useForm<UpdateTaskForm>({
    resolver: zodResolver(updateTaskSchema),
    defaultValues: {
      title: task.title,
      description: task.description,
      subtasks: existingSubtasks,
    },
  });

  const { fields, append, remove, replace } = useFieldArray({
    name: "subtasks",
    control,
  });

  const handleOpenEditForm = () => {
    onOpen();
    editModalRef.current?.showModal();
  };

  const handleOpenDeleteModal = () => [deleteTaskModal.current?.showModal()];

  const onSubmit = (data: UpdateTaskForm) => {
    console.log("Form data being submitted:", data);
    mutation.mutate(data);
  };

  return (
    <div>
      <details className="dropdown dropdown-end">
        <summary className="btn m-1 outline-none btn-ghost">
          <SlOptionsVertical />
        </summary>
        <ul
          className={`dropdown-content z-[1] menu p-2 shadow rounded w-52 text-left ${
            activeTheme === "myTheme" ? "bg-white" : "bg-neutral"
          }`}
        >
          <li
            onClick={handleOpenEditForm}
            className="hover:font-bold p-2 rounded-lg cursor-pointer"
          >
            Edit Task
          </li>
          <li
            onClick={handleOpenDeleteModal}
            className="text-red-500 hover:font-bold p-2 rounded-lg cursor-pointer"
          >
            Delete Task
          </li>
        </ul>
      </details>
      <DeleteTaskModal task={task} deleteModalRef={deleteTaskModal} />

      <dialog ref={editModalRef} id="editModalRef" className="modal">
        <div className="modal-box">
          <h2 className="font-bold">
            <ThemeText>{`Edit - ${task.title}`}</ThemeText>
          </h2>
          <form onSubmit={handleSubmit(onSubmit)}>
            <label className="form-control w-full mb-3">
              <div className="label">
                <span className="label-text">Title</span>
              </div>
              <input
                {...register("title")}
                type="text"
                placeholder="Type here"
                className="input input-bordered w-full"
              />
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
            </label>
            <div>
              {fields.map((field, index) => (
                <div key={field.id}>
                  <div className="flex items-end gap-3">
                    <label className="form-control w-full">
                      <div className="label">
                        <span className="label-text">Subtask</span>
                      </div>
                      <input
                        {...register(`subtasks.${index}.description` as const)}
                        type="text"
                        placeholder="e.g. Refactor"
                        className="input input-bordered w-full"
                      />
                    </label>
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="btn"
                    >
                      <RiCloseLine size="20" />
                    </button>
                  </div>
                </div>
              ))}
              <button
                type="button"
                className="btn btn-outline w-full my-3"
                onClick={() => append({ description: "" })}
              >
                Add Subtask
              </button>
              <div className="flex gap-3 mt-3">
                <button
                  type="button"
                  className="btn grow"
                  onClick={() => editModalRef.current?.close()}
                >
                  Cancel
                </button>
                <button className="btn grow btn-primary" type="submit">
                  Submit
                </button>
              </div>
            </div>
          </form>
        </div>
        <div
          className="modal-backdrop"
          onClick={() => editModalRef.current?.close()}
        ></div>
      </dialog>
    </div>
  );
};

const DeleteTaskModal = ({ deleteModalRef, task }: DeleteModalProps) => {
  const queryClient = useQueryClient();
  const handleCancel = () => {
    deleteModalRef?.current?.close();
  };
  const handleDelete = async (task: Task) => {
    await axios.delete(`api/tasks/${task.id.toString()}`);
  };
  const mutation = useMutation(() => handleDelete(task), {
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["taskBoards"],
      });
      handleCancel();
    },
  });

  return (
    <dialog ref={deleteModalRef} id="my_modal_2" className="modal">
      <div className="modal-box">
        <h3 className="font-bold text-lg">
          <ThemeText>Delete this task?</ThemeText>
        </h3>
        <p className="py-4">{`Are you sure you want to delete the "${task?.title}"? This action cannot be reversed.`}</p>
        <div className="flex gap-3">
          <button className="btn grow" onClick={handleCancel}>
            Cancel
          </button>
          <button
            onClick={() => mutation.mutate()}
            className="btn btn-error grow"
          >
            Delete
          </button>
        </div>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button>close</button>
      </form>
    </dialog>
  );
};

export default EditTaskModal;
