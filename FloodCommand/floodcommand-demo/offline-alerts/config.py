# Configuration for Offline Emergency System

PERSON_NAME = "Emergency Operator"
LOCATION_NAME = "Local Base Station"

EMERGENCY_CONTACTS = [
    "+1234567890",      # Primary contact
    "+0987654321"       # Secondary contact
]

# Offline local network settings
LOCAL_NETWORK_PORT = 8787
ALLOW_EXTERNAL_IPS = True

# Alert settings
REPEAT_ALERT_INTERVAL = 300  # 5 minutes
ALERT_TIMEOUT = 3600         # 1 hour max duration

LOG_FILE = "flood_alerts.log"
DATABASE_FILE = "offline_alerts.db"
SENSOR_TYPE = "manual" # "manual", "bluetooth", "api", "hybrid"
