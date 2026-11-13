/**
 * @openapi
 * /admin/dashboard/overview:
 *   get:
 *     summary: Get the admin dashboard overview
 *     tags: [Dashboard]
 *     security:
 *       - sessionCookie: []
 *     responses:
 *       '200':
 *         description: Dashboard overview fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required: [status, message, data]
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: Dashboard overview fetched successfully
 *                 data:
 *                   type: object
 *                   required: [videos, uploads, processingJobs, storage, engagement, averageProcessingTimeSeconds]
 *                   properties:
 *                     videos:
 *                       type: object
 *                       required: [total, ready, processing, failed]
 *                       properties:
 *                         total:
 *                           type: integer
 *                           format: int64
 *                         ready:
 *                           type: integer
 *                           format: int64
 *                         processing:
 *                           type: integer
 *                           format: int64
 *                         failed:
 *                           type: integer
 *                           format: int64
 *                     uploads:
 *                       type: object
 *                       required: [total]
 *                       properties:
 *                         total:
 *                           type: integer
 *                           format: int64
 *                     processingJobs:
 *                       type: object
 *                       required: [queued, running, failed]
 *                       properties:
 *                         queued:
 *                           type: integer
 *                           format: int64
 *                         running:
 *                           type: integer
 *                           format: int64
 *                         failed:
 *                           type: integer
 *                           format: int64
 *                     storage:
 *                       type: object
 *                       required: [totalBytes]
 *                       properties:
 *                         totalBytes:
 *                           type: integer
 *                           format: int64
 *                           description: Total storage used in bytes by original videos and processed variants.
 *                     engagement:
 *                       type: object
 *                       required: [totalViews, totalDownloads]
 *                       properties:
 *                         totalViews:
 *                           type: integer
 *                           format: int64
 *                         totalDownloads:
 *                           type: integer
 *                           format: int64
 *                     averageProcessingTimeSeconds:
 *                       type: number
 *                       format: double
 *       '401':
 *         description: Authentication required or session invalid
 *       '403':
 *         description: Admin role required
 *       '400':
 *         description: No dashboard data found
 */
