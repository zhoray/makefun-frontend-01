import { getBounties } from './api.js';
import { esc, money, timeLeft, count } from './format.js';

const app = document.getElementById('app');

let tickerId;

function startTicker() {
  clearInterval(tickerId);
  tickerId = setInterval(() => {
    document.querySelectorAll('[data-deadline]').forEach(el => {
      el.textContent = timeLeft(el.dataset.deadline);
    });
  }, 30000);
}

function stopTicker() {
  clearInterval(tickerId);
}

let items = null;
let query = '';
let sortKey = 'ending';

function cardHtml(b) {
  const ended = new Date(b.deadline) < new Date() ? ' ended' : '';
  const pot = money(b.potUsd ?? b.rewardAmount ?? 0);
  const entryFee = b.entryFeeUsd === 0 ? 'Free' : money(b.entryFeeUsd);
  let skillsHtml = '';
  if (b.skills && b.skills.length) {
    skillsHtml = `<div class="chips">`;
    b.skills.slice(0, 4).forEach(skill => {
      skillsHtml += `<span class="chip">${esc(skill)}</span>`;
    });
    skillsHtml += `</div>`;
  }
  return `
    <li class="card${ended}">
      <h3><a href="#/bounty/${encodeURIComponent(b.slug)}">${esc(b.title)}</a></h3>
      <div class="meta-row">
        <span>${esc(b.category)}</span>
        ${b.sponsor ? `<span>by ${esc(b.sponsor.name)}</span>` : ''}
      </div>
      <p class="sum">${esc(b.summary)}</p>
      <div class="stats">
        <div class="stat">
          <strong>Pot:</strong>
          <span>${pot}</span>
        </div>
        <div class="stat">
          <strong>Entry fee:</strong>
          <span>${entryFee}</span>
        </div>
        <div class="stat">
          <strong>Entries:</strong>
          <span>${count(b.submissionCount)}</span>
        </div>
      </div>
      <div class="meta-row">
        <span>Time left:</span>
        <b data-deadline="${b.deadline}">${timeLeft(b.deadline)}</b>
      </div>
      ${skillsHtml}
    </li>`;
}

function boardListHtml() {
  if (!items) return '';
  const filtered = items.filter(b => {
    const searchText = `${b.title} ${b.category} ${b.skills ? b.skills.join(' ') : ''}`.toLowerCase();
    return searchText.includes(query.toLowerCase());
  });
  filtered.sort((a, b) => {
    if (sortKey === 'ending') {
      const aDate = new Date(a.deadline);
      const bDate = new Date(b.deadline);
      const aEnded = aDate < new Date();
      const bEnded = bDate < new Date();
      if (aEnded !== bEnded) return aEnded ? 1 : -1;
      return aDate - bDate;
    } else if (sortKey === 'pot') {
      const aPot = a.potUsd ?? a.rewardAmount ?? 0;
      const bPot = b.potUsd ?? b.rewardAmount ?? 0;
      return bPot - aPot;
    } else if (sortKey === 'entries') {
      return b.submissionCount - a.submissionCount;
    } else if (sortKey === 'new') {
      return new Date(b.publishedAt) - new Date(a.publishedAt);
    }
    return 0;
  });
  if (filtered.length === 0) {
    return `<p class="muted">No bounties match your search.</p>`;
  }
  return `<ul class="grid">${filtered.map(cardHtml).join('')}</ul>`;
}

async function boardView() {
  const data = await getBounties();
  items = data.items;
  const livePot = items.reduce((sum, b) => sum + Number(b.potUsd ?? b.rewardAmount ?? 0), 0);
  const openCount = items.filter(b => new Date(b.deadline) >= new Date()).length;
  return `
    <h1>Live bounty board</h1>
    <div class="meta-row">
      <span>${openCount} open bounties</span>
      <span>${money(livePot)}</span>
    </div>
    <div class="toolbar">
      <input id="q" type="search" placeholder="Filter by title, category or skill…" value="${esc(query)}">
      <select id="sort">
        <option value="ending" ${sortKey === 'ending' ? 'selected' : ''}>Ending soon</option>
        <option value="pot" ${sortKey === 'pot' ? 'selected' : ''}>Biggest pot</option>
        <option value="entries" ${sortKey === 'entries' ? 'selected' : ''}>Most entries</option>
        <option value="new" ${sortKey === 'new' ? 'selected' : ''}>Newest</option>
      </select>
    </div>
    <div id="board-list">${boardListHtml()}</div>
  `;
}

function wireBoard() {
  const q = document.getElementById('q');
  if (q) {
    q.addEventListener('input', e => {
      query = e.target.value;
      document.getElementById('board-list').innerHTML = boardListHtml();
    });
  }
  const s = document.getElementById('sort');
  if (s) {
    s.addEventListener('change', e => {
      sortKey = e.target.value;
      document.getElementById('board-list').innerHTML = boardListHtml();
    });
  }
}

async function render() {
  try {
    window.__shotReady = false;
    stopTicker();
    const hash = location.hash || '#/';
    let html;
    let title;
    let routeMatch;
    if (routeMatch = hash.match(/^#\/bounty\/([^/]+)\/leaderboard$/)) {
      const slug = decodeURIComponent(routeMatch[1]);
      const { leaderboardView } = await import('./views/leaderboard.js');
      html = await leaderboardView(slug);
      title = 'Leaderboard · Verdant Board';
    } else if (routeMatch = hash.match(/^#\/bounty\/([^/]+)$/)) {
      const slug = decodeURIComponent(routeMatch[1]);
      const { bountyView } = await import('./views/bounty.js');
      html = await bountyView(slug);
      title = 'Bounty · Verdant Board';
    } else if (routeMatch = hash.match(/^#\/u\/([^/]+)$/)) {
      const handle = decodeURIComponent(routeMatch[1]);
      const { profileView } = await import('./views/profile.js');
      html = await profileView(handle);
      title = 'Profile · Verdant Board';
    } else if (hash === '' || hash === '#/' || hash === '#/') {
      html = await boardView();
      title = 'Verdant Board — make.fun bounties';
    } else {
      html = `
        <div class="panel">
          <p class="muted">Not found</p>
          <a href="#/" class="btn">Back to board</a>
        </div>
      `;
      title = 'Not found · Verdant Board';
    }
    document.title = title;
    app.innerHTML = html;
    if (hash === '' || hash === '#/' || hash === '#/') {
      wireBoard();
    }
    window.scrollTo(0, 0);
    startTicker();
    window.__shotReady = true;
  } catch (e) {
    window.__shotReady = true;
    app.innerHTML = `
      <div class="error">
        <p>${esc(String(e))}</p>
        <button id="retry" class="btn">Retry</button>
      </div>
    `;
    document.getElementById('retry')?.addEventListener('click', render);
    document.title = 'Error · Verdant Board';
  }
}

window.addEventListener('hashchange', render);
render();
