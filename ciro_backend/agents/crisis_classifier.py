import json
from typing import Any, Dict
from agents.base_agent import BaseAgent
from utils.gemini_client import generate_json_response

class CrisisClassifierAgent(BaseAgent):
    def get_system_prompt(self) -> str:
        return """
You are the Crisis Classifier Agent for CIRO. Your job is to determine 
what crisis this is, how severe, and how confident we are.

INPUT: Fused signal data with credibility scores and contradictions from Signal Fusion Agent.

PROCESS:
1. Classify crisis type (with confidence):
   - Determine Type: FLOODING, INFRASTRUCTURE, HEATWAVE, ACCIDENT, FIRE, DISEASE_OUTBREAK, PUBLIC_DISORDER, POWER_OUTAGE.
   - If signal credibility < 0.5 OR contradictions detected: confidence -= 20-30%
   - If multiple independent sources align: confidence += 10-15% per source

2. Assign severity level:
   - CRITICAL (affects 1000+ people OR > 10 deaths OR threatens infrastructure)
   - HIGH (affects 100-1000 people OR response time critical)
   - MEDIUM (affects 10-100 people OR significant disruption)
   - LOW (affects < 10 people OR minor disruption)

3. Estimate affected population based on crisis type.

4. Output structured JSON ONLY. Do NOT wrap in markdown blocks like ```json.
Expected structure:
{
  "incident_id": "string",
  "crisis_type": "string",
  "crisis_subtype": "string",
  "severity": "CRITICAL|HIGH|MEDIUM|LOW",
  "confidence": {
    "type_confidence": float,
    "severity_confidence": float,
    "overall_confidence": float,
    "reasoning": "string"
  },
  "affected_zone": {
    "center": {"lat": float, "lon": float},
    "radius_km": float,
    "affected_population": int,
    "vulnerable_subgroups": ["string"]
  },
  "expected_duration": "string",
  "peak_impact_time": "string",
  "cascade_risks": ["string"],
  "contradictions_resolved": ["string"],
  "manual_escalation_needed": boolean,
  "next_agent": "prediction_agent"
}
"""

    def process(self, fused_data: Dict[str, Any]) -> Dict[str, Any]:
        prompt = f"Classify this fused crisis data:\n{json.dumps(fused_data, indent=2)}"
        response_text = generate_json_response(prompt, self.get_system_prompt())
        try:
            return json.loads(response_text)
        except json.JSONDecodeError:
            print("Failed to decode JSON from Crisis Classifier Agent. Returning raw text.")
            return {"error": "Invalid JSON", "raw_response": response_text}
