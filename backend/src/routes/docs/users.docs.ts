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

// ADMIN: LIST AND CREATE USERS
/**
 * @openapi
 * /users:
 *   get:
 *     summary: List users (admin)
 *     operationId: listUsers
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - { in: query, name: page, schema: { type: integer, minimum: 1, default: 1 } }
 *       - { in: query, name: pageSize, schema: { type: integer, minimum: 1, maximum: 100, default: 20 } }
 *       - { in: query, name: search, schema: { type: string }, description: 'Every word must match the first name, last name or email' }
 *       - { in: query, name: role, schema: { $ref: '#/components/schemas/Role' } }
 *       - { in: query, name: status, schema: { $ref: '#/components/schemas/RecordStatus' } }
 *       - { in: query, name: sortBy, schema: { type: string, enum: [lastName, firstName, createdDate, lastLoginDate], default: lastName } }
 *       - { in: query, name: sortOrder, schema: { type: string, enum: [asc, desc], default: asc } }
 *     responses:
 *       200:
 *         description: One page of users
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ManagedUser'
 *                 meta:
 *                   $ref: '#/components/schemas/PaginationMeta'
 *       403:
 *         description: Only admins manage users
 *   post:
 *     summary: Create a user with any role (admin)
 *     description: MEMBER accounts also get their membership in the same transaction. Audits USER_CREATED (and MEMBER_CREATED).
 *     operationId: createUser
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
 *             required: [firstName, lastName, email, password, phoneNumber, address, role]
 *             properties:
 *               firstName: { type: string }
 *               lastName: { type: string }
 *               email: { type: string, format: email }
 *               password: { type: string, format: password, minLength: 8 }
 *               phoneNumber: { type: string }
 *               address: { $ref: '#/components/schemas/AddressInput' }
 *               role: { $ref: '#/components/schemas/Role' }
 *     responses:
 *       201:
 *         description: User created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/ManagedUser'
 *       409:
 *         description: The email is already registered
 */

// ADMIN: GET AND UPDATE A USER
/**
 * @openapi
 * /users/{id}:
 *   get:
 *     summary: Get a user (admin)
 *     operationId: getUser
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string, format: uuid } }
 *     responses:
 *       200:
 *         description: The user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/ManagedUser'
 *       404:
 *         description: User not found
 *   patch:
 *     summary: Update a user's details (admin)
 *     description: Name, email, phone and address. Audits USER_UPDATED and/or ADDRESS_UPDATED for the parts that changed.
 *     operationId: updateUser
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string, format: uuid } }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [firstName, lastName, email, phoneNumber, address]
 *             properties:
 *               firstName: { type: string }
 *               lastName: { type: string }
 *               email: { type: string, format: email }
 *               phoneNumber: { type: string }
 *               address: { $ref: '#/components/schemas/AddressInput' }
 *     responses:
 *       200:
 *         description: User updated
 *       409:
 *         description: The email is already registered
 */

// ADMIN: ROLE AND STATUS
/**
 * @openapi
 * /users/{id}/role:
 *   patch:
 *     summary: Change a user's role (admin)
 *     description: |
 *       Keeps the membership in step with the role: becoming MEMBER creates or reactivates the membership;
 *       any other role disables an active membership. Admins cannot change their own role, and the last
 *       active admin cannot be demoted (409).
 *     operationId: changeUserRole
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string, format: uuid } }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [role]
 *             properties:
 *               role: { $ref: '#/components/schemas/Role' }
 *     responses:
 *       200:
 *         description: Role changed
 *       403:
 *         description: Admins cannot change their own role
 *       409:
 *         description: Same role, or the last active admin would be demoted
 * /users/{id}/disable:
 *   post:
 *     summary: Disable a user account (admin)
 *     description: A disabled account cannot log in. Admins cannot disable themselves, and the last active admin cannot be disabled.
 *     operationId: disableUser
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string, format: uuid } }
 *     responses:
 *       200:
 *         description: User disabled
 *       403:
 *         description: Admins cannot disable their own account
 *       409:
 *         description: Already disabled, or the last active admin
 * /users/{id}/reactivate:
 *   post:
 *     summary: Reactivate a user account (admin)
 *     operationId: reactivateUser
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string, format: uuid } }
 *     responses:
 *       200:
 *         description: User reactivated
 *       409:
 *         description: Already active
 */
