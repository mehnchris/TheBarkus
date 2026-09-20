const toggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('#navigation');
toggle.addEventListener('click', () => { const open = toggle.getAttribute('aria-expanded') !== 'true'; toggle.setAttribute('aria-expanded', String(open)); nav.classList.toggle('open', open); });
nav.addEventListener('click', e => { if (e.target.closest('a')) { toggle.setAttribute('aria-expanded', 'false'); nav.classList.remove('open'); } });
document.addEventListener('keydown', e => { if (e.key === 'Escape' && nav.classList.contains('open')) { toggle.click(); toggle.focus(); } });
const days = Math.ceil((new Date('2027-04-23T17:00:00-05:00') - new Date()) / 86400000);
document.querySelector('#countdown').textContent = days > 0 ? `${days} DAYS UNTIL FOREVER` : 'APRIL 23, 2027 · ALWAYS & FOREVER';
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
