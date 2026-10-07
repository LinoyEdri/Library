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
  PaginationMeta: {
    type: 'object',
    properties: {
      page: { type: 'integer', example: 1 },
      pageSize: { type: 'integer', example: 20 },
      totalItems: { type: 'integer', example: 42 },
      totalPages: { type: 'integer', example: 3 },
    },
  },

  RecordLifecycle: {
    type: 'object',
    properties: {
      id: { type: 'string', format: 'uuid' },
      status: { $ref: '#/components/schemas/RecordStatus' },
      createdDate: { type: 'string', format: 'date-time' },
      updatedDate: { type: 'string', format: 'date-time' },
      disabledDate: { type: 'string', format: 'date-time', nullable: true },
    },
  },

  AuthorDetails: {
    type: 'object',
    required: ['firstName', 'lastName'],
    properties: {
      firstName: { type: 'string', maxLength: 100, example: 'עמוס' },
      lastName: { type: 'string', maxLength: 100, example: 'עוז' },
      biography: { type: 'string', maxLength: 2000, nullable: true },
    },
  },

  Author: {
    allOf: [
      { $ref: '#/components/schemas/RecordLifecycle' },
      { $ref: '#/components/schemas/AuthorDetails' },
    ],
  },

  PublisherDetails: {
    type: 'object',
    required: ['name'],
    properties: {
      name: { type: 'string', maxLength: 200, example: 'כנרת זמורה', description: 'Unique' },
      description: { type: 'string', maxLength: 2000, nullable: true },
    },
  },

  Publisher: {
    allOf: [
      { $ref: '#/components/schemas/RecordLifecycle' },
      { $ref: '#/components/schemas/PublisherDetails' },
    ],
  },

  CategoryDetails: {
    type: 'object',
    required: ['name'],
    properties: {
      name: { type: 'string', maxLength: 100, example: 'רומן', description: 'Unique' },
    },
  },

  Category: {
    allOf: [
      { $ref: '#/components/schemas/RecordLifecycle' },
      { $ref: '#/components/schemas/CategoryDetails' },
    ],
  },
  BookDetailsInput: {
    type: 'object',
    required: ['title', 'publisherId', 'authorIds', 'language'],
    properties: {
      title: { type: 'string', maxLength: 300, example: 'סיפור על אהבה וחושך' },
      isbn: {
        type: 'string',
        nullable: true,
        description: 'ISBN-10 or ISBN-13 with a valid check digit; hyphens allowed',
        example: '978-965-00-0001-1',
      },
      publisherId: { type: 'string', format: 'uuid' },
      authorIds: {
        type: 'array',
        minItems: 1,
        items: { type: 'string', format: 'uuid' },
        description: 'The first author is the primary author',
      },
      categoryIds: { type: 'array', items: { type: 'string', format: 'uuid' } },
      publicationYear: { type: 'integer', nullable: true, example: 2002 },
      language: { type: 'string', maxLength: 50, example: 'עברית' },
      imageUrl: { type: 'string', description: 'Image URL or empty string' },
      description: { type: 'string', nullable: true, maxLength: 5000 },
    },
  },

  BookCopy: {
    type: 'object',
    properties: {
      id: { type: 'string', format: 'uuid' },
      barcode: { type: 'string', example: 'LIB-000001' },
      status: { type: 'string', enum: ['AVAILABLE', 'ON_LOAN', 'DISABLED', 'LOST', 'DAMAGED'] },
      acquisitionDate: { type: 'string', format: 'date-time' },
      updatedDate: { type: 'string', format: 'date-time' },
      disabledDate: { type: 'string', format: 'date-time', nullable: true },
    },
  },

  BookSummary: {
    type: 'object',
    properties: {
      id: { type: 'string', format: 'uuid' },
      title: { type: 'string' },
      isbn: { type: 'string', nullable: true },
      language: { type: 'string' },
      publicationYear: { type: 'integer', nullable: true },
      imageUrl: { type: 'string' },
      status: { $ref: '#/components/schemas/RecordStatus' },
      publisher: {
        type: 'object',
        properties: { id: { type: 'string' }, name: { type: 'string' } },
      },
      authors: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            firstName: { type: 'string' },
            lastName: { type: 'string' },
            isPrimaryAuthor: { type: 'boolean' },
          },
        },
      },
      categories: {
        type: 'array',
        items: { type: 'object', properties: { id: { type: 'string' }, name: { type: 'string' } } },
      },
      availableCopies: { type: 'integer', description: 'Copies on the shelf now' },
      totalCopies: { type: 'integer', description: 'Copies in circulation (available + on loan)' },
    },
  },

  BookDetails: {
    allOf: [
      { $ref: '#/components/schemas/BookSummary' },
      {
        type: 'object',
        properties: {
          description: { type: 'string', nullable: true },
          createdDate: { type: 'string', format: 'date-time' },
          updatedDate: { type: 'string', format: 'date-time' },
          disabledDate: { type: 'string', format: 'date-time', nullable: true },
          copies: {
            type: 'array',
            items: { $ref: '#/components/schemas/BookCopy' },
            description: 'Only for staff',
          },
        },
      },
    ],
  },
  Member: {
    type: 'object',
    properties: {
      id: { type: 'string', format: 'uuid' },
      userId: { type: 'string', format: 'uuid' },
      status: { $ref: '#/components/schemas/RecordStatus' },
      registrationDate: { type: 'string', format: 'date-time' },
      updatedDate: { type: 'string', format: 'date-time' },
      disabledDate: { type: 'string', format: 'date-time', nullable: true },
      firstName: { type: 'string' },
      lastName: { type: 'string' },
      email: { type: 'string', format: 'email' },
      phoneNumber: { type: 'string' },
      address: { $ref: '#/components/schemas/Address' },
      accountStatus: { $ref: '#/components/schemas/RecordStatus' },
    },
  },

  MemberDetailsInput: {
    type: 'object',
    required: ['firstName', 'lastName', 'phoneNumber', 'address'],
    properties: {
      firstName: { type: 'string', maxLength: 100 },
      lastName: { type: 'string', maxLength: 100 },
      phoneNumber: { type: 'string', pattern: '^[0-9]{9,10}$' },
      address: { $ref: '#/components/schemas/AddressInput' },
    },
  },
  ManagedUser: {
    allOf: [
      { $ref: '#/components/schemas/SafeUser' },
      {
        type: 'object',
        properties: {
          createdDate: { type: 'string', format: 'date-time' },
          updatedDate: { type: 'string', format: 'date-time' },
          disabledDate: { type: 'string', format: 'date-time', nullable: true },
          memberId: { type: 'string', format: 'uuid', nullable: true },
        },
      },
    ],
  },
  SystemSetting: {
    type: 'object',
    properties: {
      key: { type: 'string', enum: ['loanPeriodDays', 'maxActiveLoansPerMember'] },
      value: { type: 'integer', example: 14 },
      defaultValue: { type: 'integer', example: 14 },
      updatedDate: { type: 'string', format: 'date-time', nullable: true },
    },
  },

  LoanStatus: {
    type: 'string',
    enum: ['ACTIVE', 'RETURN_REQUESTED', 'RETURNED', 'OVERDUE', 'CANCELLED'],
    example: 'ACTIVE',
  },

  LoanActor: {
    type: 'object',
    nullable: true,
    properties: {
      id: { type: 'string', format: 'uuid' },
      firstName: { type: 'string' },
      lastName: { type: 'string' },
    },
  },

  Loan: {
    type: 'object',
    properties: {
      id: { type: 'string', format: 'uuid' },
      status: { $ref: '#/components/schemas/LoanStatus' },
      createdDate: { type: 'string', format: 'date-time' },
      dueDate: { type: 'string', format: 'date-time' },
      returnRequestedDate: { type: 'string', format: 'date-time', nullable: true },
      returnRequestCancelledDate: { type: 'string', format: 'date-time', nullable: true },
      returnDate: { type: 'string', format: 'date-time', nullable: true },
      returnProcessedDate: { type: 'string', format: 'date-time', nullable: true },
      updatedDate: { type: 'string', format: 'date-time' },
      isPastDue: { type: 'boolean', description: 'Open and past the due date' },
      member: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          firstName: { type: 'string' },
          lastName: { type: 'string' },
          email: { type: 'string', format: 'email' },
        },
      },
      book: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          title: { type: 'string' },
          imageUrl: { type: 'string', nullable: true },
        },
      },
      copy: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          barcode: { type: 'string' },
          status: { type: 'string', enum: ['AVAILABLE', 'ON_LOAN', 'DISABLED', 'LOST', 'DAMAGED'] },
        },
      },
      createdBy: { $ref: '#/components/schemas/LoanActor' },
      returnProcessedBy: { $ref: '#/components/schemas/LoanActor' },
    },
  },

  CreateLoanInput: {
    type: 'object',
    required: ['memberId'],
    description: 'At least one of bookId or barcode is required',
    properties: {
      memberId: { type: 'string', format: 'uuid' },
      bookId: { type: 'string', format: 'uuid' },
      barcode: { type: 'string', example: 'LIB-000001' },
    },
  },

  MemberDashboard: {
    type: 'object',
    properties: {
      kind: { type: 'string', enum: ['member'] },
      statistics: {
        type: 'object',
        properties: {
          openLoans: { type: 'integer' },
          overdueLoans: { type: 'integer' },
          pendingReturns: { type: 'integer' },
          maxActiveLoans: { type: 'integer', description: 'The maxActiveLoansPerMember setting' },
        },
      },
      openLoans: { type: 'array', items: { $ref: '#/components/schemas/Loan' } },
    },
  },

  StaffDashboard: {
    type: 'object',
    properties: {
      kind: { type: 'string', enum: ['staff'] },
      statistics: {
        type: 'object',
        properties: {
          openLoans: { type: 'integer' },
          overdueLoans: { type: 'integer' },
          pendingReturns: { type: 'integer' },
          loansCreatedToday: { type: 'integer' },
          returnsProcessedToday: { type: 'integer' },
        },
      },
      overdueLoans: { type: 'array', items: { $ref: '#/components/schemas/Loan' } },
      pendingReturnLoans: { type: 'array', items: { $ref: '#/components/schemas/Loan' } },
    },
  },

  AdminDashboard: {
    allOf: [
      { $ref: '#/components/schemas/StaffDashboard' },
      {
        type: 'object',
        properties: {
          kind: { type: 'string', enum: ['admin'] },
          totals: {
            type: 'object',
            properties: {
              activeUsersByRole: {
                type: 'object',
                additionalProperties: { type: 'integer' },
                example: { ADMIN: 1, LIBRARIAN: 1, MEMBER: 4, VIEWER: 0 },
              },
              activeBooks: { type: 'integer' },
              activeMembers: { type: 'integer' },
              copiesByStatus: {
                type: 'object',
                additionalProperties: { type: 'integer' },
                example: { AVAILABLE: 20, ON_LOAN: 3, DISABLED: 0, LOST: 1, DAMAGED: 0 },
              },
            },
          },
          recentAuditEntries: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string', format: 'uuid' },
                actionType: { type: 'string', example: 'LOAN_CREATED' },
                affectedType: { type: 'string', example: 'LOAN' },
                affectedRecordId: { type: 'string', nullable: true },
                createdDate: { type: 'string', format: 'date-time' },
                actionUserRole: { $ref: '#/components/schemas/Role' },
                actionUser: { $ref: '#/components/schemas/LoanActor' },
              },
            },
          },
        },
      },
    ],
  },
};
