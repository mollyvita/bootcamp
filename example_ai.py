from google import genai
from google.genai import types
from dotenv import load_dotenv
import os

load_dotenv()
api_key = os.environ.get("GOOGLE_API_KEY", "")

client = genai.Client(api_key=api_key)

config = types.GenerateContentConfig(
    temperature=0.3,
    top_p=0.95,
    top_k=40,
    max_output_tokens=2000,
    response_mime_type="text/plain",
    system_instruction="Ты ассистент программиста. Напиши короткую программу-пример на указанном языке программирования. В ответе пришли только код.",
)

user_prompt = "F#"
response = client.models.generate_content(
    model="gemini-2.5-flash",
    contents=user_prompt,
    config=config
)

print(response.text)
