from typing import Any, Dict
from abc import ABC, abstractmethod

class BaseAgent(ABC):
    """
    Base class for all CIRO Agents.
    Every agent must implement the process method.
    """
    
    @abstractmethod
    def get_system_prompt(self) -> str:
        """Returns the system prompt that defines the agent's behavior."""
        pass
        
    @abstractmethod
    def process(self, input_data: Any) -> Dict[str, Any]:
        """
        Process the input data using the LLM and return the structured response.
        """
        pass
