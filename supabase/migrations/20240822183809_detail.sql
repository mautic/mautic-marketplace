CREATE OR REPLACE FUNCTION get_pack(packag_name TEXT)
RETURNS JSON AS $$
DECLARE
    package_data JSON;
BEGIN
    -- Construct the JSON object for the package
    SELECT jsonb_build_object(
        'package', jsonb_build_object(
            'name', p.name,
            'description', p.description,
            'time', p.time,
            'maintainers', p.maintainers,
            'versions', jsonb_object_agg(
                v.version,
                jsonb_build_object(
                    'name', v.package_name,
                    'description', v.description,
                    'keywords', v.keywords,
                    'homepage', v.homepage,
                    'version', v.version,
                    'version_normalized', v.version_normalized,
                    'license', v.license,
                    'source', v.source,
                    'dist', v.dist,
                    'type', v.type,
                    'authors', v.authors,
                    'support', v.support,
                    'funding', v.funding,
                    'time', v.time,
                    'extra', v.extra,
                    'require', v.require,
                    'smv', v.smv
                )
            ),
            'reviews', jsonb_object_agg(
                COALESCE(r.user, 'no reviews'),
                jsonb_build_object(
                    'name', r.user,
                    'rating', r.rating,
                    'review', r.review
                )
            ),
            'type', p.type,
            'repository', p.repository,
            'github_stars', p.github_stars,
            'github_watchers', p.github_watchers,
            'github_forks', p.github_forks,
            'github_open_issues', p.github_open_issues,
            'language', p.language,
            'dependents', p.dependents,
            'suggesters', p.suggesters,
            'downloads', p.downloads,
            'favers', p.favers
        )
    ) INTO package_data
    FROM packages p
    JOIN versions v ON p.name = v.package_name
    LEFT JOIN reviews r ON p.name = r."objectId"
    WHERE p.name = packag_name
    GROUP BY p.name, p.description, p.time, p.maintainers, p.type, p.repository, p.github_stars, p.github_watchers, p.github_forks, p.github_open_issues, p.language, p.dependents, p.suggesters, p.downloads, p.favers;

    RETURN package_data;
END;
$$ LANGUAGE plpgsql STABLE;

--drop function get_pack;
-- 'reviews', CASE
--             WHEN COUNT(r) = 0 THEN '"no reviews"'::jsonb
--             ELSE jsonb_object_agg(
--                 COALESCE(r.user, 'no reviews'),
--                 jsonb_build_object(
--                     'name', r.user,
--                     'rating', r.rating,
--                     'review', r.review
--                 )
--             )
--             END,