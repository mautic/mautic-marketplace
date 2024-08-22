--The function create a list view for desired output

CREATE OR REPLACE FUNCTION get_view(
    _limit INT,
    _offset INT,
    _type TEXT DEFAULT NULL,
    _query TEXT DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
    todo JSON;
    total INT;
BEGIN
    -- Fetch the total count (without limit/offset)
    SELECT COUNT(*) INTO total FROM packages p
    WHERE (_query IS NULL OR p.name ILIKE '%' || _query || '%') AND (_type IS NULL OR p.type ILIKE '%' || _type || '%');
    -- Fetch the data with limit and offset
    SELECT JSON_AGG(t) INTO todo
    FROM (
        SELECT 
            p.name,
            p.url,
            p.repository,
            p.description,
            p.downloads ->> 'total' as downloads,
            p.favers,
            p.type,
            p.displayname
        FROM 
            packages p
        WHERE 
            (_query IS NULL OR p.name ILIKE '%' || _query || '%') AND (_type IS NULL OR p.type ILIKE '%' || _type || '%')
        LIMIT _limit OFFSET _offset
    ) t;

    -- Return the final JSON object with data and total count
    RETURN JSON_BUILD_OBJECT(
        'results', todo,
        'total', total
    );
END;
$$ LANGUAGE plpgsql STABLE;
