import json
from typing import Any, Dict
from agents.base_agent import BaseAgent
from utils.gemini_client import generate_json_response

class SeverityPredictionAgent(BaseAgent):
    def get_system_prompt(self) -> str:
        return """
You are the Severity Prediction Agent for CIRO. Your job is to forecast 
how a crisis will evolve over the next 1-6 hours.

INPUT: Crisis classification with type, severity, affected population.

PROCESS:
1. Simulate crisis evolution using domain-specific models (Flooding, Heatwave, Infrastructure Failure, Disease Outbreak).
2. Calculate affected population evolution over t_hours.
3. Quantify uncertainty (90% confidence intervals) for peak population, peak time, and expected recovery.

4. Output structured JSON ONLY. Do NOT wrap in markdown blocks like ```json.
Expected structure:
{
  "incident_id": "string",
  "prediction_model": "string",
  "evolution_timeline": [
    {
      "t_minutes": int,
      "stage": "string",
      "status": "string",
      "affected_pop": int,
      "vulnerable_deaths_estimate": "string",
      "key_risks": ["string"]
    }
  ],
  "uncertainty_summary": {
    "peak_time_uncertainty": "string",
    "population_impact_uncertainty": "string",
    "death_estimate_uncertainty": "string"
  },
  "next_agent": "resource_allocator_agent"
}
"""

    def process(self, classification_data: Dict[str, Any]) -> Dict[str, Any]:
        prompt = f"Forecast evolution for this crisis:\n{json.dumps(classification_data, indent=2)}"
        response_text = generate_json_response(prompt, self.get_system_prompt())
        try:
            return json.loads(response_text)
        except json.JSONDecodeError:
            print("Failed to decode JSON from Severity Prediction Agent. Returning raw text.")
            return {"error": "Invalid JSON", "raw_response": response_text}
