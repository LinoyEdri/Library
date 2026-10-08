// LIST AND CREATE
/**
 * @openapi
 * /members:
 *   get:
 *     summary: List members (admin, librarian)
 *     operationId: listMembers
 *     tags:
 *       - Members
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - { in: query, name: page, schema: { type: integer, minimum: 1, default: 1 } }
 *       - { in: query, name: pageSize, schema: { type: integer, minimum: 1, maximum: 100, default: 20 } }
 *       - { in: query, name: search, schema: { type: string }, description: 'Every word must match the first name, last name, email or phone (digits only)' }
 *       - { in: query, name: status, schema: { $ref: '#/components/schemas/RecordStatus' } }
 *       - { in: query, name: sortBy, schema: { type: string, enum: [lastName, firstName, registrationDate], default: lastName } }
 *       - { in: query, name: sortOrder, schema: { type: string, enum: [asc, desc], default: asc } }
 *     responses:
 *       200:
 *         description: One page of members
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Member'
 *                 meta:
 *                   $ref: '#/components/schemas/PaginationMeta'
 *       403:
 *         description: Only staff may list members
 *   post:
 *     summary: Create a member (admin, librarian)
 *     description: |
 *       Two modes, chosen by `mode`:
 *       - `existingUser`: an active guest (VIEWER) account becomes a member. Audits USER_ROLE_CHANGED and MEMBER_CREATED.
 *       - `newPerson`: creates the account (MEMBER role), address and membership together. Audits USER_CREATED and MEMBER_CREATED.
 *     operationId: createMember
 *     tags:
 *       - Members
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             oneOf:
 *               - type: object
 *                 required: [mode, userId]
 *                 properties:
 *                   mode: { type: string, enum: [existingUser] }
 *                   userId: { type: string, format: uuid }
 *               - type: object
 *                 required: [mode, firstName, lastName, email, password, phoneNumber, address]
 *                 properties:
 *                   mode: { type: string, enum: [newPerson] }
 *                   firstName: { type: string }
 *                   lastName: { type: string }
 *                   email: { type: string, format: email }
 *                   password: { type: string, format: password, minLength: 8 }
 *                   phoneNumber: { type: string }
 *                   address: { $ref: '#/components/schemas/AddressInput' }
 *     responses:
 *       201:
 *         description: Member created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/Member'
 *       400:
 *         description: Validation error, or the account is not an active guest
 *       404:
 *         description: User not found (existingUser mode)
 *       409:
 *         description: The user is already a member, or the email is already registered
 */

// CANDIDATES AND OWN MEMBERSHIP
/**
 * @openapi
 * /members/candidates:
 *   get:
 *     summary: Guest accounts that can become members (admin, librarian)
 *     description: Active VIEWER accounts without a membership, up to 20, matching the search.
 *     operationId: listMemberCandidates
 *     tags:
 *       - Members
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - { in: query, name: search, schema: { type: string }, description: 'Name or email' }
 *     responses:
 *       200:
 *         description: Matching accounts
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       userId: { type: string, format: uuid }
 *                       firstName: { type: string }
 *                       lastName: { type: string }
 *                       email: { type: string, format: email }
 * /members/me:
 *   get:
 *     summary: The logged-in member's own membership (member)
 *     operationId: getOwnMember
 *     tags:
 *       - Members
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: The membership
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/Member'
 *       404:
 *         description: The current user is not a member
 */

// GET AND UPDATE
/**
 * @openapi
 * /members/{id}:
 *   get:
 *     summary: Get a member
 *     description: Staff may open any member; a member may open only their own membership (403 otherwise).
 *     operationId: getMember
 *     tags:
 *       - Members
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string, format: uuid } }
 *     responses:
 *       200:
 *         description: The member
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/Member'
 *       403:
 *         description: A member asked for someone else's membership
 *       404:
 *         description: Member not found
 *   patch:
 *     summary: Update a member's personal details (admin, librarian)
 *     description: Name, phone and address. Audits MEMBER_UPDATED and/or ADDRESS_UPDATED for the parts that changed.
 *     operationId: updateMember
 *     tags:
 *       - Members
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string, format: uuid } }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MemberDetailsInput'
 *     responses:
 *       200:
 *         description: Member updated
 *       404:
 *         description: Member not found
 */

// DISABLE AND REACTIVATE
/**
 * @openapi
 * /members/{id}/disable:
 *   post:
 *     summary: Disable a membership (admin, librarian)
 *     description: The account becomes a guest (role VIEWER) and cannot receive new loans; it can still log in. Audits MEMBER_DISABLED and USER_ROLE_CHANGED.
 *     operationId: disableMember
 *     tags:
 *       - Members
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string, format: uuid } }
 *     responses:
 *       200:
 *         description: Member disabled
 *       409:
 *         description: Member is already disabled
 * /members/{id}/reactivate:
 *   post:
 *     summary: Reactivate a membership (admin, librarian)
 *     description: The account becomes a member again (role MEMBER). Audits MEMBER_REACTIVATED and USER_ROLE_CHANGED.
 *     operationId: reactivateMember
 *     tags:
 *       - Members
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string, format: uuid } }
 *     responses:
 *       200:
 *         description: Member reactivated
 *       409:
 *         description: Member is already active
 */
