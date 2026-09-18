
// REGISTER
/**
 * @openapi
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     description: Creates a new user account with the provided credentials and address information.
 *     operationId: registerUser
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - firstName
 *               - lastName
 *               - email
 *               - password
 *               - phoneNumber
 *               - address
 *             properties:
 *               firstName:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 100
 *                 pattern: '^[A-Za-z]+$'
 *                 example: Linoy
 *               lastName:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 100
 *                 pattern: '^[A-Za-z]+$'
 *                 example: Edri
 *               email:
 *                 type: string
 *                 format: email
 *                 example: linoy@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 8
 *                 maxLength: 128
 *                 example: StrongP@ssw0rd
 *               phoneNumber:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 10
 *                 pattern: '^[0-9]+$'
 *                 example: '0501234567'
 *               address:
 *                 type: object
 *                 required:
 *                   - street
 *                   - houseNumber
 *                   - apartmentOrUnit
 *                   - city
 *                 properties:
 *                   street:
 *                     type: string
 *                     minLength: 1
 *                     maxLength: 255
 *                     pattern: '^[A-Za-z]+$'
 *                     example: Herzl
 *                   houseNumber:
 *                     type: string
 *                     minLength: 1
 *                     maxLength: 50
 *                     example: '12'
 *                   apartmentOrUnit:
 *                     type: string
 *                     minLength: 1
 *                     maxLength: 50
 *                     example: 4B
 *                   city:
 *                     type: string
 *                     minLength: 1
 *                     maxLength: 100
 *                     pattern: '^[A-Za-z]+$'
 *                     example: TelAviv
 *                   postalCode:
 *                     type: string
 *                     nullable: true
 *                     minLength: 1
 *                     maxLength: 7
 *                     pattern: '^[0-9]+$'
 *                     example: '6100000'
 *                   country:
 *                     type: string
 *                     minLength: 1
 *                     maxLength: 100
 *                     pattern: '^[A-Za-z]+$'
 *                     default: Israel
 *                     example: Israel
 *             examples:
 *               fullPayload:
 *                 summary: Success — all fields including optional ones
 *                 value:
 *                   firstName: Linoy
 *                   lastName: Edri
 *                   email: linoy@example.com
 *                   password: StrongP@ssw0rd
 *                   phoneNumber: '0501234567'
 *                   address:
 *                     street: Herzl
 *                     houseNumber: '12'
 *                     apartmentOrUnit: 4B
 *                     city: TelAviv
 *                     postalCode: '6100000'
 *                     country: Israel
 *               minimalPayload:
 *                 summary: Success — optional fields omitted (postalCode null, country removed)
 *                 value:
 *                   firstName: Linoy
 *                   lastName: Edri
 *                   email: linoy2@example.com
 *                   password: StrongP@ssw0rd
 *                   phoneNumber: '0501234567'
 *                   address:
 *                     street: Herzl
 *                     houseNumber: '12'
 *                     apartmentOrUnit: 4B
 *                     city: TelAviv
 *                     postalCode: null
 *               invalidPayload:
 *                 summary: Failure — missing required field and invalid name format
 *                 value:
 *                   firstName: Linoy3
 *                   lastName: Edri
 *                   email: linoy@example.com
 *                   phoneNumber: '0501234567'
 *                   address:
 *                     street: Herzl
 *                     houseNumber: '12'
 *                     apartmentOrUnit: 4B
 *                     city: TelAviv
 *               duplicateEmailPayload:
 *                 summary: Failure — email already registered
 *                 value:
 *                   firstName: Linoy
 *                   lastName: Edri
 *                   email: linoy@example.com
 *                   password: StrongP@ssw0rd
 *                   phoneNumber: '0501234567'
 *                   address:
 *                     street: Herzl
 *                     houseNumber: '12'
 *                     apartmentOrUnit: 4B
 *                     city: TelAviv
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   format: uuid
 *                   example: 01a0b3e4-41dd-730c-b841-5b9faf980ce0
 *                 firstName:
 *                   type: string
 *                   example: Linoy
 *                 lastName:
 *                   type: string
 *                   example: Edri
 *                 email:
 *                   type: string
 *                   format: email
 *                   example: linoy@example.com
 *                 phoneNumber:
 *                   type: string
 *                   example: '0501234567'
 *                 status:
 *                   type: string
 *                   enum: [ACTIVE, DISABLED]
 *                   example: ACTIVE
 *                 role:
 *                   type: string
 *                   enum: [VIEWER, ADMIN]
 *                   example: VIEWER
 *                 lastLoginDate:
 *                   type: string
 *                   format: date-time
 *                   nullable: true
 *                   example: null
 *             examples:
 *               fullPayloadResponse:
 *                 summary: Registered with full payload
 *                 value:
 *                   id: 01a0b3e4-41dd-730c-b841-5b9faf980ce0
 *                   firstName: Linoy
 *                   lastName: Edri
 *                   email: linoy@example.com
 *                   phoneNumber: '0501234567'
 *                   status: ACTIVE
 *                   role: VIEWER
 *                   lastLoginDate: null
 *               minimalPayloadResponse:
 *                 summary: Registered with optional fields omitted
 *                 value:
 *                   id: 02b1c4f5-52ee-841d-c952-6c0fbf091df1
 *                   firstName: Linoy
 *                   lastName: Edri
 *                   email: linoy2@example.com
 *                   phoneNumber: '0501234567'
 *                   status: ACTIVE
 *                   role: VIEWER
 *                   lastLoginDate: null
 *       400:
 *         description: Validation error — missing required fields or invalid field format
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Validation failed
 *                 error:
 *                   type: object
 *                   properties:
 *                     code:
 *                       type: string
 *                       example: BAD_REQUEST
 *                     details:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           field:
 *                             type: string
 *                             example: firstName
 *                           message:
 *                             type: string
 *                             example: First name must contain letters only
 *                           code:
 *                             type: string
 *                             example: invalid_format
 *                 requestId:
 *                   type: string
 *                   format: uuid
 *                   example: 688c03a8-affa-466e-9fa1-bebef9d212d9
 *             example:
 *               success: false
 *               message: Validation failed
 *               error:
 *                 code: BAD_REQUEST
 *                 details:
 *                   - field: firstName
 *                     message: First name must contain letters only
 *                     code: invalid_format
 *                   - field: password
 *                     message: 'Invalid input: expected string, received undefined'
 *                     code: invalid_type
 *               requestId: 688c03a8-affa-466e-9fa1-bebef9d212d9
 *       409:
 *         description: Conflict — a user with this email already exists
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: This email address is already registered
 *                 error:
 *                   type: object
 *                   properties:
 *                     code:
 *                       type: string
 *                       example: CONFLICT
 *                 requestId:
 *                   type: string
 *                   format: uuid
 *                   example: 9a61e347-eb32-449a-8c30-3fd889580bb2
 *             example:
 *               success: false
 *               message: This email address is already registered
 *               error:
 *                 code: CONFLICT
 *               requestId: 9a61e347-eb32-449a-8c30-3fd889580bb2
 */


