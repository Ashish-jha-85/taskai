import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import {
  loginUserService,
  registerUserService,
} from "../services/auth.service.js";
import { generateToken } from "../utils/generateToken.js";

export const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  const user = await registerUserService({
    name,
    email,
    password,
  });

  const token = generateToken(user._id);

  return res.status(201).json(
    new ApiResponse(
      201,
      "User registered successfully",
      {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
        },
      }
    )
  );
});

export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await loginUserService({
    email,
    password,
  });

  const token = generateToken(user._id);

  return res.status(200).json(
    new ApiResponse(
      200,
      "Login successful",
      {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
        },
      }
    )
  );
});