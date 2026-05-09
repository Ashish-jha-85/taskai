import { Queue } from "bullmq";
import { connection } from "./queue.connection.js";

export const taskQueue = new Queue(
  "task-processing",
  {
    connection,
    defaultJobOptions: {
      attempts: 3,
      backoff: {
        type: "exponential",
        delay: 2000,
      },
      removeOnComplete: 100,
      removeOnFail: 500,
    },
  }
);
