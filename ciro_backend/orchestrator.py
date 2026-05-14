import json
from typing import List, Dict, Any

from agents.signal_fusion import SignalFusionAgent
from agents.crisis_classifier import CrisisClassifierAgent
from agents.severity_prediction import SeverityPredictionAgent
from agents.resource_allocator import ResourceAllocatorAgent
from agents.action_simulator import ActionSimulatorAgent
from agents.notifier import NotifierAgent
from agents.verification import VerificationAgent

class MasterOrchestrator:
    def __init__(self):
        self.signal_fusion_agent = SignalFusionAgent()
        self.crisis_classifier_agent = CrisisClassifierAgent()
        self.severity_prediction_agent = SeverityPredictionAgent()
        self.resource_allocator_agent = ResourceAllocatorAgent()
        self.action_simulator_agent = ActionSimulatorAgent()
        self.notifier_agent = NotifierAgent()
        self.verification_agent = VerificationAgent()
        
        self.traces = {}

    def run_crisis_orchestration(self, signals: List[Dict[str, Any]], available_resources: Dict[str, Any]) -> Dict[str, Any]:
        print("--- Starting CIRO Orchestration ---")
        
        # 1. Signal Fusion
        print("[1] Signal Fusion Agent running...")
        fusion_output = self.signal_fusion_agent.process(signals)
        self.traces["signal_fusion"] = fusion_output
        
        # 2. Crisis Classification
        print("[2] Crisis Classifier Agent running...")
        classification_output = self.crisis_classifier_agent.process(fusion_output)
        self.traces["classification"] = classification_output
        
        # 3. Severity Prediction
        print("[3] Severity Prediction Agent running...")
        prediction_output = self.severity_prediction_agent.process(classification_output)
        self.traces["prediction"] = prediction_output
        
        # 4. Resource Allocation
        print("[4] Resource Allocator Agent running...")
        allocation_output = self.resource_allocator_agent.process(prediction_output, available_resources)
        self.traces["allocation"] = allocation_output
        
        # 5. Action Simulation
        print("[5] Action Simulator Agent running...")
        simulation_output = self.action_simulator_agent.process(allocation_output)
        self.traces["simulation"] = simulation_output
        
        # 6. Notification
        print("[6] Notifier Agent running...")
        notification_output = self.notifier_agent.process(simulation_output)
        self.traces["notification"] = notification_output
        
        print("--- CIRO Orchestration Complete ---")
        return self.traces

    def run_verification(self, initial_traces: Dict[str, Any], new_signals: List[Dict[str, Any]]) -> Dict[str, Any]:
        print("--- Starting CIRO Verification & Recovery ---")
        print("[7] Verification Agent running...")
        initial_classification = initial_traces.get("classification", {})
        verification_output = self.verification_agent.process(initial_classification, new_signals)
        self.traces["verification"] = verification_output
        return verification_output

if __name__ == "__main__":
    # Small test
    print("Orchestrator loaded successfully.")
