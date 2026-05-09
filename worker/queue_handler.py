import json
import time

from bson import ObjectId

from db import tasks_collection
from processor import process_task
from redis_client import redis_client
from logger import logger

QUEUE_NAME = "bull:task-processing:wait"

FAILED_QUEUE = "bull:task-processing:failed"

MAX_RETRIES = 3


def move_to_dead_letter(job_id, reason):

    redis_client.rpush(
        FAILED_QUEUE,
        json.dumps({
            "jobId": job_id,
            "reason": reason
        })
    )


def process_job(job_id):

    job_key = f"bull:task-processing:{job_id}"

    job_data = redis_client.hgetall(job_key)

    if not job_data:
        raise Exception("Job data not found")

    data = json.loads(job_data["data"])

    task_id = data["taskId"]

    logger.info(f"Processing Task: {task_id}")

    task = tasks_collection.find_one({
        "_id": ObjectId(task_id)
    })

    if not task:
        raise Exception("Task not found")

    # Update running

    tasks_collection.update_one(
        {"_id": ObjectId(task_id)},
        {
            "$set": {
                "status": "running"
            },
            "$push": {
                "logs": {
                    "message": "Task started"
                }
            }
        }
    )

    # Process task

    result = process_task(
        task["operation"],
        task["input"]
    )

    # Save success result

    tasks_collection.update_one(
        {"_id": ObjectId(task_id)},
        {
            "$set": {
                "status": "success",
                "result": result
            },
            "$push": {
                "logs": {
                    "message": "Task completed"
                }
            }
        }
    )

    logger.info(f"Task Completed: {task_id}")


def worker_loop():

    logger.info("Worker started...")

    while True:

        try:

            # Better polling using BRPOP

            job = redis_client.brpop(
                QUEUE_NAME,
                timeout=5
            )

            if not job:
                continue

            _, job_id = job

            retries = 0

            while retries < MAX_RETRIES:

                try:

                    process_job(job_id)

                    break

                except Exception as error:

                    retries += 1

                    logger.error(
                        f"Retry {retries} failed for {job_id}: {str(error)}"
                    )

                    time.sleep(2)

                    if retries >= MAX_RETRIES:

                        logger.error(
                            f"Moved to dead-letter queue: {job_id}"
                        )

                        move_to_dead_letter(
                            job_id,
                            str(error)
                        )

        except Exception as error:

            logger.error(str(error))
