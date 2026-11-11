/**
 * @openapi
 * /processing-jobs/{jobId}/retries:
 *   post:
 *     summary: Retry a processing job
 *     tags: [Processing Jobs]
 *     security:
 *       - sessionCookie: []
 *     parameters:
 *       - name: jobId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       '202':
 *         description: Processing job queued for retry
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required: [status, message, data]
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 202
 *                 message:
 *                   type: string
 *                   example: Video processing started again
 *                 data:
 *                   type: object
 *                   required: [data]
 *                   properties:
 *                     data:
 *                       type: object
 *                       required: [jobId, videoId, status, message]
 *                       properties:
 *                         jobId:
 *                           type: string
 *                           format: uuid
 *                         videoId:
 *                           type: string
 *                           format: uuid
 *                         status:
 *                           type: string
 *                           example: queued
 *                         message:
 *                           type: string
 *                           example: Processing job queued for retry
 *       '400':
 *         description: Invalid job ID
 *       '401':
 *         description: Authentication required or session invalid
 *       '404':
 *         description: Processing job not found
 *       '409':
 *         description: Processing job status does not allow retry
 */