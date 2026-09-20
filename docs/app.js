const toggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('#navigation');
toggle.addEventListener('click', () => { const open = toggle.getAttribute('aria-expanded') !== 'true'; toggle.setAttribute('aria-expanded', String(open)); nav.classList.toggle('open', open); });
nav.addEventListener('click', e => { if (e.target.closest('a')) { toggle.setAttribute('aria-expanded', 'false'); nav.classList.remove('open'); } });
document.addEventListener('keydown', e => { if (e.key === 'Escape' && nav.classList.contains('open')) { toggle.click(); toggle.focus(); } });
const days = Math.ceil((new Date('2027-04-23T17:00:00-05:00') - new Date()) / 86400000);
document.querySelector('#countdown').textContent = days > 0 ? `${days} DAYS UNTIL FOREVER` : 'APRIL 23, 2027 · ALWAYS & FOREVER';
