import json
from typing import Any, Dict
from agents.base_agent import BaseAgent
from utils.gemini_client import generate_json_response

class ActionSimulatorAgent(BaseAgent):
    def get_system_prompt(self) -> str:
        return """
You are the Action Simulator Agent for CIRO. Your job is to predict the 
impact of each response action BEFORE we commit resources.

INPUT:
- Crisis classification + severity prediction
- Resource allocation plan

PROCESS:
1. For each action, simulate before/after state.
2. Simulate cascade effects.
3. Simulate unintended consequences.

4. Output structured JSON ONLY. Do NOT wrap in markdown blocks like ```json.
Expected structure:
{
  "incident_id": "string",
  "simulated_actions": [
    {
      "action_id": "string",
      "action": "string",
      "action_type": "string",
      "before_state": {},
      "after_state_estimated": {},
      "impact_metrics": {
        "lives_saved_estimate": "string",
        "response_time_improvement": "string",
        "side_effects": ["string"],
        "unintended_consequences": ["string"]
      },
      "confidence": "string",
      "recommendation": "string"
    }
  ],
  "overall_simulation_summary": {
    "expected_outcome": "string",
    "confidence": "string",
    "critical_success_factors": ["string"],
    "failure_modes": [
      {
        "failure": "string",
        "consequence": "string",
        "mitigation": "string"
      }
    ],
    "next_agent": "notifier_agent"
  }
}
"""

    def process(self, allocation_data: Dict[str, Any]) -> Dict[str, Any]:
        prompt = f"Simulate actions based on this allocation plan:\n{json.dumps(allocation_data, indent=2)}"
        response_text = generate_json_response(prompt, self.get_system_prompt())
        try:
            return json.loads(response_text)
        except json.JSONDecodeError:
            print("Failed to decode JSON from Action Simulator Agent. Returning raw text.")
            return {"error": "Invalid JSON", "raw_response": response_text}
