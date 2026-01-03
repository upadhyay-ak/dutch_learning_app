let flashcards = [];
let filteredCards = [];
let dailyCards = [];
let showingDaily = false;

// Fetch flashcards from JSON
fetch('flashcards.json')
  .then(res => res.json())
  .then(data => {
    flashcards = data.flashcards;
    filteredCards = flashcards;
    renderFlashcards(filteredCards);
  });

const flashcardContainer = document.getElementById('flashcardContainer');
const searchInput = document.getElementById('search');
const categoryFilter = document.getElementById('categoryFilter');
const dailyReviewBtn = document.getElementById('dailyReview');

function renderFlashcards(cards) {
  flashcardContainer.innerHTML = '';
  if (cards.length === 0) {
    flashcardContainer.innerHTML = '<p>No flashcards found.</p>';
    return;
  }
  cards.forEach(card => {
    const cardDiv = document.createElement('div');
    cardDiv.className = 'flashcard';
    cardDiv.tabIndex = 0;
    cardDiv.innerHTML = getCardFront(card);
    cardDiv.addEventListener('click', () => flipCard(cardDiv, card));
    cardDiv.addEventListener('keypress', e => { if (e.key === 'Enter') flipCard(cardDiv, card); });
    flashcardContainer.appendChild(cardDiv);
  });
}

function getCardFront(card) {
  if (card.type === 'grammar') {
    return `<div class="front active">
      <div class="grammar-title">${card.title}</div>
      <div>${card.description}</div>
    </div>`;
  }
  let html = `<div class="front active">
    <div class="word">${card.word || ''}</div>
    <div class="meaning">${card.meaning || ''}</div>
    <div class="category">${capitalize(card.category || '')}${card.article ? ' (' + card.article + ')' : ''}</div>
  `;
  if (card.forms) {
    html += `<div class="forms">Forms: ${Object.entries(card.forms).map(([k,v]) => `${capitalize(k)}: ${v}`).join(', ')}</div>`;
  }
  if (card.plural) {
    html += `<div class="forms">Plural: ${card.plural}</div>`;
  }
  if (card.conjugation) {
    html += `<div class="conjugation">Conjugation:<ul style='margin:4px 0 0 12px;'>${Object.entries(card.conjugation).map(([k,v]) => `<li>${k}: ${v}</li>`).join('')}</ul></div>`;
  }
  html += '</div>';
  return html;
}

function getCardBack(card) {
  if (card.type === 'grammar') {
    return `<div class="back active">
      <div class="grammar-title">${card.title}</div>
      <div>${card.example || ''}</div>
    </div>`;
  }
  let html = `<div class="back active">`;
  if (card.usage_examples && card.usage_examples.length) {
    html += `<div class="usage">Usage:<ul style='margin:4px 0 0 12px;'>${card.usage_examples.map(e => `<li>${e}</li>`).join('')}</ul></div>`;
  }
  if (card.notes) {
    html += `<div class="notes">Notes: ${card.notes}</div>`;
  }
  html += '</div>';
  return html;
}

function flipCard(cardDiv, card) {
  const isFlipped = cardDiv.classList.toggle('flipped');
  cardDiv.innerHTML = isFlipped ? getCardBack(card) : getCardFront(card);
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

searchInput.addEventListener('input', () => {
  filterAndRender();
});

categoryFilter.addEventListener('change', () => {
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
  filteredCards = flashcards.filter(card => {
    let matchesCat = cat === 'all' || (card.category === cat) || (cat === 'grammar' && card.type === 'grammar');
    let matchesSearch = !search || (
      (card.word && card.word.toLowerCase().includes(search)) ||
      (card.meaning && card.meaning.toLowerCase().includes(search)) ||
      (card.usage_examples && card.usage_examples.some(e => e.toLowerCase().includes(search))) ||
      (card.title && card.title.toLowerCase().includes(search))
    );
    return matchesCat && matchesSearch;
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
