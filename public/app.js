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
 document.querySelectorAll('.intro, .timeline article, .gallery-copy, .event, .venue, .travel-row').forEach(element => reveal.observe(element));
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
// Photo links remain usable when JavaScript is unavailable.
const gallery = document.querySelector('.gallery-viewer');
if (gallery) {
 const photos = [...gallery.querySelectorAll('[data-photo]')];
 const image = document.getElementById('gallery-image');
 const play = document.getElementById('photo-play');
 const count = document.getElementById('photo-count');
 const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
 let current = 0;
 let timer;
 function stopSlideshow() {
  clearInterval(timer); timer = undefined;
  play.textContent = 'Play slideshow'; play.setAttribute('aria-pressed', 'false');
  count.setAttribute('aria-live', 'polite');
 }
 function showPhoto(index) {
  current = (index + photos.length) % photos.length;
  const link = photos[current];
  image.src = link.href;
  image.alt = link.getAttribute('aria-label').replace(/^View photo \d+: /, '');
  document.getElementById('photo-full').href = link.href;
  document.getElementById('photo-caption').textContent = `A little glimpse of us · ${String(current + 1).padStart(2, '0')} / 07`;
  count.textContent = `Photo ${current + 1} of ${photos.length}`;
  photos.forEach((photo, i) => { if (i === current) photo.setAttribute('aria-current', 'true'); else photo.removeAttribute('aria-current'); });
 }
 gallery.querySelector('.gallery-controls').hidden = false;
 photos.forEach((photo, i) => photo.addEventListener('click', event => { if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return; event.preventDefault(); stopSlideshow(); showPhoto(i); }));
 document.getElementById('photo-prev').addEventListener('click', () => { stopSlideshow(); showPhoto(current - 1); });
 document.getElementById('photo-next').addEventListener('click', () => { stopSlideshow(); showPhoto(current + 1); });
 gallery.addEventListener('keydown', event => {
  if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') { event.preventDefault(); stopSlideshow(); showPhoto(current + (event.key === 'ArrowLeft' ? -1 : 1)); }
 });
 play.addEventListener('click', () => {
  if (timer) return stopSlideshow();
  play.textContent = 'Pause slideshow'; play.setAttribute('aria-pressed', 'true');
  count.setAttribute('aria-live', 'off');
  timer = setInterval(() => showPhoto(current + 1), 5000);
 });
 document.addEventListener('visibilitychange', () => { if (document.hidden) stopSlideshow(); });
 motion.addEventListener('change', stopSlideshow);
 gallery.addEventListener('focusin', event => { if (event.target !== play) stopSlideshow(); });
}

const form = document.querySelector('#rsvp-form');
form.addEventListener('change', () => { const declined = form.elements.attending.value === 'no'; for (const [id, name] of [['plus-one-field', 'plusOne'], ['song-field', 'song']]) { document.getElementById(id).hidden = declined; form.elements[name].disabled = declined; } });
form.addEventListener('submit', async e => {
 e.preventDefault();
 const button = form.querySelector('button[type=submit]');
 const status = document.querySelector('#form-status');
 button.disabled = true; status.textContent = 'Sending your response…';
 try {
  const response = await fetch('/api/rsvp', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(Object.fromEntries(new FormData(form)))});
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || 'We couldn’t save your response. Please try again.');
  status.textContent = result.message;
  form.reset(); form.dispatchEvent(new Event('change'));
 } catch (error) { status.textContent = error instanceof TypeError ? 'We couldn’t reach the server. Your response has not been saved. Please try again.' : error.message; }
 finally { button.disabled = false; }
});
