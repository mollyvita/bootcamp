// ═══════════════════════════════════════
//  VuzTime — Frontend Application
// ═══════════════════════════════════════

let allEvents = [];
let chatOpen = false;
let profileOpen = false;
let currentUser = null;
let currentLang = 'ru';

// ═══════════════════════════════
//  i18n TRANSLATIONS
// ═══════════════════════════════

const TRANSLATIONS = {
    ru: {
        heroTitle: 'Найди своё ',
        heroHighlight: 'мероприятие',
        heroSubtitle: 'Мероприятия от лучших университетов мира',
        events: 'мероприятий',
        universities: 'университетов',
        countries: 'стран',
        aiGreeting: 'Спросите меня о мероприятиях — я подберу лучшее для вас',
        aiPlaceholder: 'Какие мероприятия вам интересны?',
        chatPlaceholder: 'Напишите сообщение...',
        aiWelcome: 'Привет! 👋 Я помогу подобрать мероприятие по вашим интересам. Расскажите, что вам интересно?',
        aiAssistant: 'ИИ-ассистент',
        back: 'Назад',
        chipOpenDays: 'Дни открытых дверей',
        chipIT: 'IT и технологии',
        chipLectures: 'Лекции и наука',
        chipInternational: 'Зарубежные вузы',
        allCountries: 'Все страны',
        allUniversities: 'Все университеты',
        allTypes: 'Все типы',
        typeOpenDay: 'Дни открытых дверей',
        typeClub: 'Клубы по интересам',
        typeLecture: 'Лекции',
        typeWorkshop: 'Мастер-классы',
        forAll: 'Для всех',
        forStudents: 'Для студентов',
        forApplicants: 'Для абитуриентов',
        nothingFound: 'Ничего не найдено',
        changeFilters: 'Попробуйте изменить параметры фильтров',
        shown: 'Показано',
        profile: 'Профиль',
        myEvents: 'Мои записи',
        settings: 'Настройки',
        fullName: 'ФИО',
        emailLabel: 'Электронная почта',
        phoneLabel: 'Телефон',
        save: 'Сохранить',
        savedSuccess: 'Сохранено ✓',
        noEventsDesc: 'Вы ещё не записались ни на одно мероприятие',
        viewEvents: 'Смотреть мероприятия',
        role: 'Кем вы являетесь',
        select: 'Выберите',
        student: 'Студент',
        applicant: 'Абитуриент',
        registerForEvent: 'Записаться на мероприятие',
        youRegistered: 'Вы записаны!',
        infoSent: 'Информация о мероприятии отправлена на вашу почту',
        close: 'Закрыть',
        details: 'Подробнее',
        registered: 'Записан',
        cancelReg: 'Отменить запись',
        alreadyRegistered: 'Вы уже записаны',
        regOnEvent: 'Вы зарегистрированы на это мероприятие',
        register: 'Записаться',
    },
    en: {
        heroTitle: 'Find your ',
        heroHighlight: 'event',
        heroSubtitle: 'Events from the world\'s best universities',
        events: 'events',
        universities: 'universities',
        countries: 'countries',
        aiGreeting: 'Ask me about events — I\'ll find the best ones for you',
        aiPlaceholder: 'What events interest you?',
        chatPlaceholder: 'Type a message...',
        aiWelcome: 'Hi! 👋 I\'ll help you find events that match your interests. What are you looking for?',
        aiAssistant: 'AI Assistant',
        back: 'Back',
        chipOpenDays: 'Open days',
        chipIT: 'IT & Technology',
        chipLectures: 'Lectures & Science',
        chipInternational: 'International',
        allCountries: 'All countries',
        allUniversities: 'All universities',
        allTypes: 'All types',
        typeOpenDay: 'Open days',
        typeClub: 'Clubs',
        typeLecture: 'Lectures',
        typeWorkshop: 'Workshops',
        forAll: 'For everyone',
        forStudents: 'For students',
        forApplicants: 'For applicants',
        nothingFound: 'Nothing found',
        changeFilters: 'Try changing your filters',
        shown: 'Shown',
        profile: 'Profile',
        myEvents: 'My registrations',
        settings: 'Settings',
        fullName: 'Full name',
        emailLabel: 'Email',
        phoneLabel: 'Phone',
        save: 'Save',
        savedSuccess: 'Saved ✓',
        noEventsDesc: 'You haven\'t registered for any events yet',
        viewEvents: 'Browse events',
        role: 'Your role',
        select: 'Select',
        student: 'Student',
        applicant: 'Applicant',
        registerForEvent: 'Register for event',
        youRegistered: 'You\'re registered!',
        infoSent: 'Event details have been sent to your email',
        close: 'Close',
        details: 'Details',
        registered: 'Registered',
        cancelReg: 'Cancel registration',
        alreadyRegistered: 'Already registered',
        regOnEvent: 'You are registered for this event',
        register: 'Register',
    },
    es: {
        heroTitle: 'Encuentra tu ',
        heroHighlight: 'evento',
        heroSubtitle: 'Eventos de las mejores universidades del mundo',
        events: 'eventos',
        universities: 'universidades',
        countries: 'países',
        aiGreeting: 'Pregúntame sobre eventos — encontraré los mejores para ti',
        aiPlaceholder: '¿Qué eventos te interesan?',
        chatPlaceholder: 'Escribe un mensaje...',
        aiWelcome: '¡Hola! 👋 Te ayudaré a encontrar eventos según tus intereses. ¿Qué buscas?',
        aiAssistant: 'Asistente IA',
        back: 'Volver',
        chipOpenDays: 'Jornadas abiertas',
        chipIT: 'IT y Tecnología',
        chipLectures: 'Conferencias',
        chipInternational: 'Internacional',
        allCountries: 'Todos los países',
        allUniversities: 'Todas las universidades',
        allTypes: 'Todos los tipos',
        typeOpenDay: 'Jornadas abiertas',
        typeClub: 'Clubes',
        typeLecture: 'Conferencias',
        typeWorkshop: 'Talleres',
        forAll: 'Para todos',
        forStudents: 'Para estudiantes',
        forApplicants: 'Para aspirantes',
        nothingFound: 'No se encontró nada',
        changeFilters: 'Intenta cambiar los filtros',
        shown: 'Mostrados',
        profile: 'Perfil',
        myEvents: 'Mis inscripciones',
        settings: 'Configuración',
        fullName: 'Nombre completo',
        emailLabel: 'Correo electrónico',
        phoneLabel: 'Teléfono',
        save: 'Guardar',
        savedSuccess: 'Guardado ✓',
        noEventsDesc: 'Aún no te has inscrito a ningún evento',
        viewEvents: 'Ver eventos',
        role: 'Tu rol',
        select: 'Seleccionar',
        student: 'Estudiante',
        applicant: 'Aspirante',
        registerForEvent: 'Inscribirse al evento',
        youRegistered: '¡Estás inscrito!',
        infoSent: 'Los detalles del evento se enviaron a tu correo',
        close: 'Cerrar',
        details: 'Detalles',
        registered: 'Inscrito',
        cancelReg: 'Cancelar inscripción',
        alreadyRegistered: 'Ya inscrito',
        regOnEvent: 'Estás registrado en este evento',
        register: 'Inscribirse',
    },
    cn: {
        heroTitle: '发现你的',
        heroHighlight: '活动',
        heroSubtitle: '来自世界顶尖大学的活动',
        events: '活动',
        universities: '所大学',
        countries: '个国家',
        aiGreeting: '向我咨询活动信息——我会为你找到最好的',
        aiPlaceholder: '你对什么活动感兴趣？',
        chatPlaceholder: '输入消息...',
        aiWelcome: '你好！👋 我会帮你找到符合你兴趣的活动。你在找什么？',
        aiAssistant: 'AI助手',
        back: '返回',
        chipOpenDays: '开放日',
        chipIT: 'IT与科技',
        chipLectures: '讲座与科学',
        chipInternational: '国际大学',
        allCountries: '所有国家',
        allUniversities: '所有大学',
        allTypes: '所有类型',
        typeOpenDay: '开放日',
        typeClub: '社团',
        typeLecture: '讲座',
        typeWorkshop: '研讨会',
        forAll: '面向所有人',
        forStudents: '面向学生',
        forApplicants: '面向申请者',
        nothingFound: '未找到结果',
        changeFilters: '请尝试更改筛选条件',
        shown: '显示',
        profile: '个人资料',
        myEvents: '我的报名',
        settings: '设置',
        fullName: '姓名',
        emailLabel: '邮箱',
        phoneLabel: '电话',
        save: '保存',
        savedSuccess: '已保存 ✓',
        noEventsDesc: '你还没有报名任何活动',
        viewEvents: '浏览活动',
        role: '你的身份',
        select: '请选择',
        student: '学生',
        applicant: '申请者',
        registerForEvent: '报名参加活动',
        youRegistered: '报名成功！',
        infoSent: '活动信息已发送到您的邮箱',
        close: '关闭',
        details: '详情',
        registered: '已报名',
        cancelReg: '取消报名',
        alreadyRegistered: '已报名',
        regOnEvent: '你已报名参加此活动',
        register: '报名',
    },
};

