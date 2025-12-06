-- Populate sub_domain_id for existing departments and semesters
-- This links existing data to their sub-domains

-- For departments: Link the first department of each domain to its sub-domain
UPDATE departments d
SET sub_domain_id = (
  SELECT id FROM sub_domains sd 
  WHERE sd.domain_id = d.domain_id 
  LIMIT 1
)
WHERE d.domain_id IS NOT NULL
AND d.sub_domain_id IS NULL;

-- For semesters: Link the first semester of each domain to its sub-domain
UPDATE semesters s
SET sub_domain_id = (
  SELECT id FROM sub_domains sd 
  WHERE sd.domain_id = s.domain_id 
  LIMIT 1
)
WHERE s.domain_id IS NOT NULL
AND s.sub_domain_id IS NULL;

-- Verify the updates
SELECT 'Departments with sub_domain_id:' as status;
SELECT COUNT(*) as count FROM departments WHERE sub_domain_id IS NOT NULL;

SELECT 'Semesters with sub_domain_id:' as status;
SELECT COUNT(*) as count FROM semesters WHERE sub_domain_id IS NOT NULL;

-- Show the linked data
SELECT 'Linked departments:' as status;
SELECT d.name as department, sd.name as sub_domain, d.domain_id
FROM departments d
LEFT JOIN sub_domains sd ON d.sub_domain_id = sd.id
WHERE d.sub_domain_id IS NOT NULL
LIMIT 10;

SELECT 'Linked semesters:' as status;
SELECT s.name as semester, sd.name as sub_domain, s.domain_id
FROM semesters s
LEFT JOIN sub_domains sd ON s.sub_domain_id = sd.id
WHERE s.sub_domain_id IS NOT NULL
LIMIT 10;
