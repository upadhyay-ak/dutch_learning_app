

const flashcardContainer = document.getElementById('flashcardContainer');
const searchInput = document.getElementById('search');
const categoryFilter = document.getElementById('categoryFilter');
const levelFilter = document.getElementById('levelFilter');
const dailyReviewBtn = document.getElementById('dailyReview');
const autocompleteList = document.getElementById('autocomplete-list');



let currentLang = 'en';
// Load translations
let translationsLoaded = false;
function loadTranslations(cb) {
  if (translationsLoaded) { cb(); return; }
  const script = document.createElement('script');
  script.src = 'translations.js';
  script.onload = () => { translationsLoaded = true; cb(); };
  document.head.appendChild(script);
}

function setLanguage(lang) {
  currentLang = lang;
  updateUITranslations();
  renderFlashcards(filteredCards || flashcards || []);
}

function updateUITranslations() {
  if (!window.translations) return;
  const t = translations[currentLang];
  // Title
  const titleEl = document.querySelector('h1[data-i18n="title"]');
  if (titleEl) titleEl.textContent = t.title;
  // Search placeholder
  const searchEl = document.getElementById('search');
  if (searchEl) searchEl.placeholder = t.search;
  // Category filter
  const catSel = document.getElementById('categoryFilter');
  if (catSel) {
    Array.from(catSel.options).forEach(opt => {
      if (opt.value === 'all') opt.textContent = t.all;
      else if (t[opt.value]) opt.textContent = t[opt.value];
    });
  }
  // Level filter
  const levelSel = document.getElementById('levelFilter');
  if (levelSel) {
    Array.from(levelSel.options).forEach(opt => {
      if (opt.value === 'all') opt.textContent = t.allLevels;
    });
  }
  // Daily review button
  const drBtn = document.getElementById('dailyReview');
  if (drBtn) drBtn.textContent = t.dailyReview;
}

// Language selector event
document.addEventListener('DOMContentLoaded', function() {
  loadTranslations(() => {
    const langSel = document.getElementById('languageSelector');
    if (langSel) {
      langSel.value = currentLang;
      langSel.addEventListener('change', e => setLanguage(e.target.value));
    }
    // Initial fetch and render
    fetch('flashcards.json')
      .then(res => res.json())
      .then(data => {
        flashcards = data.flashcards;
        filteredCards = flashcards;
        populateCategoryFilter(flashcards);
        updateUITranslations();
        renderFlashcards(filteredCards);
      });
  });
});

function populateCategoryFilter(cards) {
  const categories = new Set();
  cards.forEach(card => {
    if (card.type === 'grammar') {
      categories.add('grammar');
    } else if (card.usages && Array.isArray(card.usages)) {
      card.usages.forEach(u => {
        if (u.category) categories.add(u.category);
      });
    }
  });
  const sortedCats = Array.from(categories).sort();
  categoryFilter.innerHTML = '<option value="all">All</option>' +
    sortedCats.map(cat => `<option value="${cat}">${capitalize(cat)}</option>`).join('');
}

searchInput.addEventListener('input', () => {
  filterAndRender();
  showAutocompleteSuggestions();
});

searchInput.addEventListener('blur', () => {
  setTimeout(() => autocompleteList.innerHTML = '', 150);
});

autocompleteList.addEventListener('mousedown', (e) => {
  if (e.target && e.target.matches('div[data-value]')) {
    searchInput.value = e.target.getAttribute('data-value');
    filterAndRender();
    autocompleteList.innerHTML = '';
    searchInput.focus();
  }
});

function showAutocompleteSuggestions() {
  const val = searchInput.value.trim().toLowerCase();
  if (!val) {
    autocompleteList.innerHTML = '';
    autocompleteList.style.display = 'none';
    return;
  }
  let suggestions = new Set();
  flashcards.forEach(card => {
    if (card.word) suggestions.add(card.word);
    if (card.usages && Array.isArray(card.usages)) {
      card.usages.forEach(u => {
        if (u.forms && typeof u.forms === 'object') {
          Object.values(u.forms).forEach(f => {
            if (f.form) suggestions.add(f.form);
          });
        }
        if (u.conjugation && typeof u.conjugation === 'object') {
          Object.values(u.conjugation).forEach(f => {
            if (f.form) suggestions.add(f.form);
          });
        }
      });
    }
  });
  const matches = Array.from(suggestions).filter(s => s.toLowerCase().includes(val)).slice(0, 8);
  if (matches.length === 0) {
    autocompleteList.innerHTML = '';
    autocompleteList.style.display = 'none';
    return;
  }
  autocompleteList.className = 'autocomplete-items';
  autocompleteList.innerHTML = matches.map(s => `<div data-value="${s}">${s}</div>`).join('');
  autocompleteList.style.display = 'block';
}

// Fetch flashcards from JSON
fetch('flashcards.json')
  .then(res => res.json())
  .then(data => {
    flashcards = data.flashcards;
    filteredCards = flashcards;
    renderFlashcards(filteredCards);
  });



function renderFlashcards(cards) {
  flashcardContainer.innerHTML = '';
  if (cards.length === 0) {
    flashcardContainer.innerHTML = '<p>No flashcards found.</p>';
    return;
  }
  const t = window.translations ? translations[currentLang] : {};
  cards.forEach(card => {
    const cardDiv = document.createElement('div');
    let catClass = '';
    if (card.type === 'grammar') {
      catClass = 'grammar';
    } else if (card.usages && Array.isArray(card.usages)) {
      // Use primary usage for color class if available
      const primary = card.usages.find(u => u.primary) || card.usages[0];
      if (primary && primary.category) catClass = primary.category.toLowerCase();
    }
    cardDiv.className = `flashcard${catClass ? ' ' + catClass : ''}`;
    cardDiv.tabIndex = 0;
    cardDiv.innerHTML = getCardFront(card, t);
    cardDiv.addEventListener('click', () => flipCard(cardDiv, card, t));
    cardDiv.addEventListener('keypress', e => { if (e.key === 'Enter') flipCard(cardDiv, card, t); });
    flashcardContainer.appendChild(cardDiv);
  });
}

