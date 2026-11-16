import { esc, money, date, shortDate, timeLeft, count } from '../format.js';
import { getBounty } from '../api.js';

function renderDescription(text) {
  const blocks = (text ?? '').split(/\n\n+/);
  return blocks.map(block => {
    const trimmed = block.trim();
    if (trimmed.startsWith('## ')) {
      return `<h3>${esc(trimmed.slice(3))}</h3>`;
    } else if (trimmed.split('\n').every(line => line.trim() === '' || line.trim().startsWith('- '))) {
      const items = trimmed.split('\n').filter(line => line.trim().startsWith('- ')).map(line => `<li>${esc(line.trim().slice(2))}</li>`).join('');
      return `<ul>${items}</ul>`;
    } else {
      return `<p>${esc(trimmed).replace(/\n/g, '<br>')}</p>`;
    }
  }).join('');
}

export async function bountyView(slug) {
  const b = await getBounty(slug);
  const ended = new Date(b.deadline) < new Date();
  const pot = b.potUsd ?? b.rewardAmount;
  let rewardsHtml = '';
  if (b.rewardsNow && b.rewardsNow.length > 0) {
    const sorted = [...b.rewardsNow].sort((a, b) => a.place - b.place);
    rewardsHtml = `<tr><th>Place</th><th class="num">Prize now</th><th class="num">Base</th><th class="num">Fee share</th></tr>` +
      sorted.map(r => `<tr><td class="num">${r.place}</td><td class="num">${money(r.amountUsd)}</td><td class="num">${money(r.baseUsd)}</td><td class="num">${money(r.feeShareUsd)}</td></tr>`).join('');
  } else if (b.rewards) {
    const sorted = Object.entries(b.rewards).sort((a, b) => parseInt(a[0]) - parseInt(b[0]));
    rewardsHtml = `<tr><th>Place</th><th class="num">Prize</th></tr>` +
      sorted.map(([place, value]) => `<tr><td class="num">${place}</td><td class="num">${money(value)}</td></tr>`).join('');
  }
  let metaStatus = ended ? 'Ended' : 'Open';
  let html = `
    <p class="crumbs"><a href="#/">Board</a> / <a href="#/bounty/${esc(slug)}">${esc(b.title)}</a></p>
    <h1>${esc(b.title)}</h1>
    <div class="meta-row">${esc(b.category)}; by ${b.sponsor ? esc(b.sponsor.name) : ''}; ${metaStatus}</div>
  `;
  if (b.summary) {
    html += `<p>${esc(b.summary)}</p>`;
  }
  html += `
    <div class="panel">
      <div class="stats">
        <div class="stat">Live pot <span class="num">${money(pot)}</span></div>
        <div class="stat">Reward <span class="num">${money(b.rewardAmount)}</span></div>
        <div class="stat">Entry fee <span class="num">${b.entryFeeUsd ? money(b.entryFeeUsd) : 'Free'}</span></div>
        <div class="stat">Entries <span class="num">${b.submissionCount}</span></div>
        <div class="stat">Time left <span data-deadline="${b.deadline}">${timeLeft(b.deadline)}</span></div>
      </div>
    </div>
    <p><a class="btn" href="#/bounty/${esc(slug)}/leaderboard">View the leaderboard</a> <a href="https://make.fun/bounty/${esc(slug)}">Open on make.fun</a></p>
  `;
  if (b.skills && b.skills.length > 0) {
    html += `<div class="chips">${b.skills.map(s => `<span class="chip">${esc(s)}</span>`).join('')}</div>`;
  }
  html += `
    <h2>Rewards</h2>
    <p class="muted">These are the amounts if the pot stopped growing now (live pot ${money(pot)})</p>
    <table class="tbl">${rewardsHtml}</table>
    <h2>Key dates</h2>
    <dl class="kv">
      <dt>Published</dt><dd>${shortDate(b.publishedAt)}</dd>
      <dt>Deadline</dt><dd>${date(b.deadline)}</dd>
      <dt>Status</dt><dd>${metaStatus}</dd>
    </dl>
    <h2>About this bounty</h2>
    <div class="desc">${renderDescription(b.description)}</div>
  `;
  return html;
}
