import { getLeaderboard, apiUrl } from '../api.js';
import { esc, rate, shortDate, count } from '../format.js';

const PAGE = 50;
let allEntries = [];
let shown = 0;

function rowHtml(e) {
  const rank = e.prize_rank ?? e.rank;
  const link = `<a href="#/u/${encodeURIComponent(e.handle)}">@${esc(e.handle)}</a>`;
  const entrant = e.image
    ? `<img class="avatar sm" crossorigin="anonymous" alt="" src="${esc(apiUrl(e.image))}"> ${link}`
    : link;
  const entry = esc(e.title);
  const winRate = (e.values && e.values.judge != null) ? rate(e.values.judge) : '—';
  const interval = (e.interval && e.interval.low != null) ? `${rate(e.interval.low)} – ${rate(e.interval.high)}` : '—';
  const size = (e.values && e.values.bytes != null) ? Math.round(e.values.bytes / 1024) + ' KB' : '—';
  const received = shortDate(e.received_at);
  const rankCell = `<td class="num">${rank}</td>`;
  const entrantCell = `<td>${entrant}</td>`;
  const entryCell = `<td>${entry}</td>`;
  const winRateCell = `<td class="num">${winRate}</td>`;
  const intervalCell = `<td class="num">${interval}</td>`;
  const sizeCell = `<td class="num">${size}</td>`;
  const receivedCell = `<td>${received}</td>`;
  return `<tr>${rankCell}${entrantCell}${entryCell}${winRateCell}${intervalCell}${sizeCell}${receivedCell}</tr>`;
}

document.addEventListener('click', (e) => {
  const btn = e.target.closest('[data-lb-more]');
  if (btn && document.getElementById('lb-body')) {
    const rows = allEntries.slice(shown, shown + PAGE);
    const tbody = document.getElementById('lb-body');
    tbody.insertAdjacentHTML('beforeend', rows.map(rowHtml).join(''));
    shown += PAGE;
    const countEl = document.getElementById('lb-count');
    if (countEl) {
      countEl.textContent = `Showing ${shown} of ${count(allEntries.length)} entries`;
    }
    if (shown >= allEntries.length) {
      btn.remove();
    }
  }
});

export async function leaderboardView(slug) {
  const lb = await getLeaderboard(slug);
  allEntries = lb.entries || [];
  shown = Math.min(PAGE, allEntries.length);
  const handle = encodeURIComponent(slug);
  const crumbs = `<p class="crumbs"><a href="#/">Board</a> / <a href="#/bounty/${handle}">${esc(lb.competition.title)}</a> / <span>Leaderboard</span></p>`;
  const title = esc(lb.competition.title);
  const phaseTitle = lb.phase ? lb.phase.title : 'Results';
  const muted = `${title} · ${phaseTitle} · win rates are the judge's, with the 90% interval`;
  if (allEntries.length === 0) {
    return `<div class="panel">No entries yet.</div>`;
  } else {
    const tbodyHtml = allEntries.slice(0, shown).map(rowHtml).join('');
    const body = `<tbody id="lb-body">${tbodyHtml}</tbody>`;
    let pager = '';
    if (shown < allEntries.length) {
      pager = `<div class="pager"><button class="btn" data-lb-more>Show more entries</button></div>`;
    }
    const countHtml = `<p id="lb-count" class="muted">Showing ${shown} of ${count(allEntries.length)} entries</p>`;
    const table = `<table class="tbl"><thead><tr><th class="num">#</th><th>Entrant</th><th>Entry</th><th class="num">Win rate</th><th class="num">90% interval</th><th class="num">Size</th><th>Received</th></tr></thead>${body}</table>`;
    return `${crumbs}<h1>Leaderboard</h1><p class="muted">${muted}</p>${countHtml}${table}${pager}`;
  }
}
