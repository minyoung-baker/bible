#!/usr/bin/env python3
"""Repair Bible data by fetching correct data from source"""
import json

print("Loading source files...")

# Load source files (thiagobodruk format)
# Use utf-8-sig to handle BOM (Byte Order Mark)
with open('/tmp/ko_ko_source.json', 'r', encoding='utf-8-sig') as f:
    korean_source = json.load(f)

with open('/tmp/en_bbe_source.json', 'r', encoding='utf-8-sig') as f:
    english_source = json.load(f)

# Load current files
with open('data/korean.json', 'r', encoding='utf-8') as f:
    korean_current = json.load(f)

with open('data/english.json', 'r', encoding='utf-8') as f:
    english_current = json.load(f)

print(f"Source Korean: {len(korean_source)} books")
print(f"Source English: {len(english_source)} books")
print(f"Current Korean: {len(korean_current['books'])} books")
print(f"Current English: {len(english_current['books'])} books")

# Examine structure difference
print("\n--- Structure Analysis ---")
print("Source format (thiagobodruk):")
print(f"  Book: {korean_source[0].keys()}")
print(f"  Chapters: array of verse arrays")
print(f"  Example: {korean_source[0]['chapters'][0][:2]}")

print("\nCurrent format:")
print(f"  Book: {korean_current['books'][0].keys()}")
print(f"  Chapter: {korean_current['books'][0]['chapters'][0].keys()}")
print(f"  Verse: {korean_current['books'][0]['chapters'][0]['verses'][0].keys()}")


def convert_source_to_current_format(source_books, is_english=False):
    """Convert thiagobodruk format to current format"""
    books = []

    for source_book in source_books:
        # Create book structure
        book = {
            "name": source_book['name'],
            "abbreviation": source_book['abbrev'].upper(),
            "chapters": []
        }

        # Convert chapters
        for chapter_idx, chapter_verses in enumerate(source_book['chapters']):
            chapter = {
                "number": chapter_idx + 1,
                "verses": []
            }

            # Convert verses
            for verse_idx, verse_text in enumerate(chapter_verses):
                verse = {
                    "number": verse_idx + 1,
                    "text": verse_text
                }
                chapter["verses"].append(verse)

            book["chapters"].append(chapter)

        books.append(book)

    return {"books": books}


print("\n--- Converting source data to current format ---")
english_converted = convert_source_to_current_format(english_source, is_english=True)
korean_converted = convert_source_to_current_format(korean_source, is_english=False)

print(f"Converted English: {len(english_converted['books'])} books")
print(f"Converted Korean: {len(korean_converted['books'])} books")

# Compare verse counts
print("\n--- Checking for mismatches in converted data ---")
mismatches_found = 0

for book_idx in range(min(len(english_converted['books']), len(korean_converted['books']))):
    eng_book = english_converted['books'][book_idx]
    kor_book = korean_converted['books'][book_idx]

    for ch_idx in range(min(len(eng_book['chapters']), len(kor_book['chapters']))):
        eng_ch = eng_book['chapters'][ch_idx]
        kor_ch = kor_book['chapters'][ch_idx]

        eng_count = len(eng_ch['verses'])
        kor_count = len(kor_ch['verses'])

        if eng_count != kor_count:
            print(f"{eng_book['name']} Ch{eng_ch['number']}: Eng={eng_count} Kor={kor_count}")
            mismatches_found += 1

print(f"\nTotal mismatches in converted data: {mismatches_found}")

# Save the converted, corrected data
print("\n--- Saving repaired data ---")
with open('data/english.json', 'w', encoding='utf-8') as f:
    json.dump(english_converted, f, ensure_ascii=False, indent=2)

with open('data/korean.json', 'w', encoding='utf-8') as f:
    json.dump(korean_converted, f, ensure_ascii=False, indent=2)

print("✓ Repaired data saved to data/english.json and data/korean.json")
