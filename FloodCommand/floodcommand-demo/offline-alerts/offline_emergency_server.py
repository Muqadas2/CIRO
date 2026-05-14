from flask import Flask, request, jsonify
from flood_alert_main import AlertState
from bluetooth_comm import BluetoothMessenger
from config import LOCAL_NETWORK_PORT, ALLOW_EXTERNAL_IPS, EMERGENCY_CONTACTS, LOCATION_NAME
import uuid
import datetime

app = Flask(__name__)
alert_state = AlertState()
messenger = BluetoothMessenger()

@app.route('/')
def home():
    return """
    <html>
    <head>
        <title>Offline Emergency Portal</title>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
            body { font-family: -apple-system, sans-serif; padding: 20px; background: #000; color: #fff; text-align: center; }
            button { background: #ff3b30; color: white; padding: 20px 40px; font-size: 24px; font-weight: bold; border: none; border-radius: 12px; margin-top: 50px; cursor: pointer; width: 100%; max-width: 400px; }
            button:active { background: #d32f2f; }
        </style>
    </head>
    <body>
        <h1>⚠️ FLOOD EMERGENCY</h1>
        <p>You are connected to the Offline Relay Network.</p>
        <form action="/send-emergency" method="POST">
            <button type="submit">TRIGGER SOS ALERT</button>
        </form>
    </body>
    </html>
    """

@app.route('/send-emergency', methods=['POST'])
def send_emergency():
    alert_id = str(uuid.uuid4())[:8]
    
    # Check if JSON or Form
    if request.is_json:
        data = request.json
        message = data.get("message", "FLOOD ALERT")
    else:
        message = "FLOOD ALERT TRIGGERED VIA WEB PORTAL"
        
    alert_state.start_alert()
    alert_state.log_alert(alert_id, "WebPortal", message, LOCATION_NAME)
    
    messenger.send_emergency_message(message, LOCATION_NAME, EMERGENCY_CONTACTS)
    
    return jsonify({
        "status": "success",
        "message": "Emergency broadcast initiated across local network.",
        "alert_id": alert_id
    })

@app.route('/status')
def status():
    return jsonify({
        "is_flooding": alert_state.is_flooding,
        "last_alert_time": alert_state.last_alert_time.isoformat() if alert_state.last_alert_time else None,
        "repeat_count": alert_state.repeat_count
    })

if __name__ == '__main__':
    host = '0.0.0.0' if ALLOW_EXTERNAL_IPS else '127.0.0.1'
    print(f"Starting Offline Relay Server on http://{host}:{LOCAL_NETWORK_PORT}")
    app.run(host=host, port=LOCAL_NETWORK_PORT)
