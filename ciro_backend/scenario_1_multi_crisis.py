import json
import os
from orchestrator import MasterOrchestrator

def run_scenario_1():
    print("======================================================")
    print(" SCENARIO 1: Multi-Crisis with Limited Resources")
    print("======================================================\n")

    # Mock signals coming into the system
    signals = [
        {
            "source": "social_media",
            "text": "major flooding in G-10 right now!!",
            "timestamp": "2024-05-14T14:05:00Z",
            "credibility_indicator": "unverified user, all caps"
        },
        {
            "source": "water_sensor_01",
            "text": "Water flow: 2.1, status: normal. No flooding detected.",
            "timestamp": "2024-05-14T14:03:00Z",
            "credibility_indicator": "official_sensor"
        },
        {
            "source": "field_report",
            "text": "water main burst near main bazaar, NOT flooding. Hospital supply might be impacted.",
            "timestamp": "2024-05-14T14:10:00Z",
            "credibility_indicator": "verified_field_team"
        },
        {
            "source": "health_clinic_south",
            "text": "Heat emergency reported in southern slums. Elderly individuals collapsing.",
            "timestamp": "2024-05-14T14:12:00Z",
            "credibility_indicator": "official_health_report"
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
