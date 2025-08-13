-- Update auth settings to disable email confirmation requirement
-- Note: This makes development easier but should be reconsidered for production

-- Check current auth settings
SELECT * FROM auth.config;