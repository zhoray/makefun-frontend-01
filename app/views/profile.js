import { getProfile, apiUrl } from '../api.js';
import { esc, money, shortDate, count } from '../format.js';

export async function profileView(handle) {
  const profile = await getProfile(handle);

  const crumbs = `<a href="/">Board</a> &gt; <a href="/@${handle}">@${esc(handle)}</a>`;

  let avatarHTML = '';
  if (profile.image || profile.avatar) {
    const src = profile.image || profile.avatar;
    avatarHTML = `<img class="avatar lg" crossorigin="anonymous" alt="" src="${apiUrl(src)}">`;
  }

  let headerHTML = '';
  if (avatarHTML) {
    headerHTML += avatarHTML;
  }
  headerHTML += `<h1>${esc(profile.display_name || handle)}</h1>`;
  headerHTML += `<p class="muted">@${esc(handle)} · joined ${shortDate(profile.joined_at)}</p>`;
  if (profile.bio) {
    headerHTML += `<p>${esc(profile.bio)}</p>`;
  }

  let statsHTML = `
    <div class="stats">
      <div class="stat"><strong>${count(profile.record.competitions_entered)}</strong> Entered</div>
      <div class="stat"><strong>${count(profile.record.competitions_placed)}</strong> Placed</div>
      <div class="stat"><strong>${count(profile.record.competitions_won)}</strong> Won</div>
      <div class="stat"><strong>${money(profile.record.prize_usd)}</strong> Prize</div>
    </div>
  `;

  let linksHTML = '';
  if (profile.github_login) {
    linksHTML += `<a href="https://github.com/${esc(profile.github_login)}">GitHub @${esc(profile.github_login)}</a> · `;
  }
  if (profile.discord) {
    linksHTML += `<a href="${esc(profile.discord.url)}">Discord ${esc(profile.discord.username)}</a> · `;
  }
  if (profile.x) {
    linksHTML += `<a href="${esc(profile.x.url)}">X @${esc(profile.x.username)}</a> · `;
  }
  if (linksHTML) {
    linksHTML = linksHTML.slice(0, -3);
  }

  let entriesHTML = '';
  if (!profile.solutions || profile.solutions.length === 0) {
    entriesHTML = `<p class="muted">No entries yet.</p>`;
  } else {
    let tableRows = '';
    for (const sol of profile.solutions) {
      const bountyLink = `<a href="#/bounty/${esc(sol.competition.slug)}">${esc(sol.competition.title)}</a>`;
      const place = sol.placement !== null ? `#${sol.placement}` : '—';
      const prize = sol.prize_usd !== null ? money(sol.prize_usd) : '—';
      tableRows += `<tr><td>${bountyLink}</td><td>${esc(sol.title)}</td><td>${place}</td><td>${prize}</td></tr>`;
    }
    entriesHTML = `<table class="tbl">
      <thead><tr><th>Bounty</th><th>Entry</th><th>Place</th><th>Prize</th></tr></thead>
      <tbody>${tableRows}</tbody>
    </table>`;
  }

  return `
    ${crumbs}
    <div class="panel">
      ${avatarHTML}
      ${headerHTML}
      ${statsHTML}
      ${linksHTML ? `<p class="links">${linksHTML}</p>` : ''}
    </div>
    <h2>Entries</h2>
    ${entriesHTML}
  `.trim();
}
