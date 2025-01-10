CREATE OR REPLACE FUNCTION update_latest_mautic_support()
RETURNS TRIGGER AS $$
BEGIN
    -- Update pdp based on the current state of the version table
    UPDATE packages p
    SET latest_mautic_support = CASE 
                WHEN EXISTS (
                    SELECT 1 
                    FROM versions v 
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
AFTER INSERT OR DELETE OR UPDATE ON versions
FOR EACH ROW
EXECUTE FUNCTION update_latest_mautic_support();

--drop trigger version_change on versionos;
-- drop function update_latest_mautic_support;