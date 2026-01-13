# Dutch Flashcards Progressive Web App

A free, offline-capable PWA for learning Dutch vocabulary with 772 A2-level words enriched with Wiktionary data.

## Features

- **772 Flashcards** with authentic Dutch dictionary data
- **Smart Filters**: Filter by Part of Speech (noun, verb, adjective, etc.) and CEFR Level (A1-C2)
- **Daily Review**: Get 20 random mixed flashcards for daily practice
- **Search with Autocomplete**: Find words by Dutch word or English meaning
- **Audio Pronunciation**: Stream native pronunciation from Wikimedia Commons
- **Swipeable Cards**: Navigate through multiple POS definitions with touch gestures
- **Offline Support**: Works without internet after first load (PWA)
- **Add to Home Screen**: Install like a native app on iPhone/Android

## Flashcard Structure

### Front Card
- Article (de/het for nouns)
- Dutch word
- Audio pronunciation button
- Hyphenation

### Back Cards (Swipeable)
1. **Basic Info Card**: Level, meanings, synonyms, antonyms, derived words, etymology
2. **POS Cards** (one per part of speech): 
   - Gender (for nouns)
   - Key forms (past tense, plural, etc.)
   - Dutch definition
   - Example sentences

## Deployment to GitHub Pages

### Step 1: Create GitHub Repository
1. Go to GitHub.com and create a new repository
2. Name it whatever you like (e.g., `dutch-flashcards`)
3. Make it public (required for free GitHub Pages)

### Step 2: Push Code to GitHub
```powershell
# Navigate to webapp folder
cd c:\Users\akupadhyay.LARKINFOLAB\Documents\dutch_learning_app\webapp

# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit: Dutch Flashcards PWA"

# Add remote (replace YOUR_USERNAME and YOUR_REPO)
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git

# Push to GitHub
git branch -M main
git push -u origin main
```

### Step 3: Enable GitHub Pages
1. Go to your repository on GitHub
2. Click **Settings** tab
3. Scroll to **Pages** section (left sidebar)
4. Under **Source**, select:
   - Branch: `main`
   - Folder: `/ (root)`
5. Click **Save**
6. Wait 1-2 minutes for deployment
7. Your app will be live at: `https://YOUR_USERNAME.github.io/YOUR_REPO/`

### Step 4: Install as PWA on iPhone
1. Open the GitHub Pages URL in Safari on iPhone
2. Tap the **Share** button (square with arrow)
3. Scroll down and tap **Add to Home Screen**
4. Name it "Dutch Cards" and tap **Add**
5. App icon appears on home screen - works offline!

### Step 5: Install as PWA on Android
1. Open the GitHub Pages URL in Chrome on Android
2. Tap the menu (3 dots)
3. Tap **Install app** or **Add to Home Screen**
4. Confirm installation
5. App appears in app drawer - works offline!

## Local Development

To test locally before deploying:

```powershell
# Navigate to webapp folder
cd webapp

# Start a local server (Python 3)
python -m http.server 8000

# OR using Node.js
npx http-server -p 8000

# Open browser to: http://localhost:8000
```

**Note**: For PWA features to work, you need HTTPS. GitHub Pages provides this automatically. For local testing, some browsers allow PWA features on localhost.

## File Structure

```
webapp/
├── index.html          # Main HTML structure
├── style_new.css       # Modern responsive styling
├── app_new.js          # Flashcard app logic
├── sw.js              # Service Worker (offline support)
├── manifest.json      # PWA manifest (install config)
├── flashcards.json    # 772 flashcards data
└── logo.png          # App logo/icon
```

## Data Pipeline (Behind the Scenes)

The flashcards were generated using:
1. **PDF Extraction**: Extracted 772 words from Dutch vocabulary PDF
2. **Dictionary Enrichment**: Matched with Wiktionary Dutch dictionary (606K+ words)
3. **Smart Form Extraction**: Selected essential forms only (not all 113 verb forms)
4. **Audio URL Extraction**: Found 689 pronunciation files on Wikimedia Commons
5. **Flashcard Generation**: Converted to flashcard format with POS cards

**Success Rate**: 89.2% of words enriched with full dictionary data

## Technologies Used

- **HTML5**: Semantic structure
- **CSS3**: Modern flexbox/grid layouts, animations
- **Vanilla JavaScript**: No framework dependencies (fast, lightweight)
- **Service Worker API**: Offline caching
- **Web Audio API**: Pronunciation playback
- **Touch Events**: Swipe gestures
- **Fetch API**: Data loading

## Browser Compatibility

- ✅ Chrome/Edge (Desktop & Mobile)
- ✅ Safari (Desktop & iOS)
- ✅ Firefox (Desktop & Android)
- ✅ Samsung Internet

## License & Attribution

- **Dictionary Data**: Wiktionary (CC BY-SA 4.0)
- **Audio Files**: Wikimedia Commons (various licenses, see individual files)
- **Code**: Free to use for educational purposes

## Totally Free! 💰

- ❌ No App Store fees ($99/year Apple + $25 Google)
- ❌ No backend server costs
- ❌ No database hosting
- ✅ 100% Free with GitHub Pages
- ✅ Works like a native app
- ✅ Offline support included

---

**Author**: Built with Python data pipeline + PWA frontend  
**Words**: 772 A2-level Dutch words  
**Enrichment**: 89.2% success rate from Wiktionary  
**Audio**: 689 pronunciation files available  
**Cost**: $0.00 forever 🎉
