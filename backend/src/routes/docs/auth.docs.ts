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

// CHANGE PASSWORD
/**
 * @openapi
 * /auth/change-password:
 *   post:
 *     summary: Change the current user's password
 *     description: Requires the current password. A wrong current password returns 400 (not 401, so the session stays open).
 *     operationId: changeOwnPassword
 *     tags:
 *       - Auth
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [currentPassword, newPassword]
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 format: password
 *               newPassword:
 *                 type: string
 *                 format: password
 *                 minLength: 8
 *                 maxLength: 128
 *                 description: Must differ from the current password
 *     responses:
 *       200:
 *         description: Password changed
 *       400:
 *         description: Validation error or incorrect current password
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       401:
 *         description: Missing or invalid access token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */

// LOGOUT
/**
 * @openapi
 * /auth/logout:
 *   post:
 *     summary: Log out
 *     description: Records the logout in the audit log. The client must discard its access token.
 *     operationId: logout
 *     tags:
 *       - Auth
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logged out
 *       401:
 *         description: Missing or invalid access token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */

// FORGOT PASSWORD: CODE BY EMAIL OR SMS, THEN RESET
/**
 * @openapi
 * /auth/forgot-password:
 *   post:
 *     summary: Send a 6-digit password reset code by email or SMS (guests)
 *     description: |
 *       Finds the active account by email (`channel: EMAIL`) or phone number (`channel: SMS`, dashes allowed).
 *       The code works for 5 minutes and closes any older open request of the account.
 *       No email/SMS provider is configured: while SIMULATE_MESSAGE_DELIVERY is on, nothing is sent and
 *       `simulatedMessage` carries the message so the app can show it.
 *     operationId: forgotPassword
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             oneOf:
 *               - type: object
 *                 required: [channel, email]
 *                 properties:
 *                   channel: { type: string, enum: [EMAIL] }
 *                   email: { type: string, format: email }
 *               - type: object
 *                 required: [channel, phoneNumber]
 *                 properties:
 *                   channel: { type: string, enum: [SMS] }
 *                   phoneNumber: { type: string, example: '052-123-4567' }
 *     responses:
 *       200:
 *         description: Code sent (or simulated)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     requestId: { type: string, format: uuid }
 *                     channel: { type: string, enum: [EMAIL, SMS] }
 *                     maskedDestination: { type: string, example: '052-***-4567' }
 *                     codeExpiresDate: { type: string, format: date-time }
 *                     simulatedMessage:
 *                       type: object
 *                       nullable: true
 *                       properties:
 *                         channel: { type: string, enum: [EMAIL, SMS] }
 *                         recipient: { type: string }
 *                         code: { type: string, example: '482913' }
 *                         validMinutes: { type: integer, example: 5 }
 *       400:
 *         description: Invalid email or phone number
 *       404:
 *         description: No active account (error.code PASSWORD_RESET_ACCOUNT_NOT_FOUND)
 *       409:
 *         description: The phone number belongs to several accounts (error.code PASSWORD_RESET_PHONE_SHARED)
 * /auth/forgot-password/verify:
 *   post:
 *     summary: Check the code; the right code opens a 5-minute reset session (guests)
 *     description: |
 *       5 wrong codes close the request. Returns the reset token for POST /auth/reset-password.
 *     operationId: verifyPasswordResetCode
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [requestId, code]
 *             properties:
 *               requestId: { type: string, format: uuid }
 *               code: { type: string, example: '482913' }
 *     responses:
 *       200:
 *         description: Code accepted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     resetToken: { type: string }
 *                     resetTokenExpiresDate: { type: string, format: date-time }
 *       400:
 *         description: Wrong code (error.code PASSWORD_RESET_CODE_INCORRECT)
 *       409:
 *         description: Code expired, used, replaced or locked after 5 wrong tries (error.code PASSWORD_RESET_CODE_EXPIRED)
 * /auth/reset-password:
 *   post:
 *     summary: Set the new password within the reset session (guests)
 *     description: |
 *       Works once, within 5 minutes of the right code, for an active account. Every open request of the user
 *       closes. Audited as USER_PASSWORD_CHANGED with context source PASSWORD_RESET and the channel.
 *     operationId: resetPassword
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [token, newPassword]
 *             properties:
 *               token: { type: string }
 *               newPassword: { type: string, format: password, minLength: 8 }
 *     responses:
 *       200:
 *         description: Password changed; the user can log in with it
 *       400:
 *         description: The new password breaks the rules
 *       409:
 *         description: The reset time is over or the session was used (error.code PASSWORD_RESET_SESSION_EXPIRED)
 */
