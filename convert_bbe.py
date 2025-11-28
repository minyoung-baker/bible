#!/usr/bin/env python3
import json

# Book name mappings
BOOKS = {"gn":"Genesis","ex":"Exodus","lv":"Leviticus","nm":"Numbers","dt":"Deuteronomy","js":"Joshua","jud":"Judges","rt":"Ruth","1sm":"1 Samuel","2sm":"2 Samuel","1kgs":"1 Kings","2kgs":"2 Kings","1ch":"1 Chronicles","2ch":"2 Chronicles","ezr":"Ezra","ne":"Nehemiah","et":"Esther","job":"Job","ps":"Psalms","prv":"Proverbs","ec":"Ecclesiastes","so":"Song of Solomon","is":"Isaiah","jr":"Jeremiah","lm":"Lamentations","ez":"Ezekiel","dn":"Daniel","ho":"Hosea","jl":"Joel","am":"Amos","ob":"Obadiah","jn":"Jonah","mi":"Micah","na":"Nahum","hk":"Habakkuk","zp":"Zephaniah","hg":"Haggai","zc":"Zechariah","ml":"Malachi","mt":"Matthew","mk":"Mark","lk":"Luke","jo":"John","act":"Acts","rm":"Romans","1co":"1 Corinthians","2co":"2 Corinthians","gl":"Galatians","eph":"Ephesians","ph":"Philippians","cl":"Colossians","1ts":"1 Thessalonians","2ts":"2 Thessalonians","1tm":"1 Timothy","2tm":"2 Timothy","tt":"Titus","phm":"Philemon","hb":"Hebrews","jm":"James","1pe":"1 Peter","2pe":"2 Peter","1jo":"1 John","2jo":"2 John","3jo":"3 John","jd":"Jude","re":"Revelation"}

with open('data/en_bbe.json','r',encoding='utf-8-sig') as f:
    old = json.load(f)

books = []
for book in old:
    abbr = book['abbrev']
    chapters = []
    for i, ch in enumerate(book['chapters'], 1):
        verses = [{"number": j, "text": v} for j, v in enumerate(ch, 1)]
        chapters.append({"number": i, "verses": verses})
    books.append({"name": BOOKS.get(abbr, abbr.upper()), "abbreviation": abbr.upper(), "chapters": chapters})

with open('data/english.json','w',encoding='utf-8') as f:
    json.dump({"books": books}, f, indent=2, ensure_ascii=False)

print("Converted en_bbe.json to english.json format")
