#!/usr/bin/env python3
"""Script to check for verse count mismatches between English and Korean Bible data"""
import json

# Load both JSON files
with open('data/english.json', 'r', encoding='utf-8') as f:
    english_data = json.load(f)

with open('data/korean.json', 'r', encoding='utf-8') as f:
    korean_data = json.load(f)

mismatches = []
total_mismatches = 0

# Compare each book and chapter
for book_index, english_book in enumerate(english_data['books']):
    korean_book = korean_data['books'][book_index]

    for chapter_index, english_chapter in enumerate(english_book['chapters']):
        korean_chapter = korean_book['chapters'][chapter_index]

        english_verse_count = len(english_chapter['verses'])
        korean_verse_count = len(korean_chapter['verses'])

        if english_verse_count != korean_verse_count:
            mismatch = {
                'book': english_book['name'],
                'koreanBook': korean_book['name'],
                'chapter': english_chapter['number'],
                'englishVerses': english_verse_count,
                'koreanVerses': korean_verse_count,
                'difference': english_verse_count - korean_verse_count
            }
            mismatches.append(mismatch)
            total_mismatches += 1

# Output results
print('\n=== VERSE COUNT MISMATCH REPORT ===\n')

if not mismatches:
    print('✓ No mismatches found! All chapters have matching verse counts.')
else:
    print(f'Found {total_mismatches} chapter(s) with mismatched verse counts:\n')

    for m in mismatches:
        print(f"{m['book']} ({m['koreanBook']}) - Chapter {m['chapter']}")
        print(f"  English: {m['englishVerses']} verses")
        print(f"  Korean: {m['koreanVerses']} verses")
        diff_sign = '+' if m['difference'] > 0 else ''
        print(f"  Difference: {diff_sign}{m['difference']}")
        print()

    # Summary
    print('=== SUMMARY ===')
    print(f"Total mismatched chapters: {total_mismatches}")
    unique_books = len(set(m['book'] for m in mismatches))
    print(f"Books affected: {unique_books}")

# Save detailed report to file
with open('mismatch_report.json', 'w', encoding='utf-8') as f:
    json.dump(mismatches, f, indent=2, ensure_ascii=False)

print('\nDetailed report saved to: mismatch_report.json')
