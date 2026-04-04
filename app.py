import re
import traceback
from flask import Flask, render_template, jsonify, request
import json
import os
from google import genai
from google.genai import types
from dotenv import load_dotenv

load_dotenv()
api_key = os.environ.get("GOOGLE_API_KEY", "")
client = genai.Client(api_key=api_key)

app = Flask(__name__)

# Mock current user (auth to be added later)
CURRENT_USER = {
    "id": 1,
    "name": "Алексей Петров",
    "email": "alex@example.com",
    "phone": "+7 900 123-45-67",
}

# In-memory registration store
registrations = []

UNIVERSITIES = {
    # Russian
    "МГУ": {"color": "#3B82F6", "full": "Московский государственный университет", "country": "RU"},
    "МФТИ": {"color": "#10B981", "full": "Московский физико-технический институт", "country": "RU"},
    "ВШЭ": {"color": "#8B5CF6", "full": "Высшая школа экономики", "country": "RU"},
    "МГТУ": {"color": "#EF4444", "full": "МГТУ им. Н.Э. Баумана", "country": "RU"},
    "ИТМО": {"color": "#F59E0B", "full": "Университет ИТМО", "country": "RU"},
    # International
    "MIT": {"color": "#E6393F", "full": "Massachusetts Institute of Technology", "country": "US"},
    "Stanford": {"color": "#E05A50", "full": "Stanford University", "country": "US"},
    "Oxford": {"color": "#4A90D9", "full": "University of Oxford", "country": "UK"},
    "Cambridge": {"color": "#75C9A8", "full": "University of Cambridge", "country": "UK"},
    "ETH Zurich": {"color": "#5B9BD5", "full": "ETH Zürich", "country": "CH"},
    "Tsinghua": {"color": "#C084FC", "full": "Tsinghua University", "country": "CN"},
    "U of Tokyo": {"color": "#5DADE2", "full": "University of Tokyo", "country": "JP"},
    "TU Munich": {"color": "#3498DB", "full": "Technical University of Munich", "country": "DE"},
    "Sorbonne": {"color": "#E8A838", "full": "Sorbonne Université", "country": "FR"},
    "KAIST": {"color": "#2ECC71", "full": "KAIST", "country": "KR"},
}

