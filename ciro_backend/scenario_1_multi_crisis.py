import json
import os
from orchestrator import MasterOrchestrator

def run_scenario_1():
    print("======================================================")
    print(" SCENARIO 1: Multi-Crisis with Limited Resources")
    print("======================================================\n")

    # 5 signal sources as per CIRO architecture:
    # 1. Social Media (low credibility - hype), 2. Official Sensors (high credibility)
    # 3. Weather API (high credibility), 4. Traffic Maps (medium credibility)
    # 5. Emergency Calls (medium credibility)
    signals = [
        {
            "source": "social_media",
            "text": "MAJOR FLOODING IN G-10 RIGHT NOW!! Water everywhere, streets submerged!! #Peshawar #Flood",
            "timestamp": "2024-05-14T14:00:00Z",
            "credibility_indicator": "unverified Twitter user, hype language, all caps, no GPS"
        },
        {
            "source": "emergency_call",
            "text": "Multiple panicking callers reporting water on streets in G-10. Some say pipe burst.",
            "timestamp": "2024-05-14T14:05:00Z",
            "credibility_indicator": "unverified callers, high anxiety, vague location"
        },
        {
            "source": "official_sensor",
            "text": "Water pressure sensor 01: Critical pressure drop detected in main line. No area-wide water level rise. Suggests pipe burst NOT surface flooding.",
            "timestamp": "2024-05-14T14:03:00Z",
            "credibility_indicator": "official_sensor_high_accuracy, real-time data"
        },
        {
            "source": "traffic_map",
            "text": "Severe localized congestion near main bazaar in G-10. Cars re-routing around intersection. Possible road obstruction.",
            "timestamp": "2024-05-14T14:10:00Z",
            "credibility_indicator": "crowd_sourced_traffic_data, medium accuracy"
        },
        {
            "source": "weather_api",
            "text": "No significant rainfall in G-10 area. Temperature spike to 46C in southern districts. Severe heat warning active.",
            "timestamp": "2024-05-14T14:12:00Z",
            "credibility_indicator": "official_weather_forecast, high accuracy"
        }
    ]

    # Mock available resources
    available_resources = {
        "ambulances": {"total": 8, "available": 8},
        "police_units": {"total": 12, "available": 12},
        "rescue_teams": {"total": 2, "available": 2},
        "water_tankers": {"total": 4, "available": 4}
    }

    orchestrator = MasterOrchestrator()
    
    # Check if GEMINI_API_KEY is set
    if not os.getenv("GEMINI_API_KEY"):
        print("ERROR: GEMINI_API_KEY environment variable is not set.")
        print("Please set it in your terminal before running this script.")
        print("Example: $env:GEMINI_API_KEY='your_key'")
        return

    traces = orchestrator.run_crisis_orchestration(signals, available_resources)
    
    print("\n======================================================")
    print(" SCENARIO 1 COMPLETE. TRACES GENERATED:")
    print("======================================================")
    
    # Save traces to file for review
    with open("scenario_1_traces.json", "w") as f:
        json.dump(traces, f, indent=2)
    
    print("Traces saved to scenario_1_traces.json")

if __name__ == "__main__":
    run_scenario_1()
