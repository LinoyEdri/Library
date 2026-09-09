/**
 * Seed script: fills an empty database with a realistic starting catalogue.
 *
 * Run with:  npm run db:seed        (from backend/)
 *            npm run db:seed        (from the repo root, via the passthrough)
 *
 * The script clears every table first, so it is safe to run repeatedly during
 * development. That also makes it destructive, hence the production guard.
 */
import bcrypt from 'bcryptjs';
import prisma from '../src/prisma/prisma.ts';
import { Prisma, Role, CopyStatus } from '@prisma/client';
import { EnvironmentConfigError } from '../src/constants/types/errors/EnvironmentConfigError.ts';
import { logger } from '../src/logger/logger.ts';

const SEED_PASSWORD = process.env.SEED_PASSWORD ?? 'Password123!';
const BCRYPT_ROUNDS = 10;

/**
 * Delete every row, children before parents.
 *
 * Order matters: every relation uses onDelete: Restrict, so a parent cannot be
 * removed while anything still points at it.
 */
async function clearDatabase(tx: Prisma.TransactionClient): Promise<void> {
  await tx.auditLog.deleteMany();
  await tx.loan.deleteMany();
  await tx.bookCopy.deleteMany();
  await tx.bookCategory.deleteMany();
  await tx.bookAuthor.deleteMany();
  await tx.book.deleteMany();
  await tx.category.deleteMany();
  await tx.publisher.deleteMany();
  await tx.author.deleteMany();
  await tx.member.deleteMany();
  await tx.user.deleteMany();
  await tx.address.deleteMany();
}