EVENTS = [
    # ─── Russian Events ───
    {
        "id": 1, "title": "День открытых дверей", "university": "МГУ",
        "type": "open_day", "type_label": "День открытых дверей",
        "audience": "applicant", "audience_label": "Для абитуриентов",
        "date": "15 апреля", "time": "10:00 — 16:00",
        "location": "Главное здание МГУ, Ленинские горы", "country": "RU",
        "description": "Познакомьтесь с факультетами МГУ, узнайте о программах обучения и задайте вопросы преподавателям. Презентации факультетов, экскурсии по кампусу и консультации приёмной комиссии.",
        "emoji": "🎓", "color": "#3B82F6",
    },
    {
        "id": 2, "title": "Робототехнический клуб", "university": "МФТИ",
        "type": "club", "type_label": "Клуб по интересам",
        "audience": "student", "audience_label": "Для студентов",
        "date": "Каждый четверг", "time": "18:00 — 20:00",
        "location": "Корпус прикладной математики, ауд. 305", "country": "RU",
        "description": "Проектируем и программируем роботов, участвуем в соревнованиях RoboCup. Опыт не требуется — научим всему с нуля!",
        "emoji": "🤖", "color": "#10B981",
    },
    {
        "id": 3, "title": "Лекция «ИИ в медицине»", "university": "ВШЭ",
        "type": "lecture", "type_label": "Лекция",
        "audience": "all", "audience_label": "Для всех",
        "date": "20 апреля", "time": "14:00 — 16:00",
        "location": "Покровский бульвар, ауд. R505", "country": "RU",
        "description": "Профессор Ковалёв расскажет о применении нейросетей в диагностике заболеваний и перспективах цифровой медицины.",
        "emoji": "🧠", "color": "#8B5CF6",
    },
    {
        "id": 4, "title": "День открытых дверей", "university": "МГТУ",
        "type": "open_day", "type_label": "День открытых дверей",
        "audience": "applicant", "audience_label": "Для абитуриентов",
        "date": "18 апреля", "time": "11:00 — 17:00",
        "location": "2-я Бауманская, д. 5", "country": "RU",
        "description": "Узнайте об инженерных специальностях МГТУ, посетите лаборатории и пообщайтесь со студентами. Мастер-классы по 3D-моделированию.",
        "emoji": "🎓", "color": "#EF4444",
    },
    {
        "id": 5, "title": "Клуб дебатов", "university": "ВШЭ",
        "type": "club", "type_label": "Клуб по интересам",
        "audience": "student", "audience_label": "Для студентов",
        "date": "Каждую среду", "time": "19:00 — 21:00",
        "location": "Мясницкая, 20, ауд. 309", "country": "RU",
        "description": "Оттачиваем навыки аргументации и публичных выступлений. Готовимся к межвузовским чемпионатам по парламентским дебатам.",
        "emoji": "🗣️", "color": "#8B5CF6",
    },
    {
        "id": 6, "title": "Хакатон «CodeSprint»", "university": "ИТМО",
        "type": "workshop", "type_label": "Мастер-класс",
        "audience": "student", "audience_label": "Для студентов",
        "date": "1 — 3 мая", "time": "10:00 — 22:00",
        "location": "Кронверкский пр., 49, коворкинг", "country": "RU",
        "description": "48-часовой хакатон по разработке AI-решений для городской среды. Призовой фонд 500 000 ₽. Команды 3-5 человек.",
        "emoji": "💻", "color": "#F59E0B",
    },
    {
        "id": 7, "title": "Мастер-класс «Веб-разработка»", "university": "МФТИ",
        "type": "workshop", "type_label": "Мастер-класс",
        "audience": "all", "audience_label": "Для всех",
        "date": "22 апреля", "time": "15:00 — 18:00",
        "location": "Институтский пер., 9, ауд. 115", "country": "RU",
        "description": "Создадим полноценное веб-приложение на React за 3 часа. Узнаете о современных подходах к фронтенд-разработке.",
        "emoji": "🌐", "color": "#10B981",
    },
    {
        "id": 8, "title": "День открытых дверей", "university": "ИТМО",
        "type": "open_day", "type_label": "День открытых дверей",
        "audience": "applicant", "audience_label": "Для абитуриентов",
        "date": "25 апреля", "time": "12:00 — 18:00",
        "location": "Кронверкский пр., 49", "country": "RU",
        "description": "Откройте для себя IT-специальности ИТМО: программирование, кибербезопасность, Data Science. Лучший IT-вуз страны ждёт вас!",
        "emoji": "🎓", "color": "#F59E0B",
    },
    {
        "id": 9, "title": "Фотоклуб", "university": "МГУ",
        "type": "club", "type_label": "Клуб по интересам",
        "audience": "student", "audience_label": "Для студентов",
        "date": "Каждый вторник", "time": "17:00 — 19:00",
        "location": "Ломоносовский корпус, ком. 218", "country": "RU",
        "description": "Изучаем фотографию от основ композиции до продвинутой обработки. Регулярные фотопрогулки по Москве и выставки работ.",
        "emoji": "📸", "color": "#3B82F6",
    },
    {
        "id": 10, "title": "Лекция «Квантовые вычисления»", "university": "МФТИ",
        "type": "lecture", "type_label": "Лекция",
        "audience": "all", "audience_label": "Для всех",
        "date": "28 апреля", "time": "16:00 — 18:00",
        "location": "Институтский пер., 9, ауд. 201", "country": "RU",
        "description": "Как работают квантовые компьютеры, зачем они нужны и когда станут частью повседневной жизни. Лекция для широкой аудитории.",
        "emoji": "⚛️", "color": "#10B981",
    },
    {
        "id": 11, "title": "Шахматный клуб", "university": "МГТУ",
        "type": "club", "type_label": "Клуб по интересам",
        "audience": "student", "audience_label": "Для студентов",
        "date": "Каждый понедельник", "time": "18:30 — 20:30",
        "location": "ГЗ, комн. 501", "country": "RU",
        "description": "Шахматы для всех уровней: от новичков до разрядников. Еженедельные турниры, разбор партий и подготовка к студенческим чемпионатам.",
        "emoji": "♟️", "color": "#EF4444",
    },
    {
        "id": 12, "title": "Мастер-класс «Data Science»", "university": "ВШЭ",
        "type": "workshop", "type_label": "Мастер-класс",
        "audience": "all", "audience_label": "Для всех",
        "date": "5 мая", "time": "14:00 — 17:00",
        "location": "Покровский бульвар, ауд. L401", "country": "RU",
        "description": "Практический мастер-класс по анализу данных на Python. Поработаем с реальными датасетами и построим модели предсказания.",
        "emoji": "📊", "color": "#8B5CF6",
    },
    {
        "id": 13, "title": "День открытых дверей", "university": "ВШЭ",
        "type": "open_day", "type_label": "День открытых дверей",
        "audience": "applicant", "audience_label": "Для абитуриентов",
        "date": "30 апреля", "time": "10:00 — 15:00",
        "location": "Покровский бульвар, 11", "country": "RU",
        "description": "Факультеты экономики, менеджмента, права и компьютерных наук ВШЭ приглашают абитуриентов. Индивидуальные консультации и тест-драйв лекций.",
        "emoji": "🎓", "color": "#8B5CF6",
    },
    {
        "id": 14, "title": "Театральная студия", "university": "ИТМО",
        "type": "club", "type_label": "Клуб по интересам",
        "audience": "student", "audience_label": "Для студентов",
        "date": "Каждую пятницу", "time": "19:00 — 21:30",
        "location": "Ломоносова, 9, актовый зал", "country": "RU",
        "description": "Актёрское мастерство, импровизация и постановка спектаклей. Готовим ежегодное шоу для студенческого фестиваля.",
        "emoji": "🎭", "color": "#F59E0B",
    },
    {
        "id": 15, "title": "Лекция «Космос и технологии»", "university": "МГУ",
        "type": "lecture", "type_label": "Лекция",
        "audience": "all", "audience_label": "Для всех",
        "date": "8 мая", "time": "15:00 — 17:00",
        "location": "Физический факультет, Большая аудитория", "country": "RU",
        "description": "От спутников до Марса: как современные технологии меняют космическую отрасль. Спикер — инженер РКК «Энергия».",
        "emoji": "🚀", "color": "#3B82F6",
    },
    # ─── International Events ───
    {
        "id": 16, "title": "Open House", "university": "MIT",
        "type": "open_day", "type_label": "Open Day",
        "audience": "applicant", "audience_label": "For applicants",
        "date": "April 20", "time": "09:00 — 17:00",
        "location": "77 Massachusetts Ave, Cambridge, MA", "country": "US",
        "description": "Explore MIT's world-renowned engineering and science programs. Campus tours, lab demos, and Q&A with admissions officers.",
        "emoji": "🎓", "color": "#E6393F",
    },
    {
        "id": 17, "title": "AI & Machine Learning Workshop", "university": "Stanford",
        "type": "workshop", "type_label": "Workshop",
        "audience": "all", "audience_label": "For everyone",
        "date": "April 25", "time": "10:00 — 16:00",
        "location": "Gates Computer Science Building, Stanford, CA", "country": "US",
        "description": "Hands-on workshop on modern AI techniques. Build and train neural networks using PyTorch. Led by Stanford AI Lab researchers.",
        "emoji": "🤖", "color": "#E05A50",
    },
    {
        "id": 18, "title": "Inter-University Debate Tournament", "university": "Oxford",
        "type": "club", "type_label": "Club",
        "audience": "student", "audience_label": "For students",
        "date": "May 3", "time": "14:00 — 20:00",
        "location": "Oxford Union, St Michael's St, Oxford", "country": "UK",
        "description": "Annual debate tournament at the legendary Oxford Union. Topics span politics, ethics, and technology. Teams of 2-3.",
        "emoji": "🗣️", "color": "#4A90D9",
    },
    {
        "id": 19, "title": "Cambridge Science Festival", "university": "Cambridge",
        "type": "lecture", "type_label": "Lecture",
        "audience": "all", "audience_label": "For everyone",
        "date": "April 28 — May 2", "time": "10:00 — 18:00",
        "location": "Various venues across Cambridge, UK", "country": "UK",
        "description": "A week of science talks, demos, and exhibitions. From quantum physics to genomics, explore cutting-edge research made accessible.",
        "emoji": "🔬", "color": "#75C9A8",
    },
    {
        "id": 20, "title": "Quantum Computing Masterclass", "university": "ETH Zurich",
        "type": "workshop", "type_label": "Workshop",
        "audience": "student", "audience_label": "For students",
        "date": "May 8", "time": "09:00 — 17:00",
        "location": "ETH Zentrum, Rämistrasse 101, Zürich", "country": "CH",
        "description": "Deep dive into quantum algorithms and IBM Qiskit framework. Build quantum circuits and run experiments on real quantum hardware.",
        "emoji": "⚛️", "color": "#5B9BD5",
    },
    {
        "id": 21, "title": "Open Campus Day", "university": "Tsinghua",
        "type": "open_day", "type_label": "Open Day",
        "audience": "applicant", "audience_label": "For applicants",
        "date": "April 22", "time": "08:30 — 17:00",
        "location": "Tsinghua University, Haidian District, Beijing", "country": "CN",
        "description": "Tour one of China's most prestigious universities. Information sessions on international programs, scholarship opportunities, and campus life.",
        "emoji": "🎓", "color": "#C084FC",
    },
    {
        "id": 22, "title": "Robotics & AI Frontiers Lecture", "university": "U of Tokyo",
        "type": "lecture", "type_label": "Lecture",
        "audience": "all", "audience_label": "For everyone",
        "date": "May 5", "time": "15:00 — 17:30",
        "location": "Hongo Campus, Bunkyo-ku, Tokyo", "country": "JP",
        "description": "Leading researchers present breakthroughs in humanoid robotics and embodied AI. Live demo of the latest bipedal robot prototype.",
        "emoji": "🦾", "color": "#5DADE2",
    },
    {
        "id": 23, "title": "Automotive Engineering Workshop", "university": "TU Munich",
        "type": "workshop", "type_label": "Workshop",
        "audience": "student", "audience_label": "For students",
        "date": "May 10", "time": "10:00 — 16:00",
        "location": "Arcisstraße 21, München", "country": "DE",
        "description": "Design and simulate electric vehicle powertrains with TUM Motorsport team engineers. Hands-on with CAD and simulation tools.",
        "emoji": "🏎️", "color": "#3498DB",
    },
    {
        "id": 24, "title": "Philosophy & AI Ethics Lecture", "university": "Sorbonne",
        "type": "lecture", "type_label": "Lecture",
        "audience": "all", "audience_label": "For everyone",
        "date": "May 12", "time": "18:00 — 20:00",
        "location": "Amphithéâtre Richelieu, La Sorbonne, Paris", "country": "FR",
        "description": "Can machines think? A philosophical exploration of consciousness, creativity, and moral responsibility in the age of artificial intelligence.",
        "emoji": "💭", "color": "#E8A838",
    },
    {
        "id": 25, "title": "AI Hackathon «FutureNet»", "university": "KAIST",
        "type": "workshop", "type_label": "Workshop",
        "audience": "student", "audience_label": "For students",
        "date": "May 15 — 17", "time": "09:00 — 21:00",
        "location": "KAIST Campus, Daejeon, South Korea", "country": "KR",
        "description": "72-hour hackathon focused on next-gen networking and edge AI. $50,000 prize pool. Open to international teams of 3-5.",
        "emoji": "💻", "color": "#2ECC71",
    },
    # ─── Hackathons ───
    {
        "id": 26, "title": "HackMIT", "university": "MIT",
        "type": "workshop", "type_label": "Hackathon",
        "audience": "student", "audience_label": "For students",
        "date": "May 20 — 22", "time": "18:00 — 18:00",
        "location": "MIT Media Lab, Cambridge, MA", "country": "US",
        "description": "MIT's flagship annual hackathon. 1000+ hackers build projects over 36 hours. Tracks: AI, Health, Climate, FinTech. $100K in prizes and API credits.",
        "emoji": "🏆", "color": "#E6393F",
    },
    {
        "id": 27, "title": "Хакатон «Цифровой прорыв»", "university": "МГУ",
        "type": "workshop", "type_label": "Хакатон",
        "audience": "all", "audience_label": "Для всех",
        "date": "10 — 12 мая", "time": "10:00 — 22:00",
        "location": "Главное здание МГУ, Ленинские горы", "country": "RU",
        "description": "Всероссийский хакатон по разработке цифровых решений для образования. Призовой фонд 1 000 000 ₽. Команды от 2 до 5 человек.",
        "emoji": "🚀", "color": "#3B82F6",
    },
    {
        "id": 28, "title": "OxHack — Social Good", "university": "Oxford",
        "type": "workshop", "type_label": "Hackathon",
        "audience": "student", "audience_label": "For students",
        "date": "May 24 — 25", "time": "09:00 — 21:00",
        "location": "Mathematical Institute, Oxford", "country": "UK",
        "description": "Build tech for social impact in 24 hours. Themes: accessibility, sustainability, education equality. Mentors from Google DeepMind and Oxford CS.",
        "emoji": "🌍", "color": "#4A90D9",
    },
    {
        "id": 29, "title": "Хакатон «SmartCity»", "university": "МГТУ",
        "type": "workshop", "type_label": "Хакатон",
        "audience": "student", "audience_label": "Для студентов",
        "date": "17 — 19 мая", "time": "09:00 — 21:00",
        "location": "Технопарк МГТУ, 2-я Бауманская", "country": "RU",
        "description": "Хакатон по IoT-решениям для умного города: транспорт, энергетика, безопасность. Партнёры — Яндекс и Сбер. Призовой фонд 750 000 ₽.",
        "emoji": "🏙️", "color": "#EF4444",
    },
    {
        "id": 30, "title": "TreeHacks", "university": "Stanford",
        "type": "workshop", "type_label": "Hackathon",
        "audience": "student", "audience_label": "For students",
        "date": "May 30 — Jun 1", "time": "17:00 — 15:00",
        "location": "Huang Engineering Center, Stanford, CA", "country": "US",
        "description": "Stanford's premier hackathon. 1500 hackers, 36 hours, endless possibilities. Focus tracks: Healthcare, Sustainability, Education. Top prizes include internship offers.",
        "emoji": "🌲", "color": "#E05A50",
    },
]


