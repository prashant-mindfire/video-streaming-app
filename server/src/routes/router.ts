import * as DashboardController from "@/controllers/dashboard.controller";
import * as ProcessingJobController from "@/controllers/processing-job.controller";
import * as VideoController from "@/controllers/video.controller";
import * as RoleMiddleware from "@/middlewares/role.middleware";
import { loginSchema, registerSchema } from "@/schemas/auth.schema";
import { retryJobParamsSchema } from "@/schemas/processing-job.schema";
import { completeUploadSchema, generatePartUrlsSchema, getUploadParamsSchema, initiateUploadSchema } from "@/schemas/upload.schema";
import { getVideoParamsSchema, listVideosSchema } from "@/schemas/video.schema";
import { UserRole } from "@/types/user";
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

// Uploads
router.post("/videos/uploads", [AuthMiddleware.authenticate, ValidationMiddleware.validateRequest(initiateUploadSchema)], UploadController.initiateUpload);
router.post("/uploads/:uploadId/parts/upload-urls", [AuthMiddleware.authenticate, ValidationMiddleware.validateRequest(generatePartUrlsSchema)], UploadController.generatePartUploadUrls);
router.post("/videos/uploads/:uploadId/completion", [AuthMiddleware.authenticate, ValidationMiddleware.validateRequest(completeUploadSchema)], UploadController.completeUpload);
router.get("/videos/uploads/:uploadId", [AuthMiddleware.authenticate, ValidationMiddleware.validateRequest(getUploadParamsSchema)], UploadController.getUpload);

// Retry processing job
router.post("/processing-jobs/:jobId/retries", [AuthMiddleware.authenticate, RoleMiddleware.authorizeRoles(UserRole.ADMIN), ValidationMiddleware.validateRequest(retryJobParamsSchema)], ProcessingJobController.retryProcessingJob);

// Videos
router.get("/videos", [AuthMiddleware.authenticate, ValidationMiddleware.validateRequest(listVideosSchema)], VideoController.getVideos);
router.get("/videos/:videoId", [AuthMiddleware.authenticate, ValidationMiddleware.validateRequest(getVideoParamsSchema)], VideoController.getVideo);
router.delete("/videos/:videoId", [AuthMiddleware.authenticate, ValidationMiddleware.validateRequest(getVideoParamsSchema)], VideoController.deleteVideo);
router.get("/videos/:videoId/processing-status", [AuthMiddleware.authenticate, ValidationMiddleware.validateRequest(getVideoParamsSchema)], VideoController.getVideoProcessingStatus);
router.post("/videos/:videoId/playback-sessions", [AuthMiddleware.authenticate, ValidationMiddleware.validateRequest(getVideoParamsSchema)], VideoController.createPlaybackSession);
router.get("/videos/:videoId/download-links", [AuthMiddleware.authenticate, ValidationMiddleware.validateRequest(getVideoParamsSchema)], VideoController.getVideoDownloadLink);
// router.delete("/videos/uploads/:uploadId", authenticate, videoController.abortUpload);


// Dashboard
router.get("/admin/dashboard/overview", [AuthMiddleware.authenticate, RoleMiddleware.authorizeRoles(UserRole.ADMIN)], DashboardController.getDashboardOverview);

export default router;
