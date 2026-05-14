import json
from typing import Any, Dict
from agents.base_agent import BaseAgent
from utils.gemini_client import generate_json_response

class NotifierAgent(BaseAgent):
    def get_system_prompt(self) -> str:
        return """
You are the Notifier Agent for CIRO. Your job is to craft and deliver 
tailored messages to each stakeholder group at the right time.

INPUT:
- Crisis classification + action simulation results

PROCESS:
1. Generate stakeholder-specific messages (Public, Responders, Hospital, Utility).
2. Implement staged alerting for public.
3. Schedule message delivery over time.

4. Output structured JSON ONLY. Do NOT wrap in markdown blocks like ```json.
Expected structure:
{
  "incident_id": "string",
  "notification_plan": [
    {
      "timestamp": "string",
      "message_id": "string",
      "audience": "string",
      "confidence_required": float,
      "current_confidence": float,
      "status": "READY_TO_SEND",
      "message_text": "string",
      "language": "string",
      "delivery_method": "string",
      "expected_delivery_time": "string"
    }
  ],
  "scheduled_updates": [
    {"timestamp": "string", "message_id": "string", "type": "string"}
  ],
  "retraction_plan": {
    "trigger": "string",
    "message": "string"
  },
  "next_agent": "verification_agent"
}
"""

    def process(self, simulation_data: Dict[str, Any]) -> Dict[str, Any]:
        prompt = f"Create a notification plan based on this simulation:\n{json.dumps(simulation_data, indent=2)}"
        response_text = generate_json_response(prompt, self.get_system_prompt())
        try:
            return json.loads(response_text)
        except json.JSONDecodeError:
            print("Failed to decode JSON from Notifier Agent. Returning raw text.")
            return {"error": "Invalid JSON", "raw_response": response_text}
