const feedData = [
  {
    stamp: 'APR 01',
    index: '01',
    title: 'mvp scope locked',
    summary: 'The repo starts with a focused Flask MVP: one rendered surface, one clear user path, and the right amount of structure to keep the bootcamp demo readable.',
    chips: ['flask', 'mvp', 'single path'],
    raw: [
      'app.py: registration flow + recommendation endpoint',
      'mvp.md: product story and constraints',
      'templates/index.html: main presentation shell',
    ],
  },
  {
    stamp: 'APR 03',
    index: '02',
    title: 'operator aesthetic applied',
    summary: 'A high-contrast layout, raw monospace typography, and disciplined spacing turn the page into a bootcamp command surface instead of a generic landing screen.',
    chips: ['mono type', 'grid', 'scanline'],
    raw: [
      'IBM Plex Mono + Inter',
      'glass panels with hard edges',
      'grid, noise, and scanline overlays',
    ],
  },
  {
    stamp: 'APR 06',
    index: '03',
    title: 'feed becomes a timeline',
    summary: 'The content is framed as a chronological build log, so the page reads like progress and iteration rather than a static checklist.',
    chips: ['feed', 'timeline', 'stagger'],
    raw: [
      'hero title splits into animated characters',
      'each card exposes hidden metadata on hover',
      'raw console mirrors the active entry',
    ],
  },
  {
    stamp: 'APR 10',
    index: '04',
    title: 'data model and ai lane surfaced',
    summary: 'The repo makes the underlying product honest: universities, events, registrations, and the recommendation helper are all visible in the interface.',
    chips: ['events', 'ai assistant', 'registrations'],
    raw: [
      'EVENTS array powers the sample content',
      'fallback recommender keeps the assistant usable',
      'registered state is shown back to the user',
    ],
  },
  {
    stamp: 'APR 18',
    index: '05',
    title: 'delivery lane staged',
    summary: 'The final pass is about shipping cleanly: push the redesign to design-v1, deploy it on Vercel, and keep the CTA pointed at the source.',
    chips: ['design-v1', 'vercel', 'github'],
    raw: [
      'branch target: design-v1',
      'production target: vercel',
      'source of truth: mollyvita/bootcamp',
    ],
  },
];

const stackData = [
  ['backend', 'flask routes + in-memory state'],
  ['templating', 'jinja render shell'],
  ['frontend', 'vanilla js interaction layer'],
  ['visual system', 'css grid + overlays + glass'],
  ['ai helper', 'yandexgpt lite + fallback rules'],
];

async function loadRepoStats() {
  try {
    const response = await fetch('https://api.github.com/repos/mollyvita/bootcamp');
    if (!response.ok) throw new Error(`github api ${response.status}`);
    const repo = await response.json();

    setRepoValue('language', repo.language || 'flask');
    setRepoValue('stars', formatNumber(repo.stargazers_count));
    setRepoValue('forks', formatNumber(repo.forks_count));
    setRepoValue('issues', formatNumber(repo.open_issues_count));
  } catch {
    setRepoValue('language', 'flask');
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
    <article class="feed-card tilt-surface" data-feed-card="${index}">
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
    <div class="stack-item tilt-surface">
      <span class="stack-name">${name}</span>
      <span class="stack-desc">${desc}</span>
    </div>
  `).join('');
}

function wireScrollMotion() {
  const update = () => {
    const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    const progress = Math.min(1, Math.max(0, window.scrollY / maxScroll));
    document.documentElement.style.setProperty('--scroll', String(window.scrollY));
    document.documentElement.style.setProperty('--scroll-progress', String(progress));
  };

  update();
  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update, { passive: true });
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

function wireTiltSurfaces() {
  const surfaces = document.querySelectorAll('.tilt-surface');

  surfaces.forEach((surface) => {
    surface.addEventListener('pointermove', (event) => {
      const rect = surface.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width;
      const y = (event.clientY - rect.top) / rect.height;
      const rx = ((y - 0.5) * -6).toFixed(2);
      const ry = ((x - 0.5) * 6).toFixed(2);
      surface.style.setProperty('--rx', `${rx}deg`);
      surface.style.setProperty('--ry', `${ry}deg`);
    });

    surface.addEventListener('pointerleave', () => {
      surface.style.setProperty('--rx', '0deg');
      surface.style.setProperty('--ry', '0deg');
    });
  });
}

async function bootstrap() {
  splitHeroTitle();
  renderFeed();
  renderStack();
  wireScrollMotion();
  wireRevealOnScroll();
  wireTiltSurfaces();
  await loadRepoStats();
}

document.addEventListener('DOMContentLoaded', bootstrap);
