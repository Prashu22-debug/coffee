const $ = (s) => document.querySelector(s);

const gearCatalog = {
  grinder: {
    '1Zpresso': ['K-Ultra', 'ZP6 Special', 'J-Ultra', 'Q Air'],
    Comandante: ['C40 MK4', 'C60 Baracuda'],
    Timemore: ['Chestnut X', 'Chestnut S3', 'C3 ESP Pro'],
    Fellow: ['Opus', 'Ode Gen 2'],
    Kingrinder: ['K6', 'K2'],
    Kinu: ['M47 Classic', 'M47 Simplicity']
  },
  dripper: {
    Hario: ['V60 02', 'Mugen', 'Neo'],
    Timemore: ['Crystal Eye', 'B75'],
    'MHW-3BOMBER': ['Meteor Dripper', 'Cyclone Dripper'],
    Orea: ['V4', 'V3 MK2'],
    Kalita: ['Wave 185', 'Wave 155'],
    Origami: ['Dripper M', 'Dripper S'],
    April: ['Brewer'],
    Fellow: ['Stagg [X]']
  }
};

const renderModels = (type) => {
  const brand = $(`#${type}Brand`).value;
  const model = $(`#${type}`);
  model.innerHTML = gearCatalog[type][brand].map((name) => `<option value="${name}">${brand} ${name}</option>`).join('');
  updateShare();
};

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
$('#grinderBrand').addEventListener('change', () => renderModels('grinder'));
$('#dripperBrand').addEventListener('change', () => renderModels('dripper'));
$('#grinder').addEventListener('change', updateShare);
$('#dripper').addEventListener('change', updateShare);
renderModels('grinder');
renderModels('dripper');

