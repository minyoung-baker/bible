# English-Korean Bible Website

A bilingual Bible reader that displays English and Korean text side-by-side with synchronized scrolling. Fully responsive and mobile-friendly.

## Features

- **Dual-language display**: English on the left, Korean on the right
- **Synchronized scrolling**: Both columns scroll together to keep passages aligned
- **Easy navigation**: Dropdown menus to select any book and chapter
- **Mobile-friendly**: Responsive design that works on phones, tablets, and desktops
- **Data-driven**: Bible text loaded from separate JSON files for easy editing
- **Verse navigation**: Jump directly to any verse with synchronized scrolling

## How to Use

### Starting the Website

The website loads Bible data from JSON files, which requires running a local web server.

**Option 1: Use the provided script (Mac/Linux)**
```bash
./start-server.sh
```

**Option 2: Use Python directly**
```bash
# Python 3
python3 -m http.server 8000

# OR Python 2
python -m SimpleHTTPServer 8000
```

**Option 3: Use Node.js**
```bash
npx http-server -p 8000
```

Then open your browser to: **http://localhost:8000**

### Reading the Bible

1. **Select a book**: Choose from the book dropdown menu
2. **Select a chapter**: Choose a chapter from the second dropdown
3. **Jump to a verse** (optional): Use the verse dropdown to jump directly to any verse
4. **Read**: Scroll either column and watch both sides stay synchronized

## Project Structure

```
website_kor_english_bible/
├── index.html          # Main HTML file
├── start-server.sh     # Quick server startup script (Mac/Linux)
├── css/
│   └── style.css       # Styling and responsive design
├── js/
│   └── app.js          # Application logic and synchronized scrolling
└── data/
    ├── english.json    # English Bible text (loaded by app)
    └── korean.json     # Korean Bible text (loaded by app)
```

## Adding More Bible Content

The sample data includes:
- Genesis chapters 1-2 (partial verses)
- John chapter 1 (first 10 verses)
- Psalms chapter 23 (complete)

### Quick Start

To add more content, edit the JSON files in the `data/` folder:

### Full Guide

For adding complete books and chapters, see **[ADDING_BIBLE_CONTENT.md](ADDING_BIBLE_CONTENT.md)** which includes:
- Public domain Bible text sources (English & Korean)
- Python conversion script (`convert_to_json.py`)
- Step-by-step instructions
- JSON format reference

### Manual Editing

**English format** (`data/english.json`):
```json
{
  "books": [
    {
      "name": "BookName",
      "abbreviation": "Abbrev",
      "chapters": [
        {
          "number": 1,
          "verses": [
            {"number": 1, "text": "English text here"}
          ]
        }
      ]
    }
  ]
}
```

**Korean format** (`data/korean.json`):
```json
{
  "books": [
    {
      "name": "한국어 책 이름",
      "abbreviation": "약어",
      "chapters": [
        {
          "number": 1,
          "verses": [
            {"number": 1, "text": "한국어 텍스트"}
          ]
        }
      ]
    }
  ]
}
```

**Important**: Books and chapters must be in the same order in both files, with matching verse numbers.

## Mobile Usage

On mobile devices:
- The layout automatically switches to stacked columns
- Each column becomes scrollable independently
- Navigation dropdowns expand to full width for easier tapping

## Browser Compatibility

Works on all modern browsers:
- Chrome, Firefox, Safari, Edge
- iOS Safari, Chrome Mobile
- Supports both desktop and mobile devices

## Technical Details

- **No dependencies**: Pure HTML, CSS, and JavaScript
- **No build process**: No compilation or bundling required
- **Local development**: Requires a local web server (built into Python/Node.js)
- **JSON data**: Separate language files for easy editing and maintenance
- **Modular design**: English and Korean data completely separated

## Customization

### Changing Colors

Edit the CSS variables in `css/style.css`:

```css
:root {
    --primary-color: #2c3e50;    /* Header background */
    --accent-color: #3498db;      /* Verse numbers, buttons */
    --text-color: #333;           /* Main text color */
}
```

### Adjusting Font Size

In `css/style.css`, modify the `.verse` class:

```css
.verse {
    font-size: 1rem;  /* Change this value */
}
```

## Future Enhancements

Potential features to add:
- Search functionality
- Bookmarks and favorites
- Dark mode toggle
- Print-friendly version
- Share verse feature
- Multiple translations
- Audio readings

## License

Free to use and modify for personal or church use.
