CREATE OR REPLACE FUNCTION update_sm()
RETURNS TRIGGER AS $$
BEGIN
    -- Update pdp based on the current state of the version table
    UPDATE packagos p
    SET sm = CASE 
                WHEN EXISTS (
                    SELECT 1 
                    FROM versionos v 
                    WHERE v.package_name = p.name 
                    AND v.smv LIKE '%^5.0%'
                ) THEN true
                ELSE null
              END
    WHERE p.name = NEW.package_name OR p.name = OLD.package_name;

    RETURN NULL; -- No need to return anything
END;
$$
 LANGUAGE plpgsql;


 CREATE TRIGGER version_change
AFTER INSERT OR DELETE OR UPDATE ON versionos
FOR EACH ROW
EXECUTE FUNCTION update_sm();

--drop trigger version_change on versionos;
-- drop function update_sm;