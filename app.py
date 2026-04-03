from flask import Flask, render_template, jsonify, request
import json
import os

app = Flask(__name__)

# Mock current user (auth to be added later)
CURRENT_USER = {"id": 1, "name": "Алексей Петров", "email": "alex@example.com"}

# In-memory registration store
registrations = []

UNIVERSITIES = {
    "МГУ": {"color": "#3B82F6", "full": "Московский государственный университет"},
    "МФТИ": {"color": "#10B981", "full": "Московский физико-технический институт"},
    "ВШЭ": {"color": "#8B5CF6", "full": "Высшая школа экономики"},
    "МГТУ": {"color": "#EF4444", "full": "МГТУ им. Н.Э. Баумана"},
    "ИТМО": {"color": "#F59E0B", "full": "Университет ИТМО"},
}

EVENTS = [
    {
        "id": 1,
        "title": "День открытых дверей",
        "university": "МГУ",
        "type": "open_day",
        "type_label": "День открытых дверей",
        "audience": "applicant",
        "audience_label": "Для абитуриентов",
        "date": "15 апреля",
        "time": "10:00 — 16:00",
        "location": "Главное здание МГУ, Ленинские горы",
        "description": "Познакомьтесь с факультетами МГУ, узнайте о программах обучения и задайте вопросы преподавателям. Презентации факультетов, экскурсии по кампусу и консультации приёмной комиссии.",
        "emoji": "🎓",
        "color": "#3B82F6",
    },
    {
        "id": 2,
        "title": "Робототехнический клуб",
        "university": "МФТИ",
        "type": "club",
        "type_label": "Клуб по интересам",
        "audience": "student",
        "audience_label": "Для студентов",
        "date": "Каждый четверг",
        "time": "18:00 — 20:00",
        "location": "Корпус прикладной математики, ауд. 305",
        "description": "Проектируем и программируем роботов, участвуем в соревнованиях RoboCup. Опыт не требуется — научим всему с нуля!",
        "emoji": "🤖",
        "color": "#10B981",
    },
    {
        "id": 3,
        "title": "Лекция «ИИ в медицине»",
        "university": "ВШЭ",
        "type": "lecture",
        "type_label": "Лекция",
        "audience": "all",
        "audience_label": "Для всех",
        "date": "20 апреля",
        "time": "14:00 — 16:00",
        "location": "Покровский бульвар, ауд. R505",
        "description": "Профессор Ковалёв расскажет о применении нейросетей в диагностике заболеваний и перспективах цифровой медицины.",
        "emoji": "🧠",
        "color": "#8B5CF6",
    },
    {
        "id": 4,
        "title": "День открытых дверей",
        "university": "МГТУ",
        "type": "open_day",
        "type_label": "День открытых дверей",
        "audience": "applicant",
        "audience_label": "Для абитуриентов",
        "date": "18 апреля",
        "time": "11:00 — 17:00",
        "location": "2-я Бауманская, д. 5",
        "description": "Узнайте об инженерных специальностях МГТУ, посетите лаборатории и пообщайтесь со студентами. Мастер-классы по 3D-моделированию.",
        "emoji": "🎓",
        "color": "#EF4444",
    },
    {
        "id": 5,
        "title": "Клуб дебатов",
        "university": "ВШЭ",
        "type": "club",
        "type_label": "Клуб по интересам",
        "audience": "student",
        "audience_label": "Для студентов",
        "date": "Каждую среду",
        "time": "19:00 — 21:00",
        "location": "Мясницкая, 20, ауд. 309",
        "description": "Оттачиваем навыки аргументации и публичных выступлений. Готовимся к межвузовским чемпионатам по парламентским дебатам.",
        "emoji": "🗣️",
        "color": "#8B5CF6",
    },
    {
        "id": 6,
        "title": "Хакатон «CodeSprint»",
        "university": "ИТМО",
        "type": "workshop",
        "type_label": "Мастер-класс",
        "audience": "student",
        "audience_label": "Для студентов",
        "date": "1 — 3 мая",
        "time": "10:00 — 22:00",
        "location": "Кронверкский пр., 49, коворкинг",
        "description": "48-часовой хакатон по разработке AI-решений для городской среды. Призовой фонд 500 000 ₽. Команды 3-5 человек.",
        "emoji": "💻",
        "color": "#F59E0B",
    },
    {
        "id": 7,
        "title": "Мастер-класс «Веб-разработка»",
        "university": "МФТИ",
        "type": "workshop",
        "type_label": "Мастер-класс",
        "audience": "all",
        "audience_label": "Для всех",
        "date": "22 апреля",
        "time": "15:00 — 18:00",
        "location": "Институтский пер., 9, ауд. 115",
        "description": "Создадим полноценное веб-приложение на React за 3 часа. Узнаете о современных подходах к фронтенд-разработке.",
        "emoji": "🌐",
        "color": "#10B981",
    },
    {
        "id": 8,
        "title": "День открытых дверей",
        "university": "ИТМО",
        "type": "open_day",
        "type_label": "День открытых дверей",
        "audience": "applicant",
        "audience_label": "Для абитуриентов",
        "date": "25 апреля",
        "time": "12:00 — 18:00",
        "location": "Кронверкский пр., 49",
        "description": "Откройте для себя IT-специальности ИТМО: программирование, кибербезопасность, Data Science. Лучший IT-вуз страны ждёт вас!",
        "emoji": "🎓",
        "color": "#F59E0B",
    },
    {
        "id": 9,
        "title": "Фотоклуб",
        "university": "МГУ",
        "type": "club",
        "type_label": "Клуб по интересам",
        "audience": "student",
        "audience_label": "Для студентов",
        "date": "Каждый вторник",
        "time": "17:00 — 19:00",
        "location": "Ломоносовский корпус, ком. 218",
        "description": "Изучаем фотографию от основ композиции до продвинутой обработки. Регулярные фотопрогулки по Москве и выставки работ.",
        "emoji": "📸",
        "color": "#3B82F6",
    },
    {
        "id": 10,
        "title": "Лекция «Квантовые вычисления»",
        "university": "МФТИ",
        "type": "lecture",
        "type_label": "Лекция",
        "audience": "all",
        "audience_label": "Для всех",
        "date": "28 апреля",
        "time": "16:00 — 18:00",
        "location": "Институтский пер., 9, ауд. 201",
        "description": "Как работают квантовые компьютеры, зачем они нужны и когда станут частью повседневной жизни. Лекция для широкой аудитории.",
        "emoji": "⚛️",
        "color": "#10B981",
    },
    {
        "id": 11,
        "title": "Шахматный клуб",
        "university": "МГТУ",
        "type": "club",
        "type_label": "Клуб по интересам",
        "audience": "student",
        "audience_label": "Для студентов",
        "date": "Каждый понедельник",
        "time": "18:30 — 20:30",
        "location": "ГЗ, комн. 501",
        "description": "Шахматы для всех уровней: от новичков до разрядников. Еженедельные турниры, разбор партий и подготовка к студенческим чемпионатам.",
        "emoji": "♟️",
        "color": "#EF4444",
    },
    {
        "id": 12,
        "title": "Мастер-класс «Data Science»",
        "university": "ВШЭ",
        "type": "workshop",
        "type_label": "Мастер-класс",
        "audience": "all",
        "audience_label": "Для всех",
        "date": "5 мая",
        "time": "14:00 — 17:00",
        "location": "Покровский бульвар, ауд. L401",
        "description": "Практический мастер-класс по анализу данных на Python. Поработаем с реальными датасетами и построим модели предсказания.",
        "emoji": "📊",
        "color": "#8B5CF6",
    },
    {
        "id": 13,
        "title": "День открытых дверей",
        "university": "ВШЭ",
        "type": "open_day",
        "type_label": "День открытых дверей",
        "audience": "applicant",
        "audience_label": "Для абитуриентов",
        "date": "30 апреля",
        "time": "10:00 — 15:00",
        "location": "Покровский бульвар, 11",
        "description": "Факультеты экономики, менеджмента, права и компьютерных наук ВШЭ приглашают абитуриентов. Индивидуальные консультации и тест-драйв лекций.",
        "emoji": "🎓",
        "color": "#8B5CF6",
    },
    {
        "id": 14,
        "title": "Театральная студия",
        "university": "ИТМО",
        "type": "club",
        "type_label": "Клуб по интересам",
        "audience": "student",
        "audience_label": "Для студентов",
        "date": "Каждую пятницу",
        "time": "19:00 — 21:30",
        "location": "Ломоносова, 9, актовый зал",
        "description": "Актёрское мастерство, импровизация и постановка спектаклей. Готовим ежегодное шоу для студенческого фестиваля.",
        "emoji": "🎭",
        "color": "#F59E0B",
    },
    {
        "id": 15,
        "title": "Лекция «Космос и технологии»",
        "university": "МГУ",
        "type": "lecture",
        "type_label": "Лекция",
        "audience": "all",
        "audience_label": "Для всех",
        "date": "8 мая",
        "time": "15:00 — 17:00",
        "location": "Физический факультет, Большая аудитория",
        "description": "От спутников до Марса: как современные технологии меняют космическую отрасль. Спикер — инженер РКК «Энергия».",
        "emoji": "🚀",
        "color": "#3B82F6",
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

    try:
        from yandex_ai_studio_sdk import AIStudio

        folder_id = os.environ.get("YANDEX_FOLDER_ID", "")
        api_key = os.environ.get("YANDEX_API_KEY", "")

        if not folder_id or not api_key:
            raise ValueError("API keys not configured")

        sdk = AIStudio(folder_id=folder_id, auth=api_key)
        model = sdk.models.completions("yandexgpt-lite")
        model.configure(temperature=0.3, max_tokens=2000)

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
                }
                for e in EVENTS
            ],
            ensure_ascii=False,
        )

        system_prompt = (
            "Ты — умный ассистент по университетским мероприятиям на платформе UniVent. "
            "Помогай студентам и абитуриентам найти интересные мероприятия. "
            "Рекомендуй конкретные мероприятия из списка, объясняй почему они подходят. "
            "Отвечай кратко, дружелюбно, используй эмодзи.\n\n"
            f"Доступные мероприятия:\n{events_context}"
        )

        messages = [
            {"role": "system", "text": system_prompt},
            {"role": "user", "text": message},
        ]

        operation = model.run_deferred(messages)
        result = operation.wait()

        return jsonify({"response": result.text})

    except Exception as e:
        return (
            jsonify(
                {
                    "response": (
                        "К сожалению, ИИ-ассистент сейчас недоступен "
                        f"({type(e).__name__}). "
                        "Попробуйте позже или просмотрите мероприятия в каталоге!"
                    )
                }
            ),
            200,
        )


if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)
