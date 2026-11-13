/**
 * @openapi
 * components:
 *   schemas:
 *     RegisterUserRequest:
 *       type: object
 *       required: [name, email, password, role]
 *       properties:
 *         name:
 *           type: string
 *           minLength: 2
 *           maxLength: 100
 *         email:
 *           type: string
 *           format: email
 *         password:
 *           type: string
 *           minLength: 8
 *         role:
 *           type: string
 *           enum: [user, admin]
 *     LoginUserRequest:
 *       type: object
 *       required: [email, password]
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *         password:
 *           type: string
 *           minLength: 8
 */

/**
 * @openapi
 * /auth/users:
 *   post:
 *     summary: Register a user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterUserRequest'
 *     responses:
 *       '201':
 *         description: User registered
 *       '400':
 *         description: Validation error
 */

/**
 * @openapi
 * /auth/sessions:
 *   post:
 *     summary: Log in
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginUserRequest'
 *     responses:
 *       '200':
 *         description: Login successful; sets the session cookie
 *       '401':
 *         description: Invalid credentials
 */

/**
 * @openapi
 * /auth/sessions/current:
 *   delete:
 *     summary: Log out the current session
 *     tags: [Authentication]
 *     security:
 *       - sessionCookie: []
 *     responses:
 *       '200':
 *         description: Logout successful
 *       '401':
 *         description: Authentication required
 */
