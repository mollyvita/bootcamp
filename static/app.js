const feedData = [
  {
    stamp: 'APR 01',
    index: '01',
    title: 'boot sequence established',
    summary: 'The repo opens with a Flask shell, a single rendered surface, and enough structure to ship a fast MVP without fighting the framework.',
    chips: ['flask', 'templates', 'api surface'],
    raw: [
      'app.py: Flask entrypoint + json endpoints',
      'templates/index.html: main shell',
      'static/style.css: visual system',
    ],
  },
  {
    stamp: 'APR 03',
    index: '02',
    title: 'operator theme locked in',
    summary: 'Monospace typography, hard edges, grid lines, and a deliberate amount of negative space turn the landing page into a terminal-adjacent control panel.',
    chips: ['mono type', 'high contrast', 'scanline'],
    raw: [
      'font stack: IBM Plex Mono + Inter',
      'overlay: grid + noise + scanline',
      'surface: dark glass panels',
    ],
  },
  {
    stamp: 'APR 06',
    index: '03',
    title: 'chronological feed introduced',
    summary: 'Instead of a generic list, the content is framed as a mission log so the page reads like progress rather than inventory.',
    chips: ['feed', 'timeline', 'status'],
    raw: [
      'hero supports APRIL 2026 story framing',
      'cards reveal raw metadata on hover',
      'motion uses staggered entry',
    ],
  },
  {
    stamp: 'APR 09',
    index: '04',
    title: 'stack and telemetry panels',
    summary: 'A side channel makes the repo feel inspectable: the stack is visible at a glance, while live repository stats keep the design grounded in actual project data.',
    chips: ['github api', 'live stats', 'telemetry'],
    raw: [
      'fetches stars, forks, issues, language',
      'keeps repo state visible',
      'direct github CTA stays on canvas',
    ],
  },
  {
    stamp: 'APR 12',
    index: '05',
    title: 'hover reveal channel opened',
    summary: 'Every card exposes the underlying raw data when you hover it, so the UI reads polished on first pass and technical on second pass.',
    chips: ['hover', 'raw data', 'inspection'],
    raw: [
      'feed cards include hidden source detail',
      'raw console mirrors hovered item',
      'motion stays subtle and reversible',
    ],
  },
  {
    stamp: 'APR 18',
    index: '06',
    title: 'deploy lane pointed at vercel',
    summary: 'The last step is a clean delivery path: push the design branch, let Vercel build it, and hand back a live URL without ceremony.',
    chips: ['design-v1', 'vercel', 'ship'],
    raw: [
      'target branch: design-v1',
      'production host: vercel',
      'cta routes to github repo',
    ],
  },
];

const stackData = [
  ['backend', 'flask api + jinja shell'],
  ['frontend', 'vanilla js renderer'],
  ['visual layer', 'css grid, glass, noise'],
  ['motion', 'character stagger + scroll react'],
  ['delivery', 'github branch + vercel deploy'],
];

async function loadRepoStats() {
  try {
    const response = await fetch('https://api.github.com/repos/mollyvita/bootcamp');
    if (!response.ok) throw new Error(`github api ${response.status}`);
    const repo = await response.json();

    setRepoValue('language', repo.language || 'n/a');
    setRepoValue('stars', formatNumber(repo.stargazers_count));
    setRepoValue('forks', formatNumber(repo.forks_count));
    setRepoValue('issues', formatNumber(repo.open_issues_count));
  } catch (error) {
    setRepoValue('language', 'css');
    setRepoValue('stars', '0');
    setRepoValue('forks', '0');
    setRepoValue('issues', '0');
  }
}

function setRepoValue(key, value) {
  const target = document.querySelector(`[data-repo="${key}"]`);
  if (target) target.textContent = value;
}

function formatNumber(value) {
  return new Intl.NumberFormat('en-US').format(value ?? 0);
}

function splitHeroTitle() {
  const title = document.querySelector('[data-split]');
  if (!title) return;

  const text = title.textContent.trim();
  title.textContent = '';

  [...text].forEach((char, index) => {
    const span = document.createElement('span');
    span.className = 'char';
    span.style.setProperty('--i', index);
    span.innerHTML = char === ' ' ? '&nbsp;' : char;
    title.appendChild(span);
  });
}

function renderFeed() {
  const list = document.getElementById('feed-list');
  if (!list) return;

  list.innerHTML = feedData.map((item, index) => `
    <article class="feed-card" data-feed-card="${index}">
      <div class="feed-top">
        <span class="feed-index">${item.index}</span>
        <span>${item.stamp}</span>
      </div>
      <h3 class="feed-title">${item.title}</h3>
      <p class="feed-summary">${item.summary}</p>
      <div class="feed-meta">
        ${item.chips.map((chip) => `<span class="chip">${chip}</span>`).join('')}
      </div>
      <div class="feed-raw">${item.raw.map((line) => `• ${line}`).join('<br>')}</div>
    </article>
  `).join('');

  const feedCount = document.querySelector('[data-metric="feed-count"]');
  if (feedCount) feedCount.textContent = String(feedData.length).padStart(2, '0');

  const cards = list.querySelectorAll('.feed-card');
  const consoleBox = document.getElementById('raw-console');

  cards.forEach((card, index) => {
    const item = feedData[index];
    card.addEventListener('mouseenter', () => {
      cards.forEach((el) => el.classList.remove('active'));
      card.classList.add('active');
      if (consoleBox) {
        consoleBox.textContent = [
          `slot: ${item.index}`,
          `stamp: ${item.stamp}`,
          `title: ${item.title}`,
          '',
          ...item.raw,
        ].join('\n');
      }
    });

    card.addEventListener('mouseleave', () => {
      card.classList.remove('active');
    });
  });

  if (consoleBox) {
    consoleBox.textContent = 'hover a feed item to inspect the underlying data';
  }
}

function renderStack() {
  const list = document.getElementById('stack-list');
  if (!list) return;

  list.innerHTML = stackData.map(([name, desc]) => `
    <div class="stack-item">
      <span class="stack-name">${name}</span>
      <span class="stack-desc">${desc}</span>
    </div>
  `).join('');
}

function wireScrollMotion() {
  const update = () => {
    document.documentElement.style.setProperty('--scroll', String(window.scrollY));
  };
  update();
  window.addEventListener('scroll', update, { passive: true });
}

function wireRevealOnScroll() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, { threshold: 0.16 });

  document.querySelectorAll('.panel').forEach((panel) => {
    panel.style.opacity = '0';
    panel.style.transform = 'translateY(18px)';
    panel.style.transition = 'opacity 650ms ease, transform 650ms ease';
    observer.observe(panel);
  });
}

async function bootstrap() {
  splitHeroTitle();
  renderFeed();
  renderStack();
  wireScrollMotion();
  wireRevealOnScroll();
  await loadRepoStats();
}

document.addEventListener('DOMContentLoaded', bootstrap);
