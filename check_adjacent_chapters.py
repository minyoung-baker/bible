#!/usr/bin/env python3
"""Check if missing verses are in adjacent chapters"""
import json

# Load both JSON files
with open('data/english.json', 'r', encoding='utf-8') as f:
    english_data = json.load(f)

with open('data/korean.json', 'r', encoding='utf-8') as f:
    korean_data = json.load(f)

def check_book_chapters(book_name):
    """Check chapter structure for a specific book"""
    # Find the book
    eng_book_idx = next((i for i, b in enumerate(english_data['books']) if b['name'] == book_name), None)

    if eng_book_idx is None:
        print(f"Book {book_name} not found")
        return

    eng_book = english_data['books'][eng_book_idx]
    kor_book = korean_data['books'][eng_book_idx]

    print(f"\n{'='*80}")
    print(f"{book_name} ({kor_book['name']})")
    print(f"{'='*80}")
    print(f"English: {len(eng_book['chapters'])} chapters")
    print(f"Korean: {len(kor_book['chapters'])} chapters")
    print()

    # Compare chapter verse counts
    print(f"{'Ch#':<6} {'English Verses':<20} {'Korean Verses':<20} {'Status'}")
    print("-" * 80)

    for i in range(max(len(eng_book['chapters']), len(kor_book['chapters']))):
        eng_ch = eng_book['chapters'][i] if i < len(eng_book['chapters']) else None
        kor_ch = kor_book['chapters'][i] if i < len(kor_book['chapters']) else None

        eng_count = len(eng_ch['verses']) if eng_ch else 0
        kor_count = len(kor_ch['verses']) if kor_ch else 0

        eng_num = eng_ch['number'] if eng_ch else "---"
        kor_num = kor_ch['number'] if kor_ch else "---"

        status = "✓" if eng_count == kor_count else ("⚠️" if kor_count > 0 else "❌")

        print(f"{eng_num}/{kor_num:<6} {eng_count:<20} {kor_count:<20} {status}")

# Check Job
check_book_chapters("Job")

# Check 1 Peter
check_book_chapters("1 Peter")

# Check Colossians (which also had a severe mismatch)
check_book_chapters("Colossians")

# Check Psalms 118
check_book_chapters("Psalms")
