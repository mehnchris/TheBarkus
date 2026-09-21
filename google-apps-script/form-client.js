const form = document.querySelector('#rsvp-form');
const status = document.querySelector('#form-status');
const button = form.querySelector('button[type=submit]');
let requestId = crypto.randomUUID();
let pending = false;
form.addEventListener('change', () => {
  const declined = form.elements.attending.value === 'no';
  for (const [id,name] of [['plus-one-field','plusOne'],['song-field','song']]) {
    document.getElementById(id).hidden = declined;
    form.elements[name].disabled = declined;
  }
});
form.addEventListener('submit', event => {
  event.preventDefault();
  if (pending) return;
  if (!window.google?.script?.run) { status.textContent = 'This form must be opened through the wedding website. Please reload and try again.'; return; }
  pending = true; button.disabled = true;
  status.textContent = 'Saving your RSVP…';
  const payload = {...Object.fromEntries(new FormData(form)),requestId};
  const timeout = setTimeout(() => { status.textContent = 'Google is taking longer than usual. Please wait for confirmation. If you need to reload, check with the couple before sending another response.'; },20000);
  function finish() { clearTimeout(timeout); pending=false; button.disabled=false; }
  google.script.run.withSuccessHandler(result => {
    finish();
    if (!result || result.ok !== true) { status.textContent = result?.message || 'We couldn’t confirm your RSVP. Please try again.'; return; }
    status.textContent = result.message;
    form.reset(); form.dispatchEvent(new Event('change')); requestId=crypto.randomUUID();
  }).withFailureHandler(() => {
    finish(); status.textContent = 'We couldn’t confirm your RSVP. Please retry; the same request will not be saved twice.';
  }).submitRsvp(payload);
});