function t(key) {
    return (TRANSLATIONS[currentLang] && TRANSLATIONS[currentLang][key]) || TRANSLATIONS['ru'][key] || key;
}

function applyTranslations() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (key === 'heroTitle') {
            el.innerHTML = t('heroTitle') + '<span class="hero-highlight" data-i18n="heroHighlight">' + t('heroHighlight') + '</span>';
        } else {
            el.textContent = t(key);
        }
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        el.placeholder = t(el.getAttribute('data-i18n-placeholder'));
    });
}

// ═══════════════════════════════
//  INIT
// ═══════════════════════════════

document.addEventListener('DOMContentLoaded', () => {
    loadUser();
    loadEvents();
    setupCardHoverTracking();
    populateUniversityFilter();
});

async function loadUser() {
    try {
        const res = await fetch('/api/user');
        currentUser = await res.json();
        updateAvatars();
    } catch (e) {
        console.error('Failed to load user:', e);
    }
}

function updateAvatars() {
    if (!currentUser) return;
    const initials = currentUser.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
    document.querySelectorAll('#user-avatar, #profile-avatar').forEach(el => el.textContent = initials);
    const nameEl = document.getElementById('profile-name');
    const emailEl = document.getElementById('profile-email');
    if (nameEl) nameEl.textContent = currentUser.name;
    if (emailEl) emailEl.textContent = currentUser.email;
}

