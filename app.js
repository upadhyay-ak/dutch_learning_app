// Dutch Flashcards App
let allCards = [];
let filteredCards = [];
let currentCardIndex = 0;
let isDailyReview = false;
let currentAudio = null;

// Load flashcards on page load
document.addEventListener('DOMContentLoaded', () => {
  setupEventListeners();
  loadFlashcards();
});

async function loadFlashcards() {
  try {
    const response = await fetch('flashcards.json');
    const data = await response.json();
    allCards = data.cards;
    
    console.log('Loaded', allCards.length, 'flashcards');
    
    // Populate POS filter
    populatePOSFilter();
    
    // Display all cards initially
    filteredCards = [...allCards];
    console.log('Displaying', filteredCards.length, 'cards');
    displayCardList();
  } catch (error) {
    console.error('Error loading flashcards:', error);
    alert('Failed to load flashcards. Please refresh the page.');
  }
}

function populatePOSFilter() {
  const posSet = new Set();
  allCards.forEach(card => {
    if (card.pos_cards && Array.isArray(card.pos_cards)) {
      card.pos_cards.forEach(pos => {
        if (pos.pos_type && typeof pos.pos_type === 'string') {
          posSet.add(pos.pos_type);
        }
      });
    }
  });
  
  const posFilter = document.getElementById('posFilter');
  if (!posFilter) return;
  
  const sorted = Array.from(posSet).sort();
  sorted.forEach(pos => {
    const option = document.createElement('option');
    option.value = pos;
    option.textContent = pos.charAt(0).toUpperCase() + pos.slice(1);
    posFilter.appendChild(option);
  });
}

function setupEventListeners() {
  // Search
  const searchInput = document.getElementById('search');
  if (searchInput) {
    searchInput.addEventListener('input', handleSearch);
    searchInput.addEventListener('focus', () => {
      if (searchInput.value) handleSearch();
    });
  }
  
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.search-wrapper')) {
      const autocomplete = document.getElementById('autocomplete-list');
      if (autocomplete) autocomplete.innerHTML = '';
    }
  });
  
  // Filters
  const posFilter = document.getElementById('posFilter');
  const levelFilter = document.getElementById('levelFilter');
  if (posFilter) posFilter.addEventListener('change', applyFilters);
  if (levelFilter) levelFilter.addEventListener('change', applyFilters);
  
  // Daily Review
  const dailyReviewBtn = document.getElementById('dailyReviewBtn');
  if (dailyReviewBtn) dailyReviewBtn.addEventListener('click', toggleDailyReview);
  
  // Flashcard navigation
  const closeBtn = document.getElementById('closeFlashcard');
  const prevBtn = document.getElementById('prevCard');
  const nextBtn = document.getElementById('nextCard');
  const flipBtn = document.getElementById('flipCard');
  const audioBtn = document.getElementById('audioBtn');
  
  if (closeBtn) closeBtn.addEventListener('click', closeFlashcard);
  if (prevBtn) prevBtn.addEventListener('click', () => navigateCard(-1));
  if (nextBtn) nextBtn.addEventListener('click', () => navigateCard(1));
  if (flipBtn) flipBtn.addEventListener('click', flipCard);
  if (audioBtn) audioBtn.addEventListener('click', playAudio);
  
  // Keyboard navigation
  document.addEventListener('keydown', handleKeyboard);
  
  // Touch swipe for back cards
  setupBackCardsSwipe();
}

function handleSearch() {
  const query = document.getElementById('search').value.toLowerCase().trim();
  const autocompleteList = document.getElementById('autocomplete-list');
  
  if (!query) {
    autocompleteList.innerHTML = '';
    applyFilters();
    return;
  }
  
  // Find matching words and meanings
  const matches = allCards.filter(card => {
    const wordMatch = card.front.word.toLowerCase().includes(query);
    const meaningMatch = card.back.meanings.some(m => m.toLowerCase().includes(query));
    return wordMatch || meaningMatch;
  }).slice(0, 10);
  
  // Show autocomplete
  autocompleteList.innerHTML = '';
  matches.forEach((card, index) => {
    const div = document.createElement('div');
    div.textContent = `${card.front.word}${card.front.article ? ' (' + card.front.article + ')' : ''}`;
    div.addEventListener('click', () => {
      document.getElementById('search').value = card.front.word;
      autocompleteList.innerHTML = '';
      filteredCards = matches;
      displayCardList();
      // Open the selected card immediately
      openFlashcard(index);
    });
    autocompleteList.appendChild(div);
  });
  
  // Apply search filter
  filteredCards = matches;
  displayCardList();
}

