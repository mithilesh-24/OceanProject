import psycopg2

conn_str = "postgresql://neondb_owner:npg_EiVGZQKh5N1l@ep-muddy-boat-aze0dnff-pooler.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"
conn = psycopg2.connect(conn_str)
cur = conn.cursor()

# Get all tables in public schema
cur.execute("""
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public';
""")
tables = [t[0] for t in cur.fetchall()]
print("Initial tables in Neon DB:", tables)

tables_to_keep = {"users", "user_profiles"}

for table in tables:
    if table not in tables_to_keep:
        print(f"Dropping table: {table}")
        cur.execute(f'DROP TABLE IF EXISTS "{table}" CASCADE;')

conn.commit()

# Ensure user_profiles table exists if not already present
cur.execute("""
CREATE TABLE IF NOT EXISTS user_profiles (
    id VARCHAR(64) PRIMARY KEY,
    email VARCHAR(128) UNIQUE,
    name VARCHAR(128) NOT NULL,
    role VARCHAR(32) DEFAULT 'student',
    organization VARCHAR(128) DEFAULT 'Oceanographic Institute',
    department VARCHAR(128),
    research_area VARCHAR(128)
);
""")
conn.commit()

cur.execute("""
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public';
""")
remaining = [t[0] for t in cur.fetchall()]
print("FINAL TABLES IN NEON DB (ONLY USERS & USER_PROFILES):", remaining)

cur.close()
conn.close()