// ═══════════════════════════════
//  LANGUAGE
// ═══════════════════════════════

function toggleLangMenu() {
    document.getElementById('lang-dropdown').classList.toggle('open');
}

function setLanguage(lang) {
    currentLang = lang;
    document.getElementById('lang-current').textContent = lang.toUpperCase();
    document.querySelectorAll('.lang-option').forEach(o => {
        o.classList.toggle('active', o.dataset.lang === lang);
    });
    document.getElementById('lang-dropdown').classList.remove('open');
    applyTranslations();
    loadEvents();
}

// Close lang dropdown on outside click
document.addEventListener('click', (e) => {
    if (!e.target.closest('.lang-selector')) {
        document.getElementById('lang-dropdown').classList.remove('open');
    }
});

// ═══════════════════════════════
//  EVENTS
// ═══════════════════════════════

const FULL_UNI_NAMES = {
    'МГУ': 'Московский государственный университет',
    'МФТИ': 'Московский физико-технический институт',
    'ВШЭ': 'Высшая школа экономики',
    'МГТУ': 'МГТУ им. Н.Э. Баумана',
    'ИТМО': 'Университет ИТМО',
    'MIT': 'Massachusetts Institute of Technology',
    'Stanford': 'Stanford University',
    'Oxford': 'University of Oxford',
    'Cambridge': 'University of Cambridge',
    'ETH Zurich': 'ETH Zürich',
    'Tsinghua': 'Tsinghua University',
    'U of Tokyo': 'University of Tokyo',
    'TU Munich': 'Technical University of Munich',
    'Sorbonne': 'Sorbonne Université',
    'KAIST': 'KAIST',
};

