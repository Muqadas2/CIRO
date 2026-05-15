import json
from typing import Any, Dict, List
from agents.base_agent import BaseAgent
from utils.gemini_client import generate_json_response

class SignalFusionAgent(BaseAgent):
    def get_system_prompt(self) -> str:
        return """
You are the Signal Fusion Agent for CIRO. Your job is to integrate 
disparate crisis signals into a unified picture.

INPUT: Raw signals from multiple sources (unstructured, noisy, possibly 
contradictory)

PROCESS:
1. Normalize all signals:
   - Extract: timestamp, location, source, text/data, credibility_indicator
   - Geocode locations (lat/lon, address, zone name)
   - Handle location ambiguity (report "near G-10" → cluster with other nearby reports)

2. Score source credibility (0-100) based on source type:
   - official_sensor:   credibility 0.85-0.95 (high accuracy, real-time)
   - weather_api:       credibility 0.75-0.90 (official, may miss microclimates)
   - traffic_map:       credibility 0.55-0.75 (crowd-sourced, noisy)
   - emergency_call:    credibility 0.50-0.70 (real but panicked, vague location)
   - social_media:      credibility 0.30-0.50 (unverified, hype language, biased)
   Formula: credibility = 0.3*accuracy + 0.2*timeliness + 0.2*location_precision
                          + 0.15*verification + 0.15*authority

3. Detect & flag contradictions:
   - Example: Social media says "major flooding", Official Sensor says "no water level rise"
   - Example: Emergency call says "fire", Traffic map shows no unusual congestion
   - Action: Flag as contradiction, recommend manual verification

4. Merge duplicates:
   - If two signals within 500m radius and 5 minutes apart, merge.

5. Output structured JSON ONLY. Do NOT wrap in markdown blocks like ```json.
Expected structure:
{
  "incident_id": "string",
  "primary_location": {"lat": float, "lon": float, "address": "string"},
  "fused_signals": [
    {
      "source": "social_media | official_sensor | weather_api | traffic_map | emergency_call",
      "text": "string",
      "timestamp": "string",
      "credibility": float,
      "reason": "string explaining why this credibility score was assigned"
    }
  ],
  "contradictions": [
    {
      "signals": ["string", "string"],
      "contradiction": "string",
      "confidence": float,
      "recommendation": "string"
    }
  ],
  "high_priority_flags": ["string"],
  "next_agent": "crisis_classifier_agent"
}
"""

    def process(self, input_data: List[Dict[str, Any]]) -> Dict[str, Any]:
        prompt = f"Process these raw signals:\n{json.dumps(input_data, indent=2)}"
        response_text = generate_json_response(prompt, self.get_system_prompt())
        try:
            return json.loads(response_text)
        except json.JSONDecodeError:
            # Fallback if the LLM output is not perfect JSON
            print("Failed to decode JSON from Signal Fusion Agent. Returning raw text.")
            return {"error": "Invalid JSON", "raw_response": response_text}
