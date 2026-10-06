// UPDATE OWN PROFILE
/**
 * @openapi
 * /users/me:
 *   patch:
 *     summary: Update the current user's profile
 *     description: Updates name, phone and address of the logged-in user. Email and role cannot be changed here. Changes are recorded in the audit log.
 *     operationId: updateOwnProfile
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [firstName, lastName, phoneNumber, address]
 *             properties:
 *               firstName:
 *                 type: string
 *                 maxLength: 100
 *                 example: דנה
 *               lastName:
 *                 type: string
 *                 maxLength: 100
 *                 example: כהן
 *               phoneNumber:
 *                 type: string
 *                 minLength: 9
 *                 maxLength: 10
 *                 pattern: '^[0-9]+$'
 *                 example: '0501234567'
 *               address:
 *                 $ref: '#/components/schemas/AddressInput'
 *     responses:
 *       200:
 *         description: Profile updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Profile updated successfully
 *                 data:
 *                   $ref: '#/components/schemas/SafeUser'
 *       400:
 *         description: Validation error
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
