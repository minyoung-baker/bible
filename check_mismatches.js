// Script to check for verse count mismatches between English and Korean Bible data
const fs = require('fs');

// Load both JSON files
const englishData = JSON.parse(fs.readFileSync('data/english.json', 'utf8'));
const koreanData = JSON.parse(fs.readFileSync('data/korean.json', 'utf8'));

const mismatches = [];
let totalMismatches = 0;

// Compare each book and chapter
englishData.books.forEach((englishBook, bookIndex) => {
    const koreanBook = koreanData.books[bookIndex];

    if (!koreanBook) {
        console.log(`ERROR: Korean book missing at index ${bookIndex}`);
        return;
    }

    englishBook.chapters.forEach((englishChapter, chapterIndex) => {
        const koreanChapter = koreanBook.chapters[chapterIndex];

        if (!koreanChapter) {
            console.log(`ERROR: Korean chapter missing in ${englishBook.name} chapter ${englishChapter.number}`);
            return;
        }

        const englishVerseCount = englishChapter.verses.length;
        const koreanVerseCount = koreanChapter.verses.length;

        if (englishVerseCount !== koreanVerseCount) {
            const mismatch = {
                book: englishBook.name,
                koreanBook: koreanBook.name,
                chapter: englishChapter.number,
                englishVerses: englishVerseCount,
                koreanVerses: koreanVerseCount,
                difference: englishVerseCount - koreanVerseCount
            };
            mismatches.push(mismatch);
            totalMismatches++;
        }
    });
});

// Output results
console.log('\n=== VERSE COUNT MISMATCH REPORT ===\n');

if (mismatches.length === 0) {
    console.log('✓ No mismatches found! All chapters have matching verse counts.');
} else {
    console.log(`Found ${totalMismatches} chapter(s) with mismatched verse counts:\n`);

    mismatches.forEach(m => {
        console.log(`${m.book} (${m.koreanBook}) - Chapter ${m.chapter}`);
        console.log(`  English: ${m.englishVerses} verses`);
        console.log(`  Korean: ${m.koreanVerses} verses`);
        console.log(`  Difference: ${m.difference > 0 ? '+' : ''}${m.difference}`);
        console.log('');
    });

    // Summary
    console.log('=== SUMMARY ===');
    console.log(`Total mismatched chapters: ${totalMismatches}`);
    console.log(`Books affected: ${new Set(mismatches.map(m => m.book)).size}`);
}

// Save detailed report to file
fs.writeFileSync('mismatch_report.json', JSON.stringify(mismatches, null, 2));
console.log('\nDetailed report saved to: mismatch_report.json');
