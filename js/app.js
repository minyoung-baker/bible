// Bible App - Main JavaScript
const VERSION = '1.1.1';

class BibleApp {
    constructor() {
        this.englishData = null;
        this.koreanData = null;
        this.currentBookIndex = null;
        this.currentChapterIndex = null;
        this.isSyncing = false;
        this.isRestoringPosition = false;
        this.savedTopVerse = null;

        // Font size management
        this.fontSizes = ['small', 'medium', 'large', 'xlarge', 'xxlarge', 'xxxlarge', 'huge', 'massive'];
        this.currentFontSizeIndex = 1; // Start at 'medium'

        // DOM Elements
        this.bookSelect = document.getElementById('bookSelect');
        this.chapterSelect = document.getElementById('chapterSelect');
        this.verseSelect = document.getElementById('verseSelect');
        this.fontSizeDown = document.getElementById('fontSizeDown');
        this.fontSizeUp = document.getElementById('fontSizeUp');
        this.englishText = document.getElementById('englishText');
        this.koreanText = document.getElementById('koreanText');
        this.prevBookBtn = document.getElementById('prevBook');
        this.nextBookBtn = document.getElementById('nextBook');
        this.prevChapterBtn = document.getElementById('prevChapter');
        this.nextChapterBtn = document.getElementById('nextChapter');

        this.init();
    }

    async init() {
        try {
            await this.loadBibleData();
            this.setupEventListeners();
            this.populateBookSelect();
            this.showWelcomeMessage();
            // Apply default font size
            this.applyFontSize();
        } catch (error) {
            console.error('Error initializing app:', error);
            this.showError('Failed to load Bible data. Please refresh the page.');
        }
    }

    async loadBibleData() {
        try {
            // Load English Bible data
            const englishResponse = await fetch('data/english.json');
            if (!englishResponse.ok) {
                throw new Error('Failed to load English Bible data');
            }
            this.englishData = await englishResponse.json();

            // Load Korean Bible data
            const koreanResponse = await fetch('data/korean.json');
            if (!koreanResponse.ok) {
                throw new Error('Failed to load Korean Bible data');
            }
            this.koreanData = await koreanResponse.json();
        } catch (error) {
            throw new Error('Error loading Bible data: ' + error.message);
        }
    }

