// LIST AND CREATE
/**
 * @openapi
 * /publishers:
 *   get:
 *     summary: List publishers
 *     description: Paginated list. Admins see all publishers and may filter by status; everyone else only sees active publishers.
 *     operationId: listPublishers
 *     tags:
 *       - Publishers
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - { in: query, name: page, schema: { type: integer, minimum: 1, default: 1 } }
 *       - { in: query, name: pageSize, schema: { type: integer, minimum: 1, maximum: 100, default: 20 } }
 *       - { in: query, name: search, schema: { type: string }, description: 'Matches the name' }
 *       - { in: query, name: status, schema: { $ref: '#/components/schemas/RecordStatus' } }
 *       - { in: query, name: sortBy, schema: { type: string, enum: [name, createdDate] } }
 *       - { in: query, name: sortOrder, schema: { type: string, enum: [asc, desc], default: asc } }
 *     responses:
 *       200:
 *         description: One page of publishers
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Publisher'
 *                 meta:
 *                   $ref: '#/components/schemas/PaginationMeta'
 *       401:
 *         description: Missing or invalid access token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *   post:
 *     summary: Create a publisher (admin)
 *     operationId: createPublisher
 *     tags:
 *       - Publishers
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PublisherDetails'
 *     responses:
 *       201:
 *         description: Publisher created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Publisher'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       403:
 *         description: Only admins may create
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       409:
 *         description: A publisher with this name already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */

// GET AND UPDATE
/**
 * @openapi
 * /publishers/{id}:
 *   get:
 *     summary: Get a publisher
 *     description: Disabled publishers return 404 for non-admins.
 *     operationId: getPublisher
 *     tags:
 *       - Publishers
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: The publisher
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Publisher'
 *       404:
 *         description: Publisher not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *   patch:
 *     summary: Update a publisher (admin)
 *     operationId: updatePublisher
 *     tags:
 *       - Publishers
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PublisherDetails'
 *     responses:
 *       200:
 *         description: Publisher updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Publisher'
 *       403:
 *         description: Only admins may update
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       404:
 *         description: Publisher not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       409:
 *         description: A publisher with this name already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */

// DISABLE
/**
 * @openapi
 * /publishers/{id}/disable:
 *   post:
 *     summary: Disable a publisher (admin)
 *     description: Records are never deleted; disabling keeps history and the audit log intact.
 *     operationId: disablePublisher
 *     tags:
 *       - Publishers
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Publisher disabled
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Publisher'
 *       403:
 *         description: Only admins may disable
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       404:
 *         description: Publisher not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       409:
 *         description: Publisher is already disabled
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */

// REACTIVATE
/**
 * @openapi
 * /publishers/{id}/reactivate:
 *   post:
 *     summary: Reactivate a disabled publisher (admin)
 *     operationId: reactivatePublisher
 *     tags:
 *       - Publishers
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Publisher reactivated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Publisher'
 *       403:
 *         description: Only admins may reactivate
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       404:
 *         description: Publisher not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       409:
 *         description: Publisher is already active
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */
