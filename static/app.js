// ═══════════════════════════════════════
//  UniVent — Frontend Application
// ═══════════════════════════════════════

let allEvents = [];
let chatOpen = false;
let currentUser = null;

// ── Init ──
document.addEventListener('DOMContentLoaded', () => {
    loadUser();
    loadEvents();
    setupCardHoverTracking();
});

async function loadUser() {
    try {
        const res = await fetch('/api/user');
        currentUser = await res.json();
    } catch (e) {
        console.error('Failed to load user:', e);
    }
}

// ═══════════════════════════════
//  EVENTS
// ═══════════════════════════════

async function loadEvents() {
    const university = document.getElementById('filter-university').value;
    const type = document.getElementById('filter-type').value;
    const audience = document.getElementById('filter-audience').value;

    const params = new URLSearchParams();
    if (university) params.set('university', university);
    if (type) params.set('type', type);
    if (audience) params.set('audience', audience);

    try {
        const res = await fetch(`/api/events?${params}`);
        const events = await res.json();
        allEvents = events;
        renderEvents(events, 'events-grid');

        document.getElementById('filter-count').textContent = `Показано: ${events.length}`;
        document.getElementById('empty-state').style.display = events.length === 0 ? 'block' : 'none';
        document.getElementById('events-grid').style.display = events.length === 0 ? 'none' : 'grid';
    } catch (err) {
        console.error('Failed to load events:', err);
    }
}

function renderEvents(events, containerId) {
    const grid = document.getElementById(containerId);
    grid.innerHTML = '';

    events.forEach((event, i) => {
        const card = document.createElement('div');
        card.className = `event-card${event.registered ? ' registered' : ''}`;
        card.style.setProperty('--card-accent', event.color);
        card.style.animationDelay = `${i * 0.06}s`;
        card.onclick = () => openModal(event);

        card.innerHTML = `
            <div class="card-top">
                <span class="card-emoji">${event.emoji}</span>
                <div class="card-badges">
                    <span class="card-badge card-badge--uni" style="color:${event.color}">${event.university}</span>
                    ${event.registered ? '<span class="card-badge card-badge--registered">✓ Записан</span>' : `<span class="card-badge card-badge--type">${event.type_label}</span>`}
                </div>
            </div>
            <h3 class="card-title">${event.title}</h3>
            <div class="card-uni-name">${getFullUniName(event.university)}</div>
            <div class="card-meta">
                <div class="card-meta-item">
                    <span class="meta-icon">📅</span>
                    ${event.date}
                </div>
                <div class="card-meta-item">
                    <span class="meta-icon">🕐</span>
                    ${event.time}
                </div>
            </div>
            <div class="card-footer">
                <span class="card-audience">${event.audience_label}</span>
                ${event.registered
                    ? '<span class="card-action card-action--registered">Записан ✓</span>'
                    : '<span class="card-action">Подробнее →</span>'}
            </div>
        `;

        grid.appendChild(card);
    });
}

function getFullUniName(short) {
    const map = {
        'МГУ': 'Московский государственный университет',
        'МФТИ': 'Московский физико-технический институт',
        'ВШЭ': 'Высшая школа экономики',
        'МГТУ': 'МГТУ им. Н.Э. Баумана',
        'ИТМО': 'Университет ИТМО',
    };
    return map[short] || short;
}

// ── Card hover light tracking ──
function setupCardHoverTracking() {
    document.addEventListener('mousemove', (e) => {
        const cards = document.querySelectorAll('.event-card');
        cards.forEach(card => {
            const rect = card.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * 100;
            const y = ((e.clientY - rect.top) / rect.height) * 100;
            card.style.setProperty('--mouse-x', x + '%');
            card.style.setProperty('--mouse-y', y + '%');
        });
    });
}

// ═══════════════════════════════
//  TABS
// ═══════════════════════════════

function switchTab(tab) {
    // Update nav
    document.querySelectorAll('.nav-tab').forEach(t => {
        t.classList.toggle('active', t.dataset.tab === tab);
    });

    if (tab === 'events') {
        document.getElementById('events-section').style.display = 'block';
        document.getElementById('my-events-section').style.display = 'none';
        document.querySelector('.hero').style.display = 'block';
        loadEvents();
    } else {
        document.getElementById('events-section').style.display = 'none';
        document.getElementById('my-events-section').style.display = 'block';
        document.querySelector('.hero').style.display = 'none';
        loadMyEvents();
    }
}

async function loadMyEvents() {
    try {
        const res = await fetch('/api/my-events');
        const events = await res.json();
        renderEvents(events, 'my-events-grid');

        document.getElementById('my-events-empty').style.display = events.length === 0 ? 'block' : 'none';
        document.getElementById('my-events-grid').style.display = events.length === 0 ? 'none' : 'grid';
    } catch (err) {
        console.error('Failed to load my events:', err);
    }
}

function updateBadge() {
    fetch('/api/my-events')
        .then(res => res.json())
        .then(events => {
            const badge = document.getElementById('my-events-badge');
            if (events.length > 0) {
                badge.style.display = 'inline';
                badge.textContent = events.length;
            } else {
                badge.style.display = 'none';
            }
        });
}

// ═══════════════════════════════
//  MODAL
// ═══════════════════════════════

let currentEvent = null;

function openModal(event) {
    currentEvent = event;

    document.getElementById('modal-emoji').textContent = event.emoji;
    document.getElementById('modal-uni').textContent = event.university + ' · ' + event.type_label;
    document.getElementById('modal-uni').style.color = event.color;
    document.getElementById('modal-title').textContent = event.title;
    document.getElementById('modal-date').textContent = event.date;
    document.getElementById('modal-time').textContent = event.time;
    document.getElementById('modal-location').textContent = event.location;
    document.getElementById('modal-description').textContent = event.description;
    document.getElementById('reg-event-id').value = event.id;

    // Pre-fill form with known user data
    if (currentUser) {
        document.getElementById('reg-name').value = currentUser.name || '';
        document.getElementById('reg-email').value = currentUser.email || '';
    }

    // Show form or success based on registration status
    if (event.registered) {
        document.getElementById('register-form').style.display = 'none';
        document.getElementById('reg-success').style.display = 'block';
        document.getElementById('reg-success').innerHTML = `
            <div class="success-icon">✓</div>
            <h3>Вы уже записаны</h3>
            <p>Вы зарегистрированы на это мероприятие</p>
            <div style="display:flex; gap:10px; justify-content:center">
                <button class="btn btn-danger" onclick="cancelRegistration(${event.id})">Отменить запись</button>
                <button class="btn btn-secondary" onclick="closeModal()">Закрыть</button>
            </div>
        `;
    } else {
        document.getElementById('register-form').style.display = 'flex';
        document.getElementById('reg-success').style.display = 'none';
        document.getElementById('reg-submit').disabled = false;
        document.getElementById('reg-submit').textContent = 'Записаться на мероприятие';
    }

    document.getElementById('modal-overlay').classList.add('open');
    document.body.style.overflow = 'hidden';
}

function closeModal(e) {
    if (e && e.target !== e.currentTarget) return;
    document.getElementById('modal-overlay').classList.remove('open');
    document.body.style.overflow = '';

    // Reset form after animation
    setTimeout(() => {
        document.getElementById('register-form').reset();
        document.getElementById('register-form').style.display = 'flex';
        document.getElementById('reg-success').style.display = 'none';
    }, 300);
}

async function submitRegistration(e) {
    e.preventDefault();

    const btn = document.getElementById('reg-submit');
    btn.disabled = true;
    btn.textContent = 'Записываем...';

    const data = {
        event_id: parseInt(document.getElementById('reg-event-id').value),
        name: document.getElementById('reg-name').value,
        email: document.getElementById('reg-email').value,
        role: document.getElementById('reg-role').value,
    };

    try {
        const res = await fetch('/api/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });

        const result = await res.json();

        if (res.ok) {
            document.getElementById('register-form').style.display = 'none';
            document.getElementById('reg-success').style.display = 'block';
            document.getElementById('reg-success').innerHTML = `
                <div class="success-icon">✓</div>
                <h3>Вы записаны!</h3>
                <p>Информация о мероприятии отправлена на вашу почту</p>
                <button class="btn btn-secondary" onclick="closeModal()">Закрыть</button>
            `;
            updateBadge();
            loadEvents();
        } else {
            btn.disabled = false;
            btn.textContent = 'Записаться на мероприятие';
            alert(result.error || 'Произошла ошибка');
        }
    } catch (err) {
        btn.disabled = false;
        btn.textContent = 'Записаться на мероприятие';
        alert('Ошибка сети. Попробуйте позже.');
    }
}

async function cancelRegistration(eventId) {
    try {
        const res = await fetch('/api/cancel', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ event_id: eventId }),
        });

        if (res.ok) {
            closeModal();
            updateBadge();
            loadEvents();

            // Reload my-events if visible
            if (document.getElementById('my-events-section').style.display !== 'none') {
                loadMyEvents();
            }
        }
    } catch (err) {
        alert('Ошибка при отмене. Попробуйте позже.');
    }
}

// ── Escape key to close modal ──
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        if (document.getElementById('modal-overlay').classList.contains('open')) {
            closeModal();
        }
        if (chatOpen) {
            toggleChat();
        }
    }
});

// ═══════════════════════════════
//  AI CHAT
// ═══════════════════════════════

function toggleChat() {
    chatOpen = !chatOpen;
    document.getElementById('chat-panel').classList.toggle('open', chatOpen);
    document.getElementById('ai-fab').classList.toggle('hidden', chatOpen);

    if (chatOpen) {
        document.getElementById('chat-input').focus();
    }
}

async function sendChatMessage(e) {
    e.preventDefault();

    const input = document.getElementById('chat-input');
    const message = input.value.trim();
    if (!message) return;

    // Add user message
    addChatMessage(message, 'user');
    input.value = '';

    // Show typing indicator
    const typing = addTypingIndicator();

    try {
        const res = await fetch('/api/ai-recommend', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message }),
        });

        const data = await res.json();
        typing.remove();
        addChatMessage(data.response, 'bot');
    } catch (err) {
        typing.remove();
        addChatMessage('Не удалось получить ответ. Попробуйте позже.', 'bot');
    }
}

function addChatMessage(text, sender) {
    const container = document.getElementById('chat-messages');
    const msg = document.createElement('div');
    msg.className = `chat-msg chat-msg--${sender}`;

    const avatar = sender === 'bot' ? '✦' : 'АП';
    msg.innerHTML = `
        <div class="chat-msg-avatar">${avatar}</div>
        <div class="chat-msg-body">${escapeHtml(text)}</div>
    `;

    container.appendChild(msg);
    container.scrollTop = container.scrollHeight;
    return msg;
}

function addTypingIndicator() {
    const container = document.getElementById('chat-messages');
    const msg = document.createElement('div');
    msg.className = 'chat-msg chat-msg--bot chat-msg--typing';
    msg.innerHTML = `
        <div class="chat-msg-avatar">✦</div>
        <div class="chat-msg-body">
            <span class="typing-dot"></span>
            <span class="typing-dot"></span>
            <span class="typing-dot"></span>
        </div>
    `;
    container.appendChild(msg);
    container.scrollTop = container.scrollHeight;
    return msg;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
