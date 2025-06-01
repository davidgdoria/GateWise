-- Create postgres role if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'postgres') THEN
        CREATE ROLE postgres WITH LOGIN SUPERUSER PASSWORD 'postgres';
    END IF;
END
$$;

-- Create database if it doesn't exist
SELECT 'CREATE DATABASE gatewise'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'gatewise');

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE gatewise TO postgres; 