let pourCount = 3;
const profileHints = {
  3: 'Balanced V60 · 45 sec bloom, then two steady pours.',
  4: 'Clarity-focused · 40 sec bloom, then three gentle pours.',
  5: '4:6 inspired · five equal pulses to tune sweetness and body.'
};
const formatSeconds = (seconds) => `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
const renderPourPlan = () => {
  const [coffee, water] = [...document.querySelectorAll('.recipe-inputs input')].map((el) => Number(el.value));
  const bloom = Math.min(Math.round(coffee * 2), Math.round(water * 0.25));
  const remainingPours = pourCount - 1;
  const remainder = Math.max(0, water - bloom);
  const base = Math.floor(remainder / remainingPours);
  const durations = pourCount === 5 ? [40, 70, 100, 130, 160] : pourCount === 4 ? [40, 75, 110, 145] : [45, 95, 145];
  const names = ['Bloom', ...Array.from({ length: remainingPours }, (_, index) => index === remainingPours - 1 ? 'Finish' : `Pour ${index + 1}`)];
  $('#pourPlan').innerHTML = names.map((name, index) => {
    const dose = index === 0 ? bloom : base + (index === pourCount - 1 ? remainder - base * remainingPours : 0);
    const start = index === 0 ? 0 : durations[index - 1];
    const end = durations[index];
    return `<div class="pour-row"><span>${String(index + 1).padStart(2, '0')}</span><b>${name}</b><label><input type="number" value="${dose}" min="0" aria-label="${name} water" />g</label><label><input type="text" value="${formatSeconds(start)}" aria-label="${name} start time" />–<input type="text" value="${formatSeconds(end)}" aria-label="${name} end time" /></label></div>`;
  }).join('');
  $('#recipeHint').textContent = profileHints[pourCount];
};

$('#pourOptions').addEventListener('click', (event) => {
  const option = event.target.closest('button');
  if (!option) return;
  pourCount = Number(option.dataset.pours);
  document.querySelectorAll('#pourOptions button').forEach((item) => item.classList.toggle('selected', item === option));
  renderPourPlan();
});
$('#suggestButton').addEventListener('click', renderPourPlan);

document.querySelectorAll('.recipe-inputs input').forEach((input) => input.addEventListener('input', () => {
  const values = [...document.querySelectorAll('.recipe-inputs input')].map((el) => Number(el.value));
  if (values[0] && values[1]) $('#ratioOutput').textContent = (values[1] / values[0]).toFixed(1);
  renderPourPlan();
}));
renderPourPlan();

const flavorPalettes = {
  Peach: ['#dd7045', '#f4bd70'],
  Jasmine: ['#7661a6', '#c7acd8'],
  'Black tea': ['#5b422f', '#bd9164'],
  Berry: ['#a84d67', '#e59ba3'],
  Citrus: ['#db9228', '#f4d36c'],
  Chocolate: ['#51372f', '#b27750'],
  Nutty: ['#9b6a3d', '#d6ad6b']
};
const setCardPalette = (flavor) => {
  const [base, ring] = flavorPalettes[flavor] || flavorPalettes.Peach;
  $('#shareArea').style.setProperty('--card-color', base);
  $('#shareArea').style.setProperty('--card-ring', ring);
  $('#flavorProfile').querySelectorAll('button').forEach((item) => item.classList.toggle('active', item.dataset.flavor === flavor));
};
$('#flavorProfile').addEventListener('click', (event) => {
  const flavor = event.target.closest('button')?.dataset.flavor;
  if (flavor) setCardPalette(flavor);
});
setCardPalette('Peach');

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

let shareFormat = 'square';
document.querySelectorAll('.format-option').forEach((option) => option.addEventListener('click', () => {
  shareFormat = option.dataset.format;
  document.querySelectorAll('.format-option').forEach((item) => item.classList.toggle('selected', item === option));
  $('#shareButton').innerHTML = `Download ${shareFormat === 'square' ? '1:1' : '9:16'} card <span>↗</span>`;
  $('#shareArea').classList.toggle('story-format', shareFormat === 'story');
}));

$('#shareButton').addEventListener('click', async () => {
  const button = $('#shareButton');
  button.innerHTML = 'Card ready <span>✓</span>';
  const method = $('#shareMethod').textContent;
  const grinder = $('#shareGrinder').textContent;
  const score = '★'.repeat(rating || 5);
  const text = `My ${method} · Halo Beriti\n${grinder}\n${score}\nLogged with grounds`;
  const vertical = shareFormat === 'story';
  const width = vertical ? 1080 : 1080;
  const height = vertical ? 1920 : 1080;
  const y = vertical ? { label: 520, title: 675, gear: 790, score: 1540, notes: 1620 } : { label: 390, title: 510, gear: 595, score: 875, notes: 945 };
  const baseColor = getComputedStyle($('#shareArea')).getPropertyValue('--card-color').trim() || '#d66a3c';
  const ringColor = getComputedStyle($('#shareArea')).getPropertyValue('--card-ring').trim() || '#f7b571';
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><rect width="${width}" height="${height}" fill="${baseColor}"/><circle cx="${width + 120}" cy="${height - 80}" r="380" fill="none" stroke="${ringColor}" stroke-opacity=".52" stroke-width="2"/><circle cx="${width + 120}" cy="${height - 80}" r="300" fill="none" stroke="${ringColor}" stroke-opacity=".24" stroke-width="70"/><text x="72" y="92" fill="#fff3df" font-family="Helvetica,Arial,sans-serif" font-size="21" letter-spacing="4">GROUNDS / BREW LOG</text><text x="72" y="${y.label}" fill="#fff3df" font-family="Helvetica,Arial,sans-serif" font-size="20" letter-spacing="4">ETHIOPIA · HALO BERITI</text><text x="72" y="${y.title}" fill="#fff3df" font-family="Georgia,serif" font-size="${vertical ? 92 : 86}">${method}</text><text x="72" y="${y.gear}" fill="#fff3df" font-family="Helvetica,Arial,sans-serif" font-size="22">${grinder}</text><text x="72" y="${y.score}" fill="#ffe19b" font-family="Georgia,serif" font-size="43">${score}</text><text x="72" y="${y.notes}" fill="#fff3df" font-family="Helvetica,Arial,sans-serif" font-size="18" letter-spacing="2">PEACH · JASMINE · BLACK TEA</text></svg>`;
  const download = document.createElement('a');
  download.href = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' }));
  download.download = `grounds-halo-beriti-${shareFormat === 'story' ? '9x16-story' : '1x1-post'}.svg`;
  download.click();
  URL.revokeObjectURL(download.href);
  try { await navigator.clipboard.writeText(text); button.title = 'Share caption copied'; } catch { button.title = 'Your card is ready to share'; }
});
