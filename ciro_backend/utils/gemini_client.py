import os
from google import genai
from google.genai import types

def get_gemini_client():
    # Make sure to set GEMINI_API_KEY in your environment or .env file
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        print("WARNING: GEMINI_API_KEY is not set. The models will fail.")
    return genai.Client(api_key=api_key)

def generate_json_response(prompt: str, system_instruction: str = None) -> str:
    client = get_gemini_client()
    
    # We use gemini-2.5-flash as the default for speed and intelligence
    model_id = "gemini-2.5-flash"
    
    config = types.GenerateContentConfig(
        response_mime_type="application/json",
        temperature=0.2, # Low temp for more deterministic output
    )
    if system_instruction:
        config.system_instruction = system_instruction

    response = client.models.generate_content(
        model=model_id,
        contents=prompt,
        config=config,
    )
    return response.text
