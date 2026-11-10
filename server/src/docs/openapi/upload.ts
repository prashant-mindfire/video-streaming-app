/**
 * @openapi
 * components:
 *   schemas:
 *     InitiateUploadRequest:
 *       type: object
 *       required: [fileName, contentType, fileSize]
 *       properties:
 *         fileName:
 *           type: string
 *           minLength: 1
 *           maxLength: 500
 *           example: sample-video.mp4
 *         contentType:
 *           type: string
 *           example: video/mp4
 *         fileSize:
 *           type: integer
 *           minimum: 1
 *           description: File size in bytes
 *           example: 104857600
 *     InitiateUploadResult:
 *       type: object
 *       properties:
 *         uploadId:
 *           type: string
 *           format: uuid
 *         fileName:
 *           type: string
 *         fileSize:
 *           type: integer
 *         partSize:
 *           type: integer
 *         totalParts:
 *           type: integer
 *         status:
 *           type: string
 *           enum: [initiated, uploading, completed, aborted, failed, expired]
 *     PartUploadUrlResult:
 *       type: object
 *       properties:
 *         uploadId:
 *           type: string
 *           format: uuid
 *         partNumber:
 *           type: integer
 *         uploadUrl:
 *           type: string
 *           format: uri
 *         expiresInSeconds:
 *           type: integer
 */

/**
 * @openapi
 * /videos/uploads:
 *   post:
 *     summary: Initiate a multipart video upload
 *     tags: [Uploads]
 *     security:
 *       - sessionCookie: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/InitiateUploadRequest'
 *     responses:
 *       '201':
 *         description: Upload initiated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 201
 *                 message:
 *                   type: string
 *                   example: Upload initiated successfully
 *                 data:
 *                   $ref: '#/components/schemas/InitiateUploadResult'
 *       '400':
 *         description: Invalid input, unsupported content type, or file too large
 *       '401':
 *         description: Authentication required
 */

/**
 * @openapi
 * /videos/uploads/{uploadId}/parts/{partNumber}/upload-urls:
 *   post:
 *     summary: Get a presigned URL for uploading one part
 *     description: Upload the part directly to the returned URL using HTTP PUT.
 *     tags: [Uploads]
 *     security:
 *       - sessionCookie: []
 *     parameters:
 *       - in: path
 *         name: uploadId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: path
 *         name: partNumber
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *     responses:
 *       '200':
 *         description: Presigned part URL generated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: Part upload URL generated successfully
 *                 data:
 *                   $ref: '#/components/schemas/PartUploadUrlResult'
 *       '400':
 *         description: Invalid part number
 *       '401':
 *         description: Authentication required
 *       '404':
 *         description: Upload not found or in an invalid state
 *       '410':
 *         description: Upload has expired
 */