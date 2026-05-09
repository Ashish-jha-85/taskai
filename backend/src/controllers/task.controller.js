import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import {
  createTaskService,
  deleteTaskService,
  getSingleTaskService,
  getTasksService,
  updateTaskService,
} from "../services/task.service.js";

export const createTask = asyncHandler(async (
  req,
  res
) => {
  const { title, input, operation } = req.body;

  const task = await createTaskService({
    title,
    input,
    operation,
    userId: req.user._id,
  });

  return res.status(201).json(
    new ApiResponse(
      201,
      "Task created successfully",
      task
    )
  );
});

export const getTasks = asyncHandler(async (
  req,
  res
) => {
  const tasks = await getTasksService(req.user._id);

  return res.status(200).json(
    new ApiResponse(200, "Tasks fetched", tasks)
  );
});

export const getSingleTask = asyncHandler(async (
  req,
  res
) => {
  const task = await getSingleTaskService(
    req.params.id,
    req.user._id
  );

  return res.status(200).json(
      new ApiResponse(200, "Task fetched", task)
  );
});

export const updateTask = asyncHandler(async (
  req,
  res
) => {
  const { title, input, operation } = req.body;

  const task = await updateTaskService(
    req.params.id,
    req.user._id,
    {
      title,
      input,
      operation,
    }
  );

  return res.status(200).json(
    new ApiResponse(
      200,
      "Task updated successfully",
      task
    )
  );
});

export const deleteTask = asyncHandler(async (
  req,
  res
) => {
  const task = await deleteTaskService(
    req.params.id,
    req.user._id
  );

  return res.status(200).json(
    new ApiResponse(
      200,
      "Task deleted successfully",
      task
    )
  );
});
