// LIST AND CREATE
/**
 * @openapi
 * /loans:
 *   get:
 *     summary: List loans (staff see all, members see only their own)
 *     operationId: listLoans
 *     tags:
 *       - Loans
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - { in: query, name: page, schema: { type: integer, minimum: 1, default: 1 } }
 *       - { in: query, name: pageSize, schema: { type: integer, minimum: 1, maximum: 100, default: 20 } }
 *       - { in: query, name: search, schema: { type: string }, description: 'Every word must match the book title, the barcode, or the member name/email' }
 *       - { in: query, name: status, schema: { $ref: '#/components/schemas/LoanStatus' } }
 *       - { in: query, name: memberId, schema: { type: string, format: uuid }, description: 'Staff only; ignored for members' }
 *       - { in: query, name: bookId, schema: { type: string, format: uuid } }
 *       - { in: query, name: onlyOverdue, schema: { type: string, enum: ['true', 'false'] }, description: 'Open loans past their due date' }
 *       - { in: query, name: sortBy, schema: { type: string, enum: [createdDate, dueDate], default: createdDate } }
 *       - { in: query, name: sortOrder, schema: { type: string, enum: [asc, desc], default: desc } }
 *     responses:
 *       200:
 *         description: One page of loans
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Loan'
 *                 meta:
 *                   $ref: '#/components/schemas/PaginationMeta'
 *       403:
 *         description: Guests have no loans
 *   post:
 *     summary: Lend a book to a member (admin, librarian)
 *     description: |
 *       Pass `bookId` (the first available copy is taken) or `barcode` (that exact copy), or both.
 *       The member and the book must be active, a copy must be available and the member must be under
 *       the `maxActiveLoansPerMember` setting. The due date is today plus `loanPeriodDays`. Audits LOAN_CREATED.
 *       Business rule failures return 409 with `error.code` set to one of:
 *       MEMBER_NOT_ACTIVE, BOOK_NOT_ACTIVE, COPY_NOT_FOUND, COPY_OF_OTHER_BOOK, COPY_NOT_AVAILABLE,
 *       NO_AVAILABLE_COPY, LOAN_LIMIT_REACHED.
 *     operationId: createLoan
 *     tags:
 *       - Loans
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateLoanInput'
 *     responses:
 *       201:
 *         description: Loan created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/Loan'
 *       400:
 *         description: Validation error (neither bookId nor barcode given)
 *       404:
 *         description: Member or book not found
 *       409:
 *         description: A business rule blocked the loan (see error.code)
 */

// DETAILS
/**
 * @openapi
 * /loans/{id}:
 *   get:
 *     summary: Get one loan (staff, or the member who holds it)
 *     operationId: getLoan
 *     tags:
 *       - Loans
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string, format: uuid } }
 *     responses:
 *       200:
 *         description: The loan
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/Loan'
 *       403:
 *         description: A member asked for someone else's loan
 *       404:
 *         description: Loan not found
 */

// MEMBER: RETURN REQUESTS
/**
 * @openapi
 * /loans/{id}/return-request:
 *   post:
 *     summary: Ask to return my loan (member)
 *     description: ACTIVE or OVERDUE becomes RETURN_REQUESTED. Audits LOAN_RETURN_REQUESTED. Other statuses return 409 LOAN_STATUS_NOT_ALLOWED.
 *     operationId: requestLoanReturn
 *     tags:
 *       - Loans
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string, format: uuid } }
 *     responses:
 *       200:
 *         description: Return requested
 *       403:
 *         description: Not the member's own loan
 *       409:
 *         description: The loan's status does not allow this
 * /loans/{id}/return-request/cancel:
 *   post:
 *     summary: Withdraw my return request (member)
 *     description: RETURN_REQUESTED goes back to ACTIVE, or OVERDUE when past the due date. Audits LOAN_RETURN_REQUEST_CANCELLED.
 *     operationId: cancelLoanReturnRequest
 *     tags:
 *       - Loans
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string, format: uuid } }
 *     responses:
 *       200:
 *         description: Request withdrawn
 *       403:
 *         description: Not the member's own loan
 *       409:
 *         description: The loan has no open return request
 */

// STAFF: RETURN AND CANCEL
/**
 * @openapi
 * /loans/{id}/return:
 *   post:
 *     summary: Process a returned copy (admin, librarian)
 *     description: |
 *       Any open loan (ACTIVE, OVERDUE, RETURN_REQUESTED) becomes RETURNED. The copy becomes the given
 *       condition (AVAILABLE by default, or DAMAGED / LOST). Audits LOAN_RETURN_PROCESSED, plus
 *       BOOK_COPY_MARKED_DAMAGED or BOOK_COPY_MARKED_LOST when relevant.
 *     operationId: processLoanReturn
 *     tags:
 *       - Loans
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string, format: uuid } }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               copyCondition: { type: string, enum: [AVAILABLE, DAMAGED, LOST], default: AVAILABLE }
 *     responses:
 *       200:
 *         description: Return processed
 *       409:
 *         description: The loan is already closed
 * /loans/{id}/cancel:
 *   post:
 *     summary: Cancel a loan made by mistake (admin, librarian)
 *     description: An open loan becomes CANCELLED and its copy is AVAILABLE again. Audits LOAN_CANCELLED.
 *     operationId: cancelLoan
 *     tags:
 *       - Loans
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string, format: uuid } }
 *     responses:
 *       200:
 *         description: Loan cancelled
 *       409:
 *         description: The loan is already closed
 */
