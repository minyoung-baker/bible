// Bible App - Main JavaScript
class BibleApp {
    constructor() {
        this.englishData = null;
        this.koreanData = null;
        this.currentBookIndex = null;
        this.currentChapterIndex = null;
        this.isSyncing = false;

        // DOM Elements
        this.bookSelect = document.getElementById('bookSelect');
        this.chapterSelect = document.getElementById('chapterSelect');
        this.verseSelect = document.getElementById('verseSelect');
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

        // Re-sync verse heights on window resize
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                if (this.englishText.children.length > 0) {
                    this.syncVerseHeights();
                }
            }, 250);
        });
    }

    syncScroll(source, target) {
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
        this.bookSelect.innerHTML = '<option value="">Select a book...</option>';

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
            this.chapterSelect.innerHTML = '<option value="">Select a chapter...</option>';
            this.chapterSelect.disabled = true;
            this.verseSelect.innerHTML = '<option value="">Go to verse...</option>';
            this.verseSelect.disabled = true;
            this.clearContent();
            this.updateNavigationButtons();
            return;
        }

        this.currentBookIndex = parseInt(bookIndex);

        // Reset verse selector BEFORE populating chapters
        // (populateChapterSelect may auto-select and populate verses for single-chapter books)
        this.verseSelect.innerHTML = '<option value="">Go to verse...</option>';
        this.verseSelect.disabled = true;

        this.populateChapterSelect();
        this.updateNavigationButtons();
    }

    populateChapterSelect() {
        this.chapterSelect.innerHTML = '<option value="">Select a chapter...</option>';

        const englishBook = this.englishData.books[this.currentBookIndex];

        englishBook.chapters.forEach((chapter, index) => {
            const option = document.createElement('option');
            option.value = index;
            option.textContent = `Chapter ${chapter.number}`;
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

        // Populate verse selector
        this.populateVerseSelect(englishChapter.verses.length);

        // Display verses
        englishChapter.verses.forEach((englishVerse, index) => {
            const koreanVerse = koreanChapter.verses[index];

            // English verse
            const englishVerseElement = this.createVerseElement(englishVerse.number, englishVerse.text);
            this.englishText.appendChild(englishVerseElement);

            // Korean verse
            const koreanVerseElement = this.createVerseElement(koreanVerse.number, koreanVerse.text);
            this.koreanText.appendChild(koreanVerseElement);
        });

        // Reset scroll position
        document.querySelector('.english-column').scrollTop = 0;
        document.querySelector('.korean-column').scrollTop = 0;

        // Synchronize verse heights for perfect alignment
        this.syncVerseHeights();
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

    createVerseElement(number, text) {
        const verseDiv = document.createElement('div');
        verseDiv.className = 'verse';
        verseDiv.setAttribute('data-verse', number);

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

    populateVerseSelect(verseCount) {
        // Clear and populate verse selector
        this.verseSelect.innerHTML = '<option value="">Go to verse...</option>';

        for (let i = 1; i <= verseCount; i++) {
            const option = document.createElement('option');
            option.value = i;
            option.textContent = `Verse ${i}`;
            this.verseSelect.appendChild(option);
        }

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

    navigateBook(direction) {
        if (this.currentBookIndex === null) return;

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
            this.nextBookBtn.disabled = true;
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
                <p>Select a book and chapter to begin reading</p>
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
