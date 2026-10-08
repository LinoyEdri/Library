-- The apartment number is optional: people living in a private house have none
ALTER TABLE "Address" ALTER COLUMN "apartmentOrUnit" DROP NOT NULL;
