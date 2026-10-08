-- Audit rows may only be added by the application: it marks its own transaction with the
-- "library.audit_log_writer" setting right before inserting (audit-log.repository.ts).
-- Inserts from anywhere else (Prisma Studio, a SQL console) are rejected.
-- TRUNCATE (seed and test resets) is not affected.

CREATE OR REPLACE FUNCTION "prevent_audit_log_direct_insert"() RETURNS trigger AS $$
BEGIN
  IF current_setting('library.audit_log_writer', true) IS DISTINCT FROM 'on' THEN
    RAISE EXCEPTION 'AuditLog rows can only be written by the application';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER "AuditLog_application_inserts_only"
BEFORE INSERT ON "AuditLog"
FOR EACH ROW EXECUTE FUNCTION "prevent_audit_log_direct_insert"();