async function main(): Promise<void> {
  if (process.env.NODE_ENV === 'production') {
    throw new EnvironmentConfigError('Refusing to run the seed script with NODE_ENV=production.');
  }

  if (process.env.ALLOW_DESTRUCTIVE_SEED !== 'true') {
    throw new EnvironmentConfigError(
      'Set ALLOW_DESTRUCTIVE_SEED=true to run this destructive seed.',
    );
  }

  // Hashing is CPU work that touches no database, so it runs before the
  // transaction opens rather than holding a connection while it burns cycles.
  const passwordHash = await bcrypt.hash(SEED_PASSWORD, BCRYPT_ROUNDS);

  // Every write below runs inside one interactive transaction: the clear and
  // all of the inserts either land together or not at all. A failure part-way
  // through leaves the database exactly as it was, rather than cleared and
  // half-populated.
  const { admin, librarian, members } = await prisma.$transaction(
    async (tx) => {
      logger.info('Clearing existing data...');
      await clearDatabase(tx);

      // -------------------------------------------------------------------------
      // Staff accounts
      //
      // The address is created inline through a nested write: Prisma inserts the
      // Address row first, then the User row pointing at it, inside one implicit
      // transaction.
      // -------------------------------------------------------------------------

      logger.info('Creating staff users...');

      const admin = await tx.user.create({
        data: {
          firstName: 'שרה',
          lastName: 'מנהלת',
          email: 'admin@library.local',
          passwordHash,
          // A String, not a number: the leading zero and the dash both matter.
          phoneNumber: '0501112233',
          role: Role.ADMIN,
          address: {
            create: {
              street: 'הרצל',
              houseNumber: '12א',
              apartmentOrUnit: '3',
              city: 'תל אביב',
              postalCode: '6100001',
            },
          },
          // createdByUserId is deliberately omitted: the first admin has no creator.
        },
      });

      const librarian = await tx.user.create({
        data: {
          firstName: 'דוד',
          lastName: 'ספרן',
          email: 'librarian@library.local',
          passwordHash,
          phoneNumber: '0522223344',
          role: Role.LIBRARIAN,
          createdBy: { connect: { id: admin.id } },
          address: {
            create: {
              street: 'בן גוריון',
              houseNumber: '45',
              apartmentOrUnit: '12',
              city: 'רמת גן',
              postalCode: '5252001',
            },
          },
        },
      });

      // -------------------------------------------------------------------------
      // Members
      //
      // Each one is a User with role MEMBER plus a Member row, both created in a
      // single nested write. Member.userId is filled in by Prisma automatically.
      // -------------------------------------------------------------------------

      logger.info('Creating members...');

      const memberSeeds = [
        {
          firstName: 'דנה',
          lastName: 'כהן',
          email: 'dana.cohen@example.com',
          phoneNumber: '0543334455',
          street: 'דיזנגוף',
          houseNumber: '88',
          apartmentOrUnit: '7',
          city: 'תל אביב',
          postalCode: '6433302',
        },
        {
          firstName: 'יוסי',
          lastName: 'לוי',
          email: 'yossi.levi@example.com',
          phoneNumber: '0534445566',
          street: 'ויצמן',
          houseNumber: '3ב',
          apartmentOrUnit: '1',
          city: 'כפר סבא',
          postalCode: '4424003',
        },
        {
          firstName: 'מיכל',
          lastName: 'אברהם',
          email: 'michal.avraham@example.com',
          phoneNumber: '0585556677',
          street: 'הנשיא',
          houseNumber: '21',
          apartmentOrUnit: '4',
          city: 'חיפה',
          postalCode: '3303004',
        },
        {
          firstName: 'אורי',
          lastName: 'מזרחי',
          email: 'uri.mizrahi@example.com',
          phoneNumber: '0506667788',
          street: 'יפו',
          houseNumber: '104',
          apartmentOrUnit: '9',
          city: 'ירושלים',
          postalCode: '9414005',
        },
      ];

      const members = [];
      for (const seed of memberSeeds) {
        const user = await tx.user.create({
          data: {
            firstName: seed.firstName,
            lastName: seed.lastName,
            email: seed.email,
            passwordHash,
            phoneNumber: seed.phoneNumber,
            role: Role.MEMBER,
            createdBy: { connect: { id: librarian.id } },
            address: {
              create: {
                street: seed.street,
                houseNumber: seed.houseNumber,
                apartmentOrUnit: seed.apartmentOrUnit,
                city: seed.city,
                postalCode: seed.postalCode,
              },
            },
            // The borrowing record, created in the same statement.
            member: {
              create: {
                registeredBy: { connect: { id: librarian.id } },
              },
            },
          },
          include: { member: true },
        });
        members.push(user);
      }

      // -------------------------------------------------------------------------
      // Catalogue reference data
      //
      // createdByUserId is required on all of these, which is why the admin has to
      // exist before any of them.
      // -------------------------------------------------------------------------

      logger.info('Creating publishers, authors and categories...');

      const publisherNames = [
        { name: 'עם עובד', description: 'הוצאת ספרים ותיקה, ספרות מקור ותרגום.' },
        { name: 'כתר', description: 'הוצאה לאור לספרות יפה ועיון.' },
        { name: 'זמורה ביתן', description: 'ספרות מקור, תרגום וספרי ילדים.' },
        { name: 'כנרת', description: 'עיון, ביוגרפיה וספרות פופולרית.' },
      ];

      const publishers: Record<string, string> = {};
      for (const p of publisherNames) {
        const publisher = await tx.publisher.create({
          data: {
            name: p.name,
            description: p.description,
            createdBy: { connect: { id: admin.id } },
          },
        });
        publishers[p.name] = publisher.id;
      }

      const authorSeeds = [
        { firstName: 'עמוס', lastName: 'עוז', biography: 'סופר ומסאי ישראלי.' },
        { firstName: 'דויד', lastName: 'גרוסמן', biography: 'סופר ישראלי, זוכה פרס ישראל.' },
        { firstName: 'אתגר', lastName: 'קרת', biography: 'סופר ותסריטאי, ידוע בסיפוריו הקצרים.' },
        { firstName: 'מאיר', lastName: 'שלו', biography: 'סופר, טוראי ומחבר ספרי ילדים.' },
        { firstName: 'צרויה', lastName: 'שלו', biography: 'סופרת ומשוררת ישראלית.' },
        {
          firstName: 'יובל נח',
          lastName: 'הררי',
          biography: 'היסטוריון וחוקר, מרצה באוניברסיטה העברית.',
        },
      ];

      const authors: Record<string, string> = {};
      for (const a of authorSeeds) {
        const author = await tx.author.create({
          data: {
            firstName: a.firstName,
            lastName: a.lastName,
            biography: a.biography,
            createdBy: { connect: { id: admin.id } },
          },
        });
        authors[`${a.firstName} ${a.lastName}`] = author.id;
      }

      const categoryNames = [
        'ספרות ישראלית',
        'מדע בדיוני',
        'היסטוריה',
        'ילדים ונוער',
        'עיון',
        'שירה',
      ];

      const categories: Record<string, string> = {};
      for (const name of categoryNames) {
        const category = await tx.category.create({
          data: { name, createdBy: { connect: { id: admin.id } } },
        });
        categories[name] = category.id;
      }

      // -------------------------------------------------------------------------
      // Books, with their authors, categories and physical copies
      //
      // One nested write per book creates the Book row, its BookAuthor and
      // BookCategory join rows, and every BookCopy - all in one transaction.
      // -------------------------------------------------------------------------

      logger.info('Creating books and copies...');

      const bookSeeds = [
        {
          title: 'סיפור על אהבה וחושך',
          isbn: '9789650000001',
          publisher: 'עם עובד',
          publicationYear: 2002,
          authors: ['עמוס עוז'],
          categories: ['ספרות ישראלית'],
          copies: 3,
          description: 'אוטוביוגרפיה ספרותית על ילדות בירושלים.',
        },
        {
          title: 'מיכאל שלי',
          isbn: '9789650000002',
          publisher: 'עם עובד',
          publicationYear: 1968,
          authors: ['עמוס עוז'],
          categories: ['ספרות ישראלית'],
          copies: 2,
          description: 'רומן על נישואים בירושלים של שנות החמישים.',
        },
        {
          title: 'אישה בורחת מבשורה',
          isbn: '9789650000003',
          publisher: 'כתר',
          publicationYear: 2008,
          authors: ['דויד גרוסמן'],
          categories: ['ספרות ישראלית'],
          copies: 4,
          description: 'מסע רגלי בגליל כניסיון לברוח מבשורה איומה.',
        },
        {
          title: 'פתאום דפיקה בדלת',
          isbn: '9789650000004',
          publisher: 'זמורה ביתן',
          publicationYear: 2010,
          authors: ['אתגר קרת'],
          categories: ['ספרות ישראלית', 'מדע בדיוני'],
          copies: 2,
          description: 'אוסף סיפורים קצרים.',
        },
        {
          title: 'רומן רוסי',
          isbn: '9789650000005',
          publisher: 'עם עובד',
          publicationYear: 1988,
          authors: ['מאיר שלו'],
          categories: ['ספרות ישראלית'],
          copies: 3,
          description: 'סאגה משפחתית בכפר בעמק.',
        },
        {
          title: 'חיי אהבה',
          isbn: '9789650000006',
          publisher: 'כתר',
          publicationYear: 1997,
          authors: ['צרויה שלו'],
          categories: ['ספרות ישראלית'],
          copies: 2,
          description: 'רומן על אובססיה ואהבה.',
        },
        {
          title: 'קיצור תולדות האנושות',
          isbn: '9789650000007',
          publisher: 'כנרת',
          publicationYear: 2011,
          authors: ['יובל נח הררי'],
          categories: ['היסטוריה', 'עיון'],
          copies: 5,
          description: 'סקירה של תולדות המין האנושי מראשיתו.',
        },
        {
          title: '21 מחשבות על המאה ה-21',
          isbn: '9789650000008',
          publisher: 'כנרת',
          publicationYear: 2018,
          authors: ['יובל נח הררי'],
          categories: ['עיון'],
          copies: 3,
          description: 'מסות על האתגרים של ההווה.',
        },
      ];

      /** Give a few copies a non-default status so the catalogue is not uniform. */
      const copyStatusFor = (bookIndex: number, copyIndex: number) => {
        if (bookIndex === 2 && copyIndex === 3) return CopyStatus.DAMAGED;
        if (bookIndex === 6 && copyIndex === 4) return CopyStatus.LOST;
        return CopyStatus.AVAILABLE;
      };

      let barcodeCounter = 1;

      for (const [bookIndex, seed] of bookSeeds.entries()) {
        await tx.book.create({
          data: {
            title: seed.title,
            isbn: seed.isbn,
            publisher: { connect: { id: publishers[seed.publisher] } },
            publicationYear: seed.publicationYear,
            description: seed.description,
            language: 'עברית',
            imageUrl: `https://placehold.co/300x450?text=${seed.title}`,
            createdBy: { connect: { id: admin.id } },

            // Join rows. The first author listed is marked as the primary one.
            authors: {
              create: seed.authors.map((name, i) => ({
                author: { connect: { id: authors[name] } },
                isPrimaryAuthor: i === 0,
              })),
            },
            categories: {
              create: seed.categories.map((name) => ({
                category: { connect: { id: categories[name] } },
              })),
            },

            // Physical items on the shelf.
            copies: {
              create: Array.from({ length: seed.copies }, (_, copyIndex) => ({
                barcode: `LIB-${String(barcodeCounter++).padStart(6, '0')}`,
                status: copyStatusFor(bookIndex, copyIndex),
                createdBy: { connect: { id: admin.id } },
              })),
            },
          },
        });
      }

      return { admin, librarian, members };
    },
    {
      // Prisma's default interactive-transaction timeout is 5 seconds, which
      // 40-odd sequential statements can exceed on a slow machine.
      timeout: 60_000,
      maxWait: 10_000,
    },
  );

  // -------------------------------------------------------------------------
  // Summary (read after commit, so it reports what actually persisted)
  // -------------------------------------------------------------------------

  const counts = {
    addresses: await prisma.address.count(),
    users: await prisma.user.count(),
    members: await prisma.member.count(),
    publishers: await prisma.publisher.count(),
    authors: await prisma.author.count(),
    categories: await prisma.category.count(),
    books: await prisma.book.count(),
    bookAuthors: await prisma.bookAuthor.count(),
    bookCategories: await prisma.bookCategory.count(),
    bookCopies: await prisma.bookCopy.count(),
  };

  logger.info('\nSeed complete:');
  for (const [table, count] of Object.entries(counts)) {
    logger.info(`${table.padEnd(16)} ${count}`);
  }

  logger.info(`'\nSeed users were created using SEED_PASSWORD or the local default password.`);
  logger.info({
    admin: admin.email,
    librarian: librarian.email,
    member: members[0].email,
  });
}

main()
  .catch((error: unknown) => {
    if (error instanceof EnvironmentConfigError) {
      logger.fatal(
        {
          type: error.type,
          statusCode: error.statusCode,
        },
        `Seed failed: ${error.message}`,
      );
    } else if (error instanceof Error) {
      logger.fatal({ err: error }, `Seed failed with unexpected system error: ${error.message}`);
    } else {
      logger.fatal({ rawError: error }, 'Seed failed with an unknown error:');
    }
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
