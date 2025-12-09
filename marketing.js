// Connect to server via Socket.IO
const socket = io();

// DOM references
const grid = document.getElementById('productGrid');
const filterInput = document.getElementById('filter');
const refreshBtn = document.getElementById('refresh');

// Holds latest product state by productId
const products = {};

// Render product cards
function renderAll() {
  const q = (filterInput.value || '').toLowerCase();
  grid.innerHTML = '';

  Object.values(products)
    .filter(p => !q || p.name.toLowerCase().includes(q) || (p.tags || []).some(t=>t.includes(q)))
    .sort((a,b) => b.volume - a.volume) // example sort
    .forEach(p => grid.appendChild(createCard(p)));
}

function createCard(p) {
  const card = document.createElement('div');
  card.className = 'card';
  card.dataset.id = p.id;

  const meta = document.createElement('div');
  meta.className = 'meta';
  meta.innerHTML = `<div><h3>${escapeHtml(p.name)}</h3><p>${escapeHtml(p.vendor || 'Unknown vendor')}</p></div>
                    <div class="price" id="price-${p.id}">₹${formatMoney(p.price)}</div>`;

  const bottom = document.createElement('div');
  bottom.style.display = 'flex';
  bottom.style.justifyContent = 'space-between';
  bottom.style.alignItems = 'center';

  const changeBadge = document.createElement('div');
  changeBadge.className = 'badge ' + (p.change >= 0 ? 'up':'down');
  changeBadge.id = `chg-${p.id}`;
  changeBadge.textContent = (p.change >= 0 ? '+' : '') + p.change.toFixed(2) + '%';

  const info = document.createElement('div');
  info.innerHTML = `<small class="muted">Updated: ${new Date(p.updated).toLocaleTimeString()}</small>`;

  bottom.appendChild(changeBadge);
  bottom.appendChild(info);

  card.appendChild(meta);
  card.appendChild(document.createElement('hr'));
  card.appendChild(bottom);

  // attach prev price for animation detection
  card.dataset.prevPrice = p.prevPrice ?? p.price;
  return card;
}

// Utility
function formatMoney(n){ return Number(n).toLocaleString('en-IN', {maximumFractionDigits:2}); }
function escapeHtml(t){ return (t+'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

// Handle incoming updates
socket.on('price_update', (payload) => {
  // payload: array of product objects
  payload.forEach(p => {
    const prev = products[p.id];
    // keep prevPrice to detect up/down
    p.prevPrice = prev ? prev.price : (p.prevPrice || p.price);
    p.updated = p.updated || Date.now();
    products[p.id] = p;
  });

  // render & apply animation on changed items
  renderAll();
  payload.forEach(p => flashUpdate(p.id, p.prevPrice, p.price));
});

// on connect, request initial snapshot
socket.on('connect', () => {
  socket.emit('get_snapshot');
});

// Refresh button triggers a server request for immediate refresh
refreshBtn.addEventListener('click', () => {
  socket.emit('force_refresh');
});

// filter debounce
let filterTimeout;
filterInput.addEventListener('input', () => {
  clearTimeout(filterTimeout);
  filterTimeout = setTimeout(renderAll, 250);
});

// visual flash helper
function flashUpdate(id, oldPrice, newPrice){
  const priceEl = document.getElementById(`price-${id}`);
  const chgEl = document.getElementById(`chg-${id}`);
  if(!priceEl || !chgEl) return;

  const card = priceEl.closest('.card');
  const diff = newPrice - oldPrice;
  const up = diff >= 0;

  priceEl.classList.remove('flash-up','flash-down');
  chgEl.classList.remove('up','down');
  void priceEl.offsetWidth; // force reflow
  priceEl.textContent = '₹' + formatMoney(newPrice);
  chgEl.textContent = (( (newPrice - oldPrice) / oldPrice ) * 100).toFixed(2) + '%';
  chgEl.classList.add(up ? 'up' : 'down');

  priceEl.classList.add(up ? 'flash-up' : 'flash-down');

  // small animate removal after done
  setTimeout(() => {
    priceEl.classList.remove('flash-up','flash-down');
  }, 1000);
}