@app.route("/")
def index():
    return render_template("index.html", user=CURRENT_USER)


@app.route("/api/events")
def get_events():
    university = request.args.get("university")
    event_type = request.args.get("type")
    audience = request.args.get("audience")
    country = request.args.get("country")

    filtered = EVENTS
    if university:
        filtered = [e for e in filtered if e["university"] == university]
    if event_type:
        filtered = [e for e in filtered if e["type"] == event_type]
    if audience and audience != "all":
        filtered = [
            e for e in filtered
            if e["audience"] == audience or e["audience"] == "all"
        ]
    if country:
        filtered = [e for e in filtered if e["country"] == country]

    # Mark registered events
    user_event_ids = [
        r["event_id"] for r in registrations if r["user_id"] == CURRENT_USER["id"]
    ]
    result = []
    for e in filtered:
        ev = dict(e)
        ev["registered"] = e["id"] in user_event_ids
        result.append(ev)

    return jsonify(result)


@app.route("/api/user")
def get_user():
    return jsonify(CURRENT_USER)


@app.route("/api/user/update", methods=["POST"])
def update_user():
    data = request.json
    if "name" in data:
        CURRENT_USER["name"] = data["name"]
    if "email" in data:
        CURRENT_USER["email"] = data["email"]
    if "phone" in data:
        CURRENT_USER["phone"] = data["phone"]
    return jsonify({"success": True, "user": CURRENT_USER})


