import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";

import authRoutes from "./routes/auth.routes.js";
import taskRoutes from "./routes/task.routes.js";
import { connection } from "./queue/queue.connection.js";

import { errorHandler } from "./middleware/error.middleware.js";
import { notFound } from "./middleware/notFound.middleware.js";

dotenv.config();

const app = express();

// Security Middleware

app.use(helmet());

app.use(cors());

app.use(express.json());

app.use(cookieParser());

app.use(morgan("dev"));

// Rate Limiting

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests",
});

app.use(limiter);

// Health Check

app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server healthy",
  });
});

app.get("/redis-health", async (req, res) => {
  try {
    const pong = await connection.ping();

    res.json({
      success: true,
      redis: pong,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Routes

app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);

// Not Found

app.use(notFound);

// Error Handler

app.use(errorHandler);

export default app;