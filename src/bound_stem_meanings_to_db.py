import sqlite3
import os

# Create a SQLite database and connect to it
db_name = "databases/bound_stems_database.db"

conn = sqlite3.connect(db_name)
cursor = conn.cursor()

cursor.execute('''
DROP TABLE IF EXISTS stem_info
''')

# Create the fragments table
cursor.execute('''
CREATE TABLE IF NOT EXISTS stem_info (
    stem TEXT,
    meaning TEXT
)
''')

# Commit changes
conn.commit()

# Function to process a file and insert data into the database


def process_file(file_name):
    with open(file_name, "r", encoding="utf-8") as file:
        for line in file:
            # Skip empty lines
            if not line.strip():
                continue

            # Split the line into fragment and meaning
            stem, meaning = line.strip().split("\t", 1)

            # Insert the data into the database
            cursor.execute('''
            INSERT INTO stem_info (stem, meaning)
            VALUES (?, ?)
            ''', (stem, meaning))

        # Commit changes after processing each file
        conn.commit()


# Process each file
file_name = f"resources/bound_stem_meanings.txt"
if os.path.exists(file_name):
    process_file(file_name)
else:
    print(f"File {file_name} not found. Skipping.")

# Close the database connection
conn.close()

print(f"Data has been successfully inserted into {db_name}.")
