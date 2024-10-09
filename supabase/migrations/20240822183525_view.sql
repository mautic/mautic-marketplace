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
    WHERE (p.sm = TRUE) AND (_query IS NULL OR p.name ILIKE '%' || _query || '%') AND (_type IS NULL OR p.type ILIKE '%' || _type || '%');
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
            --COALESCE(AVG(r.rating), 0) AS average_rating,
            COALESCE(ROUND(AVG(r.rating), 1), 0) AS average_rating,
            COALESCE(COUNT(r.review), 0) AS total_review
        FROM 
            packages p
            LEFT JOIN reviews r ON p.name = r."objectId"
        WHERE 
            (p.sm = TRUE)
            AND
            (_query IS NULL OR p.name ILIKE '%' || _query || '%') AND (_type IS NULL OR p.type ILIKE '%' || _type || '%')
            GROUP BY
            p.name, p.url, p.repository, p.description, p.downloads, p.favers, p.type
        LIMIT _limit OFFSET _offset
    ) t;

    -- Return the final JSON object with data and total count
    RETURN JSON_BUILD_OBJECT(
        'results', todo,
        'total', total
    );
END;
$$ LANGUAGE plpgsql STABLE;
