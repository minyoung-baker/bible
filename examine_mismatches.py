#!/usr/bin/env python3
"""Examine specific mismatched chapters to understand patterns"""
import json

# Load both JSON files
with open('data/english.json', 'r', encoding='utf-8') as f:
    english_data = json.load(f)

with open('data/korean.json', 'r', encoding='utf-8') as f:
    korean_data = json.load(f)

# Load mismatch report
with open('mismatch_report.json', 'r', encoding='utf-8') as f:
    mismatches = json.load(f)

def examine_mismatch(mismatch):
    """Examine a specific mismatch in detail"""
    book_name = mismatch['book']
    chapter_num = mismatch['chapter']

    # Find the book by name
    eng_book_idx = next((i for i, b in enumerate(english_data['books']) if b['name'] == book_name), None)

    if eng_book_idx is None:
        print(f"Book {book_name} not found")
        return

    eng_book = english_data['books'][eng_book_idx]
    kor_book = korean_data['books'][eng_book_idx]

    # Find the chapter
    eng_chapter = next((c for c in eng_book['chapters'] if c['number'] == chapter_num), None)
    kor_chapter = next((c for c in kor_book['chapters'] if c['number'] == chapter_num), None)

    if not eng_chapter or not kor_chapter:
        print(f"Chapter {chapter_num} not found")
        return

    print(f"\n{'='*100}")
    print(f"{book_name} ({kor_book['name']}) - Chapter {chapter_num}")
    print(f"{'='*100}")
    print(f"English verses: {len(eng_chapter['verses'])}")
    print(f"Korean verses: {len(kor_chapter['verses'])}")
    print(f"Difference: {mismatch['difference']}")
    print()

    # Show verse numbers from both
    eng_verse_nums = [v['number'] for v in eng_chapter['verses']]
    kor_verse_nums = [v['number'] for v in kor_chapter['verses']]

    print(f"English verse numbers: {eng_verse_nums}")
    print(f"Korean verse numbers: {kor_verse_nums}")
    print()

    # Side-by-side comparison
    max_len = max(len(eng_chapter['verses']), len(kor_chapter['verses']))

    print("Side-by-side comparison:")
    print(f"{'V#':<6} {'English':<70} {'Korean':<70}")
    print("-" * 147)

    for i in range(min(max_len, 20)):  # Limit to 20 verses
        eng_v = eng_chapter['verses'][i] if i < len(eng_chapter['verses']) else None
        kor_v = kor_chapter['verses'][i] if i < len(kor_chapter['verses']) else None

        eng_num = str(eng_v['number']) if eng_v else "---"
        kor_num = str(kor_v['number']) if kor_v else "---"

        eng_text = (eng_v['text'][:65] + "...") if eng_v and len(eng_v['text']) > 65 else (eng_v['text'] if eng_v else "❌ MISSING")
        kor_text = (kor_v['text'][:65] + "...") if kor_v and len(kor_v['text']) > 65 else (kor_v['text'] if kor_v else "❌ MISSING")

        marker = "✓" if eng_num == kor_num else "⚠️"
        print(f"{eng_num}/{kor_num:<6} {eng_text:<70} {kor_text:<70} {marker}")

    if max_len > 20:
        print(f"... (showing first 20 of {max_len} verses)")

# Examine key examples
print("Examining key mismatched chapters...\n")

# Find specific mismatches to examine
examples = [
    # Small mismatch (1 verse difference)
    next((m for m in mismatches if m['book'] == 'Genesis' and m['chapter'] == 33), None),
    # Medium mismatch
    next((m for m in mismatches if m['book'] == 'Psalms' and m['chapter'] == 8), None),
    # Severe - Job 42 (0 verses in Korean)
    next((m for m in mismatches if m['book'] == 'Job' and m['chapter'] == 42), None),
    # Another severe - 1 Peter 5
    next((m for m in mismatches if m['book'] == '1 Peter' and m['chapter'] == 5), None),
]

for mismatch in examples:
    if mismatch:
        examine_mismatch(mismatch)
