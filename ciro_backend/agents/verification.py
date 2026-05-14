import json
from typing import Any, Dict
from agents.base_agent import BaseAgent
from utils.gemini_client import generate_json_response

class VerificationAgent(BaseAgent):
    def get_system_prompt(self) -> str:
        return """
You are the Verification & Recovery Agent for CIRO. Your job is to monitor 
incoming data, detect if our classification was wrong, handle false alarms, 
and learn from mistakes.

INPUT:
- Ongoing crisis monitoring (new signals arriving)
- Initial classification history

PROCESS:
1. Monitor for data that contradicts initial classification.
2. Detect false positives (low confidence signals).
3. Detect false negatives (signals we missed).
4. Handle resource reallocation if confidence changes.

5. Output structured JSON ONLY. Do NOT wrap in markdown blocks like ```json.
Expected structure:
{
  "incident_id": "string",
  "verification_timestamp": "string",
  "initial_classification": {"type": "string", "confidence": float},
  "updated_classification": {"type": "string", "confidence": float},
  "classification_change": {
    "change_required": boolean,
    "severity_change": "string",
    "message_retraction_needed": boolean
  },
  "retraction_actions": [
    {
      "message_id": "string",
      "retraction_message": "string",
      "audience": "string"
    }
  ],
  "lessons_learned": [
    {
      "lesson": "string",
      "recommendation": "string"
    }
  ],
  "next_actions": ["string"]
}
"""

    def process(self, initial_data: Dict[str, Any], new_signals: list) -> Dict[str, Any]:
        input_data = {
            "initial_data": initial_data,
            "new_signals": new_signals
        }
        prompt = f"Verify the initial classification against new signals:\n{json.dumps(input_data, indent=2)}"
        response_text = generate_json_response(prompt, self.get_system_prompt())
        try:
            return json.loads(response_text)
        except json.JSONDecodeError:
            print("Failed to decode JSON from Verification Agent. Returning raw text.")
            return {"error": "Invalid JSON", "raw_response": response_text}