function applyFilters() {
  const searchQuery = document.getElementById('search').value.toLowerCase().trim();
  const posFilter = document.getElementById('posFilter').value;
  const levelFilter = document.getElementById('levelFilter').value;
  
  filteredCards = allCards.filter(card => {
    // Search filter
    if (searchQuery) {
      const wordMatch = card.front.word.toLowerCase().includes(searchQuery);
      const meaningMatch = card.back.meanings.some(m => m.toLowerCase().includes(searchQuery));
      if (!wordMatch && !meaningMatch) return false;
    }
    
    // POS filter
    if (posFilter !== 'all') {
      const hasPOS = card.pos_cards.some(pos => pos.pos_type === posFilter);
      if (!hasPOS) return false;
    }
    
    // Level filter
    if (levelFilter !== 'all') {
      if (card.back.level !== levelFilter) return false;
    }
    
    return true;
  });
  
  displayCardList();
}

function toggleDailyReview() {
  const btn = document.getElementById('dailyReviewBtn');
  isDailyReview = !isDailyReview;
  
  if (isDailyReview) {
    btn.textContent = 'Show All';
    btn.classList.add('active');
    
    // Random 20 cards with mix of POS and levels
    const shuffled = [...allCards].sort(() => Math.random() - 0.5);
    filteredCards = shuffled.slice(0, 20);
  } else {
    btn.textContent = 'Daily Review';
    btn.classList.remove('active');
    applyFilters();
  }
  
  displayCardList();
}

function displayCardList() {
  const container = document.getElementById('cardListView');
  if (!container) {
    console.error('Card list container not found');
    return;
  }
  
  container.innerHTML = '';
  console.log('Rendering', filteredCards.length, 'cards to list');
  
  filteredCards.forEach((card, index) => {
    const cardEl = document.createElement('div');
    cardEl.className = 'card-item';
    cardEl.onclick = () => openFlashcard(index);
    
    const article = card.front.article ? `<span class="card-item-article">${card.front.article}</span>` : '';
    const meanings = card.back.meanings.join(', ');
    
    cardEl.innerHTML = `
      <div class="card-item-word">
        ${article}${card.front.word}
      </div>
      <div class="card-item-meaning">${meanings}</div>
      <div class="card-item-level">${card.back.level}</div>
    `;
    
    container.appendChild(cardEl);
  });
}

function openFlashcard(index) {
  console.log('Opening flashcard', index);
  currentCardIndex = index;
  showFlashcard();
  const flashcardView = document.getElementById('flashcardView');
  if (flashcardView) {
    flashcardView.style.display = 'flex';
  }
}

function closeFlashcard() {
  document.getElementById('flashcardView').style.display = 'none';
  if (currentAudio) {
    currentAudio.pause();
    currentAudio = null;
  }
}

function navigateCard(direction) {
  currentCardIndex += direction;
  if (currentCardIndex < 0) currentCardIndex = filteredCards.length - 1;
  if (currentCardIndex >= filteredCards.length) currentCardIndex = 0;
  
  showFlashcard();
}

function flipCard() {
  console.log('Flipping card');
  const flashcard = document.getElementById('flashcard');
  if (flashcard) {
    flashcard.classList.toggle('flipped');
    console.log('Card flipped, now', flashcard.classList.contains('flipped') ? 'showing back' : 'showing front');
  } else {
    console.error('Flashcard element not found');
  }
}

function showFlashcard() {
  const card = filteredCards[currentCardIndex];
  const flashcard = document.getElementById('flashcard');
  flashcard.classList.remove('flipped');
  
  // Update progress
  document.getElementById('cardProgress').textContent = 
    `${currentCardIndex + 1} / ${filteredCards.length}`;
  
  // Front
  document.getElementById('frontArticle').textContent = card.front.article || '';
  document.getElementById('frontWord').textContent = card.front.word;
  document.getElementById('frontHyphenation').textContent = card.front.hyphenation || '';
  
  // Audio
  const audioBtn = document.getElementById('audioBtn');
  audioBtn.style.display = card.front.audio_file ? 'block' : 'none';
  
  // Back cards
  createBackCards(card);
}

