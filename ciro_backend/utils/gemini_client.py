import os
from dotenv import load_dotenv
from google import genai
from google.genai import types

load_dotenv()

def get_gemini_client():
    # Make sure to set GEMINI_API_KEY in your environment or .env file
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        print("WARNING: GEMINI_API_KEY is not set. The models will fail.")
    return genai.Client(api_key=api_key)

import time

def generate_json_response(prompt: str, system_instruction: str = None) -> str:
    client = get_gemini_client()
    
    # Primary model and a lighter fallback model
    model_id = "gemini-2.5-flash"
    
    config = types.GenerateContentConfig(
        response_mime_type="application/json",
        temperature=0.2,
    )
    if system_instruction:
        config.system_instruction = system_instruction

    max_retries = 3
    for attempt in range(max_retries):
        try:
            response = client.models.generate_content(
                model=model_id,
                contents=prompt,
                config=config,
            )
            return response.text
        except Exception as e:
            if "503" in str(e) or "high demand" in str(e).lower():
                print(f"  [Gemini] Model busy (503). Retrying in {2**(attempt+1)}s... (Attempt {attempt+1}/{max_retries})")
                time.sleep(2**(attempt+1)) # Exponential backoff
            else:
                raise e
    
    # Final attempt with a fallback model if primary is still busy
    print(f"  [Gemini] Switching to fallback model gemini-2.0-flash...")
    response = client.models.generate_content(
        model="gemini-2.0-flash",
        contents=prompt,
        config=config,
    )
    return response.text
