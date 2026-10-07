-- The audit log is append-only: rows can be inserted, but never changed or deleted.
-- Row triggers do not fire on TRUNCATE, so the seed and the test cleanup can still empty the table.

CREATE OR REPLACE FUNCTION "prevent_audit_log_change"() RETURNS trigger AS $$
BEGIN
  RAISE EXCEPTION 'AuditLog is append-only: % is not allowed', TG_OP;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER "AuditLog_append_only"
BEFORE UPDATE OR DELETE ON "AuditLog"
FOR EACH ROW EXECUTE FUNCTION "prevent_audit_log_change"();
