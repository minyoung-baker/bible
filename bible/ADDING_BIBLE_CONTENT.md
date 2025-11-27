# Adding Full Bible Content

This guide explains how to add complete Bible books and chapters to your bilingual Bible website.

## Quick Overview

The sample data includes only a few chapters. To add complete books:
1. Find public domain Bible texts (sources below)
2. Format them as JSON using the structure shown below
3. Add them to `data/english.json` and `data/korean.json`

## Public Domain English Bible Sources

### World English Bible (WEB)
- **Website**: https://worldenglish.bible/
- **License**: Public Domain
- **Format**: Available in various formats including JSON
- **Quality**: Modern English, accurate translation

### American Standard Version (ASV) - 1901
- **Website**: https://www.biblegateway.com (select ASV)
- **License**: Public Domain
- **Quality**: Formal equivalence translation

### King James Version (KJV) - 1769
- **License**: Public Domain in most countries
- **Note**: Archaic English ("thee", "thou")

### Download Options
- **API**: https://api.esv.org/ (ESV requires registration, not public domain but free for non-commercial)
- **JSON Format**: https://github.com/thiagobodruk/bible (multiple translations in JSON)

## Korean Bible Sources

### 개역한글 (Korean Revised Version)
- Public domain translation
- Available at: http://holybible.or.kr/

### Online Resources
- **BibleGateway**: https://www.biblegateway.com (Korean translations available)
- **YouVersion API**: Developer access for Bible data

## JSON Format Structure

Each book follows this structure:

```json
{
  "books": [
    {
      "name": "Genesis",
      "abbreviation": "Gen",
      "chapters": [
        {
          "number": 1,
          "verses": [
            {"number": 1, "text": "In the beginning..."},
            {"number": 2, "text": "Now the earth was..."},
            {"number": 3, "text": "And God said..."}
          ]
        },
        {
          "number": 2,
          "verses": [
            {"number": 1, "text": "Thus the heavens..."}
          ]
        }
      ]
    }
  ]
}
```

## Step-by-Step: Adding Genesis

### Step 1: Get the Text

**For English (World English Bible):**
```bash
# Using curl to download from a Bible API
curl "https://api.scripture.api.bible/v1/bibles/{bibleId}/books/GEN" \
  -H "api-key: YOUR_API_KEY"
```

**For Korean:**
Visit http://holybible.or.kr/ and copy the text chapter by chapter.

### Step 2: Format the Data

For each chapter:
1. Copy all verses
2. Format as JSON objects with `number` and `text` fields
3. Ensure quotes are properly escaped

Example for Genesis 1:1-5:
```json
{
  "number": 1,
  "verses": [
    {"number": 1, "text": "In the beginning God created the heavens and the earth."},
    {"number": 2, "text": "Now the earth was formless and empty, darkness was over the surface of the deep, and the Spirit of God was hovering over the waters."},
    {"number": 3, "text": "And God said, \"Let there be light,\" and there was light."},
    {"number": 4, "text": "God saw that the light was good, and he separated the light from the darkness."},
    {"number": 5, "text": "God called the light \"day,\" and the darkness he called \"night.\" And there was evening, and there was morning—the first day."}
  ]
}
```

### Step 3: Add to JSON Files

1. Open `data/english.json`
2. Find the Genesis book object
3. Add new chapters to the `chapters` array
4. Repeat for `data/korean.json`
5. **Important**: Keep verse numbers aligned between languages

## Automation Script (Python)

Here's a helper script to convert Bible text to JSON format:

```python
import json
import re

def parse_chapter(text):
    """
    Parse a chapter of Bible text into JSON format.
    Input format: "1 In the beginning... 2 Now the earth..."
    """
    verses = []
    # Match verse numbers followed by text
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

# Example usage:
chapter_text = """
1 In the beginning God created the heavens and the earth.
2 Now the earth was formless and empty, darkness was over the surface of the deep, and the Spirit of God was hovering over the waters.
3 And God said, "Let there be light," and there was light.
"""

verses = parse_chapter(chapter_text)
print(json.dumps(verses, indent=2, ensure_ascii=False))
```

Save this as `convert_to_json.py` and run:
```bash
python3 convert_to_json.py
```

## Tips

1. **Work Chapter by Chapter**: Don't try to do all 50 chapters at once
2. **Validate JSON**: Use https://jsonlint.com/ to check your JSON is valid
3. **Test Frequently**: Load the website after adding each chapter to ensure it works
4. **Keep Backups**: Save copies before making large changes
5. **Match Verse Numbers**: Ensure English and Korean have the same verse numbers

## Genesis Chapter Information

Genesis has **50 chapters** with these verse counts:
- Chapter 1: 31 verses
- Chapter 2: 25 verses
- Chapter 3: 24 verses
- Chapter 4: 26 verses
- Chapter 5: 32 verses
- ... (and so on)

Total: **1,533 verses** in Genesis

## Recommended Approach

1. Start with **Genesis 1** (31 verses) - complete all verses
2. Add **Genesis 2-5** next
3. Continue adding chapters progressively
4. Test after each chapter to ensure formatting is correct

## Copyright Considerations

- **Public Domain texts** can be used freely
- **Modern translations** (NIV, ESV, NASB) are copyrighted
- For personal use, most translations allow limited copying
- For public websites, use public domain translations

## Need Help?

If you have a specific Bible text you want to add, you can:
1. Save it to a `.txt` file
2. Use the Python script above to convert it
3. Copy the output into your JSON files

## Alternative: Pre-formatted Bible JSON

Check these repositories for pre-formatted Bible data:
- https://github.com/thiagobodruk/bible
- https://github.com/scrollmapper/bible_databases
- https://github.com/bibleapi/bibleapi-bibles-json

Just convert their format to match the structure used in this project.