    setupEventListeners() {
        // Book selection
        this.bookSelect.addEventListener('change', (e) => {
            this.onBookChange(e.target.value);
        });

        // Chapter selection
        this.chapterSelect.addEventListener('change', (e) => {
            this.onChapterChange(e.target.value);
        });

        // Verse selection
        this.verseSelect.addEventListener('change', (e) => {
            this.onVerseChange(e.target.value);
        });

        // Font size buttons
        this.fontSizeDown.addEventListener('click', () => this.decreaseFontSize());
        this.fontSizeUp.addEventListener('click', () => this.increaseFontSize());

        // Navigation buttons
        this.prevBookBtn.addEventListener('click', () => this.navigateBook(-1));
        this.nextBookBtn.addEventListener('click', () => this.navigateBook(1));
        this.prevChapterBtn.addEventListener('click', () => this.navigateChapter(-1));
        this.nextChapterBtn.addEventListener('click', () => this.navigateChapter(1));

        // Synchronized scrolling
        const englishColumn = document.querySelector('.english-column');
        const koreanColumn = document.querySelector('.korean-column');

        englishColumn.addEventListener('scroll', () => {
            this.syncScroll(englishColumn, koreanColumn);
        });

        koreanColumn.addEventListener('scroll', () => {
            this.syncScroll(koreanColumn, englishColumn);
        });

        // Capture scroll position before orientation changes (fires before layout changes)
        window.addEventListener('orientationchange', () => {
            if (this.englishText.children.length > 0) {
                this.savedTopVerse = this.getTopVisibleVerse();
            }
        });

        // Re-sync verse heights on window resize, preserving top visible verse.
        // For non-orientation resizes, capture position on the FIRST resize event
        // (before the debounce fires and the layout has settled into its new state).
        let resizeTimeout = null;
        window.addEventListener('resize', () => {
            if (resizeTimeout === null && this.savedTopVerse === null && this.englishText.children.length > 0) {
                this.savedTopVerse = this.getTopVisibleVerse();
            }
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                resizeTimeout = null;
                if (this.englishText.children.length > 0) {
                    this.syncVerseHeights();
                    if (this.savedTopVerse !== null) {
                        const verseToRestore = this.savedTopVerse;
                        this.savedTopVerse = null;
                        requestAnimationFrame(() => {
                            this.scrollToVersePosition(verseToRestore);
                        });
                    }
                }
            }, 250);
        });
    }

    syncScroll(source, target) {
        if (this.isRestoringPosition) {
            return;
        }
        if (this.isSyncing) {
            this.isSyncing = false;
            return;
        }

        this.isSyncing = true;

        // Calculate scroll percentage
        const scrollPercentage = source.scrollTop / (source.scrollHeight - source.clientHeight);

        // Apply to target
        target.scrollTop = scrollPercentage * (target.scrollHeight - target.clientHeight);
    }

    populateBookSelect() {
        // Clear existing options except the first one
        this.bookSelect.innerHTML = '<option value="">Book...</option>';

        this.englishData.books.forEach((englishBook, index) => {
            const koreanBook = this.koreanData.books[index];
            const option = document.createElement('option');
            option.value = index;
            option.textContent = `${englishBook.name} (${koreanBook.name})`;
            this.bookSelect.appendChild(option);
        });
    }

    onBookChange(bookIndex) {
        if (bookIndex === '') {
            this.chapterSelect.innerHTML = '<option value="">&mdash;</option>';
            this.chapterSelect.disabled = true;
            this.verseSelect.innerHTML = '<option value="">&mdash;</option>';
            this.verseSelect.disabled = true;
            this.clearContent();
            this.updateNavigationButtons();
            return;
        }

        this.currentBookIndex = parseInt(bookIndex);

        // Reset verse selector BEFORE populating chapters
        // (populateChapterSelect may auto-select and populate verses for single-chapter books)
        this.verseSelect.innerHTML = '<option value="">&mdash;</option>';
        this.verseSelect.disabled = true;

        this.populateChapterSelect();
        this.updateNavigationButtons();
    }

    populateChapterSelect() {
        this.chapterSelect.innerHTML = '<option value="">&mdash;</option>';

        const englishBook = this.englishData.books[this.currentBookIndex];

        englishBook.chapters.forEach((chapter, index) => {
            const option = document.createElement('option');
            option.value = index;
            option.textContent = `Ch. ${chapter.number}`;
            this.chapterSelect.appendChild(option);
        });

        this.chapterSelect.disabled = false;

        // Auto-select first chapter
        this.chapterSelect.value = 0;
        this.onChapterChange(0);
    }

    onChapterChange(chapterIndex) {
        if (chapterIndex === '') {
            this.clearContent();
            this.updateNavigationButtons();
            return;
        }

        this.currentChapterIndex = parseInt(chapterIndex);
        this.displayChapter();
        this.updateNavigationButtons();
    }

    displayChapter() {
        const englishBook = this.englishData.books[this.currentBookIndex];
        const koreanBook = this.koreanData.books[this.currentBookIndex];
        const englishChapter = englishBook.chapters[this.currentChapterIndex];
        const koreanChapter = koreanBook.chapters[this.currentChapterIndex];

        // Clear previous content
        this.englishText.innerHTML = '';
        this.koreanText.innerHTML = '';

        // Build verse-number-keyed maps for alignment (handles skipped verse numbers)
        const englishVerseMap = {};
        englishChapter.verses.forEach(v => { englishVerseMap[v.number] = v; });
        const koreanVerseMap = {};
        koreanChapter.verses.forEach(v => { koreanVerseMap[v.number] = v; });

        // Union of all verse numbers, sorted numerically
        const allVerseNumbers = [...new Set([
            ...Object.keys(englishVerseMap),
            ...Object.keys(koreanVerseMap)
        ])].map(Number).sort((a, b) => a - b);

        // Check for mismatch and display warning if present
        if (englishChapter.verses.length !== koreanChapter.verses.length) {
            console.warn(`Verse count mismatch in ${englishBook.name} Chapter ${englishChapter.number}: English=${englishChapter.verses.length}, Korean=${koreanChapter.verses.length}`);
        }

        // Populate verse selector with actual verse numbers
        this.populateVerseSelect(allVerseNumbers);

        // Display verses aligned by verse number
        allVerseNumbers.forEach(verseNum => {
            const englishVerse = englishVerseMap[verseNum];
            const koreanVerse = koreanVerseMap[verseNum];

            // English verse (or placeholder if missing/empty)
            if (englishVerse && englishVerse.text !== '[]') {
                const englishVerseElement = this.createVerseElement(englishVerse.number, englishVerse.text);
                this.englishText.appendChild(englishVerseElement);
            } else {
                const englishVerseElement = this.createVerseElement(verseNum, '[Verse not in this translation]', true);
                this.englishText.appendChild(englishVerseElement);
            }

            // Korean verse (or placeholder if missing)
            if (koreanVerse) {
                const koreanVerseElement = this.createVerseElement(koreanVerse.number, koreanVerse.text);
                this.koreanText.appendChild(koreanVerseElement);
            } else {
                const koreanVerseElement = this.createVerseElement(verseNum, '[한국어 번역에서 사용할 수 없는 구절]', true);
                this.koreanText.appendChild(koreanVerseElement);
            }
        });

        // Reset scroll position
        document.querySelector('.english-column').scrollTop = 0;
        document.querySelector('.korean-column').scrollTop = 0;

        // Synchronize verse heights for perfect alignment
        this.syncVerseHeights();

        // Enable font size buttons when content is displayed
        this.updateFontSizeButtons();
    }

    syncVerseHeights() {
        // Get all verses from both columns
        const englishVerses = this.englishText.querySelectorAll('.verse');
        const koreanVerses = this.koreanText.querySelectorAll('.verse');

        // Reset any previous height settings
        englishVerses.forEach(verse => verse.style.minHeight = '');
        koreanVerses.forEach(verse => verse.style.minHeight = '');

        // Force a reflow to get accurate natural heights
        void this.englishText.offsetHeight;

        // Match each verse pair to the taller of the two
        englishVerses.forEach((englishVerse, index) => {
            const koreanVerse = koreanVerses[index];
            if (!koreanVerse) return;

            const englishHeight = englishVerse.offsetHeight;
            const koreanHeight = koreanVerse.offsetHeight;
            const maxHeight = Math.max(englishHeight, koreanHeight);

            // Set both verses to the same height
            englishVerse.style.minHeight = `${maxHeight}px`;
            koreanVerse.style.minHeight = `${maxHeight}px`;
        });
    }

    getTopVisibleVerse() {
        const englishColumn = document.querySelector('.english-column');
        const verses = this.englishText.querySelectorAll('.verse');
        const columnScrollTop = englishColumn.scrollTop;
        const columnOffsetTop = englishColumn.offsetTop;

        for (const verse of verses) {
            // verse.offsetTop is relative to body; subtract column's offsetTop to get column-relative position
            const verseTop = verse.offsetTop - columnOffsetTop;
            const verseBottom = verseTop + verse.offsetHeight;

            if (verseBottom > columnScrollTop) {
                const verseNum = verse.getAttribute('data-verse');
                // Fraction of verse scrolled past (0 = at top, 1 = fully scrolled past)
                const fractionalOffset = (columnScrollTop - verseTop) / verse.offsetHeight;
                return { verseNum, fractionalOffset: Math.max(0, fractionalOffset) };
            }
        }
        return null;
    }

    scrollToVersePosition(topVerse) {
        const englishColumn = document.querySelector('.english-column');
        const koreanColumn = document.querySelector('.korean-column');
        const englishVerse = this.englishText.querySelector(`[data-verse="${topVerse.verseNum}"]`);
        const koreanVerse = this.koreanText.querySelector(`[data-verse="${topVerse.verseNum}"]`);

        if (englishVerse && koreanVerse) {
            // Force reflow so offsetTop values reflect the new layout after syncVerseHeights
            void this.englishText.offsetHeight;

            const englishTop = englishVerse.offsetTop - englishColumn.offsetTop;
            const koreanTop = koreanVerse.offsetTop - koreanColumn.offsetTop;

            // Use isRestoringPosition (not isSyncing) so syncScroll ignores both scroll events
            this.isRestoringPosition = true;
            englishColumn.scrollTop = englishTop + (topVerse.fractionalOffset * englishVerse.offsetHeight);
            koreanColumn.scrollTop = koreanTop + (topVerse.fractionalOffset * koreanVerse.offsetHeight);
            setTimeout(() => { this.isRestoringPosition = false; }, 100);
        }
    }

    createVerseElement(number, text, isMissing = false) {
        const verseDiv = document.createElement('div');
        verseDiv.className = 'verse';
        verseDiv.setAttribute('data-verse', number);

        // Add missing-verse class for placeholder verses
        if (isMissing) {
            verseDiv.classList.add('missing-verse');
        }

        const verseNumber = document.createElement('span');
        verseNumber.className = 'verse-number';
        verseNumber.textContent = number;

        const verseText = document.createElement('span');
        verseText.className = 'verse-text';
        verseText.textContent = text;

        verseDiv.appendChild(verseNumber);
        verseDiv.appendChild(verseText);

        return verseDiv;
    }

    populateVerseSelect(verseNumbers) {
        // Clear and populate verse selector
        this.verseSelect.innerHTML = '<option value="">&mdash;</option>';

        verseNumbers.forEach(num => {
            const option = document.createElement('option');
            option.value = num;
            option.textContent = `v. ${num}`;
            this.verseSelect.appendChild(option);
        });

        this.verseSelect.disabled = false;
    }

    onVerseChange(verseNumber) {
        if (verseNumber === '') {
            return;
        }

        // Find the verse elements in both columns
        const englishColumn = document.querySelector('.english-column');
        const koreanColumn = document.querySelector('.korean-column');
        const englishVerse = this.englishText.querySelector(`[data-verse="${verseNumber}"]`);
        const koreanVerse = this.koreanText.querySelector(`[data-verse="${verseNumber}"]`);

        if (englishVerse && koreanVerse) {
            // Scroll both columns to the verse
            const englishOffset = englishVerse.offsetTop - englishColumn.offsetTop - 20;
            const koreanOffset = koreanVerse.offsetTop - koreanColumn.offsetTop - 20;

            // Temporarily disable sync to prevent interference
            this.isSyncing = true;
            englishColumn.scrollTop = englishOffset;
            koreanColumn.scrollTop = koreanOffset;

            // Re-enable sync after a short delay
            setTimeout(() => {
                this.isSyncing = false;
            }, 100);

            // Reset verse selector
            this.verseSelect.value = '';
        }
    }

    increaseFontSize() {
        if (this.currentFontSizeIndex < this.fontSizes.length - 1) {
            this.currentFontSizeIndex++;
            this.applyFontSize();
            this.updateFontSizeButtons();
        }
    }

    decreaseFontSize() {
        if (this.currentFontSizeIndex > 0) {
            this.currentFontSizeIndex--;
            this.applyFontSize();
            this.updateFontSizeButtons();
        }
    }

    applyFontSize() {
        const size = this.fontSizes[this.currentFontSizeIndex];

        // Map size names to actual font sizes
        const fontSizeMap = {
            'small': '0.875rem',
            'medium': '1rem',
            'large': '1.125rem',
            'xlarge': '1.25rem',
            'xxlarge': '1.5rem',
            'xxxlarge': '1.75rem',
            'huge': '2rem',
            'massive': '2.5rem'
        };

        const fontSize = fontSizeMap[size] || '1rem';

        // Directly set font-size on all verse elements
        const allVerses = document.querySelectorAll('.verse');

        allVerses.forEach(verse => {
            verse.style.fontSize = fontSize;
        });

        // Re-sync verse heights after font size change
        if (allVerses.length > 0) {
            // Use a small delay to allow the browser to reflow
            setTimeout(() => {
                this.syncVerseHeights();
            }, 50);
        }
    }

    updateFontSizeButtons() {
        // Disable buttons at the extremes
        this.fontSizeDown.disabled = this.currentFontSizeIndex === 0;
        this.fontSizeUp.disabled = this.currentFontSizeIndex === this.fontSizes.length - 1;
    }

    navigateBook(direction) {
        // If no book is selected, handle "next" button to go to Genesis
        if (this.currentBookIndex === null) {
            if (direction === 1) {
                this.bookSelect.value = 0;
                this.onBookChange(0);
            }
            return;
        }

        const newIndex = this.currentBookIndex + direction;
        if (newIndex >= 0 && newIndex < this.englishData.books.length) {
            this.bookSelect.value = newIndex;
            this.onBookChange(newIndex);
        }
    }

    navigateChapter(direction) {
        if (this.currentBookIndex === null || this.currentChapterIndex === null) return;

        const englishBook = this.englishData.books[this.currentBookIndex];
        const newChapterIndex = this.currentChapterIndex + direction;

        if (newChapterIndex >= 0 && newChapterIndex < englishBook.chapters.length) {
            this.chapterSelect.value = newChapterIndex;
            this.onChapterChange(newChapterIndex);
        }
    }

    updateNavigationButtons() {
        // Update book navigation buttons
        if (this.currentBookIndex === null) {
            this.prevBookBtn.disabled = true;
            this.nextBookBtn.disabled = false; // Enable next button to navigate to Genesis
        } else {
            this.prevBookBtn.disabled = this.currentBookIndex === 0;
            this.nextBookBtn.disabled = this.currentBookIndex === this.englishData.books.length - 1;
        }

        // Update chapter navigation buttons
        if (this.currentBookIndex === null || this.currentChapterIndex === null) {
            this.prevChapterBtn.disabled = true;
            this.nextChapterBtn.disabled = true;
        } else {
            const englishBook = this.englishData.books[this.currentBookIndex];
            this.prevChapterBtn.disabled = this.currentChapterIndex === 0;
            this.nextChapterBtn.disabled = this.currentChapterIndex === englishBook.chapters.length - 1;
        }
    }

    showWelcomeMessage() {
        const welcomeHTML = `
            <div class="empty-state">
                <p>Welcome to the English-Korean Bible</p>
                <p style="font-size: 0.8em; opacity: 0.6;">v${VERSION}</p>
                <p>Select a book and chapter to begin reading</p>
                <p>English translation from <a href="https://github.com/thiagobodruk/bible/blob/master/json/en_bbe.json">https://github.com/thiagobodruk</a></p>
                <p>Korean translation from <a href="https://github.com/thiagobodruk/bible/blob/master/json/ko_ko.json">https://github.com/thiagobodruk</a></p>
                <p>Other sources used:<br>
                <a href="https://get.bible/bible-data-sets">https://get.bible/bible-data-sets</a><br>
                <a href="https://github.com/getbible/v2">https://github.com/getbible/v2</a><br>
                <a href="https://scripture.api.bible">https://scripture.api.bible</a><br>
                </p>
            </div>
        `;
        this.englishText.innerHTML = welcomeHTML;
        this.koreanText.innerHTML = `
            <div class="empty-state">
                <p>영한 성경에 오신 것을 환영합니다</p>
                <p>읽기 시작하려면 책과 장을 선택하세요</p>
            </div>
        `;
        this.updateNavigationButtons();
        // Disable font size buttons on welcome page
        this.fontSizeDown.disabled = true;
        this.fontSizeUp.disabled = true;
    }

    clearContent() {
        this.showWelcomeMessage();
    }

    showError(message) {
        this.englishText.innerHTML = `
            <div class="empty-state">
                <p style="color: #e74c3c;">${message}</p>
            </div>
        `;
        this.koreanText.innerHTML = this.englishText.innerHTML;
    }
}

// Initialize the app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new BibleApp();
});