@app.route("/api/register", methods=["POST"])
def register():
    data = request.json
    event_id = data.get("event_id")
    name = data.get("name")
    email = data.get("email")
    role = data.get("role")

    if not all([event_id, name, email, role]):
        return jsonify({"error": "Заполните все поля"}), 400

    for reg in registrations:
        if reg["event_id"] == event_id and reg["user_id"] == CURRENT_USER["id"]:
            return jsonify({"error": "Вы уже зарегистрированы на это мероприятие"}), 400

    event = next((e for e in EVENTS if e["id"] == event_id), None)
    if not event:
        return jsonify({"error": "Мероприятие не найдено"}), 404

    registration = {
        "id": len(registrations) + 1,
        "user_id": CURRENT_USER["id"],
        "event_id": event_id,
        "name": name,
        "email": email,
        "role": role,
    }
    registrations.append(registration)

    return jsonify({"success": True, "registration": registration})


@app.route("/api/cancel", methods=["POST"])
def cancel_registration():
    data = request.json
    event_id = data.get("event_id")

    global registrations
    before = len(registrations)
    registrations = [
        r
        for r in registrations
        if not (r["event_id"] == event_id and r["user_id"] == CURRENT_USER["id"])
    ]

    if len(registrations) == before:
        return jsonify({"error": "Регистрация не найдена"}), 404

    return jsonify({"success": True})


