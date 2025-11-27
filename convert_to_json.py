#!/usr/bin/env python3
"""
Bible Text to JSON Converter

This script helps convert plain Bible text into the JSON format
used by the English-Korean Bible website.

Usage:
    python3 convert_to_json.py input.txt output.json

Input format:
    Each line should be: VERSE_NUMBER verse text here
    Example:
        1 In the beginning God created the heavens and the earth.
        2 Now the earth was formless and empty...

Output:
    JSON array of verse objects with "number" and "text" fields
"""

import json
import re
import sys

def parse_chapter(text):
    """
    Parse a chapter of Bible text into JSON format.

    Args:
        text: String with verses in format "1 Text... 2 More text..."

    Returns:
        List of verse dictionaries
    """
    verses = []

    # Split by lines and process each line
    lines = text.strip().split('\n')

    for line in lines:
        line = line.strip()
        if not line:
            continue

        # Try to match verse number at start of line
        match = re.match(r'^(\d+)\s+(.+)$', line)
        if match:
            verse_num = int(match.group(1))
            verse_text = match.group(2).strip()
            verses.append({
                "number": verse_num,
                "text": verse_text
            })
        else:
            # If no verse number, append to previous verse
            if verses:
                verses[-1]["text"] += " " + line

    return verses

def parse_multi_verse_line(text):
    """
    Parse text where multiple verses are on the same line.
    Format: "1 First verse. 2 Second verse. 3 Third verse."
    """
    verses = []
    # Match verse numbers followed by text until next verse number
    pattern = r'(\d+)\s+([^0-9]+?)(?=\d+\s+|$)'
    matches = re.finditer(pattern, text, re.DOTALL)

    for match in matches:
        verse_num = int(match.group(1))
        verse_text = match.group(2).strip()
        verses.append({
            "number": verse_num,
            "text": verse_text
        })

    return verses

def create_chapter_object(chapter_number, verses):
    """Create a complete chapter object."""
    return {
        "number": chapter_number,
        "verses": verses
    }

def main():
    if len(sys.argv) < 2:
        print("Usage: python3 convert_to_json.py input.txt [output.json]")
        print("\nOr run interactively:")
        print("  python3 convert_to_json.py")
        sys.exit(1)

    # Read input
    if sys.argv[1] == '-':
        # Read from stdin
        text = sys.stdin.read()
    else:
        # Read from file
        with open(sys.argv[1], 'r', encoding='utf-8') as f:
            text = f.read()

    # Determine parsing method based on format
    print("Parsing verses...")
    if '\n' in text and re.match(r'^\d+\s+', text.split('\n')[0]):
        # One verse per line format
        verses = parse_chapter(text)
    else:
        # Multiple verses per line format
        verses = parse_multi_verse_line(text)

    print(f"Found {len(verses)} verses")

    # Create output
    output = json.dumps(verses, indent=2, ensure_ascii=False)

    # Write output
    if len(sys.argv) > 2:
        with open(sys.argv[2], 'w', encoding='utf-8') as f:
            f.write(output)
        print(f"Output written to {sys.argv[2]}")
    else:
        print("\nJSON Output:")
        print(output)

if __name__ == "__main__":
    # If no arguments, show example
    if len(sys.argv) == 1:
        print("Bible Text to JSON Converter")
        print("=" * 50)
        print("\nExample usage:\n")

        example_text = """1 In the beginning God created the heavens and the earth.
2 Now the earth was formless and empty, darkness was over the surface of the deep, and the Spirit of God was hovering over the waters.
3 And God said, "Let there be light," and there was light."""

        print("Input text:")
        print(example_text)
        print("\nOutput JSON:")
        verses = parse_chapter(example_text)
        print(json.dumps(verses, indent=2, ensure_ascii=False))

        print("\n" + "=" * 50)
        print("To convert your own text:")
        print("  python3 convert_to_json.py your_text.txt output.json")
    else:
        main()
