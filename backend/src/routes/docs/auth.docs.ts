// REGISTER
/**
 * @openapi
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     description: Creates a VIEWER account and its address in one transaction. Staff can later turn the user into a member.
 *     operationId: registerUser
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [firstName, lastName, email, password, phoneNumber, address]
 *             properties:
 *               firstName:
 *                 type: string
 *                 maxLength: 100
 *                 description: Letters only (Hebrew or English)
 *                 example: דנה
 *               lastName:
 *                 type: string
 *                 maxLength: 100
 *                 description: Letters only (Hebrew or English)
 *                 example: כהן
 *               email:
 *                 type: string
 *                 format: email
 *                 example: dana@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 8
 *                 maxLength: 128
 *                 example: StrongP@ssw0rd
 *               phoneNumber:
 *                 type: string
 *                 minLength: 9
 *                 maxLength: 10
 *                 pattern: '^[0-9]+$'
 *                 example: '0501234567'
 *               address:
 *                 $ref: '#/components/schemas/AddressInput'
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 code:
 *                   type: string
 *                   example: CREATED
 *                 message:
 *                   type: string
 *                   example: User registered successfully
 *                 data:
 *                   $ref: '#/components/schemas/SafeUser'
 *       400:
 *         description: Validation error - missing or invalid fields
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       409:
 *         description: A user with this email already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */

// LOGIN
/**
 * @openapi
 * /auth/login:
 *   post:
 *     summary: Authenticate a user
 *     description: Validates credentials, updates the last login date and returns a signed JWT. Unknown email, wrong password and disabled accounts all return the same 401 to prevent user enumeration.
 *     operationId: loginUser
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: admin@library.local
 *               password:
 *                 type: string
 *                 format: password
 *                 example: Password123!
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 code:
 *                   type: string
 *                   example: OK
 *                 message:
 *                   type: string
 *                   example: Login successful
 *                 data:
 *                   $ref: '#/components/schemas/LoginResult'
 *       400:
 *         description: Validation error - email or password missing
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       401:
 *         description: Invalid email or password
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */

// ME
/**
 * @openapi
 * /auth/me:
 *   get:
 *     summary: Get the current authenticated user
 *     description: Returns the profile of the user identified by the access token.
 *     operationId: getCurrentUser
 *     tags:
 *       - Auth
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current user profile
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 code:
 *                   type: string
 *                   example: OK
 *                 message:
 *                   type: string
 *                   example: User retrieved successfully
 *                 data:
 *                   $ref: '#/components/schemas/SafeUser'
 *       401:
 *         description: Missing, invalid or expired access token, or the account is disabled
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */
