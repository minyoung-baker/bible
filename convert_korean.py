#!/usr/bin/env python3
import json

BOOKS={"gn":"창세기","ex":"출애굽기","lv":"레위기","nm":"민수기","dt":"신명기","js":"여호수아","jud":"사사기","rt":"룻기","1sm":"사무엘상","2sm":"사무엘하","1kgs":"열왕기상","2kgs":"열왕기하","1ch":"역대상","2ch":"역대하","ezr":"에스라","ne":"느헤미야","et":"에스더","job":"욥기","ps":"시편","prv":"잠언","ec":"전도서","so":"아가","is":"이사야","jr":"예레미야","lm":"예레미야애가","ez":"에스겔","dn":"다니엘","ho":"호세아","jl":"요엘","am":"아모스","ob":"오바댜","jn":"요나","mi":"미가","na":"나훔","hk":"하박국","zp":"스바냐","hg":"학개","zc":"스가랴","ml":"말라기","mt":"마태복음","mk":"마가복음","lk":"누가복음","jo":"요한복음","act":"사도행전","rm":"로마서","1co":"고린도전서","2co":"고린도후서","gl":"갈라디아서","eph":"에베소서","ph":"빌립보서","cl":"골로새서","1ts":"데살로니가전서","2ts":"데살로니가후서","1tm":"디모데전서","2tm":"디모데후서","tt":"디도서","phm":"빌레몬서","hb":"히브리서","jm":"야고보서","1pe":"베드로전서","2pe":"베드로후서","1jo":"요한1서","2jo":"요한2서","3jo":"요한3서","jd":"유다서","re":"요한계시록"}

with open('data/ko_ko.json','r',encoding='utf-8-sig') as f:
    old=json.load(f)

books=[]
for book in old:
    abbr=book['abbrev']
    chapters=[]
    for i,ch in enumerate(book['chapters'],1):
        verses=[{"number":j,"text":v} for j,v in enumerate(ch,1)]
        chapters.append({"number":i,"verses":verses})
    books.append({"name":BOOKS.get(abbr,abbr.upper()),"abbreviation":abbr.upper(),"chapters":chapters})

with open('data/korean.json','w',encoding='utf-8') as f:
    json.dump({"books":books},f,indent=2,ensure_ascii=False)

print("Converted ko_ko.json to korean.json format")
