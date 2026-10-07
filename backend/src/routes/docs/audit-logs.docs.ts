// LIST
/**
 * @openapi
 * /audit-logs:
 *   get:
 *     summary: List audit log entries (admin)
 *     description: |
 *       Newest first by default. The log is append-only: there are no endpoints that change or delete
 *       entries, and a database trigger rejects UPDATE and DELETE on the table.
 *       `fromDate` and `toDate` are whole days (server local time), both inclusive.
 *     operationId: listAuditLogEntries
 *     tags:
 *       - Audit log
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - { in: query, name: page, schema: { type: integer, minimum: 1, default: 1 } }
 *       - { in: query, name: pageSize, schema: { type: integer, minimum: 1, maximum: 100, default: 20 } }
 *       - { in: query, name: actionType, schema: { type: string, example: LOAN_CREATED } }
 *       - { in: query, name: affectedType, schema: { type: string, example: LOAN } }
 *       - { in: query, name: actionUserId, schema: { type: string, format: uuid }, description: 'Who acted' }
 *       - { in: query, name: entryNumber, schema: { type: integer, minimum: 1 }, description: 'The running entry number (1, 2, 3...)' }
 *       - { in: query, name: affectedRecordId, schema: { type: string }, description: 'The changed record' }
 *       - { in: query, name: fromDate, schema: { type: string, format: date, example: '2026-10-01' } }
 *       - { in: query, name: toDate, schema: { type: string, format: date, example: '2026-10-07' } }
 *       - { in: query, name: sortOrder, schema: { type: string, enum: [asc, desc], default: desc } }
 *     responses:
 *       200:
 *         description: One page of entries
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/AuditLogEntry'
 *                 meta:
 *                   $ref: '#/components/schemas/PaginationMeta'
 *       400:
 *         description: Invalid filter (e.g. toDate before fromDate)
 *       403:
 *         description: Only admins can read the audit log
 */

// DETAILS
/**
 * @openapi
 * /audit-logs/{id}:
 *   get:
 *     summary: Get one audit log entry (admin)
 *     operationId: getAuditLogEntry
 *     tags:
 *       - Audit log
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string, format: uuid } }
 *     responses:
 *       200:
 *         description: The entry with its previous and new values
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/AuditLogEntry'
 *       403:
 *         description: Only admins can read the audit log
 *       404:
 *         description: Entry not found
 */