const COUNTRY_FLAGS = {
    'RU': '🇷🇺', 'US': '🇺🇸', 'UK': '🇬🇧', 'CN': '🇨🇳',
    'JP': '🇯🇵', 'DE': '🇩🇪', 'FR': '🇫🇷', 'CH': '🇨🇭', 'KR': '🇰🇷',
};

function populateUniversityFilter() {
    const select = document.getElementById('filter-university');
    const unis = Object.keys(FULL_UNI_NAMES);
    // Keep first option
    select.innerHTML = `<option value="" data-i18n="allUniversities">${t('allUniversities')}</option>`;
    unis.forEach(u => {
        select.innerHTML += `<option value="${u}">${u}</option>`;
    });
}

async function loadEvents() {
    const university = document.getElementById('filter-university').value;
    const type = document.getElementById('filter-type').value;
    const audience = document.getElementById('filter-audience').value;
    const country = document.getElementById('filter-country').value;

    const params = new URLSearchParams();
    if (university) params.set('university', university);
    if (type) params.set('type', type);
    if (audience) params.set('audience', audience);
    if (country) params.set('country', country);

    try {
        const res = await fetch(`/api/events?${params}`);
        const events = await res.json();
        allEvents = events;
        renderEvents(events, 'events-grid');

        document.getElementById('filter-count').textContent = `${t('shown')}: ${events.length}`;
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
        card.style.animationDelay = `${i * 0.05}s`;
        card.onclick = () => openModal(event);

        const flag = COUNTRY_FLAGS[event.country] || '';
        const fullUni = FULL_UNI_NAMES[event.university] || event.university;

        card.innerHTML = `
            <div class="card-top">
                <span class="card-emoji">${event.emoji}</span>
                <div class="card-badges">
                    <span class="card-badge card-badge--uni" style="color:${event.color}">${event.university}</span>
                    ${event.registered
                        ? `<span class="card-badge card-badge--registered">✓ ${t('registered')}</span>`
                        : `<span class="card-badge card-badge--type">${event.type_label}</span>`}
                    <span class="card-badge card-badge--country">${flag} ${event.country}</span>
                </div>
            </div>
            <h3 class="card-title">${event.title}</h3>
            <div class="card-uni-name">${fullUni}</div>
            <div class="card-meta">
                <div class="card-meta-item"><span class="meta-icon">📅</span>${event.date}</div>
                <div class="card-meta-item"><span class="meta-icon">🕐</span>${event.time}</div>
            </div>
            <div class="card-footer">
                <span class="card-audience">${event.audience_label}</span>
                ${event.registered
                    ? `<span class="card-action card-action--registered">${t('registered')} ✓</span>`
                    : `<span class="card-action">${t('details')} →</span>`}
            </div>
        `;

        grid.appendChild(card);
    });
}

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
//  NAVIGATION
// ═══════════════════════════════

function goHome() {
    closeChat();
    document.getElementById('main-view').style.display = 'block';
}

// ═══════════════════════════════
//  AI CHAT
// ═══════════════════════════════

function sendFromHome(e) {
    e.preventDefault();
    const input = document.getElementById('ai-input');
    const message = input.value.trim();
    if (!message) return;
    input.value = '';

    openChat();
    // Add user message and send
    addChatMessage(message, 'user');
    sendToAI(message);
}

function quickAsk(text) {
    openChat();
    addChatMessage(text, 'user');
    sendToAI(text);
}

function openChat() {
    chatOpen = true;
    document.getElementById('chat-fullscreen').classList.add('open');
    document.getElementById('main-view').style.display = 'none';
    document.body.style.overflow = 'hidden';
    setTimeout(() => document.getElementById('chat-input').focus(), 100);
}

function closeChat() {
    chatOpen = false;
    document.getElementById('chat-fullscreen').classList.remove('open');
    document.getElementById('main-view').style.display = 'block';
    document.body.style.overflow = '';
}

function sendChatMessage(e) {
    e.preventDefault();
    const input = document.getElementById('chat-input');
    const message = input.value.trim();
    if (!message) return;
    input.value = '';

    addChatMessage(message, 'user');
    sendToAI(message);
}