function getCardFront(card, t = {}) {
  if (card.type === 'grammar') {
    return `<div class="front active">
      <div class="grammar-title">${card.title}</div>
    </div>`;
  }
  return `<div class="front active">
    <div class="word">${card.word || ''}</div>
  </div>`;
}

function getCardBack(card, t = {}) {
  if (card.type === 'grammar') {
    return `<div class="back active">
      <div class="grammar-title">${card.title}</div>
      <div>${card.description || ''}</div>
      <div>${card.example || ''}</div>
    </div>`;
  }
  let html = `<div class="back active">`;
  html += `<div class="word">${card.word || ''}</div>`;
  if (card.usages && Array.isArray(card.usages)) {
    // Sort usages: primary first
    const usages = [...card.usages].sort((a, b) => (b.primary ? 1 : 0) - (a.primary ? 1 : 0));
    usages.forEach(usage => {
      html += `<div class="usage-box">
        <div class="usage-category"><b>${t[usage.category] || capitalize(usage.category || '')}${usage.primary ? ' ' + (t.primary || '(primary)') : ''}</b></div>
        <div class="usage-meaning">${usage.meaning ? (usage.meaning[currentLang] || usage.meaning['en'] || '') : ''}</div>`;
      if (usage.article) {
        html += `<div class="usage-article">Article: ${usage.article}</div>`;
      }
      // Forms Table
      if (usage.forms && typeof usage.forms === 'object') {
        html += `<div class='forms'><b>${t.forms || 'Forms:'}</b><table class='forms-table'><thead><tr><th>${t.form || 'Form'}</th><th>${t.value || 'Value'}</th><th>${t.example || 'Example'}</th></tr></thead><tbody>`;
        for (const [formName, formObj] of Object.entries(usage.forms)) {
          html += `<tr><td>${t[formName] || capitalize(formName)}</td><td>${formObj.form}</td><td>${formObj.example || ''}</td></tr>`;
        }
        html += `</tbody></table></div>`;
      }
      // Conjugation Table
      if (usage.conjugation && typeof usage.conjugation === 'object') {
        html += `<div class='conjugation'><b>Conjugation:</b><table class='conjugation-table'><thead><tr><th>Pronoun</th><th>${t.form || 'Form'}</th><th>${t.example || 'Example'}</th></tr></thead><tbody>`;
        for (const [pronoun, conjObj] of Object.entries(usage.conjugation)) {
          html += `<tr><td>${pronoun}</td><td>${conjObj.form}</td><td>${conjObj.example || ''}</td></tr>`;
        }
        html += `</tbody></table></div>`;
      }
      if (usage.notes) {
        html += `<div class="notes">${t.notes || 'Notes:'} ${(usage.notes[currentLang] || usage.notes['en'] || '')}</div>`;
      }
      html += `</div>`; // usage-box
    });
  }
  html += '</div>';
  return html;
}

function flipCard(cardDiv, card, t = {}) {
  const isFlipped = cardDiv.classList.toggle('flipped');
  cardDiv.innerHTML = isFlipped ? getCardBack(card, t) : getCardFront(card, t);
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}


categoryFilter.addEventListener('change', () => {
  filterAndRender();
});

levelFilter.addEventListener('change', () => {
  filterAndRender();
});

dailyReviewBtn.addEventListener('click', () => {
  if (!showingDaily) {
    dailyCards = getDailyCards();
    renderFlashcards(dailyCards);
    dailyReviewBtn.textContent = 'Show All';
    showingDaily = true;
  } else {
    renderFlashcards(filteredCards);
    dailyReviewBtn.textContent = 'Daily Review';
    showingDaily = false;
  }
});

function filterAndRender() {
  const search = searchInput.value.trim().toLowerCase();
  const cat = categoryFilter.value;
  const level = levelFilter.value;
  filteredCards = flashcards.filter(card => {
    // Category filter: check all usages for a match
    let matchesCat = cat === 'all' ||
      (cat === 'grammar' && card.type === 'grammar') ||
      (card.usages && card.usages.some(u => u.category === cat));

    // Level filter (top-level)
    let matchesLevel = level === 'all' || (card.level && card.level === level);

    // Search logic: check word, and all usages (meaning, forms, conjugation)
    let matchesSearch = !search || (
      (card.word && card.word.toLowerCase().includes(search)) ||
      (card.title && card.title.toLowerCase().includes(search)) ||
      (card.usages && card.usages.some(u =>
        (u.meaning && u.meaning.toLowerCase().includes(search)) ||
        (u.forms && Object.values(u.forms).some(f => f.form && f.form.toLowerCase().includes(search))) ||
        (u.conjugation && Object.values(u.conjugation).some(f => f.form && f.form.toLowerCase().includes(search)))
      ))
    );
    return matchesCat && matchesLevel && matchesSearch;
  });
  renderFlashcards(filteredCards);
}

function getDailyCards() {
  // Simple: pick 10 random cards each day based on date
  const today = new Date().toISOString().slice(0,10);
  const seed = today.split('-').join('');
  let arr = [...flashcards];
  arr.sort((a, b) => hashCode(a.word || a.title + seed) - hashCode(b.word || b.title + seed));
  return arr.slice(0, 10);
}

function hashCode(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return hash;
}
