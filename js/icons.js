// js/icons.js : inline SVG line-icon sprite (Lucide-like, stroke 1.75), reused
// and extended from the approved design gallery
// (שופיפי/design-galleries/finance-course-directions.html, direction 1).
// injectIconSprite() must run once, early, before any icon() call renders.

export const ICON_SPRITE_HTML = `
<svg width="0" height="0" style="position:absolute" aria-hidden="true">
  <symbol id="i-search" viewBox="0 0 24 24"><circle cx="11" cy="11" r="7.5"/><path d="m20.5 20.5-4.2-4.2"/></symbol>
  <symbol id="i-home" viewBox="0 0 24 24"><path d="M3.5 10.5 12 3.5l8.5 7V20a1 1 0 0 1-1 1H15v-6H9v6H4.5a1 1 0 0 1-1-1z"/></symbol>
  <symbol id="i-right" viewBox="0 0 24 24"><path d="m9 18 6-6-6-6"/></symbol>
  <symbol id="i-left" viewBox="0 0 24 24"><path d="m15 18-6-6 6-6"/></symbol>
  <symbol id="i-menu" viewBox="0 0 24 24"><path d="M4 6h16M4 12h16M4 18h16"/></symbol>
  <symbol id="i-check" viewBox="0 0 24 24"><path d="m5 12.5 4.5 4.5L19 7.5"/></symbol>
  <symbol id="i-wallet" viewBox="0 0 24 24"><path d="M19 7V5a1 1 0 0 0-1-1H6a2 2 0 0 0 0 4h13a1 1 0 0 1 1 1v3.5"/><path d="M4 6v12a2 2 0 0 0 2 2h13a1 1 0 0 0 1-1v-3.5"/><path d="M21 12h-4a2 2 0 0 0 0 4h4z"/></symbol>
  <symbol id="i-bank" viewBox="0 0 24 24"><path d="M3 21h18M6 17.5V11M10 17.5V11M14 17.5V11M18 17.5V11M12 3l8.5 5h-17z"/></symbol>
  <symbol id="i-work" viewBox="0 0 24 24"><rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8.5 7V5.5A1.5 1.5 0 0 1 10 4h4a1.5 1.5 0 0 1 1.5 1.5V7M3 13h18"/></symbol>
  <symbol id="i-store" viewBox="0 0 24 24"><path d="M4 9.5 5.5 4h13L20 9.5M4 9.5h16M4 9.5a2.7 2.7 0 0 0 5.3 0 2.7 2.7 0 0 0 5.4 0 2.7 2.7 0 0 0 5.3 0M5.5 12.5V20h13v-7.5M10 20v-4h4v4"/></symbol>
  <symbol id="i-doc" viewBox="0 0 24 24"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5M9 13h6M9 17h6"/></symbol>
  <symbol id="i-shield" viewBox="0 0 24 24"><path d="M12 3.5 19 6v5.5c0 4.5-3 7.8-7 9-4-1.2-7-4.5-7-9V6z"/><path d="m9 12 2 2 4-4"/></symbol>
  <symbol id="i-trend" viewBox="0 0 24 24"><path d="m3 17 6-6 4 4 8-8"/><path d="M15 7h6v6"/></symbol>
  <symbol id="i-grid" viewBox="0 0 24 24"><rect x="3.5" y="3.5" width="7" height="8" rx="1.5"/><rect x="13.5" y="3.5" width="7" height="5" rx="1.5"/><rect x="13.5" y="11.5" width="7" height="9" rx="1.5"/><rect x="3.5" y="14.5" width="7" height="6" rx="1.5"/></symbol>
  <symbol id="i-scale" viewBox="0 0 24 24"><path d="M12 4v16M7 20h10M4.5 7.5h15M12 4.5l-7.5 3M12 4.5l7.5 3"/><path d="m4.5 7.5-2.5 6a2.8 2.8 0 0 0 5 0zM19.5 7.5l-2.5 6a2.8 2.8 0 0 0 5 0z"/></symbol>
  <symbol id="i-bulb" viewBox="0 0 24 24"><path d="M9.5 18h5M10.5 21h3M12 3a6 6 0 0 0-3.5 10.9V16h7v-2.1A6 6 0 0 0 12 3z"/></symbol>
  <symbol id="i-okc" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="m8.5 12.2 2.3 2.3 4.7-4.8"/></symbol>
  <symbol id="i-pro" viewBox="0 0 24 24"><circle cx="9.5" cy="8" r="3.5"/><path d="M3 20v-1.5A4.5 4.5 0 0 1 7.5 14h4a4.5 4.5 0 0 1 4.5 4.5V20"/><path d="m16 10.5 2 2 3.5-3.5"/></symbol>
  <symbol id="i-book" viewBox="0 0 24 24"><path d="M3.5 5.5A1.5 1.5 0 0 1 5 4h5a2 2 0 0 1 2 2v14a1.5 1.5 0 0 0-1.5-1.5h-7zM20.5 5.5A1.5 1.5 0 0 0 19 4h-5a2 2 0 0 0-2 2v14a1.5 1.5 0 0 1 1.5-1.5h7z"/></symbol>
  <symbol id="i-link" viewBox="0 0 24 24"><path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/></symbol>
  <symbol id="i-chart" viewBox="0 0 24 24"><path d="M4 20V10M10 20V4M16 20v-7M21 20H3"/></symbol>
  <symbol id="i-x" viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></symbol>
  <symbol id="i-play" viewBox="0 0 24 24"><path d="M7 5.5v13l12-6.5z"/></symbol>
  <symbol id="i-external" viewBox="0 0 24 24"><path d="M14 4h6v6M20 4 10.5 13.5M8 5H6a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2v-2"/></symbol>
  <symbol id="i-cloud" viewBox="0 0 24 24"><path d="M7 18a4.5 4.5 0 0 1-.4-8.98A5.5 5.5 0 0 1 17.2 8.1 4 4 0 0 1 17 16H7z"/></symbol>
  <symbol id="i-cloud-off" viewBox="0 0 24 24"><path d="M4 4l16 16M7.2 7.2A4.5 4.5 0 0 0 6.6 16H15M17.9 13.9A4 4 0 0 0 17.2 8.1 5.5 5.5 0 0 0 8.7 5.9"/></symbol>
  <symbol id="i-chevron-down" viewBox="0 0 24 24"><path d="m6 9 6 6 6-6"/></symbol>
  <symbol id="i-wifi-off" viewBox="0 0 24 24"><path d="M3 3l18 18M8.5 12a7 7 0 0 1 4-1.5M5 8.5a11 11 0 0 1 3.3-2M12.5 15.5a2.5 2.5 0 0 1 2.6.6M16 12a7 7 0 0 1 2.5.9M19 8.5a11 11 0 0 1 2 1.4M12 19.5v.01"/></symbol>
  <symbol id="i-mail" viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m4 7 8 6 8-6"/></symbol>
</svg>`;

export function injectIconSprite() {
  if (document.getElementById('icon-sprite')) return;
  const div = document.createElement('div');
  div.id = 'icon-sprite';
  div.innerHTML = ICON_SPRITE_HTML;
  document.body.insertBefore(div.firstElementChild, document.body.firstChild);
}

export function icon(name, cls = '') {
  return `<svg class="i ${cls}"><use href="#i-${name}"/></svg>`;
}
