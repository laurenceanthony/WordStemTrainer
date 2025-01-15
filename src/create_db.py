import sqlite3
from pathlib import Path
import os


def add_stems(cursor, file_path):

    # level = int(file_path.stem.split("_")[-1])  # Extract level from file name
    level = 1
    with open(file_path, "r", encoding="utf-8") as file:
        for test_id, line in enumerate(file, start=1):  # Row number as test_id
            words = line.strip().split(", ")  # Split row into values
            item_id = 0

            for word in words:
                item_id += 1
                parts = word.split("/")  # Split word by slashes

                complete_word = ''.join(parts)

                # if len(parts) < 3:
                #     print(file_path, parts, complete_word)
                #     quit()

                # Ensure 3 parts (fill empty columns with "")
                parts += [""] * (6 - len(parts))

                cursor.execute('''
                    INSERT INTO words (item_id, level, test_id, complete_word, part_1, part_2, part_3, part_4, part_5, part_6)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ''', (item_id, level, test_id, complete_word, parts[0], parts[1], parts[2], parts[3], parts[4], parts[5]))


def add_meanings(file_name):
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


if __name__ == '__main__':

    db_path = "databases/bound_stems_database.db"

    # Remove the existing database file (if any)
    if os.path.exists(db_path):
        os.remove(db_path)

    # Database setup
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    cursor.execute('''
        DROP TABLE IF EXISTS words
        ''')

    # Create table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS words (
            item_id INTEGER,
            level INTEGER,
            test_id INTEGER,
            complete_word TEXT,
            part_1 TEXT,
            part_2 TEXT,
            part_3 TEXT,
            part_4 TEXT,
            part_5 TEXT,
            part_6 TEXT
        )
    ''')

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

    # Create stems table
    list_directory = "resources"
    file_paths = ["bound_stems.txt"]
    for file_path in file_paths:
        file_path = os.path.join(list_directory, file_path)
        # print(file_path)
        add_stems(cursor, Path(file_path))

    # Create meanings table
    file_name = f"resources/bound_stem_meanings.txt"
    if os.path.exists(file_name):
        add_meanings(file_name)
    else:
        print(f"File {file_name} not found. Skipping.")

    # Commit changes and close the connection
    conn.commit()
    conn.close()

    print(f"Data successfully stored in {db_path}")
