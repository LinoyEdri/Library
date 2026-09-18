// OPENAPI.JSON
/**
 * @openapi
 * /openapi.json:
 *   get:
 *     summary: Retrieve raw OpenAPI specification
 *     description: Returns the raw, unwrapped OpenAPI 3.x document (not wrapped in ApiResponse) for tooling compatibility (e.g. Postman, codegen).
 *     tags:
 *       - Docs
 *     responses:
 *       200:
 *         description: OpenAPI specification document
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               description: Raw OpenAPI 3.x document
 */