async function sendToAI(message) {
    const typing = addTypingIndicator();

    try {
        const res = await fetch('/api/ai-recommend', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message, lang: currentLang }),
        });

        const data = await res.json();
        typing.remove();

        // Add text response
        const msgEl = addChatMessage(data.response, 'bot');

        // Add event recommendation cards if any
        if (data.recommended_events && data.recommended_events.length > 0) {
            const cardsWrap = document.createElement('div');
            cardsWrap.className = 'chat-event-cards';

            data.recommended_events.forEach(ev => {
                const card = document.createElement('div');
                card.className = 'chat-event-card';
                card.onclick = () => openModal(ev);

                const flag = COUNTRY_FLAGS[ev.country] || '';
                card.innerHTML = `
                    <div class="chat-event-card-top">
                        <span class="chat-event-card-emoji">${ev.emoji}</span>
                        <div class="chat-event-card-info">
                            <div class="chat-event-card-title">${ev.title}</div>
                            <div class="chat-event-card-uni">${ev.university} ${flag}</div>
                        </div>
                    </div>
                    <div class="chat-event-card-meta">
                        <span>📅 ${ev.date}</span>
                        <span>🕐 ${ev.time}</span>
                    </div>
                    <button class="chat-event-card-btn" onclick="event.stopPropagation(); openModal(findEvent(${ev.id}))">
                        ${t('register')} →
                    </button>
                `;
                cardsWrap.appendChild(card);
            });

            // Insert cards after the bot message body
            msgEl.appendChild(cardsWrap);
        }
    } catch (err) {
        typing.remove();
        addChatMessage('Не удалось получить ответ. Попробуйте позже.', 'bot');
    }
}

function findEvent(id) {
    return allEvents.find(e => e.id === id) || { id };
}

