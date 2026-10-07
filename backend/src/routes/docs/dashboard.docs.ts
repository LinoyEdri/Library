// ROLE-BASED DASHBOARD
/**
 * @openapi
 * /dashboard:
 *   get:
 *     summary: The dashboard of the logged-in user's role (member, librarian, admin)
 *     description: |
 *       `data.kind` tells which payload was returned:
 *       - `member`: the member's loan counts (open, overdue, waiting for return, the loan limit) and every open loan, nearest due date first.
 *       - `staff` (librarian): library loan counts (open, overdue, waiting for return, lent and returned today),
 *         the 5 most overdue loans and the 5 oldest return requests.
 *       - `admin`: everything in `staff`, plus totals (active users per role, active books and members,
 *         copies per status) and the 10 newest audit log entries.
 *       Overdue means an open loan past its due date. "Today" counts from the server's local midnight.
 *     operationId: getDashboard
 *     tags:
 *       - Dashboard
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: The role's dashboard
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   oneOf:
 *                     - $ref: '#/components/schemas/MemberDashboard'
 *                     - $ref: '#/components/schemas/StaffDashboard'
 *                     - $ref: '#/components/schemas/AdminDashboard'
 *       401:
 *         description: Not logged in
 *       403:
 *         description: Guests (viewers) have no dashboard
 */
