const toggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('#navigation');
toggle.addEventListener('click', () => { const open = toggle.getAttribute('aria-expanded') !== 'true'; toggle.setAttribute('aria-expanded', String(open)); nav.classList.toggle('open', open); });
nav.addEventListener('click', e => { if (e.target.closest('a')) { toggle.setAttribute('aria-expanded', 'false'); nav.classList.remove('open'); } });
document.addEventListener('keydown', e => { if (e.key === 'Escape' && nav.classList.contains('open')) { toggle.click(); toggle.focus(); } });
// Shared enhancements also run in the static GitHub Pages build.
const weddingTime = new Date('2027-04-23T17:00:00-05:00').getTime();
function updateCountdown() {
 const remaining = Math.max(0, weddingTime - Date.now());
 const values = {days: Math.floor(remaining / 86400000), hours: Math.floor(remaining / 3600000) % 24, minutes: Math.floor(remaining / 60000) % 60};
 for (const [unit, value] of Object.entries(values)) {
  const element = document.getElementById(`count-${unit}`);
  if (element) element.textContent = String(value).padStart(2, '0');
 }
}
updateCountdown();
setInterval(updateCountdown, 60000);
if ('IntersectionObserver' in window) {
 const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
 const reveal = new IntersectionObserver(entries => {
  for (const entry of entries) if (entry.isIntersecting) {
   if (!motion.matches) entry.target.classList.add('arriving');
   reveal.unobserve(entry.target);
  }
 }, {threshold: 0.12});
 document.querySelectorAll('.intro, .timeline article, .inspiration-copy, .event, .venue, .travel-row').forEach(element => reveal.observe(element));
 const sections = new IntersectionObserver(entries => {
  for (const entry of entries) if (entry.isIntersecting) {
   nav.querySelectorAll('a').forEach(link => {
    if (link.hash === `#${entry.target.id}`) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
   });
  }
 }, {rootMargin: '-15% 0px -55% 0px', threshold: 0});
 document.querySelectorAll('main section[id]').forEach(section => sections.observe(section));
}
