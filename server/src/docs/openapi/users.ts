/**
 * @openapi
 * components:
 *   schemas:
 *     PublicUser:
 *       type: object
 *       required: [id, name, email, role, created_at]
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         name:
 *           type: string
 *         email:
 *           type: string
 *           format: email
 *         role:
 *           type: string
 *           enum: [user, admin]
 *         created_at:
 *           type: string
 *           format: date-time
 */

/**
 * @openapi
 * /users/me:
 *   get:
 *     summary: Get the current user
 *     tags: [Users]
 *     security:
 *       - sessionCookie: []
 *     responses:
 *       '200':
 *         description: Current user retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required: [status, message, user]
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: Current user retrieved successfully
 *                 user:
 *                   $ref: '#/components/schemas/PublicUser'
 *       '401':
 *         description: Authentication required or session invalid
 *       '404':
 *         description: User not found
 */