function addChatMessage(text, sender) {
    const container = document.getElementById('chat-messages');
    const msg = document.createElement('div');
    msg.className = `chat-msg chat-msg--${sender}`;

    const avatar = sender === 'bot' ? '✦' : (currentUser ? currentUser.name.split(' ').map(w => w[0]).join('').slice(0, 2) : 'U');
    const bodyContent = sender === 'bot' ? renderMarkdown(text) : escapeHtml(text);
    msg.innerHTML = `
        <div class="chat-msg-avatar">${avatar}</div>
        <div class="chat-msg-body">${bodyContent}</div>
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

function renderMarkdown(text) {
    if (typeof marked !== 'undefined') {
        marked.setOptions({ breaks: true, gfm: true });
        return marked.parse(text);
    }
    return escapeHtml(text);
}

// ═══════════════════════════════
//  PROFILE PANEL
// ═══════════════════════════════

function toggleProfile() {
    profileOpen = !profileOpen;
    document.getElementById('profile-overlay').classList.toggle('open', profileOpen);
    document.body.style.overflow = profileOpen ? 'hidden' : '';

    if (profileOpen) {
        loadProfileEvents();
        // Update settings form values
        if (currentUser) {
            document.getElementById('settings-name').value = currentUser.name || '';
            document.getElementById('settings-email').value = currentUser.email || '';
            document.getElementById('settings-phone').value = currentUser.phone || '';
        }
    }
}

function closeProfileOverlay(e) {
    if (e.target === e.currentTarget) {
        toggleProfile();
    }
}

function switchProfileTab(tab) {
    document.querySelectorAll('.profile-tab').forEach(t => {
        t.classList.toggle('active', t.dataset.ptab === tab);
    });
    document.getElementById('ptab-my-events').style.display = tab === 'my-events' ? 'block' : 'none';
    document.getElementById('ptab-settings').style.display = tab === 'settings' ? 'block' : 'none';
}

async function loadProfileEvents() {
    try {
        const res = await fetch('/api/my-events');
        const events = await res.json();
        const list = document.getElementById('profile-events-list');
        const empty = document.getElementById('profile-events-empty');

        if (events.length === 0) {
            list.style.display = 'none';
            empty.style.display = 'block';
            return;
        }

        list.style.display = 'flex';
        empty.style.display = 'none';
        list.innerHTML = '';

        events.forEach(ev => {
            const item = document.createElement('div');
            item.className = 'profile-event-item';
            item.onclick = () => { toggleProfile(); openModal(ev); };
            item.innerHTML = `
                <span class="profile-event-emoji">${ev.emoji}</span>
                <div class="profile-event-info">
                    <div class="profile-event-title">${ev.title} — ${ev.university}</div>
                    <div class="profile-event-date">📅 ${ev.date}</div>
                </div>
                <button class="profile-event-cancel" onclick="event.stopPropagation(); cancelFromProfile(${ev.id})" title="${t('cancelReg')}">✕</button>
            `;
            list.appendChild(item);
        });
    } catch (err) {
        console.error('Failed to load profile events:', err);
    }
}

async function cancelFromProfile(eventId) {
    try {
        const res = await fetch('/api/cancel', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ event_id: eventId }),
        });
        if (res.ok) {
            loadProfileEvents();
            loadEvents();
        }
    } catch (err) {
        console.error('Cancel failed:', err);
    }
}

async function saveSettings(e) {
    e.preventDefault();
    const name = document.getElementById('settings-name').value;
    const email = document.getElementById('settings-email').value;
    const phone = document.getElementById('settings-phone').value;

    try {
        const res = await fetch('/api/user/update', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, phone }),
        });
        const data = await res.json();
        if (data.success) {
            currentUser = data.user;
            updateAvatars();
            const saved = document.getElementById('settings-saved');
            saved.style.display = 'block';
            setTimeout(() => { saved.style.display = 'none'; }, 2000);
        }
    } catch (err) {
        console.error('Save failed:', err);
    }
}

// ═══════════════════════════════
//  MODAL
// ═══════════════════════════════

let currentEvent = null;

function openModal(event) {
    if (!event || !event.title) {
        // Try to find event by id
        const found = allEvents.find(e => e.id === event.id);
        if (found) event = found;
        else return;
    }

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

    // Pre-fill from profile
    if (currentUser) {
        document.getElementById('reg-name').value = currentUser.name || '';
        document.getElementById('reg-email').value = currentUser.email || '';
    }

    if (event.registered) {
        document.getElementById('register-form').style.display = 'none';
        document.getElementById('reg-success').style.display = 'block';
        document.getElementById('reg-success').innerHTML = `
            <div class="success-icon">✓</div>
            <h3>${t('alreadyRegistered')}</h3>
            <p>${t('regOnEvent')}</p>
            <div style="display:flex; gap:10px; justify-content:center">
                <button class="btn btn-danger" onclick="cancelRegistration(${event.id})">${t('cancelReg')}</button>
                <button class="btn btn-secondary" onclick="closeModal()">${t('close')}</button>
            </div>
        `;
    } else {
        document.getElementById('register-form').style.display = 'flex';
        document.getElementById('reg-success').style.display = 'none';
        document.getElementById('reg-submit').disabled = false;
        document.getElementById('reg-submit').textContent = t('registerForEvent');
    }

    document.getElementById('modal-overlay').classList.add('open');
    document.body.style.overflow = 'hidden';
}

function closeModal(e) {
    if (e && e.target !== e.currentTarget) return;
    document.getElementById('modal-overlay').classList.remove('open');
    document.body.style.overflow = chatOpen ? 'hidden' : '';

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
    btn.textContent = '...';

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
                <h3>${t('youRegistered')}</h3>
                <p>${t('infoSent')}</p>
                <button class="btn btn-secondary" onclick="closeModal()">${t('close')}</button>
            `;
            loadEvents();
        } else {
            btn.disabled = false;
            btn.textContent = t('registerForEvent');
            alert(result.error || 'Error');
        }
    } catch (err) {
        btn.disabled = false;
        btn.textContent = t('registerForEvent');
        alert('Network error');
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
            loadEvents();
        }
    } catch (err) {
        alert('Error');
    }
}

// ── Keyboard shortcuts ──
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        if (document.getElementById('modal-overlay').classList.contains('open')) {
            closeModal();
        } else if (profileOpen) {
            toggleProfile();
        } else if (chatOpen) {
            closeChat();
        }
    }
});
