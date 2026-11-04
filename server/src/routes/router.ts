import { Router } from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
} from "../controllers/auth.controller";

import { authenticate } from "../middlewares/auth.middleware";

const router = Router();

// Authentication APIs
router.post("/auth/users", registerUser);
router.post("/auth/sessions", loginUser);
router.delete("/auth/sessions/current", authenticate, logoutUser);

export default router;