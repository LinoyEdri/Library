// Reusable OpenAPI schemas, referenced from route docs with $ref: '#/components/schemas/<Name>'
export const openapiComponentSchemas = {
  ApiError: {
    type: 'object',
    required: ['success', 'message', 'error'],
    properties: {
      success: { type: 'boolean', example: false },
      message: { type: 'string', example: 'Validation failed' },
      error: {
        type: 'object',
        required: ['code'],
        properties: {
          code: { type: 'string', example: 'BAD_REQUEST' },
          details: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                field: { type: 'string', example: 'email' },
                message: { type: 'string', example: 'Invalid email address' },
                code: { type: 'string', example: 'invalid_format' },
              },
            },
          },
        },
      },
      requestId: {
        type: 'string',
        format: 'uuid',
        example: '688c03a8-affa-466e-9fa1-bebef9d212d9',
      },
    },
  },

  Role: {
    type: 'string',
    enum: ['ADMIN', 'LIBRARIAN', 'MEMBER', 'VIEWER'],
    example: 'VIEWER',
  },

  RecordStatus: {
    type: 'string',
    enum: ['ACTIVE', 'DISABLED'],
    example: 'ACTIVE',
  },

  AddressInput: {
    type: 'object',
    required: ['street', 'houseNumber', 'apartmentOrUnit', 'city'],
    properties: {
      street: { type: 'string', minLength: 1, maxLength: 255, example: 'הרצל' },
      houseNumber: { type: 'string', minLength: 1, maxLength: 50, example: '12' },
      apartmentOrUnit: { type: 'string', minLength: 1, maxLength: 50, example: '4' },
      city: { type: 'string', minLength: 1, maxLength: 100, example: 'תל אביב' },
      postalCode: {
        type: 'string',
        nullable: true,
        maxLength: 7,
        pattern: '^[0-9]+$',
        example: '6100000',
      },
      country: { type: 'string', maxLength: 100, default: 'Israel', example: 'Israel' },
    },
  },

  Address: {
    allOf: [
      { $ref: '#/components/schemas/AddressInput' },
      {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
        },
      },
    ],
  },

  SafeUser: {
    type: 'object',
    properties: {
      id: { type: 'string', format: 'uuid', example: '01a0b3e4-41dd-730c-b841-5b9faf980ce0' },
      firstName: { type: 'string', example: 'דנה' },
      lastName: { type: 'string', example: 'כהן' },
      email: { type: 'string', format: 'email', example: 'dana@example.com' },
      phoneNumber: { type: 'string', example: '0501234567' },
      status: { $ref: '#/components/schemas/RecordStatus' },
      role: { $ref: '#/components/schemas/Role' },
      address: { $ref: '#/components/schemas/Address' },
      lastLoginDate: { type: 'string', format: 'date-time', nullable: true },
      membershipStatus: {
        type: 'string',
        enum: ['ACTIVE', 'DISABLED'],
        nullable: true,
        description: 'Library membership status; null when the user is not a member',
      },
    },
  },

  LoginResult: {
    type: 'object',
    properties: {
      accessToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
      tokenType: { type: 'string', example: 'Bearer' },
      expiresIn: { type: 'string', example: '1h' },
      expiresAt: { type: 'string', format: 'date-time' },
      user: { $ref: '#/components/schemas/SafeUser' },
    },
  },
};
