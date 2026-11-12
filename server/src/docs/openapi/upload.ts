/**
 * @openapi
 * components:
 *   schemas:
 *     PresignedUploadPart:
 *       type: object
 *       required: [partNumber, uploadUrl, expiresIn]
 *       properties:
 *         partNumber:
 *           type: integer
 *         uploadUrl:
 *           type: string
 *           format: uri
 *           description: Presigned URL for uploading this part directly to object storage using HTTP PUT.
 *         expiresIn:
 *           type: integer
 *           description: URL lifetime in seconds.
 */

/**
 * @openapi
 * /videos/uploads:
 *   post:
 *     summary: Initiate a video multipart upload
 *     tags: [Uploads]
 *     security:
 *       - sessionCookie: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [fileName, contentType, fileSize]
 *             properties:
 *               fileName:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 500
 *                 example: sample.mp4
 *               contentType:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 150
 *                 description: Must start with video/.
 *                 example: video/mp4
 *               fileSize:
 *                 type: integer
 *                 format: int64
 *                 minimum: 1
 *                 description: File size in bytes; maximum defaults to 5 GiB.
 *                 example: 52428800
 *     responses:
 *       '201':
 *         description: Upload initiated successfully
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
 *                   example: Upload initiated successfully
 *                 data:
 *                   type: object
 *                   required: [uploadId, fileName, fileSize, partSize, totalParts, status, parts, nextPartNumbers]
 *                   properties:
 *                     uploadId:
 *                       type: string
 *                       format: uuid
 *                     fileName:
 *                       type: string
 *                     fileSize:
 *                       type: integer
 *                       format: int64
 *                     partSize:
 *                       type: integer
 *                       description: Part size in bytes; defaults to 10 MiB.
 *                     totalParts:
 *                       type: integer
 *                     status:
 *                       type: string
 *                       example: initiated
 *                     parts:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/PresignedUploadPart'
 *                     nextPartNumbers:
 *                       type: array
 *                       description: Part numbers for which to request URLs in another batch.
 *                       items:
 *                         type: integer
 *       '400':
 *         description: Invalid upload details, non-video content type, file too large, or too many parts.
 *       '401':
 *         description: Authentication required or session invalid
 */

/**
 * @openapi
 * /uploads/{uploadId}/parts/upload-urls:
 *   post:
 *     summary: Generate presigned URLs for upload parts
 *     tags: [Uploads]
 *     security:
 *       - sessionCookie: []
 *     parameters:
 *       - name: uploadId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [partNumbers]
 *             properties:
 *               partNumbers:
 *                 type: array
 *                 minItems: 1
 *                 maxItems: 100
 *                 uniqueItems: true
 *                 items:
 *                   type: integer
 *                   minimum: 1
 *                 example: [6, 7, 8]
 *     responses:
 *       '200':
 *         description: Part upload URLs generated successfully
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
 *                   example: Part upload URLs generated successfully
 *                 data:
 *                   type: object
 *                   required: [uploadId, parts]
 *                   properties:
 *                     uploadId:
 *                       type: string
 *                       format: uuid
 *                     parts:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/PresignedUploadPart'
 *       '400':
 *         description: Invalid or duplicate part numbers, upload inactive, or upload expired
 *       '401':
 *         description: Authentication required or session invalid
 *       '404':
 *         description: Upload not found
 */

/**
 * @openapi
 * /videos/uploads/{uploadId}/completion:
 *   post:
 *     summary: Complete a multipart upload and queue video processing
 *     tags: [Uploads]
 *     security:
 *       - sessionCookie: []
 *     parameters:
 *       - name: uploadId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [parts]
 *             properties:
 *               parts:
 *                 type: array
 *                 minItems: 1
 *                 description: Include every part number and its matching ETag.
 *                 items:
 *                   type: object
 *                   required: [partNumber, etag]
 *                   properties:
 *                     partNumber:
 *                       type: integer
 *                       minimum: 1
 *                     etag:
 *                       type: string
 *                       minLength: 1
 *     responses:
 *       '200':
 *         description: Video uploaded successfully; processing has been queued
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
 *                   example: Video uploaded successfully
 *                 data:
 *                   type: object
 *                   required: [uploadId, videoId, jobId, status, message]
 *                   properties:
 *                     uploadId:
 *                       type: string
 *                       format: uuid
 *                     videoId:
 *                       type: string
 *                       format: uuid
 *                     jobId:
 *                       type: string
 *                       format: uuid
 *                     status:
 *                       type: string
 *                       example: queued
 *                     message:
 *                       type: string
 *                       example: Upload completed and video processing has been queued
 *       '400':
 *         description: Upload inactive or expired, or submitted parts are missing or invalid
 *       '401':
 *         description: Authentication required or session invalid
 *       '404':
 *         description: Upload not found
 *       '409':
 *         description: Upload has already been completed
 */

/**
 * @openapi
 * /videos/uploads/{uploadId}:
 *   get:
 *     summary: Get upload status
 *     tags: [Uploads]
 *     security:
 *       - sessionCookie: []
 *     parameters:
 *       - name: uploadId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       '200':
 *         description: Video upload fetched successfully
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
 *                   example: Video upload fetched successfully
 *                 data:
 *                   type: object
 *                   required: [uploadId, fileName, fileSize, contentType, partSize, totalParts, status, expiresAt, completedAt, createdAt]
 *                   properties:
 *                     uploadId:
 *                       type: string
 *                       format: uuid
 *                     fileName:
 *                       type: string
 *                     fileSize:
 *                       type: integer
 *                       format: int64
 *                     contentType:
 *                       type: string
 *                       example: video/mp4
 *                     partSize:
 *                       type: string
 *                       description: Part size in bytes.
 *                     totalParts:
 *                       type: integer
 *                     status:
 *                       type: string
 *                       enum: [initiated, uploading, completed, aborted, failed, expired]
 *                     expiresAt:
 *                       type: string
 *                       format: date-time
 *                       nullable: true
 *                     completedAt:
 *                       type: string
 *                       format: date-time
 *                       nullable: true
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       nullable: true
 *       '400':
 *         description: Invalid upload ID
 *       '401':
 *         description: Authentication required or session invalid
 *       '404':
 *         description: Upload not found
 */