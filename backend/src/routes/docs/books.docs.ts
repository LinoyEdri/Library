// LIST AND CREATE
/**
 * @openapi
 * /books:
 *   get:
 *     summary: List books (catalog)
 *     description: Paginated catalog with search and filters. Staff see disabled books too and may filter by status; everyone else only sees active books.
 *     operationId: listBooks
 *     tags:
 *       - Books
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - { in: query, name: page, schema: { type: integer, minimum: 1, default: 1 } }
 *       - { in: query, name: pageSize, schema: { type: integer, minimum: 1, maximum: 100, default: 20 } }
 *       - { in: query, name: search, schema: { type: string }, description: 'Title, ISBN or author name' }
 *       - { in: query, name: categoryId, schema: { type: string, format: uuid } }
 *       - { in: query, name: authorId, schema: { type: string, format: uuid } }
 *       - { in: query, name: publisherId, schema: { type: string, format: uuid } }
 *       - { in: query, name: language, schema: { type: string } }
 *       - { in: query, name: availability, schema: { type: string, enum: [available, unavailable] } }
 *       - { in: query, name: status, schema: { $ref: '#/components/schemas/RecordStatus' } }
 *       - { in: query, name: sortBy, schema: { type: string, enum: [title, publicationYear, createdDate], default: title } }
 *       - { in: query, name: sortOrder, schema: { type: string, enum: [asc, desc], default: asc } }
 *     responses:
 *       200:
 *         description: One page of books
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
 *                     $ref: '#/components/schemas/BookSummary'
 *                 meta:
 *                   $ref: '#/components/schemas/PaginationMeta'
 *       401:
 *         description: Missing or invalid access token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *   post:
 *     summary: Create a book (admin, librarian)
 *     description: Creates the book with its authors (first = primary) and categories in one transaction. Publisher, authors and categories must exist and be active.
 *     operationId: createBook
 *     tags:
 *       - Books
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BookDetailsInput'
 *     responses:
 *       201:
 *         description: Book created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/BookDetails'
 *       400:
 *         description: Validation error, or a referenced publisher/author/category is missing or disabled
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       403:
 *         description: Only staff may create books
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       409:
 *         description: A book with this ISBN already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */

// LANGUAGES
/**
 * @openapi
 * /books/languages:
 *   get:
 *     summary: Languages used in the catalog (for the language filter)
 *     operationId: listBookLanguages
 *     tags:
 *       - Books
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Distinct languages, sorted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: [אנגלית, עברית]
 */

// GET AND UPDATE
/**
 * @openapi
 * /books/{id}:
 *   get:
 *     summary: Get a book
 *     description: Copies are included only for staff. Disabled books return 404 for non-staff.
 *     operationId: getBook
 *     tags:
 *       - Books
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string, format: uuid } }
 *     responses:
 *       200:
 *         description: The book
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/BookDetails'
 *       404:
 *         description: Book not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *   patch:
 *     summary: Update a book (admin, librarian)
 *     description: Replaces the book fields, authors and categories. A disabled author/category/publisher may stay only if the book was already linked to it.
 *     operationId: updateBook
 *     tags:
 *       - Books
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string, format: uuid } }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BookDetailsInput'
 *     responses:
 *       200:
 *         description: Book updated
 *       400:
 *         description: Validation error or invalid references
 *       403:
 *         description: Only staff may update books
 *       404:
 *         description: Book not found
 *       409:
 *         description: A book with this ISBN already exists
 */

// DISABLE AND REACTIVATE
/**
 * @openapi
 * /books/{id}/disable:
 *   post:
 *     summary: Disable a book (admin)
 *     description: Disabled books cannot be loaned and are hidden from non-staff. Nothing is deleted.
 *     operationId: disableBook
 *     tags:
 *       - Books
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string, format: uuid } }
 *     responses:
 *       200:
 *         description: Book disabled
 *       403:
 *         description: Only admins may disable books
 *       409:
 *         description: Book is already disabled
 * /books/{id}/reactivate:
 *   post:
 *     summary: Reactivate a book (admin)
 *     operationId: reactivateBook
 *     tags:
 *       - Books
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string, format: uuid } }
 *     responses:
 *       200:
 *         description: Book reactivated
 *       403:
 *         description: Only admins may reactivate books
 *       409:
 *         description: Book is already active
 */
