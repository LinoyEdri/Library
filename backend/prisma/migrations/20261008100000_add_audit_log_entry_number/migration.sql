-- A running number for every audit entry (1, 2, 3...), shown in the app instead of the uuid.
-- Existing entries are numbered by date. The append-only trigger is paused only for that one-time numbering.

ALTER TABLE "AuditLog" ADD COLUMN "entryNumber" INTEGER;

ALTER TABLE "AuditLog" DISABLE TRIGGER "AuditLog_append_only";

UPDATE "AuditLog" AS "entry"
SET "entryNumber" = "numbered"."rowNumber"
FROM (
  SELECT "id", ROW_NUMBER() OVER (ORDER BY "createdDate", "id") AS "rowNumber"
  FROM "AuditLog"
) AS "numbered"
WHERE "entry"."id" = "numbered"."id";

ALTER TABLE "AuditLog" ENABLE TRIGGER "AuditLog_append_only";

-- New entries continue after the highest existing number
CREATE SEQUENCE "AuditLog_entryNumber_seq" OWNED BY "AuditLog"."entryNumber";

SELECT setval('"AuditLog_entryNumber_seq"', COALESCE((SELECT MAX("entryNumber") FROM "AuditLog"), 0) + 1, false);

ALTER TABLE "AuditLog" ALTER COLUMN "entryNumber" SET DEFAULT nextval('"AuditLog_entryNumber_seq"');

ALTER TABLE "AuditLog" ALTER COLUMN "entryNumber" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "AuditLog_entryNumber_key" ON "AuditLog"("entryNumber");
