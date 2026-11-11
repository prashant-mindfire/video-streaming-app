import * as ProcessingJobController from "@/controllers/processing-job.controller";
import { loginSchema, registerSchema } from "@/schemas/auth.schema";
import { retryJobParamsSchema } from "@/schemas/processing-job.schema";
import { completeUploadSchema, generatePartUrlsSchema, initiateUploadSchema } from "@/schemas/upload.schema";
import { Router } from "express";
import * as AuthController from "../controllers/auth.controller";
import * as UploadController from "../controllers/upload.controller";
import * as UserController from "../controllers/user.controller";
import * as AuthMiddleware from "../middlewares/auth.middleware";
import * as ValidationMiddleware from "../middlewares/validation.middleware";

const router = Router();

// Authentication APIs
router.post("/auth/users", ValidationMiddleware.validateRequest(registerSchema), AuthController.registerUser);
router.post("/auth/sessions", ValidationMiddleware.validateRequest(loginSchema), AuthController.loginUser);
router.delete("/auth/sessions/current", AuthMiddleware.authenticate, AuthController.logoutUser);

// Users
router.get("/users/me", AuthMiddleware.authenticate, UserController.getCurrentUser);

// // Uploads
router.post("/videos/uploads", [AuthMiddleware.authenticate, ValidationMiddleware.validateRequest(initiateUploadSchema)], UploadController.initiateUpload);
router.post("/uploads/:uploadId/parts/upload-urls", [AuthMiddleware.authenticate, ValidationMiddleware.validateRequest(generatePartUrlsSchema)], UploadController.generatePartUploadUrls);
router.post("/videos/uploads/:uploadId/completion", [AuthMiddleware.authenticate, ValidationMiddleware.validateRequest(completeUploadSchema)], UploadController.completeUpload);
// router.get("/videos/uploads/:uploadId", authenticate, uploadController.getUploadStatus);

// // Videos
// router.get("/videos", authenticate, videoController.getVideos);
// router.get("/videos/:videoId", authenticate, videoController.getVideoById); 
// router.delete("/videos/:videoId", authenticate, videoController.deleteVideo);
// router.get("/videos/:videoId/processing-status", authenticate, videoController.getVideoProcessingStatus);
// router.post("/videos/:videoId/playback-sessions", authenticate, videoController.createPlaybackSession);
// router.post("/videos/:videoId/download-links", authenticate, videoController.createDownloadLink);
// router.delete("/videos/uploads/:uploadId", authenticate, videoController.abortUpload);

// Retry processing job
router.post("/processing-jobs/:jobId/retries", [AuthMiddleware.authenticate, ValidationMiddleware.validateRequest(retryJobParamsSchema)], ProcessingJobController.retryProcessingJob);

// // Dashboard
// router.get("/admin/dashboard/overview", authenticate, authorizeAdmin, dashboardController.getDashboardOverview);

export default router;
