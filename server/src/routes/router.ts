import { Router } from "express";
import * as AuthController from "../controllers/auth.controller";
import * as AuthMiddleware from "../middlewares/auth.middleware";
import * as UserController from "../controllers/user.controller";
import * as ValidationMiddleware from "../middlewares/validation.middleware";
import { loginSchema, registerSchema } from "@/schemas/auth.schema";

const router = Router();

// Authentication APIs
router.post("/auth/users", ValidationMiddleware.validateRequest(registerSchema), AuthController.registerUser);
router.post("/auth/sessions", ValidationMiddleware.validateRequest(loginSchema), AuthController.loginUser);
router.delete("/auth/sessions/current", AuthMiddleware.authenticate, AuthController.logoutUser);

// Users
router.get("/users/me", AuthMiddleware.authenticate, UserController.getCurrentUser);

// // Videos
// router.get("/videos", authenticate, videoController.getVideos);
// router.get("/videos/:videoId", authenticate, videoController.getVideoById);
// router.patch("/videos/:videoId", authenticate, videoController.updateVideo);
// router.delete("/videos/:videoId", authenticate, videoController.deleteVideo);
// router.get("/videos/:videoId/thumbnail", authenticate, videoController.getVideoThumbnail);

// // Uploads
// router.post("/videos/uploads", authenticate, uploadController.initiateUpload);
// router.post("/videos/uploads/:uploadId/parts/:partNumber/upload-urls", authenticate, uploadController.getUploadPartUrl);
// router.post("/videos/uploads/:uploadId/completion", authenticate, uploadController.completeUpload);
// router.get("/videos/uploads/:uploadId", authenticate, uploadController.getUploadStatus);
// router.delete("/videos/uploads/:uploadId", authenticate, uploadController.abortUpload);

// // Processing jobs
// router.get("/processing-jobs", authenticate, authorizeAdmin, processingController.getProcessingJobs);
// router.get("/processing-jobs/:jobId", authenticate, authorizeAdmin, processingController.getProcessingJobById);
// router.get("/processing-jobs/:jobId/attempts", authenticate, authorizeAdmin, processingController.getJobAttempts);
// router.post("/processing-jobs/:jobId/retries", authenticate, authorizeAdmin, processingController.retryProcessingJob);
// router.get("/videos/:videoId/processing-jobs", authenticate, processingController.getVideoProcessingJobs);

// // Playback
// router.post("/videos/:videoId/playback-sessions", authenticate, playbackController.createPlaybackSession);
// router.post("/videos/:videoId/download-links", authenticate, playbackController.createDownloadLink);

// // Analytics
// router.post("/videos/:videoId/view-events", authenticate, analyticsController.recordVideoView);
// router.post("/videos/:videoId/download-events", authenticate, analyticsController.recordVideoDownload);

// // Dashboard
// router.get("/admin/dashboard/overview", authenticate, authorizeAdmin, dashboardController.getDashboardOverview);
// router.get("/admin/dashboard/upload-metrics", authenticate, authorizeAdmin, dashboardController.getUploadMetrics);
// router.get("/admin/dashboard/processing-metrics", authenticate, authorizeAdmin, dashboardController.getProcessingMetrics);
// router.get("/admin/dashboard/performance-metrics", authenticate, authorizeAdmin, dashboardController.getPerformanceMetrics);
// router.get("/admin/dashboard/engagement-metrics", authenticate, authorizeAdmin, dashboardController.getEngagementMetrics);

export default router;