import { Task } from "../models/task.model.js";
import { taskQueue } from "../queue/task.queue.js";
import { ApiError } from "../utils/ApiError.js";

export const createTaskService = async ({
  title,
  input,
  operation,
  userId,
}) => {
  const task = await Task.create({
    title,
    input,
    operation,
    userId,
    status: "pending",
  });

  // Push task to queue
  await taskQueue.add("process-task", {
    taskId: task._id.toString(),
  });

  return task;
};

export const getTasksService = async (userId) => {
  return await Task.find({ userId }).sort({
    createdAt: -1,
  });
};

export const getSingleTaskService = async (
  taskId,
  userId
) => {
  return await Task.findOne({
    _id: taskId,
    userId,
  });
};

export const updateTaskService = async (
  taskId,
  userId,
  { title, input, operation }
) => {
  const task = await Task.findOne({
    _id: taskId,
    userId,
  });

  if (!task) {
    throw new ApiError(404, "Task not found");
  }

  if (
    task.status === "pending" ||
    task.status === "running"
  ) {
    throw new ApiError(
      409,
      "Processing tasks cannot be edited"
    );
  }

  task.title = title;
  task.input = input;
  task.operation = operation;
  task.status = "pending";
  task.result = null;
  task.logs = [
    {
      message: "Task updated and queued again",
    },
  ];

  await task.save();

  await taskQueue.add("process-task", {
    taskId: task._id.toString(),
  });

  return task;
};

export const deleteTaskService = async (
  taskId,
  userId
) => {
  const task = await Task.findOne({
    _id: taskId,
    userId,
  });

  if (!task) {
    throw new ApiError(404, "Task not found");
  }

  if (
    task.status === "pending" ||
    task.status === "running"
  ) {
    throw new ApiError(
      409,
      "Processing tasks cannot be deleted"
    );
  }

  await task.deleteOne();

  return task;
};
