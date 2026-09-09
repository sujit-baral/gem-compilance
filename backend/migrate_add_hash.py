"""
One-time migration: adds file_hash, is_duplicate, and duplicate_of columns
to the documents table without wiping existing data.
Run once: python migrate_add_hash.py
"""
import sqlite3

conn = sqlite3.connect("gem_compliance.db")
cursor = conn.cursor()

columns_to_add = [
    ("file_hash", "TEXT"),
    ("is_duplicate", "BOOLEAN"),
    ("duplicate_of", "TEXT"),
]

for column_name, column_type in columns_to_add:
    try:
        cursor.execute(f"ALTER TABLE documents ADD COLUMN {column_name} {column_type}")
        print(f"Added column: {column_name}")
    except sqlite3.OperationalError as e:
        print(f"Skipped {column_name}: {e}")

conn.commit()
conn.close()
print("Migration complete.")