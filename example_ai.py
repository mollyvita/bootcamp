from yandex_ai_studio_sdk import AIStudio

sdk = AIStudio(
    folder_id="YANDEX_FOLDER_ID",
    auth="YANDEX_API_KEY",
)
model = sdk.models.completions('yandexgpt-lite')
model.configure(
    temperature=0.3,
    max_tokens=2000,
)

system_prompt = 'Ты ассистент программиста. Напиши короткую программу-пример на указанном языке программирования. В ответе пришли только код.'
user_prompt = "F#"
messages = [
    {'role': 'system', 'text': system_prompt},
    {'role': 'user', 'text': user_prompt},
]

operation = model.run_deferred(messages)
result = operation.wait()
print(result.text)