// LOGIN 
/**
 * @openapi
 * /auth/login:
 *   post:
 *     summary: Authenticate a user
 *     description: Validates credentials and returns a signed JWT access token. Returns a generic error for all failure cases (missing user, incorrect password, disabled account) to prevent user enumeration.
 *     operationId: loginUser
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: StrongP@ssw0rd
 *     responses:
 *       200:
 *         description: Login successful
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
 *                   example: Login successful
 *                 data:
 *                   type: object
 *                   properties:
 *                     accessToken:
 *                       type: string
 *                       example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *       401:
 *         description: Invalid credentials — returned uniformly for non-existent user, wrong password, or disabled account
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Invalid credentials
 */

// ME
/**
 * @openapi
 * /auth/me:
 *   get:
 *     summary: Get current authenticated user
 *     description: Returns the profile of the currently authenticated user, resolved from the JWT `sub` claim.
 *     operationId: getCurrentUser
 *     tags:
 *       - Auth
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current user profile
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
 *                   example: User retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                       example: 3fa85f64-5717-4562-b3fc-2c963f66afa6
 *                     email:
 *                       type: string
 *                       format: email
 *                       example: user@example.com
 *                     role:
 *                       type: string
 *                       example: member
 *       401:
 *         description: Missing, invalid, or expired access token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Unauthorized
 */
