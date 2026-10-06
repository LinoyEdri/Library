// ADD COPY
/**
 * @openapi
 * /books/{id}/copies:
 *   post:
 *     summary: Add a physical copy to a book (admin, librarian)
 *     operationId: addBookCopy
 *     tags:
 *       - Book copies
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string, format: uuid }, description: Book id }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [barcode]
 *             properties:
 *               barcode:
 *                 type: string
 *                 maxLength: 50
 *                 example: LIB-000123
 *     responses:
 *       201:
 *         description: Copy created (status AVAILABLE)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/BookCopy'
 *       404:
 *         description: Book not found
 *       409:
 *         description: A copy with this barcode already exists
 */

// CHANGE COPY STATUS
/**
 * @openapi
 * /book-copies/{id}/status:
 *   patch:
 *     summary: Change a copy's status (admin, librarian)
 *     description: Mark a copy lost, damaged or disabled, or make it available again. Copies on loan cannot be changed here. Each change is audited.
 *     operationId: changeBookCopyStatus
 *     tags:
 *       - Book copies
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string, format: uuid }, description: Copy id }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [AVAILABLE, DAMAGED, LOST, DISABLED]
 *     responses:
 *       200:
 *         description: Status changed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/BookCopy'
 *       404:
 *         description: Copy not found
 *       409:
 *         description: The copy is on loan, or already has this status
 */
