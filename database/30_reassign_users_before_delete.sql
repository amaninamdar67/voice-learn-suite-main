-- Script to reassign users from one subdomain to another
-- Replace 'old_subdomain_id' with the subdomain you want to delete
-- Replace 'new_subdomain_id' with the target subdomain

-- Example: Reassign all users from subdomain to delete to another subdomain
UPDATE profiles 
SET sub_domain_id = 'new_subdomain_id'
WHERE sub_domain_id = 'old_subdomain_id';

-- Verify the reassignment
SELECT COUNT(*) as users_reassigned 
FROM profiles 
WHERE sub_domain_id = 'new_subdomain_id';
