--The function create a list view for desired output

CREATE OR REPLACE FUNCTION get_view(
    _limit INT,
    _offset INT,
    _type TEXT DEFAULT NULL,
    _query TEXT DEFAULT NULL,
    _orderby TEXT DEFAULT 'name',  -- Column to order by ('name', 'rating', or 'downloads')
    _orderdir TEXT DEFAULT 'asc'   -- Order direction ('asc' or 'desc')
)
RETURNS JSON AS $$
DECLARE
    todo JSON;
    total INT;
    sql_query TEXT;
BEGIN
    -- Fetch the total count (without limit/offset)
    SELECT COUNT(DISTINCT p.name) INTO total 
    FROM packages p
    LEFT JOIN reviews r ON p.name = r."objectId"  -- Assuming 'id' is the primary key in packages and foreign key in ratings
    WHERE (p.latest_mautic_support = TRUE) 
    AND (_query IS NULL OR p.name ILIKE '%' || _query || '%') 
    AND (_type IS NULL OR p.type ILIKE '%' || _type || '%');

    -- Handle dynamic ordering logic for 'name', 'rating', and 'downloads'
    IF _orderby = 'downloads' THEN
        _orderby := '(p.downloads ->> ''total'')::INT';  -- Use downloads->>'total' as the ordering field
    ELSIF _orderby = 'rating' THEN
        _orderby := 'COALESCE(ROUND(AVG(r.rating), 1), 0)';  -- Use average rating
    ELSE
        _orderby := 'p.name';  -- Default to ordering by name
    END IF;

    -- Construct dynamic SQL for fetching the data with limit, offset, and dynamic ordering
    sql_query := format(
        'SELECT JSON_AGG(t) 
         FROM (SELECT 
                  p.name,
                  p.url,
                  p.repository,
                  p.description,
                  (p.downloads ->> ''total'')::INT as downloads,
                  p.favers,
                  p.type,
                  p.displayname,
                  COALESCE(ROUND(AVG(r.rating), 1), 0) AS average_rating,  -- Return rating, default to 0 if null
                  COALESCE(COUNT(r.review), 0) AS total_review
               FROM packages p
               LEFT JOIN reviews r ON p.name = r."objectId"
               WHERE p.latest_mautic_support = TRUE
                 AND (%L IS NULL OR p.name ILIKE ''%%'' || %L || ''%%'')
                 AND (%L IS NULL OR p.type ILIKE ''%%'' || %L || ''%%'')
                 GROUP BY p.name, p.url, p.repository, p.description, p.downloads, p.favers, p.type, p.displayname 
               ORDER BY %s %s, p.name ASC  -- Added stable ordering by name to handle ties
               LIMIT %L OFFSET %L
         ) t', _query, _query, _type, _type, _orderby, _orderdir, _limit, _offset);

    -- Execute the dynamically built query
    EXECUTE sql_query INTO todo;

    -- Return the final JSON object with data and total count
    RETURN JSON_BUILD_OBJECT(
        'results', todo,
        'total', total
    );
END;
$$
 LANGUAGE plpgsql STABLE;