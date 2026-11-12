/**
 * @openapi
 * /videos:
 *   get:
 *     summary: List the current user's videos
 *     tags: [Videos]
 *     security:
 *       - sessionCookie: []
 *     parameters:
 *       - name: page
 *         in: query
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *       - name: limit
 *         in: query
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *       - name: search
 *         in: query
 *         description: Search video titles and descriptions.
 *         schema:
 *           type: string
 *       - name: status
 *         in: query
 *         schema:
 *           type: string
 *           enum: [queued, processing, ready, failed]
 *       - name: sortBy
 *         in: query
 *         schema:
 *           type: string
 *           enum: [created_at, title, file_size]
 *           default: created_at
 *       - name: sortOrder
 *         in: query
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *     responses:
 *       '200':
 *         description: Videos fetched successfully
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
 *                   example: Videos fetched successfully
 *                 data:
 *                   type: object
 *                   required: [videos, page, limit, total, totalPages]
 *                   properties:
 *                     videos:
 *                       type: array
 *                       items:
 *                         type: object
 *                         required: [id, title, fileSize, status, createdAt]
 *                         properties:
 *                           id:
 *                             type: string
 *                             format: uuid
 *                           title:
 *                             type: string
 *                           description:
 *                             type: string
 *                             nullable: true
 *                           thumbnailObjectKey:
 *                             type: string
 *                             nullable: true
 *                           durationSeconds:
 *                             type: number
 *                             nullable: true
 *                           width:
 *                             type: integer
 *                             nullable: true
 *                           height:
 *                             type: integer
 *                             nullable: true
 *                           codec:
 *                             type: string
 *                             nullable: true
 *                           fileSize:
 *                             type: integer
 *                             format: int64
 *                           status:
 *                             type: string
 *                             enum: [queued, processing, ready, failed]
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     total:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *       '401':
 *         description: Authentication required or session invalid
 */

/**
 * @openapi
 * /videos/{videoId}:
 *   get:
 *     summary: Get a video
 *     tags: [Videos]
 *     security:
 *       - sessionCookie: []
 *     parameters:
 *       - name: videoId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       '200':
 *         description: Video fetched successfully
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
 *                   example: Video fetched successfully
 *                 data:
 *                   type: object
 *                   required: [id, title, status, metadata, createdAt, updatedAt]
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                     title:
 *                       type: string
 *                     description:
 *                       type: string
 *                       nullable: true
 *                     status:
 *                       type: string
 *                       enum: [queued, processing, ready, failed]
 *                     metadata:
 *                       type: object
 *                       required: [fileSize]
 *                       properties:
 *                         durationSeconds:
 *                           type: number
 *                           nullable: true
 *                         width:
 *                           type: integer
 *                           nullable: true
 *                         height:
 *                           type: integer
 *                           nullable: true
 *                         codec:
 *                           type: string
 *                           nullable: true
 *                         fileSize:
 *                           type: integer
 *                           format: int64
 *                     thumbnailObjectKey:
 *                       type: string
 *                       nullable: true
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       nullable: true
 *       '400':
 *         description: Invalid video ID
 *       '401':
 *         description: Authentication required or session invalid
 *       '404':
 *         description: Video not found
 *
 *   delete:
 *     summary: Delete a video
 *     tags: [Videos]
 *     security:
 *       - sessionCookie: []
 *     parameters:
 *       - name: videoId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       '200':
 *         description: Video deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required: [status, message]
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: Video deleted successfully
 *       '400':
 *         description: Invalid video ID
 *       '401':
 *         description: Authentication required or session invalid
 *       '404':
 *         description: Video not found
 */

/**
 * @openapi
 * /videos/{videoId}/processing-status:
 *   get:
 *     summary: Get video processing status
 *     tags: [Videos]
 *     security:
 *       - sessionCookie: []
 *     parameters:
 *       - name: videoId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       '200':
 *         description: Video processing status fetched successfully
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
 *                   example: Video processing status fetched successfully
 *                 data:
 *                   type: object
 *                   required: [videoId, status, progress]
 *                   properties:
 *                     videoId:
 *                       type: string
 *                       format: uuid
 *                     status:
 *                       type: string
 *                       enum: [queued, processing, ready, failed]
 *                     progress:
 *                       type: number
 *                       minimum: 0
 *                       maximum: 100
 *                     currentStage:
 *                       type: string
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       nullable: true
 *                     error:
 *                       type: string
 *                       nullable: true
 *       '400':
 *         description: Invalid video ID
 *       '401':
 *         description: Authentication required or session invalid
 *       '404':
 *         description: Video not found
 */

/**
 * @openapi
 * /videos/{videoId}/playback-sessions:
 *   post:
 *     summary: Create a video playback session
 *     tags: [Videos]
 *     security:
 *       - sessionCookie: []
 *     parameters:
 *       - name: videoId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       '201':
 *         description: Playback session created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required: [status, message, data]
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 201
 *                 message:
 *                   type: string
 *                   example: Video download URL generated successfully
 *                 data:
 *                   type: object
 *                   required: [playbackToken, streamUrl, expiresIn, expiresAt]
 *                   properties:
 *                     playbackToken:
 *                       type: string
 *                     streamUrl:
 *                       type: string
 *                       example: /api/v1/stream/{playbackToken}/master.m3u8
 *                     expiresIn:
 *                       type: integer
 *                       description: Playback session lifetime in seconds.
 *                     expiresAt:
 *                       type: string
 *                       format: date-time
 *       '400':
 *         description: Invalid video ID
 *       '401':
 *         description: Authentication required or session invalid
 *       '404':
 *         description: Video not found
 *
 * /videos/{videoId}/download-links:
 *   get:
 *     summary: Get a temporary video download link
 *     tags: [Videos]
 *     security:
 *       - sessionCookie: []
 *     parameters:
 *       - name: videoId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       '200':
 *         description: Video download URL generated successfully
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
 *                   example: Video download URL generated successfully
 *                 data:
 *                   type: object
 *                   required: [downloadUrl, expiresAt]
 *                   properties:
 *                     downloadUrl:
 *                       type: string
 *                       format: uri
 *                     expiresAt:
 *                       type: string
 *                       format: date-time
 *       '400':
 *         description: Invalid video ID
 *       '401':
 *         description: Authentication required or session invalid
 *       '404':
 *         description: Video not found
 */
