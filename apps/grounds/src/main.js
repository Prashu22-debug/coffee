const $ = (s) => document.querySelector(s);

const updateShare = () => {
  $('#shareMethod').textContent = document.querySelector('.method.selected').dataset.method;
  $('#shareGrinder').textContent = `${$('#grinder').value} · ${$('#microns').value}μm`;
};

$('#methodList').addEventListener('click', (event) => {
  const choice = event.target.closest('.method');
  if (!choice) return;
  document.querySelectorAll('.method').forEach((item) => item.classList.remove('selected'));
  choice.classList.add('selected');
  updateShare();
});

$('#microns').addEventListener('input', (event) => {
  $('#micronValue').textContent = `${event.target.value} μm`;
  updateShare();
});
$('#grinder').addEventListener('change', updateShare);

document.querySelectorAll('.recipe-inputs input').forEach((input) => input.addEventListener('input', () => {
  const values = [...document.querySelectorAll('.recipe-inputs input')].map((el) => Number(el.value));
  if (values[0] && values[1]) $('#ratioOutput').textContent = (values[1] / values[0]).toFixed(1);
}));

let rating = 0;
$('#stars').addEventListener('click', (event) => {
  const button = event.target.closest('button');
  if (!button) return;
  rating = Number(button.dataset.rate);
  document.querySelectorAll('.stars button').forEach((star, index) => star.classList.toggle('lit', index < rating));
  $('#ratingText').textContent = rating === 5 ? 'Exceptional' : ['', 'Not for me', 'Okay', 'Good', 'Great', 'Exceptional'][rating];
  $('#shareScore').textContent = '★'.repeat(rating) + '☆'.repeat(5 - rating);
});

$('#saveButton').addEventListener('click', () => {
  $('#saveMessage').textContent = 'Brew saved to your journal.';
  $('#saveButton').innerHTML = 'Saved <span>✓</span>';
});

const modal = $('#scanModal');
$('#scanButton').addEventListener('click', () => { modal.classList.add('open'); modal.setAttribute('aria-hidden', 'false'); });
$('#closeModal').addEventListener('click', () => { modal.classList.remove('open'); modal.setAttribute('aria-hidden', 'true'); });
$('#sampleScan').addEventListener('click', () => {
  modal.classList.remove('open');
  $('#saveMessage').textContent = 'Packet scanned — coffee details updated.';
  document.querySelector('.coffee-info h2').textContent = 'Kayon Mountain';
});

$('#timerButton').addEventListener('click', (event) => {
  const button = event.currentTarget;
  if (button.dataset.running) return;
  let seconds = 0; button.dataset.running = 'true'; button.innerHTML = '00:00 <span>●</span>';
  const timer = setInterval(() => { seconds += 1; button.innerHTML = `00:${String(seconds).padStart(2, '0')} <span>●</span>`; if (seconds === 99) clearInterval(timer); }, 1000);
});

$('#shareButton').addEventListener('click', async () => {
  const button = $('#shareButton');
  button.innerHTML = 'Card ready <span>✓</span>';
  const method = $('#shareMethod').textContent;
  const grinder = $('#shareGrinder').textContent;
  const score = '★'.repeat(rating || 5);
  const text = `My ${method} · Halo Beriti\n${grinder}\n${score}\nLogged with grounds`;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="720" viewBox="0 0 1200 720"><rect width="1200" height="720" fill="#d66a3c"/><circle cx="1160" cy="700" r="280" fill="none" stroke="#f7b571" stroke-opacity=".5" stroke-width="2"/><circle cx="1160" cy="700" r="220" fill="none" stroke="#f7b571" stroke-opacity=".3" stroke-width="50"/><text x="72" y="82" fill="#fff3df" font-family="monospace" font-size="23" letter-spacing="4">GROUNDS / BREW LOG</text><text x="72" y="270" fill="#fff3df" font-family="monospace" font-size="24" letter-spacing="4">ETHIOPIA · HALO BERITI</text><text x="72" y="365" fill="#fff3df" font-family="Georgia,serif" font-size="94">${method}</text><text x="72" y="435" fill="#fff3df" font-family="monospace" font-size="25">${grinder}</text><text x="72" y="640" fill="#ffe19b" font-family="Georgia,serif" font-size="43">${score}</text><text x="72" y="683" fill="#fff3df" font-family="monospace" font-size="21">PEACH · JASMINE · BLACK TEA</text></svg>`;
  const download = document.createElement('a');
  download.href = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' }));
  download.download = 'grounds-halo-beriti-brew-card.svg';
  download.click();
  URL.revokeObjectURL(download.href);
  try { await navigator.clipboard.writeText(text); button.title = 'Share caption copied'; } catch { button.title = 'Your card is ready to share'; }
});
