// LIST SETTINGS
/**
 * @openapi
 * /settings:
 *   get:
 *     summary: List all system settings (admin)
 *     description: Every known setting with its current value. A setting that was never changed (or holds an invalid value) shows its default.
 *     operationId: listSettings
 *     tags:
 *       - Settings
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All settings
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/SystemSetting'
 *       403:
 *         description: Only admins manage settings
 */

// UPDATE A SETTING
/**
 * @openapi
 * /settings/{key}:
 *   patch:
 *     summary: Change a setting's value (admin)
 *     description: |
 *       The value is checked by the key's rule:
 *       - loanPeriodDays: whole number 1-90 (default 14)
 *       - maxActiveLoansPerMember: whole number 1-20 (default 5)
 *       A real change is audited as SYSTEM_SETTING_UPDATED with the key and the old and new value.
 *     operationId: updateSetting
 *     tags:
 *       - Settings
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - { in: path, name: key, required: true, schema: { type: string, enum: [loanPeriodDays, maxActiveLoansPerMember] } }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [value]
 *             properties:
 *               value: { type: integer, example: 21 }
 *     responses:
 *       200:
 *         description: Setting saved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/SystemSetting'
 *       400:
 *         description: Unknown key, or the value breaks the key's rule
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       403:
 *         description: Only admins manage settings
 */