@app.route("/api/my-events")
def my_events():
    user_event_ids = [
        r["event_id"] for r in registrations if r["user_id"] == CURRENT_USER["id"]
    ]
    result = [dict(e) for e in EVENTS if e["id"] in user_event_ids]
    for ev in result:
        ev["registered"] = True
    return jsonify(result)


@app.route("/api/ai-recommend", methods=["POST"])
def ai_recommend():
    data = request.json
    message = data.get("message", "")
    lang = data.get("lang", "ru")

    try:
        if not api_key:
            raise ValueError("GOOGLE_API_KEY not configured")

        events_context = json.dumps(
            [
                {
                    "id": e["id"],
                    "title": e["title"],
                    "university": e["university"],
                    "type_label": e["type_label"],
                    "audience_label": e["audience_label"],
                    "date": e["date"],
                    "description": e["description"],
                    "country": e["country"],
                }
                for e in EVENTS
            ],
            ensure_ascii=False,
        )

        user_event_ids = [
            r["event_id"] for r in registrations if r["user_id"] == CURRENT_USER["id"]
        ]
        user_registered_events = json.dumps(
            [
                {"id": e["id"], "title": e["title"], "university": e["university"]}
                for e in EVENTS if e["id"] in user_event_ids
            ],
            ensure_ascii=False,
        )

        lang_instruction = {
            "ru": "Отвечай на русском языке.",
            "en": "Respond in English.",
            "es": "Responde en español.",
            "cn": "用中文回答。",
        }.get(lang, "Отвечай на русском языке.")

        system_instruction = (
            "Ты — умный ассистент по университетским мероприятиям на платформе VuzTime. "
            "Помогай студентам и абитуриентам найти интересные мероприятия. "
            "Рекомендуй конкретные мероприятия из списка, объясняй почему они подходят. "
            "Отвечай кратко, дружелюбно, используй эмодзи.\n"
            f"{lang_instruction}\n\n"
            "ВАЖНО: Когда рекомендуешь мероприятия, ОБЯЗАТЕЛЬНО упоминай их ID в формате [[EVENT:id]]. "
            "Например: 'Рекомендую посетить День открытых дверей МГУ [[EVENT:1]] — отличная возможность!'\n"
            "Всегда включай [[EVENT:id]] для каждого рекомендованного мероприятия.\n\n"
            f"Текущий пользователь уже записан на следующие мероприятия: {user_registered_events}\n"
            "Обязательно учитывай это: не предлагай то, куда он уже записан, но учитывай эти интересы (например, если записан на хакатон, предложи другой хакатон или IT-событие).\n\n"
            f"Доступные мероприятия:\n{events_context}"
        )

        response = client.models.generate_content(
            model="gemini-2.5-flash-lite",
            contents=message,
            config=types.GenerateContentConfig(
                system_instruction=system_instruction
            ),
        )

        response_text = response.text or ""

        # Extract event IDs from [[EVENT:id]] markers
        event_ids = [int(m) for m in re.findall(r"\[\[EVENT:(\d+)\]\]", response_text)]
        # Clean markers from text
        clean_text = re.sub(r"\s*\[\[EVENT:\d+\]\]\s*", " ", response_text).strip()

        recommended = [dict(e) for e in EVENTS if e["id"] in event_ids]

        return jsonify({
            "response": clean_text,
            "recommended_events": recommended,
        })

    except Exception as e:
        traceback.print_exception(e)
        return (
            jsonify(
                {
                    "response": (
                        "К сожалению, ИИ-ассистент сейчас недоступен "
                        f"({type(e).__name__}). "
                        "Попробуйте позже или просмотрите мероприятия в каталоге!"
                    ),
                    "recommended_events": [],
                }
            ),
            200,
        )


if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)