function createBackCards(card) {
  const container = document.getElementById('backCardsContainer');
  const dotsContainer = document.getElementById('cardDots');
  container.innerHTML = '';
  dotsContainer.innerHTML = '';
  
  const backCards = [];
  
  // Card 1: Basic Info + Relations + Etymology
  const basicCard = document.createElement('div');
  basicCard.className = 'back-card';
  basicCard.innerHTML = `
    <h3>Basic Information</h3>
    <div class="back-card-section">
      <div class="back-card-label">Level</div>
      <div class="back-card-value">${card.back.level}</div>
    </div>
    <div class="back-card-section">
      <div class="back-card-label">Meaning</div>
      <div class="back-card-value">${card.back.meanings.join(', ')}</div>
    </div>
    ${card.back.synonyms.length ? `
      <div class="back-card-section">
        <div class="back-card-label">Synonyms</div>
        <div class="back-card-value">${card.back.synonyms.join(', ')}</div>
      </div>
    ` : ''}
    ${card.back.antonyms.length ? `
      <div class="back-card-section">
        <div class="back-card-label">Antonyms</div>
        <div class="back-card-value">${card.back.antonyms.join(', ')}</div>
      </div>
    ` : ''}
    ${card.back.derived_words.length ? `
      <div class="back-card-section">
        <div class="back-card-label">Derived Words</div>
        <div class="back-card-value">${card.back.derived_words.join(', ')}</div>
      </div>
    ` : ''}
    ${card.back.etymology ? `
      <div class="back-card-section">
        <div class="back-card-label">Etymology</div>
        <div class="back-card-value">${card.back.etymology}</div>
      </div>
    ` : ''}
  `;
  backCards.push(basicCard);
  
  // POS cards
  card.pos_cards.forEach(pos => {
    const posCard = document.createElement('div');
    posCard.className = 'back-card';
    
    let formsHTML = '';
    if (pos.key_forms && Object.keys(pos.key_forms).length > 0) {
      formsHTML = `
        <div class="back-card-section">
          <div class="back-card-label">Key Forms</div>
          <ul class="back-card-list">
            ${Object.entries(pos.key_forms).map(([key, value]) => 
              `<li><strong>${key}:</strong> ${value}</li>`
            ).join('')}
          </ul>
        </div>
      `;
    }
    
    let examplesHTML = '';
    if (pos.examples && pos.examples.length > 0) {
      examplesHTML = `
        <div class="back-card-section">
          <div class="back-card-label">Examples</div>
          <ul class="back-card-list">
            ${pos.examples.map(ex => `<li>${ex}</li>`).join('')}
          </ul>
        </div>
      `;
    }
    
    posCard.innerHTML = `
      <h3>${pos.pos_title} (${pos.pos_type})</h3>
      ${pos.gender ? `<div class="back-card-value"><strong>Gender:</strong> ${pos.gender}</div>` : ''}
      <div class="back-card-section">
        <div class="back-card-label">Dutch Meaning</div>
        <div class="back-card-value">${pos.dutch_meaning}</div>
      </div>
      ${formsHTML}
      ${examplesHTML}
    `;
    backCards.push(posCard);
  });
  
  // Add cards and dots
  backCards.forEach((backCard, i) => {
    container.appendChild(backCard);
    
    const dot = document.createElement('div');
    dot.className = 'dot';
    if (i === 0) dot.classList.add('active');
    dotsContainer.appendChild(dot);
  });
  
  // Update dots on scroll
  container.addEventListener('scroll', () => {
    const scrollLeft = container.scrollLeft;
    const cardWidth = container.offsetWidth;
    const activeIndex = Math.round(scrollLeft / cardWidth);
    
    document.querySelectorAll('.dot').forEach((dot, i) => {
      dot.classList.toggle('active', i === activeIndex);
    });
  });
}

function setupBackCardsSwipe() {
  // Touch swipe already works with CSS scroll-snap
  // Just add smooth scrolling on dots click
  document.addEventListener('click', (e) => {
    if (e.target.classList.contains('dot')) {
      const index = Array.from(e.target.parentElement.children).indexOf(e.target);
      const container = document.getElementById('backCardsContainer');
      container.scrollTo({
        left: index * container.offsetWidth,
        behavior: 'smooth'
      });
    }
  });
}

function playAudio() {
  const card = filteredCards[currentCardIndex];
  if (!card.front.audio_file) return;
  
  if (currentAudio) {
    currentAudio.pause();
  }
  
  currentAudio = new Audio(card.front.audio_file);
  currentAudio.play().catch(err => console.error('Audio play failed:', err));
}

function handleKeyboard(e) {
  const flashcardView = document.getElementById('flashcardView');
  if (flashcardView.style.display === 'none') return;
  
  switch(e.key) {
    case 'ArrowLeft':
      navigateCard(-1);
      break;
    case 'ArrowRight':
      navigateCard(1);
      break;
    case ' ':
    case 'Enter':
      e.preventDefault();
      flipCard();
      break;
    case 'Escape':
      closeFlashcard();
      break;
  }
}

// Service Worker Registration (PWA)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js')
      .then(reg => console.log('Service Worker registered'))
      .catch(err => console.log('Service Worker registration failed'));
  });
}
