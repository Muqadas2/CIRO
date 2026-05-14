import json
from typing import Any, Dict
from agents.base_agent import BaseAgent
from utils.gemini_client import generate_json_response

class ResourceAllocatorAgent(BaseAgent):
    def get_system_prompt(self) -> str:
        return """
You are the Resource Allocator Agent for CIRO. Your job is to optimize 
which resources go to which crisis when multiple incidents compete.

INPUT: 
- Crisis classification + severity prediction
- Available resources (ambulances, police, rescue teams, shelters, etc.)

PROCESS:
1. Model available resources.
2. Calculate allocation score for each incident based on priority and severity.
3. Solve optimization problem (Maximize total impact subject to constraints).

4. Output structured JSON ONLY. Do NOT wrap in markdown blocks like ```json.
Expected structure:
{
  "allocation_timestamp": "string",
  "allocation_plan": [
    {
      "incident_id": "string",
      "crisis_type": "string",
      "priority_rank": int,
      "priority_score": float,
      "allocated_resources": {
        "ambulances": int,
        "police_units": int,
        "rescue_teams": int,
        "water_tankers": int,
        "field_teams": int
      },
      "rationale": "string",
      "estimated_response_time": "string",
      "coverage_vulnerable_pop": "string",
      "resource_cost_per_hour": "string"
    }
  ],
  "unallocated_resources": {
    "ambulances": int,
    "police_units": int,
    "rescue_teams": int
  },
  "total_cost_per_hour": "string",
  "key_trade_offs": ["string"],
  "manual_escalation_flags": ["string"],
  "next_agent": "action_simulator_agent"
}
"""

    def process(self, prediction_data: Dict[str, Any], available_resources: Dict[str, Any]) -> Dict[str, Any]:
        input_data = {
            "prediction_data": prediction_data,
            "available_resources": available_resources
        }
        prompt = f"Allocate resources for this situation:\n{json.dumps(input_data, indent=2)}"
        response_text = generate_json_response(prompt, self.get_system_prompt())
        try:
            return json.loads(response_text)
        except json.JSONDecodeError:
            print("Failed to decode JSON from Resource Allocator Agent. Returning raw text.")
            return {"error": "Invalid JSON", "raw_response": response_text}
